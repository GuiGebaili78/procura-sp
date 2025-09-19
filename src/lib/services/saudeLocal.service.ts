import fs from 'fs';
import path from 'path';
import { haversineDistance } from '@/utils/helpers';

export interface EstabelecimentoSaude {
  id: number;
  nome: string;
  endereco: string;
  bairro: string;
  cep: string | null;
  telefone: number | null;
  tipo: string;
  categoria: string | null;
  administracao: string | null;
  regiao: string;
  codigo: number | null;
  descricao: string | null;
  latitude: number | null;
  longitude: number | null;
  ativo: boolean;
  dataAtualizacao: string;
  distancia?: number; // Adicionado para compatibilidade com o mapa
}

export interface SaudeSearchParams {
  endereco?: string;
  unidade?: string;
  lat?: number;
  lng?: number;
  raio?: number;
  tipo?: string;
  regiao?: string;
  administracao?: string;
  categorias?: string[];
}

export interface SaudeSearchResult {
  estabelecimentos: EstabelecimentoSaude[];
  total: number;
  enderecoBuscado?: string;
  dataConsulta: string;
  source: string;
}

/**
 * Serviço local de estabelecimentos de saúde
 * Usa exclusivamente o arquivo JSON local estabelecimentos-saude.json
 */
export class SaudeLocalService {
  private estabelecimentos: EstabelecimentoSaude[] = [];
  private readonly JSON_PATH = path.join(process.cwd(), 'public', 'dados', 'estabelecimentos-saude.json');

  constructor() {
    this.carregarDados();
    console.log(`🏥 [SaudeLocalService] ${this.estabelecimentos.length} estabelecimentos carregados`);
  }

  /**
   * Carrega os dados do arquivo JSON
   */
  private carregarDados(): void {
    try {
      const rawData = fs.readFileSync(this.JSON_PATH, 'utf8');
      this.estabelecimentos = JSON.parse(rawData);
      console.log(`✅ [SaudeLocalService] Dados carregados com sucesso`);
    } catch (error) {
      console.error('❌ [SaudeLocalService] Erro ao carregar dados:', error);
      this.estabelecimentos = [];
    }
  }

