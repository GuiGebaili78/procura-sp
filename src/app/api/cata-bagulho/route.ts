import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import db from "../../../lib/database";

interface CataBagulhoResult {
  street: string;
  startStretch?: string;
  endStretch?: string;
  dates: string[];
  frequency: string;
  shift: string;
  schedule: string;
  trechos?: string[];
}

class CataBagulhoService {
  private readonly BASE_URL =
    "https://locatsp.saclimpeza2.com.br/mapa/resultados/";
  private readonly CACHE_TTL_HOURS = 24;

  public async search(lat: number, lng: number): Promise<CataBagulhoResult[]> {
    console.log(`🔍 [Cata-Bagulho] Iniciando busca para coordenadas: ${lat}, ${lng}`);
    
    const cachedResults = await this.getCachedResults(lat, lng);
    if (cachedResults) {
      console.log(
        `✅ [Cata-Bagulho] Cache HIT para coordenadas: ${lat}, ${lng}`,
      );
      return cachedResults;
    }

    console.log(`❌ [Cata-Bagulho] Cache MISS. Buscando na fonte externa...`);
    const liveResults = await this.fetchFromSource(lat, lng);

    console.log(`📊 [Cata-Bagulho] Resultados da fonte externa: ${liveResults.length} itens`);

    if (liveResults.length > 0) {
      await this.cacheResults(lat, lng, liveResults);
    }

    return liveResults;
  }

