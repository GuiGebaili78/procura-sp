"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Layout } from "../../components/layout/Layout";
import { Card } from "../../components/ui/Card";
import { Tabs, TabPanel, Tab } from "../../components/ui/Tabs";
import { CepSearchSimple } from "../../components/search/CepSearchSimple";
import { ServicesList } from "../../components/services/ServicesList";
import { HealthLayerSelector } from "../../components/health/HealthLayerSelector";
import { CataBagulhoResult, TrechoCoordinates } from "../../types/cataBagulho";
import { FeiraLivre } from "../../types/feiraLivre";
import { ColetaLixoResponse } from "../../types/coletaLixo";
import { EstabelecimentoSaude } from "../../lib/services/saudeLocal.service";
import { FiltroSaude } from "../../types/saude";
import { FILTROS_PADRAO } from "../../utils/saude-categorias";
import { fetchTrechoCoordinates } from "../../services/trechoService";
import { searchCataBagulho } from "../../services/api";
import { useServiceSearch } from "../../hooks/useServiceSearch";
import {
  FeirasSkeletonLoading,
  CataBagulhoSkeletonLoading,
  ColetaLixoSkeletonLoading,
  SaudeSkeletonLoading,
} from "../../components/ui/SkeletonLoading";

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
            Localização e Mapa
          </h3>
        </div>
        <div className="h-96 w-full flex items-center justify-center bg-gray-100">
          <div className="spinner w-8 h-8"></div>
        </div>
      </div>
    ),
  }
);

// Definição das abas de serviços
const SERVICE_TABS: Tab[] = [
  { id: "cata-bagulho", label: "Cata-Bagulho", icon: "🚛" },
  { id: "feiras-livres", label: "Feiras Livres", icon: "🍎" },
  { id: "coleta-lixo", label: "Coleta de Lixo", icon: "🗑️" },
  { id: "saude", label: "Saúde Pública", icon: "🏥" },
];

