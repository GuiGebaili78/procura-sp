import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 Debugando variáveis de ambiente...");
    
    // Verificar todas as variáveis relacionadas ao banco
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      DATABASE_URL: process.env.DATABASE_URL ? "***configurado***" : "❌ não configurado",
      // Variáveis PostgreSQL padrão
      PGHOST: process.env.PGHOST ? "***configurado***" : "❌ não configurado",
      PGPORT: process.env.PGPORT ? "***configurado***" : "❌ não configurado",
      PGUSER: process.env.PGUSER ? "***configurado***" : "❌ não configurado",
      PGPASSWORD: process.env.PGPASSWORD ? "***configurado***" : "❌ não configurado",
      PGDATABASE: process.env.PGDATABASE ? "***configurado***" : "❌ não configurado",
      // Variáveis POSTGRES (fallback)
      POSTGRES_HOST: process.env.POSTGRES_HOST ? "***configurado***" : "❌ não configurado",
      POSTGRES_PORT: process.env.POSTGRES_PORT ? "***configurado***" : "❌ não configurado", 
      POSTGRES_USER: process.env.POSTGRES_USER ? "***configurado***" : "❌ não configurado",
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? "***configurado***" : "❌ não configurado",
      POSTGRES_DB: process.env.POSTGRES_DB ? "***configurado***" : "❌ não configurado",
      PGSSLMODE: process.env.PGSSLMODE,
      PGCHANNELBINDING: process.env.PGCHANNELBINDING,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
    };
    
    console.log("📋 Variáveis de ambiente:", envVars);
    
    // Testar conexão básica
    let connectionTest = null;
    try {
      const { Pool } = await import("pg");
      
      // Usar a mesma lógica do arquivo principal
      const poolConfig = {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        ssl: { rejectUnauthorized: false },
      };
      
      const pool = new Pool(poolConfig);
      
      const result = await pool.query("SELECT NOW() as current_time, version() as pg_version");
      connectionTest = {
        success: true,
        data: result.rows[0],
        connectionType: "PG_vars"
      };
      
      await pool.end();
      
    } catch (error) {
      connectionTest = {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        connectionType: "PG_vars"
      };
    }
    
    return NextResponse.json({
      success: true,
      environment: envVars,
      connectionTest,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Erro no debug:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL
      }
    }, { status: 500 });
  }
}
