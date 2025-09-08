// --- Caminho: frontend/src/services/nominatim.ts ---
import axios from "axios";
import { NominatimResult } from "../types/api";

export async function geocodeAddress(
  query: string,
): Promise<NominatimResult[]> {
  console.log(`[Frontend] Geocodificando endereço: "${query}"`);

  // Usar apenas API direta do Nominatim (backend /api/geocode não existe)
  try {
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

    if (directResponse.data && Array.isArray(directResponse.data)) {
      console.log("✅ Geocodificação bem-sucedida com Nominatim");
      return directResponse.data;
    } else {
      throw new Error("Resposta inválida da API de geocodificação");
    }
  } catch (error) {
    console.error("❌ Erro na geocodificação:", error);
    throw new Error(
      "Endereço não encontrado ou não foi possível geocodificar.",
    );
  }
}
