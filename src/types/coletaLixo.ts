/**
 * Tipos para Coleta de Lixo
 * Baseado nas fontes: Prefeitura SP e Ecourbis API
 */

export interface ColetaLixo {
  id: string;
  tipo: 'comum' | 'seletiva';
  endereco: string;
  diasSemana: string[];
  horarios: string[];
  frequencia: string;
  observacoes?: string;
}

export interface ColetaLixoResponse {
  coletaComum: ColetaLixo[];
  coletaSeletiva: ColetaLixo[];
  endereco: string;
  latitude: number;
  longitude: number;
  dataConsulta: string;
}

export interface ColetaLixoCache {
  id: number;
  latitude: number;
  longitude: number;
  endereco: string;
  dataConsulta: string;
  dadosJson: ColetaLixoResponse;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColetaLixoSearchParams {
  endereco: string;
  numero?: string;
  latitude: number;
  longitude: number;
}

export interface ColetaLixoApiResponse {
  success: boolean;
  data?: ColetaLixoResponse;
  error?: string;
  fromCache?: boolean;
}
