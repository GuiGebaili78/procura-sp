/**
 * Sistema de tipos únicos baseado exatamente no JSON
 * Cada tipo único recebe um número e aparece no filtro com seu nome exato
 */

import { CORES_NUMEROS } from './saude-icones';

// Tipos únicos do JSON em ordem específica (principais primeiro)
export const TIPOS_UNICOS_DO_JSON: string[] = [
  // PRINCIPAIS
  'UNIDADE BASICA DE SAUDE',
  'HOSPITAL GERAL',
  'HOSPITAL',
  'HOSPITAL ESPECIALIZADO',
  'PRONTO SOCORRO GERAL',
  'PRONTO SOCORRO ESPECIALIZADO',
  'PRONTO ATENDIMENTO',
  'AMA ESPECIALIDADES',
  'ASSISTENCIA MEDICA AMBULATORIAL',
  'CENTRO DE ATENCAO PSICOSSOCIAL ADULTO',
  'CENTRO DE ATENCAO  PSICOSSOCIAL INFANTIL', // Com dois espaços (corrigido no JSON)
  'CENTRO DE ATENCAO PSICOSSOCIAL ALCOOL E DROGAS',
  
  // URGÊNCIA
  'UNIDADE DE URGENCIA',
  
  // AMBULATORIAL
  'AMBULATORIO DE ESPECIALIDADES',
  'AMBULATORIOS ESPECIALIZADOS',
  'CENTRO DE SAUDE',
  
  // SAÚDE MENTAL
  'AMBULATORIO DE SAUDE MENTAL',
  'RESIDENCIA TERAPEUTICA RT',
  'RESIDENCIA TERAPEUTICA',
  
  // ODONTOLOGIA
  'CENTRO DE ESPECIALIDADES ODONTOLOGICAS/CEO',
  'CLINICA ODONTOLOGICA',
  
  // DIAGNÓSTICO
  'CENTRO E SERVICOS DE DIAGNOSTICO POR IMAGEM',
  'SERVICO DE DIAGNOSTICO POR IMAGEM',
  'CENTRO DE DIAGNOSTICO POR IMAGEM',
  'LABORATORIO',
  'LABORATORIO DE ZOONOSES',
  'APOIO DIAGNOSTICO',
  'UNIDADE DE APOIO DIAGNOSE E TERAPIA',
  'SERVICO DE APOIO DIAGNOSTICO E TERAPEUTICO',
  
  // REABILITAÇÃO
  'CENTRO ESPECIALIZADO EM REABILITACAO',
  'CENTRO DE REABILITACAO',
  'NUCLEO INTEGRADO DE REABILITACAO',
  'NUCLEO INTEGRADO DE SAUDE AUDITIVA',
  'CENTRO DE RECUPERACAO E EDUCACAO NUTRICIONAL',
  
  // ESPECIALIDADES
  'FARMACIA POPULAR',
  'MATERNIDADE',
  'CASA DO PARTO',
  'PROGRAMAS E SERVICOS',
  'PROGRMAS E SERVICOS', // Typo no JSON
  'OUTROS ESTABELECIMENTOS SERVICOS E PROGRAMAS',
  'CLINICA ESPECIALIZADA',
  'INSTITUTO',
  
  // DST/AIDS
  'SERVICO DE ATENDIMENTO ESPECIALIZADO EM DST/AIDS',
  'SERVICO DE ATENDIMENTO ESPECIALIZADO EM  DST/AIDS',
  'SERVICO DE ATENDIMENTO ESPECIALIZADO EM DST/AIDS E UAD',
  'SERVICO DE ATENDIMENTO ESPECIALIZADO EM  DST/AIDS E UAD',
  'CENTRO REFERENCIA  DST/AIDS',
  'CENTRO REFERENCIA DST/AIDS',
  'CENTRO DE TESTAGEM E ACONSELHAMENTO DST/AIDS',
  'CENTRO DE ATENCAO SAUDE SEXUAL REPRODUTIVA',
  
  // OUTROS
  'CENTRO DE REFERENCIA',
  'UNIDADE DE REFERENCIA SAUDE IDOSO',
  'UNIDADE DE REFERENCIA SAUDE DO IDOSO',
  'CENTRO REFERENCIA DE SAUDE DO TRABALHADOR',
  'CENTRO DE CONTROLE DE ZOONOSES - CCZ',
  'HEMOCENTRO',
  'SERVICOS DE NEFROLOGIA',
  'SERVICO ATENCAO INTEGRAL AO DEPENDENTE',
  'UNIDADE DE ATENDIMENTO AO DEPENDENTE (UNAD)',
  'ASSOCIACAO DE PAIS E  AMIGOS EXCEPCIONAIS',
  'SUPERVISAO DE VIGILANCIA EM SAUDE',
  'SUPERVISAO TECNICA DE SAUDE',
  'CENTRO DE CONVIVENCIA E COOPERATIVA (CECCO)',
  'MEDICINAS NATURAIS',
  'MEDICINAS TRADICIONAIS',
  'HORA CERTA',
];

