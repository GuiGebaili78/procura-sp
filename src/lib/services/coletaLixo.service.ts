import database from '../database';
import { ColetaLixo, ColetaLixoSearchParams, ColetaLixoApiResponse, ColetaLixoResponse } from '../../types/coletaLixo';
import * as cheerio from 'cheerio';

// Configurar para ignorar certificados SSL problemáticos
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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

      // Processar dados da Ecourbis (fonte primária)
      if (dadosEcourbis.status === 'fulfilled' && dadosEcourbis.value) {
        console.log('✅ Dados obtidos da Ecourbis');
        coletaComum.push(...dadosEcourbis.value.coletaComum);
        coletaSeletiva.push(...dadosEcourbis.value.coletaSeletiva);
      } else {
        console.log('❌ Ecourbis falhou, tentando Prefeitura SP como fallback...');
        
        // Fallback: usar dados da prefeitura se Ecourbis falhar
        if (dadosPrefeitura.status === 'fulfilled' && dadosPrefeitura.value) {
          console.log('✅ Usando dados da Prefeitura SP como fallback');
          coletaComum.push(...dadosPrefeitura.value.coletaComum);
          coletaSeletiva.push(...dadosPrefeitura.value.coletaSeletiva);
        } else {
          console.log('❌ Prefeitura SP também falhou');
        }
      }

      // Se ainda não encontrou dados, tentar prefeitura novamente se Ecourbis funcionou
      if (coletaComum.length === 0 && coletaSeletiva.length === 0 && dadosEcourbis.status === 'fulfilled') {
        console.log('⚠️ Ecourbis funcionou mas não retornou dados, tentando Prefeitura SP...');
        if (dadosPrefeitura.status === 'fulfilled' && dadosPrefeitura.value) {
          console.log('✅ Usando dados da Prefeitura SP como complemento');
          coletaComum.push(...dadosPrefeitura.value.coletaComum);
          coletaSeletiva.push(...dadosPrefeitura.value.coletaSeletiva);
        }
      }

      // Se ainda não encontrou dados, retornar vazio
      if (coletaComum.length === 0 && coletaSeletiva.length === 0) {
        console.log('⚠️ Nenhum dado encontrado em nenhuma fonte');
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição da prefeitura: ${response.status}`);
      }

      const html = await response.text();
      console.log('📄 HTML da prefeitura recebido, tamanho:', html.length, 'caracteres');
      
      const $ = cheerio.load(html);
      
      // Analisar a estrutura da página para extrair dados de coleta
      const coletaComum: ColetaLixo[] = [];
      const coletaSeletiva: ColetaLixo[] = [];
      
      // Procurar por elementos que contenham informações de coleta
      // Esta é uma implementação genérica que pode precisar ser ajustada
      // baseada na estrutura real da página da prefeitura
      
      // Tentar encontrar informações de coleta comum
      $('.coleta-comum, .lixo-comum, [class*="comum"], [class*="domiciliar"]').each((index, element) => {
        const $el = $(element);
        const texto = $el.text().trim();
        
        if (texto && texto.length > 10) {
          coletaComum.push({
            id: `prefeitura-comum-${index}`,
            tipo: 'comum',
            endereco: 'Informação da Prefeitura SP',
            diasSemana: this.extrairDiasSemana(texto),
            horarios: this.extrairHorarios(texto),
            frequencia: 'Conforme programação da prefeitura',
            observacoes: texto.substring(0, 200) + '...'
          });
        }
      });
      
      // Tentar encontrar informações de coleta seletiva
      $('.coleta-seletiva, .lixo-seletivo, [class*="seletiva"], [class*="reciclagem"]').each((index, element) => {
        const $el = $(element);
        const texto = $el.text().trim();
        
        if (texto && texto.length > 10) {
          coletaSeletiva.push({
            id: `prefeitura-seletiva-${index}`,
            tipo: 'seletiva',
            endereco: 'Informação da Prefeitura SP',
            diasSemana: this.extrairDiasSemana(texto),
            horarios: this.extrairHorarios(texto),
            frequencia: 'Conforme programação da prefeitura',
            observacoes: texto.substring(0, 200) + '...'
          });
        }
      });
      
      // Se não encontrou elementos específicos, tentar extrair de qualquer texto
      if (coletaComum.length === 0 && coletaSeletiva.length === 0) {
        console.log('🔍 Procurando informações de coleta em todo o conteúdo...');
        
        // Procurar por padrões de dias da semana
        const conteudoCompleto = $('body').text();
        const temDiasSemana = /(segunda|terça|quarta|quinta|sexta|sábado|domingo)/i.test(conteudoCompleto);
        const temHorarios = /\d{1,2}:\d{2}/.test(conteudoCompleto);
        
        if (temDiasSemana || temHorarios) {
          console.log('📋 Encontrados padrões de dias/horários no conteúdo');
          
          // Criar uma entrada genérica baseada no conteúdo encontrado
          const diasEncontrados = this.extrairDiasSemana(conteudoCompleto);
          const horariosEncontrados = this.extrairHorarios(conteudoCompleto);
          
          if (diasEncontrados.length > 0) {
            coletaComum.push({
              id: 'prefeitura-comum-generico',
              tipo: 'comum',
              endereco: 'Informação da Prefeitura SP',
              diasSemana: diasEncontrados,
              horarios: horariosEncontrados.length > 0 ? horariosEncontrados : ['Conforme programação'],
              frequencia: 'Conforme programação da prefeitura',
              observacoes: 'Informações extraídas do site da Prefeitura SP'
            });
          }
        }
      }
      
      if (coletaComum.length > 0 || coletaSeletiva.length > 0) {
        console.log(`✅ Scraping da prefeitura bem-sucedido: ${coletaComum.length} comum, ${coletaSeletiva.length} seletiva`);
        return {
          coletaComum,
          coletaSeletiva,
          endereco: 'Informação da Prefeitura SP',
          latitude: 0,
          longitude: 0,
          dataConsulta: new Date().toISOString()
        };
      } else {
        console.log('⚠️ Nenhuma informação de coleta encontrada no site da prefeitura');
        return null;
      }

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
      console.log('🔍 Verificando estrutura:');
      console.log('- data existe?', !!data);
      console.log('- data.result existe?', !!data.result);
      console.log('- data.result é array?', Array.isArray(data.result));
      console.log('- data.result.length:', data.result?.length);
      
      // Processar dados da Ecourbis baseado na estrutura real da API
      if (data && data.result && data.result.length > 0) {
        const coletaComum: ColetaLixo[] = [];
        const coletaSeletiva: ColetaLixo[] = [];
        
        // Processar apenas o primeiro item único (a API retorna duplicatas)
        const itemUnico = data.result[0];
        console.log(`🔍 Processando item único:`, itemUnico);
        
        // Coleta Domiciliar (Comum)
        if (itemUnico.domiciliar && itemUnico.domiciliar.frequencia) {
          console.log('✅ Adicionando coleta domiciliar');
          coletaComum.push({
            id: `ecourbis-domiciliar-${itemUnico.id}`,
            tipo: 'comum',
            endereco: `${itemUnico.endereco.logradouro}, ${itemUnico.endereco.distrito}`,
            diasSemana: this.processarDiasSemanaEcourbisArray(itemUnico.domiciliar.frequencia),
            horarios: this.processarHorariosEcourbisArray(itemUnico.domiciliar.horarios),
            frequencia: itemUnico.domiciliar.frequencia,
            observacoes: itemUnico.domiciliar.mensagem || 'Coloque o lixo na calçada até 6h da manhã'
          });
        }

        // Coleta Seletiva
        if (itemUnico.seletiva && itemUnico.seletiva.possue && itemUnico.seletiva.frequencia) {
          console.log('✅ Adicionando coleta seletiva');
          coletaSeletiva.push({
            id: `ecourbis-seletiva-${itemUnico.id}`,
            tipo: 'seletiva',
            endereco: `${itemUnico.endereco.logradouro}, ${itemUnico.endereco.distrito}`,
            diasSemana: this.processarDiasSemanaEcourbisArray(itemUnico.seletiva.frequencia),
            horarios: this.processarHorariosEcourbisArray(itemUnico.seletiva.horarios),
            frequencia: itemUnico.seletiva.frequencia,
            observacoes: itemUnico.seletiva.mensagem || 'Separe materiais recicláveis: papel, plástico, vidro e metal'
          });
        }
        
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
   * Processa dias da semana da API Ecourbis (formato SEG/QUA/SEX) - Retorna string
   */
  private processarDiasSemanaEcourbis(frequencia: string): string {
    if (!frequencia) return 'Conforme programação';
    
    const diasMap: { [key: string]: string } = {
      'SEG': 'Segunda-feira',
      'TER': 'Terça-feira', 
      'QUA': 'Quarta-feira',
      'QUI': 'Quinta-feira',
      'SEX': 'Sexta-feira',
      'SAB': 'Sábado',
      'DOM': 'Domingo'
    };
    
    return frequencia.split('/').map(dia => diasMap[dia] || dia).join(', ');
  }

  /**
   * Processa dias da semana da API Ecourbis (formato SEG/QUA/SEX) - Retorna array
   */
  private processarDiasSemanaEcourbisArray(frequencia: string): string[] {
    if (!frequencia) return ['Conforme programação'];
    
    const diasMap: { [key: string]: string } = {
      'SEG': 'Segunda-feira',
      'TER': 'Terça-feira', 
      'QUA': 'Quarta-feira',
      'QUI': 'Quinta-feira',
      'SEX': 'Sexta-feira',
      'SAB': 'Sábado',
      'DOM': 'Domingo'
    };
    
    return frequencia.split('/').map(dia => diasMap[dia] || dia);
  }

  /**
   * Processa horários da API Ecourbis (objeto com dias da semana) - Retorna string
   */
  private processarHorariosEcourbis(horarios: Record<string, string>): string {
    if (!horarios || typeof horarios !== 'object') return 'Conforme programação';
    
    const horariosArray: string[] = [];
    const diasMap: { [key: string]: string } = {
      'seg': 'Segunda',
      'ter': 'Terça', 
      'qua': 'Quarta',
      'qui': 'Quinta',
      'sex': 'Sexta',
      'sab': 'Sábado',
      'dom': 'Domingo'
    };
    
    Object.entries(horarios).forEach(([dia, horario]) => {
      if (horario && horario !== '-') {
        horariosArray.push(`${diasMap[dia] || dia}: ${horario}`);
      }
    });
    
    return horariosArray.length > 0 ? horariosArray.join(', ') : 'Conforme programação';
  }

  /**
   * Processa horários da API Ecourbis (objeto com dias da semana) - Retorna array
   */
  private processarHorariosEcourbisArray(horarios: Record<string, string>): string[] {
    if (!horarios || typeof horarios !== 'object') return ['Conforme programação'];
    
    const horariosArray: string[] = [];
    const diasMap: { [key: string]: string } = {
      'seg': 'Segunda',
      'ter': 'Terça', 
      'qua': 'Quarta',
      'qui': 'Quinta',
      'sex': 'Sexta',
      'sab': 'Sábado',
      'dom': 'Domingo'
    };
    
    Object.entries(horarios).forEach(([dia, horario]) => {
      if (horario && horario !== '-') {
        horariosArray.push(`${diasMap[dia] || dia}: ${horario}`);
      }
    });
    
    return horariosArray.length > 0 ? horariosArray : ['Conforme programação'];
  }

  /**
   * Extrai dias da semana de um texto
   */
  private extrairDiasSemana(texto: string): string[] {
    const diasMap: { [key: string]: string } = {
      'segunda': 'Segunda-feira',
      'terça': 'Terça-feira',
      'quarta': 'Quarta-feira',
      'quinta': 'Quinta-feira',
      'sexta': 'Sexta-feira',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    };
    
    const diasEncontrados: string[] = [];
    
    Object.keys(diasMap).forEach(dia => {
      if (texto.toLowerCase().includes(dia)) {
        diasEncontrados.push(diasMap[dia]);
      }
    });
    
    return diasEncontrados.length > 0 ? diasEncontrados : ['Conforme programação'];
  }

  /**
   * Extrai horários de um texto
   */
  private extrairHorarios(texto: string): string[] {
    const regexHorarios = /\d{1,2}:\d{2}(?:\s*[à-]\s*\d{1,2}:\d{2})?/g;
    const horarios = texto.match(regexHorarios);
    
    return horarios ? horarios.map(h => h.trim()) : ['Conforme programação'];
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

  // Função de dados mock removida - usar apenas dados reais

  // Função de identificação de região removida - usar apenas dados reais

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
