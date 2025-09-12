import { NextRequest, NextResponse } from "next/server";
import { buscarEstabelecimentosBanco } from "../../../lib/services/banco-saude.service";
import { FiltroSaude } from "../../../types/saude";

export async function GET(request: NextRequest) {
  try {
    console.log('🏥 [API GET] Recebida requisição para /api/saude');
    const { searchParams } = new URL(request.url);
    
    // Extrair parâmetros da URL
    const cep = searchParams.get("cep");
    const numero = searchParams.get("numero");
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    // const raio = searchParams.get("raio"); // Não usado mais
    
    // Validar parâmetros obrigatórios
    if (!cep || !numero || !latitude || !longitude) {
      return NextResponse.json(
        { 
          error: "Parâmetros obrigatórios: cep, numero, latitude, longitude" 
        },
        { status: 400 }
      );
    }
    
    // Validar formato do CEP
    const cepRegex = /^\d{8}$/;
    if (!cepRegex.test(cep)) {
      return NextResponse.json(
        { error: "CEP deve ter 8 dígitos" },
        { status: 400 }
      );
    }
    
    // Validar coordenadas
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Coordenadas inválidas" },
        { status: 400 }
      );
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: "Coordenadas fora do range válido" },
        { status: 400 }
      );
    }
    
    // Extrair filtros de camadas
    const filtros: FiltroSaude = {
      ubs: searchParams.get("ubs") === "true",
      hospitais: searchParams.get("hospitais") === "true",
      postos: searchParams.get("postos") === "true",
      farmacias: searchParams.get("farmacias") === "true",
      maternidades: searchParams.get("maternidades") === "true",
      urgencia: searchParams.get("urgencia") === "true",
      academias: searchParams.get("academias") === "true",
      caps: searchParams.get("caps") === "true",
      saudeBucal: searchParams.get("saudeBucal") === "true",
      doencasRaras: searchParams.get("doencasRaras") === "true",
      ama: searchParams.get("ama") === "true",
      programas: searchParams.get("programas") === "true",
      diagnostico: searchParams.get("diagnostico") === "true",
      ambulatorio: searchParams.get("ambulatorio") === "true",
      supervisao: searchParams.get("supervisao") === "true",
      residencia: searchParams.get("residencia") === "true",
      reabilitacao: searchParams.get("reabilitacao") === "true",
      apoio: searchParams.get("apoio") === "true",
      clinica: searchParams.get("clinica") === "true",
      dst: searchParams.get("dst") === "true",
      prontoSocorro: searchParams.get("prontoSocorro") === "true",
      testagem: searchParams.get("testagem") === "true",
      auditiva: searchParams.get("auditiva") === "true",
      horaCerta: searchParams.get("horaCerta") === "true",
      idoso: searchParams.get("idoso") === "true",
      laboratorio: searchParams.get("laboratorio") === "true",
      trabalhador: searchParams.get("trabalhador") === "true",
      apoioDiagnostico: searchParams.get("apoioDiagnostico") === "true",
      apoioTerapeutico: searchParams.get("apoioTerapeutico") === "true",
      instituto: searchParams.get("instituto") === "true",
      apae: searchParams.get("apae") === "true",
      referencia: searchParams.get("referencia") === "true",
      imagem: searchParams.get("imagem") === "true",
      nutricao: searchParams.get("nutricao") === "true",
      reabilitacaoGeral: searchParams.get("reabilitacaoGeral") === "true",
      nefrologia: searchParams.get("nefrologia") === "true",
      odontologica: searchParams.get("odontologica") === "true",
      saudeMental: searchParams.get("saudeMental") === "true",
      referenciaGeral: searchParams.get("referenciaGeral") === "true",
      medicinas: searchParams.get("medicinas") === "true",
      hemocentro: searchParams.get("hemocentro") === "true",
      zoonoses: searchParams.get("zoonoses") === "true",
      laboratorioZoo: searchParams.get("laboratorioZoo") === "true",
      casaParto: searchParams.get("casaParto") === "true",
      sexual: searchParams.get("sexual") === "true",
      dstUad: searchParams.get("dstUad") === "true",
      capsInfantil: searchParams.get("capsInfantil") === "true",
      ambulatorios: searchParams.get("ambulatorios") === "true",
      programasGerais: searchParams.get("programasGerais") === "true",
      tradicionais: searchParams.get("tradicionais") === "true",
      dependente: searchParams.get("dependente") === "true",
      // Filtros por esfera administrativa
      municipal: searchParams.get("municipal") === "true",
      estadual: searchParams.get("estadual") === "true",
      privado: searchParams.get("privado") === "true"
    };
    
    // Verificar se pelo menos um filtro está ativo
    const temFiltroAtivo = Object.values(filtros).some(filtro => filtro);
    if (!temFiltroAtivo) {
      return NextResponse.json(
        { error: "Pelo menos um tipo de estabelecimento deve ser selecionado" },
        { status: 400 }
      );
    }
    
    // Buscar estabelecimentos no banco de dados
    console.log('🔍 [API] Chamando buscarEstabelecimentosBanco...');
    const estabelecimentos = await buscarEstabelecimentosBanco(lat, lng, filtros);
    console.log('📊 [API] Resultado:', estabelecimentos.length, 'estabelecimentos');
    
    return NextResponse.json({
      success: true,
      estabelecimentos,
      total: estabelecimentos.length,
      source: "banco",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Erro na API de saúde:", error);
    
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar estrutura do body
    const { cep, numero, latitude, longitude, filtros } = body;
    
    if (!cep || !numero || !latitude || !longitude || !filtros) {
      return NextResponse.json(
        { 
          error: "Body deve conter: cep, numero, latitude, longitude, filtros" 
        },
        { status: 400 }
      );
    }
    
    // Validar formato do CEP
    const cepRegex = /^\d{8}$/;
    if (!cepRegex.test(cep)) {
      return NextResponse.json(
        { error: "CEP deve ter 8 dígitos" },
        { status: 400 }
      );
    }
    
    // Validar coordenadas
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Coordenadas inválidas" },
        { status: 400 }
      );
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: "Coordenadas fora do range válido" },
        { status: 400 }
      );
    }
    
    // Validar filtros
    const filtrosObrigatorios = [
      "ubs", "hospitais", "postos", "farmacias", "maternidades",
      "urgencia", "academias", "caps", "saudeBucal", "doencasRaras"
    ];
    
    for (const filtro of filtrosObrigatorios) {
      if (typeof filtros[filtro] !== "boolean") {
        return NextResponse.json(
          { error: `Filtro '${filtro}' deve ser boolean` },
          { status: 400 }
        );
      }
    }
    
    // Verificar se pelo menos um filtro está ativo
    const temFiltroAtivo = Object.values(filtros).some(filtro => filtro);
    if (!temFiltroAtivo) {
      return NextResponse.json(
        { error: "Pelo menos um tipo de estabelecimento deve ser selecionado" },
        { status: 400 }
      );
    }
    
    // Buscar estabelecimentos no banco de dados
    console.log('🔍 [API] Chamando buscarEstabelecimentosBanco...');
    const estabelecimentos = await buscarEstabelecimentosBanco(lat, lng, filtros);
    console.log('📊 [API] Resultado:', estabelecimentos.length, 'estabelecimentos');
    
    return NextResponse.json({
      success: true,
      estabelecimentos,
      total: estabelecimentos.length,
      source: "banco",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Erro na API de saúde (POST):", error);
    
    // Garantir que sempre retornamos JSON, mesmo em caso de erro
    try {
      return NextResponse.json(
        { 
          success: false,
          error: "Erro interno do servidor",
          message: error instanceof Error ? error.message : "Erro desconhecido",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    } catch {
      // Se até o JSON falhar, retornar erro simples
      return new Response(
        JSON.stringify({
          success: false,
          error: "Erro crítico no servidor",
          message: "Falha ao processar resposta"
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
}
