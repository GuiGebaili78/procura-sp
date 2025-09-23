import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaBuilding } from 'react-icons/fa';
import { EstabelecimentoSaude } from '@/lib/services/saudeLocal.service';

interface HealthMarkerInfoProps {
  coordenadas: { lat: number; lng: number };
  estabelecimentos: EstabelecimentoSaude[];
  onClose: () => void;
}

export function HealthMarkerInfo({ coordenadas, estabelecimentos, onClose }: HealthMarkerInfoProps) {
  if (estabelecimentos.length === 0) return null;

  // Agrupar estabelecimentos por categoria
  const estabelecimentosPorCategoria = estabelecimentos.reduce((acc, est) => {
    const categoria = est.categoria || 'Outros';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(est);
    return acc;
  }, {} as Record<string, EstabelecimentoSaude[]>);

  // Pegar informações do primeiro estabelecimento (mesmo endereço)
  const primeiroEstabelecimento = estabelecimentos[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">
              Complexo de Saúde
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Endereço */}
          <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <FaMapMarkerAlt className="text-gray-500 mt-1" size={16} />
            <div>
              <p className="font-medium text-gray-800">{primeiroEstabelecimento.endereco}</p>
              <p className="text-sm text-gray-600">
                {primeiroEstabelecimento.bairro} - {primeiroEstabelecimento.cep}
              </p>
            </div>
          </div>

          {/* Telefone (se disponível) */}
          {primeiroEstabelecimento.telefone && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <FaPhone className="text-gray-500" size={16} />
              <div>
                <p className="font-medium text-gray-800">Telefone</p>
                <p className="text-sm text-gray-600">
                  {primeiroEstabelecimento.telefone.toString().replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')}
                </p>
              </div>
            </div>
          )}

          {/* Serviços Disponíveis */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaBuilding className="text-blue-600" size={16} />
              Serviços Disponíveis ({estabelecimentos.length})
            </h4>
            
            <div className="space-y-3">
              {Object.entries(estabelecimentosPorCategoria).map(([categoria, estabelecimentos]) => (
                <div key={categoria} className="border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-700 mb-2">{categoria}</h5>
                  <div className="space-y-2">
                    {estabelecimentos.map((estabelecimento) => (
                      <div key={estabelecimento.id} className="text-sm text-gray-600">
                        <p className="font-medium">{estabelecimento.nome}</p>
                        {estabelecimento.descricao && (
                          <p className="text-xs text-gray-500 mt-1">{estabelecimento.descricao}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaBuilding size={12} />
                            {estabelecimento.administracao}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt size={12} />
                            {estabelecimento.regiao}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p>
              <strong>Coordenadas:</strong> {coordenadas.lat.toFixed(6)}, {coordenadas.lng.toFixed(6)}
            </p>
            <p className="mt-1">
              <strong>Última atualização:</strong> {new Date(primeiroEstabelecimento.dataAtualizacao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