// Função para obter cor baseada no número
function obterCorPorNumero(numero: number): string {
  return CORES_NUMEROS[(numero - 1) % CORES_NUMEROS.length];
}

/**
 * Formata o nome do tipo para exibição (primeira letra maiúscula, abreviações em maiúsculas)
 */
function formatarNomeTipo(tipo: string): string {
  if (!tipo || typeof tipo !== 'string') return tipo || '';
  
  // Lista de abreviações que devem ficar em maiúsculas
  const abreviacoes = ['UBS', 'AMA', 'AIDS', 'DST', 'CAPS', 'CEO', 'CTA', 'CR', 'UNAD', 'CCZ', 'APAE', 'CECCO', 'ESF', 'NASF', 'PAI', 'RT'];
  
  // Dividir o tipo em palavras (incluindo palavras com barras ou parênteses)
  const palavras = tipo.split(/\s+/);
  
  return palavras.map((palavra, index) => {
    // Remover espaços extras e normalizar
    const palavraLimpa = palavra.trim();
    if (!palavraLimpa) return '';
    
    // Verificar se contém abreviação (como "CEO", "DST/AIDS", etc)
    const palavraUpper = palavraLimpa.toUpperCase();
    const contemAbreviacao = abreviacoes.some(abrev => palavraUpper.includes(abrev));
    
    // Preposições e artigos comuns que devem ficar em minúsculas: de, da, do, e, em, na, no, por, para, com, sem
    const preposicoes = ['de', 'da', 'do', 'e', 'em', 'na', 'no', 'por', 'para', 'com', 'sem', 'a', 'o', 'ao', 'à'];
    
    // Sempre colocar preposições em minúsculas (verificar ANTES de outras regras)
    if (preposicoes.includes(palavraLimpa.toLowerCase())) {
      return palavraLimpa.toLowerCase();
    }
    
    // Se contém abreviação, manter abreviações em maiúsculas
    if (contemAbreviacao) {
      let resultado = palavraLimpa;
      abreviacoes.forEach(abrev => {
        const regex = new RegExp(abrev, 'gi');
        resultado = resultado.replace(regex, abrev);
      });
      
      // Capitalizar partes que não são abreviações
      const partes = resultado.split(/(\/|\(|\))/);
      return partes.map(parte => {
        if (abreviacoes.some(abrev => parte.toUpperCase() === abrev) || /^[\/\(\)]$/.test(parte)) {
          return parte;
        }
        if (parte.length > 0) {
          return parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase();
        }
        return parte;
      }).join('');
    }
    
    // Se for palavra muito curta que parece abreviação (2-4 letras e todas maiúsculas no original)
    // MAS não se for uma preposição (já tratada acima)
    if (palavraLimpa.length <= 4 && palavraLimpa === palavraUpper && /^[A-Z]+$/.test(palavraLimpa)) {
      return palavraUpper;
    }
    
    // Capitalizar: primeira letra maiúscula, resto minúsculo
    return palavraLimpa.charAt(0).toUpperCase() + palavraLimpa.slice(1).toLowerCase();
  }).join(' ').trim();
}

// Criar mapeamento: tipo -> número
export const MAPEAMENTO_TIPO_NUMERO: Record<string, number> = {};
export const MAPEAMENTO_NUMERO_TIPO: Record<number, string> = {};
export const TIPOS_COM_NUMERO: Array<{
  numero: number;
  tipo: string;
  cor: string;
  categoria: string;
  nomeFormatado: string;
}> = [];

