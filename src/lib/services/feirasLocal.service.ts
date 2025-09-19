import fs from 'fs';
import path from 'path';
import { haversineDistance } from '@/utils/helpers';

export interface FeiraLivre {
  id: string;
  numeroFeira: string;
  diaSemana: string;
  categoria: string;
  endereco: string;
  enderecoOriginal: string;
  numero: string;
  bairro: string;
  referencia: string;
  cep: string;
  subPrefeitura: string;
  latitude: number | null;
  longitude: number | null;
  ativo: boolean;
  dataAtualizacao: string;
}

export interface FeirasSearchParams {
  endereco?: string;
  bairro?: string;
  diaSemana?: string;
  categoria?: string;
  subPrefeitura?: string;
  lat?: number;
  lng?: number;
  raio?: number;
}

export interface FeirasSearchResult {
  feiras: FeiraLivre[];
  total: number;
  enderecoBuscado?: string;
  dataConsulta: string;
  source: string;
}

/**
 * Serviço local de feiras livres
 * Usa exclusivamente o arquivo JSON local feira-livre.json
 */
export class FeirasLocalService {
  private feiras: FeiraLivre[] = [];
  private readonly JSON_PATH = path.join(process.cwd(), 'public', 'dados', 'feira-livre.json');

  constructor() {
    this.carregarDados();
    console.log(`🏪 [FeirasLocalService] ${this.feiras.length} feiras carregadas`);
  }

  /**
   * Carrega os dados do arquivo JSON
   */
  private carregarDados(): void {
    try {
      const rawData = fs.readFileSync(this.JSON_PATH, 'utf8');
      this.feiras = JSON.parse(rawData);
      console.log(`✅ [FeirasLocalService] Dados carregados com sucesso`);
    } catch (error) {
      console.error('❌ [FeirasLocalService] Erro ao carregar dados:', error);
      this.feiras = [];
    }
  }

