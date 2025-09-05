import fs from "fs";
import path from "path";
import db from "./database";

interface Migration {
  id: number;
  filename: string;
  content: string;
}

async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    console.log("🔄 Criando tabela de migrações...");
    await db.query(query);
    console.log("✅ Tabela 'migrations' criada/verificada com sucesso");
  } catch (error) {
    console.error("❌ Erro ao criar tabela de migrações:", error);
    throw error;
  }
}

async function getExecutedMigrations(): Promise<string[]> {
  try {
    const result = await db.query(
      "SELECT filename FROM migrations ORDER BY id",
    );
    return result.rows.map((row) => (row as { filename: string }).filename);
  } catch (error) {
    // Se a tabela não existir ainda
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "42P01"
    ) {
      console.log("📋 Tabela de migrações ainda não existe");
      return [];
    }
    console.error("❌ Erro ao obter migrações executadas:", error);
    throw error;
  }
}

async function getMigrationFiles(): Promise<Migration[]> {
  const migrationsDir = path.join(process.cwd(), "src", "lib", "migrations");

  if (!fs.existsSync(migrationsDir)) {
    console.log("📁 Criando diretório de migrações...");
    fs.mkdirSync(migrationsDir, { recursive: true });
    return [];
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  console.log(`📄 Encontrados ${files.length} arquivos de migração:`, files);

  return files.map((filename) => {
    const content = fs.readFileSync(path.join(migrationsDir, filename), "utf8");
    const id = parseInt(filename.split("_")[0]) || 0;
    return { id, filename, content };
  });
}

async function executeMigration(migration: Migration) {
  const client = await db.getClient();

  try {
    console.log(`🔄 Executando migração: ${migration.filename}`);

    // Inicia transação
    await client.query("BEGIN");

    // Executa o SQL da migração
    if (migration.content.trim()) {
      console.log(`📝 Executando SQL da migração...`);
      await client.query(migration.content);
    }

    // Registra a migração como executada
    await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
      migration.filename,
    ]);

    // Confirma transação
    await client.query("COMMIT");

    console.log(`✅ Migração executada com sucesso: ${migration.filename}`);
  } catch (error) {
    // Desfaz transação em caso de erro
    await client.query("ROLLBACK");
    console.error(`❌ Erro na migração ${migration.filename}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

export async function runMigrations() {
  try {
    console.log("🚀 Iniciando sistema de migrações...");

    // Primeiro cria a tabela de migrações
    await createMigrationsTable();

    // Busca migrações já executadas
    const executedMigrations = await getExecutedMigrations();
    console.log(`📋 Migrações já executadas: ${executedMigrations.length}`);

    // Busca arquivos de migração
    const migrationFiles = await getMigrationFiles();

    // Filtra migrações pendentes
    const pendingMigrations = migrationFiles.filter(
      (migration) => !executedMigrations.includes(migration.filename),
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ Nenhuma migração pendente encontrada");
      return;
    }

    console.log(
      `⚙️ Executando ${pendingMigrations.length} migrações pendentes...`,
    );

    for (const migration of pendingMigrations) {
      await executeMigration(migration);
    }

    console.log("🎉 Todas as migrações foram executadas com sucesso!");
  } catch (error) {
    console.error("💥 Erro durante execução das migrações:", error);
    throw error;
  }
}