function BuscarPageContent() {
  const searchParams = useSearchParams();
  
  // Estado do endereço
  const [addressData, setAddressData] = useState<{
    cep: string;
    numero: string;
    endereco: {
      logradouro: string;
      bairro: string;
      localidade: string;
      uf: string;
    };
    coordinates: { lat: number; lng: number };
  } | null>(null);

  // Estado dos serviços
  const [activeTab, setActiveTab] = useState<string>("cata-bagulho");
  const [cataBagulhoResults, setCataBagulhoResults] = useState<CataBagulhoResult[]>([]);
  const [feirasResults, setFeirasResults] = useState<FeiraLivre[]>([]);
  const [coletaLixoResults, setColetaLixoResults] = useState<ColetaLixoResponse | undefined>(undefined);
  const [saudeResults, setSaudeResults] = useState<EstabelecimentoSaude[]>([]);
  
  // Estados de carregamento e erro
  const [loadingService, setLoadingService] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>("");
  const [trechoCoordinates, setTrechoCoordinates] = useState<TrechoCoordinates | null>(null);
  const [loadingTrecho, setLoadingTrecho] = useState(false);
  const [selectedFeiraId, setSelectedFeiraId] = useState<string | undefined>(undefined);

  // Filtros de saúde (padrão: UBS e Hospitais com todas as esferas)
  const [filtrosSaude, setFiltrosSaude] = useState<FiltroSaude>(FILTROS_PADRAO);

  // Hook para buscar serviços
  const { searchColetaLixo } = useServiceSearch();

  // Verificar parâmetros da URL para pré-selecionar serviço
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam && ["cata-bagulho", "feiras-livres", "coleta-lixo", "saude"].includes(serviceParam)) {
      setActiveTab(serviceParam);
    }
  }, [searchParams]);

  // Carregar dados do serviço quando a aba mudar
  useEffect(() => {
    if (addressData && !loadingService[activeTab]) {
      loadServiceData(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, addressData]);

  const handleAddressFound = (
    cep: string,
    numero: string,
    endereco: { logradouro: string; bairro: string; localidade: string; uf: string },
    coordinates: { lat: number; lng: number }
  ) => {
    // Limpar TODOS os dados anteriores quando buscar novo endereço
    setCataBagulhoResults([]);
    setFeirasResults([]);
    setColetaLixoResults(undefined);
    setSaudeResults([]);
    setTrechoCoordinates(null);
    setSelectedFeiraId(undefined);
    setError("");
    
    // Atualizar endereço
    setAddressData({ cep, numero, endereco, coordinates });
    
    // Carregar dados do serviço ativo
    loadServiceData(activeTab, { cep, numero, endereco, coordinates });
    
    // Scroll suave para o card "Endereço Selecionado" após um pequeno delay
    // Mostra desde o início do card, incluindo toda a tarja azul
    setTimeout(() => {
      const enderecoCard = document.getElementById('endereco-selecionado-card');
      if (enderecoCard) {
        // Pegar a posição do card e subtrair 80px para dar bastante espaço acima
        // Isso garante que o início completo do card fique visível
        const elementPosition = enderecoCard.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 80;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 500);
  };

  const loadServiceData = async (
    serviceType: string,
    data?: {
      cep: string;
      numero: string;
      endereco: { logradouro: string; bairro: string; localidade: string; uf: string };
      coordinates: { lat: number; lng: number };
    }
  ) => {
    const currentData = data || addressData;
    if (!currentData) return;

    // Não verificar mais se já tem dados carregados
    // Isso permite recarregar quando trocar de endereço
    console.log(`🔄 [BuscarPage] Carregando dados para ${serviceType}...`);

    setLoadingService({ ...loadingService, [serviceType]: true });
    setError("");

    try {
      const { coordinates, numero, endereco } = currentData;
      const enderecoCompleto = `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;

      switch (serviceType) {
        case "cata-bagulho":
          const cataBagulhoData = await searchCataBagulho(coordinates.lat, coordinates.lng);
          setCataBagulhoResults(cataBagulhoData || []);
          break;

        case "feiras-livres":
          console.log('🔍 [BuscarPage] Buscando feiras livres...');
          const feirasResponse = await fetch('/api/feiras', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: coordinates.lat,
              lng: coordinates.lng,
              raio: 5 // 5km de raio
            })
          });
          const feirasData = await feirasResponse.json();
          console.log('📊 [BuscarPage] Resposta feiras:', feirasData);
          
          // A API retorna { success, data: { feiras, total, ... } }
          if (feirasData.success && feirasData.data) {
            const feiras = feirasData.data.feiras || [];
            console.log(`✅ [BuscarPage] ${feiras.length} feiras encontradas`);
            setFeirasResults(feiras);
          } else {
            console.log('⚠️ [BuscarPage] Nenhuma feira encontrada');
            setFeirasResults([]);
          }
          break;

        case "coleta-lixo":
          console.log('🔍 [BuscarPage] Buscando coleta de lixo...');
          try {
            const coletaData = await searchColetaLixo({
              cep: currentData.cep,
              numero,
              coordinates,
              enderecoCompleto
            });
            setColetaLixoResults(coletaData);
            console.log('✅ [BuscarPage] Coleta encontrada');
          } catch (error) {
            console.error('❌ [BuscarPage] Erro ao buscar coleta:', error);
            setColetaLixoResults(undefined);
          }
          break;

        case "saude":
          console.log('🔍 [BuscarPage] Buscando estabelecimentos de saúde...');
          console.log('🔧 [BuscarPage] Filtros:', filtrosSaude);
          const saudeResponse = await fetch('/api/saude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: coordinates.lat,
              longitude: coordinates.lng,
              filtros: filtrosSaude,
              raio: 5000 // 5km em metros (a API converte para km)
            })
          });
          const saudeData = await saudeResponse.json();
          console.log('📊 [BuscarPage] Resposta saúde:', saudeData);
          
          // A API retorna { success, estabelecimentos }
          if (saudeData.success && saudeData.estabelecimentos) {
            const estabelecimentos = saudeData.estabelecimentos || [];
            console.log(`✅ [BuscarPage] ${estabelecimentos.length} estabelecimentos encontrados`);
            setSaudeResults(estabelecimentos);
          } else {
            console.log('⚠️ [BuscarPage] Nenhum estabelecimento encontrado');
            setSaudeResults([]);
          }
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar serviço";
      console.error("Erro ao carregar serviço:", error);
      setError(message);
    } finally {
      setLoadingService({ ...loadingService, [serviceType]: false });
    }
  };

  const handleVerTrecho = async (trechoId: string) => {
    setLoadingTrecho(true);
    try {
      if (activeTab === "feiras-livres" || trechoId.startsWith("feira-")) {
        setSelectedFeiraId(trechoId);
        setTrechoCoordinates(null);
        setError("");
      } else {
        const trecho = await fetchTrechoCoordinates(trechoId);
        setTrechoCoordinates(trecho);
        setSelectedFeiraId(undefined);
        setError("");
      }
      
      // Scroll suave para o mapa após visualizar trecho
      setTimeout(() => {
        const mapaSection = document.getElementById('mapa-section');
        if (mapaSection) {
          mapaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar trecho";
      setError(`Erro ao carregar trecho: ${message}`);
      setTrechoCoordinates(null);
      setSelectedFeiraId(undefined);
    } finally {
      setLoadingTrecho(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setTrechoCoordinates(null);
    setSelectedFeiraId(undefined);
    setError("");
    
    // Não fazer scroll ao trocar de aba - deixar o usuário navegar livremente
    // O scroll só acontece na busca inicial (handleAddressFound)
  };

  // Buscar estabelecimentos de saúde em tempo real quando filtros mudarem
  const buscarSaudeTempoReal = async (novosFiltros: FiltroSaude) => {
    if (!addressData) return;

    setLoadingService({ ...loadingService, saude: true });
    try {
      console.log('🔄 [BuscarPage] Aplicando filtros de saúde em tempo real...', novosFiltros);
      const saudeResponse = await fetch('/api/saude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: addressData.coordinates.lat,
          longitude: addressData.coordinates.lng,
          filtros: novosFiltros,
          raio: 5000 // 5km em metros (a API converte para km)
        })
      });
      const saudeData = await saudeResponse.json();
      
      if (saudeData.success && saudeData.estabelecimentos) {
        const estabelecimentos = saudeData.estabelecimentos || [];
        console.log(`✅ [BuscarPage] ${estabelecimentos.length} estabelecimentos após filtro`);
        setSaudeResults(estabelecimentos);
      } else {
        setSaudeResults([]);
      }
    } catch (error) {
      console.error("❌ [BuscarPage] Erro ao buscar estabelecimentos em tempo real:", error);
      setSaudeResults([]);
    } finally {
      setLoadingService({ ...loadingService, saude: false });
    }
  };

  const getEnderecoCompleto = () => {
    if (!addressData) return "";
    const { endereco, numero } = addressData;
    return `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Buscar Serviços Públicos
          </h1>
          <p className="text-white/90 text-center text-lg">
            Digite seu CEP para encontrar serviços próximos ao seu endereço
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

        {/* Busca de CEP - Sempre visível */}
        <CepSearchSimple
          onAddressFound={handleAddressFound}
          onError={setError}
        />

        {/* Abas de Serviços - Aparece após buscar o endereço */}
        {addressData && (
          <div id="endereco-selecionado-card" className="mt-8">
            <Card padding="none" className="overflow-hidden">
              {/* Cabeçalho com endereço */}
              <div className="p-6 bg-gradient-to-r from-primary to-secondary">
                <h3 className="text-lg font-semibold text-white mb-2">
                  📍 Endereço Selecionado
                </h3>
                <p className="text-white/90">{getEnderecoCompleto()}</p>
              </div>

              {/* Abas de Serviços */}
              <div className="px-6 pt-4">
                <Tabs tabs={SERVICE_TABS} activeTab={activeTab} onTabChange={handleTabChange} />
              </div>

              {/* Conteúdo das Abas */}
              <TabPanel>
                <div className="px-6 pb-6">
                  {/* Aba Cata-Bagulho */}
                  {activeTab === "cata-bagulho" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div id="cata-bagulho-section">
                        {loadingService["cata-bagulho"] && (
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-dark-primary mb-4">
                              Buscando serviços de Cata-Bagulho...
                            </h3>
                            <CataBagulhoSkeletonLoading />
                          </div>
                        )}

                        {!loadingService["cata-bagulho"] && cataBagulhoResults.length > 0 && (
                          <>
                            <h3 className="text-xl font-bold text-dark-primary mb-4">
                              Resultados ({cataBagulhoResults.length})
                            </h3>
                            <ServicesList
                              services={cataBagulhoResults}
                              feiras={[]}
                              coletaLixo={undefined}
                              estabelecimentosSaude={[]}
                              serviceType="cata-bagulho"
                              onViewTrecho={handleVerTrecho}
                              selectedFeiraId={undefined}
                            />
                          </>
                        )}

                        {!loadingService["cata-bagulho"] && cataBagulhoResults.length === 0 && (
                          <div className="text-center py-8">
                            <div className="text-6xl mb-4">🚛</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              Nenhum resultado encontrado
                            </h3>
                            <p className="text-gray-600">
                              Não foram encontrados serviços de Cata-Bagulho para este endereço.
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        {loadingTrecho && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center">
                              <div className="spinner w-4 h-4 mr-3"></div>
                              <p className="text-blue-700 font-medium">Carregando trecho...</p>
                            </div>
                          </div>
                        )}
                        <MapView
                          center={[addressData.coordinates.lat, addressData.coordinates.lng]}
                          userLocation={[addressData.coordinates.lat, addressData.coordinates.lng]}
                          userAddress={getEnderecoCompleto()}
                          trechoCoordinates={trechoCoordinates}
                          className="sticky top-4"
                          isFeira={false}
                          feiras={[]}
                          selectedFeiraId={undefined}
                          isSaude={false}
                          estabelecimentosSaude={[]}
                        />
                      </div>
                    </div>
                  )}

                  {/* Aba Feiras Livres */}
                  {activeTab === "feiras-livres" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div id="feiras-section">
                        {loadingService["feiras-livres"] && (
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-dark-primary mb-4">
                              Buscando feiras livres...
                            </h3>
                            <FeirasSkeletonLoading />
                          </div>
                        )}

                        {!loadingService["feiras-livres"] && feirasResults.length > 0 && (
                          <>
                            <h3 className="text-xl font-bold text-dark-primary mb-4">
                              Resultados ({feirasResults.length})
                            </h3>
                            <ServicesList
                              services={[]}
                              feiras={feirasResults}
                              coletaLixo={undefined}
                              estabelecimentosSaude={[]}
                              serviceType="feiras-livres"
                              onViewTrecho={handleVerTrecho}
                              selectedFeiraId={selectedFeiraId}
                            />
                          </>
                        )}

                        {!loadingService["feiras-livres"] && feirasResults.length === 0 && (
                          <div className="text-center py-8">
                            <div className="text-6xl mb-4">🍎</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              Nenhuma feira encontrada
                            </h3>
                            <p className="text-gray-600">
                              Não foram encontradas feiras livres próximas a este endereço.
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <MapView
                          center={[addressData.coordinates.lat, addressData.coordinates.lng]}
                          userLocation={[addressData.coordinates.lat, addressData.coordinates.lng]}
                          userAddress={getEnderecoCompleto()}
                          trechoCoordinates={null}
                          className="sticky top-4"
                          isFeira={true}
                          feiras={feirasResults}
                          selectedFeiraId={selectedFeiraId}
                          isSaude={false}
                          estabelecimentosSaude={[]}
                        />
                      </div>
                    </div>
                  )}

                  {/* Aba Coleta de Lixo */}
                  {activeTab === "coleta-lixo" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div id="coleta-section">
                        {loadingService["coleta-lixo"] && (
                          <div className="mb-4">
                            <ColetaLixoSkeletonLoading />
                          </div>
                        )}

                        {!loadingService["coleta-lixo"] && coletaLixoResults && (
                          <>
                            <h3 className="text-xl font-bold text-dark-primary mb-4">
                              Informações de Coleta
                            </h3>
                            <ServicesList
                              services={[]}
                              feiras={[]}
                              coletaLixo={coletaLixoResults}
                              estabelecimentosSaude={[]}
                              serviceType="coleta-lixo"
                              onViewTrecho={handleVerTrecho}
                              selectedFeiraId={undefined}
                            />
                          </>
                        )}

                        {!loadingService["coleta-lixo"] && !coletaLixoResults && (
                          <div className="text-center py-8">
                            <div className="text-6xl mb-4">🗑️</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              Nenhuma informação encontrada
                            </h3>
                            <p className="text-gray-600">
                              Não foram encontradas informações de coleta para este endereço.
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <MapView
                          center={[addressData.coordinates.lat, addressData.coordinates.lng]}
                          userLocation={[addressData.coordinates.lat, addressData.coordinates.lng]}
                          userAddress={getEnderecoCompleto()}
                          trechoCoordinates={null}
                          className="sticky top-4"
                          isFeira={false}
                          feiras={[]}
                          selectedFeiraId={undefined}
                          isSaude={false}
                          estabelecimentosSaude={[]}
                        />
                      </div>
                    </div>
                  )}

                  {/* Aba Saúde Pública */}
                  {activeTab === "saude" && (
                    <div className="space-y-6">
                      {/* Filtros de Saúde */}
                      <div id="saude-filtros-section" className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="text-lg font-semibold text-dark-primary mb-4">
                          Filtros de Estabelecimentos
                        </h3>
                        <HealthLayerSelector
                          filtros={filtrosSaude}
                          onFiltroChange={(novosFiltros) => {
                            setFiltrosSaude(novosFiltros);
                            buscarSaudeTempoReal(novosFiltros);
                          }}
                        />
                      </div>

                      {/* Mapa de Saúde */}
                      {loadingService["saude"] && (
                        <div className="mb-4">
                          <SaudeSkeletonLoading />
                        </div>
                      )}

                      <MapView
                        center={[addressData.coordinates.lat, addressData.coordinates.lng]}
                        userLocation={[addressData.coordinates.lat, addressData.coordinates.lng]}
                        userAddress={getEnderecoCompleto()}
                        trechoCoordinates={null}
                        className="w-full h-[600px]"
                        isFeira={false}
                        feiras={[]}
                        selectedFeiraId={undefined}
                        isSaude={true}
                        estabelecimentosSaude={saudeResults}
                      />

                      {!loadingService["saude"] && saudeResults.length === 0 && (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">🏥</div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Nenhum estabelecimento encontrado
                          </h3>
                          <p className="text-gray-600">
                            Tente ajustar os filtros para ver mais resultados.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabPanel>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 text-center">
                Buscar Serviços Públicos
              </h1>
              <p className="text-white/90 text-center text-lg">Carregando...</p>
            </div>
            <div className="flex items-center justify-center h-64">
              <div className="spinner w-8 h-8"></div>
            </div>
          </div>
        </Layout>
      }
    >
      <BuscarPageContent />
    </Suspense>
  );
}
