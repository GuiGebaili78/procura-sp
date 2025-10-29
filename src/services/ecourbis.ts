/**
 * Serviço para buscar dados da Ecourbis direto do navegador
 * Necessário porque a API bloqueia IPs da Vercel (fora do Brasil)
 */

import { ColetaLixo } from '../types/coletaLixo';

interface EcourbisResponse {
  query: {
    lat: number;
    lng: number;
    dst: number;
    limit: number;
  };
  result: Array<{
    id: string;
    distancia: number;
    endereco: {
      logradouro: string;
      distrito: string;
      subprefeitura: string;
    };
    domiciliar?: {
      frequencia: string;
      horarios: Record<string, string>;
      mensagem?: string;
    };
    seletiva?: {
      possue: boolean;
      frequencia: string;
      horarios: Record<string, string>;
      mensagem?: string;
    };
  }>;
}

/**
 * Busca dados da Ecourbis direto do navegador
 */
export async function buscarColetaEcourbis(
  latitude: number,
  longitude: number
): Promise<{ coletaComum: ColetaLixo[]; coletaSeletiva: ColetaLixo[] } | null> {
  try {
    console.log('🔍 [Ecourbis Client] Buscando dados...', { latitude, longitude });

    const url = `https://apicoleta.ecourbis.com.br/coleta?lat=${latitude}&lng=${longitude}&dst=100`;
    console.log('🌐 [Ecourbis Client] URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(30000) // 30 segundos
    });

    console.log('📡 [Ecourbis Client] Status:', response.status);

    if (!response.ok) {
      console.error('❌ [Ecourbis Client] Erro HTTP:', response.status);
      return null;
    }

    const data: EcourbisResponse = await response.json();
    console.log('📊 [Ecourbis Client] Dados recebidos:', {
      resultLength: data.result?.length || 0
    });

    if (!data || !data.result || data.result.length === 0) {
      console.warn('⚠️ [Ecourbis Client] Nenhum resultado');
      return null;
    }

    const coletaComum: ColetaLixo[] = [];
    const coletaSeletiva: ColetaLixo[] = [];

    // Processar apenas o primeiro item (a API retorna duplicatas)
    const item = data.result[0];
    console.log('🔍 [Ecourbis Client] Processando item:', {
      id: item.id,
      endereco: item.endereco.logradouro
    });

    // Coleta Domiciliar (Comum)
    if (item.domiciliar && item.domiciliar.frequencia) {
      console.log('✅ [Ecourbis Client] Adicionando coleta domiciliar');
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
      console.log('✅ [Ecourbis Client] Adicionando coleta seletiva');
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
      console.log(`✅ [Ecourbis Client] Sucesso! ${coletaComum.length} comum, ${coletaSeletiva.length} seletiva`);
      return { coletaComum, coletaSeletiva };
    }

    console.warn('⚠️ [Ecourbis Client] Nenhum dado válido encontrado');
    return null;

  } catch (error) {
    console.error('❌ [Ecourbis Client] Erro:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      name: error instanceof Error ? error.name : undefined
    });
    return null;
  }
}

/**
 * Processa dias da semana do formato Ecourbis (SEG/QUA/SEX)
 */
function processarDiasSemana(frequencia: string): string[] {
  if (!frequencia) return ['Conforme programação'];

  const diasMap: Record<string, string> = {
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
  const diasMap: Record<string, string> = {
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

