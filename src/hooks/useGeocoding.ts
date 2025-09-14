import { useCallback } from 'react';
import { geocodeAddress } from '../services/nominatim';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseGeocodingReturn {
  geocodeAddress: (enderecoCompleto: string) => Promise<Coordinates | null>;
  obterCoordenadasAproximadasPorCEP: (cep: string) => Coordinates | undefined;
}

export function useGeocoding(): UseGeocodingReturn {
  const geocodeAddressCallback = useCallback(async (enderecoCompleto: string): Promise<Coordinates | null> => {
    try {
      console.log("🔍 Tentando geocoding para:", enderecoCompleto);
      const geocodeResults = await geocodeAddress(enderecoCompleto);
      if (geocodeResults && geocodeResults.length > 0) {
        const coordinates = {
          lat: parseFloat(geocodeResults[0].lat),
          lng: parseFloat(geocodeResults[0].lon)
        };
        console.log("✅ Coordenadas reais obtidas via geocoding:", coordinates);
        return coordinates;
      } else {
        console.log("⚠️ Geocoding retornou resultado vazio");
        return null;
      }
    } catch (error) {
      console.error("❌ Erro no geocoding:", error);
      return null;
    }
  }, []);

  const obterCoordenadasAproximadasPorCEP = useCallback((cep: string): Coordinates | undefined => {
    const cepNumerico = cep.replace(/\D/g, '');
    
    // Coordenadas mais precisas por região de São Paulo baseadas no CEP
    const coordenadasPorRegiao: { [key: string]: Coordinates } = {
      // Centro (01000-01999) - Centro Histórico, República, Sé
      '01': { lat: -23.5505, lng: -46.6333 },
      // Zona Norte (02000-02999) - Santana, Tucuruvi, Casa Verde
      '02': { lat: -23.4800, lng: -46.6200 },
      // Zona Leste (03000-03999) - Tatuapé, Mooca, Penha
      '03': { lat: -23.5400, lng: -46.4800 },
      // Zona Sul (04000-04999) - Vila Olímpia, Moema, Campo Belo
      '04': { lat: -23.6000, lng: -46.6500 },
      // Zona Oeste (05000-05999) - Lapa, Pinheiros, Butantã
      '05': { lat: -23.5500, lng: -46.7200 },
      // Zona Norte (06000-06999) - Freguesia do Ó, Pirituba
      '06': { lat: -23.4500, lng: -46.7000 },
      // Zona Leste (07000-07999) - São Miguel, Itaquera
      '07': { lat: -23.5000, lng: -46.4000 },
      // Zona Sul (08000-08999) - Santo Amaro, Jabaquara
      '08': { lat: -23.6500, lng: -46.6200 },
      // Zona Sul (09000-09999) - Interlagos, Campo Limpo
      '09': { lat: -23.7000, lng: -46.7000 },
    };

    const prefixo = cepNumerico.substring(0, 2);
    const coordenadas = coordenadasPorRegiao[prefixo];
    
    if (coordenadas) {
      // Adicionar variação mais sutil baseada no CEP para evitar sobreposição
      const variacaoLat = (parseInt(cepNumerico.substring(2, 4)) / 100) * 0.005;
      const variacaoLng = (parseInt(cepNumerico.substring(4, 6)) / 100) * 0.005;
      
      return {
        lat: coordenadas.lat + variacaoLat,
        lng: coordenadas.lng + variacaoLng
      };
    }
    
    // Fallback para São Paulo centro
    return { lat: -23.5505, lng: -46.6333 };
  }, []);

  return {
    geocodeAddress: geocodeAddressCallback,
    obterCoordenadasAproximadasPorCEP,
  };
}
