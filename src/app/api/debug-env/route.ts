import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 Debugando variáveis de ambiente...");
    
    // Verificar todas as variáveis relacionadas ao banco
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      DATABASE_URL: process.env.DATABASE_URL ? "***configurado***" : "❌ não configurado",
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
      let poolConfig;
      if (process.env.DATABASE_URL) {
        poolConfig = {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        };
      } else {
        poolConfig = {
          host: process.env.POSTGRES_HOST,
          port: Number(process.env.POSTGRES_PORT) || 5432,
          user: process.env.POSTGRES_USER,
          database: process.env.POSTGRES_DB,
          password: process.env.POSTGRES_PASSWORD,
          ssl: { rejectUnauthorized: false },
        };
      }
      
      const pool = new Pool(poolConfig);
      
      const result = await pool.query("SELECT NOW() as current_time, version() as pg_version");
      connectionTest = {
        success: true,
        data: result.rows[0],
        connectionType: process.env.DATABASE_URL ? "DATABASE_URL" : "separate_vars"
      };
      
      await pool.end();
      
    } catch (error) {
      connectionTest = {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        connectionType: process.env.DATABASE_URL ? "DATABASE_URL" : "separate_vars"
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
