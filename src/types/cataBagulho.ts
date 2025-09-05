export interface CataBagulhoResult {
  street: string;
  startStretch?: string;
  endStretch?: string;
  dates: string[];
  frequency: string;
  shift: string;
  schedule: string;
  trechos?: string[]; // Array com IDs dos trechos para o botão "Ver trecho"
}

export interface TrechoCoordinates {
  cd_mapa: string;
  coordinates: Array<{ lat: number; lng: number }>;
  resultado: number;
}
