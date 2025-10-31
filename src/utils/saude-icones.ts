/**
 * Mapeamento de tipos de estabelecimentos de saúde para ícones com numeração
 * Cada tipo único recebe um número sequencial (1, 2, 3...)
 */

export interface TipoIcone {
  numero: number; // Número do tipo (1, 2, 3...)
  icone: string; // Número como texto para exibir no mapa
  nome: string; // Nome amigável do tipo
  cor: string; // Cor para usar no mapa/cartões
  categoria?: string; // Categoria do tipo
}

// Paleta de cores para os números
export const CORES_NUMEROS: string[] = [
  '#3B82F6', // Azul - 1
  '#EF4444', // Vermelho - 2
  '#F97316', // Laranja - 3
  '#10B981', // Verde - 4
  '#6B7280', // Cinza - 5
  '#8B5CF6', // Roxo - 6
  '#EC4899', // Rosa - 7
  '#06B6D4', // Ciano - 8
  '#84CC16', // Verde lima - 9
  '#F59E0B', // Âmbar - 10
  '#DC2626', // Vermelho escuro - 11
  '#6366F1', // Índigo - 12
  '#14B8A6', // Teal - 13
  '#A855F7', // Violeta - 14
  '#F43F5E', // Rosa escuro - 15
  '#0EA5E9', // Sky - 16
  '#22C55E', // Verde claro - 17
  '#EAB308', // Amarelo - 18
  '#FB923C', // Laranja claro - 19
  '#9333EA', // Roxo escuro - 20
];

// Função para obter cor baseada no número
function obterCorPorNumero(numero: number): string {
  return CORES_NUMEROS[(numero - 1) % CORES_NUMEROS.length];
}

/**
 * Lista ordenada de tipos únicos com numeração
 * Principais primeiro, depois organizados por categoria
 */
