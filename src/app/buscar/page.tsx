"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { SearchBar } from "../../components/search/SearchBar";
import { ServiceSelector } from "../../components/search/ServiceSelector";
import { ServicesList } from "../../components/services/ServicesList";
import { Layout } from "../../components/layout/Layout";
import { CataBagulhoResult, TrechoCoordinates } from "../../types/cataBagulho";
import { fetchTrechoCoordinates } from "../../services/trechoService";
import { Card } from "../../components/ui/Card";

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

export default function BuscarPage() {
  const [searchResults, setSearchResults] = useState<CataBagulhoResult[]>([]);
  const [userCoordinates, setUserCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [trechoCoordinates, setTrechoCoordinates] =
    useState<TrechoCoordinates | null>(null);
  const [error, setError] = useState<string>("");
  const [loadingTrecho, setLoadingTrecho] = useState(false);
  const [selectedService, setSelectedService] =
    useState<string>("cata-bagulho");

  const handleSearchResults = (
    results: CataBagulhoResult[],
    coordinates: { lat: number; lng: number },
  ) => {
    setSearchResults(results);
    setUserCoordinates(coordinates);
    setTrechoCoordinates(null); // Limpa trecho anterior
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
    setError(errorMessage);
    setSearchResults([]);
    setTrechoCoordinates(null);
  };

  const handleVerTrecho = async (trechoId: string) => {
    setLoadingTrecho(true);
    try {
      const trecho = await fetchTrechoCoordinates(trechoId);
      setTrechoCoordinates(trecho);
      setError("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao carregar trecho";
      setError(`Erro ao carregar trecho: ${message}`);
      setTrechoCoordinates(null);
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
          onSearchResults={handleSearchResults}
          onError={handleError}
        />

        <div
          id="resultados-section"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Coluna dos Resultados */}
          <div className="space-y-6">
            {searchResults.length > 0 && (
              <Card padding="md">
                <h2 className="text-2xl font-bold text-dark-primary mb-4">
                  Resultados Encontrados ({searchResults.length})
                </h2>
                <ServicesList
                  services={searchResults}
                  onViewTrecho={handleVerTrecho}
                />
              </Card>
            )}

            {searchResults.length === 0 && !error && (
              <Card padding="lg" className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Faça uma busca
                </h3>
                <p className="text-gray-600">
                  Digite seu CEP e número para encontrar serviços de
                  Cata-Bagulho na sua região.
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
                  trechoCoordinates={trechoCoordinates}
                  className="sticky top-4"
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
      </div>
    </Layout>
  );
}
