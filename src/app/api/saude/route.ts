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
    const { endereco, unidade, lat, lng, latitude, longitude, raio, tipo, regiao, administracao, categorias, filtros } = body;

    // Usar lat/lng ou latitude/longitude (compatibilidade)
    const coordLat = lat || latitude;
    const coordLng = lng || longitude;

    console.log('[API:Saude] Buscando estabelecimentos:', { lat: coordLat, lng: coordLng, raio, filtros });

    // Se houver filtros, converter para tipos
    let tiposParaBuscar = categorias;
    if (filtros) {
      const { filtrosParaTipos, filtrarPorEsferaAdministrativa } = await import('@/utils/saude-categorias');
      tiposParaBuscar = filtrosParaTipos(filtros);
      console.log('[API:Saude] 🔍 Tipos filtrados:', tiposParaBuscar);
      console.log('[API:Saude] 🔍 Filtros:', filtros);
      
      // Se nenhum tipo está selecionado, retornar array vazio imediatamente
      if (!tiposParaBuscar || tiposParaBuscar.length === 0) {
        console.log('[API:Saude] ⚠️ Nenhum tipo selecionado, retornando array vazio');
        return NextResponse.json({
          success: true,
          estabelecimentos: [],
          total: 0,
          source: "dados_locais"
        });
      }
      
      // Buscar estabelecimentos filtrando por tipos
      let todosEstabelecimentos = saudeLocalService.getTodosEstabelecimentos();
      console.log('[API:Saude] 📊 Total de estabelecimentos no JSON:', todosEstabelecimentos.length);
      
      // Filtrar por tipos
      todosEstabelecimentos = todosEstabelecimentos.filter(est => 
        tiposParaBuscar.includes(est.tipo)
      );
      console.log('[API:Saude] 📊 Após filtro por tipo:', todosEstabelecimentos.length);
      
      // Filtrar por coordenadas e raio se especificado
      if (coordLat && coordLng) {
        const { haversineDistance } = await import('@/utils/helpers');
        // haversineDistance retorna em METROS, então precisamos comparar em metros
        const raioMetros = raio ? raio : 5000; // 5km = 5000m (padrão)
        console.log('[API:Saude] 📍 Raio de busca:', raioMetros, 'metros (', raioMetros/1000, 'km)');
        
        todosEstabelecimentos = todosEstabelecimentos
          .filter(est => est.latitude && est.longitude)
          .map(est => ({
            ...est,
            distancia: haversineDistance(coordLat, coordLng, est.latitude!, est.longitude!)
          }))
          .filter(est => est.distancia && est.distancia <= raioMetros)
          .sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
        
        console.log('[API:Saude] 📊 Após filtro por raio:', todosEstabelecimentos.length);
        if (todosEstabelecimentos.length > 0) {
          console.log('[API:Saude] 📏 Distâncias:', todosEstabelecimentos.slice(0, 3).map(e => ({
            nome: e.nome,
            distancia: Math.round(e.distancia || 0) + 'm'
          })));
        }
      }
      
      const resultado = {
        estabelecimentos: todosEstabelecimentos,
        total: todosEstabelecimentos.length,
        enderecoBuscado: `${coordLat}, ${coordLng}`,
        dataConsulta: new Date().toISOString(),
        source: 'dados_locais'
      };

      // Aplicar filtro de esfera administrativa
      console.log('[API:Saude] 🏛️ Filtros de esfera:', {
        municipal: filtros.municipal,
        estadual: filtros.estadual,
        privado: filtros.privado
      });
      
      const estabelecimentosFiltrados = resultado.estabelecimentos.filter(est => 
        filtrarPorEsferaAdministrativa(filtros, est.administracao)
      );

      console.log(`[API:Saude] ✅ Encontrados ${estabelecimentosFiltrados.length} estabelecimentos após filtros de esfera`);
      
      // Debug: mostrar alguns exemplos de administração
      if (estabelecimentosFiltrados.length === 0 && resultado.estabelecimentos.length > 0) {
        console.log('[API:Saude] ⚠️ AVISO: Filtro de esfera administrativa rejeitou todos os estabelecimentos!');
        const exemploAdmin = Array.from(new Set(resultado.estabelecimentos.slice(0, 10).map(e => e.administracao)));
        console.log('[API:Saude] 📋 Tipos de administração nos dados filtrados:', exemploAdmin);
      }
      
      // Debug: mostrar distribuição por esfera
      if (estabelecimentosFiltrados.length > 0) {
        const distribuicao = estabelecimentosFiltrados.reduce((acc, est) => {
          const admin = est.administracao || 'Não informado';
          acc[admin] = (acc[admin] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('[API:Saude] 📊 Distribuição por esfera:', distribuicao);
      }

      // Retornar no formato que o SearchBar espera
      return NextResponse.json({
        success: true,
        estabelecimentos: estabelecimentosFiltrados,
        total: estabelecimentosFiltrados.length,
        source: "dados_locais"
      });
    } else {
      // Busca sem filtros (modo legado)
      const resultado = await saudeLocalService.buscar({
        endereco,
        unidade,
        lat: coordLat,
        lng: coordLng,
        raio: raio ? raio / 1000 : 5,
        tipo,
        regiao,
        administracao,
        categorias: tiposParaBuscar
      });

      console.log(`[API:Saude] Encontrados ${resultado.estabelecimentos.length} estabelecimentos`);

      return NextResponse.json({
        success: true,
        estabelecimentos: resultado.estabelecimentos,
        total: resultado.total,
        source: "dados_locais"
      });
    }

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