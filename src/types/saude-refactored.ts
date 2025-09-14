/**
 * Tipos refatorados para o sistema de saúde
 * Estrutura hierárquica e mais organizada
 */

// Tipos de estabelecimentos como union type
export type TipoEstabelecimento = 
  | 'UBS'
  | 'HOSPITAL'
  | 'POSTO'
  | 'FARMACIA'
  | 'MATERNIDADE'
  | 'URGENCIA'
  | 'ACADEMIA'
  | 'CAPS'
  | 'SAUDE_BUCAL'
  | 'DOENCAS_RARAS'
  | 'AMA'
  | 'PROGRAMAS'
  | 'DIAGNOSTICO'
  | 'AMBULATORIO'
  | 'SUPERVISAO'
  | 'RESIDENCIA'
  | 'REABILITACAO'
  | 'APOIO'
  | 'CLINICA'
  | 'DST'
  | 'PRONTO_SOCORRO'
  | 'TESTAGEM'
  | 'AUDITIVA'
  | 'HORA_CERTA'
  | 'IDOSO'
  | 'LABORATORIO'
  | 'TRABALHADOR'
  | 'APOIO_DIAGNOSTICO'
  | 'APOIO_TERAPEUTICO'
  | 'INSTITUTO'
  | 'APAE'
  | 'REFERENCIA'
  | 'IMAGEM'
  | 'NUTRICAO'
  | 'REABILITACAO_GERAL'
  | 'NEFROLOGIA'
  | 'ODONTOLOGICA'
  | 'SAUDE_MENTAL'
  | 'REFERENCIA_GERAL'
  | 'MEDICINAS'
  | 'HEMOCENTRO'
  | 'ZOONOSES'
  | 'LABORATORIO_ZOO'
  | 'CASA_PARTO'
  | 'SEXUAL'
  | 'DST_UAD'
  | 'CAPS_INFANTIL'
  | 'AMBULATORIOS'
  | 'PROGRAMAS_GERAIS'
  | 'TRADICIONAIS'
  | 'DEPENDENTE';

// Esferas administrativas
export type EsferaAdministrativa = 'MUNICIPAL' | 'ESTADUAL' | 'PRIVADO';

// Interface hierárquica para filtros
export interface FiltroSaudeRefatorado {
  tipos: TipoEstabelecimento[];
  esferas: EsferaAdministrativa[];
  regioes?: string[];
}

// Interface para compatibilidade com o sistema atual
export interface FiltroSaudeCompatibilidade {
  // Filtros por tipo de estabelecimento (mantidos para compatibilidade)
  ubs: boolean;
  hospitais: boolean;
  postos: boolean;
  farmacias: boolean;
  maternidades: boolean;
  urgencia: boolean;
  academias: boolean;
  caps: boolean;
  saudeBucal: boolean;
  doencasRaras: boolean;
  ama: boolean;
  programas: boolean;
  diagnostico: boolean;
  ambulatorio: boolean;
  supervisao: boolean;
  residencia: boolean;
  reabilitacao: boolean;
  apoio: boolean;
  clinica: boolean;
  dst: boolean;
  prontoSocorro: boolean;
  testagem: boolean;
  auditiva: boolean;
  horaCerta: boolean;
  idoso: boolean;
  laboratorio: boolean;
  trabalhador: boolean;
  apoioDiagnostico: boolean;
  apoioTerapeutico: boolean;
  instituto: boolean;
  apae: boolean;
  referencia: boolean;
  imagem: boolean;
  nutricao: boolean;
  reabilitacaoGeral: boolean;
  nefrologia: boolean;
  odontologica: boolean;
  saudeMental: boolean;
  referenciaGeral: boolean;
  medicinas: boolean;
  hemocentro: boolean;
  zoonoses: boolean;
  laboratorioZoo: boolean;
  casaParto: boolean;
  sexual: boolean;
  dstUad: boolean;
  capsInfantil: boolean;
  ambulatorios: boolean;
  programasGerais: boolean;
  tradicionais: boolean;
  dependente: boolean;
  // Filtros por esfera administrativa
  municipal: boolean;
  estadual: boolean;
  privado: boolean;
}

