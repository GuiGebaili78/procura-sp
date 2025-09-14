/**
 * Serviço refatorado para busca de estabelecimentos de saúde
 * Usa módulos separados para melhor organização e manutenibilidade
 */

import { EstabelecimentoSaude, FiltroSaude } from '../../types/saude';
import db from '../database';
import { construirQuerySQL, construirQueryEstatisticas } from './health/QueryBuilder';
import { mapearEstabelecimentos, EstabelecimentoRow } from './health/EstabelecimentoMapper';
import { Coordinates } from './health/DistanceCalculator';

/**
 * Busca estabelecimentos de saúde no banco de dados
 * @param userLat Latitude do usuário
 * @param userLng Longitude do usuário
 * @param filtros Filtros de saúde aplicados
 * @returns Array de estabelecimentos encontrados
 */
export async function buscarEstabelecimentosBanco(
  userLat: number, 
  userLng: number, 
  filtros: FiltroSaude
): Promise<EstabelecimentoSaude[]> {
  try {
    console.log('🔍 [BancoSaude] Buscando estabelecimentos no banco...');
    console.log(`📍 [BancoSaude] Coordenadas do usuário: ${userLat}, ${userLng}`);
    console.log('🔧 [BancoSaude] Filtros:', filtros);
    
    const userCoords: Coordinates = { lat: userLat, lng: userLng };
    
    // PRIMEIRO: Testar query simples para ver se há dados
    console.log('🧪 [BancoSaude] Testando query simples...');
    const testResult = await db.query('SELECT COUNT(*) as total FROM estabelecimentos_saude WHERE ativo = true');
    const total = testResult.rows[0]?.total || '0';
    console.log(`📊 [BancoSaude] Total de registros ativos na tabela: ${total}`);
    
    // SEGUNDO: Buscar alguns registros para ver a estrutura
    const sampleResult = await db.query('SELECT * FROM estabelecimentos_saude WHERE ativo = true LIMIT 3');
    console.log('📋 [BancoSaude] Amostra de dados:', sampleResult.rows);
    
    // TERCEIRO: Construir e executar query com filtros
    const query = construirQuerySQL(filtros);
    console.log('📋 [BancoSaude] Query SQL:', query);
    
    const result = await db.query(query);
    const rows = result.rows as EstabelecimentoRow[];
    
    console.log(`📊 [BancoSaude] Encontrados ${rows.length} estabelecimentos no banco`);
    
    // Mapear e ordenar estabelecimentos
    const estabelecimentos = mapearEstabelecimentos(rows, userCoords);
    
    console.log(`✅ [BancoSaude] Retornando ${estabelecimentos.length} estabelecimentos (todos)`);
    return estabelecimentos;
    
  } catch (error) {
    console.error('❌ [BancoSaude] Erro ao buscar estabelecimentos:', error);
    return [];
  }
}

/**
 * Obtém estatísticas dos dados de estabelecimentos
 * @returns Estatísticas dos estabelecimentos
 */
export async function obterEstatisticasBanco(): Promise<{
  total: number;
  porEsfera: { [key: string]: number };
  porRegiao: { [key: string]: number };
}> {
  try {
    const queries = construirQueryEstatisticas();
    
    // Total de estabelecimentos
    const totalResult = await db.query(queries.total);
    const total = parseInt(totalResult.rows[0]?.total || '0');
    
    // Por esfera administrativa
    const esferaResult = await db.query(queries.porEsfera);
    const porEsfera: { [key: string]: number } = {};
    esferaResult.rows.forEach((row) => {
      const typedRow = row as { esfera_administrativa: string; count: string };
      porEsfera[typedRow.esfera_administrativa] = parseInt(typedRow.count);
    });
    
    // Por região
    const regiaoResult = await db.query(queries.porRegiao);
    const porRegiao: { [key: string]: number } = {};
    regiaoResult.rows.forEach((row) => {
      const typedRow = row as { regiao: string; count: string };
      porRegiao[typedRow.regiao] = parseInt(typedRow.count);
    });
    
    return { total, porEsfera, porRegiao };
    
  } catch (error) {
    console.error('❌ [BancoSaude] Erro ao obter estatísticas:', error);
    return { total: 0, porEsfera: {}, porRegiao: {} };
  }
}
