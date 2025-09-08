import database from '../database';
import { FeiraLivre, FeiraLivreSearchParams, FeiraLivreApiResponse } from '../../types/feiraLivre';
import * as cheerio from 'cheerio';
import { geocodeAddress } from '../../services/nominatim';

/**
 * Serviço para buscar dados de Feiras Livres
 * Faz web scraping da API: https://locatsp.saclimpeza2.com.br/mapa/resultados/?servico=feiras
 */
export class FeiraLivreService {
  private readonly API_BASE_URL = 'https://locatsp.saclimpeza2.com.br/mapa/resultados/';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Busca feiras livres por coordenadas
   */
  async buscarFeiras(params: FeiraLivreSearchParams): Promise<FeiraLivreApiResponse> {
    try {
      // Verificar cache primeiro
      const cachedData = await this.verificarCache(params.latitude, params.longitude);
      if (cachedData) {
        return {
          success: true,
          data: {
            feiras: cachedData.dadosJson,
            endereco: params.endereco,
            latitude: params.latitude,
            longitude: params.longitude,
            dataConsulta: cachedData.dataConsulta
          },
          fromCache: true
        };
      }

      // Buscar dados da API
      const feiras = await this.fazerWebScraping(params.latitude, params.longitude);
      
      // Filtrar feiras que têm coordenadas válidas (extraídas do HTML)
      const feirasComCoords = feiras.filter(feira => feira.coords);
      
      // Se não tem coordenadas, retornar as primeiras 5
      if (feirasComCoords.length === 0) {
        console.log('⚠️ Nenhuma feira com coordenadas encontrada, retornando as primeiras 5');
        return {
          success: true,
          data: {
            feiras: feiras.slice(0, 5),
            endereco: params.endereco,
            latitude: params.latitude,
            longitude: params.longitude,
            dataConsulta: new Date().toISOString()
          },
          fromCache: false
        };
      }
      
      // Calcular distância e pegar as 5 mais próximas
      const feirasMaisProximas = this.calcularFeirasMaisProximas(
        feirasComCoords, 
        params.latitude, 
        params.longitude
      );
      
      console.log('✅ Feiras encontradas:', feiras.length, '- Coordenadas extraídas do HTML');
      
      // Salvar no cache
      await this.salvarCache(params.latitude, params.longitude, params.endereco, feiras);

      return {
        success: true,
        data: {
          feiras: feirasMaisProximas,
          endereco: params.endereco,
          latitude: params.latitude,
          longitude: params.longitude,
          dataConsulta: new Date().toISOString()
        },
        fromCache: false
      };

    } catch (error) {
      console.error('Erro ao buscar feiras livres:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Faz web scraping da página de feiras
   */
  private async fazerWebScraping(latitude: number, longitude: number): Promise<FeiraLivre[]> {
    const url = `${this.API_BASE_URL}?servico=feiras&lat=${latitude}&lng=${longitude}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const feiras: FeiraLivre[] = [];
    
    console.log('🔍 Debug - URL da requisição:', url);
    console.log('🔍 Debug - HTML da página (primeiros 2000 chars):', html.substring(0, 2000));

    // Buscar por divs com classe que contém "feira-" (ex: feira-100497)
    const feiraElements = $('div[class*="feira-"]');
    console.log(`🔍 Debug - Encontrados ${feiraElements.length} elementos com classe feira-`);

    feiraElements.each((index, element) => {
      try {
        const $element = $(element);
        const className = $element.attr('class') || '';
        
        // Extrair ID da feira da classe (ex: "feira-100497")
        const feiraIdMatch = className.match(/feira-(\d+)/);
        if (!feiraIdMatch) return;
        
        const feiraId = feiraIdMatch[1];
        console.log(`🔍 Debug - Processando feira ID: ${feiraId}`);
        
        // Extrair endereço da tag <strong>
        const endereco = $element.find('strong').first().text().trim();
        if (!endereco) return;
        
        console.log(`🔍 Debug - Endereço encontrado: ${endereco}`);
        
        // Buscar div de detalhes correspondente
        const detalhesElement = $(`.detalhes-${feiraId}`);
        let periodo = 'Semanal';
        let diaSemana = 'Não informado';
        let coordenadas: { lat: number; lng: number } | undefined;
        
        if (detalhesElement.length > 0) {
          const detalhesTexto = detalhesElement.text().trim();
          console.log(`🔍 Debug - Detalhes da feira ${feiraId}:`, detalhesTexto);
          
          // Extrair período (ex: "SEMANAL")
          if (detalhesTexto.includes('SEMANAL')) {
            periodo = 'Semanal';
          } else if (detalhesTexto.includes('QUINZENAL')) {
            periodo = 'Quinzenal';
          } else if (detalhesTexto.includes('MENSAL')) {
            periodo = 'Mensal';
          }
          
          // Extrair dia da semana
          const diasSemana = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO'];
          for (const dia of diasSemana) {
            if (detalhesTexto.includes(dia)) {
              diaSemana = dia.charAt(0) + dia.slice(1).toLowerCase();
              break;
            }
          }
          
          // Extrair coordenadas do botão "Ver trajeto"
          const btnTrajeto = detalhesElement.find('a.btn-ver-trajeto');
          if (btnTrajeto.length > 0) {
            const lat2 = btnTrajeto.attr('lat2');
            const lon2 = btnTrajeto.attr('lon2');
            
            if (lat2 && lon2) {
              coordenadas = {
                lat: parseFloat(lat2),
                lng: parseFloat(lon2)
              };
              console.log(`🔍 Debug - Coordenadas encontradas para feira ${feiraId}:`, coordenadas);
            }
          }
        }
        
        // Criar objeto da feira
        const feira: FeiraLivre = {
          id: `feira-${feiraId}`,
          nome: `Feira ${endereco}`,
          endereco: endereco,
          periodo: periodo,
          diaSemana: diaSemana,
          coords: coordenadas
        };
        
        console.log(`✅ Feira criada:`, feira);
        feiras.push(feira);
        
      } catch (error) {
        console.warn('Erro ao processar elemento de feira:', error);
      }
    });

    console.log(`✅ Total de feiras encontradas: ${feiras.length}`);
    
    // Se não encontrou feiras com o seletor específico, tentar método genérico
    if (feiras.length === 0) {
      console.log('⚠️ Nenhuma feira encontrada com seletor específico, tentando método genérico');
      return this.parsearGenerico($);
    }

    return feiras;
  }

  /**
   * Parsear de forma mais genérica quando os seletores específicos não funcionam
   */
  private parsearGenerico($: cheerio.CheerioAPI): FeiraLivre[] {
    const feiras: FeiraLivre[] = [];
    
    // Procurar por padrões de texto que indiquem feiras
    $('div, p, li').each((index, element) => {
      const texto = $(element).text().trim();
      
      if (texto.includes('feira') || texto.includes('Feira')) {
        const linhas = texto.split('\n').map(linha => linha.trim()).filter(linha => linha);
        
        if (linhas.length >= 2) {
          feiras.push({
            id: `feira-generic-${index}`,
            nome: linhas[0],
            endereco: linhas[1],
            periodo: 'Semanal',
            diaSemana: this.extrairDiaSemana(texto)
          });
        }
      }
    });

    return feiras;
  }

  /**
   * Extrai dia da semana do texto
   */
  private extrairDiaSemana(texto: string): string {
    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    for (const dia of dias) {
      if (texto.toLowerCase().includes(dia.toLowerCase())) {
        return dia;
      }
    }
    
    return 'Não informado';
  }

  /**
   * Faz geocoding das feiras para obter coordenadas
   */
  private async geocodificarFeiras(feiras: FeiraLivre[]): Promise<FeiraLivre[]> {
    const feirasComCoords: FeiraLivre[] = [];

    for (const feira of feiras) {
      try {
        // Tentar diferentes formatos de endereço
        const enderecosParaTestar = [
          `${feira.endereco}, São Paulo, SP, Brasil`,
          `${feira.endereco}, São Paulo, Brasil`,
          `${feira.endereco}, SP, Brasil`
        ];

        let coords = null;
        for (const endereco of enderecosParaTestar) {
          try {
            console.log(`Tentando geocodificar: ${endereco}`);
            
            // Timeout para evitar travamento
            const geocodingPromise = geocodeAddress(endereco);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout no geocoding')), 5000)
            );
            
            const resultado = await Promise.race([geocodingPromise, timeoutPromise]) as Array<{ lat: string; lon: string }> | null;
            console.log(`Resultado do geocoding:`, resultado);
            
            if (resultado && Array.isArray(resultado) && resultado.length > 0) {
              coords = {
                lat: parseFloat(resultado[0].lat),
                lng: parseFloat(resultado[0].lon)
              };
              console.log(`Coordenadas obtidas para ${feira.nome}:`, coords);
              break;
            }
          } catch (error) {
            console.warn(`Erro ao geocodificar endereço: ${endereco}`, error);
            // Continua para o próximo formato de endereço
          }
        }

        feirasComCoords.push({
          ...feira,
          coords: coords || undefined
        });

        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.warn(`Erro ao processar feira ${feira.nome}:`, error);
        // Adiciona a feira mesmo sem coordenadas
        feirasComCoords.push({
          ...feira,
          coords: undefined
        });
      }
    }

    return feirasComCoords;
  }

  /**
   * Verifica se existe cache válido
   */
  private async verificarCache(latitude: number, longitude: number): Promise<{ dadosJson: FeiraLivre[], dataConsulta: string } | null> {
    try {
      console.log('🔍 Verificando cache de feiras para:', { latitude, longitude });

      const query = `
        SELECT dados_json, data_consulta 
        FROM feiras_cache 
        WHERE latitude = $1 AND longitude = $2 
        AND expires_at > NOW()
        ORDER BY data_consulta DESC 
        LIMIT 1
      `;
      
      const result = await database.query(query, [latitude, longitude]);
      
      if (result.rows.length > 0) {
        console.log('✅ Cache encontrado:', {
          dataConsulta: result.rows[0].data_consulta,
          quantidadeFeiras: result.rows[0].dados_json.length
        });
        return {
          dadosJson: result.rows[0].dados_json,
          dataConsulta: result.rows[0].data_consulta
        };
      }
      
      console.log('⚠️ Nenhum cache válido encontrado');
      return null;
    } catch (error) {
      console.error('❌ Erro ao verificar cache de feiras:', error);
      return null;
    }
  }

  /**
   * Salva dados no cache
   */
  private async salvarCache(latitude: number, longitude: number, endereco: string, feiras: FeiraLivre[]): Promise<void> {
    try {
      console.log('💾 Salvando cache de feiras:', {
        latitude,
        longitude,
        endereco,
        quantidadeFeiras: feiras.length
      });

      // Calcular data de expiração (24 horas)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const query = `
        INSERT INTO feiras_cache (latitude, longitude, endereco, dados_json, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (latitude, longitude) 
        DO UPDATE SET 
          endereco = EXCLUDED.endereco,
          dados_json = EXCLUDED.dados_json,
          data_consulta = CURRENT_TIMESTAMP,
          expires_at = EXCLUDED.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      await database.query(query, [latitude, longitude, endereco, JSON.stringify(feiras), expiresAt]);
      console.log('✅ Cache de feiras salvo com sucesso até:', expiresAt.toLocaleString('pt-BR'));
    } catch (error) {
      console.error('❌ Erro ao salvar cache de feiras:', error);
    }
  }

  /**
   * Calcula as 5 feiras mais próximas do usuário
   */
  private calcularFeirasMaisProximas(
    feiras: FeiraLivre[], 
    userLat: number, 
    userLng: number
  ): FeiraLivre[] {
    // Filtrar apenas feiras com coordenadas válidas
    const feirasComCoords = feiras.filter(feira => feira.coords);
    
    if (feirasComCoords.length === 0) {
      console.log('⚠️ Nenhuma feira com coordenadas válidas encontrada');
      return feiras.slice(0, 5); // Retorna as primeiras 5 sem coordenadas
    }
    
    // Calcular distância para cada feira
    const feirasComDistancia = feirasComCoords.map(feira => {
      const distancia = this.calcularDistancia(
        userLat, 
        userLng, 
        feira.coords!.lat, 
        feira.coords!.lng
      );
      
      return {
        ...feira,
        distancia
      };
    });
    
    // Ordenar por distância (mais próximas primeiro)
    feirasComDistancia.sort((a, b) => a.distancia - b.distancia);
    
    // Pegar as 5 mais próximas
    const feirasMaisProximas = feirasComDistancia.slice(0, 5);
    
    console.log('📍 Feiras mais próximas:');
    feirasMaisProximas.forEach((feira, index) => {
      console.log(`${index + 1}. ${feira.nome} - ${feira.distancia.toFixed(2)} km`);
    });
    
    return feirasMaisProximas;
  }

  /**
   * Calcula distância entre duas coordenadas (fórmula de Haversine)
   */
  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.grausParaRadianos(lat2 - lat1);
    const dLon = this.grausParaRadianos(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.grausParaRadianos(lat1)) * Math.cos(this.grausParaRadianos(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    
    return distancia;
  }

  /**
   * Converte graus para radianos
   */
  private grausParaRadianos(graus: number): number {
    return graus * (Math.PI / 180);
  }
}

export const feiraLivreService = new FeiraLivreService();
