import axios from "axios";
import db from "../database";
import { ViaCepResponse } from "../types/api";

export class ViaCepService {
  private readonly cacheTTLHours = 24;

  private normalizeCep(cep: string): string {
    return cep.replace(/\D/g, "");
  }

  async buscarEnderecoPorCep(cep: string): Promise<ViaCepResponse> {
    const normalizedCep = this.normalizeCep(cep);

    if (normalizedCep.length !== 8) {
      throw new Error("CEP deve conter exatamente 8 dígitos");
    }

    // 1. Tenta buscar do cache
    const cachedData = await this.getCachedCep(normalizedCep);
    if (cachedData) {
      console.log(`✅ [ViaCEP] Cache HIT para CEP: ${normalizedCep}`);
      return cachedData;
    }

    // 2. Busca na API externa
    console.log(`❌ [ViaCEP] Cache MISS. Buscando na API externa...`);
    const apiData = await this.fetchFromViaCepAPI(normalizedCep);

    // 3. Salva no cache
    await this.saveCachedCep(normalizedCep, apiData);

    return apiData;
  }

  private async getCachedCep(cep: string): Promise<ViaCepResponse | null> {
    try {
      const query = `
        SELECT 
          cep, logradouro, unidade, 
          bairro, localidade, uf
        FROM viacep_cache 
        WHERE cep = $1 AND expires_at > NOW()
        LIMIT 1
      `;

      const result = await db.query(query, [this.formatCepWithHyphen(cep)]);

      if (result.rows.length > 0) {
        return result.rows[0] as ViaCepResponse;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar CEP no cache:", error);
      return null;
    }
  }

  private async fetchFromViaCepAPI(cep: string): Promise<ViaCepResponse> {
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    try {
      const { data } = await axios.get<ViaCepResponse>(url, {
        timeout: 10000,
        headers: {
          "User-Agent": "Procura-SP/1.0.0",
        },
      });

      if ("erro" in data) {
        throw new Error("CEP não encontrado");
      }

      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("CEP não encontrado");
        }
        throw new Error("Falha na conexão com o serviço de CEP");
      }
      throw new Error(
        error instanceof Error ? error.message : "Erro ao buscar CEP",
      );
    }
  }

  private async saveCachedCep(
    cep: string,
    data: ViaCepResponse,
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.cacheTTLHours);

      const formattedCep = this.formatCepWithHyphen(cep);

      const query = `
        INSERT INTO viacep_cache (
          cep, logradouro, unidade, 
          bairro, localidade, uf, expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (cep) 
        DO UPDATE SET
          logradouro = EXCLUDED.logradouro,
          unidade = EXCLUDED.unidade,
          bairro = EXCLUDED.bairro,
          localidade = EXCLUDED.localidade,
          uf = EXCLUDED.uf,
          cached_at = CURRENT_TIMESTAMP,
          expires_at = EXCLUDED.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `;

      await db.query(query, [
        formattedCep,
        data.logradouro || "",
        data.unidade || "",
        data.bairro || "",
        data.localidade || "",
        data.uf || "",
        expiresAt,
      ]);

      console.log(`💾 [ViaCEP] CEP ${formattedCep} salvo no cache`);
    } catch (error) {
      console.error("Erro ao salvar CEP no cache:", error);
    }
  }

  private formatCepWithHyphen(cep: string): string {
    const normalized = this.normalizeCep(cep);
    if (normalized.length === 8) {
      return `${normalized.substring(0, 5)}-${normalized.substring(5)}`;
    }
    return normalized;
  }

  /**
   * Busca CEP por endereço usando a API do ViaCEP
   * @param uf Estado (ex: "SP")
   * @param cidade Cidade (ex: "São Paulo")
   * @param logradouro Nome da rua (ex: "Ateneu")
   * @returns Array de endereços encontrados
   */
  async buscarCepPorEndereco(
    uf: string,
    cidade: string,
    logradouro: string
  ): Promise<ViaCepResponse[]> {
    console.log(`🔍 [ViaCEP] Buscando CEP por endereço: ${logradouro}, ${cidade}/${uf}`);
    
    try {
      const url = `https://viacep.com.br/ws/${uf}/${cidade}/${logradouro}/json/`;
      console.log(`📤 [ViaCEP] URL: ${url}`);
      
      const { data } = await axios.get<ViaCepResponse[]>(url, {
        timeout: 10000,
        headers: {
          "User-Agent": "Procura-SP/1.0.0",
        },
      });

      if (!Array.isArray(data)) {
        console.log(`⚠️ [ViaCEP] Resposta não é array:`, data);
        return [];
      }

      // Filtrar resultados que não são erro
      const resultadosValidos = data.filter(item => !("erro" in item));
      console.log(`✅ [ViaCEP] Encontrados ${resultadosValidos.length} endereços válidos`);
      
      return resultadosValidos;
    } catch (error: unknown) {
      console.error(`❌ [ViaCEP] Erro ao buscar CEP por endereço:`, error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.log(`⚠️ [ViaCEP] Nenhum endereço encontrado`);
          return [];
        }
        throw new Error("Falha na conexão com o serviço de CEP");
      }
      throw new Error(
        error instanceof Error ? error.message : "Erro ao buscar CEP por endereço",
      );
    }
  }

  /**
   * Encontra o CEP mais provável baseado no endereço e bairro
   * @param endereco Endereço completo do estabelecimento
   * @param bairro Bairro do estabelecimento
   * @returns CEP mais provável ou null se não encontrar
   */
  async encontrarCepPorEndereco(endereco: string, bairro: string): Promise<string | null> {
    try {
      console.log(`🔍 [ViaCEP] Procurando CEP para: "${endereco}" no bairro "${bairro}"`);
      
      // Extrair nome da rua do endereço (remover número e complementos)
      const nomeRua = this.extrairNomeRua(endereco);
      console.log(`📍 [ViaCEP] Nome da rua extraído: "${nomeRua}"`);
      
      if (!nomeRua) {
        console.log(`⚠️ [ViaCEP] Não foi possível extrair nome da rua`);
        return null;
      }

      // Buscar CEPs para a rua em São Paulo
      const resultados = await this.buscarCepPorEndereco("SP", "São Paulo", nomeRua);
      
      if (resultados.length === 0) {
        console.log(`⚠️ [ViaCEP] Nenhum resultado encontrado para "${nomeRua}"`);
        return null;
      }

      // Se encontrou apenas um resultado, usar ele
      if (resultados.length === 1) {
        const cep = resultados[0].cep;
        console.log(`✅ [ViaCEP] CEP único encontrado: ${cep}`);
        return cep;
      }

      // Se encontrou múltiplos resultados, tentar encontrar o mais provável pelo bairro e nome da rua
      console.log(`🔍 [ViaCEP] Múltiplos resultados encontrados (${resultados.length}), procurando melhor correspondência...`);
      
      const resultadoPorBairro = this.encontrarMelhorResultado(resultados, bairro, nomeRua);
      if (resultadoPorBairro) {
        console.log(`✅ [ViaCEP] CEP encontrado por correspondência: ${resultadoPorBairro.cep}`);
        return resultadoPorBairro.cep;
      }

      // Se não encontrou por bairro, usar o primeiro resultado
      const primeiroResultado = resultados[0];
      console.log(`⚠️ [ViaCEP] Usando primeiro resultado: ${primeiroResultado.cep}`);
      return primeiroResultado.cep;
      
    } catch (error) {
      console.error(`❌ [ViaCEP] Erro ao encontrar CEP por endereço:`, error);
      return null;
    }
  }

  /**
   * Extrai o nome da rua do endereço completo de forma mais precisa
   */
  private extrairNomeRua(endereco: string): string | null {
    if (!endereco) return null;
    
    console.log(`🔍 [ExtrairNomeRua] Processando endereço: "${endereco}"`);
    
    // Remover vírgulas e dividir por espaços
    const partes = endereco.replace(/,/g, '').split(' ').filter(parte => parte.length > 0);
    
    // Tipos de rua mais comuns
    const tiposRua = ['Rua', 'Avenida', 'Av', 'Alameda', 'Travessa', 'Praça', 'Largo', 'Viela', 'Passagem', 'Viaduto', 'Elevado'];
    
    let nomeRua = '';
    let encontrouTipoRua = false;
    
    for (let i = 0; i < partes.length; i++) {
      const parte = partes[i];
      
      // Se encontrou um tipo de rua
      if (tiposRua.some(tipo => parte.toLowerCase().includes(tipo.toLowerCase()))) {
        encontrouTipoRua = true;
        console.log(`📍 [ExtrairNomeRua] Encontrado tipo de rua: "${parte}"`);
        
        // Coletar todas as palavras após o tipo de rua até encontrar um número
        const palavrasNome = [];
        for (let j = i + 1; j < partes.length; j++) {
          const palavra = partes[j];
          
          // Se encontrou um número, parar
          if (/^\d+/.test(palavra)) {
            break;
          }
          
          // Se encontrou outro tipo de rua, parar (ex: "Rua Harmonia de Vida")
          if (j > i + 1 && tiposRua.some(tipo => palavra.toLowerCase().includes(tipo.toLowerCase()))) {
            break;
          }
          
          palavrasNome.push(palavra);
        }
        
        if (palavrasNome.length > 0) {
          nomeRua = palavrasNome.join(' ');
          console.log(`✅ [ExtrairNomeRua] Nome da rua extraído: "${nomeRua}"`);
          break;
        }
      }
    }
    
    // Se não encontrou padrão com tipo de rua, tentar extrair de outra forma
    if (!encontrouTipoRua || !nomeRua) {
      console.log(`⚠️ [ExtrairNomeRua] Tentando extração alternativa...`);
      
      // Procurar por palavras que não sejam números e tenham mais de 2 caracteres
      const palavrasValidas = partes.filter(parte => 
        !/^\d+/.test(parte) && 
        parte.length > 2 && 
        !tiposRua.some(tipo => parte.toLowerCase().includes(tipo.toLowerCase()))
      );
      
      if (palavrasValidas.length > 0) {
        // Pegar a primeira palavra válida (assumindo que é o nome da rua)
        nomeRua = palavrasValidas[0];
        console.log(`✅ [ExtrairNomeRua] Nome da rua extraído (alternativo): "${nomeRua}"`);
      }
    }
    
    if (!nomeRua) {
      console.log(`❌ [ExtrairNomeRua] Não foi possível extrair nome da rua`);
      return null;
    }
    
    return nomeRua;
  }

  /**
   * Encontra o melhor resultado baseado no bairro e nome da rua
   */
  private encontrarMelhorResultado(resultados: ViaCepResponse[], bairro: string, nomeRuaOriginal?: string): ViaCepResponse | null {
    if (!bairro) return null;
    
    console.log(`🔍 [EncontrarMelhorResultado] Procurando melhor resultado para bairro: "${bairro}" e rua: "${nomeRuaOriginal}"`);
    console.log(`📊 [EncontrarMelhorResultado] Total de resultados: ${resultados.length}`);
    
    const bairroNormalizado = bairro.toLowerCase().trim();
    const nomeRuaNormalizado = nomeRuaOriginal?.toLowerCase().trim() || '';
    
    // 1. Procurar correspondência exata de bairro E nome da rua
    if (nomeRuaNormalizado) {
      for (const resultado of resultados) {
        const resultadoBairro = resultado.bairro?.toLowerCase().trim() || '';
        const resultadoLogradouro = resultado.logradouro?.toLowerCase().trim() || '';
        
        if (resultadoBairro === bairroNormalizado && 
            this.compararNomesRua(resultadoLogradouro, nomeRuaNormalizado)) {
          console.log(`✅ [EncontrarMelhorResultado] Correspondência exata encontrada: ${resultado.logradouro}, ${resultado.bairro}`);
          return resultado;
        }
      }
    }
    
    // 2. Procurar correspondência exata apenas de bairro
    for (const resultado of resultados) {
      const resultadoBairro = resultado.bairro?.toLowerCase().trim() || '';
      if (resultadoBairro === bairroNormalizado) {
        console.log(`✅ [EncontrarMelhorResultado] Correspondência exata de bairro: ${resultado.logradouro}, ${resultado.bairro}`);
        return resultado;
      }
    }
    
    // 3. Procurar correspondência parcial de bairro
    for (const resultado of resultados) {
      const resultadoBairro = resultado.bairro?.toLowerCase().trim() || '';
      if (resultadoBairro.includes(bairroNormalizado) || 
          bairroNormalizado.includes(resultadoBairro)) {
        console.log(`✅ [EncontrarMelhorResultado] Correspondência parcial de bairro: ${resultado.logradouro}, ${resultado.bairro}`);
        return resultado;
      }
    }
    
    // 4. Se tem nome da rua, procurar por correspondência de rua independente do bairro
    if (nomeRuaNormalizado) {
      for (const resultado of resultados) {
        const resultadoLogradouro = resultado.logradouro?.toLowerCase().trim() || '';
        if (this.compararNomesRua(resultadoLogradouro, nomeRuaNormalizado)) {
          console.log(`✅ [EncontrarMelhorResultado] Correspondência de rua: ${resultado.logradouro}, ${resultado.bairro}`);
          return resultado;
        }
      }
    }
    
    console.log(`⚠️ [EncontrarMelhorResultado] Nenhuma correspondência encontrada`);
    return null;
  }

  /**
   * Compara nomes de ruas de forma inteligente
   */
  private compararNomesRua(logradouroResultado: string, nomeRuaOriginal: string): boolean {
    if (!logradouroResultado || !nomeRuaOriginal) return false;
    
    // Remover tipos de rua para comparação
    const tiposRua = ['rua', 'avenida', 'av', 'alameda', 'travessa', 'praça', 'largo', 'viela', 'passagem', 'viaduto', 'elevado'];
    
    const limparNome = (nome: string): string => {
      let nomeLimpo = nome.toLowerCase();
      
      // Remover tipos de rua
      for (const tipo of tiposRua) {
        nomeLimpo = nomeLimpo.replace(new RegExp(`^${tipo}\\s+`, 'i'), '');
      }
      
      // Remover caracteres especiais e normalizar
      nomeLimpo = nomeLimpo.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      
      return nomeLimpo;
    };
    
    const nomeLimpoResultado = limparNome(logradouroResultado);
    const nomeLimpoOriginal = limparNome(nomeRuaOriginal);
    
    console.log(`🔍 [CompararNomesRua] Comparando: "${nomeLimpoResultado}" vs "${nomeLimpoOriginal}"`);
    
    // Correspondência exata
    if (nomeLimpoResultado === nomeLimpoOriginal) {
      console.log(`✅ [CompararNomesRua] Correspondência exata`);
      return true;
    }
    
    // Correspondência parcial (um contém o outro)
    if (nomeLimpoResultado.includes(nomeLimpoOriginal) || nomeLimpoOriginal.includes(nomeLimpoResultado)) {
      console.log(`✅ [CompararNomesRua] Correspondência parcial`);
      return true;
    }
    
    // Correspondência por palavras (ex: "Harmonia de Vida" vs "Harmonia")
    const palavrasResultado = nomeLimpoResultado.split(' ');
    const palavrasOriginal = nomeLimpoOriginal.split(' ');
    
    // Se todas as palavras do original estão no resultado
    const todasPalavrasEncontradas = palavrasOriginal.every(palavra => 
      palavrasResultado.some(palavraResultado => 
        palavraResultado.includes(palavra) || palavra.includes(palavraResultado)
      )
    );
    
    if (todasPalavrasEncontradas && palavrasOriginal.length > 0) {
      console.log(`✅ [CompararNomesRua] Correspondência por palavras`);
      return true;
    }
    
    console.log(`❌ [CompararNomesRua] Nenhuma correspondência`);
    return false;
  }
}
