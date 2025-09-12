import { EstabelecimentoSaude, FiltroSaude } from '../../types/saude';
import db from '../database';

// Função para calcular distância entre duas coordenadas (Haversine)
function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distância em km
}

// Função para obter código do tipo baseado no tipo real da tabela
function obterTipoCodigo(tipo: string): string {
  switch (tipo) {
    case 'UNIDADE BASICA DE SAUDE': return '05'; // UBS
    case 'HOSPITAL':
    case 'HOSPITAL GERAL':
    case 'HOSPITAL ESPECIALIZADO': return '01'; // Hospital
    case 'AMBULATORIO DE ESPECIALIDADES':
    case 'CENTRO DE SAUDE':
    case 'CLINICA ESPECIALIZADA': return '02'; // Posto
    case 'ASSISTENCIA MEDICA AMBULATORIAL':
    case 'AMA ESPECIALIDADES': return '06'; // AMA
    case 'CENTRO DE ATENCAO PSICOSSOCIAL ADULTO':
    case 'CENTRO DE ATENCAO PSICOSSOCIAL ALCOOL E DROGAS':
    case 'CENTRO DE ATENCAO  PSICOSSOCIAL INFANTIL': return '07'; // CAPS
    case 'CENTRO DE ESPECIALIDADES ODONTOLOGICAS/CEO':
    case 'CLINICA ODONTOLOGICA': return '08'; // Saúde Bucal
    case 'PRONTO ATENDIMENTO':
    case 'URGENCIA':
    case 'UPA': return '09'; // Urgência
    case 'MATERNIDADE':
    case 'CASA DO PARTO': return '10'; // Maternidade
    case 'FARMACIA':
    case 'FARMÁCIA': return '11'; // Farmácia
    case 'ACADEMIA':
    case 'ACADEMIA DA SAUDE': return '12'; // Academia
    case 'DOENCAS RARAS':
    case 'RARAS': return '13'; // Doenças Raras
    default: return '05'; // UBS por padrão
  }
}

