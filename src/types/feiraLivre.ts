/**
 * Tipos para Feiras Livres
 * Baseado no arquivo local feira-livre.json
 */

export interface FeiraLivre {
  id: string;
  numeroFeira: string;
  diaSemana: string;
  categoria: string;
  endereco: string;
  enderecoOriginal: string;
  numero: string | null;
  bairro: string;
  referencia: string;
  cep: string;
  subPrefeitura: string;
  latitude: number | null;
  longitude: number | null;
  ativo: boolean;
  dataAtualizacao: string;
  // Campo adicional para distância (calculado em buscas por proximidade)
  distancia?: number;
}

export interface FeirasSearchResult {
  feiras: FeiraLivre[];
  total: number;
  enderecoBuscado?: string;
  dataConsulta: string;
  source: string;
}

export interface FeiraLivreCache {
  id: number;
  latitude: number;
  longitude: number;
  endereco: string;
  dataConsulta: string;
  dadosJson: FeiraLivre[];
  createdAt: string;
  updatedAt: string;
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

export interface FeiraLivreApiResponse {
  success: boolean;
  data?: FeirasSearchResult;
  error?: string;
  source?: string;
}
