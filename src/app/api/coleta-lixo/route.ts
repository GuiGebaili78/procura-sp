import { NextRequest, NextResponse } from 'next/server';
import { ColetaLixoSearchParams, ColetaLixo, ColetaLixoResponse } from '../../../types/coletaLixo';
import axios from 'axios';
import https from 'https';

/**
 * API Route para buscar informações de Coleta de Lixo
 * Usa a API oficial da Ecourbis
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { endereco, latitude, longitude } = body as ColetaLixoSearchParams;

    // Validação básica
    if (!endereco || !latitude || !longitude) {
      console.error('❌ [ColetaLixo] Validação falhou:', { endereco, latitude, longitude });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Endereço, latitude e longitude são obrigatórios' 
        },
        { status: 400 }
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';
    console.log('🗑️ [ColetaLixo] Iniciando busca:', { 
      endereco, 
      latitude, 
      longitude,
      isProduction,
      vercel: process.env.VERCEL ? 'SIM' : 'NÃO'
    });

    // Buscar dados da Ecourbis
    const dados = await buscarDadosEcourbis(latitude, longitude);

    if (!dados) {
      const elapsed = Date.now() - startTime;
      console.warn('⚠️ [ColetaLixo] Nenhum dado encontrado', { elapsed });
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

    const elapsed = Date.now() - startTime;
    console.log(`✅ [ColetaLixo] Busca concluída:`, {
      coletaComum: response.coletaComum.length,
      coletaSeletiva: response.coletaSeletiva.length,
      elapsed
    });

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error('❌ [ColetaLixo] Erro fatal:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      elapsed
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao buscar informações de coleta' 
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
 * Busca dados do site da Ecourbis via scraping
 */
async function buscarDadosEcourbis(
  latitude: number, 
  longitude: number
): Promise<{ coletaComum: ColetaLixo[], coletaSeletiva: ColetaLixo[] } | null> {
  const maxRetries = 3;
  const baseTimeout = 20000; // 20 segundos base
  
  for (let tentativa = 1; tentativa <= maxRetries; tentativa++) {
    try {
      console.log(`🔍 [Ecourbis] Tentativa ${tentativa}/${maxRetries}...`, { latitude, longitude });
      
      // Buscar dados da API Ecourbis
      // URL correta: https://apicoleta.ecourbis.com.br/coleta?lat=LAT&lng=LNG&dst=100
      const apiUrl = `https://apicoleta.ecourbis.com.br/coleta?lat=${latitude}&lng=${longitude}&dst=100`;
      console.log('🌐 [Ecourbis] URL:', apiUrl);
      
      // Criar agente HTTPS que ignora verificação de certificado (apenas em dev)
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false, // Ignora erro de certificado SSL
        keepAlive: true,
        keepAliveMsecs: 1000,
        timeout: baseTimeout * tentativa // Aumenta timeout a cada tentativa
      });

      // Timeout aumenta a cada tentativa: 20s, 40s, 60s
      const timeout = baseTimeout * tentativa;
      console.log(`⏱️ [Ecourbis] Timeout configurado: ${timeout}ms`);

      const apiResponse = await axios.get(apiUrl, {
        timeout: timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'Referer': 'https://www.ecourbis.com.br/',
          'Origin': 'https://www.ecourbis.com.br',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        httpsAgent: httpsAgent,
        validateStatus: (status) => status < 500,
        maxRedirects: 5
      });

    console.log('📊 [Ecourbis] Resposta recebida:', {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      hasData: !!apiResponse.data,
      hasResult: !!apiResponse.data?.result,
      resultLength: apiResponse.data?.result?.length || 0
    });

    // Verificar status HTTP
    if (apiResponse.status !== 200) {
      console.error('❌ [Ecourbis] Status HTTP não OK:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        data: apiResponse.data
      });
      return null;
    }
    
    if (!apiResponse.data || !apiResponse.data.result || apiResponse.data.result.length === 0) {
      console.warn('⚠️ [Ecourbis] Nenhum resultado na resposta');
      return null;
    }

    const coletaComum: ColetaLixo[] = [];
    const coletaSeletiva: ColetaLixo[] = [];
    
    const item = apiResponse.data.result[0];
    console.log('✅ [Ecourbis API] Dados encontrados:', {
      endereco: item.endereco?.logradouro,
      distrito: item.endereco?.distrito
    });
    
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
        console.log(`✅ [Ecourbis] Sucesso na tentativa ${tentativa}! ${coletaComum.length} comum, ${coletaSeletiva.length} seletiva`);
        return { coletaComum, coletaSeletiva };
      }
      
      console.log('⚠️ [Ecourbis] Nenhum dado válido encontrado');
      return null;

    } catch (error) {
      const isTimeout = axios.isAxiosError(error) && 
                       (error.code === 'ECONNABORTED' || 
                        error.code === 'ETIMEDOUT' || 
                        error.message?.includes('timeout'));
      
      console.error(`❌ [Ecourbis] Erro na tentativa ${tentativa}/${maxRetries}:`, {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        code: axios.isAxiosError(error) ? error.code : undefined,
        isTimeout
      });

      // Se não for a última tentativa e for timeout, tentar novamente
      if (tentativa < maxRetries && isTimeout) {
        const waitTime = 2000 * tentativa; // Backoff: 2s, 4s
        console.log(`⏳ [Ecourbis] Aguardando ${waitTime}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue; // Tenta novamente
      }
      
      // Se for a última tentativa ou não for timeout, retorna null
      if (tentativa === maxRetries) {
        console.error('❌ [Ecourbis] Todas as tentativas falharam');
      }
      
      return null;
    }
  }
  
  return null;
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