// Interface para estabelecimento de saúde (mantida igual)
export interface EstabelecimentoSaude {
  id: string;
  nome: string;
  tipo: string;
  tipoCodigo: string;
  endereco: string;
  bairro?: string;
  cidade: string;
  uf: string;
  cep?: string;
  telefone?: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  distancia?: number;
  horarioFuncionamento?: string;
  servicos?: string[];
  cnes?: string;
  gestao?: string;
  natureza?: string;
  esfera?: string;
  vinculoSus?: boolean;
  ativo?: boolean;
  regiao?: string;
  esferaAdministrativa?: 'Municipal' | 'Estadual' | 'Privado';
}

// Função para converter filtros refatorados para compatibilidade
export function converterFiltrosParaCompatibilidade(filtros: FiltroSaudeRefatorado): FiltroSaudeCompatibilidade {
  const compatibilidade: FiltroSaudeCompatibilidade = {
    // Inicializar todos como false
    ubs: false,
    hospitais: false,
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
    municipal: false,
    estadual: false,
    privado: false,
  };

  // Mapear tipos selecionados
  filtros.tipos.forEach(tipo => {
    switch (tipo) {
      case 'UBS': compatibilidade.ubs = true; break;
      case 'HOSPITAL': compatibilidade.hospitais = true; break;
      case 'POSTO': compatibilidade.postos = true; break;
      case 'FARMACIA': compatibilidade.farmacias = true; break;
      case 'MATERNIDADE': compatibilidade.maternidades = true; break;
      case 'URGENCIA': compatibilidade.urgencia = true; break;
      case 'ACADEMIA': compatibilidade.academias = true; break;
      case 'CAPS': compatibilidade.caps = true; break;
      case 'SAUDE_BUCAL': compatibilidade.saudeBucal = true; break;
      case 'DOENCAS_RARAS': compatibilidade.doencasRaras = true; break;
      case 'AMA': compatibilidade.ama = true; break;
      case 'PROGRAMAS': compatibilidade.programas = true; break;
      case 'DIAGNOSTICO': compatibilidade.diagnostico = true; break;
      case 'AMBULATORIO': compatibilidade.ambulatorio = true; break;
      case 'SUPERVISAO': compatibilidade.supervisao = true; break;
      case 'RESIDENCIA': compatibilidade.residencia = true; break;
      case 'REABILITACAO': compatibilidade.reabilitacao = true; break;
      case 'APOIO': compatibilidade.apoio = true; break;
      case 'CLINICA': compatibilidade.clinica = true; break;
      case 'DST': compatibilidade.dst = true; break;
      case 'PRONTO_SOCORRO': compatibilidade.prontoSocorro = true; break;
      case 'TESTAGEM': compatibilidade.testagem = true; break;
      case 'AUDITIVA': compatibilidade.auditiva = true; break;
      case 'HORA_CERTA': compatibilidade.horaCerta = true; break;
      case 'IDOSO': compatibilidade.idoso = true; break;
      case 'LABORATORIO': compatibilidade.laboratorio = true; break;
      case 'TRABALHADOR': compatibilidade.trabalhador = true; break;
      case 'APOIO_DIAGNOSTICO': compatibilidade.apoioDiagnostico = true; break;
      case 'APOIO_TERAPEUTICO': compatibilidade.apoioTerapeutico = true; break;
      case 'INSTITUTO': compatibilidade.instituto = true; break;
      case 'APAE': compatibilidade.apae = true; break;
      case 'REFERENCIA': compatibilidade.referencia = true; break;
      case 'IMAGEM': compatibilidade.imagem = true; break;
      case 'NUTRICAO': compatibilidade.nutricao = true; break;
      case 'REABILITACAO_GERAL': compatibilidade.reabilitacaoGeral = true; break;
      case 'NEFROLOGIA': compatibilidade.nefrologia = true; break;
      case 'ODONTOLOGICA': compatibilidade.odontologica = true; break;
      case 'SAUDE_MENTAL': compatibilidade.saudeMental = true; break;
      case 'REFERENCIA_GERAL': compatibilidade.referenciaGeral = true; break;
      case 'MEDICINAS': compatibilidade.medicinas = true; break;
      case 'HEMOCENTRO': compatibilidade.hemocentro = true; break;
      case 'ZOONOSES': compatibilidade.zoonoses = true; break;
      case 'LABORATORIO_ZOO': compatibilidade.laboratorioZoo = true; break;
      case 'CASA_PARTO': compatibilidade.casaParto = true; break;
      case 'SEXUAL': compatibilidade.sexual = true; break;
      case 'DST_UAD': compatibilidade.dstUad = true; break;
      case 'CAPS_INFANTIL': compatibilidade.capsInfantil = true; break;
      case 'AMBULATORIOS': compatibilidade.ambulatorios = true; break;
      case 'PROGRAMAS_GERAIS': compatibilidade.programasGerais = true; break;
      case 'TRADICIONAIS': compatibilidade.tradicionais = true; break;
      case 'DEPENDENTE': compatibilidade.dependente = true; break;
    }
  });

  // Mapear esferas selecionadas
  filtros.esferas.forEach(esfera => {
    switch (esfera) {
      case 'MUNICIPAL': compatibilidade.municipal = true; break;
      case 'ESTADUAL': compatibilidade.estadual = true; break;
      case 'PRIVADO': compatibilidade.privado = true; break;
    }
  });

  return compatibilidade;
}

