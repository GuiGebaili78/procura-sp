import { NextResponse } from "next/server";
import { runMigrations } from "../../../lib/migrations";

export async function POST() {
  try {
    console.log("🔄 Executando migrações via API...");
    
    // Executar migrações
    const result = await runMigrations();
    
    console.log("✅ Migrações executadas com sucesso via API");
    
    return NextResponse.json({
      success: true,
      message: "Migraçõess executadas com sucesso",
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Erro ao executar as migrações via API:", error);
    
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
    endpoint: "/api/run-migrations",
    method: "POST"
  });
}