// Função para construir query SQL baseada nos filtros (independentes)
function construirQuerySQL(filtros: FiltroSaude): string {
  const whereConditions: string[] = [];
  
  // Filtros por tipo de estabelecimento (baseado na coluna 'tipo' da tabela)
  const tiposFiltrados: string[] = [];
  if (filtros.ubs) tiposFiltrados.push("'UNIDADE BASICA DE SAUDE'");
  if (filtros.hospitais) tiposFiltrados.push("'HOSPITAL'", "'HOSPITAL GERAL'", "'HOSPITAL ESPECIALIZADO'");
  if (filtros.postos) tiposFiltrados.push("'AMBULATORIO DE ESPECIALIDADES'", "'CENTRO DE SAUDE'", "'CLINICA ESPECIALIZADA'");
  if (filtros.farmacias) tiposFiltrados.push("'FARMACIA'", "'FARMÁCIA'");
  if (filtros.maternidades) tiposFiltrados.push("'MATERNIDADE'", "'CASA DO PARTO'");
  if (filtros.urgencia) tiposFiltrados.push("'PRONTO ATENDIMENTO'", "'URGENCIA'", "'UPA'");
  if (filtros.academias) tiposFiltrados.push("'ACADEMIA'", "'ACADEMIA DA SAUDE'");
  if (filtros.caps) tiposFiltrados.push("'CENTRO DE ATENCAO PSICOSSOCIAL ADULTO'", "'CENTRO DE ATENCAO PSICOSSOCIAL ALCOOL E DROGAS'", "'CENTRO DE ATENCAO  PSICOSSOCIAL INFANTIL'");
  if (filtros.saudeBucal) tiposFiltrados.push("'CENTRO DE ESPECIALIDADES ODONTOLOGICAS/CEO'", "'CLINICA ODONTOLOGICA'");
  if (filtros.doencasRaras) tiposFiltrados.push("'DOENCAS RARAS'", "'RARAS'");
  if (filtros.ama) tiposFiltrados.push("'ASSISTENCIA MEDICA AMBULATORIAL'", "'AMA ESPECIALIDADES'");
  if (filtros.programas) tiposFiltrados.push("'PROGRAMAS E SERVICOS'", "'PROGRMAS E SERVICOS'");
  if (filtros.diagnostico) tiposFiltrados.push("'SERVICO DE DIAGNOSTICO POR IMAGEM'", "'CENTRO DE DIAGNOSTICO POR IMAGEM'");
  if (filtros.ambulatorio) tiposFiltrados.push("'AMBULATORIO DE ESPECIALIDADES'", "'AMBULATORIOS ESPECIALIZADOS'");
  if (filtros.supervisao) tiposFiltrados.push("'SUPERVISAO DE VIGILANCIA EM SAUDE'", "'SUPERVISAO TECNICA DE SAUDE'");
  if (filtros.residencia) tiposFiltrados.push("'RESIDENCIA TERAPEUTICA'");
  if (filtros.reabilitacao) tiposFiltrados.push("'CENTRO ESPECIALIZADO EM REABILITACAO'", "'CENTRO DE REABILITACAO'");
  if (filtros.apoio) tiposFiltrados.push("'UNIDADE DE APOIO DIAGNOSE E TERAPIA'", "'APOIO DIAGNOSTICO'", "'SERVICO DE APOIO DIAGNOSTICO E TERAPEUTICO'");
  if (filtros.clinica) tiposFiltrados.push("'CLINICA ESPECIALIZADA'", "'CLINICA ODONTOLOGICA'");
  if (filtros.dst) tiposFiltrados.push("'SERVICO DE ATENDIMENTO ESPECIALIZADO EM  DST/AIDS'", "'CENTRO DE TESTAGEM E ACONSELHAMENTO DST/AIDS'", "'CENTRO REFERENCIA  DST/AIDS'", "'SERVICO DE ATENDIMENTO ESPECIALIZADO EM  DST/AIDS E UAD'");
  if (filtros.prontoSocorro) tiposFiltrados.push("'PRONTO SOCORRO GERAL'");
  if (filtros.testagem) tiposFiltrados.push("'CENTRO DE TESTAGEM E ACONSELHAMENTO DST/AIDS'");
  if (filtros.auditiva) tiposFiltrados.push("'NUCLEO INTEGRADO DE SAUDE AUDITIVA'");
  if (filtros.horaCerta) tiposFiltrados.push("'HORA CERTA'");
  if (filtros.idoso) tiposFiltrados.push("'UNIDADE DE REFERENCIA SAUDE DO IDOSO'");
  if (filtros.laboratorio) tiposFiltrados.push("'LABORATORIO'", "'LABORATORIO DE ZOONOSES'");
  if (filtros.trabalhador) tiposFiltrados.push("'CENTRO REFERENCIA DE SAUDE DO TRABALHADOR'");
  if (filtros.apoioDiagnostico) tiposFiltrados.push("'APOIO DIAGNOSTICO'");
  if (filtros.apoioTerapeutico) tiposFiltrados.push("'SERVICO DE APOIO DIAGNOSTICO E TERAPEUTICO'");
  if (filtros.instituto) tiposFiltrados.push("'INSTITUTO'");
  if (filtros.apae) tiposFiltrados.push("'ASSOCIACAO DE PAIS E  AMIGOS EXCEPCIONAIS'");
  if (filtros.referencia) tiposFiltrados.push("'CENTRO REFERENCIA  DST/AIDS'", "'CENTRO DE REFERENCIA'");
  if (filtros.imagem) tiposFiltrados.push("'CENTRO DE DIAGNOSTICO POR IMAGEM'");
  if (filtros.nutricao) tiposFiltrados.push("'CENTRO DE RECUPERACAO E EDUCACAO NUTRICIONAL'");
  if (filtros.reabilitacaoGeral) tiposFiltrados.push("'CENTRO DE REABILITACAO'");
  if (filtros.nefrologia) tiposFiltrados.push("'SERVICOS DE NEFROLOGIA'");
  if (filtros.odontologica) tiposFiltrados.push("'CLINICA ODONTOLOGICA'");
  if (filtros.saudeMental) tiposFiltrados.push("'AMBULATORIO DE SAUDE MENTAL'");
  if (filtros.referenciaGeral) tiposFiltrados.push("'CENTRO DE REFERENCIA'");
  if (filtros.medicinas) tiposFiltrados.push("'MEDICINAS NATURAIS'", "'MEDICINAS TRADICIONAIS'");
  if (filtros.hemocentro) tiposFiltrados.push("'HEMOCENTRO'");
  if (filtros.zoonoses) tiposFiltrados.push("'CENTRO DE CONTROLE DE ZOONOSES - CCZ'");
  if (filtros.laboratorioZoo) tiposFiltrados.push("'LABORATORIO DE ZOONOSES'");
  if (filtros.casaParto) tiposFiltrados.push("'CASA DO PARTO'");
  if (filtros.sexual) tiposFiltrados.push("'CENTRO DE ATENCAO SAUDE SEXUAL REPRODUTIVA'");
  if (filtros.dstUad) tiposFiltrados.push("'SERVICO DE ATENDIMENTO ESPECIALIZADO EM  DST/AIDS E UAD'");
  if (filtros.capsInfantil) tiposFiltrados.push("'CENTRO DE ATENCAO PSICOSSOCIAL INFANTIL'");
  if (filtros.ambulatorios) tiposFiltrados.push("'AMBULATORIOS ESPECIALIZADOS'");
  if (filtros.programasGerais) tiposFiltrados.push("'PROGRAMAS E SERVICOS'", "'PROGRMAS E SERVICOS'");
  if (filtros.tradicionais) tiposFiltrados.push("'MEDICINAS TRADICIONAIS'");
  if (filtros.dependente) tiposFiltrados.push("'SERVICO ATENCAO INTEGRAL AO DEPENDENTE'");
  
  // Se nenhum tipo foi selecionado, mostrar todos os tipos
  if (tiposFiltrados.length === 0) {
    tiposFiltrados.push("'%'"); // Mostrar todos
  }
  
  if (tiposFiltrados.length > 0) {
    // Usar IN para busca exata na coluna tipo
    whereConditions.push(`tipo IN (${tiposFiltrados.join(', ')})`);
  }
  
  // Filtros por esfera administrativa (Público = Municipal + Estadual, Privado = Privado)
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
  `; // Removido LIMIT para retornar todos
}

// Função principal para buscar estabelecimentos (TODOS, sem filtro de distância)
export async function buscarEstabelecimentosBanco(
  userLat: number, 
  userLng: number, 
  filtros: FiltroSaude
): Promise<EstabelecimentoSaude[]> {
  try {
    console.log('🔍 [BancoSaude] Buscando estabelecimentos no banco...');
    console.log(`📍 [BancoSaude] Coordenadas do usuário: ${userLat}, ${userLng}`);
    console.log('🔧 [BancoSaude] Filtros:', filtros);
    
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
    const rows = result.rows;
    
    console.log(`📊 [BancoSaude] Encontrados ${rows.length} estabelecimentos no banco`);
    
    // Calcular distâncias mas NÃO filtrar por raio (mostrar todos)
    const estabelecimentos = rows
      .map(row => {
        const distancia = calcularDistancia(userLat, userLng, row.latitude, row.longitude);
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
          distancia: Math.round(distancia * 1000), // Distância em metros
          cnes: undefined,
          gestao: row.esfera_administrativa === 'Municipal' ? 'Municipal' : 
                  row.esfera_administrativa === 'Estadual' ? 'Estadual' : 'Privada',
          natureza: row.esfera_administrativa === 'Privado' ? 'Privado' : 'Público',
          esfera: row.esfera_administrativa,
          vinculoSus: row.esfera_administrativa !== 'Privado',
          ativo: row.ativo === true,
          regiao: row.regiao,
          esferaAdministrativa: row.esfera_administrativa
        } as EstabelecimentoSaude;
      })
      .sort((a, b) => (a.distancia || 0) - (b.distancia || 0)); // Ordenar por distância mas mostrar todos
    
    console.log(`✅ [BancoSaude] Retornando ${estabelecimentos.length} estabelecimentos (todos)`);
    return estabelecimentos;
    
  } catch (error) {
    console.error('❌ [BancoSaude] Erro ao buscar estabelecimentos:', error);
    return [];
  }
}

// Função para obter estatísticas dos dados
export async function obterEstatisticasBanco(): Promise<{
  total: number;
  porEsfera: { [key: string]: number };
  porRegiao: { [key: string]: number };
}> {
  try {
    // Total de estabelecimentos
    const totalResult = await db.query('SELECT COUNT(*) as total FROM estabelecimentos_saude WHERE ativo = true');
    const total = parseInt(totalResult.rows[0]?.total || '0');
    
    // Por esfera administrativa
    const esferaResult = await db.query(`
      SELECT esfera_administrativa, COUNT(*) as count 
      FROM estabelecimentos_saude 
      WHERE ativo = true 
      GROUP BY esfera_administrativa
    `);
    
    const porEsfera: { [key: string]: number } = {};
    esferaResult.rows.forEach((row) => {
      const typedRow = row as { esfera_administrativa: string; count: string };
      porEsfera[typedRow.esfera_administrativa] = parseInt(typedRow.count);
    });
    
    // Por região
    const regiaoResult = await db.query(`
      SELECT regiao, COUNT(*) as count 
      FROM estabelecimentos_saude 
      WHERE ativo = true AND regiao IS NOT NULL
      GROUP BY regiao
    `);
    
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
