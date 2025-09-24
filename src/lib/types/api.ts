// Tipos para as APIs do sistema Procura SP

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  unidade?: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export interface CataBagulhoResult {
  street: string;
  startStretch?: string;
  endStretch?: string;
  dates: string[];
  frequency: string;
  shift: string;
  schedule: string;
  trechos?: string[];
}

export interface TrechoCoordinates {
  cd_mapa: string;
  coordinates: Array<{ lat: number; lng: number }>;
  resultado: number;
}

// Removido: NominatimResult (não usado mais)
// Substituído por coordenadas aproximadas locais
