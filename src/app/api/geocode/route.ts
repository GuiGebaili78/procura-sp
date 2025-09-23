import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { NominatimResult } from "../../../types/api";

class GeocodeService {
  private readonly NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

  public async getCoordinatesFromAddress(
    query: string,
  ): Promise<NominatimResult[]> {
    console.log(`[GeocodeService] Buscando coordenadas para: "${query}"`);

    try {
      const { data } = await axios.get<NominatimResult[]>(this.NOMINATIM_URL, {
        params: {
          q: query,
          format: "json",
          limit: 5,
          countrycodes: "br",
          addressdetails: 1,
        },
        timeout: 10000,
        headers: {
          "User-Agent": "Procura-SP/1.0.0",
        },
      });

      if (!data || data.length === 0) {
        throw new Error("Endereço não encontrado");
      }

      console.log(
        `✅ [GeocodeService] Encontrados ${data.length} resultados para: "${query}"`,
      );
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("Endereço não encontrado");
        }
        throw new Error("Falha na conexão com o serviço de geocodificação");
      }
      throw new Error(
        error instanceof Error
          ? error.message
          : "Erro ao geocodificar endereço",
      );
    }
  }

  /**
   * Busca coordenadas para um endereço específico em São Paulo
   * @param endereco Endereço completo
   * @param bairro Bairro (opcional)
   * @param cidade Cidade (padrão: São Paulo)
   * @returns Coordenadas ou null se não encontrar
   */
  public async getCoordinatesForSaoPauloAddress(
    endereco: string,
    bairro?: string,
    cidade: string = "São Paulo"
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      console.log(`🔍 [GeocodeService] Buscando coordenadas para: "${endereco}" em ${bairro || cidade}`);
      
      // Construir query otimizada para São Paulo
      let query = endereco;
      if (bairro) {
        query += `, ${bairro}`;
      }
      query += `, ${cidade}, SP, Brasil`;
      
      console.log(`📍 [GeocodeService] Query construída: "${query}"`);
      
      const { data } = await axios.get<NominatimResult[]>(this.NOMINATIM_URL, {
        params: {
          q: query,
          format: "json",
          limit: 3,
          countrycodes: "br",
          addressdetails: 1,
          bounded: 1,
          viewbox: "-46.9,-23.8,-46.3,-23.35", // Bounding box de São Paulo
        },
        timeout: 10000,
        headers: {
          "User-Agent": "Procura-SP/1.0.0",
        },
      });

      if (!data || data.length === 0) {
        console.log(`⚠️ [GeocodeService] Nenhum resultado encontrado para: "${query}"`);
        return null;
      }

      // Filtrar resultados que estão em São Paulo
      const resultadosSP = data.filter(resultado => {
        const address = resultado.address;
        return address?.city?.toLowerCase().includes('são paulo') || 
               address?.municipality?.toLowerCase().includes('são paulo') ||
               address?.state?.toLowerCase().includes('são paulo');
      });

      if (resultadosSP.length === 0) {
        console.log(`⚠️ [GeocodeService] Nenhum resultado em São Paulo para: "${query}"`);
        return null;
      }

      // Usar o primeiro resultado válido
      const melhorResultado = resultadosSP[0];
      const coordenadas = {
        lat: parseFloat(melhorResultado.lat),
        lng: parseFloat(melhorResultado.lon)
      };

      console.log(`✅ [GeocodeService] Coordenadas encontradas: ${coordenadas.lat}, ${coordenadas.lng}`);
      return coordenadas;
      
    } catch (error: unknown) {
      console.error(`❌ [GeocodeService] Erro ao buscar coordenadas:`, error);
      return null;
    }
  }

  /**
   * Busca coordenadas usando CEP
   * @param cep CEP no formato 00000-000
   * @returns Coordenadas ou null se não encontrar
   */
  public async getCoordinatesFromCep(cep: string): Promise<{ lat: number; lng: number } | null> {
    try {
      console.log(`🔍 [GeocodeService] Buscando coordenadas para CEP: ${cep}`);
      
      const query = `${cep}, São Paulo, SP, Brasil`;
      
      const { data } = await axios.get<NominatimResult[]>(this.NOMINATIM_URL, {
        params: {
          q: query,
          format: "json",
          limit: 1,
          countrycodes: "br",
          addressdetails: 1,
        },
        timeout: 10000,
        headers: {
          "User-Agent": "Procura-SP/1.0.0",
        },
      });

      if (!data || data.length === 0) {
        console.log(`⚠️ [GeocodeService] Nenhum resultado encontrado para CEP: ${cep}`);
        return null;
      }

      const resultado = data[0];
      const coordenadas = {
        lat: parseFloat(resultado.lat),
        lng: parseFloat(resultado.lon)
      };

      console.log(`✅ [GeocodeService] Coordenadas encontradas para CEP ${cep}: ${coordenadas.lat}, ${coordenadas.lng}`);
      return coordenadas;
      
    } catch (error: unknown) {
      console.error(`❌ [GeocodeService] Erro ao buscar coordenadas por CEP:`, error);
      return null;
    }
  }
}

const geocodeService = new GeocodeService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Parâmetro 'q' (query) é obrigatório" },
        { status: 400 },
      );
    }

    const data = await geocodeService.getCoordinatesFromAddress(query);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error(
      "[API:Geocode] Erro:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erro ao geocodificar endereço",
      },
      { status: 500 },
    );
  }
}