  /**
   * Busca feiras por endereço
   */
  async buscarPorEndereco(endereco: string): Promise<FeirasSearchResult> {
    console.log(`🔍 [FeirasLocalService] Buscando por endereço: ${endereco}`);
    
    const feirasEncontradas = this.feiras.filter(feira => 
      feira.endereco.toLowerCase().includes(endereco.toLowerCase()) ||
      feira.bairro.toLowerCase().includes(endereco.toLowerCase()) ||
      feira.referencia.toLowerCase().includes(endereco.toLowerCase())
    );

    return {
      feiras: feirasEncontradas,
      total: feirasEncontradas.length,
      enderecoBuscado: endereco,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca feiras por bairro
   */
  async buscarPorBairro(bairro: string): Promise<FeirasSearchResult> {
    console.log(`🔍 [FeirasLocalService] Buscando por bairro: ${bairro}`);
    
    const feirasEncontradas = this.feiras.filter(feira => 
      feira.bairro.toLowerCase().includes(bairro.toLowerCase())
    );

    return {
      feiras: feirasEncontradas,
      total: feirasEncontradas.length,
      enderecoBuscado: bairro,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca feiras por dia da semana
   */
  async buscarPorDiaSemana(diaSemana: string): Promise<FeirasSearchResult> {
    console.log(`🔍 [FeirasLocalService] Buscando por dia: ${diaSemana}`);
    
    const feirasEncontradas = this.feiras.filter(feira => 
      feira.diaSemana.toLowerCase().includes(diaSemana.toLowerCase())
    );

    return {
      feiras: feirasEncontradas,
      total: feirasEncontradas.length,
      enderecoBuscado: diaSemana,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca feiras por categoria
   */
  async buscarPorCategoria(categoria: string): Promise<FeirasSearchResult> {
    console.log(`🔍 [FeirasLocalService] Buscando por categoria: ${categoria}`);
    
    const feirasEncontradas = this.feiras.filter(feira => 
      feira.categoria.toLowerCase().includes(categoria.toLowerCase())
    );

    return {
      feiras: feirasEncontradas,
      total: feirasEncontradas.length,
      enderecoBuscado: categoria,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca feiras por sub-prefeitura
   */
  async buscarPorSubPrefeitura(subPrefeitura: string): Promise<FeirasSearchResult> {
    console.log(`🔍 [FeirasLocalService] Buscando por sub-prefeitura: ${subPrefeitura}`);
    
    const feirasEncontradas = this.feiras.filter(feira => 
      feira.subPrefeitura.toLowerCase().includes(subPrefeitura.toLowerCase())
    );

    return {
      feiras: feirasEncontradas,
      total: feirasEncontradas.length,
      enderecoBuscado: subPrefeitura,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca feiras próximas a coordenadas
   */
  async buscarProximas(latitude: number, longitude: number, raioKm: number = 5): Promise<FeirasSearchResult> {
    console.log(`🔍 [FeirasLocalService] Buscando próximas a: ${latitude}, ${longitude} (raio: ${raioKm}km)`);
    
    const feirasProximas = this.feiras
      .filter(feira => feira.latitude && feira.longitude)
      .map(feira => ({
        ...feira,
        distancia: haversineDistance(latitude, longitude, feira.latitude!, feira.longitude!)
      }))
      .filter(feira => feira.distancia <= raioKm)
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 20); // Top 20 mais próximas

    return {
      feiras: feirasProximas,
      total: feirasProximas.length,
      enderecoBuscado: `${latitude}, ${longitude}`,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca geral com múltiplos filtros
   */
  async buscar(params: FeirasSearchParams): Promise<FeirasSearchResult> {
    console.log(`🔍 [FeirasLocalService] Busca geral com parâmetros:`, params);
    
    let resultados = [...this.feiras];

    // Aplicar filtros
    if (params.endereco) {
      resultados = resultados.filter(feira => 
        feira.endereco.toLowerCase().includes(params.endereco!.toLowerCase()) ||
        feira.bairro.toLowerCase().includes(params.endereco!.toLowerCase()) ||
        feira.referencia.toLowerCase().includes(params.endereco!.toLowerCase())
      );
    }

    if (params.bairro) {
      resultados = resultados.filter(feira => 
        feira.bairro.toLowerCase().includes(params.bairro!.toLowerCase())
      );
    }

    if (params.diaSemana) {
      resultados = resultados.filter(feira => 
        feira.diaSemana.toLowerCase().includes(params.diaSemana!.toLowerCase())
      );
    }

    if (params.categoria) {
      resultados = resultados.filter(feira => 
        feira.categoria.toLowerCase().includes(params.categoria!.toLowerCase())
      );
    }

    if (params.subPrefeitura) {
      resultados = resultados.filter(feira => 
        feira.subPrefeitura.toLowerCase().includes(params.subPrefeitura!.toLowerCase())
      );
    }

    // Se há coordenadas, filtrar por proximidade
    if (params.lat && params.lng && params.raio) {
      resultados = resultados
        .filter(feira => feira.latitude && feira.longitude)
        .map(feira => ({
          ...feira,
          distancia: haversineDistance(params.lat!, params.lng!, feira.latitude!, feira.longitude!)
        }))
        .filter(feira => feira.distancia <= params.raio!)
        .sort((a, b) => a.distancia - b.distancia);
    }

    return {
      feiras: resultados,
      total: resultados.length,
      enderecoBuscado: params.endereco || params.bairro || 'Busca geral',
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Obtém todas as feiras
   */
  getTodasFeiras(): FeiraLivre[] {
    return this.feiras;
  }

  /**
   * Obtém estatísticas dos dados
   */
  getEstatisticas(): {
    total: number;
    porDiaSemana: Record<string, number>;
    porCategoria: Record<string, number>;
    porSubPrefeitura: Record<string, number>;
    comCoordenadas: number;
    comCep: number;
    ativas: number;
  } {
    const porDiaSemana: Record<string, number> = {};
    const porCategoria: Record<string, number> = {};
    const porSubPrefeitura: Record<string, number> = {};
    
    let comCoordenadas = 0;
    let comCep = 0;
    let ativas = 0;

    this.feiras.forEach(feira => {
      porDiaSemana[feira.diaSemana] = (porDiaSemana[feira.diaSemana] || 0) + 1;
      porCategoria[feira.categoria] = (porCategoria[feira.categoria] || 0) + 1;
      porSubPrefeitura[feira.subPrefeitura] = (porSubPrefeitura[feira.subPrefeitura] || 0) + 1;
      
      if (feira.latitude && feira.longitude) comCoordenadas++;
      if (feira.cep) comCep++;
      if (feira.ativo) ativas++;
    });

    return {
      total: this.feiras.length,
      porDiaSemana,
      porCategoria,
      porSubPrefeitura,
      comCoordenadas,
      comCep,
      ativas
    };
  }

  /**
   * Recarrega os dados do arquivo JSON
   */
  recarregarDados(): void {
    this.carregarDados();
  }
}

// Instância singleton
export const feirasLocalService = new FeirasLocalService();
