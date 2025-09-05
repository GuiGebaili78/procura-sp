import axios from "axios";
import { API_ENDPOINTS } from "../utils/constants";
import { TrechoCoordinates } from "../types/cataBagulho";

const instance = axios.create({
  baseURL: API_ENDPOINTS.BACKEND_BASE,
  timeout: 15000,
});

export async function fetchTrechoCoordinates(
  trechoId: string,
): Promise<TrechoCoordinates> {
  try {
    console.log(`[Frontend] Buscando coordenadas do trecho: ${trechoId}`);

    const { data } = await instance.get(`/trecho/${trechoId}`);

    if (data && data.success) {
      return data.data;
    } else {
      throw new Error(
        data.message || "Erro retornado pelo backend ao buscar trecho.",
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        "Erro na busca do trecho (resposta do backend):",
        error.response.data,
      );
      throw new Error(
        error.response.data.message ||
          "Não foi possível obter as coordenadas do trecho.",
      );
    }
    console.error("Erro de conexão na busca do trecho:", error);
    throw new Error("Erro de conexão com o servidor para buscar trecho.");
  }
}
