/**
 * Mapeador de estabelecimentos de saúde
 * Converte dados do banco para objetos EstabelecimentoSaude
 */

import { EstabelecimentoSaude } from '../../../types/saude';
import { obterTipoCodigo } from './TipoMapper';
import { calcularDistanciaEstabelecimento, Coordinates } from './DistanceCalculator';

export interface EstabelecimentoRow {
  id: number;
  nome: string;
  tipo: string;
  endereco: string;
  bairro: string;
  regiao: string;
  cep: string;
  latitude: number;
  longitude: number;
  esfera_administrativa: string;
  ativo: boolean;
}

/**
 * Mapeia uma linha do banco para EstabelecimentoSaude
 * @param row Linha do banco de dados
 * @param userCoords Coordenadas do usuário para cálculo de distância
 * @returns EstabelecimentoSaude mapeado
 */
export function mapearEstabelecimento(row: EstabelecimentoRow, userCoords: Coordinates): EstabelecimentoSaude {
  const distancia = calcularDistanciaEstabelecimento(
    userCoords,
    { lat: row.latitude, lng: row.longitude }
  );

  return {
    id: `banco_${row.id}`,
    nome: row.nome,
    tipo: row.tipo || 'Estabelecimento de Saúde',
    tipoCodigo: obterTipoCodigo(row.tipo),
    endereco: row.endereco || 'Endereço não informado',
    bairro: row.bairro || 'Bairro não informado',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: row.cep || '00000-000',
    telefone: undefined,
    coordenadas: {
      lat: row.latitude,
      lng: row.longitude
    },
    distancia: distancia,
    cnes: undefined,
    gestao: row.esfera_administrativa === 'Municipal' ? 'Municipal' : 
            row.esfera_administrativa === 'Estadual' ? 'Estadual' : 'Privada',
    natureza: row.esfera_administrativa === 'Privado' ? 'Privado' : 'Público',
    esfera: row.esfera_administrativa,
    vinculoSus: row.esfera_administrativa !== 'Privado',
    ativo: row.ativo === true,
    regiao: row.regiao,
    esferaAdministrativa: row.esfera_administrativa as 'Municipal' | 'Estadual' | 'Privado'
  };
}

/**
 * Mapeia múltiplas linhas do banco para array de EstabelecimentoSaude
 * @param rows Linhas do banco de dados
 * @param userCoords Coordenadas do usuário para cálculo de distância
 * @returns Array de EstabelecimentoSaude mapeados e ordenados por distância
 */
export function mapearEstabelecimentos(rows: EstabelecimentoRow[], userCoords: Coordinates): EstabelecimentoSaude[] {
  return rows
    .map(row => mapearEstabelecimento(row, userCoords))
    .sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
}
