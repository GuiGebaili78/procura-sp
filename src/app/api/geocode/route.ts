import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

class GeocodeService {
  private readonly NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

  public async getCoordinatesFromAddress(query: string): Promise<NominatimResult[]> {
    console.log(`[GeocodeService] Buscando coordenadas para: "${query}"`);
    
    try {
      const { data } = await axios.get<NominatimResult[]>(this.NOMINATIM_URL, {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          countrycodes: 'br',
          addressdetails: 1,
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Procura-SP/1.0.0',
        },
      });

      if (!data || data.length === 0) {
        throw new Error("Endereço não encontrado");
      }

      console.log(`✅ [GeocodeService] Encontrados ${data.length} resultados para: "${query}"`);
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("Endereço não encontrado");
        }
        throw new Error("Falha na conexão com o serviço de geocodificação");
      }
      throw new Error(error.message || "Erro ao geocodificar endereço");
    }
  }
}

const geocodeService = new GeocodeService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { success: false, message: "Parâmetro 'q' (query) é obrigatório" },
        { status: 400 }
      );
    }

    const data = await geocodeService.getCoordinatesFromAddress(query);
    
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("[API:Geocode] Erro:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erro ao geocodificar endereço" },
      { status: 500 }
    );
  }
}
