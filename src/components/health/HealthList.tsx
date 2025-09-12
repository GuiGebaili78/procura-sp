import { EstabelecimentoSaude } from "../../types/saude";
import { HealthCard } from "./HealthCard";

interface HealthListProps {
  estabelecimentos: EstabelecimentoSaude[];
  onSelectEstabelecimento?: (estabelecimento: EstabelecimentoSaude) => void;
  loading?: boolean;
  className?: string;
}

export function HealthList({ 
  estabelecimentos, 
  onSelectEstabelecimento, 
  loading = false,
  className = "" 
}: HealthListProps) {
  
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">
            Buscando estabelecimentos de saúde...
          </p>
        </div>
        
        {/* Skeleton loading */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (estabelecimentos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🏥</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum estabelecimento encontrado
        </h3>
        <p className="text-gray-600 mb-4">
          Não foram encontrados estabelecimentos de saúde na região selecionada.
        </p>
        <div className="text-sm text-gray-500">
          <p>• Verifique se os filtros estão corretos</p>
          <p>• Tente aumentar o raio de busca</p>
          <p>• Confirme se o CEP está correto</p>
        </div>
      </div>
    );
  }

  // Agrupar estabelecimentos por tipo para melhor organização
  const estabelecimentosPorTipo = estabelecimentos.reduce((acc, estabelecimento) => {
    const tipo = estabelecimento.tipo || "Outros";
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(estabelecimento);
    return acc;
  }, {} as Record<string, EstabelecimentoSaude[]>);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com estatísticas */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              🏥 Estabelecimentos Encontrados
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {estabelecimentos.length} estabelecimento{estabelecimentos.length !== 1 ? "s" : ""} encontrado{estabelecimentos.length !== 1 ? "s" : ""}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Ordenado por distância
            </div>
            <div className="text-xs text-gray-500">
              Mais próximo primeiro
            </div>
          </div>
        </div>
      </div>

      {/* Lista de estabelecimentos */}
      <div className="space-y-4">
        {Object.entries(estabelecimentosPorTipo).map(([tipo, estabelecimentosTipo]) => (
          <div key={tipo} className="space-y-3">
            {/* Cabeçalho do tipo */}
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">
                {tipo}
              </h4>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {estabelecimentosTipo.length}
              </span>
            </div>
            
            {/* Cards dos estabelecimentos */}
            <div className="grid gap-3">
              {estabelecimentosTipo.map((estabelecimento) => (
                <HealthCard
                  key={estabelecimento.id}
                  estabelecimento={estabelecimento}
                  onSelect={onSelectEstabelecimento}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer com informações adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 text-lg">ℹ️</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informações importantes:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Os dados são obtidos diretamente do CNES (Ministério da Saúde)</li>
              <li>• As informações são atualizadas em tempo real</li>
              <li>• Recomendamos confirmar horários e disponibilidade por telefone</li>
              <li>• Em caso de emergência, procure a unidade mais próxima</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

