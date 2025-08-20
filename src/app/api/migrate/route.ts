import { NextResponse } from 'next/server';
import { runMigrations } from '../../../lib/migrations';

export async function POST() {
  try {
    console.log("🚀 Executando migrações via API...");
    await runMigrations();
    
    return NextResponse.json({ 
      success: true, 
      message: "Migrações executadas com sucesso" 
    });
  } catch (error: unknown) {
    console.error("❌ Erro ao executar migrações:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Erro ao executar migrações" 
      },
      { status: 500 }
    );
  }
}

// GET também para facilitar testes
export async function GET() {
  return POST();
}
