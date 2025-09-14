/**
 * Construtor de queries SQL para busca de estabelecimentos de saúde
 * Separa a lógica de construção de queries do serviço principal
 */

import { FiltroSaude } from '../../../types/saude';
import { obterTiposFiltrados } from './TipoMapper';

/**
 * Constrói a cláusula WHERE baseada nos filtros
 * @param filtros Filtros de saúde aplicados
 * @returns Array de condições WHERE
 */
function construirCondicoesWhere(filtros: FiltroSaude): string[] {
  const whereConditions: string[] = [];
  
  // Filtros por tipo de estabelecimento
  const tiposFiltrados = obterTiposFiltrados(filtros);
  
  if (tiposFiltrados.length > 0) {
    if (tiposFiltrados.includes("'%'")) {
      // Se '%' está presente, não adicionar filtro de tipo (mostrar todos)
    } else {
      whereConditions.push(`tipo IN (${tiposFiltrados.join(', ')})`);
    }
  }
  
  // Filtros por esfera administrativa
  const esferasFiltradas: string[] = [];
  if (filtros.municipal) esferasFiltradas.push("'Municipal'", "'Estadual'"); // Público
  if (filtros.privado) esferasFiltradas.push("'Privado'"); // Privado
  
  // Se nenhuma esfera foi selecionada, mostrar todas as esferas
  if (esferasFiltradas.length === 0) {
    esferasFiltradas.push("'Municipal'", "'Estadual'", "'Privado'");
  }
  
  if (esferasFiltradas.length > 0) {
    whereConditions.push(`esfera_administrativa IN (${esferasFiltradas.join(', ')})`);
  }
  
  // Condições básicas
  whereConditions.push('ativo = true'); // PostgreSQL usa true
  whereConditions.push('latitude IS NOT NULL');
  whereConditions.push('longitude IS NOT NULL');
  
  return whereConditions;
}

/**
 * Constrói a query SQL completa para busca de estabelecimentos
 * @param filtros Filtros de saúde aplicados
 * @returns Query SQL completa
 */
export function construirQuerySQL(filtros: FiltroSaude): string {
  const whereConditions = construirCondicoesWhere(filtros);
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  return `
    SELECT 
      id,
      nome,
      tipo,
      endereco,
      bairro,
      regiao,
      cep,
      latitude,
      longitude,
      esfera_administrativa,
      ativo
    FROM estabelecimentos_saude
    ${whereClause}
    ORDER BY nome
  `;
}

/**
 * Constrói query para obter estatísticas dos dados
 * @returns Query SQL para estatísticas
 */
export function construirQueryEstatisticas(): {
  total: string;
  porEsfera: string;
  porRegiao: string;
} {
  return {
    total: 'SELECT COUNT(*) as total FROM estabelecimentos_saude WHERE ativo = true',
    porEsfera: `
      SELECT esfera_administrativa, COUNT(*) as count 
      FROM estabelecimentos_saude 
      WHERE ativo = true 
      GROUP BY esfera_administrativa
    `,
    porRegiao: `
      SELECT regiao, COUNT(*) as count 
      FROM estabelecimentos_saude 
      WHERE ativo = true AND regiao IS NOT NULL
      GROUP BY regiao
    `
  };
}
