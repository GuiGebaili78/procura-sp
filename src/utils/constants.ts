// SAMPLE_STREETS removido - usar apenas dados reais

export const SERVICE_TYPES = [
  { value: "coleta-lixo", label: "Coleta de Lixo" },
  { value: "cata-bagulho", label: "Cata-Bagulho" },
  { value: "saude", label: "Saúde Pública" },
  { value: "vacinacao", label: "Vacinação" },
  { value: "bem-estar-animal", label: "Bem-estar Animal" },
  { value: "zeladoria", label: "Zeladoria Urbana" },
  { value: "iluminacao", label: "Iluminação Pública" },
  { value: "poda-arvores", label: "Poda de Árvores" },
];

export const SERVICE_ICONS = {
  "coleta-lixo": "🗑️",
  "cata-bagulho": "🚛",
  "feiras-livres": "🛒",
  saude: "🏥",
  vacinacao: "💉",
  "bem-estar-animal": "🐕",
  zeladoria: "🔧",
  iluminacao: "💡",
  "poda-arvores": "🌳",
};

// A URL do backend é a única necessária para as chamadas de API
export const API_ENDPOINTS = {
  BACKEND_BASE: "/api", // URL relativa para o navegador (proxy reverso do Next.js)
};
