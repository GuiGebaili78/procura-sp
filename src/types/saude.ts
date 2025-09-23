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
  // Novos campos da planilha
  regiao?: string;
  esferaAdministrativa?: 'Municipal' | 'Estadual' | 'Privado';
}

export interface FiltroSaude {
  // Filtros por tipo de estabelecimento
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
  ama: boolean; // Assistência Médica Ambulatorial
  programas: boolean; // Programas e Serviços
  diagnostico: boolean; // Serviço de Diagnóstico por Imagem
  ambulatorio: boolean; // Ambulatório de Especialidades
  supervisao: boolean; // Supervisão de Vigilância em Saúde
  residencia: boolean; // Residência Terapêutica
  reabilitacao: boolean; // Centro Especializado em Reabilitação
  apoio: boolean; // Unidade de Apoio Diagnose e Terapia
  clinica: boolean; // Clínica Especializada
  dst: boolean; // Serviço de Atendimento Especializado em DST/AIDS
  prontoSocorro: boolean; // Pronto Socorro Geral
  testagem: boolean; // Centro de Testagem e Aconselhamento DST/AIDS
  auditiva: boolean; // Núcleo Integrado de Saúde Auditiva
  horaCerta: boolean; // Hora Certa
  idoso: boolean; // Unidade de Referência Saúde do Idoso
  laboratorio: boolean; // Laboratório
  trabalhador: boolean; // Centro Referência de Saúde do Trabalhador
  apoioDiagnostico: boolean; // Apoio Diagnóstico
  apoioTerapeutico: boolean; // Serviço de Apoio Diagnóstico e Terapêutico
  instituto: boolean; // Instituto
  apae: boolean; // Associação de Pais e Amigos Excepcionais
  referencia: boolean; // Centro Referência DST/AIDS
  imagem: boolean; // Centro de Diagnóstico por Imagem
  nutricao: boolean; // Centro de Recuperação e Educação Nutricional
  reabilitacaoGeral: boolean; // Centro de Reabilitação
  nefrologia: boolean; // Serviços de Nefrologia
  odontologica: boolean; // Clínica Odontológica
  saudeMental: boolean; // Ambulatório de Saúde Mental
  referenciaGeral: boolean; // Centro de Referência
  medicinas: boolean; // Medicinas Naturais
  hemocentro: boolean; // Hemocentro
  zoonoses: boolean; // Centro de Controle de Zoonoses
  laboratorioZoo: boolean; // Laboratório de Zoonoses
  casaParto: boolean; // Casa do Parto
  sexual: boolean; // Centro de Atenção Saúde Sexual Reprodutiva
  dstUad: boolean; // Serviço de Atendimento Especializado em DST/AIDS e UAD
  capsInfantil: boolean; // Centro de Atenção Psicossocial Infantil
  ambulatorios: boolean; // Ambulatórios Especializados
  programasGerais: boolean; // Programas e Serviços
  tradicionais: boolean; // Medicinas Tradicionais
  dependente: boolean; // Serviço Atenção Integral ao Dependente
  // Filtros por esfera administrativa (independentes)
  municipal: boolean;
  estadual: boolean;
  privado: boolean;
}

// Interface para filtros externos (Todos/Nenhum)
export interface FiltrosExternos {
  todos: boolean;
  nenhum: boolean;
}

export interface SaudeSearchParams {
  cep: string;
  numero: string;
  latitude: number;
  longitude: number;
  filtros: FiltroSaude;
  raio?: number; // em metros, padrão 5000
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
  filtros: string; // JSON string dos filtros
  estabelecimentos: string; // JSON string dos estabelecimentos
  created_at: Date;
  expires_at: Date;
}

// Tipos específicos para cada categoria de estabelecimento
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

export type TipoEstabelecimento = keyof typeof TIPOS_ESTABELECIMENTO;

