import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cep = searchParams.get("cep");
    const numero = searchParams.get("numero");
    
    if (!cep) {
      return NextResponse.json(
        { error: "Parâmetro 'cep' é obrigatório" },
        { status: 400 }
      );
    }
    
    // Limpar CEP (remover caracteres não numéricos)
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return NextResponse.json(
        { error: "CEP deve ter 8 dígitos" },
        { status: 400 }
      );
    }
    
    // Buscar endereço via ViaCEP
    const viaCepResponse = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (viaCepResponse.data.erro) {
      return NextResponse.json(
        { error: "CEP não encontrado" },
        { status: 404 }
      );
    }
    
    const endereco = viaCepResponse.data;
    
    // Geocodificar endereço completo para obter coordenadas
    const enderecoCompleto = `${endereco.logradouro}, ${numero || 'S/N'}, ${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}`;
    
    const nominatimResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: enderecoCompleto,
        format: 'json',
        limit: 1,
        countrycodes: 'br'
      },
      headers: {
        'User-Agent': 'ProcuraSP/1.0'
      }
    });
    
    if (nominatimResponse.data.length === 0) {
      return NextResponse.json(
        { error: "Não foi possível geocodificar o endereço" },
        { status: 404 }
      );
    }
    
    const coordenadas = nominatimResponse.data[0];
    
    return NextResponse.json({
      success: true,
      endereco: {
        logradouro: endereco.logradouro,
        bairro: endereco.bairro,
        cidade: endereco.localidade,
        uf: endereco.uf,
        cep: endereco.cep,
        numero: numero || 'S/N'
      },
      coordenadas: {
        lat: parseFloat(coordenadas.lat),
        lng: parseFloat(coordenadas.lon)
      },
      enderecoCompleto
    });
    
  } catch (error) {
    console.error("Erro na API de geocodificação:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
