import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface TrechoCoordinates {
  cd_mapa: string;
  coordinates: Array<{ lat: number; lng: number }>;
  resultado: number;
}

class TrechoService {
  private readonly TRECHO_URL =
    "https://locatsp.saclimpeza2.com.br/mapa/index-acoes.php";

  public async getTrechoCoordinates(
    trechoId: string,
  ): Promise<TrechoCoordinates> {
    console.log(`[Trecho] Buscando coordenadas do trecho: ${trechoId}`);

    try {
      const response = await axios.get(this.TRECHO_URL, {
        params: {
          acao: "ver-trecho",
          trecho: trechoId,
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      if (response.data && response.data.resultado === 1) {
        const coordinates = this.parseCoordinatesString(
          response.data.coordenadas,
        );

        return {
          cd_mapa: response.data.cd_mapa,
          coordinates,
          resultado: response.data.resultado,
        };
      } else {
        throw new Error("Trecho não encontrado ou dados inválidos");
      }
    } catch (error: unknown) {
      console.error("[Trecho] Erro ao buscar coordenadas do trecho:", error);
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar trecho: ${error.message}`);
      }
      throw new Error("Erro desconhecido ao buscar trecho");
    }
  }

  private parseCoordinatesString(
    coordenadasString: string,
  ): Array<{ lat: number; lng: number }> {
    if (!coordenadasString) {
      return [];
    }

    const cleanString = coordenadasString.replace(/;$/, "");
    const coordinatePairs = cleanString.split(";");

    return coordinatePairs
      .filter((pair) => pair.trim() !== "")
      .map((pair) => {
        const [lng, lat] = pair
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        if (isNaN(lat) || isNaN(lng)) {
          throw new Error(`Coordenada inválida: ${pair}`);
        }
        return { lat, lng };
      });
  }
}

const trechoService = new TrechoService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID do trecho é obrigatório" },
        { status: 400 },
      );
    }

    const data = await trechoService.getTrechoCoordinates(id);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error(
      "[API:Trecho] Erro:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar coordenadas do trecho",
      },
      { status: 500 },
    );
  }
}