// Função para converter filtros de compatibilidade para refatorados
export function converterFiltrosParaRefatorado(filtros: FiltroSaudeCompatibilidade): FiltroSaudeRefatorado {
  const tipos: TipoEstabelecimento[] = [];
  const esferas: EsferaAdministrativa[] = [];

  // Converter tipos
  if (filtros.ubs) tipos.push('UBS');
  if (filtros.hospitais) tipos.push('HOSPITAL');
  if (filtros.postos) tipos.push('POSTO');
  if (filtros.farmacias) tipos.push('FARMACIA');
  if (filtros.maternidades) tipos.push('MATERNIDADE');
  if (filtros.urgencia) tipos.push('URGENCIA');
  if (filtros.academias) tipos.push('ACADEMIA');
  if (filtros.caps) tipos.push('CAPS');
  if (filtros.saudeBucal) tipos.push('SAUDE_BUCAL');
  if (filtros.doencasRaras) tipos.push('DOENCAS_RARAS');
  if (filtros.ama) tipos.push('AMA');
  if (filtros.programas) tipos.push('PROGRAMAS');
  if (filtros.diagnostico) tipos.push('DIAGNOSTICO');
  if (filtros.ambulatorio) tipos.push('AMBULATORIO');
  if (filtros.supervisao) tipos.push('SUPERVISAO');
  if (filtros.residencia) tipos.push('RESIDENCIA');
  if (filtros.reabilitacao) tipos.push('REABILITACAO');
  if (filtros.apoio) tipos.push('APOIO');
  if (filtros.clinica) tipos.push('CLINICA');
  if (filtros.dst) tipos.push('DST');
  if (filtros.prontoSocorro) tipos.push('PRONTO_SOCORRO');
  if (filtros.testagem) tipos.push('TESTAGEM');
  if (filtros.auditiva) tipos.push('AUDITIVA');
  if (filtros.horaCerta) tipos.push('HORA_CERTA');
  if (filtros.idoso) tipos.push('IDOSO');
  if (filtros.laboratorio) tipos.push('LABORATORIO');
  if (filtros.trabalhador) tipos.push('TRABALHADOR');
  if (filtros.apoioDiagnostico) tipos.push('APOIO_DIAGNOSTICO');
  if (filtros.apoioTerapeutico) tipos.push('APOIO_TERAPEUTICO');
  if (filtros.instituto) tipos.push('INSTITUTO');
  if (filtros.apae) tipos.push('APAE');
  if (filtros.referencia) tipos.push('REFERENCIA');
  if (filtros.imagem) tipos.push('IMAGEM');
  if (filtros.nutricao) tipos.push('NUTRICAO');
  if (filtros.reabilitacaoGeral) tipos.push('REABILITACAO_GERAL');
  if (filtros.nefrologia) tipos.push('NEFROLOGIA');
  if (filtros.odontologica) tipos.push('ODONTOLOGICA');
  if (filtros.saudeMental) tipos.push('SAUDE_MENTAL');
  if (filtros.referenciaGeral) tipos.push('REFERENCIA_GERAL');
  if (filtros.medicinas) tipos.push('MEDICINAS');
  if (filtros.hemocentro) tipos.push('HEMOCENTRO');
  if (filtros.zoonoses) tipos.push('ZOONOSES');
  if (filtros.laboratorioZoo) tipos.push('LABORATORIO_ZOO');
  if (filtros.casaParto) tipos.push('CASA_PARTO');
  if (filtros.sexual) tipos.push('SEXUAL');
  if (filtros.dstUad) tipos.push('DST_UAD');
  if (filtros.capsInfantil) tipos.push('CAPS_INFANTIL');
  if (filtros.ambulatorios) tipos.push('AMBULATORIOS');
  if (filtros.programasGerais) tipos.push('PROGRAMAS_GERAIS');
  if (filtros.tradicionais) tipos.push('TRADICIONAIS');
  if (filtros.dependente) tipos.push('DEPENDENTE');

  // Converter esferas
  if (filtros.municipal) esferas.push('MUNICIPAL');
  if (filtros.estadual) esferas.push('ESTADUAL');
  if (filtros.privado) esferas.push('PRIVADO');

  return { tipos, esferas };
}

