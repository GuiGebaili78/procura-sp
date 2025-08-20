import * as fs from "fs";
import * as path from "path";

// Define o caminho raiz do projeto
// Use barras duplas para Windows para garantir que o path.join funcione corretamente
const rootPath: string = "C:\\workspace\\Meus Projetos\\LogoAli\\logo-ali";

// Define os tipos de arquivo cujo conteúdo deve ser incluído
const contentFileTypes: string[] = [
  ".json",
  ".ts",
  ".js",
  ".sql",
  "Dockerfile",
  ".yml",
  ".env",
  ".md",
  ".prettierignore",
  ".gitignore",
  // Usamos path.join para garantir compatibilidade com o sistema de arquivos
  path.join(".vscode", "settings.json"),
];

// Define os padrões de exclusão (pastas e arquivos que não devem ser incluídos)
const exclusionList = [
  "node_modules",
  "package-lock\\.json",
  "pnpm-lock\\.yaml",
  "yarn\\.lock",
  "\\.git",
  "\\.gitignore",
  "\\.gitattributes",
  "\\.vscode",
  "\\.prettierignore",
  "\\.prettierrc.*",
  "tsconfig\\.json",
  "jsconfig\\.json",
  "vite\\.config\\..*",
  "webpack\\.config\\..*",
  "\\.env.*",
  "\\.eslint.*",
  "\\.stylelint.*",
  "\\.bin",
  "@types",
  "node16",
  "\\.next",
  "dist",
  "build",
  "coverage",
  "test-results",
  "__tests__",
  "README\\.md",
  "gerar_estruturas",
  "estrutura_e_sctripts_completa",
];

const exclusions: RegExp = new RegExp(`(${exclusionList.join("|")})`);

// Define o nome do arquivo de saída
const outputFile: string = path.join(
  rootPath,
  "estrutura_e_scripts_completa.txt"
);

// Função para obter a linguagem para o bloco de código Markdown
function getLanguage(filename: string, relativePath: string): string {
  const ext: string = path.extname(filename);
  switch (ext) {
    case ".json":
      return "json";
    case ".ts":
      return "typescript";
    case ".js":
      return "javascript";
    case ".sql":
      return "sql";
    case ".yml":
      return "yaml";
    case ".md":
      return "markdown";
    default:
      if (filename === "Dockerfile") return "dockerfile";
      // Usa startsWith para cobrir .env, .env.development, etc.
      if (filename.startsWith(".env")) return "plaintext";
      if (filename === ".prettierignore" || filename === ".gitignore")
        return "plaintext";
      // Verifica o caminho relativo para settings.json para ser mais específico
      if (
        relativePath ===
        path.join(".vscode", "settings.json").replace(/\\/g, "/")
      )
        return "json";
      return "plaintext";
  }
}

// Limpa o conteúdo do arquivo de saída se ele já existir
// Garante codificação UTF-8 para evitar problemas de caracteres
fs.writeFileSync(
  outputFile,
  "Estrutura de pastas e arquivos com conteúdo:\r\n",
  { encoding: "utf8" }
);

// Função recursiva para percorrer diretórios
function processDirectory(dirPath: string, depth: number): void {
  // Limita a profundidade para evitar loops infinitos ou excesso de arquivos
  if (depth > 4) {
    return;
  }

  let items: fs.Dirent[];
  try {
    items = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (error: any) {
    // Usamos 'any' para o tipo de erro para compatibilidade
    // Loga erro se não conseguir ler o diretório (ex: permissão negada)
    console.error(`Erro ao ler diretório '${dirPath}': ${error.message}`);
    return;
  }

  for (const item of items) {
    const fullPath: string = path.join(dirPath, item.name);
    // Normaliza o caminho para garantir que as barras sejam consistentes (Windows/Linux)
    const relativePath: string = fullPath
      .replace(rootPath, "")
      .replace(/^[\\\/]/, "")
      .replace(/\\/g, "/");

    // Testa exclusões usando o caminho relativo normalizado
    if (exclusions.test(relativePath)) {
      continue; // Ignora itens que correspondem aos padrões de exclusão
    }

    // Adiciona o caminho do arquivo/pasta ao arquivo de saída
    fs.appendFileSync(outputFile, `--- Caminho: ${relativePath} ---\r\n`, {
      encoding: "utf8",
    });

    if (item.isDirectory()) {
      processDirectory(fullPath, depth + 1); // Continua recursivamente para subdiretórios
    } else {
      // Se for um arquivo, verifica se o conteúdo deve ser incluído
      let includeContent: boolean = false;
      for (const type of contentFileTypes) {
        // Ajusta a lógica de correspondência para ser mais robusta
        // Verifica se o caminho relativo termina com o tipo, ou se o nome do item é o tipo
        // ou se o tipo contém curingas e corresponde ao nome do item
        if (
          relativePath.endsWith(type) ||
          item.name === type ||
          (type.includes("*") &&
            item.name.match(new RegExp(type.replace(/\*/g, ".*"))))
        ) {
          includeContent = true;
          break;
        }
      }

      // Tratamento específico para .vscode/settings.json, garantindo que seja incluído
      if (
        relativePath ===
        path.join(".vscode", "settings.json").replace(/\\/g, "/")
      ) {
        includeContent = true;
      }

      if (includeContent) {
        try {
          // Lê o conteúdo do arquivo
          let fileContent: string = fs.readFileSync(fullPath, {
            encoding: "utf8",
          });
          // Garante que fileContent é uma string, mesmo que o arquivo esteja vazio
          if (typeof fileContent !== "string") {
            fileContent = String(fileContent);
          }
          const language: string = getLanguage(item.name, relativePath);
          fs.appendFileSync(outputFile, `\`\`\`${language}\r\n`, {
            encoding: "utf8",
          });
          fs.appendFileSync(outputFile, fileContent + "\r\n", {
            encoding: "utf8",
          });
          fs.appendFileSync(outputFile, "```\r\n", { encoding: "utf8" });
        } catch (error: any) {
          // Usamos 'any' para o tipo de erro para compatibilidade
          // Loga o erro no console e no arquivo de saída
          console.error(
            `Erro ao ler o conteúdo do arquivo '${relativePath}': ${error.message}`
          );
          fs.appendFileSync(outputFile, `\`\`\`plaintext\r\n`, {
            encoding: "utf8",
          });
          fs.appendFileSync(
            outputFile,
            `Erro ao ler o conteúdo do arquivo '${relativePath}': ${error.message}\r\n`,
            { encoding: "utf8" }
          );
          fs.appendFileSync(outputFile, "```\r\n", { encoding: "utf8" });
        }
      }
    }
    // Adiciona uma linha vazia para melhor separação visual entre os itens
    fs.appendFileSync(outputFile, "\r\n", { encoding: "utf8" });
  }
}

// Inicia o processo a partir da raiz
processDirectory(rootPath, 0);

console.log(`✅ Estrutura e conteúdo dos scripts salvos em ${outputFile}`);