export const TIPOS_NUMERADOS: Array<{
  tipo: string;
  numero: number;
  nome: string;
  categoria: string;
}> = [
  // PRINCIPAIS (1-5)
  { tipo: 'UNIDADE BASICA DE SAUDE', numero: 1, nome: 'UBS', categoria: 'Principais' },
  { tipo: 'HOSPITAL GERAL', numero: 2, nome: 'Hospital Geral', categoria: 'Principais' },
  { tipo: 'HOSPITAL', numero: 3, nome: 'Hospital', categoria: 'Principais' },
  { tipo: 'HOSPITAL ESPECIALIZADO', numero: 4, nome: 'Hospital Especializado', categoria: 'Principais' },
  { tipo: 'PRONTO SOCORRO GERAL', numero: 5, nome: 'Pronto Socorro Geral', categoria: 'Principais' },
  { tipo: 'PRONTO SOCORRO ESPECIALIZADO', numero: 5, nome: 'Pronto Socorro Geral', categoria: 'Principais' },
  { tipo: 'PRONTO ATENDIMENTO', numero: 6, nome: 'Pronto Atendimento', categoria: 'Principais' },
  { tipo: 'AMA ESPECIALIDADES', numero: 7, nome: 'AMA', categoria: 'Principais' },
  { tipo: 'ASSISTENCIA MEDICA AMBULATORIAL', numero: 7, nome: 'AMA', categoria: 'Principais' },
  { tipo: 'CENTRO DE ATENCAO PSICOSSOCIAL ADULTO', numero: 8, nome: 'CAPS', categoria: 'Principais' },
  { tipo: 'CENTRO DE ATENCAO PSICOSSOCIAL INFANTIL', numero: 8, nome: 'CAPS', categoria: 'Principais' },
  { tipo: 'CENTRO DE ATENCAO  PSICOSSOCIAL INFANTIL', numero: 8, nome: 'CAPS', categoria: 'Principais' },
  { tipo: 'CENTRO DE ATENCAO PSICOSSOCIAL ALCOOL E DROGAS', numero: 8, nome: 'CAPS', categoria: 'Principais' },
  
  // URGÊNCIA E EMERGÊNCIA (9)
  { tipo: 'UNIDADE DE URGENCIA', numero: 9, nome: 'Unidade de Urgência', categoria: 'Urgência' },
  
  // AMBULATORIAL (10-11)
  { tipo: 'AMBULATORIO DE ESPECIALIDADES', numero: 10, nome: 'Ambulatório', categoria: 'Ambulatorial' },
  { tipo: 'AMBULATORIOS ESPECIALIZADOS', numero: 10, nome: 'Ambulatório', categoria: 'Ambulatorial' },
  { tipo: 'CENTRO DE SAUDE', numero: 11, nome: 'Centro de Saúde', categoria: 'Ambulatorial' },
  
  // SAÚDE MENTAL (12-13)
  { tipo: 'AMBULATORIO DE SAUDE MENTAL', numero: 12, nome: 'Ambulatório Saúde Mental', categoria: 'Saúde Mental' },
  { tipo: 'RESIDENCIA TERAPEUTICA RT', numero: 13, nome: 'Residência Terapêutica', categoria: 'Saúde Mental' },
  { tipo: 'RESIDENCIA TERAPEUTICA', numero: 13, nome: 'Residência Terapêutica', categoria: 'Saúde Mental' },
  
  // ODONTOLOGIA (14)
  { tipo: 'CENTRO DE ESPECIALIDADES ODONTOLOGICAS/CEO', numero: 14, nome: 'CEO', categoria: 'Odontologia' },
  { tipo: 'CLINICA ODONTOLOGICA', numero: 14, nome: 'CEO', categoria: 'Odontologia' },
  
  // DIAGNÓSTICO E LABORATÓRIO (15-17)
  { tipo: 'CENTRO E SERVICOS DE DIAGNOSTICO POR IMAGEM', numero: 15, nome: 'Diagnóstico por Imagem', categoria: 'Diagnóstico' },
  { tipo: 'SERVICO DE DIAGNOSTICO POR IMAGEM', numero: 15, nome: 'Diagnóstico por Imagem', categoria: 'Diagnóstico' },
  { tipo: 'CENTRO DE DIAGNOSTICO POR IMAGEM', numero: 15, nome: 'Diagnóstico por Imagem', categoria: 'Diagnóstico' },
  { tipo: 'LABORATORIO', numero: 16, nome: 'Laboratório', categoria: 'Diagnóstico' },
  { tipo: 'LABORATORIO DE ZOONOSES', numero: 16, nome: 'Laboratório', categoria: 'Diagnóstico' },
  { tipo: 'APOIO DIAGNOSTICO', numero: 17, nome: 'Apoio Diagnóstico', categoria: 'Diagnóstico' },
  { tipo: 'UNIDADE DE APOIO DIAGNOSE E TERAPIA', numero: 17, nome: 'Apoio Diagnóstico', categoria: 'Diagnóstico' },
  { tipo: 'SERVICO DE APOIO DIAGNOSTICO E TERAPEUTICO', numero: 17, nome: 'Apoio Diagnóstico', categoria: 'Diagnóstico' },
  
  // REABILITAÇÃO (18-20)
  { tipo: 'CENTRO ESPECIALIZADO EM REABILITACAO', numero: 18, nome: 'Reabilitação', categoria: 'Reabilitação' },
  { tipo: 'CENTRO DE REABILITACAO', numero: 18, nome: 'Reabilitação', categoria: 'Reabilitação' },
  { tipo: 'NUCLEO INTEGRADO DE REABILITACAO', numero: 18, nome: 'Reabilitação', categoria: 'Reabilitação' },
  { tipo: 'NUCLEO INTEGRADO DE SAUDE AUDITIVA', numero: 19, nome: 'Saúde Auditiva', categoria: 'Reabilitação' },
  { tipo: 'CENTRO DE RECUPERACAO E EDUCACAO NUTRICIONAL', numero: 20, nome: 'Nutrição', categoria: 'Reabilitação' },
  
  // ESPECIALIDADES E OUTROS SERVIÇOS (21-25)
  { tipo: 'FARMACIA POPULAR', numero: 21, nome: 'Farmácia Popular', categoria: 'Especialidades' },
  { tipo: 'MATERNIDADE', numero: 22, nome: 'Maternidade', categoria: 'Especialidades' },
  { tipo: 'CASA DO PARTO', numero: 22, nome: 'Maternidade', categoria: 'Especialidades' },
  { tipo: 'PROGRAMAS E SERVICOS', numero: 23, nome: 'Programas e Serviços', categoria: 'Especialidades' },
  { tipo: 'PROGRMAS E SERVICOS', numero: 23, nome: 'Programas e Serviços', categoria: 'Especialidades' }, // Typo no JSON
  { tipo: 'OUTROS ESTABELECIMENTOS SERVICOS E PROGRAMAS', numero: 23, nome: 'Programas e Serviços', categoria: 'Especialidades' },
  { tipo: 'CLINICA ESPECIALIZADA', numero: 24, nome: 'Clínica Especializada', categoria: 'Especialidades' },
  { tipo: 'INSTITUTO', numero: 25, nome: 'Instituto', categoria: 'Especialidades' },
  
  // DST/AIDS (26-27)
  { tipo: 'SERVICO DE ATENDIMENTO ESPECIALIZADO EM DST/AIDS', numero: 26, nome: 'DST/AIDS', categoria: 'DST/AIDS' },
  { tipo: 'SERVICO DE ATENDIMENTO ESPECIALIZADO EM  DST/AIDS', numero: 26, nome: 'DST/AIDS', categoria: 'DST/AIDS' },
  { tipo: 'SERVICO DE ATENDIMENTO ESPECIALIZADO EM DST/AIDS E UAD', numero: 26, nome: 'DST/AIDS e UAD', categoria: 'DST/AIDS' },
  { tipo: 'SERVICO DE ATENDIMENTO ESPECIALIZADO EM  DST/AIDS E UAD', numero: 26, nome: 'DST/AIDS e UAD', categoria: 'DST/AIDS' },
  { tipo: 'CENTRO REFERENCIA  DST/AIDS', numero: 26, nome: 'CR DST/AIDS', categoria: 'DST/AIDS' },
  { tipo: 'CENTRO REFERENCIA DST/AIDS', numero: 26, nome: 'CR DST/AIDS', categoria: 'DST/AIDS' },
  { tipo: 'CENTRO DE TESTAGEM E ACONSELHAMENTO DST/AIDS', numero: 26, nome: 'CTA', categoria: 'DST/AIDS' },
  { tipo: 'CENTRO DE ATENCAO SAUDE SEXUAL REPRODUTIVA', numero: 27, nome: 'Saúde Sexual', categoria: 'DST/AIDS' },
  
  // OUTROS SERVIÇOS ESPECIALIZADOS (28-36)
  { tipo: 'CENTRO DE REFERENCIA', numero: 28, nome: 'Centro de Referência', categoria: 'Outros' },
  { tipo: 'UNIDADE DE REFERENCIA SAUDE IDOSO', numero: 29, nome: 'Saúde do Idoso', categoria: 'Outros' },
  { tipo: 'UNIDADE DE REFERENCIA SAUDE DO IDOSO', numero: 29, nome: 'Saúde do Idoso', categoria: 'Outros' },
  { tipo: 'CENTRO REFERENCIA DE SAUDE DO TRABALHADOR', numero: 30, nome: 'Saúde do Trabalhador', categoria: 'Outros' },
  { tipo: 'CENTRO DE CONTROLE DE ZOONOSES - CCZ', numero: 31, nome: 'Controle de Zoonoses', categoria: 'Outros' },
  { tipo: 'HEMOCENTRO', numero: 32, nome: 'Hemocentro', categoria: 'Outros' },
  { tipo: 'SERVICOS DE NEFROLOGIA', numero: 33, nome: 'Nefrologia', categoria: 'Outros' },
  { tipo: 'SERVICO ATENCAO INTEGRAL AO DEPENDENTE', numero: 34, nome: 'Atendimento ao Dependente', categoria: 'Outros' },
  { tipo: 'UNIDADE DE ATENDIMENTO AO DEPENDENTE (UNAD)', numero: 34, nome: 'UNAD', categoria: 'Outros' },
  { tipo: 'ASSOCIACAO DE PAIS E  AMIGOS EXCEPCIONAIS', numero: 35, nome: 'APAE', categoria: 'Outros' },
  { tipo: 'SUPERVISAO DE VIGILANCIA EM SAUDE', numero: 36, nome: 'Supervisão Vigilância', categoria: 'Outros' },
  { tipo: 'SUPERVISAO TECNICA DE SAUDE', numero: 36, nome: 'Supervisão Técnica', categoria: 'Outros' },
  { tipo: 'CENTRO DE CONVIVENCIA E COOPERATIVA (CECCO)', numero: 37, nome: 'CECCO', categoria: 'Outros' },
  { tipo: 'MEDICINAS NATURAIS', numero: 38, nome: 'Medicinas Naturais', categoria: 'Outros' },
  { tipo: 'MEDICINAS TRADICIONAIS', numero: 38, nome: 'Medicinas Naturais', categoria: 'Outros' },
  { tipo: 'HORA CERTA', numero: 39, nome: 'Hora Certa', categoria: 'Outros' },
];

