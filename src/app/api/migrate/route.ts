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
<<<<<<< HEAD
  } catch (error: unknown) {
=======
  } catch (error: any) {
>>>>>>> 4f16bb92810b1d33817c353dc79cc1c6383132c5
    console.error("❌ Erro ao executar migrações:", error);
    return NextResponse.json(
      { 
        success: false, 
<<<<<<< HEAD
        message: error instanceof Error ? error.message : "Erro ao executar migrações" 
=======
        message: error.message || "Erro ao executar migrações" 
>>>>>>> 4f16bb92810b1d33817c353dc79cc1c6383132c5
      },
      { status: 500 }
    );
  }
}

// GET também para facilitar testes
export async function GET() {
  return POST();
}
