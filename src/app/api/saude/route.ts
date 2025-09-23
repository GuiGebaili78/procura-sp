import { NextRequest, NextResponse } from "next/server";
import { saudeLocalService } from "@/lib/services/saudeLocal.service";

/**
 * API de estabelecimentos de saúde
 * Usa exclusivamente dados locais do arquivo estabelecimentos-saude.json
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros de busca
    const endereco = searchParams.get("endereco");
    const unidade = searchParams.get("unidade");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const raio = searchParams.get("raio");
    const tipo = searchParams.get("tipo");
    const regiao = searchParams.get("regiao");
    const administracao = searchParams.get("administracao");
    const categorias = searchParams.get("categorias");
    const estatisticas = searchParams.get("estatisticas");

    // Se solicitou estatísticas, retornar apenas elas
    if (estatisticas === "true") {
      const stats = saudeLocalService.getEstatisticas();
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

      const resultado = await saudeLocalService.buscarProximos(latitude, longitude, raioKm);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca por endereço
    if (endereco) {
      const resultado = await saudeLocalService.buscarPorEndereco(endereco);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca por unidade
    if (unidade) {
      const resultado = await saudeLocalService.buscarPorUnidade(unidade);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca por tipo
    if (tipo) {
      const resultado = await saudeLocalService.buscarPorTipo(tipo);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca por região
    if (regiao) {
      const resultado = await saudeLocalService.buscarPorRegiao(regiao);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca por administração
    if (administracao) {
      const resultado = await saudeLocalService.buscarPorAdministracao(administracao);
      return NextResponse.json({
        success: true,
        data: resultado,
        source: "dados_locais"
      });
    }

    // Busca geral com múltiplos filtros
    const resultado = await saudeLocalService.buscar({
      endereco: endereco || undefined,
      unidade: unidade || undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      raio: raio ? parseFloat(raio) : undefined,
      tipo: tipo || undefined,
      regiao: regiao || undefined,
      administracao: administracao || undefined,
      categorias: categorias ? categorias.split(',') : undefined
    });

    return NextResponse.json({
      success: true,
      data: resultado,
      source: "dados_locais"
    });

  } catch (error: unknown) {
    console.error("[API:Saude] Erro:", error instanceof Error ? error.message : error);
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
    const { endereco, unidade, lat, lng, raio, tipo, regiao, administracao, categorias } = body;

    const resultado = await saudeLocalService.buscar({
      endereco,
      unidade,
      lat,
      lng,
      raio,
      tipo,
      regiao,
      administracao,
      categorias
    });

    return NextResponse.json({
      success: true,
      data: resultado,
      source: "dados_locais"
    });

  } catch (error: unknown) {
    console.error("[API:Saude] Erro:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}