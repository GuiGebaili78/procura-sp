import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Função para validar se as coordenadas estão na região de São Paulo
function validarCoordenadasSaoPaulo(coordenadas: { lat: number; lng: number }): boolean {
  // Limites aproximados da Grande São Paulo
  const limitesSP = {
    norte: -22.3,   // Zona Norte
    sul: -24.0,     // Zona Sul  
    leste: -46.2,   // Zona Leste
    oeste: -47.0    // Zona Oeste
  };
  
  const { lat, lng } = coordenadas;
  
  return (
    lat >= limitesSP.sul && 
    lat <= limitesSP.norte && 
    lng >= limitesSP.oeste && 
    lng <= limitesSP.leste
  );
}

// Função para validar coordenadas cruzadas - encontra consenso entre múltiplas fontes
function validarCoordenadasCruzadas(resultados: Array<{coordenadas: {lat: number, lng: number}, fonte: string, estrategia: string}>): {coordenadas: {lat: number, lng: number}, fontes: string[], confiabilidade: string} | null {
  if (resultados.length === 0) return null;
  
  console.log(`🔍 [Validação Cruzada] Analisando ${resultados.length} resultados...`);
  
  // Agrupar coordenadas similares (dentro de um raio de ~100 metros)
  const grupos: Array<{
    coordenadas: {lat: number, lng: number},
    fontes: string[],
    count: number
  }> = [];
  
  for (const resultado of resultados) {
    const { coordenadas, fonte } = resultado;
    
    // Verificar se já existe um grupo próximo
    let grupoEncontrado = false;
    for (const grupo of grupos) {
      const distancia = calcularDistancia(
        coordenadas.lat, coordenadas.lng,
        grupo.coordenadas.lat, grupo.coordenadas.lng
      );
      
      // Se está dentro de ~100 metros, adicionar ao grupo existente
      if (distancia <= 100) {
        grupo.coordenadas.lat = (grupo.coordenadas.lat * grupo.count + coordenadas.lat) / (grupo.count + 1);
        grupo.coordenadas.lng = (grupo.coordenadas.lng * grupo.count + coordenadas.lng) / (grupo.count + 1);
        grupo.fontes.push(fonte);
        grupo.count++;
        grupoEncontrado = true;
        break;
      }
    }
    
    // Se não encontrou grupo próximo, criar novo
    if (!grupoEncontrado) {
      grupos.push({
        coordenadas: { ...coordenadas },
        fontes: [fonte],
        count: 1
      });
    }
  }
  
  console.log(`📊 [Validação Cruzada] Encontrados ${grupos.length} grupos de coordenadas:`);
  grupos.forEach((grupo, index) => {
    console.log(`  Grupo ${index + 1}: ${grupo.coordenadas.lat}, ${grupo.coordenadas.lng} (${grupo.count} fontes: ${grupo.fontes.join(', ')})`);
  });
  
  // Encontrar o grupo com mais fontes (consenso)
  const grupoConsenso = grupos.reduce((prev, current) => 
    current.count > prev.count ? current : prev
  );
  
  // Aceitar se pelo menos 1 fonte encontrou coordenadas válidas
  if (grupoConsenso.count >= 1) {
    const confiabilidade = grupoConsenso.count >= 3 ? 'Alta' : 
                          grupoConsenso.count >= 2 ? 'Média' : 'Baixa';
    console.log(`✅ [Validação Cruzada] Coordenadas encontradas: ${grupoConsenso.count} fonte(s) (${confiabilidade})`);
    
    return {
      coordenadas: grupoConsenso.coordenadas,
      fontes: grupoConsenso.fontes,
      confiabilidade
    };
  }
  
  console.log(`⚠️ [Validação Cruzada] Nenhuma coordenada válida encontrada`);
  return null;
}

