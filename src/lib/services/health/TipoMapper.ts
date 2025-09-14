/**
 * Mapeamento de tipos de estabelecimentos de saúde
 * Converte tipos do banco de dados para códigos padronizados
 */

export interface TipoEstabelecimento {
  codigo: string;
  nome: string;
  icone: string;
  cor: string;
  marcador: string;
}

// Função para obter código do tipo baseado no tipo real da tabela
export function obterTipoCodigo(tipo: string): string {
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

// Mapeamento de tipos para filtros
export const TIPO_FILTER_MAP: Record<string, string[]> = {
  ubs: ["'UNIDADE BASICA DE SAUDE'"],
  hospitais: ["'HOSPITAL'", "'HOSPITAL GERAL'", "'HOSPITAL ESPECIALIZADO'"],
  postos: ["'AMBULATORIO DE ESPECIALIDADES'", "'CENTRO DE SAUDE'", "'CLINICA ESPECIALIZADA'"],
  farmacias: ["'FARMACIA'", "'FARMÁCIA'"],
  maternidades: ["'MATERNIDADE'", "'CASA DO PARTO'"],
  urgencia: ["'PRONTO ATENDIMENTO'", "'URGENCIA'", "'UPA'"],
  academias: ["'ACADEMIA'", "'ACADEMIA DA SAUDE'"],
  caps: ["'CENTRO DE ATENCAO PSICOSSOCIAL ADULTO'", "'CENTRO DE ATENCAO PSICOSSOCIAL ALCOOL E DROGAS'", "'CENTRO DE ATENCAO  PSICOSSOCIAL INFANTIL'"],
  saudeBucal: ["'CENTRO DE ESPECIALIDADES ODONTOLOGICAS/CEO'", "'CLINICA ODONTOLOGICA'"],
  doencasRaras: ["'DOENCAS RARAS'", "'RARAS'"],
  ama: ["'ASSISTENCIA MEDICA AMBULATORIAL'", "'AMA ESPECIALIDADES'"],
  programas: ["'PROGRAMAS E SERVICOS'", "'PROGRMAS E SERVICOS'"],
  diagnostico: ["'SERVICO DE DIAGNOSTICO POR IMAGEM'", "'CENTRO DE DIAGNOSTICO POR IMAGEM'"],
  ambulatorio: ["'AMBULATORIO DE ESPECIALIDADES'", "'AMBULATORIOS ESPECIALIZADOS'"],
  supervisao: ["'SUPERVISAO DE VIGILANCIA EM SAUDE'", "'SUPERVISAO TECNICA DE SAUDE'"],
  residencia: ["'RESIDENCIA TERAPEUTICA'"],
  reabilitacao: ["'CENTRO ESPECIALIZADO EM REABILITACAO'", "'CENTRO DE REABILITACAO'"],
  apoio: ["'UNIDADE DE APOIO DIAGNOSE E TERAPIA'", "'APOIO DIAGNOSTICO'", "'SERVICO DE APOIO DIAGNOSTICO E TERAPEUTICO'"],
  clinica: ["'CLINICA ESPECIALIZADA'", "'CLINICA ODONTOLOGICA'"],
  dst: ["'SERVICO DE ATENDIMENTO ESPECIALIZADO EM  DST/AIDS'", "'CENTRO DE TESTAGEM E ACONSELHAMENTO DST/AIDS'", "'CENTRO REFERENCIA  DST/AIDS'", "'SERVICO DE ATENDIMENTO ESPECIALIZADO EM  DST/AIDS E UAD'"],
  prontoSocorro: ["'PRONTO SOCORRO GERAL'"],
  testagem: ["'CENTRO DE TESTAGEM E ACONSELHAMENTO DST/AIDS'"],
  auditiva: ["'NUCLEO INTEGRADO DE SAUDE AUDITIVA'"],
  horaCerta: ["'HORA CERTA'"],
  idoso: ["'UNIDADE DE REFERENCIA SAUDE DO IDOSO'"],
  laboratorio: ["'LABORATORIO'", "'LABORATORIO DE ZOONOSES'"],
  trabalhador: ["'CENTRO REFERENCIA DE SAUDE DO TRABALHADOR'"],
  apoioDiagnostico: ["'APOIO DIAGNOSTICO'"],
  apoioTerapeutico: ["'SERVICO DE APOIO DIAGNOSTICO E TERAPEUTICO'"],
  instituto: ["'INSTITUTO'"],
  apae: ["'ASSOCIACAO DE PAIS E  AMIGOS EXCEPCIONAIS'"],
  referencia: ["'CENTRO REFERENCIA  DST/AIDS'", "'CENTRO DE REFERENCIA'"],
  imagem: ["'CENTRO DE DIAGNOSTICO POR IMAGEM'"],
  nutricao: ["'CENTRO DE RECUPERACAO E EDUCACAO NUTRICIONAL'"],
  reabilitacaoGeral: ["'CENTRO DE REABILITACAO'"],
  nefrologia: ["'SERVICOS DE NEFROLOGIA'"],
  odontologica: ["'CLINICA ODONTOLOGICA'"],
  saudeMental: ["'AMBULATORIO DE SAUDE MENTAL'"],
  referenciaGeral: ["'CENTRO DE REFERENCIA'"],
  medicinas: ["'MEDICINAS NATURAIS'", "'MEDICINAS TRADICIONAIS'"],
  hemocentro: ["'HEMOCENTRO'"],
  zoonoses: ["'CENTRO DE CONTROLE DE ZOONOSES - CCZ'"],
  laboratorioZoo: ["'LABORATORIO DE ZOONOSES'"],
  casaParto: ["'CASA DO PARTO'"],
  sexual: ["'CENTRO DE ATENCAO SAUDE SEXUAL REPRODUTIVA'"],
  dstUad: ["'SERVICO DE ATENDIMENTO ESPECIALIZADO EM  DST/AIDS E UAD'"],
  capsInfantil: ["'CENTRO DE ATENCAO PSICOSSOCIAL INFANTIL'"],
  ambulatorios: ["'AMBULATORIOS ESPECIALIZADOS'"],
  programasGerais: ["'PROGRAMAS E SERVICOS'", "'PROGRMAS E SERVICOS'"],
  tradicionais: ["'MEDICINAS TRADICIONAIS'"],
  dependente: ["'SERVICO ATENCAO INTEGRAL AO DEPENDENTE'"]
};

// Função para obter tipos filtrados baseado nos filtros ativos
export function obterTiposFiltrados(filtros: Record<string, boolean>): string[] {
  const tiposFiltrados: string[] = [];
  
  Object.entries(filtros).forEach(([filtro, ativo]) => {
    if (ativo && TIPO_FILTER_MAP[filtro]) {
      tiposFiltrados.push(...TIPO_FILTER_MAP[filtro]);
    }
  });
  
  // Se nenhum tipo foi selecionado, mostrar todos os tipos
  if (tiposFiltrados.length === 0) {
    tiposFiltrados.push("'%'"); // Mostrar todos
  }
  
  return tiposFiltrados;
}
