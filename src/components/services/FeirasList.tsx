import { FeiraLivre } from "../../types/feiraLivre";

interface FeirasListProps {
  feiras: FeiraLivre[];
  onViewTrecho?: (feiraId: string) => void;
  selectedFeiraId?: string;
}

export function FeirasList({ feiras, selectedFeiraId }: FeirasListProps) {
  if (feiras.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Nenhuma feira encontrada
        </h3>
        <p className="text-gray-600">
          Não encontramos feiras livres para este endereço. Tente verificar se o
          endereço está correto ou tente um endereço próximo.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 fade-in">
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-dark-primary mb-2">
            🛒 Feiras Livres Encontradas
          </h3>
          <p className="text-sm text-gray-600">
            {feiras.length} feira{feiras.length !== 1 ? "s" : ""} disponível{feiras.length !== 1 ? "is" : ""} na sua região
          </p>
        </div>

        {/* Lista de Feiras */}
        <div className="space-y-4 mb-6">
          {feiras.map((feira, index) => {
            const isSelected = selectedFeiraId === feira.id;
            
            return (
              <div
                key={`${feira.id}-${index}`}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-dark-primary mb-2">
                      {feira.nome}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">📍 Endereço:</span>
                        <p className="text-gray-600">{feira.endereco}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">📅 Período:</span>
                        <p className="text-gray-600">{feira.periodo}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">🗓️ Dia da semana:</span>
                        <p className="text-gray-600">{feira.diaSemana}</p>
                      </div>
                      {feira.horario && (
                        <div>
                          <span className="font-medium text-gray-700">🕐 Horário:</span>
                          <p className="text-gray-600">{feira.horario}</p>
                        </div>
                      )}
                    </div>
                    
                    {feira.observacoes && (
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <span className="text-xs font-medium text-gray-500 block mb-1">
                          📝 Observações:
                        </span>
                        <span className="text-sm text-dark-primary">
                          {feira.observacoes}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🗺️ Selecionada
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mensagem Final */}
        <div className="text-center p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <p className="text-accent font-medium">
            🗺️ Veja no mapa abaixo
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Clique nos marcadores do mapa para ver mais detalhes de cada feira
          </p>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            ℹ️ Informações Importantes
          </h4>
          <p className="text-sm text-blue-700">
            Os horários e dias podem variar. Recomendamos confirmar as
            informações diretamente com a prefeitura ou visitar a feira nos
            horários indicados.
          </p>
        </div>
      </div>
    </div>
  );
}
