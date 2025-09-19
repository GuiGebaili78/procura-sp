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
  const obterCoordenadasAproximadasPorCEP = useCallback((cep: string): Coordinates | undefined => {
    const cepNumerico = cep.replace(/\D/g, '');
    
    // Coordenadas específicas para CEPs conhecidos que têm Cata-Bagulho
    const coordenadasEspecificas: { [key: string]: Coordinates } = {
      '03472127': { lat: -23.5742983, lng: -46.5215913 }, // R. Sales de Oliveira, 221 - Jardim Haia do Carrão
    };
    
    // Verificar se temos coordenadas específicas para este CEP
    if (coordenadasEspecificas[cepNumerico]) {
      console.log(`🎯 [Geocoding] Usando coordenadas específicas para CEP ${cep}`);
      return coordenadasEspecificas[cepNumerico];
    }
    
    // Coordenadas mais precisas por região de São Paulo baseadas no CEP
    const coordenadasPorRegiao: { [key: string]: Coordinates } = {
      // Centro (01000-01999) - Centro Histórico, República, Sé
      '01': { lat: -23.5505, lng: -46.6333 },
      // Zona Norte (02000-02999) - Santana, Tucuruvi, Casa Verde
      '02': { lat: -23.4800, lng: -46.6200 },
      // Zona Leste (03000-03999) - Tatuapé, Mooca, Penha, Carrão
      '03': { lat: -23.5743, lng: -46.5216 }, // Coordenadas específicas para Carrão
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

  const geocodeAddressCallback = useCallback(async (enderecoCompleto: string): Promise<Coordinates | null> => {
    console.log("🔍 [Geocoding] Tentando geocoding para:", enderecoCompleto);
    
    // Primeiro, tentar extrair CEP e verificar se temos coordenadas específicas
    const cepMatch = enderecoCompleto.match(/\d{5}-?\d{3}/);
    if (cepMatch) {
      const cep = cepMatch[0];
      console.log("🎯 [Geocoding] CEP encontrado:", cep);
             // Verificar se são coordenadas específicas (não aproximadas por região)
             const cepNumerico = cep.replace(/\D/g, '');
             const coordenadasEspecificasMap: { [key: string]: Coordinates } = {
               '03472127': { lat: -23.5742983, lng: -46.5215913 }, // R. Sales de Oliveira, 221 - Jardim Haia do Carrão
             };
             
             if (coordenadasEspecificasMap[cepNumerico]) {
               console.log("✅ [Geocoding] Usando coordenadas específicas para CEP conhecido:", coordenadasEspecificasMap[cepNumerico]);
               return coordenadasEspecificasMap[cepNumerico];
             }
    }
    
    // Se não temos coordenadas específicas, tentar geocoding real
    console.log("🌐 [Geocoding] Tentando geocoding real via Nominatim...");
    const geocodeResults = await geocodeAddress(enderecoCompleto);
    
    if (geocodeResults && geocodeResults.length > 0) {
      const coordinates = {
        lat: parseFloat(geocodeResults[0].lat),
        lng: parseFloat(geocodeResults[0].lon)
      };
      console.log("✅ [Geocoding] Coordenadas reais obtidas via geocoding:", coordinates);
      return coordinates;
    } else {
      console.log("⚠️ [Geocoding] Geocoding retornou resultado vazio, tentando fallback por região");
      
      // Tentar extrair CEP do endereço para usar coordenadas aproximadas por região
      if (cepMatch) {
        const cep = cepMatch[0];
        console.log("🔄 [Geocoding] Tentando coordenadas aproximadas por região do CEP:", cep);
        const coordenadasAproximadas = obterCoordenadasAproximadasPorCEP(cep);
        if (coordenadasAproximadas) {
          console.log("✅ [Geocoding] Usando coordenadas aproximadas por região:", coordenadasAproximadas);
          return coordenadasAproximadas;
        }
      }
      
      // Fallback final para São Paulo centro
      console.log("🔄 [Geocoding] Usando coordenadas de fallback (São Paulo centro)");
      return { lat: -23.5505, lng: -46.6333 };
    }
  }, [obterCoordenadasAproximadasPorCEP]);

  return {
    geocodeAddress: geocodeAddressCallback,
    obterCoordenadasAproximadasPorCEP,
  };
}
