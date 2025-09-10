import { ColetaLixo } from "../../types/coletaLixo";

interface ColetaLixoListProps {
  coletaComum: ColetaLixo[];
  coletaSeletiva: ColetaLixo[];
}

export function ColetaLixoList({ coletaComum, coletaSeletiva }: ColetaLixoListProps) {
  if (coletaComum.length === 0 && coletaSeletiva.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🗑️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Nenhuma informação encontrada
        </h3>
        <p className="text-gray-600">
          Não encontramos informações de coleta de lixo para este endereço. 
          Tente verificar se o endereço está correto ou tente um endereço próximo.
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
            🗑️ Informações de Coleta de Lixo
          </h3>
          <p className="text-sm text-gray-600">
            Horários e dias de coleta comum e seletiva na sua região
          </p>
        </div>

        {/* Coleta Comum */}
        {coletaComum.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <h4 className="text-lg font-semibold text-dark-primary">
                🗑️ Coleta Comum
              </h4>
            </div>
            
            <div className="space-y-4">
              {coletaComum.map((coleta, index) => (
                <div key={`${coleta.id}-${index}`} className="p-4 rounded-lg border border-gray-200 bg-blue-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">📅 Dias da semana:</span>
                      <p className="text-gray-600">{coleta.diasSemana.join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">🕐 Horários:</span>
                      <p className="text-gray-600">{coleta.horarios.join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">📊 Frequência:</span>
                      <p className="text-gray-600">{coleta.frequencia}</p>
                    </div>
                    {coleta.observacoes && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">📝 Observações:</span>
                        <p className="text-gray-600">{coleta.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coleta Seletiva */}
        {coletaSeletiva.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <h4 className="text-lg font-semibold text-dark-primary">
                ♻️ Coleta Seletiva
              </h4>
            </div>
            
            <div className="space-y-4">
              {coletaSeletiva.map((coleta, index) => (
                <div key={`${coleta.id}-${index}`} className="p-4 rounded-lg border border-gray-200 bg-green-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">📅 Dias da semana:</span>
                      <p className="text-gray-600">{coleta.diasSemana.join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">🕐 Horários:</span>
                      <p className="text-gray-600">{coleta.horarios.join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">📊 Frequência:</span>
                      <p className="text-gray-600">{coleta.frequencia}</p>
                    </div>
                    {coleta.observacoes && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">📝 Observações:</span>
                        <p className="text-gray-600">{coleta.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            ℹ️ Informações Importantes
          </h4>
          <p className="text-sm text-blue-700">
            Os horários e dias podem variar. Recomendamos confirmar as
            informações diretamente com a prefeitura ou deixar o lixo disponível
            nos horários indicados.
          </p>
        </div>
      </div>
    </div>
  );
}