// Criar mapeamento por tipo
const MAPEAMENTO_POR_TIPO: Record<string, TipoIcone> = {};

TIPOS_NUMERADOS.forEach(({ tipo, numero, nome, categoria }) => {
  // Normalizar: uppercase, trim, e normalizar espaços múltiplos para espaço simples
  const tipoNormalizado = tipo.toUpperCase().trim().replace(/\s+/g, ' ');
  const tipoOriginal = tipo.toUpperCase().trim();
  
  const iconData = {
    numero,
    icone: numero.toString(),
    nome,
    cor: obterCorPorNumero(numero),
    categoria,
  };
  
  // Criar entrada com tipo normalizado
  MAPEAMENTO_POR_TIPO[tipoNormalizado] = iconData;
  
  // Se o tipo original é diferente (tem espaços múltiplos), criar entrada também
  if (tipoOriginal !== tipoNormalizado) {
    MAPEAMENTO_POR_TIPO[tipoOriginal] = iconData;
  }
});

// Obter lista de tipos únicos (um de cada número)
export const TIPOS_UNICOS_NUMERADOS: Array<{
  numero: number;
  nome: string;
  categoria: string;
  cor: string;
  tipos: string[];
}> = [];

const tiposPorNumero = new Map<number, { nome: string; categoria: string; tipos: string[] }>();

