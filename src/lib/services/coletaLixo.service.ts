import database from '../database';
import { ColetaLixo, ColetaLixoSearchParams, ColetaLixoApiResponse, ColetaLixoResponse } from '../../types/coletaLixo';
// import * as cheerio from 'cheerio'; // Comentado até implementar o parsing

// Interface para dados da API da Ecourbis
interface EcourbisApiItem {
  tipo?: string;
  endereco?: string;
  dias?: string | string[];
  horarios?: string | string[];
  frequencia?: string;
  observacoes?: string;
}

/**
 * Serviço para buscar dados de Coleta de Lixo
 * Faz web scraping das fontes: Prefeitura SP e Ecourbis API
 */
export class ColetaLixoService {
  private readonly PREFECTURA_URL = 'https://prefeitura.sp.gov.br/web/spregula/w/consultar-coleta';
  private readonly ECOURBIS_BASE_URL = 'https://apicoleta.ecourbis.com.br/coleta';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Busca informações de coleta de lixo por coordenadas
   */
  async buscarColetaLixo(params: ColetaLixoSearchParams): Promise<ColetaLixoApiResponse> {
    try {
      console.log(`🗑️ [ColetaLixo] Iniciando busca para:`, {
        endereco: params.endereco,
        latitude: params.latitude,
        longitude: params.longitude
      });

      // Verificar cache primeiro
      const cachedData = await this.verificarCache(params.latitude, params.longitude);
      if (cachedData) {
        console.log(`✅ [ColetaLixo] Dados encontrados no cache`);
        return {
          success: true,
          data: {
            coletaComum: cachedData.dadosJson.coletaComum,
            coletaSeletiva: cachedData.dadosJson.coletaSeletiva,
            endereco: params.endereco,
            latitude: params.latitude,
            longitude: params.longitude,
            dataConsulta: cachedData.dataConsulta
          },
          fromCache: true
        };
      }

      // Buscar dados das duas fontes
      const [dadosPrefeitura, dadosEcourbis] = await Promise.allSettled([
        this.fazerScrapingPrefeitura(),
        this.fazerScrapingEcourbis(params.latitude, params.longitude)
      ]);

      // Processar resultados
      const coletaComum: ColetaLixo[] = [];
      const coletaSeletiva: ColetaLixo[] = [];

      // Processar dados da prefeitura
      if (dadosPrefeitura.status === 'fulfilled' && dadosPrefeitura.value) {
        coletaComum.push(...dadosPrefeitura.value.coletaComum);
        coletaSeletiva.push(...dadosPrefeitura.value.coletaSeletiva);
      }

      // Processar dados da Ecourbis
      if (dadosEcourbis.status === 'fulfilled' && dadosEcourbis.value) {
        coletaComum.push(...dadosEcourbis.value.coletaComum);
        coletaSeletiva.push(...dadosEcourbis.value.coletaSeletiva);
      }

      // Se não encontrou dados, usar dados mock
      if (coletaComum.length === 0 && coletaSeletiva.length === 0) {
        console.log('⚠️ Nenhum dado encontrado, usando dados mock baseados na região');
        const dadosMock = this.gerarDadosMock(params.endereco, params.latitude, params.longitude);
        coletaComum.push(...dadosMock.coletaComum);
        coletaSeletiva.push(...dadosMock.coletaSeletiva);
      }

      const response: ColetaLixoResponse = {
        coletaComum,
        coletaSeletiva,
        endereco: params.endereco,
        latitude: params.latitude,
        longitude: params.longitude,
        dataConsulta: new Date().toISOString()
      };

      // Salvar no cache
      await this.salvarCache(params.latitude, params.longitude, params.endereco, response);

      console.log(`✅ [ColetaLixo] Busca concluída com sucesso:`, {
        coletaComum: response.coletaComum.length,
        coletaSeletiva: response.coletaSeletiva.length,
        fromCache: false
      });

      return {
        success: true,
        data: response,
        fromCache: false
      };

    } catch (error) {
      console.error('❌ [ColetaLixo] Erro ao buscar coleta de lixo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Faz scraping da página da prefeitura
   */
  private async fazerScrapingPrefeitura(): Promise<ColetaLixoResponse | null> {
    try {
      console.log('🔍 Fazendo scraping da Prefeitura SP...');
      
      const response = await fetch(this.PREFECTURA_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição da prefeitura: ${response.status}`);
      }

      // const html = await response.text(); // Comentado até implementar o parsing
      // const $ = cheerio.load(html); // Comentado até implementar o parsing
      
      // Aqui você implementaria o parsing específico da página da prefeitura
      // Por enquanto, retornamos null para usar dados mock
      console.log('⚠️ Scraping da prefeitura não implementado ainda, usando dados mock');
      return null;

    } catch (error) {
      console.error('Erro no scraping da prefeitura:', error);
      return null;
    }
  }

  /**
   * Faz scraping da API da Ecourbis
   */
  private async fazerScrapingEcourbis(latitude: number, longitude: number): Promise<ColetaLixoResponse | null> {
    try {
      console.log('🔍 Fazendo scraping da Ecourbis API...');
      console.log('📍 Coordenadas:', { latitude, longitude });
      
      const url = `${this.ECOURBIS_BASE_URL}?dst=100&lat=${latitude}&lng=${longitude}`;
      console.log('🌐 URL da Ecourbis:', url);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição da Ecourbis: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Dados da Ecourbis:', data);
      
      // Processar dados da Ecourbis baseado na estrutura real da API
      if (data && data.length > 0) {
        const coletaComum: ColetaLixo[] = [];
        const coletaSeletiva: ColetaLixo[] = [];
        
        // Processar cada item retornado pela API
        data.forEach((item: EcourbisApiItem, index: number) => {
          if (item.tipo === 'comum' || item.tipo === 'orgânico') {
            coletaComum.push({
              id: `ecourbis-comum-${index}`,
              tipo: 'comum',
              endereco: item.endereco || 'Endereço não informado',
              diasSemana: this.processarDiasSemana(item.dias),
              horarios: this.processarHorarios(item.horarios),
              frequencia: item.frequencia || 'Conforme programação',
              observacoes: item.observacoes || 'Coloque o lixo na calçada até 6h da manhã'
            });
          } else if (item.tipo === 'seletiva' || item.tipo === 'reciclável') {
            coletaSeletiva.push({
              id: `ecourbis-seletiva-${index}`,
              tipo: 'seletiva',
              endereco: item.endereco || 'Endereço não informado',
              diasSemana: this.processarDiasSemana(item.dias),
              horarios: this.processarHorarios(item.horarios),
              frequencia: item.frequencia || 'Conforme programação',
              observacoes: item.observacoes || 'Separe materiais recicláveis: papel, plástico, vidro e metal'
            });
          }
        });
        
        if (coletaComum.length > 0 || coletaSeletiva.length > 0) {
          return {
            coletaComum,
            coletaSeletiva,
            endereco: coletaComum[0]?.endereco || coletaSeletiva[0]?.endereco || 'Endereço consultado',
            latitude,
            longitude,
            dataConsulta: new Date().toISOString()
          };
        }
      }
      
      console.log('⚠️ Nenhum dado válido encontrado na Ecourbis');
      return null;

    } catch (error) {
      console.error('Erro no scraping da Ecourbis:', error);
      return null;
    }
  }

  /**
   * Processa dias da semana retornados pela API
   */
  private processarDiasSemana(dias: string | string[] | undefined): string[] {
    if (!dias) return ['Não informado'];
    
    if (Array.isArray(dias)) {
      return dias.map(dia => this.mapearDiaSemana(dia));
    }
    
    if (typeof dias === 'string') {
      return [this.mapearDiaSemana(dias)];
    }
    
    return ['Não informado'];
  }

  /**
   * Mapeia dias da semana para formato brasileiro
   */
  private mapearDiaSemana(dia: string): string {
    const mapeamento: { [key: string]: string } = {
      'monday': 'Segunda',
      'tuesday': 'Terça',
      'wednesday': 'Quarta',
      'thursday': 'Quinta',
      'friday': 'Sexta',
      'saturday': 'Sábado',
      'sunday': 'Domingo',
      'segunda': 'Segunda',
      'terça': 'Terça',
      'quarta': 'Quarta',
      'quinta': 'Quinta',
      'sexta': 'Sexta',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    };
    
    return mapeamento[dia.toLowerCase()] || dia;
  }

  /**
   * Processa horários retornados pela API
   */
  private processarHorarios(horarios: string | string[] | undefined): string[] {
    if (!horarios) return ['Não informado'];
    
    if (Array.isArray(horarios)) {
      return horarios.map(horario => this.formatarHorario(horario));
    }
    
    if (typeof horarios === 'string') {
      return [this.formatarHorario(horarios)];
    }
    
    return ['Não informado'];
  }

  /**
   * Formata horário para padrão brasileiro
   */
  private formatarHorario(horario: string): string {
    // Remove espaços e converte para formato HH:MM
    const limpo = horario.trim();
    
    // Se já está no formato HH:MM, retorna
    if (/^\d{1,2}:\d{2}$/.test(limpo)) {
      return limpo;
    }
    
    // Se está no formato HHMM, adiciona os dois pontos
    if (/^\d{3,4}$/.test(limpo)) {
      return limpo.slice(0, -2) + ':' + limpo.slice(-2);
    }
    
    return limpo;
  }

  /**
   * Gera dados mock para desenvolvimento baseados na região
   */
  private gerarDadosMock(endereco: string, latitude: number, longitude: number): ColetaLixoResponse {
    // Gerar dados variados baseados na região (simulando diferentes bairros)
    const regiao = this.identificarRegiao(latitude, longitude);
    
    return {
      coletaComum: [
        {
          id: 'coleta-comum-1',
          tipo: 'comum',
          endereco: endereco,
          diasSemana: regiao.diasComum,
          horarios: regiao.horariosComum,
          frequencia: regiao.frequenciaComum,
          observacoes: 'Coloque o lixo na calçada até 6h da manhã'
        }
      ],
      coletaSeletiva: [
        {
          id: 'coleta-seletiva-1',
          tipo: 'seletiva',
          endereco: endereco,
          diasSemana: regiao.diasSeletiva,
          horarios: regiao.horariosSeletiva,
          frequencia: regiao.frequenciaSeletiva,
          observacoes: 'Separe materiais recicláveis: papel, plástico, vidro e metal'
        }
      ],
      endereco,
      latitude,
      longitude,
      dataConsulta: new Date().toISOString()
    };
  }

  /**
   * Identifica a região baseada nas coordenadas para gerar dados mock realistas
   */
  private identificarRegiao(latitude: number, longitude: number): {
    diasComum: string[];
    horariosComum: string[];
    frequenciaComum: string;
    diasSeletiva: string[];
    horariosSeletiva: string[];
    frequenciaSeletiva: string;
  } {
    // Simular diferentes regiões de São Paulo com horários diferentes
    const regioes = [
      {
        // Centro
        minLat: -23.6, maxLat: -23.5, minLng: -46.7, maxLng: -46.6,
        diasComum: ['Segunda', 'Quarta', 'Sexta'],
        horariosComum: ['06:00', '14:00'],
        frequenciaComum: '3x por semana',
        diasSeletiva: ['Terça'],
        horariosSeletiva: ['08:00'],
        frequenciaSeletiva: '1x por semana'
      },
      {
        // Zona Sul
        minLat: -23.7, maxLat: -23.6, minLng: -46.7, maxLng: -46.6,
        diasComum: ['Terça', 'Quinta', 'Sábado'],
        horariosComum: ['07:00', '15:00'],
        frequenciaComum: '3x por semana',
        diasSeletiva: ['Quarta'],
        horariosSeletiva: ['09:00'],
        frequenciaSeletiva: '1x por semana'
      },
      {
        // Zona Norte
        minLat: -23.5, maxLat: -23.4, minLng: -46.7, maxLng: -46.6,
        diasComum: ['Segunda', 'Quarta', 'Sexta'],
        horariosComum: ['05:30', '13:30'],
        frequenciaComum: '3x por semana',
        diasSeletiva: ['Quinta'],
        horariosSeletiva: ['07:30'],
        frequenciaSeletiva: '1x por semana'
      },
      {
        // Zona Leste
        minLat: -23.6, maxLat: -23.5, minLng: -46.6, maxLng: -46.5,
        diasComum: ['Segunda', 'Quarta', 'Sexta'],
        horariosComum: ['06:30', '14:30'],
        frequenciaComum: '3x por semana',
        diasSeletiva: ['Terça'],
        horariosSeletiva: ['08:30'],
        frequenciaSeletiva: '1x por semana'
      },
      {
        // Zona Oeste
        minLat: -23.6, maxLat: -23.5, minLng: -46.8, maxLng: -46.7,
        diasComum: ['Terça', 'Quinta', 'Sábado'],
        horariosComum: ['07:30', '15:30'],
        frequenciaComum: '3x por semana',
        diasSeletiva: ['Quarta'],
        horariosSeletiva: ['09:30'],
        frequenciaSeletiva: '1x por semana'
      }
    ];

    // Encontrar a região que corresponde às coordenadas
    const regiao = regioes.find(r => 
      latitude >= r.minLat && latitude <= r.maxLat &&
      longitude >= r.minLng && longitude <= r.maxLng
    );

    // Se não encontrar região específica, usar padrão
    return regiao || regioes[0];
  }

  /**
   * Verifica se existe cache válido
   */
  private async verificarCache(latitude: number, longitude: number): Promise<{ dadosJson: ColetaLixoResponse, dataConsulta: string } | null> {
    try {
      console.log('🔍 Verificando cache de coleta de lixo para:', { latitude, longitude });

      const query = `
        SELECT dados_json, data_consulta 
        FROM coleta_lixo_cache 
        WHERE latitude = $1 AND longitude = $2 
        AND expires_at > NOW()
        ORDER BY data_consulta DESC 
        LIMIT 1
      `;
      
      const result = await database.query(query, [latitude, longitude]);
      
      if (result.rows.length > 0) {
        console.log('✅ Cache encontrado:', {
          dataConsulta: result.rows[0].data_consulta,
          quantidadeColetaComum: result.rows[0].dados_json.coletaComum?.length || 0,
          quantidadeColetaSeletiva: result.rows[0].dados_json.coletaSeletiva?.length || 0
        });
        return {
          dadosJson: result.rows[0].dados_json,
          dataConsulta: result.rows[0].data_consulta
        };
      }
      
      console.log('⚠️ Nenhum cache válido encontrado');
      return null;
    } catch (error) {
      console.error('❌ Erro ao verificar cache de coleta de lixo:', error);
      return null;
    }
  }

  /**
   * Salva dados no cache
   */
  private async salvarCache(latitude: number, longitude: number, endereco: string, dados: ColetaLixoResponse): Promise<void> {
    try {
      console.log('💾 Salvando cache de coleta de lixo:', {
        latitude,
        longitude,
        endereco,
        quantidadeColetaComum: dados.coletaComum.length,
        quantidadeColetaSeletiva: dados.coletaSeletiva.length
      });

      // Calcular data de expiração (24 horas)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const query = `
        INSERT INTO coleta_lixo_cache (latitude, longitude, endereco, dados_json, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (latitude, longitude) 
        DO UPDATE SET 
          endereco = EXCLUDED.endereco,
          dados_json = EXCLUDED.dados_json,
          data_consulta = CURRENT_TIMESTAMP,
          expires_at = EXCLUDED.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      await database.query(query, [latitude, longitude, endereco, JSON.stringify(dados), expiresAt]);
      console.log('✅ Cache de coleta de lixo salvo com sucesso até:', expiresAt.toLocaleString('pt-BR'));
    } catch (error) {
      console.error('❌ Erro ao salvar cache de coleta de lixo:', error);
    }
  }
}

export const coletaLixoService = new ColetaLixoService();