// Função para calcular distância entre duas coordenadas (em metros)
function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Função para obter coordenadas aproximadas baseadas no CEP
function obterCoordenadasAproximadasPorCEP(cep: string): { lat: number; lng: number } | null {
  const prefixo = cep.substring(0, 3);
  
  // Coordenadas aproximadas por região de São Paulo baseadas no prefixo do CEP
  const coordenadasPorRegiao: { [key: string]: { lat: number; lng: number } } = {
    // Zona Norte
    '020': { lat: -23.45, lng: -46.63 },
    '021': { lat: -23.44, lng: -46.64 },
    '022': { lat: -23.43, lng: -46.65 },
    '023': { lat: -23.42, lng: -46.66 },
    '024': { lat: -23.41, lng: -46.67 },
    '025': { lat: -23.40, lng: -46.68 },
    '026': { lat: -23.39, lng: -46.69 },
    '027': { lat: -23.38, lng: -46.70 },
    '028': { lat: -23.37, lng: -46.71 },
    '029': { lat: -23.36, lng: -46.72 },
    
    // Zona Sul
    '040': { lat: -23.65, lng: -46.63 },
    '041': { lat: -23.6145916, lng: -46.6296789 }, // Catulo da Paixão Cearense
    '042': { lat: -23.63, lng: -46.65 },
    '043': { lat: -23.62, lng: -46.66 },
    '044': { lat: -23.61, lng: -46.67 },
    '045': { lat: -23.60, lng: -46.68 },
    '046': { lat: -23.59, lng: -46.69 },
    '047': { lat: -23.58, lng: -46.70 },
    '048': { lat: -23.57, lng: -46.71 },
    '049': { lat: -23.56, lng: -46.72 },
    
    // Zona Leste
    '030': { lat: -23.55, lng: -46.53 },
    '031': { lat: -23.54, lng: -46.54 },
    '032': { lat: -23.53, lng: -46.55 },
    '033': { lat: -23.52, lng: -46.56 },
    '034': { lat: -23.5425, lng: -46.5567 }, // Jardim Haia do Carrão - coordenadas reais
    '035': { lat: -23.50, lng: -46.58 },
    '036': { lat: -23.49, lng: -46.59 },
    '037': { lat: -23.48, lng: -46.60 },
    '038': { lat: -23.47, lng: -46.61 },
    '039': { lat: -23.46, lng: -46.62 },
    
    // Zona Oeste
    '050': { lat: -23.55, lng: -46.73 },
    '051': { lat: -23.54, lng: -46.74 },
    '052': { lat: -23.53, lng: -46.75 },
    '053': { lat: -23.52, lng: -46.76 },
    '054': { lat: -23.51, lng: -46.77 },
    '055': { lat: -23.50, lng: -46.78 },
    '056': { lat: -23.49, lng: -46.79 },
    '057': { lat: -23.48, lng: -46.80 },
    '058': { lat: -23.47, lng: -46.81 },
    '059': { lat: -23.46, lng: -46.82 },
    
    // Centro
    '010': { lat: -23.55, lng: -46.63 },
    '011': { lat: -23.54, lng: -46.64 },
    '012': { lat: -23.53, lng: -46.65 },
    '013': { lat: -23.52, lng: -46.66 },
    '014': { lat: -23.51, lng: -46.67 },
    '015': { lat: -23.50, lng: -46.68 },
    '016': { lat: -23.49, lng: -46.69 },
    '017': { lat: -23.48, lng: -46.70 },
    '018': { lat: -23.47, lng: -46.71 },
    '019': { lat: -23.46, lng: -46.72 }
  };
  
  return coordenadasPorRegiao[prefixo] || null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cep = searchParams.get("cep");
    
    if (!cep) {
      return NextResponse.json(
        { 
          success: false,
          error: "Parâmetro 'cep' é obrigatório" 
        },
        { status: 400 }
      );
    }
    
    // Limpar CEP (remover caracteres não numéricos)
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return NextResponse.json(
        { 
          success: false,
          error: "CEP deve ter 8 dígitos" 
        },
        { status: 400 }
      );
    }
    
    console.log(`📍 [ViaCEP API] Buscando endereço para CEP: ${cepLimpo}`);
    
    // Buscar endereço via ViaCEP
    const viaCepResponse = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      timeout: 10000 // 10 segundos de timeout
    });
    
    if (viaCepResponse.data.erro) {
      console.log(`❌ [ViaCEP API] CEP não encontrado: ${cepLimpo}`);
      return NextResponse.json(
        { 
          success: false,
          error: "CEP não encontrado no ViaCEP" 
        },
        { status: 404 }
      );
    }
    
    const endereco = viaCepResponse.data;
    console.log(`✅ [ViaCEP API] Endereço encontrado: ${endereco.logradouro}, ${endereco.bairro}`);
    
    // Sistema de fallback para geocodificação com múltiplas estratégias
    const enderecoCompleto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil`;
    const enderecoComCidade = `${endereco.logradouro}, ${endereco.localidade}, ${endereco.uf}, Brasil`;
    const enderecoComBairro = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}, Brasil`;
    const enderecoApenasRua = `${endereco.logradouro}, São Paulo, SP, Brasil`;
    
    console.log(`🗺️ [ViaCEP API] Buscando coordenadas para: ${enderecoCompleto}`);
    
    // Lista de estratégias de busca em ordem de prioridade
    const estrategiasBusca = [
      { nome: 'Endereço Completo', endereco: enderecoCompleto },
      { nome: 'Com Bairro', endereco: enderecoComBairro },
      { nome: 'Com Cidade', endereco: enderecoComCidade },
      { nome: 'Apenas Rua + Cidade', endereco: enderecoApenasRua },
      // Estratégias específicas para casos difíceis
      { nome: 'Bairro + Cidade', endereco: `${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil` },
      { nome: 'Apenas CEP', endereco: `CEP ${endereco.cep}, ${endereco.localidade}, ${endereco.uf}, Brasil` },
      // Estratégias alternativas para ruas problemáticas
      { nome: 'Rua + Bairro Alternativo', endereco: `${endereco.logradouro}, ${endereco.bairro}, Brasil` },
      { nome: 'Apenas Rua', endereco: `${endereco.logradouro}, Brasil` }
    ];
    
    // Lista de serviços de geocodificação - só incluir os que têm chaves configuradas
    const servicosGeocoding = [
      {
        nome: 'Nominatim',
        headers: { 'User-Agent': 'ProcuraSP/1.0' },
        processarResposta: (data: any) => {
          if (data && data.length > 0) {
            // Procurar o primeiro resultado válido para São Paulo
            for (const item of data) {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              if (validarCoordenadasSaoPaulo({ lat, lng })) {
                return { lat, lng };
              }
            }
          }
          return null;
        }
      }
    ];
    
    // Adicionar OpenCage apenas se a chave estiver configurada
    if (process.env.OPENCAGE_API_KEY) {
      servicosGeocoding.push({
        nome: 'OpenCage',
        headers: {},
        processarResposta: (data: any) => data && data.results && data.results.length > 0 ? {
          lat: parseFloat(data.results[0].geometry.lat),
          lng: parseFloat(data.results[0].geometry.lng)
        } : null
      });
    }
    
    // Adicionar MapBox apenas se o token estiver configurado
    if (process.env.MAPBOX_ACCESS_TOKEN) {
      servicosGeocoding.push({
        nome: 'MapBox',
        headers: {},
        processarResposta: (data: any) => data && data.features && data.features.length > 0 ? {
          lat: parseFloat(data.features[0].center[1]),
          lng: parseFloat(data.features[0].center[0])
        } : null
      });
    }
    
    // Sistema de validação cruzada - buscar em TODAS as fontes e comparar resultados
    console.log(`🔍 [ViaCEP API] Iniciando busca cruzada em múltiplas fontes...`);
    
    const todosResultados: Array<{coordenadas: {lat: number, lng: number}, fonte: string, estrategia: string}> = [];
    
    // Buscar em todas as estratégias e todos os serviços
    for (const estrategia of estrategiasBusca) {
      console.log(`🔍 [ViaCEP API] Testando estratégia: ${estrategia.nome}`);
      
      for (const servico of servicosGeocoding) {
        try {
          console.log(`🔍 [ViaCEP API] Consultando ${servico.nome} com ${estrategia.nome}...`);
          
          let url = '';
          if (servico.nome === 'Nominatim') {
            url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(estrategia.endereco)}&limit=1&countrycodes=br`;
          } else if (servico.nome === 'OpenCage') {
            if (!process.env.OPENCAGE_API_KEY) {
              console.log(`⚠️ [ViaCEP API] OpenCage API key não configurada, pulando...`);
              continue;
            }
            url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(estrategia.endereco)}&key=${process.env.OPENCAGE_API_KEY}&countrycode=br&limit=1`;
          } else if (servico.nome === 'MapBox') {
            if (!process.env.MAPBOX_ACCESS_TOKEN) {
              console.log(`⚠️ [ViaCEP API] MapBox token não configurado, pulando...`);
              continue;
            }
            url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(estrategia.endereco)}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}&country=BR&limit=1`;
          }
          
          const response = await axios.get(url, {
            timeout: 8000,
            headers: servico.headers
          });
          
          const coordenadas = servico.processarResposta(response.data);
          
          if (coordenadas) {
            const isSaoPaulo = validarCoordenadasSaoPaulo(coordenadas);
            if (isSaoPaulo) {
              console.log(`✅ [ViaCEP API] ${servico.nome} (${estrategia.nome}) retornou coordenadas válidas:`, coordenadas);
              todosResultados.push({
                coordenadas,
                fonte: servico.nome,
                estrategia: estrategia.nome
              });
            } else {
              console.log(`⚠️ [ViaCEP API] ${servico.nome} (${estrategia.nome}) - coordenadas fora de SP:`, coordenadas);
            }
          } else {
            console.log(`⚠️ [ViaCEP API] ${servico.nome} (${estrategia.nome}) - nenhuma coordenada retornada`);
          }
          
        } catch (error) {
          console.log(`❌ [ViaCEP API] Erro no ${servico.nome} (${estrategia.nome}):`, error instanceof Error ? error.message : 'Erro desconhecido');
        }
      }
    }
    
    console.log(`📊 [ViaCEP API] Total de resultados válidos encontrados: ${todosResultados.length}`);
    
    // Analisar e validar resultados cruzados
    const coordenadasValidadas = validarCoordenadasCruzadas(todosResultados);
    
    if (coordenadasValidadas) {
      console.log(`🎯 [ViaCEP API] Coordenadas validadas por consenso:`, coordenadasValidadas);
      
      return NextResponse.json({
        success: true,
        endereco: {
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          localidade: endereco.localidade,
          uf: endereco.uf,
          cep: endereco.cep
        },
        coordenadas: coordenadasValidadas.coordenadas,
        fonte: `ViaCEP + Validação Cruzada (${coordenadasValidadas.fontes.join(', ')})`,
        confiabilidade: coordenadasValidadas.confiabilidade
      });
    }
    
    // Se nenhum serviço funcionou, tentar coordenadas aproximadas por CEP
    console.log(`❌ [ViaCEP API] Todos os serviços de geocodificação falharam, tentando coordenadas aproximadas...`);
    
    const coordenadasAproximadas = obterCoordenadasAproximadasPorCEP(cepLimpo);
    if (coordenadasAproximadas) {
      console.log(`📍 [ViaCEP API] Usando coordenadas aproximadas para CEP ${cepLimpo}:`, coordenadasAproximadas);
      
      return NextResponse.json({
        success: true,
        endereco: {
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          localidade: endereco.localidade,
          uf: endereco.uf,
          cep: endereco.cep
        },
        coordenadas: coordenadasAproximadas,
        fonte: `ViaCEP + Coordenadas Aproximadas (CEP ${cepLimpo})`,
        aviso: "Coordenadas aproximadas baseadas no CEP - precisão limitada"
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: "Endereço encontrado, mas não foi possível obter coordenadas geográficas de nenhuma fonte" 
      },
      { status: 404 }
    );
    
  } catch (error) {
    console.error("❌ [ViaCEP API] Erro geral:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
