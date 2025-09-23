"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { SearchBarRefactored as SearchBar } from "../../components/search/SearchBarRefactored";
import { ServiceSelector } from "../../components/search/ServiceSelector";
import { ServicesList } from "../../components/services/ServicesList";
import { Layout } from "../../components/layout/Layout";
import { CataBagulhoResult, TrechoCoordinates } from "../../types/cataBagulho";
import { FeiraLivre } from "../../types/feiraLivre";
import { ColetaLixoResponse } from "../../types/coletaLixo";
import { EstabelecimentoSaude } from "../../lib/services/saudeLocal.service";
import { fetchTrechoCoordinates } from "../../services/trechoService";
import { Card } from "../../components/ui/Card";
import { FeirasSkeletonLoading, CataBagulhoSkeletonLoading } from "../../components/ui/SkeletonLoading";

// Dynamic import do mapa para evitar problemas de SSR
const MapView = dynamic(
  () =>
    import("../../components/map/MapView").then((mod) => ({
      default: mod.MapView,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 gradient-secondary">
          <h3 className="text-lg font-semibold text-white">
            Localização e Trecho
          </h3>
        </div>
        <div className="h-96 w-full flex items-center justify-center bg-gray-100">
          <div className="spinner w-8 h-8"></div>
        </div>
      </div>
    ),
  },
);

function BuscarPageContent() {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<CataBagulhoResult[]>([]);
  const [feirasResults, setFeirasResults] = useState<FeiraLivre[]>([]);
  const [coletaLixoResults, setColetaLixoResults] = useState<ColetaLixoResponse | undefined>(undefined);
  const [saudeResults, setSaudeResults] = useState<EstabelecimentoSaude[]>([]);
  const [userCoordinates, setUserCoordinates] = useState<{
    lat: number;
    lng: number;
  } | undefined>(undefined);
  const [userAddress, setUserAddress] = useState<string>("");
  const [trechoCoordinates, setTrechoCoordinates] =
    useState<TrechoCoordinates | null>(null);
  const [error, setError] = useState<string>("");
  const [loadingTrecho, setLoadingTrecho] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedService, setSelectedService] =
    useState<string>("cata-bagulho");
  const [currentServiceType, setCurrentServiceType] = useState<string>("cata-bagulho");
  const [selectedFeiraId, setSelectedFeiraId] = useState<string | undefined>(undefined);

  // Verificar parâmetros da URL para pré-selecionar serviço
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam === 'feiras-livres') {
      setSelectedService('feiras-livres');
      setCurrentServiceType('feiras-livres');
    } else if (serviceParam === 'coleta-lixo') {
      setSelectedService('coleta-lixo');
      setCurrentServiceType('coleta-lixo');
    } else if (serviceParam === 'saude') {
      setSelectedService('saude');
      setCurrentServiceType('saude');
    }
  }, [searchParams]);

  const handleSearchResults = (
    results: CataBagulhoResult[] | FeiraLivre[] | ColetaLixoResponse | EstabelecimentoSaude[],
    coordinates: { lat: number; lng: number },
    serviceType: string,
    address?: string
  ) => {
    console.log("🎯 [BuscarPage] Recebendo resultados:");
    console.log("🎯 [BuscarPage] - Resultados:", results);
    console.log("🎯 [BuscarPage] - Coordenadas:", coordinates);
    console.log("🎯 [BuscarPage] - Tipo de serviço:", serviceType);
    console.log("🎯 [BuscarPage] - Endereço:", address);
    
    setLoadingSearch(false);
    
    if (serviceType === "cata-bagulho") {
      setSearchResults(results as CataBagulhoResult[]);
      setFeirasResults([]);
      setColetaLixoResults(undefined);
      setSaudeResults([]);
    } else if (serviceType === "feiras-livres") {
      setFeirasResults(results as FeiraLivre[]);
      setSearchResults([]);
      setColetaLixoResults(undefined);
      setSaudeResults([]);
    } else if (serviceType === "coleta-lixo") {
      setColetaLixoResults(results as ColetaLixoResponse);
      setSearchResults([]);
      setFeirasResults([]);
      setSaudeResults([]);
    } else if (serviceType === "saude") {
      setSaudeResults(results as EstabelecimentoSaude[]);
      setSearchResults([]);
      setFeirasResults([]);
      setColetaLixoResults(undefined);
    }
    
    console.log("🎯 [BuscarPage] Definindo coordenadas do usuário:", coordinates);
    setUserCoordinates(coordinates);
    setUserAddress(address || "");
    setCurrentServiceType(serviceType);
    setTrechoCoordinates(null); // Limpa trecho anterior
    setSelectedFeiraId(undefined); // Limpa seleção de feira anterior
    setError("");

    // Auto-scroll para os resultados
    setTimeout(() => {
      const resultsSection = document.getElementById("resultados-section");
      if (resultsSection) {
        resultsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handleError = (errorMessage: string) => {
    setLoadingSearch(false);
    setError(errorMessage);
    setSearchResults([]);
    setTrechoCoordinates(null);
  };

  const handleSearchStart = () => {
    setLoadingSearch(true);
    setError("");
  };

  const handleVerTrecho = async (trechoId: string) => {
    setLoadingTrecho(true);
    try {
      // Se for feira livre (detectado pelo prefixo ou tipo de serviço), não busca trecho
      if (currentServiceType === "feiras-livres" || trechoId.startsWith("feira-")) {
        // Para feiras, definir a feira selecionada para mostrar a rota
        setSelectedFeiraId(trechoId);
        setTrechoCoordinates(null);
        setError("");
      } else {
        // Para cata-bagulho, busca as coordenadas do trecho
        const trecho = await fetchTrechoCoordinates(trechoId);
        setTrechoCoordinates(trecho);
        setSelectedFeiraId(undefined); // Limpar seleção de feira
        setError("");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao carregar trecho";
      setError(`Erro ao carregar trecho: ${message}`);
      setTrechoCoordinates(null);
      setSelectedFeiraId(undefined);
    } finally {
      setLoadingTrecho(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Buscar Serviços Públicos
          </h1>
          <p className="text-white/90 text-center text-lg">
            Encontre serviços de Cata-Bagulho próximos ao seu endereço
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <Card padding="md" className="mb-6">
          <ServiceSelector
            selectedService={selectedService}
            onServiceChange={setSelectedService}
          />
        </Card>

        <SearchBar
          selectedService={selectedService}
          onSearchResults={handleSearchResults}
          onError={handleError}
          onSearchStart={handleSearchStart}
          currentCoordinates={userCoordinates}
          currentAddress={userAddress}
        />

        {/* Para Saúde Pública: mostrar apenas o mapa */}
        {currentServiceType === "saude" ? (
          <div className="space-y-6">
            {loadingSearch && (
              <Card padding="md">
                <h2 className="text-2xl font-bold text-dark-primary mb-4">
                  Buscando estabelecimentos de saúde...
                </h2>
                <div className="flex items-center justify-center py-8">
                  <div className="spinner w-8 h-8"></div>
                </div>
              </Card>
            )}

            {userCoordinates && (
              <MapView
                center={[userCoordinates.lat, userCoordinates.lng]}
                userLocation={[userCoordinates.lat, userCoordinates.lng]}
                userAddress={userAddress}
                trechoCoordinates={trechoCoordinates}
                className="w-full h-[600px]"
                isFeira={false}
                feiras={[]}
                selectedFeiraId={undefined}
                isSaude={true}
                estabelecimentosSaude={saudeResults}
              />
            )}

            {!userCoordinates && !loadingSearch && (
              <Card padding="lg" className="text-center">
                <div className="text-6xl mb-4">🏥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Estabelecimentos de Saúde
                </h3>
                <p className="text-gray-600">
                  Digite seu CEP e número para encontrar estabelecimentos de saúde na sua região.
                </p>
              </Card>
            )}
          </div>
        ) : (
          /* Para outros serviços: layout original com cartões */
          <div
            id="resultados-section"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Coluna dos Resultados */}
            <div className="space-y-6">
              {loadingSearch && (
                <Card padding="md">
                  <h2 className="text-2xl font-bold text-dark-primary mb-4">
                    Buscando...
                  </h2>
                  {currentServiceType === "feiras-livres" ? (
                    <FeirasSkeletonLoading />
                  ) : (
                    <CataBagulhoSkeletonLoading />
                  )}
                </Card>
              )}

              {!loadingSearch && (searchResults.length > 0 || feirasResults.length > 0 || coletaLixoResults) && (
                <Card padding="md">
                  <h2 className="text-2xl font-bold text-dark-primary mb-4">
                    Resultados Encontrados ({searchResults.length + feirasResults.length + (coletaLixoResults ? 1 : 0)})
                  </h2>
                  <ServicesList
                    services={searchResults}
                    feiras={feirasResults}
                    coletaLixo={coletaLixoResults}
                    estabelecimentosSaude={[]}
                    serviceType={currentServiceType}
                    onViewTrecho={handleVerTrecho}
                    selectedFeiraId={selectedFeiraId}
                  />
                </Card>
              )}

              {!loadingSearch && searchResults.length === 0 && feirasResults.length === 0 && !coletaLixoResults && !error && (
                <Card padding="lg" className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Faça uma busca
                  </h3>
                  <p className="text-gray-600">
                    Digite seu CEP e número para encontrar {selectedService === "cata-bagulho" ? "serviços de Cata-Bagulho" : selectedService === "feiras-livres" ? "feiras livres" : "informações de coleta de lixo"} na sua região.
                  </p>
                </Card>
              )}
            </div>

            {/* Coluna do Mapa */}
            <div className="space-y-6">
              {userCoordinates && (
                <>
                  {loadingTrecho && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="spinner w-4 h-4 mr-3"></div>
                        <p className="text-blue-700 font-medium">
                          Carregando trecho...
                        </p>
                      </div>
                    </div>
                  )}

                  <MapView
                    center={[userCoordinates.lat, userCoordinates.lng]}
                    userLocation={[userCoordinates.lat, userCoordinates.lng]}
                    userAddress={userAddress}
                    trechoCoordinates={trechoCoordinates}
                    className="sticky top-4"
                    isFeira={currentServiceType === "feiras-livres"}
                    feiras={currentServiceType === "feiras-livres" ? feirasResults : []}
                    selectedFeiraId={selectedFeiraId}
                    isSaude={false}
                    estabelecimentosSaude={[]}
                  />
                </>
              )}

              {!userCoordinates && (
                <Card padding="lg" className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Mapa da Região
                  </h3>
                  <p className="text-gray-600">
                    O mapa será exibido aqui após você fazer uma busca.
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 text-center">
              Buscar Serviços Públicos
            </h1>
            <p className="text-white/90 text-center text-lg">
              Carregando...
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="spinner w-8 h-8"></div>
          </div>
        </div>
      </Layout>
    }>
      <BuscarPageContent />
    </Suspense>
  );
}
