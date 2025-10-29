import { NextRequest, NextResponse } from 'next/server';
import { ColetaLixoSearchParams, ColetaLixo, ColetaLixoResponse } from '../../../types/coletaLixo';

// Configurar para ignorar certificados SSL problemáticos
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * API Route para buscar informações de Coleta de Lixo
 * Usa web scraping da API Ecourbis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endereco, latitude, longitude } = body as ColetaLixoSearchParams;

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

    console.log('🗑️ [ColetaLixo] Iniciando busca:', { endereco, latitude, longitude });

    // Buscar dados da Ecourbis
    const dados = await buscarDadosEcourbis(latitude, longitude);

    if (!dados) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nenhuma informação de coleta encontrada para este endereço' 
        },
        { status: 404 }
      );
    }

    const response: ColetaLixoResponse = {
      coletaComum: dados.coletaComum,
      coletaSeletiva: dados.coletaSeletiva,
      endereco,
      latitude,
      longitude,
      dataConsulta: new Date().toISOString()
    };

    console.log(`✅ [ColetaLixo] Busca concluída:`, {
      coletaComum: response.coletaComum.length,
      coletaSeletiva: response.coletaSeletiva.length
    });

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ [ColetaLixo] Erro:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
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

/**
 * Busca dados da API Ecourbis
 */
async function buscarDadosEcourbis(
  latitude: number, 
  longitude: number
): Promise<{ coletaComum: ColetaLixo[], coletaSeletiva: ColetaLixo[] } | null> {
  try {
    console.log('🔍 [Ecourbis] Buscando dados...');
    
    const url = `https://apicoleta.ecourbis.com.br/coleta?dst=100&lat=${latitude}&lng=${longitude}`;
    console.log('🌐 [Ecourbis] URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 [Ecourbis] Dados recebidos:', data);
    
    if (!data || !data.result || data.result.length === 0) {
      console.log('⚠️ [Ecourbis] Nenhum dado encontrado');
      return null;
    }

    const coletaComum: ColetaLixo[] = [];
    const coletaSeletiva: ColetaLixo[] = [];
    
    // Processar apenas o primeiro item (a API retorna duplicatas)
    const item = data.result[0];
    console.log('🔍 [Ecourbis] Processando item:', item);
    
    // Coleta Domiciliar (Comum)
    if (item.domiciliar && item.domiciliar.frequencia) {
      console.log('✅ [Ecourbis] Adicionando coleta domiciliar');
      coletaComum.push({
        id: `ecourbis-domiciliar-${item.id}`,
        tipo: 'comum',
        endereco: `${item.endereco.logradouro}, ${item.endereco.distrito}`,
        diasSemana: processarDiasSemana(item.domiciliar.frequencia),
        horarios: processarHorarios(item.domiciliar.horarios),
        frequencia: item.domiciliar.frequencia,
        observacoes: item.domiciliar.mensagem || 'Coloque o lixo na calçada até 6h da manhã'
      });
    }

    // Coleta Seletiva
    if (item.seletiva && item.seletiva.possue && item.seletiva.frequencia) {
      console.log('✅ [Ecourbis] Adicionando coleta seletiva');
      coletaSeletiva.push({
        id: `ecourbis-seletiva-${item.id}`,
        tipo: 'seletiva',
        endereco: `${item.endereco.logradouro}, ${item.endereco.distrito}`,
        diasSemana: processarDiasSemana(item.seletiva.frequencia),
        horarios: processarHorarios(item.seletiva.horarios),
        frequencia: item.seletiva.frequencia,
        observacoes: item.seletiva.mensagem || 'Separe materiais recicláveis: papel, plástico, vidro e metal'
      });
    }
    
    if (coletaComum.length > 0 || coletaSeletiva.length > 0) {
      console.log(`✅ [Ecourbis] ${coletaComum.length} comum, ${coletaSeletiva.length} seletiva`);
      return { coletaComum, coletaSeletiva };
    }
    
    console.log('⚠️ [Ecourbis] Nenhum dado válido encontrado');
    return null;

  } catch (error) {
    console.error('❌ [Ecourbis] Erro:', error);
    return null;
  }
}

/**
 * Processa dias da semana do formato Ecourbis (SEG/QUA/SEX)
 */
function processarDiasSemana(frequencia: string): string[] {
  if (!frequencia) return ['Conforme programação'];
  
  const diasMap: { [key: string]: string } = {
    'SEG': 'Segunda-feira',
    'TER': 'Terça-feira', 
    'QUA': 'Quarta-feira',
    'QUI': 'Quinta-feira',
    'SEX': 'Sexta-feira',
    'SAB': 'Sábado',
    'DOM': 'Domingo'
  };
  
  return frequencia.split('/').map(dia => diasMap[dia] || dia);
}

/**
 * Processa horários do formato Ecourbis (objeto com dias da semana)
 */
function processarHorarios(horarios: Record<string, string>): string[] {
  if (!horarios || typeof horarios !== 'object') return ['Conforme programação'];
  
  const horariosArray: string[] = [];
  const diasMap: { [key: string]: string } = {
    'seg': 'Segunda',
    'ter': 'Terça', 
    'qua': 'Quarta',
    'qui': 'Quinta',
    'sex': 'Sexta',
    'sab': 'Sábado',
    'dom': 'Domingo'
  };
  
  Object.entries(horarios).forEach(([dia, horario]) => {
    if (horario && horario !== '-') {
      horariosArray.push(`${diasMap[dia] || dia}: ${horario}`);
    }
  });
  
  return horariosArray.length > 0 ? horariosArray : ['Conforme programação'];
}