TIPOS_UNICOS_DO_JSON.forEach((tipo, index) => {
  const numero = index + 1;
  const tipoNormalizado = tipo.toUpperCase().trim();
  
  // Determinar categoria
  let categoria = 'Outros';
  if (numero <= 13) categoria = 'Principais';
  else if (tipo.includes('URGENCIA')) categoria = 'Urgência';
  else if (tipo.includes('AMBULATORIO') || tipo.includes('CENTRO DE SAUDE')) categoria = 'Ambulatorial';
  else if (tipo.includes('MENTAL') || tipo.includes('TERAPEUTICA')) categoria = 'Saúde Mental';
  else if (tipo.includes('ODONTOLOGIA') || tipo.includes('CEO')) categoria = 'Odontologia';
  else if (tipo.includes('DIAGNOSTICO') || tipo.includes('LABORATORIO') || tipo.includes('IMAGEM')) categoria = 'Diagnóstico';
  else if (tipo.includes('REABILITACAO') || tipo.includes('AUDITIVA') || tipo.includes('NUTRICIONAL')) categoria = 'Reabilitação';
  else if (tipo.includes('FARMACIA') || tipo.includes('MATERNIDADE') || tipo.includes('PROGRAMAS') || tipo.includes('CLINICA') || tipo.includes('INSTITUTO')) categoria = 'Especialidades';
  else if (tipo.includes('DST') || tipo.includes('AIDS') || tipo.includes('SEXUAL')) categoria = 'DST/AIDS';
  
  MAPEAMENTO_TIPO_NUMERO[tipoNormalizado] = numero;
  MAPEAMENTO_TIPO_NUMERO[tipo] = numero; // Também criar com tipo original
  MAPEAMENTO_NUMERO_TIPO[numero] = tipo;
  
  TIPOS_COM_NUMERO.push({
    numero,
    tipo,
    cor: obterCorPorNumero(numero),
    categoria,
    nomeFormatado: formatarNomeTipo(tipo), // Nome formatado para exibição
  });
});

/**
 * Obtém o número para um tipo específico
 */
export function obterNumeroPorTipo(tipo: string): number {
  const tipoNormalizado = tipo.toUpperCase().trim().replace(/\s+/g, ' ');
  const tipoOriginal = tipo.toUpperCase().trim();
  
  if (MAPEAMENTO_TIPO_NUMERO[tipoNormalizado]) {
    return MAPEAMENTO_TIPO_NUMERO[tipoNormalizado];
  }
  if (MAPEAMENTO_TIPO_NUMERO[tipoOriginal]) {
    return MAPEAMENTO_TIPO_NUMERO[tipoOriginal];
  }
  
  // Tipo não encontrado - retornar 99
  return 99;
}

/**
 * Obtém informações completas de um tipo
 */
export function obterInfoPorTipo(tipo: string): {
  numero: number;
  tipo: string;
  cor: string;
  categoria: string;
  nomeFormatado: string;
} {
  const numero = obterNumeroPorTipo(tipo);
  const info = TIPOS_COM_NUMERO.find(t => t.numero === numero);
  
  if (info) {
    return info;
  }
  
  // Tipo não encontrado
  return {
    numero: 99,
    tipo,
    cor: '#6B7280',
    categoria: 'Outros',
    nomeFormatado: formatarNomeTipo(tipo),
  };
}

/**
 * Obtém tipos por números selecionados
 */
export function obterTiposPorNumeros(numeros: Set<number> | number[]): string[] {
  const numerosArray = Array.from(numeros);
  return numerosArray
    .map(num => MAPEAMENTO_NUMERO_TIPO[num])
    .filter(tipo => tipo !== undefined);
}

/**
 * Obtém o tipo mais frequente de uma lista (para agrupamento no mapa)
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
  
  // Retornar o tipo original do primeiro estabelecimento que corresponde
  const tipoFreqNormalizado = tipoMaisFrequente[0];
  const estabelecimentoEncontrado = estabelecimentos.find(est => {
    const tipoNormalizado = est.tipo.toUpperCase().trim().replace(/\s+/g, ' ');
    return tipoNormalizado === tipoFreqNormalizado;
  });
  
  return estabelecimentoEncontrado ? estabelecimentoEncontrado.tipo : tipoMaisFrequente[0];
}

