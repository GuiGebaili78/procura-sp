/**
 * Mapeamento entre filtros booleanos e tipos do JSON
 * Baseado no campo "tipo" do arquivo estabelecimentos-saude.json
 */

import { FiltroSaude } from '@/types/saude';

// Mapeamento dos filtros para os tipos do JSON (campo "tipo")
export const TIPOS_MAPEADOS: Record<keyof Omit<FiltroSaude, 'municipal' | 'estadual' | 'privado'>, string[]> = {
  // Tipos Principais
  ubs: ['UNIDADE BASICA DE SAUDE'],
  hospitais: ['HOSPITAL GERAL', 'HOSPITAL', 'HOSPITAL ESPECIALIZADO'],
  postos: ['CENTRO DE SAUDE'],
  farmacias: ['FARMACIA POPULAR'],
  maternidades: ['MATERNIDADE'],
  urgencia: ['UNIDADE DE URGENCIA', 'PRONTO ATENDIMENTO'],
  prontoSocorro: ['PRONTO SOCORRO GERAL', 'PRONTO SOCORRO ESPECIALIZADO'],
  
  // Assistência Ambulatorial
  ama: ['AMA ESPECIALIDADES', 'ASSISTENCIA MEDICA AMBULATORIAL'],
  ambulatorio: ['AMBULATORIO DE ESPECIALIDADES'],
  ambulatorios: ['AMBULATORIOS ESPECIALIZADOS'],
  
  // Saúde Mental (CAPS)
  caps: [
    'CENTRO DE ATENCAO PSICOSSOCIAL ADULTO',
    'CENTRO DE ATENCAO PSICOSSOCIAL ALCOOL E DROGAS',
    'CENTRO DE CONVIVENCIA E COOPERATIVA (CECCO)'
  ],
  capsInfantil: [
    'CENTRO DE ATENCAO PSICOSSOCIAL INFANTIL',
    'CENTRO DE ATENCAO  PSICOSSOCIAL INFANTIL'
  ],
  saudeMental: ['AMBULATORIO DE SAUDE MENTAL'],
  residencia: ['RESIDENCIA TERAPEUTICA RT'],
  
  // Especialidades Odontológicas
  saudeBucal: ['CENTRO DE ESPECIALIDADES ODONTOLOGICAS/CEO', 'CLINICA ODONTOLOGICA'],
  odontologica: ['CENTRO DE ESPECIALIDADES ODONTOLOGICAS/CEO', 'CLINICA ODONTOLOGICA'],
  
  // Diagnóstico e Laboratório
  diagnostico: ['CENTRO E SERVICOS DE DIAGNOSTICO POR IMAGEM', 'SERVICO DE DIAGNOSTICO POR IMAGEM'],
  imagem: ['CENTRO DE DIAGNOSTICO POR IMAGEM', 'SERVICO DE DIAGNOSTICO POR IMAGEM'],
  laboratorio: ['LABORATORIO'],
  laboratorioZoo: ['LABORATORIO DE ZOONOSES'],
  apoioDiagnostico: ['APOIO DIAGNOSTICO', 'UNIDADE DE APOIO DIAGNOSE E TERAPIA'],
  apoioTerapeutico: ['SERVICO DE APOIO DIAGNOSTICO E TERAPEUTICO', 'UNIDADE DE APOIO DIAGNOSE E TERAPIA'],
  apoio: ['UNIDADE DE APOIO DIAGNOSE E TERAPIA'],
  
  // Reabilitação
  reabilitacao: ['CENTRO ESPECIALIZADO EM REABILITACAO'],
  reabilitacaoGeral: ['CENTRO DE REABILITACAO', 'NUCLEO INTEGRADO DE REABILITACAO'],
  auditiva: ['NUCLEO INTEGRADO DE SAUDE AUDITIVA'],
  nutricao: ['CENTRO DE RECUPERACAO E EDUCACAO NUTRICIONAL'],
  
  // DST/AIDS e Saúde Sexual
  dst: ['SERVICO DE ATENDIMENTO ESPECIALIZADO EM DST/AIDS'],
  dstUad: ['SERVICO DE ATENDIMENTO ESPECIALIZADO EM DST/AIDS E UAD'],
  referencia: ['CENTRO REFERENCIA  DST/AIDS', 'CENTRO REFERENCIA DST/AIDS'],
  referenciaGeral: ['CENTRO DE REFERENCIA'],
  testagem: ['CENTRO DE TESTAGEM E ACONSELHAMENTO DST/AIDS'],
  sexual: ['CENTRO DE ATENCAO SAUDE SEXUAL REPRODUTIVA'],
  casaParto: ['CASA DO PARTO'],
  
  // Serviços Especializados
  idoso: ['UNIDADE DE REFERENCIA SAUDE IDOSO'],
  trabalhador: ['CENTRO REFERENCIA DE SAUDE DO TRABALHADOR'],
  horaCerta: ['HORA CERTA'],
  zoonoses: ['CENTRO DE CONTROLE DE ZOONOSES - CCZ'],
  hemocentro: ['HEMOCENTRO'],
  nefrologia: ['SERVICOS DE NEFROLOGIA'],
  dependente: ['SERVICO ATENCAO INTEGRAL AO DEPENDENTE', 'UNIDADE DE ATENDIMENTO AO DEPENDENTE (UNAD)'],
  
  // Clínicas e Institutos
  clinica: ['CLINICA ESPECIALIZADA'],
  instituto: ['INSTITUTO'],
  apae: ['ASSOCIACAO DE PAIS E  AMIGOS EXCEPCIONAIS'],
  
  // Programas e Serviços
  programas: ['PROGRAMAS E SERVICOS', 'OUTROS ESTABELECIMENTOS SERVICOS E PROGRAMAS'],
  programasGerais: ['PROGRAMAS E SERVICOS', 'OUTROS ESTABELECIMENTOS SERVICOS E PROGRAMAS'],
  supervisao: ['SUPERVISAO DE VIGILANCIA EM SAUDE'],
  
  // Medicinas Alternativas
  medicinas: ['MEDICINAS NATURAIS'],
  tradicionais: ['MEDICINAS TRADICIONAIS'],
  
  // Categorias não mapeadas (vazias por enquanto)
  academias: [],
  doencasRaras: [],
};

