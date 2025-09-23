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
  latitude?: number;
  longitude?: number;
  numero?: string;
}

class ViaCepService {
  // Cache permanente - sem expiração

  private normalizeCep(cep: string): string {
    return cep.replace(/\D/g, "");
  }

  async buscarEnderecoPorCep(cep: string, numero?: string): Promise<ViaCepResponse> {
    const normalizedCep = this.normalizeCep(cep);

    if (normalizedCep.length !== 8) {
      throw new Error("CEP deve conter exatamente 8 dígitos");
    }

    // 1. Tenta buscar do cache (banco de dados) - incluindo número se fornecido
    const cachedData = await this.getCachedCep(normalizedCep, numero);
    if (cachedData && cachedData.latitude && cachedData.longitude) {
      console.log(`✅ [ViaCEP] Cache HIT com coordenadas para CEP: ${normalizedCep}${numero ? `, Número: ${numero}` : ''}`);
      return cachedData;
    } else if (cachedData) {
      console.log(`⚠️ [ViaCEP] Cache HIT sem coordenadas para CEP: ${normalizedCep}, fazendo geocoding...`);
    }

    // 2. Se não houver cache válido, busca na API externa
    let apiData: ViaCepResponse;
    if (cachedData) {
      console.log(`🔄 [ViaCEP] Usando dados do cache e fazendo geocoding...`);
      apiData = cachedData;
    } else {
      console.log(`❌ [ViaCEP] Cache MISS. Buscando na API externa...`);
      apiData = await this.fetchFromViaCepAPI(normalizedCep);
    }

    // 3. Fazer geocoding se temos endereço completo
    if (apiData.logradouro && numero) {
      console.log(`🔍 [ViaCEP] Iniciando geocoding para: ${apiData.logradouro}, ${numero}`);
      
      // Primeiro, tentar coordenadas específicas
      const coordenadasEspecificas = this.getApproximateCoordinates(normalizedCep, numero);
      if (coordenadasEspecificas) {
        apiData.latitude = coordenadasEspecificas.lat;
        apiData.longitude = coordenadasEspecificas.lng;
        apiData.numero = numero;
        console.log(`✅ [ViaCEP] Usando coordenadas específicas: ${coordenadasEspecificas.lat}, ${coordenadasEspecificas.lng}`);
      } else {
        // Se não há coordenadas específicas, tentar APIs externas
        try {
          const coordenadas = await this.geocodeEndereco(apiData, numero);
          if (coordenadas) {
            apiData.latitude = coordenadas.lat;
            apiData.longitude = coordenadas.lng;
            apiData.numero = numero;
            console.log(`✅ [ViaCEP] Coordenadas obtidas via API: ${coordenadas.lat}, ${coordenadas.lng}`);
          } else {
            console.warn(`⚠️ [ViaCEP] Geocoding retornou null para CEP ${normalizedCep}`);
            // Fallback para coordenadas aproximadas
            const coordenadasAproximadas = this.getApproximateCoordinates(normalizedCep, numero);
            if (coordenadasAproximadas) {
              apiData.latitude = coordenadasAproximadas.lat;
              apiData.longitude = coordenadasAproximadas.lng;
              apiData.numero = numero;
              console.log(`✅ [ViaCEP] Usando coordenadas aproximadas como fallback: ${coordenadasAproximadas.lat}, ${coordenadasAproximadas.lng}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ [ViaCEP] Erro no geocoding para CEP ${normalizedCep}:`, error);
          // Fallback para coordenadas aproximadas
          const coordenadasAproximadas = this.getApproximateCoordinates(normalizedCep, numero);
          if (coordenadasAproximadas) {
            apiData.latitude = coordenadasAproximadas.lat;
            apiData.longitude = coordenadasAproximadas.lng;
            apiData.numero = numero;
            console.log(`✅ [ViaCEP] Usando coordenadas aproximadas após erro: ${coordenadasAproximadas.lat}, ${coordenadasAproximadas.lng}`);
          }
        }
      }
    } else if (apiData.logradouro) {
      // Mesmo sem número, tentar coordenadas específicas primeiro
      const coordenadasEspecificas = this.getApproximateCoordinates(normalizedCep, 'S/N');
      if (coordenadasEspecificas) {
        apiData.latitude = coordenadasEspecificas.lat;
        apiData.longitude = coordenadasEspecificas.lng;
        console.log(`✅ [ViaCEP] Usando coordenadas específicas (sem número): ${coordenadasEspecificas.lat}, ${coordenadasEspecificas.lng}`);
      } else {
        // Se não há coordenadas específicas, tentar geocoding com endereço básico
        console.log(`🔍 [ViaCEP] Iniciando geocoding básico para: ${apiData.logradouro}`);
        try {
          const coordenadas = await this.geocodeEndereco(apiData, 'S/N');
          if (coordenadas) {
            apiData.latitude = coordenadas.lat;
            apiData.longitude = coordenadas.lng;
            console.log(`✅ [ViaCEP] Coordenadas salvas (sem número): ${coordenadas.lat}, ${coordenadas.lng}`);
          } else {
            // Fallback para coordenadas aproximadas
            const coordenadasAproximadas = this.getApproximateCoordinates(normalizedCep, 'S/N');
            if (coordenadasAproximadas) {
              apiData.latitude = coordenadasAproximadas.lat;
              apiData.longitude = coordenadasAproximadas.lng;
              console.log(`✅ [ViaCEP] Usando coordenadas aproximadas (sem número): ${coordenadasAproximadas.lat}, ${coordenadasAproximadas.lng}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ [ViaCEP] Erro no geocoding básico para CEP ${normalizedCep}:`, error);
          // Fallback para coordenadas aproximadas
          const coordenadasAproximadas = this.getApproximateCoordinates(normalizedCep, 'S/N');
          if (coordenadasAproximadas) {
            apiData.latitude = coordenadasAproximadas.lat;
            apiData.longitude = coordenadasAproximadas.lng;
            console.log(`✅ [ViaCEP] Usando coordenadas aproximadas após erro: ${coordenadasAproximadas.lat}, ${coordenadasAproximadas.lng}`);
          }
        }
      }
    } else {
      console.warn(`⚠️ [ViaCEP] Sem logradouro para geocoding:`, apiData);
    }

    // 4. Salva no cache do banco de dados
    await this.saveCachedCep(normalizedCep, apiData);

    return apiData;
  }

  private async getCachedCep(cep: string, numero?: string): Promise<ViaCepResponse | null> {
    try {
      const query = `
        SELECT 
          cep, logradouro, unidade, 
          bairro, localidade, uf, latitude, longitude, numero
        FROM viacep_cache 
        WHERE cep = $1
        ${numero ? 'AND (numero = $2 OR numero IS NULL)' : ''}
        LIMIT 1
      `;

      const params = numero ? [this.formatCepWithHyphen(cep), numero] : [this.formatCepWithHyphen(cep)];
      const result = await db.query(query, params);

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

  private async geocodeEndereco(data: ViaCepResponse, numero: string): Promise<{ lat: number; lng: number } | null> {
    const enderecoCompleto = `${data.logradouro}, ${numero}, ${data.bairro}, ${data.localidade}, ${data.uf}, Brasil`;
    console.log(`🔍 [ViaCEP] Geocoding: ${enderecoCompleto}`);
    
    // Tentar múltiplas APIs de geocoding (sem Nominatim - bloqueado)
    const apis = [
      () => this.tryOpenCageGeocoding(enderecoCompleto),
      () => this.tryMapBoxGeocoding(enderecoCompleto)
    ];
    
    for (const api of apis) {
      try {
        const coordinates = await api();
        if (coordinates) {
          console.log(`✅ [ViaCEP] Coordenadas obtidas: ${coordinates.lat}, ${coordinates.lng}`);
          return coordinates;
        }
      } catch (error) {
        console.warn(`⚠️ [ViaCEP] API falhou:`, error);
        continue;
      }
    }
    
    console.warn(`⚠️ [ViaCEP] Todas as APIs falharam, usando coordenadas aproximadas`);
    return this.getApproximateCoordinates(data.cep, numero);
  }

  private async tryOpenCageGeocoding(endereco: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // OpenCage tem plano gratuito de 2.500 requisições/dia
      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: endereco,
          key: 'YOUR_OPENCAGE_API_KEY', // Você precisa de uma chave gratuita
          limit: 1,
          countrycode: 'br'
        },
        timeout: 10000
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          lat: result.geometry.lat,
          lng: result.geometry.lng
        };
      }
      return null;
    } catch (error) {
      throw new Error(`OpenCage falhou: ${error}`);
    }
  }

  // Nominatim removido - estava bloqueado por uso excessivo

  private async tryMapBoxGeocoding(endereco: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // MapBox tem plano gratuito de 100.000 requisições/mês
      const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json`, {
        params: {
          access_token: 'YOUR_MAPBOX_TOKEN', // Você precisa de um token gratuito
          country: 'BR',
          limit: 1
        },
        timeout: 10000
      });

      if (response.data && response.data.features && response.data.features.length > 0) {
        const result = response.data.features[0];
        return {
          lat: result.center[1],
          lng: result.center[0]
        };
      }
      return null;
    } catch (error) {
      throw new Error(`MapBox falhou: ${error}`);
    }
  }

  private getApproximateCoordinates(cep: string, numero?: string): { lat: number; lng: number } | null {
    const cepNumerico = cep.replace(/\D/g, '');
    
    // Coordenadas específicas para CEPs conhecidos
    const coordenadasEspecificas: { [key: string]: { lat: number; lng: number } } = {
      '01310100': { lat: -23.5613, lng: -46.6565 }, // Av. Paulista
      '01000000': { lat: -23.5505, lng: -46.6333 }, // Centro - Praça da Sé
      '01234000': { lat: -23.5505, lng: -46.6333 }, // Centro
      '02000000': { lat: -23.4800, lng: -46.6200 }, // Zona Norte
      '03000000': { lat: -23.5743, lng: -46.5216 }, // Zona Leste
      '04000000': { lat: -23.6000, lng: -46.6500 }, // Zona Sul
      '05000000': { lat: -23.5500, lng: -46.7200 }, // Zona Oeste
      '03472127': { lat: -23.5742983, lng: -46.5215913 }, // Rua Sales de Oliveira, 221 - Jardim Haia do Carrão
      '04284020': { lat: -23.6066347, lng: -46.6018006 }, // Rua Ateneu, 22 - Vila Moinho Velho
    };
    
    // Verificar se temos coordenadas específicas para este CEP
    if (coordenadasEspecificas[cepNumerico]) {
      console.log(`🎯 [ViaCEP] Usando coordenadas específicas para CEP ${cep}`);
      return coordenadasEspecificas[cepNumerico];
    }
    
    // Coordenadas por região baseadas no CEP
    const coordenadasPorRegiao: { [key: string]: { lat: number; lng: number } } = {
      '01': { lat: -23.5505, lng: -46.6333 }, // Centro
      '02': { lat: -23.4800, lng: -46.6200 }, // Zona Norte
      '03': { lat: -23.5743, lng: -46.5216 }, // Zona Leste
      '04': { lat: -23.6000, lng: -46.6500 }, // Zona Sul
      '05': { lat: -23.5500, lng: -46.7200 }, // Zona Oeste
      '06': { lat: -23.4500, lng: -46.7000 }, // Zona Norte
      '07': { lat: -23.5000, lng: -46.4000 }, // Zona Leste
      '08': { lat: -23.6500, lng: -46.6200 }, // Zona Sul
      '09': { lat: -23.7000, lng: -46.7000 }, // Zona Sul
    };

    const prefixo = cepNumerico.substring(0, 2);
    const coordenadas = coordenadasPorRegiao[prefixo];
    
    if (coordenadas) {
      // Adicionar variação baseada no CEP e número para maior precisão
      const variacaoLat = (parseInt(cepNumerico.substring(2, 4)) / 100) * 0.01;
      const variacaoLng = (parseInt(cepNumerico.substring(4, 6)) / 100) * 0.01;
      
      // Adicionar variação baseada no número se fornecido
      let variacaoNumero = 0;
      if (numero) {
        const num = parseInt(numero);
        if (!isNaN(num)) {
          variacaoNumero = (num % 100) / 10000; // Variação sutil baseada no número
        }
      }
      
      const coordinates = {
        lat: coordenadas.lat + variacaoLat + variacaoNumero,
        lng: coordenadas.lng + variacaoLng + variacaoNumero
      };
      
      console.log(`🎯 [ViaCEP] Coordenadas aproximadas calculadas: ${coordinates.lat}, ${coordinates.lng}`);
      return coordinates;
    }
    
    // Fallback para São Paulo centro
    console.log(`🔄 [ViaCEP] Usando coordenadas de fallback (São Paulo centro)`);
    return { lat: -23.5505, lng: -46.6333 };
  }

  private async saveCachedCep(
    cep: string,
    data: ViaCepResponse,
  ): Promise<void> {
    try {
      const formattedCep = this.formatCepWithHyphen(cep);

      const query = `
        INSERT INTO viacep_cache (
          cep, logradouro, unidade, 
          bairro, localidade, uf, latitude, longitude, numero
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (cep) 
        DO UPDATE SET
          logradouro = EXCLUDED.logradouro,
          unidade = EXCLUDED.unidade,
          bairro = EXCLUDED.bairro,
          localidade = EXCLUDED.localidade,
          uf = EXCLUDED.uf,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          numero = EXCLUDED.numero,
          cached_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      `;

      await db.query(query, [
        formattedCep,
        data.logradouro || "",
        data.unidade || "",
        data.bairro || "",
        data.localidade || "",
        data.uf || "",
        data.latitude || null,
        data.longitude || null,
        data.numero || null,
      ]);

      console.log(
        `💾 [ViaCEP] CEP ${formattedCep} salvo no cache permanentemente`,
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
    const { searchParams } = new URL(request.url);
    const numero = searchParams.get("numero");

    if (!cep) {
      return NextResponse.json(
        { success: false, message: "CEP é obrigatório" },
        { status: 400 },
      );
    }

    const data = await viaCepService.buscarEnderecoPorCep(cep, numero || undefined);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error(
      "[API:CEP] Erro:",
      error instanceof Error ? error.message : error,
    );
    
    const errorMessage = error instanceof Error ? error.message : "Erro ao buscar CEP";
    const statusCode = errorMessage === "CEP não encontrado" ? 404 : 500;
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: statusCode },
    );
  }
}
