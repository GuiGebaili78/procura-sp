import { Pool, QueryResult, QueryResultRow } from "pg";
import dotenv from "dotenv";
import path from "path";

// Função para detectar e configurar o ambiente
function getEnvironmentConfig() {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";

  if (isProduction || isVercel) {
    // Produção: Vercel + Neon
    console.log("🌍 Ambiente: PRODUÇÃO (Vercel + Neon)");
    return {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      ssl: { rejectUnauthorized: false },
    };
  } else {
    // Desenvolvimento: Docker
    console.log("🌍 Ambiente: DESENVOLVIMENTO (Docker)");

    // Carregar variáveis de ambiente para desenvolvimento
    dotenv.config({
      path: path.resolve(process.cwd(), ".env.development"),
    });

    return {
      host: process.env.POSTGRES_HOST || "procura-sp-db",
      port: Number(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || "procura_sp_user",
      database: process.env.POSTGRES_DB || "procura_sp_db",
      password: process.env.POSTGRES_PASSWORD || "procura_sp_password",
      ssl: false,
    };
  }
}

const dbConfig = getEnvironmentConfig();

// Log da configuração (sem senha)
console.log("🔧 Configuração do banco:", {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  ssl: dbConfig.ssl ? "habilitado" : "desabilitado"
});

const pool = new Pool(dbConfig);

async function query(
  queryObject: string,
  params: unknown[] = [],
): Promise<QueryResult<QueryResultRow>> {
  try {
    const result = await pool.query(queryObject, params);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getClient() {
  return pool.connect();
}

const database = {
  query,
  getClient,
};

export default database;
