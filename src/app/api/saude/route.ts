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

    // Se solicitou tipos únicos
    const tipos = searchParams.get("tipos");
    if (tipos === "true") {
      const todosTipos = saudeLocalService.getTodosTipos();
      return NextResponse.json({
        success: true,
        tipos: todosTipos,
        source: "dados_locais"
      });
    }

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

    // Garantir que filtros existe e é um objeto válido
    const filtrosValidos = filtros && typeof filtros === 'object' ? filtros : {};
    
    // Se houver filtros, converter para tipos
    let tiposParaBuscar = categorias || [];
    
    if (filtrosValidos && Object.keys(filtrosValidos).length > 0) {
      // Se houver tipos diretos (do novo sistema de numeração), usar eles
      const filtrosComTipos = filtrosValidos as Record<string, unknown> & { __tiposDiretos?: string[] };
      if (filtrosComTipos.__tiposDiretos && Array.isArray(filtrosComTipos.__tiposDiretos) && filtrosComTipos.__tiposDiretos.length > 0) {
        tiposParaBuscar = filtrosComTipos.__tiposDiretos;
        console.log('[API:Saude] 🔍 Usando tipos diretos dos números:', tiposParaBuscar);
        console.log('[API:Saude] 🔢 Total de tipos diretos:', tiposParaBuscar.length);
      } else {
        // Fallback para o sistema antigo
        try {
          const { filtrosParaTipos } = await import('@/utils/saude-categorias');
          tiposParaBuscar = filtrosParaTipos(filtrosValidos);
          console.log('[API:Saude] 🔍 Tipos filtrados (sistema antigo):', tiposParaBuscar);
          console.log('[API:Saude] ⚠️ Usando sistema antigo - tipos diretos não encontrados');
        } catch (err) {
          console.warn('[API:Saude] ⚠️ Erro ao converter filtros antigos:', err);
          tiposParaBuscar = [];
        }
      }
      console.log('[API:Saude] 🔍 Filtros recebidos:', Object.keys(filtrosValidos).filter(k => (filtrosValidos as Record<string, unknown>)[k] === true));
      
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
      
      // Filtrar por tipos (comparação case-insensitive, trim e normalizando espaços duplos)
      const tiposParaBuscarNormalizados = tiposParaBuscar.map(t => 
        t.toUpperCase().trim().replace(/\s+/g, ' ')
      );
      console.log('[API:Saude] 🔍 Tipos normalizados para buscar:', tiposParaBuscarNormalizados.length, 'tipos');
      if (tiposParaBuscarNormalizados.length <= 5) {
        console.log('[API:Saude] 🔍 Tipos:', tiposParaBuscarNormalizados);
      }
      
      todosEstabelecimentos = todosEstabelecimentos.filter(est => {
        // Normalizar: uppercase, trim, e normalizar espaços múltiplos para espaço simples
        const tipoNormalizado = est.tipo.toUpperCase().trim().replace(/\s+/g, ' ');
        const tipoBuscado = tiposParaBuscarNormalizados.find(tipoBusc => {
          // Comparação exata
          if (tipoBusc === tipoNormalizado) return true;
          // Também tentar comparação sem normalizar espaços (para compatibilidade)
          const tipoBuscSemEspacos = tipoBusc.replace(/\s+/g, ' ');
          const tipoEstSemEspacos = tipoNormalizado.replace(/\s+/g, ' ');
          return tipoBuscSemEspacos === tipoEstSemEspacos;
        });
        return !!tipoBuscado;
      });
      console.log('[API:Saude] 📊 Após filtro por tipo:', todosEstabelecimentos.length);
      
      if (todosEstabelecimentos.length === 0 && tiposParaBuscar.length > 0) {
        console.warn('[API:Saude] ⚠️ Nenhum estabelecimento encontrado! Verificando correspondência...');
        // Verificar se há algum tipo similar
        const primeiroTipoBuscado = tiposParaBuscarNormalizados[0];
        const tiposSimilares = Array.from(new Set(todosEstabelecimentos.map(e => e.tipo.toUpperCase().trim())))
          .filter(t => t.includes(primeiroTipoBuscado.substring(0, 10)) || primeiroTipoBuscado.includes(t.substring(0, 10)));
        if (tiposSimilares.length > 0) {
          console.log('[API:Saude] 💡 Tipos similares encontrados no JSON:', tiposSimilares);
        }
      }
      
      // Filtrar por coordenadas e calcular distâncias (mas não filtrar por raio quando tipos específicos estão selecionados)
      // Quando há tipos selecionados, mostrar TODOS os estabelecimentos, não apenas os próximos
      if (coordLat && coordLng) {
        const { haversineDistance } = await import('@/utils/helpers');
        
        // Calcular distâncias para todos os estabelecimentos
        todosEstabelecimentos = todosEstabelecimentos
          .filter(est => est.latitude && est.longitude)
          .map(est => ({
            ...est,
            distancia: haversineDistance(coordLat, coordLng, est.latitude!, est.longitude!)
          }));
        
        // Se há tipos específicos selecionados, não aplicar filtro de raio (mostrar todos)
        // Apenas ordenar por distância para facilitar visualização
        if (tiposParaBuscar.length > 0) {
          todosEstabelecimentos.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
          console.log('[API:Saude] 📍 Tipos específicos selecionados - mostrando TODOS os estabelecimentos (sem limite de raio)');
          console.log('[API:Saude] 📊 Total de estabelecimentos:', todosEstabelecimentos.length);
        } else {
          // Se não há tipos específicos, aplicar filtro de raio padrão
          const raioMetros = raio ? raio : 5000; // 5km = 5000m (padrão)
          console.log('[API:Saude] 📍 Nenhum tipo específico - aplicando filtro de raio:', raioMetros, 'metros (', raioMetros/1000, 'km)');
          
          todosEstabelecimentos = todosEstabelecimentos
            .filter(est => est.distancia && est.distancia <= raioMetros)
            .sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
          
          console.log('[API:Saude] 📊 Após filtro por raio:', todosEstabelecimentos.length);
        }
        
        if (todosEstabelecimentos.length > 0) {
          console.log('[API:Saude] 📏 Distâncias (primeiros 3):', todosEstabelecimentos.slice(0, 3).map(e => ({
            nome: e.nome,
            distancia: Math.round(e.distancia || 0) + 'm',
            tipo: e.tipo
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
      let estabelecimentosFiltrados = resultado.estabelecimentos;
      
      try {
        const { filtrarPorEsferaAdministrativa: filtrarEsfera } = await import('@/utils/saude-categorias');
        
        // Garantir que filtros existe e tem propriedades padrão
        const filtrosParaEsfera = filtrosValidos && typeof filtrosValidos === 'object' ? filtrosValidos : {
          municipal: true,
          estadual: true,
          privado: true
        };
        
        // Garantir que as propriedades existem
        if (!('municipal' in filtrosParaEsfera)) {
          (filtrosParaEsfera as Record<string, unknown>).municipal = true;
        }
        if (!('estadual' in filtrosParaEsfera)) {
          (filtrosParaEsfera as Record<string, unknown>).estadual = true;
        }
        if (!('privado' in filtrosParaEsfera)) {
          (filtrosParaEsfera as Record<string, unknown>).privado = true;
        }
        
        console.log('[API:Saude] 🏛️ Filtros de esfera:', {
          municipal: (filtrosParaEsfera as Record<string, unknown>).municipal,
          estadual: (filtrosParaEsfera as Record<string, unknown>).estadual,
          privado: (filtrosParaEsfera as Record<string, unknown>).privado
        });
        
        estabelecimentosFiltrados = resultado.estabelecimentos.filter(est => 
          filtrarEsfera(filtrosParaEsfera, est.administracao)
        );
      } catch (err) {
        console.warn('[API:Saude] ⚠️ Erro ao aplicar filtro de esfera administrativa:', err);
        // Continuar sem filtrar por esfera se houver erro
      }

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