TIPOS_NUMERADOS.forEach(({ tipo, numero, nome, categoria }) => {
  if (!tiposPorNumero.has(numero)) {
    tiposPorNumero.set(numero, { nome, categoria, tipos: [] });
  }
  const entry = tiposPorNumero.get(numero)!;
  if (!entry.tipos.includes(tipo)) {
    entry.tipos.push(tipo);
  }
});

tiposPorNumero.forEach((value, numero) => {
  TIPOS_UNICOS_NUMERADOS.push({
    numero,
    cor: obterCorPorNumero(numero),
    ...value,
  });
});

// Ordenar por número
TIPOS_UNICOS_NUMERADOS.sort((a, b) => a.numero - b.numero);

/**
 * Obtém o ícone (número) para um tipo específico
 */
export function obterIconePorTipo(tipo: string): TipoIcone {
  // Normalizar: uppercase, trim, e normalizar espaços múltiplos
  const tipoNormalizado = tipo.toUpperCase().trim().replace(/\s+/g, ' ');
  
  // Tentar encontrar no mapeamento
  if (MAPEAMENTO_POR_TIPO[tipoNormalizado]) {
    return MAPEAMENTO_POR_TIPO[tipoNormalizado];
  }
  
  // Tentar também sem normalizar espaços (compatibilidade)
  const tipoOriginal = tipo.toUpperCase().trim();
  if (MAPEAMENTO_POR_TIPO[tipoOriginal]) {
    return MAPEAMENTO_POR_TIPO[tipoOriginal];
  }
  
  // Tipo não encontrado - retornar padrão
  return {
    numero: 99,
    icone: '?',
    nome: tipo,
    cor: '#6B7280',
    categoria: 'Outros',
  };
}

/**
 * Obtém o tipo mais frequente de uma lista de estabelecimentos
 */
