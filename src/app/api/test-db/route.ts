import { NextResponse } from "next/server";
import db from "../../../lib/database";

export async function GET() {
  try {
    console.log("🧪 Testando conexão com o banco de dados...");
    
    // Teste 1: Conexão básica
    const connectionTest = await db.query("SELECT NOW() as current_time");
    console.log("✅ Conexão estabelecida:", connectionTest.rows[0]);
    
    // Teste 2: Verificar se a tabela existe
    const tableTest = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'estabelecimentos_saude'
      ) as table_exists
    `);
    console.log("📋 Tabela existe:", tableTest.rows[0]);
    
    // Teste 3: Contar registros
    const countTest = await db.query("SELECT COUNT(*) as total FROM estabelecimentos_saude");
    console.log("📊 Total de registros:", countTest.rows[0]);
    
    // Teste 4: Amostra de dados
    const sampleTest = await db.query(`
      SELECT id, nome, tipo, latitude, longitude, ativo 
      FROM estabelecimentos_saude 
      WHERE ativo = true 
      LIMIT 5
    `);
    console.log("📋 Amostra de dados:", sampleTest.rows);
    
    // Teste 5: Testar query específica que a API usa
    const apiTest = await db.query(`
      SELECT 
        id, nome, tipo, endereco, bairro, regiao, cep, 
        latitude, longitude, esfera_administrativa, ativo
      FROM estabelecimentos_saude
      WHERE ativo = true 
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND tipo IN ('UNIDADE BASICA DE SAUDE')
      ORDER BY nome
      LIMIT 3
    `);
    console.log("🔍 Teste da query da API:", apiTest.rows);
    
    return NextResponse.json({
      success: true,
      connection: connectionTest.rows[0],
      tableExists: tableTest.rows[0].table_exists,
      totalRecords: countTest.rows[0].total,
      sampleData: sampleTest.rows,
      apiTestData: apiTest.rows,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        POSTGRES_HOST: process.env.POSTGRES_HOST ? "***configurado***" : "não configurado",
        POSTGRES_USER: process.env.POSTGRES_USER ? "***configurado***" : "não configurado",
        POSTGRES_DB: process.env.POSTGRES_DB ? "***configurado***" : "não configurado"
      }
    });
    
  } catch (error) {
    console.error("❌ Erro no teste de conexão:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        POSTGRES_HOST: process.env.POSTGRES_HOST ? "***configurado***" : "não configurado",
        POSTGRES_USER: process.env.POSTGRES_USER ? "***configurado***" : "não configurado",
        POSTGRES_DB: process.env.POSTGRES_DB ? "***configurado***" : "não configurado"
      }
    }, { status: 500 });
  }
}
