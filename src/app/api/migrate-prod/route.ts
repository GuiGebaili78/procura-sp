import { NextRequest, NextResponse } from "next/server";
import { runMigrations } from "../../../lib/migrations";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Iniciando migrações em produção...");
    
    // Executar migrações
    const result = await runMigrations();
    
    console.log("✅ Migrações executadas com sucesso:", result);
    
    return NextResponse.json({
      success: true,
      message: "Migrações executadas com sucesso",
      result
    });
    
  } catch (error) {
    console.error("❌ Erro ao executar migrações:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      details: error
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST para executar migrações",
    endpoint: "/api/migrate-prod",
    method: "POST"
  });
}

