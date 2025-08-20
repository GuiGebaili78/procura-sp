import axios from "axios";
import { API_ENDPOINTS } from "../utils/constants";
import { ViaCepResponse } from "../types/location";

const BACKEND_API_URL = API_ENDPOINTS.BACKEND_BASE;

/**
 * Busca as informações de um CEP através do nosso backend.
 * O backend gerencia o cache e a chamada para a API externa do ViaCEP.
 * @param cep O CEP a ser buscado (apenas dígitos).
 * @returns Os dados do endereço.
 */
export async function fetchCep(cep: string): Promise<ViaCepResponse> {
  const normalizedCep = cep.replace(/\D/g, "");

  if (normalizedCep.length !== 8) {
    throw new Error("CEP inválido. Forneça 8 dígitos numéricos.");
  }

  try {
    // A requisição é feita para a rota do nosso próprio backend
    const response = await axios.get(`${BACKEND_API_URL}/cep/${normalizedCep}`);
    
    // A resposta do backend já vem com a estrutura { success, data, meta }
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Ocorreu um erro no servidor.");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Repassa a mensagem de erro específica do backend para o frontend
      throw new Error(error.response.data.message || "Não foi possível buscar o CEP.");
    }
    // Erro genérico de conexão
    throw new Error("Falha de conexão com o servidor.");
  }
}