export function obterTipoMaisFrequente(
  estabelecimentos: Array<{ tipo: string }>
): string {
  if (estabelecimentos.length === 0) return '';
  if (estabelecimentos.length === 1) return estabelecimentos[0].tipo;
  
  const contagem: Record<string, number> = {};
  
  estabelecimentos.forEach(est => {
    // Normalizar tipo para agrupamento (normalizar espaços múltiplos)
    const tipo = est.tipo.toUpperCase().trim().replace(/\s+/g, ' ');
    contagem[tipo] = (contagem[tipo] || 0) + 1;
  });
  
  const tipoMaisFrequente = Object.entries(contagem).reduce((prev, current) => {
    return current[1] > prev[1] ? current : prev;
  });
  
  // Retornar o tipo original do primeiro estabelecimento que corresponde ao tipo mais frequente
  const tipoFreqNormalizado = tipoMaisFrequente[0];
  const estabelecimentoEncontrado = estabelecimentos.find(est => {
    const tipoNormalizado = est.tipo.toUpperCase().trim().replace(/\s+/g, ' ');
    return tipoNormalizado === tipoFreqNormalizado;
  });
  
  // Retornar o tipo original (com espaços como está no JSON)
  return estabelecimentoEncontrado ? estabelecimentoEncontrado.tipo : tipoMaisFrequente[0];
}

/**
 * Converte números selecionados para filtros booleanos
 * Cada número selecionado busca apenas seus tipos correspondentes
 */
export async function converterNumerosParaFiltros(
  numeros: Set<number> | number[],
  filtrosAtuais: Record<string, boolean>
): Promise<Record<string, boolean>> {
  const { TIPOS_MAPEADOS } = await import('./saude-categorias');
  const novosFiltros = { ...filtrosAtuais };
  
  // Resetar todos os filtros de tipo
  Object.keys(novosFiltros).forEach(key => {
    if (key !== 'municipal' && key !== 'estadual' && key !== 'privado') {
      novosFiltros[key] = false;
    }
  });

  const numerosArray = Array.from(numeros);
  
  // Coletar todos os tipos dos números selecionados
  const tiposDosNumerosSelecionados = new Set<string>();
  TIPOS_UNICOS_NUMERADOS.forEach((tipoNumero) => {
    if (numerosArray.includes(tipoNumero.numero)) {
      tipoNumero.tipos.forEach(tipo => {
        tiposDosNumerosSelecionados.add(tipo.toUpperCase().trim());
      });
    }
  });

  // Ativar filtros que contêm pelo menos um tipo dos números selecionados
  Object.entries(TIPOS_MAPEADOS).forEach(([filtroKey, tiposMapeados]) => {
    const tiposMapeadosUpper = tiposMapeados.map(t => t.toUpperCase().trim());
    
    // Se algum tipo do filtro está nos tipos selecionados, ativar o filtro
    const temTipoSelecionado = tiposMapeadosUpper.some(tipo => tiposDosNumerosSelecionados.has(tipo));
    
    if (temTipoSelecionado) {
      novosFiltros[filtroKey] = true;
    }
  });

  return novosFiltros;
}

/**
 * Obtém os tipos de estabelecimento diretamente dos números selecionados
 * (sem passar pelos filtros booleanos intermediários)
 */
export function obterTiposPorNumeros(numeros: Set<number> | number[]): string[] {
  const numerosArray = Array.from(numeros);
  const tipos = new Set<string>();
  
  // Buscar todos os tipos dos números selecionados diretamente de TIPOS_NUMERADOS
  // para garantir que todos os tipos sejam incluídos (incluindo variações com espaços)
  TIPOS_NUMERADOS.forEach(({ tipo, numero }) => {
    if (numerosArray.includes(numero)) {
      tipos.add(tipo);
    }
  });
  
  const tiposArray = Array.from(tipos);
  
  // Debug
  if (process.env.NODE_ENV === 'development') {
    console.log('🔢 [obterTiposPorNumeros] Números:', numerosArray);
    console.log('📋 [obterTiposPorNumeros] Tipos retornados:', tiposArray.length, 'tipos');
    if (numerosArray.length <= 3) {
      console.log('📋 [obterTiposPorNumeros] Tipos detalhados:', tiposArray);
    }
  }
  
  return tiposArray;
}
