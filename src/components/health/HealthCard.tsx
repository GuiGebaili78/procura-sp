import { EstabelecimentoSaude, TIPOS_ESTABELECIMENTO } from "../../types/saude";

interface HealthCardProps {
  estabelecimento: EstabelecimentoSaude;
  onSelect?: (estabelecimento: EstabelecimentoSaude) => void;
  className?: string;
}

export function HealthCard({ estabelecimento, onSelect, className = "" }: HealthCardProps) {
  
  // Determinar o tipo e cor do estabelecimento
  const getTipoInfo = () => {
    // Mapear códigos para tipos conhecidos
    const tipoMap: Record<string, keyof typeof TIPOS_ESTABELECIMENTO> = {
      "05": "UBS",
      "01": "HOSPITAL", 
      "02": "POSTO",
      "03": "FARMACIA",
      "04": "MATERNIDADE",
      "06": "URGENCIA",
      "07": "ACADEMIA",
      "08": "CAPS",
      "09": "SAUDE_BUCAL",
      "10": "DOENCAS_RARAS"
    };
    
    const tipo = tipoMap[estabelecimento.tipoCodigo] || "UBS";
    return TIPOS_ESTABELECIMENTO[tipo];
  };

  const tipoInfo = getTipoInfo();
  
  // Formatar distância
  const formatarDistancia = (distancia?: number) => {
    if (!distancia) return "Distância não informada";
    
    if (distancia < 1000) {
      return `${Math.round(distancia)}m`;
    } else {
      return `${(distancia / 1000).toFixed(1)}km`;
    }
  };

  // Formatar telefone
  const formatarTelefone = (telefone?: string) => {
    if (!telefone) return null;
    
    // Remove caracteres não numéricos
    const numeros = telefone.replace(/\D/g, "");
    
    // Formata baseado no tamanho
    if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    } else if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }
    
    return telefone;
  };

  const telefoneFormatado = formatarTelefone(estabelecimento.telefone);

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={() => onSelect?.(estabelecimento)}
    >
      {/* Header com tipo e distância */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
              style={{ backgroundColor: tipoInfo.cor }}
            >
              {tipoInfo.icone}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {estabelecimento.nome}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {tipoInfo.nome}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {formatarDistancia(estabelecimento.distancia)}
            </div>
            {estabelecimento.ativo !== false && (
              <div className="text-xs text-green-600 mt-1">
                ✅ Ativo
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações principais */}
      <div className="p-4 space-y-3">
        {/* Endereço */}
        <div>
          <div className="flex items-start space-x-2">
            <span className="text-gray-400 text-sm mt-0.5">📍</span>
            <div className="text-sm text-gray-700">
              <p className="font-medium">{estabelecimento.endereco}</p>
              {estabelecimento.bairro && (
                <p className="text-gray-600">{estabelecimento.bairro}</p>
              )}
              <p className="text-gray-600">
                {estabelecimento.cidade} - {estabelecimento.uf}
              </p>
              {estabelecimento.cep && (
                <p className="text-gray-500 text-xs">
                  CEP: {estabelecimento.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Telefone */}
        {telefoneFormatado && (
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">📞</span>
              <span className="text-sm text-gray-700 font-medium">
                {telefoneFormatado}
              </span>
            </div>
          </div>
        )}

        {/* Horário de funcionamento */}
        {estabelecimento.horarioFuncionamento && (
          <div>
            <div className="flex items-start space-x-2">
              <span className="text-gray-400 text-sm mt-0.5">🕒</span>
              <div className="text-sm text-gray-700">
                <p className="font-medium">Horário de Funcionamento:</p>
                <p className="text-gray-600">{estabelecimento.horarioFuncionamento}</p>
              </div>
            </div>
          </div>
        )}

        {/* Serviços */}
        {estabelecimento.servicos && estabelecimento.servicos.length > 0 && (
          <div>
            <div className="flex items-start space-x-2">
              <span className="text-gray-400 text-sm mt-0.5">🩺</span>
              <div className="text-sm text-gray-700">
                <p className="font-medium">Serviços:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {estabelecimento.servicos.slice(0, 3).map((servico, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {servico}
                    </span>
                  ))}
                  {estabelecimento.servicos.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{estabelecimento.servicos.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {estabelecimento.gestao && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {estabelecimento.gestao}
            </span>
          )}
          {estabelecimento.natureza && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {estabelecimento.natureza}
            </span>
          )}
          {estabelecimento.vinculoSus && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              SUS
            </span>
          )}
        </div>
      </div>

      {/* Footer com ação */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {estabelecimento.cnes && `CNES: ${estabelecimento.cnes}`}
          </div>
          <div className="text-xs text-blue-600 font-medium">
            Ver detalhes →
          </div>
        </div>
      </div>
    </div>
  );
}

