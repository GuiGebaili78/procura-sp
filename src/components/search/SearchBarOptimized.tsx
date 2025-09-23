"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
import { Card } from "../ui/Card";
import { CepInput } from "./CepInput";
import { AddressDisplay } from "./AddressDisplay";
import { SearchButton } from "./SearchButton";
import { HealthFilters } from "../health/HealthFilters";
import { useCepSearch } from "../../hooks/useCepSearch";
import { useGeocoding } from "../../hooks/useGeocoding";
import { useServiceSearch } from "../../hooks/useServiceSearch";
import { CataBagulhoResult } from "../../types/cataBagulho";
import { FeiraLivre } from "../../types/feiraLivre";
import { ColetaLixoResponse } from "../../types/coletaLixo";
import { EstabelecimentoSaude } from "../../lib/services/saudeLocal.service";

interface SearchBarProps {
  selectedService: string;
  onSearchResults: (
    results: CataBagulhoResult[] | FeiraLivre[] | ColetaLixoResponse | EstabelecimentoSaude[],
    coordinates: { lat: number; lng: number },
    serviceType: string,
    address?: string
  ) => void;
  onError: (error: string) => void;
  onSearchStart?: () => void;
  currentCoordinates?: { lat: number; lng: number };
  currentAddress?: string;
}

