import { NextRequest, NextResponse } from "next/server";

interface CoordinateResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

class GeocodeService {
  /**
   * Retorna coordenadas aproximadas baseadas em endereços conhecidos de São Paulo
   */
  public async getCoordinatesFromAddress(
    query: string,
  ): Promise<CoordinateResult[]> {
    console.log(`[GeocodeService] Buscando coordenadas aproximadas para: "${query}"`);

    // Coordenadas fixas para endereços conhecidos em São Paulo
    const coordenadasConhecidas: { [key: string]: CoordinateResult } = {
      'rua ateneu': {
        lat: '-23.6066347',
        lon: '-46.6018006',
        display_name: 'Rua Ateneu, Vila Moinho Velho, São Paulo, SP',
        address: { city: 'São Paulo', state: 'SP', country: 'BR' }
      },
      'av paulista': {
        lat: '-23.5613',
        lon: '-46.6565',
        display_name: 'Avenida Paulista, São Paulo, SP',
        address: { city: 'São Paulo', state: 'SP', country: 'BR' }
      },
      'praca da se': {
        lat: '-23.5505',
        lon: '-46.6333',
        display_name: 'Praça da Sé, Centro, São Paulo, SP',
        address: { city: 'São Paulo', state: 'SP', country: 'BR' }
      }
    };

    // Normalizar query para busca
    const queryNormalizada = query.toLowerCase()
      .replace(/[,\s]+/g, ' ')
      .trim();

    // Buscar por correspondências parciais
    for (const [endereco, coords] of Object.entries(coordenadasConhecidas)) {
      if (queryNormalizada.includes(endereco) || endereco.includes(queryNormalizada.split(' ')[0])) {
        console.log(`✅ [GeocodeService] Coordenadas encontradas para: "${query}"`);
        return [coords];
      }
    }

    // Se não encontrou correspondência específica, retornar coordenadas do centro de SP
    console.log(`⚠️ [GeocodeService] Endereço não encontrado, usando centro de SP para: "${query}"`);
    return [{
      lat: '-23.5505',
      lon: '-46.6333',
      display_name: `${query}, São Paulo, SP (aproximado)`,
      address: { city: 'São Paulo', state: 'SP', country: 'BR' }
    }];
  }

  /**
   * Busca coordenadas aproximadas para endereços em São Paulo
   * @param endereco Endereço completo
   * @param bairro Bairro (opcional)
   * @param cidade Cidade (padrão: São Paulo)
   * @returns Coordenadas aproximadas ou null se não conseguir determinar
   */
  public async getCoordinatesForSaoPauloAddress(
    endereco: string,
    bairro?: string,
    cidade: string = "São Paulo"
  ): Promise<{ lat: number; lng: number } | null> {
    console.log(`🔍 [GeocodeService] Buscando coordenadas aproximadas para: "${endereco}" em ${bairro || cidade}`);
    
    const queryCompleta = `${endereco} ${bairro || ''} ${cidade}`.toLowerCase();
    
    // Usar o método de coordenadas conhecidas
    const resultados = await this.getCoordinatesFromAddress(queryCompleta);
    
    if (resultados && resultados.length > 0) {
      const resultado = resultados[0];
      const coordenadas = {
        lat: parseFloat(resultado.lat),
        lng: parseFloat(resultado.lon)
      };
      
      console.log(`✅ [GeocodeService] Coordenadas aproximadas: ${coordenadas.lat}, ${coordenadas.lng}`);
      return coordenadas;
    }
    
    console.log(`⚠️ [GeocodeService] Não foi possível determinar coordenadas para: "${endereco}"`);
    return null;
  }

  /**
   * Busca coordenadas aproximadas usando CEP (coordenadas por região)
   * @param cep CEP no formato 00000-000
   * @returns Coordenadas aproximadas baseadas na região do CEP
   */
  public async getCoordinatesFromCep(cep: string): Promise<{ lat: number; lng: number } | null> {
    console.log(`🔍 [GeocodeService] Buscando coordenadas aproximadas para CEP: ${cep}`);
    
    const cepNumerico = cep.replace(/\D/g, '');
    
    // Coordenadas por região baseadas no prefixo do CEP
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
      // Adicionar variação baseada no CEP para maior precisão
      const variacaoLat = (parseInt(cepNumerico.substring(2, 4)) / 100) * 0.01;
      const variacaoLng = (parseInt(cepNumerico.substring(4, 6)) / 100) * 0.01;
      
      const coordenadasFinais = {
        lat: coordenadas.lat + variacaoLat,
        lng: coordenadas.lng + variacaoLng
      };
      
      console.log(`✅ [GeocodeService] Coordenadas aproximadas para CEP ${cep}: ${coordenadasFinais.lat}, ${coordenadasFinais.lng}`);
      return coordenadasFinais;
    }
    
    // Fallback para centro de São Paulo
    console.log(`⚠️ [GeocodeService] CEP fora da região de SP, usando centro: ${cep}`);
    return { lat: -23.5505, lng: -46.6333 };
  }
}

const geocodeService = new GeocodeService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Parâmetro 'q' (query) é obrigatório" },
        { status: 400 },
      );
    }

    const data = await geocodeService.getCoordinatesFromAddress(query);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error(
      "[API:Geocode] Erro:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erro ao geocodificar endereço",
      },
      { status: 500 },
    );
  }
}
