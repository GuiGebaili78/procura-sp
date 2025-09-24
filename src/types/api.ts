// Removido: Interfaces do Nominatim (não usado mais)
// export interface NominatimAddress { ... }
// export interface NominatimResult { ... }

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
  services: unknown[]; // Usando unknown ao invés de any
  total?: number;
  meta?: ServiceMeta;
}
