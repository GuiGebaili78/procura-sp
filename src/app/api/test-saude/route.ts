import { NextResponse } from "next/server";
import { buscarEstabelecimentosBanco } from "../../../lib/services/banco-saude.service";

export async function GET() {
  try {
    console.log("🧪 Testando API de saúde com parâmetros de exemplo...");
    
    // Coordenadas de exemplo (centro de São Paulo)
    const lat = -23.5505;
    const lng = -46.6333;
    
    // Filtros de exemplo (apenas UBS)
    const filtros = {
      ubs: true,
      hospitais: false,
      postos: false,
      farmacias: false,
      maternidades: false,
      urgencia: false,
      academias: false,
      caps: false,
      saudeBucal: false,
      doencasRaras: false,
      ama: false,
      programas: false,
      diagnostico: false,
      ambulatorio: false,
      supervisao: false,
      residencia: false,
      reabilitacao: false,
      apoio: false,
      clinica: false,
      dst: false,
      prontoSocorro: false,
      testagem: false,
      auditiva: false,
      horaCerta: false,
      idoso: false,
      laboratorio: false,
      trabalhador: false,
      apoioDiagnostico: false,
      apoioTerapeutico: false,
      instituto: false,
      apae: false,
      referencia: false,
      imagem: false,
      nutricao: false,
      reabilitacaoGeral: false,
      nefrologia: false,
      odontologica: false,
      saudeMental: false,
      referenciaGeral: false,
      medicinas: false,
      hemocentro: false,
      zoonoses: false,
      laboratorioZoo: false,
      casaParto: false,
      sexual: false,
      dstUad: false,
      capsInfantil: false,
      ambulatorios: false,
      programasGerais: false,
      tradicionais: false,
      dependente: false,
      municipal: true,
      estadual: true,
      privado: true
    };
    
    console.log("📍 Coordenadas de teste:", lat, lng);
    console.log("🔧 Filtros de teste:", filtros);
    
    // Chamar a função de busca
    const estabelecimentos = await buscarEstabelecimentosBanco(lat, lng, filtros);
    
    console.log(`📊 Resultado: ${estabelecimentos.length} estabelecimentos encontrados`);
    
    return NextResponse.json({
      success: true,
      coordenadas: { lat, lng },
      filtros,
      totalEncontrados: estabelecimentos.length,
      estabelecimentos: estabelecimentos.slice(0, 5), // Apenas os primeiros 5 para não sobrecarregar
      message: estabelecimentos.length > 0 
        ? "✅ API funcionando corretamente!" 
        : "⚠️ Nenhum estabelecimento encontrado - verificar dados ou filtros"
    });
    
  } catch (error) {
    console.error("❌ Erro no teste da API de saúde:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
