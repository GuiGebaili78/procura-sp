// --- Caminho: frontend/src/services/nominatim.ts ---
import axios from "axios";
import { API_ENDPOINTS } from "../utils/constants";
import { NominatimResult } from "../types/api";

const instance = axios.create({
  baseURL: API_ENDPOINTS.BACKEND_BASE,
  timeout: 15000,
});

export async function geocodeAddress(
  query: string,
): Promise<NominatimResult[]> {
  console.log(`[Frontend] Chamando backend para geocodificar: "${query}"`);

  try {
    // Primeiro tenta usar o backend
    const { data } = await instance.get("/geocode", {
      params: { q: query },
    });

    if (data && data.success) {
      // A resposta do backend já vem com { success: true, data: [...] }
      return data.data || [];
    } else {
      throw new Error(
        data.message || "Erro retornado pelo backend de geocodificação.",
      );
    }
  } catch (backendError) {
    console.warn(
      "Backend de geocodificação falhou, tentando API direta:",
      backendError,
    );

    // Fallback: chama a API do Nominatim diretamente
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
          timeout: 10000,
          headers: {
            "User-Agent": "Procura-SP/1.0",
          },
        },
      );

      if (directResponse.data && Array.isArray(directResponse.data)) {
        console.log("Sucesso com API direta do Nominatim");
        return directResponse.data;
      } else {
        throw new Error("Resposta inválida da API de geocodificação");
      }
    } catch (directError) {
      console.error("Erro na API direta do Nominatim:", directError);
      throw new Error(
        "Endereço não encontrado ou não foi possível geocodificar.",
      );
    }
  }
}
