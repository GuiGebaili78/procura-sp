/**
 * Tipos para Feiras Livres
 * Baseado na API: https://locatsp.saclimpeza2.com.br/mapa/resultados/?servico=feiras
 */

export interface FeiraLivre {
  id: string;
  nome: string;
  endereco: string;
  periodo: string;
  diaSemana: string;
  horario?: string;
  observacoes?: string;
  latitude?: number;
  longitude?: number;
  // Coordenadas para o mapa (serão preenchidas pelo geocoding)
  coords?: {
    lat: number;
    lng: number;
  };
}

export interface FeiraLivreResponse {
  feiras: FeiraLivre[];
  endereco: string;
  latitude: number;
  longitude: number;
  dataConsulta: string;
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

export interface FeiraLivreSearchParams {
  endereco: string;
  numero?: string;
  latitude: number;
  longitude: number;
}

export interface FeiraLivreApiResponse {
  success: boolean;
  data?: FeiraLivreResponse;
  error?: string;
  fromCache?: boolean;
}
