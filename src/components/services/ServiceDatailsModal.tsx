import { CataBagulhoResult } from "../../types/cataBagulho";

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CataBagulhoResult;
  serviceType: string;
}

export function ServiceDetailsModal({
  isOpen,
  onClose,
  result,
  serviceType,
}: ServiceDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🚛 Detalhes do Serviço
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Main Info */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 text-lg mb-2">
                📍 {result.street}
              </h3>
              {result.startStretch && (
                <p className="text-blue-800 mb-1">
                  <span className="font-medium">Trecho inicial:</span>{" "}
                  {result.startStretch}
                </p>
              )}
              {result.endStretch && (
                <p className="text-blue-800">
                  <span className="font-medium">Trecho final:</span>{" "}
                  {result.endStretch}
                </p>
              )}
            </div>

            {/* Schedule Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  ⏰ Informações de Horário
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Horário:</span>
                    <p className="text-gray-600">
                      {result.schedule || "Não informado"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Turno:</span>
                    <p className="text-gray-600">
                      {result.shift || "Não informado"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Frequência:
                    </span>
                    <p className="text-gray-600">
                      {result.frequency || "Não informada"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  📅 Datas Programadas
                </h4>
                <div className="space-y-1 text-sm">
                  {result.dates && result.dates.length > 0 ? (
                    result.dates.map((date, index) => (
                      <div
                        key={index}
                        className="bg-white rounded p-2 text-gray-700"
                      >
                        {date}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 italic">
                      Nenhuma data específica informada
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                ⚠️ Observações Importantes
              </h4>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Deixe os objetos na calçada no horário indicado</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Não misture com lixo comum</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Horários podem variar devido a condições climáticas ou
                    operacionais
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Em caso de dúvidas, entre em contato com a prefeitura
                  </span>
                </li>
              </ul>
            </div>

            {/* Service Type Info */}
            {serviceType === "cata-bagulho" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  ♻️ Sobre o Cata-Bagulho
                </h4>
                <div className="text-sm text-green-700 space-y-2">
                  <p>
                    <strong>Itens aceitos:</strong> Móveis velhos,
                    eletrodomésticos, colchões, sofás, geladeiras, fogões,
                    televisores, computadores e outros objetos grandes.
                  </p>
                  <p>
                    <strong>Não aceitos:</strong> Lixo comum, materiais de
                    construção, produtos químicos, lixo hospitalar ou materiais
                    perigosos.
                  </p>
                  <p>
                    <strong>Contato:</strong> Para mais informações, ligue 156
                    ou acesse o site oficial da Prefeitura de São Paulo.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