// Componente memoizado para evitar re-renders desnecessários
export const SearchBarOptimized = memo(function SearchBarOptimized({ 
  selectedService, 
  onSearchResults, 
  onError, 
  onSearchStart,
  currentCoordinates,
  currentAddress 
}: SearchBarProps) {
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState("");
  
  // Filtros de saúde baseados em categorias
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Unidade Básica de Saúde',
    'Hospital Geral',
    'Hospital',
    'Pronto Socorro Geral'
  ]);

  // Hooks customizados
  const { cep, endereco, loadingCep, cepError, handleCepChange } = useCepSearch();
  
  // Função para limpar o campo número quando CEP for alterado
  const handleCepChangeWithClear = useCallback(async (value: string) => {
    await handleCepChange(value, () => {
      setNumero(""); // Limpa o campo número quando CEP é alterado
    });
  }, [handleCepChange]);
  const { geocodeAddress, obterCoordenadasAproximadasPorCEP } = useGeocoding();
  const { searchCataBagulho, searchFeiras, searchColetaLixo, searchSaude, searchEstabelecimentosTempoReal } = useServiceSearch();

  // Memoizar endereço completo
  const enderecoCompleto = useMemo(() => {
    if (!endereco.logradouro || !numero) return "";
    return `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
  }, [endereco, numero]);

  // Memoizar nome do serviço
  const serviceName = useMemo(() => {
    switch (selectedService) {
      case "cata-bagulho": return "Cata-Bagulho";
      case "feiras-livres": return "Feiras Livres";
      case "coleta-lixo": return "Coleta de Lixo";
      case "saude": return "Saúde Pública";
      default: return "Serviços";
    }
  }, [selectedService]);

  // Memoizar se o botão está desabilitado
  const isButtonDisabled = useMemo(() => {
    return loading || loadingCep || !cep || !numero || !endereco.logradouro;
  }, [loading, loadingCep, cep, numero, endereco.logradouro]);

  // Função para buscar estabelecimentos em tempo real - memoizada
  const buscarEstabelecimentosTempoReal = useCallback(async (novasCategorias: string[]) => {
    if (selectedService !== "saude" || !cep || !numero || !endereco.logradouro) {
      console.log('⚠️ [SearchBar] Não é possível aplicar filtros em tempo real - dados incompletos');
      return;
    }

    try {
      // Usar coordenadas atuais ou obter novas se necessário
      let coordinates = currentCoordinates;
      if (!coordinates) {
        coordinates = obterCoordenadasAproximadasPorCEP(cep);
        console.log('📍 [SearchBar] Usando coordenadas aproximadas:', coordinates);
      }
      
      if (!coordinates) {
        console.log('⚠️ [SearchBar] Não foi possível obter coordenadas');
        return;
      }
      
      const results = await searchEstabelecimentosTempoReal({
        cep,
        numero,
        coordinates,
        enderecoCompleto,
        categorias: novasCategorias
      });

      if (results.length > 0) {
        onSearchResults(results, coordinates, "saude", enderecoCompleto);
      } else {
        onSearchResults([], coordinates, "saude", currentAddress);
      }
    } catch (error) {
      console.error('❌ [SearchBar] Erro ao aplicar filtros em tempo real:', error);
    }
  }, [
    selectedService, 
    cep, 
    numero, 
    endereco.logradouro, 
    currentCoordinates, 
    currentAddress, 
    obterCoordenadasAproximadasPorCEP, 
    searchEstabelecimentosTempoReal, 
    enderecoCompleto, 
    onSearchResults
  ]);

  // Função principal de busca - memoizada
  const handleSearch = useCallback(async () => {
    if (!cep || !numero || !endereco.logradouro) {
      onError("Por favor, preencha o CEP e o número.");
      return;
    }

    setLoading(true);
    setNoResultsMessage("");
    onSearchStart?.();

    try {
      // Tentar geocoding real primeiro, fallback para coordenadas aproximadas
      console.log("📍 Tentando geocoding real do endereço...");
      
      let coordinates: { lat: number; lng: number } | null = null;
      
      try {
        console.log("🔍 Tentando geocoding para:", enderecoCompleto);
        coordinates = await geocodeAddress(enderecoCompleto);
        if (!coordinates) {
          console.log("⚠️ Geocoding retornou resultado vazio, usando coordenadas aproximadas por CEP");
          coordinates = obterCoordenadasAproximadasPorCEP(cep) || null;
        }
      } catch (error) {
        console.error("❌ Erro no geocoding:", error);
        console.log("⚠️ Geocoding falhou, usando coordenadas aproximadas por CEP");
        coordinates = obterCoordenadasAproximadasPorCEP(cep) || null;
        console.log("📍 Coordenadas aproximadas obtidas:", coordinates);
      }
      
      if (!coordinates) {
        console.error("❌ Nenhuma coordenada obtida, nem por geocoding nem por fallback");
        throw new Error(
          "Não foi possível encontrar as coordenadas do endereço. Verifique se o CEP e número estão corretos.",
        );
      }
      
      console.log("✅ Coordenadas finais obtidas:", coordinates);

      // Busca serviços baseado no tipo selecionado
      const searchParams = {
        cep,
        numero,
        coordinates,
        enderecoCompleto,
        categorias: selectedService === "saude" ? selectedCategories : undefined
      };

      let results: CataBagulhoResult[] | FeiraLivre[] | ColetaLixoResponse | EstabelecimentoSaude[] = [];

      switch (selectedService) {
        case "cata-bagulho":
          results = await searchCataBagulho(searchParams);
          break;
        case "feiras-livres":
          results = await searchFeiras(searchParams);
          break;
        case "coleta-lixo":
          results = await searchColetaLixo(searchParams);
          break;
        case "saude":
          results = await searchSaude(searchParams);
          break;
        default:
          throw new Error("Tipo de serviço não suportado");
      }

      if (!results || (Array.isArray(results) && results.length === 0)) {
        setNoResultsMessage(
          `Nenhum serviço de ${serviceName} encontrado para este endereço.`,
        );
        return;
      }

      onSearchResults(results, coordinates, selectedService, enderecoCompleto);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar serviços";
      console.error("Erro na busca:", error);
      onError(message);
    } finally {
      setLoading(false);
    }
  }, [
    cep,
    numero,
    endereco.logradouro,
    enderecoCompleto,
    selectedService,
    selectedCategories,
    serviceName,
    geocodeAddress,
    obterCoordenadasAproximadasPorCEP,
    searchCataBagulho,
    searchFeiras,
    searchColetaLixo,
    searchSaude,
    onError,
    onSearchStart,
    onSearchResults
  ]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);

  const handleCategoryChange = useCallback((novasCategorias: string[]) => {
    setSelectedCategories(novasCategorias);
    // Aplicar filtros em tempo real se já tiver coordenadas
    buscarEstabelecimentosTempoReal(novasCategorias);
  }, [buscarEstabelecimentosTempoReal]);

  return (
    <Card padding="md" className="mb-6">
      <h2 className="text-2xl font-bold text-dark-primary mb-6">
        Buscar {serviceName}
      </h2>

      <CepInput
        cep={cep}
        numero={numero}
        loadingCep={loadingCep}
        cepError={cepError}
        onCepChange={handleCepChangeWithClear}
        onNumeroChange={setNumero}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />

      <AddressDisplay endereco={endereco} />

      {/* Filtros de Saúde */}
      {selectedService === "saude" && (
        <div className="mb-6">
          <HealthFilters
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            disabled={loading}
          />
        </div>
      )}

      <SearchButton
        loading={loading}
        disabled={isButtonDisabled}
        onClick={handleSearch}
        serviceName={serviceName}
      />

      {noResultsMessage && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-orange-600 mr-3">📍</div>
            <p className="text-orange-700 font-medium">{noResultsMessage}</p>
          </div>
          <p className="text-orange-600 text-sm mt-2">
            Tente verificar se o endereço está correto ou procure um endereço
            próximo.
          </p>
        </div>
      )}
    </Card>
  );
});
