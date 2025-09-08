import { NextRequest, NextResponse } from 'next/server';
import { feiraLivreService } from '../../../lib/services/feiraLivre.service';
import { FeiraLivreSearchParams } from '../../../types/feiraLivre';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endereco, numero, latitude, longitude } = body as FeiraLivreSearchParams;

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

    // Buscar feiras
    const result = await feiraLivreService.buscarFeiras({
      endereco,
      numero,
      latitude,
      longitude
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Erro ao buscar feiras' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro na API de feiras:', error);
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

