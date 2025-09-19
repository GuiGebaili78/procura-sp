import { NextRequest, NextResponse } from "next/server";
import { feirasLocalService } from "@/lib/services/feirasLocal.service";

/**
 * API de feiras livres
 * Usa exclusivamente dados locais do arquivo feira-livre.json
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros de busca
    const endereco = searchParams.get("endereco");
    const bairro = searchParams.get("bairro");
    const diaSemana = searchParams.get("diaSemana");
    const categoria = searchParams.get("categoria");
    const subPrefeitura = searchParams.get("subPrefeitura");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const raio = searchParams.get("raio");
    const estatisticas = searchParams.get("estatisticas");

    // Se solicitou estatísticas, retornar apenas elas
    if (estatisticas === "true") {
      const stats = feirasLocalService.getEstatisticas();
      return NextResponse.json({
        success: true,
        data: stats,
        source: "dados_locais"
      });
    }

    // Busca por coordenadas (proximidade)
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const raioKm = raio ? parseFloat(raio) : 5;

      if (isNaN(latitude) || isNaN(longitude) || isNaN(raioKm)) {
        return NextResponse.json(
          { success: false, message: "Coordenadas ou raio inválidos" },
          { status: 400 }
        );
      }

      const resultado = await feirasLocalService.buscarProximas(latitude, longitude, raioKm);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca por endereço
    if (endereco) {
      const resultado = await feirasLocalService.buscarPorEndereco(endereco);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca por bairro
    if (bairro) {
      const resultado = await feirasLocalService.buscarPorBairro(bairro);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca por dia da semana
    if (diaSemana) {
      const resultado = await feirasLocalService.buscarPorDiaSemana(diaSemana);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca por categoria
    if (categoria) {
      const resultado = await feirasLocalService.buscarPorCategoria(categoria);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca por sub-prefeitura
    if (subPrefeitura) {
      const resultado = await feirasLocalService.buscarPorSubPrefeitura(subPrefeitura);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca geral com múltiplos filtros
    const resultado = await feirasLocalService.buscar({
      endereco: endereco || undefined,
      bairro: bairro || undefined,
      diaSemana: diaSemana || undefined,
      categoria: categoria || undefined,
      subPrefeitura: subPrefeitura || undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      raio: raio ? parseFloat(raio) : undefined
    });

    return NextResponse.json({
      success: true,
      data: resultado,
      source: "dados_locais"
    });

  } catch (error: unknown) {
    console.error("[API:Feiras] Erro:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}

/**
 * POST para buscas mais complexas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endereco, bairro, diaSemana, categoria, subPrefeitura, lat, lng, raio } = body;

    const resultado = await feirasLocalService.buscar({
      endereco,
      bairro,
      diaSemana,
      categoria,
      subPrefeitura,
      lat,
      lng,
      raio
    });

    return NextResponse.json({
      success: true,
      data: resultado,
      source: "dados_locais"
    });

  } catch (error: unknown) {
    console.error("[API:Feiras] Erro:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