// Outras interfaces mantidas para compatibilidade
export interface SaudeSearchParams {
  cep: string;
  numero: string;
  latitude: number;
  longitude: number;
  filtros: FiltroSaudeCompatibilidade;
  raio?: number;
}

export interface SaudeApiResponse {
  estabelecimentos: EstabelecimentoSaude[];
  total: number;
  cache: {
    hit: boolean;
    expired: boolean;
    source: "cache" | "api";
  };
}

export interface SaudeCacheEntry {
  id: string;
  cep: string;
  numero: string;
  latitude: number;
  longitude: number;
  filtros: string;
  estabelecimentos: string;
  created_at: Date;
  expires_at: Date;
}

// Tipos específicos para cada categoria de estabelecimento (mantidos)
export const TIPOS_ESTABELECIMENTO = {
  UBS: { codigo: "05", nome: "Unidade Básica de Saúde", icone: "🏥", cor: "#3B82F6", marcador: "blue" },
  HOSPITAL: { codigo: "01", nome: "Hospital", icone: "🏥", cor: "#EF4444", marcador: "red" },
  POSTO: { codigo: "02", nome: "Posto de Saúde", icone: "🏥", cor: "#10B981", marcador: "green" },
  FARMACIA: { codigo: "03", nome: "Farmácia Popular", icone: "💊", cor: "#8B5CF6", marcador: "purple" },
  MATERNIDADE: { codigo: "04", nome: "Maternidade", icone: "🏥", cor: "#EC4899", marcador: "pink" },
  URGENCIA: { codigo: "06", nome: "Unidade de Urgência", icone: "🚑", cor: "#F97316", marcador: "orange" },
  ACADEMIA: { codigo: "07", nome: "Academia da Saúde", icone: "🏥", cor: "#EAB308", marcador: "yellow" },
  CAPS: { codigo: "08", nome: "Centro de Atenção Psicossocial", icone: "🧠", cor: "#6B7280", marcador: "gray" },
  SAUDE_BUCAL: { codigo: "09", nome: "Unidade de Saúde Bucal", icone: "🦷", cor: "#06B6D4", marcador: "cyan" },
  DOENCAS_RARAS: { codigo: "10", nome: "Unidade de Doenças Raras", icone: "🏥", cor: "#A3A3A3", marcador: "lightgray" },
  AMA: { codigo: "11", nome: "Assistência Médica Ambulatorial", icone: "🏥", cor: "#059669", marcador: "emerald" },
} as const;
