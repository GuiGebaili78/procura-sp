// --- Caminho: frontend/src/services/nominatim.ts ---
import axios from "axios";
import { NominatimResult } from "../types/api";

export async function geocodeAddress(
  query: string,
): Promise<NominatimResult[]> {
  console.log(`🔍 [Nominatim] Geocodificando endereço: "${query}"`);

  // Usar apenas API direta do Nominatim (backend /api/geocode não existe)
  try {
    console.log(`🌐 [Nominatim] Fazendo requisição para Nominatim...`);
    const directResponse = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          format: "json",
          limit: 5,
          countrycodes: "br",
          addressdetails: 1,
        },
        timeout: 15000,
        headers: {
          "User-Agent": "Procura-SP/1.0",
          "Accept": "application/json",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
        // Configurações para evitar CORS
        withCredentials: false,
      },
    );

    console.log(`📊 [Nominatim] Resposta recebida:`, {
      status: directResponse.status,
      dataLength: directResponse.data?.length || 0,
      hasData: !!directResponse.data
    });

    if (directResponse.data && Array.isArray(directResponse.data)) {
      if (directResponse.data.length > 0) {
        console.log(`✅ [Nominatim] Geocodificação bem-sucedida - ${directResponse.data.length} resultado(s) encontrado(s)`);
        console.log(`📍 [Nominatim] Primeiro resultado:`, {
          display_name: directResponse.data[0].display_name,
          lat: directResponse.data[0].lat,
          lon: directResponse.data[0].lon
        });
        return directResponse.data;
      } else {
        console.log(`⚠️ [Nominatim] Nenhum resultado encontrado para o endereço`);
        throw new Error("Endereço não encontrado");
      }
    } else {
      console.log(`❌ [Nominatim] Resposta inválida da API`);
      throw new Error("Resposta inválida da API de geocodificação");
    }
  } catch (error) {
    console.error("❌ [Nominatim] Erro na geocodificação:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log(`⏰ [Nominatim] Timeout na requisição (15s)`);
        throw new Error("timeout of 15000ms exceeded");
      } else if (error.response?.status === 404) {
        console.log(`📍 [Nominatim] Endereço não encontrado (404)`);
        throw new Error("Endereço não encontrado");
      } else if (error.response?.status) {
        console.log(`🚫 [Nominatim] Erro HTTP ${error.response.status}`);
        throw new Error(`Erro HTTP ${error.response.status}`);
      }
    }
    
    throw new Error(
      "Endereço não encontrado ou não foi possível geocodificar.",
    );
  }
}