  /**
   * Busca estabelecimentos por endereço
   */
  async buscarPorEndereco(endereco: string): Promise<SaudeSearchResult> {
    console.log(`🔍 [SaudeLocalService] Buscando por endereço: ${endereco}`);
    
    const estabelecimentosEncontrados = this.estabelecimentos.filter(est => 
      est.endereco.toLowerCase().includes(endereco.toLowerCase()) ||
      est.bairro.toLowerCase().includes(endereco.toLowerCase())
    );

    return {
      estabelecimentos: estabelecimentosEncontrados,
      total: estabelecimentosEncontrados.length,
      enderecoBuscado: endereco,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca estabelecimentos por nome da unidade
   */
  async buscarPorUnidade(nomeUnidade: string): Promise<SaudeSearchResult> {
    console.log(`🔍 [SaudeLocalService] Buscando por unidade: ${nomeUnidade}`);
    
    const estabelecimentosEncontrados = this.estabelecimentos.filter(est => 
      est.nome.toLowerCase().includes(nomeUnidade.toLowerCase()) ||
      est.tipo.toLowerCase().includes(nomeUnidade.toLowerCase()) ||
      est.categoria?.toLowerCase().includes(nomeUnidade.toLowerCase())
    );

    return {
      estabelecimentos: estabelecimentosEncontrados,
      total: estabelecimentosEncontrados.length,
      enderecoBuscado: nomeUnidade,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca estabelecimentos próximos a coordenadas
   */
  async buscarProximos(latitude: number, longitude: number, raioKm: number = 5): Promise<SaudeSearchResult> {
    console.log(`🔍 [SaudeLocalService] Buscando próximos a: ${latitude}, ${longitude} (raio: ${raioKm}km)`);
    
    const estabelecimentosProximos = this.estabelecimentos
      .filter(est => est.latitude && est.longitude)
      .map(est => ({
        ...est,
        distancia: haversineDistance(latitude, longitude, est.latitude!, est.longitude!)
      }))
      .filter(est => est.distancia <= raioKm)
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 20); // Top 20 mais próximos

    return {
      estabelecimentos: estabelecimentosProximos,
      total: estabelecimentosProximos.length,
      enderecoBuscado: `${latitude}, ${longitude}`,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca estabelecimentos por tipo
   */
  async buscarPorTipo(tipo: string): Promise<SaudeSearchResult> {
    console.log(`🔍 [SaudeLocalService] Buscando por tipo: ${tipo}`);
    
    const estabelecimentosEncontrados = this.estabelecimentos.filter(est => 
      est.tipo.toLowerCase().includes(tipo.toLowerCase()) ||
      est.categoria?.toLowerCase().includes(tipo.toLowerCase())
    );

    return {
      estabelecimentos: estabelecimentosEncontrados,
      total: estabelecimentosEncontrados.length,
      enderecoBuscado: tipo,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca estabelecimentos por região
   */
  async buscarPorRegiao(regiao: string): Promise<SaudeSearchResult> {
    console.log(`🔍 [SaudeLocalService] Buscando por região: ${regiao}`);
    
    const estabelecimentosEncontrados = this.estabelecimentos.filter(est => 
      est.regiao.toLowerCase().includes(regiao.toLowerCase())
    );

    return {
      estabelecimentos: estabelecimentosEncontrados,
      total: estabelecimentosEncontrados.length,
      enderecoBuscado: regiao,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca estabelecimentos por administração
   */
  async buscarPorAdministracao(administracao: string): Promise<SaudeSearchResult> {
    console.log(`🔍 [SaudeLocalService] Buscando por administração: ${administracao}`);
    
    const estabelecimentosEncontrados = this.estabelecimentos.filter(est => 
      est.administracao?.toLowerCase().includes(administracao.toLowerCase())
    );

    return {
      estabelecimentos: estabelecimentosEncontrados,
      total: estabelecimentosEncontrados.length,
      enderecoBuscado: administracao,
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Busca geral com múltiplos filtros
   */
  async buscar(params: SaudeSearchParams): Promise<SaudeSearchResult> {
    console.log(`🔍 [SaudeLocalService] Busca geral com parâmetros:`, params);
    
    let resultados = [...this.estabelecimentos];

    // Aplicar filtros
    if (params.endereco) {
      resultados = resultados.filter(est => 
        est.endereco.toLowerCase().includes(params.endereco!.toLowerCase()) ||
        est.bairro.toLowerCase().includes(params.endereco!.toLowerCase())
      );
    }

    if (params.unidade) {
      resultados = resultados.filter(est => 
        est.nome.toLowerCase().includes(params.unidade!.toLowerCase()) ||
        est.tipo.toLowerCase().includes(params.unidade!.toLowerCase())
      );
    }

    if (params.tipo) {
      resultados = resultados.filter(est => 
        est.tipo.toLowerCase().includes(params.tipo!.toLowerCase())
      );
    }

    if (params.regiao) {
      resultados = resultados.filter(est => 
        est.regiao.toLowerCase().includes(params.regiao!.toLowerCase())
      );
    }

    if (params.administracao) {
      resultados = resultados.filter(est => 
        est.administracao?.toLowerCase().includes(params.administracao!.toLowerCase())
      );
    }

    if (params.categorias && params.categorias.length > 0) {
      resultados = resultados.filter(est => 
        est.categoria && params.categorias!.includes(est.categoria)
      );
    }

    // Se há coordenadas, filtrar por proximidade
    if (params.lat && params.lng && params.raio) {
      resultados = resultados
        .filter(est => est.latitude && est.longitude)
        .map(est => ({
          ...est,
          distancia: haversineDistance(params.lat!, params.lng!, est.latitude!, est.longitude!)
        }))
        .filter(est => est.distancia <= params.raio!)
        .sort((a, b) => a.distancia - b.distancia);
    }

    return {
      estabelecimentos: resultados,
      total: resultados.length,
      enderecoBuscado: params.endereco || params.unidade || 'Busca geral',
      dataConsulta: new Date().toISOString(),
      source: 'dados_locais'
    };
  }

  /**
   * Obtém todos os estabelecimentos
   */
  getTodosEstabelecimentos(): EstabelecimentoSaude[] {
    return this.estabelecimentos;
  }

  /**
   * Obtém estatísticas dos dados
   */
  getEstatisticas(): {
    total: number;
    porTipo: Record<string, number>;
    porRegiao: Record<string, number>;
    porAdministracao: Record<string, number>;
    comCoordenadas: number;
    comTelefone: number;
    comCep: number;
  } {
    const porTipo: Record<string, number> = {};
    const porRegiao: Record<string, number> = {};
    const porAdministracao: Record<string, number> = {};
    
    let comCoordenadas = 0;
    let comTelefone = 0;
    let comCep = 0;

    this.estabelecimentos.forEach(est => {
      porTipo[est.tipo] = (porTipo[est.tipo] || 0) + 1;
      porRegiao[est.regiao] = (porRegiao[est.regiao] || 0) + 1;
      if (est.administracao) {
        porAdministracao[est.administracao] = (porAdministracao[est.administracao] || 0) + 1;
      }
      
      if (est.latitude && est.longitude) comCoordenadas++;
      if (est.telefone) comTelefone++;
      if (est.cep) comCep++;
    });

    return {
      total: this.estabelecimentos.length,
      porTipo,
      porRegiao,
      porAdministracao,
      comCoordenadas,
      comTelefone,
      comCep
    };
  }

  /**
   * Recarrega os dados do arquivo JSON
   */
  recarregarDados(): void {
    this.carregarDados();
  }

  /**
   * Agrupa estabelecimentos por coordenadas (lat, lng)
   */
  agruparPorCoordenadas(estabelecimentos: EstabelecimentoSaude[]): Record<string, EstabelecimentoSaude[]> {
    const grupos: Record<string, EstabelecimentoSaude[]> = {};

    estabelecimentos.forEach(est => {
      if (est.latitude && est.longitude) {
        const key = `${est.latitude},${est.longitude}`;
        if (!grupos[key]) {
          grupos[key] = [];
        }
        grupos[key].push(est);
      }
    });

    return grupos;
  }

  /**
   * Obtém categorias disponíveis
   */
  async getCategoriasDisponiveis(): Promise<string[]> {
    const categoriasSet = new Set(this.estabelecimentos.map(est => est.categoria).filter(Boolean));
    const categorias = Array.from(categoriasSet) as string[];
    return categorias.sort();
  }
}

// Instância singleton
export const saudeLocalService = new SaudeLocalService();
