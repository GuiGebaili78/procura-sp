import { API_ENDPOINTS } from "../utils/constants";
import { CataBagulhoResult } from "../types/cataBagulho";

export async function searchCataBagulho(
  lat: number,
  lng: number,
): Promise<CataBagulhoResult[]> {
  try {
    console.log(`🔍 [searchCataBagulho] Buscando cata-bagulho para: lat=${lat}, lng=${lng}`);
    
    const url = `${API_ENDPOINTS.BACKEND_BASE}/cata-bagulho?lat=${lat}&lng=${lng}`;
    console.log(`🔗 [searchCataBagulho] URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ [searchCataBagulho] Resposta da API:`, data);
    
    // Exibe aviso se estamos usando dados de demonstração
    if (data.warning) {
      console.warn(`⚠️ [searchCataBagulho] ${data.warning}`);
    }
    
    // A resposta do backend já vem com um objeto { data: [...] }, vamos retornar o array interno.
    if (data.success && data.data) {
      console.log(`📊 [searchCataBagulho] ${data.data.length} resultados encontrados`);
      return data.data;
    }
    
    console.log(`⚠️ [searchCataBagulho] Nenhum resultado encontrado`);
    return [];
  } catch (error) {
    console.error("❌ [searchCataBagulho] Erro ao buscar cata-bagulho:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Erro inesperado ao buscar o serviço.");
  }
}
