export interface NominatimAddress {
  house_number?: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  municipality?: string;
  neighbourhood?: string;
}

export interface NominatimResult {
  place_id: number;
  licence?: string;
  osm_type?: string;
  osm_id?: number;
  boundingbox?: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class?: string;
  type?: string;
  importance?: number;
  icon?: string;
  address?: NominatimAddress;
}

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
