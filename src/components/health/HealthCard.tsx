"use client";

import { useState } from "react";
import { EstabelecimentoSaude, TIPOS_ESTABELECIMENTO } from "../../types/saude";
import { obterInfoPorTipo } from "../../utils/saude-tipos-unicos";

interface HealthCardProps {
  estabelecimento: EstabelecimentoSaude & { descricao?: string | null; tipo?: string };
  onSelect?: (estabelecimento: EstabelecimentoSaude) => void;
  className?: string;
}

export function HealthCard({ estabelecimento, onSelect, className = "" }: HealthCardProps) {
  const [mostrarDescricao, setMostrarDescricao] = useState(false);
  
  // Determinar o tipo e cor do estabelecimento
  const getTipoInfo = (): {
    numero: number;
    tipo: string;
    cor: string;
    categoria: string;
    nomeFormatado: string;
  } => {
    // Sempre tentar usar o tipo do estabelecimento primeiro
    if (estabelecimento.tipo) {
      return obterInfoPorTipo(estabelecimento.tipo);
    }
    
    // Caso contrário, mapear códigos para tipos conhecidos e obter info
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
    const tipoEstabelecimento = TIPOS_ESTABELECIMENTO[tipo];
    
    // Tentar obter info pelo nome do tipo
    const infoPorTipo = obterInfoPorTipo(tipoEstabelecimento.nome);
    
    // Se encontrou info com numero válido, retornar
    if (infoPorTipo.numero !== 99) {
      return infoPorTipo;
    }
    
    // Fallback: retornar estrutura compatível com numero
    return {
      numero: 99,
      tipo: tipoEstabelecimento.nome,
      cor: tipoEstabelecimento.cor,
      categoria: 'Outros',
      nomeFormatado: tipoEstabelecimento.nome,
    };
  };

  const tipoInfo = getTipoInfo();
  const temDescricao = estabelecimento.descricao && estabelecimento.descricao.trim().length > 0;
  
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
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: tipoInfo.cor }}
            >
              {tipoInfo.numero}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {estabelecimento.nome}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {tipoInfo.nomeFormatado}
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
          <div className="flex items-center gap-3">
            {temDescricao && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMostrarDescricao(true);
                }}
                className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                Saber mais →
              </button>
            )}
            <div className="text-xs text-blue-600 font-medium">
              Ver detalhes →
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Descrição */}
      {mostrarDescricao && temDescricao && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setMostrarDescricao(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: tipoInfo.cor }}
                >
                  {tipoInfo.numero}
                </span>
                {estabelecimento.nome}
              </h3>
              <button
                onClick={() => setMostrarDescricao(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Tipo de Estabelecimento</h4>
                <p className="text-sm text-gray-600">{tipoInfo.nomeFormatado}</p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Descrição</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {estabelecimento.descricao}
                </p>
              </div>

              {/* Informações adicionais */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Informações de Contato</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {estabelecimento.endereco && (
                    <div className="flex items-start gap-2">
                      <span>📍</span>
                      <span>{estabelecimento.endereco}{estabelecimento.bairro ? `, ${estabelecimento.bairro}` : ''}</span>
                    </div>
                  )}
                  {telefoneFormatado && (
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      <span>{telefoneFormatado}</span>
                    </div>
                  )}
                  {estabelecimento.regiao && (
                    <div className="flex items-center gap-2">
                      <span>🗺️</span>
                      <span>Região: {estabelecimento.regiao}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setMostrarDescricao(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

