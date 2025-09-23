import { FiltroSaude, TIPOS_ESTABELECIMENTO } from "../../types/saude";

interface HealthLayerSelectorProps {
  filtros: FiltroSaude;
  onFiltroChange: (filtros: FiltroSaude) => void;
  className?: string;
}

export function HealthLayerSelector({
  filtros,
  onFiltroChange,
  className = "",
}: HealthLayerSelectorProps) {
  
  const handleFiltroChange = (tipo: keyof FiltroSaude, value: boolean) => {
    const novosFiltros = { ...filtros, [tipo]: value };
    onFiltroChange(novosFiltros);
  };

  const handleSelectAll = () => {
    const todosAtivos = Object.keys(filtros).reduce((acc, key) => {
      acc[key as keyof FiltroSaude] = true;
      return acc;
    }, {} as FiltroSaude);
    onFiltroChange(todosAtivos);
  };

  const handleSelectNone = () => {
    const todosInativos = Object.keys(filtros).reduce((acc, key) => {
      acc[key as keyof FiltroSaude] = false;
      return acc;
    }, {} as FiltroSaude);
    onFiltroChange(todosInativos);
  };

  const filtrosAtivos = Object.values(filtros).filter(Boolean).length;
  const totalFiltros = Object.keys(filtros).length;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark-primary">
          🏥 Filtros de Estabelecimentos
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            Todos
          </button>
          <button
            onClick={handleSelectNone}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
          >
            Nenhum
          </button>
        </div>
      </div>

      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="text-sm text-gray-600 mb-3">
          Selecione os tipos de estabelecimentos que deseja visualizar:
          <span className="ml-2 font-medium text-dark-primary">
            {filtrosAtivos} de {totalFiltros} selecionados
          </span>
        </div>

        {/* Tipos Principais */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">🏥 Tipos Principais</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* UBS */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.ubs}
                onChange={(e) => handleFiltroChange("ubs", e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.UBS.icone} UBS
              </span>
            </label>

            {/* Hospitais */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.hospitais}
                onChange={(e) => handleFiltroChange("hospitais", e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.HOSPITAL.icone} Hospitais
              </span>
            </label>

            {/* Postos */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.postos}
                onChange={(e) => handleFiltroChange("postos", e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.POSTO.icone} Postos
              </span>
            </label>

            {/* AMA */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.ama}
                onChange={(e) => handleFiltroChange("ama", e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.AMA.icone} AMA
              </span>
            </label>

            {/* Urgência */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.urgencia}
                onChange={(e) => handleFiltroChange("urgencia", e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.URGENCIA.icone} Urgência
              </span>
            </label>

            {/* Pronto Socorro */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.prontoSocorro}
                onChange={(e) => handleFiltroChange("prontoSocorro", e.target.checked)}
                className="w-4 h-4 text-red-700 bg-gray-100 border-gray-300 rounded focus:ring-red-700 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                🚨 Pronto Socorro
              </span>
            </label>

            {/* Maternidades */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.maternidades}
                onChange={(e) => handleFiltroChange("maternidades", e.target.checked)}
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.MATERNIDADE.icone} Maternidades
              </span>
            </label>

            {/* Casa do Parto */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.casaParto}
                onChange={(e) => handleFiltroChange("casaParto", e.target.checked)}
                className="w-4 h-4 text-pink-700 bg-gray-100 border-gray-300 rounded focus:ring-pink-700 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                🏠 Casa do Parto
              </span>
            </label>
          </div>
        </div>

        {/* Especialidades */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">🔬 Especialidades</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* CAPS */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.caps}
                onChange={(e) => handleFiltroChange("caps", e.target.checked)}
                className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.CAPS.icone} CAPS
              </span>
            </label>

            {/* Saúde Bucal */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.saudeBucal}
                onChange={(e) => handleFiltroChange("saudeBucal", e.target.checked)}
                className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.SAUDE_BUCAL.icone} Saúde Bucal
              </span>
            </label>

            {/* Farmácias */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.farmacias}
                onChange={(e) => handleFiltroChange("farmacias", e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.FARMACIA.icone} Farmácias
              </span>
            </label>

            {/* Academias */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.academias}
                onChange={(e) => handleFiltroChange("academias", e.target.checked)}
                className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.ACADEMIA.icone} Academias
              </span>
            </label>

            {/* Doenças Raras */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.doencasRaras}
                onChange={(e) => handleFiltroChange("doencasRaras", e.target.checked)}
                className="w-4 h-4 text-slate-600 bg-gray-100 border-gray-300 rounded focus:ring-slate-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {TIPOS_ESTABELECIMENTO.DOENCAS_RARAS.icone} Doenças Raras
              </span>
            </label>

            {/* Programas e Serviços */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.programas}
                onChange={(e) => handleFiltroChange("programas", e.target.checked)}
                className="w-4 h-4 text-gray-700 bg-gray-100 border-gray-300 rounded focus:ring-gray-700 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                📋 Programas e Serviços
              </span>
            </label>
          </div>
        </div>

        {filtrosAtivos === 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Selecione pelo menos um tipo de estabelecimento para buscar.
            </p>
          </div>
        )}
      </div>

      {/* Filtros por Esfera Administrativa */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-gray-600 mb-3">
          Selecione a esfera administrativa:
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Público (Municipal + Estadual) */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filtros.municipal}
              onChange={(e) => handleFiltroChange("municipal", e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              🏛️ Público (Municipal + Estadual)
            </span>
          </label>

          {/* Privado */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filtros.privado}
              onChange={(e) => handleFiltroChange("privado", e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              🏥 Privado
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