/**
 * Converte os filtros booleanos em uma lista de tipos
 */
export function filtrosParaTipos(filtros: FiltroSaude): string[] {
  const tipos: string[] = [];
  
  // Percorrer cada filtro ativo e adicionar seus tipos correspondentes
  (Object.keys(filtros) as Array<keyof FiltroSaude>).forEach(filtro => {
    // Ignorar filtros de esfera administrativa
    if (filtro === 'municipal' || filtro === 'estadual' || filtro === 'privado') {
      return;
    }
    
    if (filtros[filtro] && TIPOS_MAPEADOS[filtro as keyof typeof TIPOS_MAPEADOS]) {
      tipos.push(...TIPOS_MAPEADOS[filtro as keyof typeof TIPOS_MAPEADOS]);
    }
  });
  
  // Remover duplicatas
  return Array.from(new Set(tipos));
}

/**
 * Filtra estabelecimentos pela esfera administrativa
 * IMPORTANTE: No UI, os filtros municipal e estadual são controlados juntos pelo checkbox "Público"
 */
export function filtrarPorEsferaAdministrativa(
  filtros: FiltroSaude,
  administracao: string | null
): boolean {
  // Se nenhum filtro de esfera está ativo, retornar false
  if (!filtros.municipal && !filtros.estadual && !filtros.privado) {
    return false;
  }
  
  if (!administracao) {
    return false;
  }
  
  const admin = administracao.toLowerCase();
  
  // Verificar se corresponde aos filtros ativos
  if (admin === 'municipal' && filtros.municipal) {
    return true;
  }
  
  if (admin === 'estadual' && filtros.estadual) {
    return true;
  }
  
  if (admin === 'privado' && filtros.privado) {
    return true;
  }
  
  return false;
}

/**
 * Obtém todos os tipos únicos do mapeamento
 */
export function obterTodosTipos(): string[] {
  const tipos = new Set<string>();
  
  Object.values(TIPOS_MAPEADOS).forEach(cats => {
    cats.forEach(cat => tipos.add(cat));
  });
  
  return Array.from(tipos).sort();
}

/**
 * Filtros padrão (UBS e Hospitais com todas as esferas administrativas)
 */
export const FILTROS_PADRAO: FiltroSaude = {
  // Principais (padrão: UBS e Hospitais)
  ubs: true,
  hospitais: true,
  postos: false,
  farmacias: false,
  maternidades: false,
  urgencia: false,
  academias: false,
  caps: false,
  saudeBucal: false,
  doencasRaras: false,
  ama: false,
  programas: false,
  diagnostico: false,
  ambulatorio: false,
  supervisao: false,
  residencia: false,
  reabilitacao: false,
  apoio: false,
  clinica: false,
  dst: false,
  prontoSocorro: false,
  testagem: false,
  auditiva: false,
  horaCerta: false,
  idoso: false,
  laboratorio: false,
  trabalhador: false,
  apoioDiagnostico: false,
  apoioTerapeutico: false,
  instituto: false,
  apae: false,
  referencia: false,
  imagem: false,
  nutricao: false,
  reabilitacaoGeral: false,
  nefrologia: false,
  odontologica: false,
  saudeMental: false,
  referenciaGeral: false,
  medicinas: false,
  hemocentro: false,
  zoonoses: false,
  laboratorioZoo: false,
  casaParto: false,
  sexual: false,
  dstUad: false,
  capsInfantil: false,
  ambulatorios: false,
  programasGerais: false,
  tradicionais: false,
  dependente: false,
  
  // Esferas administrativas (padrão: todas)
  municipal: true,
  estadual: true,
  privado: true
};
