import axios from "axios";
import { API_ENDPOINTS } from "../utils/constants";
import { CataBagulhoResult } from "../types/cataBagulho";

const instance = axios.create({
  baseURL: API_ENDPOINTS.BACKEND_BASE,
  timeout: 15000,
});

export async function searchCataBagulho(
  lat: number,
  lng: number,
): Promise<CataBagulhoResult[]> {
  try {
    console.log(`[Frontend] Buscando cata-bagulho para: lat=${lat}, lng=${lng}`);
    
    const { data } = await instance.get("/cata-bagulho", {
      params: { lat, lng },
    });
    
    console.log(`[Frontend] Resposta da API:`, data);
    
    // Exibe aviso se estamos usando dados de demonstração
    if (data.warning) {
      console.warn(`[Frontend] ${data.warning}`);
    }
    
    // A resposta do backend já vem com um objeto { data: [...] }, vamos retornar o array interno.
    if (data.success && data.data) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error("[Frontend] Erro ao buscar cata-bagulho:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Erro de resposta do servidor
        const errorMessage = error.response.data?.message || error.response.data?.error || "Erro no servidor";
        throw new Error(`Erro do servidor: ${errorMessage}`);
      } else if (error.request) {
        // Requisição foi feita mas não houve resposta
        throw new Error("Servidor não está respondendo. Verifique sua conexão.");
      } else {
        // Erro na configuração da requisição
        throw new Error(`Erro de configuração: ${error.message}`);
      }
    }
    
    throw new Error("Erro inesperado ao buscar o serviço.");
  }
}
