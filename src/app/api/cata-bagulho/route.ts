import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

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

/**
 * API Route para buscar dados do Cata-Bagulho
 * Faz web scraping direto da fonte (LOCAT SP)
 */
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

    console.log(`🔍 [Cata-Bagulho] Iniciando busca para coordenadas: ${latitude}, ${longitude}`);

    // Buscar dados diretamente da fonte
    const results = await fetchFromSource(latitude, longitude);

    console.log(`📊 [Cata-Bagulho] ${results.length} resultados encontrados`);

    return NextResponse.json({ 
      success: true, 
      data: results
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

/**
 * Busca dados diretamente da fonte (LOCAT SP)
 */
async function fetchFromSource(
  lat: number,
  lng: number,
): Promise<CataBagulhoResult[]> {
  const BASE_URL = "https://locatsp.saclimpeza2.com.br/mapa/resultados/";
  const url = `${BASE_URL}?servico=grandes-objetos&lat=${lat}&lng=${lng}`;
  
  console.log(`[Cata-Bagulho] Buscando em: ${url}`);

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const parsedResults = parseHTML(html);
    console.log(`[Cata-Bagulho] Parsing retornou ${parsedResults.length} resultados`);
    
    return parsedResults;
  } catch (error: unknown) {
    console.error(
      "[Cata-Bagulho] API externa indisponível:",
      error instanceof Error ? error.message : error,
    );
    
    throw error;
  }
}

/**
 * Faz parsing do HTML retornado
 */
function parseHTML(html: string): CataBagulhoResult[] {
  const $ = cheerio.load(html);
  const results: CataBagulhoResult[] = [];

  console.log(`[Debug] HTML length: ${html.length}`);
  console.log(`[Debug] Painéis encontrados: ${$(".panel").length}`);

  // Cada resultado está em um painel com classe "panel panel-default"
  $(".panel.panel-default").each((_, panelElement) => {
    try {
      const $panel = $(panelElement);

      // Extrair nome da rua do elemento <strong> dentro de .logradouro
      const $logradouro = $panel.find(".logradouro");
      const streetName = $logradouro.find("strong").text().trim();

      if (!streetName) {
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

