import { useCallback } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseGeocodingReturn {
  geocodeAddress: (enderecoCompleto: string, cep?: string, numero?: string) => Promise<Coordinates | null>;
  obterCoordenadasAproximadasPorCEP: (cep: string) => Coordinates | undefined;
}

export function useGeocoding(): UseGeocodingReturn {
  const obterCoordenadasAproximadasPorCEP = useCallback((cep: string): Coordinates | undefined => {
    const cepNumerico = cep.replace(/\D/g, '');
    
    // Coordenadas específicas para CEPs conhecidos (PRIORITÁRIAS)
    const coordenadasEspecificas: { [key: string]: Coordinates } = {
      '03472127': { lat: -23.5742983, lng: -46.5215913 }, // R. Sales de Oliveira, 221 - Jardim Haia do Carrão
      '04284020': { lat: -23.6066347, lng: -46.6018006 }, // Rua Ateneu, 22 - Vila Moinho Velho
      '01310100': { lat: -23.5613, lng: -46.6565 }, // Av. Paulista
      '01000000': { lat: -23.5505, lng: -46.6333 }, // Centro - Praça da Sé
      '01234000': { lat: -23.5505, lng: -46.6333 }, // Centro
      '02000000': { lat: -23.4800, lng: -46.6200 }, // Zona Norte
      '03000000': { lat: -23.5743, lng: -46.5216 }, // Zona Leste
      '04000000': { lat: -23.6000, lng: -46.6500 }, // Zona Sul
      '05000000': { lat: -23.5500, lng: -46.7200 }, // Zona Oeste
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

  const geocodeAddressCallback = useCallback(async (enderecoCompleto: string, cep?: string, numero?: string): Promise<Coordinates | null> => {
    console.log("🔍 [Geocoding] Processando endereço:", enderecoCompleto);
    console.log("🔍 [Geocoding] CEP fornecido:", cep);
    console.log("🔍 [Geocoding] Número fornecido:", numero);
    
    // Se CEP foi fornecido diretamente, usar ele
    if (cep) {
      console.log("🎯 [Geocoding] Usando CEP fornecido diretamente:", cep);
      
      try {
        // SEMPRE usar a API de CEP que inclui geocoding
        const apiUrl = `/api/cep/${cep.replace(/\D/g, '')}${numero ? `?numero=${numero}` : ''}`;
        console.log("🌐 [Geocoding] Chamando API:", apiUrl);
        
        const response = await fetch(apiUrl);
        console.log("📡 [Geocoding] Resposta da API:", response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("📊 [Geocoding] Dados recebidos:", data);
        
        if (data.success && data.data.latitude && data.data.longitude) {
          const coordinates = {
            lat: data.data.latitude,
            lng: data.data.longitude
          };
          console.log("✅ [Geocoding] Coordenadas obtidas da API:", coordinates);
          return coordinates;
        } else {
          console.warn("⚠️ [Geocoding] API não retornou coordenadas válidas:", data);
        }
      } catch (error) {
        console.error("❌ [Geocoding] Erro ao buscar coordenadas via API de CEP:", error);
      }
      
      // Fallback para coordenadas aproximadas por CEP apenas se a API falhar
      const coordenadasAproximadas = obterCoordenadasAproximadasPorCEP(cep);
      if (coordenadasAproximadas) {
        console.log("✅ [Geocoding] Usando coordenadas aproximadas por CEP:", coordenadasAproximadas);
        return coordenadasAproximadas;
      }
    }
    
    // Fallback: tentar extrair CEP do endereço
    const cepMatch = enderecoCompleto.match(/(\d{5}-?\d{3})/);
    const numeroMatch = enderecoCompleto.match(/(\d+)/);
    
    console.log("🔍 [Geocoding] CEP match:", cepMatch);
    console.log("🔍 [Geocoding] Número match:", numeroMatch);
    
    if (cepMatch) {
      const cepExtraido = cepMatch[1];
      const numeroExtraido = numeroMatch ? numeroMatch[1] : null;
      
      console.log("🎯 [Geocoding] CEP extraído:", cepExtraido, "Número:", numeroExtraido);
      
      try {
        // SEMPRE usar a API de CEP que inclui geocoding
        const apiUrl = `/api/cep/${cepExtraido.replace(/\D/g, '')}${numeroExtraido ? `?numero=${numeroExtraido}` : ''}`;
        console.log("🌐 [Geocoding] Chamando API:", apiUrl);
        
        const response = await fetch(apiUrl);
        console.log("📡 [Geocoding] Resposta da API:", response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("📊 [Geocoding] Dados recebidos:", data);
        
        if (data.success && data.data.latitude && data.data.longitude) {
          const coordinates = {
            lat: data.data.latitude,
            lng: data.data.longitude
          };
          console.log("✅ [Geocoding] Coordenadas obtidas da API:", coordinates);
          return coordinates;
        } else {
          console.warn("⚠️ [Geocoding] API não retornou coordenadas válidas:", data);
        }
      } catch (error) {
        console.error("❌ [Geocoding] Erro ao buscar coordenadas via API de CEP:", error);
      }
      
      // Fallback para coordenadas aproximadas por CEP apenas se a API falhar
      const coordenadasAproximadas = obterCoordenadasAproximadasPorCEP(cepExtraido);
      if (coordenadasAproximadas) {
        console.log("✅ [Geocoding] Usando coordenadas aproximadas por CEP:", coordenadasAproximadas);
        return coordenadasAproximadas;
      }
    } else {
      console.warn("⚠️ [Geocoding] Nenhum CEP encontrado no endereço:", enderecoCompleto);
    }
    
    // Fallback final para São Paulo centro
    console.log("🔄 [Geocoding] Usando coordenadas de fallback (São Paulo centro)");
    return { lat: -23.5505, lng: -46.6333 };
  }, [obterCoordenadasAproximadasPorCEP]);

  return {
    geocodeAddress: geocodeAddressCallback,
    obterCoordenadasAproximadasPorCEP,
  };
}
