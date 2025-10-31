"use client";

import { useEffect, useState } from "react";
import { FiltroSaude } from "../../types/saude";
import { TIPOS_COM_NUMERO, obterTiposPorNumeros } from "../../utils/saude-tipos-unicos";

interface HealthLayerSelectorProps {
  filtros: FiltroSaude;
  onFiltroChange: (filtros: FiltroSaude) => void;
  className?: string;
}

export function HealthLayerSelector({
  filtros,
  onFiltroChange,
  className = "",
}: HealthLayerSelectorProps) {
  const [tiposSelecionados, setTiposSelecionados] = useState<Set<number>>(new Set());
  const carregando = false;

  // Inicializar com tipos principais selecionados (1-13)
  useEffect(() => {
    const numerosIniciais = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    setTiposSelecionados(numerosIniciais);
    const tiposDiretos = obterTiposPorNumeros(numerosIniciais);
    const novosFiltros: FiltroSaude = {
      ...filtros,
      // Garantir que propriedades de esfera administrativa existam
      municipal: filtros.municipal ?? true,
      estadual: filtros.estadual ?? true,
      privado: filtros.privado ?? true,
    };
    (novosFiltros as unknown as Record<string, unknown>).__tiposDiretos = tiposDiretos;
    onFiltroChange(novosFiltros);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNumeroToggle = (numero: number) => {
    const novosNumerosSelecionados = new Set(tiposSelecionados);
    if (novosNumerosSelecionados.has(numero)) {
      novosNumerosSelecionados.delete(numero);
    } else {
      novosNumerosSelecionados.add(numero);
    }
    setTiposSelecionados(novosNumerosSelecionados);
    
    // Obter tipos diretamente dos números selecionados
    const tiposDiretos = obterTiposPorNumeros(novosNumerosSelecionados);
    
    // Criar novos filtros preservando propriedades existentes (especialmente esfera administrativa)
    const novosFiltros: FiltroSaude = {
      ...filtros,
      // Garantir que propriedades de esfera administrativa existam
      municipal: filtros.municipal ?? true,
      estadual: filtros.estadual ?? true,
      privado: filtros.privado ?? true,
    };
    (novosFiltros as unknown as Record<string, unknown>).__tiposDiretos = tiposDiretos;
    
    onFiltroChange(novosFiltros);
  };

  const handleSelectAll = () => {
    const todosNumeros = new Set(TIPOS_COM_NUMERO.map(t => t.numero));
    setTiposSelecionados(todosNumeros);
    const tiposDiretos = obterTiposPorNumeros(todosNumeros);
    const novosFiltros: FiltroSaude = {
      ...filtros,
      municipal: filtros.municipal ?? true,
      estadual: filtros.estadual ?? true,
      privado: filtros.privado ?? true,
    };
    (novosFiltros as unknown as Record<string, unknown>).__tiposDiretos = tiposDiretos;
    onFiltroChange(novosFiltros);
  };

  const handleSelectNone = () => {
    setTiposSelecionados(new Set());
    const novosFiltros: FiltroSaude = {
      ...filtros,
      municipal: filtros.municipal ?? true,
      estadual: filtros.estadual ?? true,
      privado: filtros.privado ?? true,
    };
    (novosFiltros as unknown as Record<string, unknown>).__tiposDiretos = [];
    onFiltroChange(novosFiltros);
  };

  // Agrupar tipos por categoria
  const agruparTiposPorCategoria = () => {
    const categorias: Record<string, typeof TIPOS_COM_NUMERO> = {};
    
    TIPOS_COM_NUMERO.forEach(tipoInfo => {
      const cat = tipoInfo.categoria;
      if (!categorias[cat]) {
        categorias[cat] = [];
      }
      categorias[cat].push(tipoInfo);
    });

    return categorias;
  };

  if (carregando) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando tipos...</p>
        </div>
      </div>
    );
  }

  const categorias = agruparTiposPorCategoria();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark-primary">
          🏥 Filtros de Estabelecimentos
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            Todos
          </button>
          <button
            onClick={handleSelectNone}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
          >
            Nenhum
          </button>
        </div>
      </div>

      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="text-sm text-gray-600 mb-3">
          Selecione os tipos de estabelecimentos que deseja visualizar:
          <span className="ml-2 font-medium text-dark-primary">
            {tiposSelecionados.size} de {TIPOS_COM_NUMERO.length} selecionados
          </span>
        </div>

        {/* Mostrar tipos agrupados por categoria */}
        {Object.entries(categorias).map(([categoria, tiposNumerados]) => {
          if (tiposNumerados.length === 0) return null;
          
          const emojiCategoria: Record<string, string> = {
            'Principais': '🏥',
            'Urgência': '🚑',
            'Ambulatorial': '🏥',
            'Especialidades': '🔬',
            'Saúde Mental': '🧠',
            'Diagnóstico': '🔍',
            'Odontologia': '🦷',
            'Reabilitação': '♿',
            'DST/AIDS': '🔴',
            'Outros': '📋'
          };

          return (
            <div key={categoria} className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                {emojiCategoria[categoria] || '📋'} {categoria}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {tiposNumerados.map((tipoNumero) => {
                  const estaSelecionado = tiposSelecionados.has(tipoNumero.numero);
                  
                  return (
                    <label 
                      key={tipoNumero.numero} 
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={estaSelecionado}
                        onChange={() => handleNumeroToggle(tipoNumero.numero)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span style={{ color: estaSelecionado ? tipoNumero.cor : '#6B7280' }}>
                          {tipoNumero.nomeFormatado}
                        </span>
                        <span 
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg border-2"
                          style={{ 
                            backgroundColor: estaSelecionado ? tipoNumero.cor : '#E5E7EB',
                            color: estaSelecionado ? '#FFFFFF' : '#6B7280',
                            borderColor: estaSelecionado ? tipoNumero.cor : '#D1D5DB',
                            boxShadow: estaSelecionado 
                              ? `0 2px 4px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 2px rgba(255,255,255,0.3)`
                              : `0 1px 2px rgba(0,0,0,0.1)`
                          }}
                        >
                          {tipoNumero.numero}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Avisar quando nenhum tipo está selecionado */}
        {tiposSelecionados.size === 0 && !carregando && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-1">
              ⚠️ Nenhum tipo de estabelecimento selecionado
            </p>
            <p className="text-xs text-yellow-700">
              Selecione pelo menos um tipo acima para visualizar os marcadores no mapa.
            </p>
          </div>
        )}
      </div>

      {/* Filtros por Esfera Administrativa */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-gray-600 mb-3">
          Selecione a esfera administrativa:
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Público (Municipal + Estadual) */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filtros.municipal && filtros.estadual}
              onChange={(e) => {
                const novosFiltros = {
                  ...filtros,
                  municipal: e.target.checked,
                  estadual: e.target.checked
                };
                onFiltroChange(novosFiltros);
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              🏛️ Público (Municipal + Estadual)
            </span>
          </label>

          {/* Privado */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filtros.privado}
              onChange={(e) => {
                const novosFiltros = { ...filtros, privado: e.target.checked };
                onFiltroChange(novosFiltros);
              }}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              🏥 Privado
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
