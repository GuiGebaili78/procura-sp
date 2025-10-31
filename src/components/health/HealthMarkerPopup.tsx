"use client";

import React, { useState } from 'react';
import { EstabelecimentoSaude } from '@/lib/services/saudeLocal.service';
import { obterInfoPorTipo, obterTipoMaisFrequente } from '@/utils/saude-tipos-unicos';

interface HealthMarkerPopupProps {
  estabelecimentos: EstabelecimentoSaude[];
}

export function HealthMarkerPopup({ estabelecimentos }: HealthMarkerPopupProps) {
  const [mostrarDescricao, setMostrarDescricao] = useState(false);
  
  if (estabelecimentos.length === 0) return null;

  // Pegar informações do primeiro estabelecimento (mesmo endereço)
  const primeiroEstabelecimento = estabelecimentos[0];
  
  // Obter ícone baseado no tipo mais frequente quando houver múltiplos
  const tipoMaisFrequente = obterTipoMaisFrequente(estabelecimentos);
  const iconeInfo = obterInfoPorTipo(tipoMaisFrequente);
  
  // Verificar se há descrição disponível
  const temDescricao = primeiroEstabelecimento.descricao && 
    primeiroEstabelecimento.descricao.trim().length > 0;

  // Função para formatar telefone
  const formatarTelefone = (telefone: number | null): string => {
    if (!telefone) return '';
    
    const telefoneStr = telefone.toString();
    if (telefoneStr.length === 8) {
      return telefoneStr.replace(/(\d{4})(\d{4})/, '$1-$2');
    } else if (telefoneStr.length === 10) {
      return telefoneStr.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (telefoneStr.length === 11) {
      return telefoneStr.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefoneStr;
  };

  // Função para formatar endereço (sem CEP)
  const formatarEndereco = (estabelecimento: EstabelecimentoSaude): string => {
    const partes = [];
    
    if (estabelecimento.endereco) {
      partes.push(estabelecimento.endereco);
    }
    
    if (estabelecimento.bairro) {
      partes.push(estabelecimento.bairro);
    }
    
    return partes.join(', ');
  };

  // Agrupar estabelecimentos por tipo
  const estabelecimentosPorTipo = estabelecimentos.reduce((acc, est) => {
    const tipoDisplay = est.tipo; // Usar o nome exato do tipo
    if (!acc[tipoDisplay]) {
      acc[tipoDisplay] = [];
    }
    acc[tipoDisplay].push(est);
    return acc;
  }, {} as Record<string, EstabelecimentoSaude[]>);

  // Obter telefone (priorizar o primeiro disponível)
  const telefoneDisponivel = estabelecimentos.find(est => est.telefone)?.telefone;

  return (
    <div className="max-w-[280px]">
      {/* Header compacto */}
      <div className="text-center mb-2">
        <strong className="text-sm font-semibold text-gray-800 flex items-center justify-center gap-2">
          <span 
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: iconeInfo.cor }}
          >
            {iconeInfo.numero}
          </span>
          {primeiroEstabelecimento.nome}
        </strong>
      </div>

      {/* Endereço compacto */}
      <div className="mb-2 p-2 bg-gray-50 rounded">
        <div className="text-xs text-gray-800">
          📍 {formatarEndereco(primeiroEstabelecimento)}
        </div>
      </div>

      {/* Telefone compacto */}
      {telefoneDisponivel && (
        <div className="mb-2 p-2 bg-blue-50 rounded">
          <div className="text-xs text-blue-800">
            📞 {formatarTelefone(telefoneDisponivel)}
          </div>
        </div>
      )}

      {/* Serviços disponíveis - COMPACTO */}
      <div className="mb-2">
        <div className="text-xs font-medium text-gray-700 mb-1">
          🏥 Serviços no local:
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(estabelecimentosPorTipo).map(([tipoDisplay, estabelecimentosTipo]) => {
            const primeiroTipo = estabelecimentosTipo[0];
            const iconeTipo = obterInfoPorTipo(primeiroTipo.tipo);
            return (
              <span 
                key={tipoDisplay} 
                className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium items-center gap-1"
                style={{ borderColor: iconeTipo.cor }}
              >
                <span 
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: iconeTipo.cor }}
                >
                  {iconeTipo.numero}
                </span>
                <span>{tipoDisplay}</span>
                {estabelecimentosTipo.length > 1 && ` (${estabelecimentosTipo.length})`}
              </span>
            );
          })}
        </div>
      </div>

      {/* Informações administrativas compactas */}
      <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
        <span>🏛️ {primeiroEstabelecimento.administracao || 'N/A'}</span>
        <span>🗺️ {primeiroEstabelecimento.regiao}</span>
      </div>

      {/* Distância compacta */}
      {primeiroEstabelecimento.distancia && (
        <div className="text-center pt-2 border-t border-gray-200 mb-2">
          <div className="text-xs text-blue-600 font-medium">
            📍 {primeiroEstabelecimento.distancia < 1000 
              ? `${Math.round(primeiroEstabelecimento.distancia)}m` 
              : `${(primeiroEstabelecimento.distancia / 1000).toFixed(1)}km`}
          </div>
        </div>
      )}

      {/* Botão Saber Mais */}
      {temDescricao && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={() => setMostrarDescricao(!mostrarDescricao)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded transition-colors"
          >
            <span>{mostrarDescricao ? '📖' : 'ℹ️'}</span>
            <span>{mostrarDescricao ? 'Ocultar descrição' : 'Saber mais'}</span>
          </button>
        </div>
      )}

      {/* Descrição expandida */}
      {mostrarDescricao && temDescricao && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
              {primeiroEstabelecimento.descricao}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
