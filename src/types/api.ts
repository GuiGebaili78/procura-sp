// Tipos para as APIs do sistema Procura SP

export interface ServiceMeta {
  query?: string;
  total_results?: number;
  search_time?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface BackendServiceSearchResponse {
  services: unknown[];
  total?: number;
  meta?: ServiceMeta;
}
