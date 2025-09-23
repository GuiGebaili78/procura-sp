import { NextRequest, NextResponse } from "next/server";
import { buscarEstabelecimentosBanco, obterEstatisticasBanco } from "../../../lib/services/banco-saude.service";
import { FiltroSaude } from "../../../types/saude";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("latitude") || "");
    const longitude = parseFloat(searchParams.get("longitude") || "");
    const raio = parseInt(searchParams.get("raio") || "5000"); // Padrão 5km
    
    // Parâmetros de filtro (independentes)
    const filtros: FiltroSaude = {
      // Filtros por tipo de estabelecimento
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
      // Filtros por esfera administrativa (independentes)
      municipal: searchParams.get("municipal") === "true",
      estadual: searchParams.get("estadual") === "true",
      privado: searchParams.get("privado") === "true",
    };
    
    // Parâmetro para obter estatísticas
    const stats = searchParams.get("stats") === "true";
    
    if (stats) {
      // Retornar apenas estatísticas
      const estatisticas = await obterEstatisticasBanco();
      return NextResponse.json({
        success: true,
        source: "banco",
        estatisticas
      });
    }
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Parâmetros latitude e longitude são obrigatórios e devem ser números" },
        { status: 400 }
      );
    }
    
    const estabelecimentos = await buscarEstabelecimentosBanco(
      latitude, 
      longitude, 
      filtros
    );
    
    return NextResponse.json({
      success: true,
      total: estabelecimentos.length,
      data: estabelecimentos,
      source: "banco",
      filtros,
      params: {
        latitude,
        longitude,
        raio
      }
    });
    
  } catch (error) {
    console.error("Erro na API de saúde (banco):", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
