import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import db from "../../../../lib/database";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  unidade?: string;
  bairro: string;
  localidade: string;
  uf: string;
}

class ViaCepService {
  private readonly cacheTTLHours = 24;

  private normalizeCep(cep: string): string {
    return cep.replace(/\D/g, "");
  }

  async buscarEnderecoPorCep(cep: string): Promise<ViaCepResponse> {
    const normalizedCep = this.normalizeCep(cep);

    if (normalizedCep.length !== 8) {
      throw new Error("CEP deve conter exatamente 8 dígitos");
    }

    // 1. Tenta buscar do cache (banco de dados)
    const cachedData = await this.getCachedCep(normalizedCep);
    if (cachedData) {
      console.log(`✅ [ViaCEP] Cache HIT para CEP: ${normalizedCep}`);
      return cachedData;
    }

    // 2. Se não houver cache válido, busca na API externa
    console.log(`❌ [ViaCEP] Cache MISS. Buscando na API externa...`);
    const apiData = await this.fetchFromViaCepAPI(normalizedCep);

    // 3. Salva no cache do banco de dados
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
    console.log(`[ViaCEP] Buscando dados em: ${url}`);

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

      console.log(
        `💾 [ViaCEP] CEP ${formattedCep} salvo no cache até ${expiresAt.toLocaleString("pt-BR")}`,
      );
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
}

const viaCepService = new ViaCepService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cep: string }> },
) {
  try {
    const { cep } = await params;

    if (!cep) {
      return NextResponse.json(
        { success: false, message: "CEP é obrigatório" },
        { status: 400 },
      );
    }

    const data = await viaCepService.buscarEnderecoPorCep(cep);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error(
      "[API:CEP] Erro:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro ao buscar CEP",
      },
      { status: 500 },
    );
  }
}
