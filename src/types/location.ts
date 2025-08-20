export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  cep: string;
  coordinates: Coordinates;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  // Adicionados para guardar as coordenadas após geocodificação
  lat?: number;
  lon?: number;
}