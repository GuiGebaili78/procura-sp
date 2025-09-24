import React from 'react';
import { EstabelecimentoSaude } from '@/lib/services/saudeLocal.service';

interface HealthMarkerPopupProps {
  estabelecimentos: EstabelecimentoSaude[];
}

export function HealthMarkerPopup({ estabelecimentos }: HealthMarkerPopupProps) {
  if (estabelecimentos.length === 0) return null;

  // Pegar informações do primeiro estabelecimento (mesmo endereço)
  const primeiroEstabelecimento = estabelecimentos[0];

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

  // Função para obter sigla da categoria
  const getSiglaCategoria = (categoria: string | null): string => {
    if (!categoria) return 'SAÚDE';
    
    const siglasPorCategoria: Record<string, string> = {
      'Unidade Básica de Saúde': 'UBS',
      'Hospital Geral': 'HOSPITAL',
      'Hospital': 'HOSPITAL',
      'Hospital Especializado': 'HOSPITAL',
      'Pronto Socorro Geral': 'PS',
      'Pronto Atendimento': 'PA',
      'AMA Especialidades': 'AMA',
      'Assistência Médica Ambulatorial': 'AMA',
      'Ambulatório de Especialidades': 'AMB',
      'Centro e Serviços de Diagnóstico por Imagem': 'DIAG',
      'Centro/Clínica de Especialidades Odontológicas': 'ODONTO',
      'Laboratório': 'LAB',
      'Centro de Atenção Psicossocial Adulto': 'CAPS',
      'Centro de Atenção Psicossocial Infantil': 'CAPS',
      'Centro de Atenção Psicossocial Álcool e Drogas': 'CAPS',
      'Centro de Reabilitação': 'REAB',
      'Núcleo Integrado de Reabilitação': 'REAB',
    };
    
    return siglasPorCategoria[categoria] || 'SAÚDE';
  };

  // Agrupar estabelecimentos por tipo
  const estabelecimentosPorTipo = estabelecimentos.reduce((acc, est) => {
    const tipo = getSiglaCategoria(est.categoria);
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(est);
    return acc;
  }, {} as Record<string, EstabelecimentoSaude[]>);

  // Obter telefone (priorizar o primeiro disponível)
  const telefoneDisponivel = estabelecimentos.find(est => est.telefone)?.telefone;

  return (
    <div className="max-w-[280px]">
      {/* Header compacto */}
      <div className="text-center mb-2">
        <strong className="text-sm font-semibold text-gray-800">
          🏥 {primeiroEstabelecimento.nome}
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
          {Object.entries(estabelecimentosPorTipo).map(([tipo, estabelecimentos]) => (
            <span 
              key={tipo} 
              className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium"
            >
              {tipo}
              {estabelecimentos.length > 1 && ` (${estabelecimentos.length})`}
            </span>
          ))}
        </div>
      </div>

      {/* Informações administrativas compactas */}
      <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
        <span>🏛️ {primeiroEstabelecimento.administracao || 'N/A'}</span>
        <span>🗺️ {primeiroEstabelecimento.regiao}</span>
      </div>

      {/* Distância compacta */}
      {primeiroEstabelecimento.distancia && (
        <div className="text-center pt-2 border-t border-gray-200">
          <div className="text-xs text-blue-600 font-medium">
            📍 {primeiroEstabelecimento.distancia < 1000 
              ? `${Math.round(primeiroEstabelecimento.distancia)}m` 
              : `${(primeiroEstabelecimento.distancia / 1000).toFixed(1)}km`}
          </div>
        </div>
      )}
    </div>
  );
}
