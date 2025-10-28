import { API_ENDPOINTS } from "../utils/constants";
import { ViaCepResponse } from "../types/location";

const BACKEND_API_URL = API_ENDPOINTS.BACKEND_BASE;

/**
 * Busca as informações de um CEP através do nosso backend.
 * O backend gerencia o cache e a chamada para a API externa do ViaCEP.
 * @param cep O CEP a ser buscado (apenas dígitos).
 * @param numero O número do endereço (opcional).
 * @returns Os dados do endereço.
 */
export async function fetchCep(cep: string, numero?: string): Promise<ViaCepResponse> {
  const normalizedCep = cep.replace(/\D/g, "");

  if (normalizedCep.length !== 8) {
    throw new Error("CEP inválido. Forneça 8 dígitos numéricos.");
  }

  try {
    // Usar a nova API /api/viacep que retorna coordenadas reais
    const url = `${BACKEND_API_URL}/viacep?cep=${normalizedCep}`;
    
    console.log(`🔍 [fetchCep] Buscando CEP: ${normalizedCep} em ${url}`);
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    console.log(`✅ [fetchCep] Resposta recebida:`, data);

    // A resposta da nova API vem com a estrutura { success, endereco, coordenadas, fonte }
    if (data && data.success) {
      return {
        cep: data.endereco.cep,
        logradouro: data.endereco.logradouro,
        bairro: data.endereco.bairro,
        localidade: data.endereco.localidade,
        uf: data.endereco.uf,
        latitude: data.coordenadas?.lat,
        longitude: data.coordenadas?.lng,
        numero: numero || undefined
      };
    } else {
      throw new Error(data.error || "Ocorreu um erro ao buscar o CEP.");
    }
  } catch (error) {
    console.error("❌ [fetchCep] Erro:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    // Erro genérico
    throw new Error("Falha ao buscar o CEP. Verifique sua conexão.");
  }
}
