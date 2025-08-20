export interface Service {
  cepData: unknown;
  id: number;
  type: string;
  name: string;
  address: string;
  date: string;
  time: string;
  distance: string;
  description: string;
  coordinates: [number, number];
  additionalInfo?: Record<string, unknown>;
}

export interface ServiceSearchParams {
  cep: string;
  number: string;
  serviceType: string;
}

export interface CacheStatus {
  hit: boolean;
  expired: boolean;
  source: "cache" | "api";
}