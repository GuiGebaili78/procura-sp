import { NextRequest, NextResponse } from 'next/server';
import { coletaLixoService } from '../../../lib/services/coletaLixo.service';
import { ColetaLixoSearchParams } from '../../../types/coletaLixo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endereco, numero, latitude, longitude } = body as ColetaLixoSearchParams;

    // Validação básica
    if (!endereco || !latitude || !longitude) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Endereço, latitude e longitude são obrigatórios' 
        },
        { status: 400 }
      );
    }

    // Buscar informações de coleta de lixo
    const result = await coletaLixoService.buscarColetaLixo({
      endereco,
      numero,
      latitude,
      longitude
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Erro ao buscar informações de coleta de lixo' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro na API de coleta de lixo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Método GET não suportado. Use POST.' 
    },
    { status: 405 }
  );
}
