import { ServiceCard } from "./ServiceCard";
import { FeiraLivre } from "../../types/feiraLivre";

interface FeirasListProps {
  feiras: FeiraLivre[];
  onViewTrecho?: (feiraId: string) => void;
  selectedFeiraId?: string;
}

export function FeirasList({ feiras, onViewTrecho, selectedFeiraId }: FeirasListProps) {
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
    <div className="space-y-4">
      {feiras.map((feira, index) => {
        const isSelected = selectedFeiraId === feira.id;
        
        return (
          <div
            key={`${feira.id}-${index}`}
            className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border fade-in ${
              isSelected 
                ? 'bg-blue-50 border-blue-300 shadow-blue-200' 
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-primary mb-2">
                    🛒 {feira.nome}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>📍 Endereço:</strong> {feira.endereco}
                    </p>
                    <p>
                      <strong>📅 Período:</strong> {feira.periodo}
                    </p>
                    <p>
                      <strong>🗓️ Dia da semana:</strong> {feira.diaSemana}
                    </p>
                    {feira.horario && (
                      <p>
                        <strong>🕐 Horário:</strong> {feira.horario}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    // Scroll para o mapa
                    const mapaSection = document.getElementById("mapa-section");
                    if (mapaSection) {
                      mapaSection.scrollIntoView({ behavior: "smooth" });
                    }
                    // Destacar feira no mapa
                    onViewTrecho?.(feira.id);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors duration-200 ${
                    isSelected
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-accent hover:bg-accent/90 text-white'
                  }`}
                >
                  {isSelected ? '🗺️ Selecionada' : '🗺️ Ver no Mapa'}
                </button>
              </div>

              {feira.observacoes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 block mb-1">
                    📝 Observações:
                  </span>
                  <span className="text-sm text-dark-primary">
                    {feira.observacoes}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          🛒 {feiras.length} feira{feiras.length !== 1 ? "s" : ""}{" "}
          encontrada{feiras.length !== 1 ? "s" : ""}
        </h4>
        <p className="text-sm text-blue-700">
          Os horários e dias podem variar. Recomendamos confirmar as
          informações diretamente com a prefeitura ou visitar a feira nos
          horários indicados.
        </p>
      </div>
    </div>
  );
}
