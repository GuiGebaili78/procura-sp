import React, { useState } from 'react';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';

interface HealthFiltersProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  disabled?: boolean;
}

// Mapeamento de categorias baseado nos dados reais do JSON
const CATEGORIAS_SAUDE = {
  'ATENDIMENTO BÁSICO': {
    'Unidade Básica de Saúde': 'Atendimento básico em Pediatria, Ginecologia, Clínica Geral, Enfermagem e Odontologia. Principais serviços: consultas médicas, vacinas, curativos, exames laboratoriais e medicação básica.',
    'Assistência Médica Ambulatorial': 'Atendimento ambulatorial geral com consultas médicas e procedimentos básicos.',
    'AMA Especialidades': 'Assistência Médica Ambulatorial de Especialidades - oferece consultas com especialistas médicos em horário estendido.',
    'Ambulatório de Especialidades': 'Atendimento ambulatorial especializado com médicos especialistas em diversas áreas.',
    'Centro de saúde': 'Centros de saúde que oferecem atendimento básico e especializado.'
  },
  'HOSPITAIS E URGÊNCIA': {
    'Hospital Geral': 'Hospital destinado a prestar assistência sanitária a doentes, nas quatros especialidades básicas: clínica médica, cirúrgica, gineco obstreta e pediátrica.',
    'Hospital': 'Hospitais gerais e especializados para atendimento hospitalar.',
    'Hospital Especializado': 'Hospitais especializados em áreas específicas da medicina.',
    'Pronto Socorro Geral': 'Atendimento de emergência 24 horas para casos de urgência e emergência médica.',
    'Pronto Atendimento': 'Atendimento de urgência e emergência médica.',
    'Hora Certa': 'Serviço de atendimento médico com horário agendado.'
  },
  'ESPECIALIDADES MÉDICAS': {
    'Centro e Serviços de Diagnóstico por Imagem': 'Serviços especializados em exames de imagem como raio-X, ultrassom, tomografia, ressonância magnética.',
    'Centro/Clínica de Especialidades Odontológicas': 'Clínicas especializadas em tratamentos odontológicos avançados e especialidades.',
    'Clínica Odontológica de Especialidades': 'Clínicas odontológicas com especialidades avançadas.',
    'Laboratório': 'Laboratórios de análises clínicas para exames laboratoriais diversos.',
    'Laboratório de Zoonoses': 'Laboratório especializado em doenças transmitidas por animais.',
    'Hemocentro': 'Centro de coleta, processamento e distribuição de sangue e hemoderivados.'
  },
  'SAÚDE MENTAL E PSICOSSOCIAL': {
    'Centro de Atenção Psicossocial Adulto': 'Centro especializado no atendimento de pessoas com transtornos mentais adultos.',
    'Centro de Atenção Psicossocial Infantil': 'Centro especializado no atendimento de crianças e adolescentes com transtornos mentais.',
    'Centro de Atenção Psicossocial Álcool e Drogas': 'Centro especializado no atendimento de pessoas com dependência química.',
    'Residência Terapeutica RT': 'Residências terapêuticas para pessoas com transtornos mentais.',
    'Centro de Convivência e Cooperativa (CECCO)': 'Centros de convivência e cooperativas para pessoas com transtornos mentais.'
  },
  'REABILITAÇÃO E ESPECIALIDADES': {
    'Centro de Reabilitação': 'Centros especializados em reabilitação física e funcional.',
    'Núcleo Integrado de Reabilitação': 'Núcleos que oferecem serviços integrados de reabilitação.',
    'Núcleo Integrado de Saúde Auditiva': 'Núcleos especializados em saúde auditiva e reabilitação.',
    'Centro de Recuperação e Educação Nutricional (CREN)': 'Centros especializados em recuperação e educação nutricional.',
    'Centro de Referência do Idoso/Unidade Referência Saúde Idoso': 'Centros especializados no atendimento à saúde do idoso.',
    'Centro de Referência de Sáude do Trabalhador': 'Centros especializados em saúde ocupacional e do trabalhador.'
  },
  'SAÚDE SEXUAL E REPRODUTIVA': {
    'Centro de Atenção à Saúde Sexual Reprodutiva': 'Centros especializados em saúde sexual e reprodutiva.',
    'Centro de Referência DST/AIDS': 'Centros especializados no atendimento de DST/AIDS.',
    'Centro de Testagem e Acompanhamento DST/AIDS': 'Centros de testagem e acompanhamento para DST/AIDS.',
    'Serviço de Atendimento Especializado em DST/AIDS (SAE)': 'Serviços especializados no atendimento de DST/AIDS.',
    'Casa do Parto': 'Casas especializadas em parto humanizado.'
  },
  'PROGRAMAS E SERVIÇOS ESPECIAIS': {
    'Outros Estabelecimentos, Serviços Especializados e Programas': 'Estabelecimentos e Serviços que possuem convênio com a Secretaria Municipal de Saúde e o SUS. Inclui ESF, NASF, Serviço de Atenção Domiciliar e outros programas.',
    'Supervisão de Vigilância em Saúde': 'Supervisão técnica de vigilância em saúde pública.',
    'Unidade de Apoio Diagnose e Terapia e Serviço': 'Unidades de apoio diagnóstico e terapêutico.',
    'Clínica Especializada': 'Clínicas com especialidades médicas específicas.',
    'Instituto': 'Institutos de pesquisa e atendimento especializado.',
    'Associação de Pais e Amigos Excepcionais': 'Associações que oferecem atendimento especializado.',
    'Unidade de Atendimento ao Dependente (UNAD)': 'Unidades especializadas no atendimento a dependentes químicos.'
  },
  'MEDICINAS ALTERNATIVAS': {
    'Medicinas Naturais': 'Serviços de medicinas naturais e alternativas.',
    'Medicinas Tradicionais': 'Serviços de medicinas tradicionais e populares.'
  }
};

export function HealthFilters({ selectedCategories, onCategoryChange, disabled = false }: HealthFiltersProps) {
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const handleCategoryToggle = (category: string) => {
    if (disabled) return;
    
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    onCategoryChange(newCategories);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    
    const allCategories = Object.values(CATEGORIAS_SAUDE).flatMap(group => Object.keys(group));
    onCategoryChange(allCategories);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onCategoryChange([]);
  };

  const toggleInfo = (category: string) => {
    setShowInfo(showInfo === category ? null : category);
  };

  const getCategoryDescription = (category: string): string => {
    for (const group of Object.values(CATEGORIAS_SAUDE)) {
      if (group[category as keyof typeof group]) {
        return group[category as keyof typeof group];
      }
    }
    return 'Informações não disponíveis.';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filtros de Saúde</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            disabled={disabled}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Todos
          </button>
          <button
            onClick={handleClearAll}
            disabled={disabled}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(CATEGORIAS_SAUDE).map(([groupName, categories]) => (
          <div key={groupName} className="space-y-3">
            <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2">
              {groupName}
            </h4>
            <div className="space-y-2">
              {Object.keys(categories).map((category) => (
                <div key={category} className="flex items-start gap-2">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      disabled={disabled}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700 flex-1">{category}</span>
                  </label>
                  <button
                    onClick={() => toggleInfo(category)}
                    disabled={disabled}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    title="Ver informações"
                  >
                    <FaInfoCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Informações */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{showInfo}</h3>
              <button
                onClick={() => setShowInfo(null)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <p className="text-sm text-gray-600 leading-relaxed">
                {getCategoryDescription(showInfo)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumo das seleções */}
      {selectedCategories.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{selectedCategories.length}</strong> categoria(s) selecionada(s)
          </p>
        </div>
      )}
    </div>
  );
}