  private async getCachedResults(
    lat: number,
    lng: number,
  ): Promise<CataBagulhoResult[] | null> {
    try {
      const query = `
        SELECT results
        FROM catabagulho_cache 
        WHERE latitude = $1 AND longitude = $2 AND expires_at > NOW()
        LIMIT 1
      `;

      const result = await db.query(query, [lat, lng]);

      if (result.rows.length > 0) {
        return result.rows[0].results as CataBagulhoResult[];
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar no cache:", error);
      return null;
    }
  }

  private async fetchFromSource(
    lat: number,
    lng: number,
  ): Promise<CataBagulhoResult[]> {
    const url = `${this.BASE_URL}?servico=grandes-objetos&lat=${lat}&lng=${lng}`;
    console.log(`[Cata-Bagulho] Buscando em: ${url}`);

    try {
      const { data: html } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      const parsedResults = this.parseHTML(html);
      console.log(`[Cata-Bagulho] Parsing retornou ${parsedResults.length} resultados`);
      
      return parsedResults;
    } catch (error: unknown) {
      console.error(
        "[Cata-Bagulho] API externa indisponível:",
        error instanceof Error ? error.message : error,
      );
      
      throw error; // Re-throw para que o erro seja tratado pelo chamador
    }
  }



  private parseHTML(html: string): CataBagulhoResult[] {
    const $ = cheerio.load(html);
    const results: CataBagulhoResult[] = [];

    console.log(`[Debug] HTML length: ${html.length}`);
    console.log(`[Debug] Painéis encontrados: ${$(".panel").length}`);
    console.log(`[Debug] Painéis com classe panel-default: ${$(".panel.panel-default").length}`);
    
    // Debug: verificar se há conteúdo relevante no HTML
    const hasResults = html.includes("panel") || html.includes("logradouro") || html.includes("detalhes");
    console.log(`[Debug] HTML contém elementos esperados: ${hasResults}`);
    
    // Debug: verificar se há mensagem de não atendimento
    const hasNaoAtendido = html.includes("Endereço não atendido pela LOCAT SP");
    console.log(`[Debug] Contém mensagem de não atendimento: ${hasNaoAtendido}`);
    
    // Debug: imprimir parte do HTML para análise
    console.log(`[Debug] Primeiros 500 caracteres do HTML:`, html.substring(0, 500));


    // Cada resultado está em um painel com classe "panel panel-default"
    $(".panel.panel-default").each((_, panelElement) => {
      try {
        const $panel = $(panelElement);

        // Extrair nome da rua do elemento <strong> dentro de .logradouro
        const $logradouro = $panel.find(".logradouro");
        const streetName = $logradouro.find("strong").text().trim();

        if (!streetName) {
          console.log(`[Debug] Painel sem nome de rua, pulando...`);
          return;
        }

        console.log(`[Debug] Processando painel: ${streetName}`);

        // Extrair início e fim diretamente do HTML do logradouro
        const logradouroHtml = $logradouro.html() || "";
        const startMatch = logradouroHtml.match(/Início:\s*([^<\n]+)/);
        const endMatch = logradouroHtml.match(/Fim:\s*([^<\n]+)/);

        const startStretch = startMatch ? startMatch[1].trim() : undefined;
        const endStretch = endMatch ? endMatch[1].trim() : undefined;

        // Buscar informações nos detalhes (que ficam ocultos)
        const $detalhes = $panel.find(".detalhes");

        // Extrair frequência
        const $freqRow = $detalhes.find(".row").filter((_, row) => {
          return $(row).find(".col-xs-3").text().trim() === "Freq.:";
        });
        const frequency = $freqRow.find(".col-xs-9").text().trim();

        // Extrair turno
        const $turnoRow = $detalhes.find(".row").filter((_, row) => {
          return $(row).find(".col-xs-3").text().trim() === "Turno:";
        });
        const shift = $turnoRow.find(".col-xs-9").text().trim();

        // Extrair horário
        const $horarioRow = $detalhes.find(".row").filter((_, row) => {
          return $(row).find(".col-xs-3").text().trim() === "Horário:";
        });
        const schedule = $horarioRow.find(".col-xs-9").text().trim();

        // Extrair datas
        const $diasRow = $detalhes.find(".row").filter((_, row) => {
          return $(row).find(".col-xs-3").text().trim() === "Dias:";
        });
        const diasText = $diasRow.find(".col-xs-9").text();

        const dates: string[] = [];
        if (diasText) {
          const dateMatches = diasText.match(/\d{2}\/\d{2}\/\d{4}/g);
          if (dateMatches) {
            dates.push(...dateMatches);
          }
        }

        // Extrair ID do trecho do botão "Ver trecho"
        const trechos: string[] = [];
        $panel.find(".btn-ver-trecho").each((_, btnElement) => {
          const trechoId = $(btnElement).attr("trecho");
          if (trechoId) {
            trechos.push(trechoId);
          }
        });

        console.log(`[Debug] Dados extraídos para ${streetName}:`, {
          startStretch,
          endStretch,
          frequency,
          shift,
          schedule,
          datesCount: dates.length,
          trechosCount: trechos.length,
          firstTrecho: trechos[0],
        });

        if (streetName) {
          results.push({
            street: streetName,
            startStretch,
            endStretch,
            dates,
            frequency,
            shift,
            schedule,
            trechos: trechos.length > 0 ? trechos : undefined,
          });
        }
      } catch (error) {
        console.error("Erro ao processar painel:", error);
      }
    });

    console.log(`[Cata-Bagulho] Encontrados ${results.length} resultados`);
    return results;
  }

  private async cacheResults(
    lat: number,
    lng: number,
    results: CataBagulhoResult[],
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.CACHE_TTL_HOURS);

      const query = `
        INSERT INTO catabagulho_cache (latitude, longitude, results, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (latitude, longitude)
        DO UPDATE SET
          results = EXCLUDED.results,
          cached_at = CURRENT_TIMESTAMP,
          expires_at = EXCLUDED.expires_at
      `;

      await db.query(query, [lat, lng, JSON.stringify(results), expiresAt]);

      console.log(
        `💾 [Cata-Bagulho] Resultados salvos no cache até ${expiresAt.toLocaleString("pt-BR")}`,
      );
    } catch (error) {
      console.error("Erro ao salvar no cache:", error);
    }
  }
}

const cataBagulhoService = new CataBagulhoService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          message: "Parâmetros 'lat' e 'lng' são obrigatórios",
        },
        { status: 400 },
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, message: "Coordenadas inválidas" },
        { status: 400 },
      );
    }

    const data = await cataBagulhoService.search(latitude, longitude);

    // Debug temporário
    console.log(`[DEBUG] Dados retornados: ${data.length} resultados encontrados`);

    return NextResponse.json({ 
      success: true, 
      data
    });
  } catch (error: unknown) {
    console.error(
      "[API:Cata-Bagulho] Erro:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar dados do Cata-Bagulho",
      },
      { status: 500 },
    );
  }
}
