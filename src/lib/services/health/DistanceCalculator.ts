/**
 * Calculadora de distâncias para estabelecimentos de saúde
 * Usa a fórmula de Haversine para calcular distâncias entre coordenadas
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @param lat1 Latitude do primeiro ponto
 * @param lng1 Longitude do primeiro ponto
 * @param lat2 Latitude do segundo ponto
 * @param lng2 Longitude do segundo ponto
 * @returns Distância em quilômetros
 */
export function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distância em km
}

/**
 * Calcula a distância entre o usuário e um estabelecimento
 * @param userCoords Coordenadas do usuário
 * @param estabelecimentoCoords Coordenadas do estabelecimento
 * @returns Distância em metros
 */
export function calcularDistanciaEstabelecimento(
  userCoords: Coordinates, 
  estabelecimentoCoords: Coordinates
): number {
  const distanciaKm = calcularDistancia(
    userCoords.lat,
    userCoords.lng,
    estabelecimentoCoords.lat,
    estabelecimentoCoords.lng
  );
  return Math.round(distanciaKm * 1000); // Converter para metros
}

/**
 * Ordena estabelecimentos por distância do usuário
 * @param estabelecimentos Lista de estabelecimentos
 * @param userCoords Coordenadas do usuário
 * @returns Lista ordenada por distância
 */
export function ordenarPorDistancia<T extends { coordenadas: Coordinates; distancia?: number }>(
  estabelecimentos: T[],
  userCoords: Coordinates
): T[] {
  return estabelecimentos
    .map(estabelecimento => ({
      ...estabelecimento,
      distancia: calcularDistanciaEstabelecimento(userCoords, estabelecimento.coordenadas)
    }))
    .sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
}
