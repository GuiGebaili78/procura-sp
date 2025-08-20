import axios from "axios";
import { API_ENDPOINTS } from "../utils/constants";
import { CataBagulhoResult } from "../types/cataBagulho";

const instance = axios.create({
  baseURL: API_ENDPOINTS.BACKEND_BASE,
  timeout: 15000,
});

export async function searchCataBagulho(lat: number, lng: number): Promise<CataBagulhoResult[]> {
  try {
    const { data } = await instance.get('/cata-bagulho', {
      params: { lat, lng }
    });
    // A resposta do backend já vem com um objeto { data: [...] }, vamos retornar o array interno.
    return data.data || [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Erro ao buscar o serviço Cata-Bagulho.");
    }
    throw new Error("Erro de conexão com o servidor para buscar o serviço.");
  }
}