"use client";

import React, { useState, useRef } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Loading } from "../ui/Loading";
import { Card } from "../ui/Card";
import { fetchCep } from "../../services/viacep";
import { geocodeAddress } from "../../services/nominatim";
import { searchCataBagulho } from "../../services/api";
import { formatCep } from "../../utils/validators";
import { CataBagulhoResult } from "../../types/cataBagulho";
import { FeiraLivre } from "../../types/feiraLivre";
import { ColetaLixoResponse } from "../../types/coletaLixo";
import { EstabelecimentoSaude, FiltroSaude } from "../../types/saude";
import { HealthLayerSelector } from "../health/HealthLayerSelector";

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
  // Para filtros em tempo real
  currentCoordinates?: { lat: number; lng: number };
  currentAddress?: string;
}

export function SearchBar({ selectedService, onSearchResults, onError, onSearchStart, currentCoordinates, currentAddress }: SearchBarProps) {
  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [endereco, setEndereco] = useState({
    logradouro: "",
    bairro: "",
    localidade: "",
    uf: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState("");
  const [noResultsMessage, setNoResultsMessage] = useState("");
  const [filtrosSaude, setFiltrosSaude] = useState<FiltroSaude>({
    ubs: true,
    hospitais: true,
    postos: false,
    farmacias: false,
    maternidades: false,
    urgencia: false,
    academias: false,
    caps: false,
    saudeBucal: false,
    doencasRaras: false,
    ama: false, // Assistência Médica Ambulatorial
    programas: false,
    diagnostico: false,
    ambulatorio: false,
    supervisao: false,
    residencia: false,
    reabilitacao: false,
    apoio: false,
    clinica: false,
    dst: false,
    prontoSocorro: false,
    testagem: false,
    auditiva: false,
    horaCerta: false,
    idoso: false,
    laboratorio: false,
    trabalhador: false,
    apoioDiagnostico: false,
    apoioTerapeutico: false,
    instituto: false,
    apae: false,
    referencia: false,
    imagem: false,
    nutricao: false,
    reabilitacaoGeral: false,
    nefrologia: false,
    odontologica: false,
    saudeMental: false,
    referenciaGeral: false,
    medicinas: false,
    hemocentro: false,
    zoonoses: false,
    laboratorioZoo: false,
    casaParto: false,
    sexual: false,
    dstUad: false,
    capsInfantil: false,
    ambulatorios: false,
    programasGerais: false,
    tradicionais: false,
    dependente: false,
    // Filtros por esfera administrativa (Público = Municipal + Estadual)
    municipal: true, // Público (Municipal + Estadual)
    estadual: true,  // Estadual (incluído no Público)
    privado: true    // Privado
  });

  const numeroInputRef = useRef<HTMLInputElement>(null);

  // Função para buscar estabelecimentos em tempo real (após primeira busca)
  const buscarEstabelecimentosTempoReal = async (novosFiltros: FiltroSaude) => {
    if (selectedService !== "saude" || !cep || !numero || !endereco.logradouro) {
      console.log('⚠️ [SearchBar] Não é possível aplicar filtros em tempo real - dados incompletos');
      return;
    }

    try {
      console.log('🔄 [SearchBar] Buscando estabelecimentos em tempo real...');
      console.log('🔧 [SearchBar] Filtros:', novosFiltros);
      
      // Usar coordenadas atuais ou obter novas se necessário
      let coordinates = currentCoordinates;
      if (!coordinates) {
        // Obter coordenadas aproximadas por CEP
        coordinates = obterCoordenadasAproximadasPorCEP(cep);
        console.log('📍 [SearchBar] Usando coordenadas aproximadas:', coordinates);
      }
      
      if (!coordinates) {
        console.log('⚠️ [SearchBar] Não foi possível obter coordenadas');
        return;
      }
      
      const response = await fetch('/api/saude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep: cep.replace(/\D/g, ''),
          numero,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          filtros: novosFiltros
        })
      });

      const data = await response.json();

      console.log('🔄 [SearchBar] Resposta da API (tempo real):', data);

      if (data.success && data.estabelecimentos) {
        console.log('✅ [SearchBar] Filtros aplicados em tempo real:', data.estabelecimentos.length, 'estabelecimentos');
        const enderecoCompleto = `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
        onSearchResults(data.estabelecimentos, coordinates, "saude", enderecoCompleto);
      } else {
        console.log('⚠️ [SearchBar] Nenhum resultado encontrado com os filtros aplicados');
        onSearchResults([], coordinates, "saude", currentAddress);
      }
    } catch (error) {
      console.error('❌ [SearchBar] Erro ao aplicar filtros em tempo real:', error);
    }
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    setCepError(""); // Limpa erro anterior

    // Limpa o número quando CEP é alterado
    if (formatted.replace(/\D/g, "").length < 8) {
      setNumero("");
    }

    // Auto-busca quando CEP estiver completo
    if (formatted.replace(/\D/g, "").length === 8) {
      setLoadingCep(true);
      try {
        const cepData = await fetchCep(formatted);
        setEndereco({
          logradouro: cepData.logradouro,
          bairro: cepData.bairro,
          localidade: cepData.localidade,
          uf: cepData.uf,
        });

        // Limpa o número e move foco para o campo número
        setNumero("");
        setTimeout(() => {
          numeroInputRef.current?.focus();
        }, 100);
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        const errorMessage =
          error instanceof Error ? error.message : "CEP não encontrado";
        setCepError(errorMessage);

        // Limpa endereço e número quando CEP é inválido
        setEndereco({
          logradouro: "",
          bairro: "",
          localidade: "",
          uf: "",
        });
        setNumero("");
      } finally {
        setLoadingCep(false);
      }
    } else {
      // Limpa endereço se CEP incompleto
      setEndereco({
        logradouro: "",
        bairro: "",
        localidade: "",
        uf: "",
      });
    }
  };

  const handleSearch = async () => {
    if (!cep || !numero || !endereco.logradouro) {
      onError("Por favor, preencha o CEP e o número.");
      return;
    }

    setLoading(true);
    setNoResultsMessage(""); // Limpa mensagem anterior
    onSearchStart?.(); // Notifica que a busca começou

    try {
      // Tentar geocoding real primeiro, fallback para coordenadas aproximadas
      console.log("📍 Tentando geocoding real do endereço...");
      
      const enderecoCompleto = `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
      console.log("🔍 Endereço completo:", enderecoCompleto);
      
      let coordinates: { lat: number; lng: number } | null = null;
      
      try {
        console.log("🔍 Tentando geocoding para:", enderecoCompleto);
        const geocodeResults = await geocodeAddress(enderecoCompleto);
        if (geocodeResults && geocodeResults.length > 0) {
          coordinates = {
            lat: parseFloat(geocodeResults[0].lat),
            lng: parseFloat(geocodeResults[0].lon)
          };
          console.log("✅ Coordenadas reais obtidas via geocoding:", coordinates);
        } else {
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

      console.log("✅ Coordenadas finais:", coordinates);

      // Busca serviços baseado no tipo selecionado
      if (selectedService === "cata-bagulho") {
        console.log("🔍 [SearchBar] Iniciando busca de Cata-Bagulho...");
        console.log("📍 [SearchBar] Coordenadas:", coordinates);
        
        const results = await searchCataBagulho(coordinates.lat, coordinates.lng);
        
        console.log("📊 [SearchBar] Resultados recebidos:", results);
        console.log("📊 [SearchBar] Quantidade de resultados:", results?.length || 0);

        if (!results || results.length === 0) {
          console.log("❌ [SearchBar] Nenhum resultado encontrado");
          setNoResultsMessage(
            "Nenhum serviço de Cata-Bagulho encontrado para este endereço.",
          );
          return;
        }

        console.log("✅ [SearchBar] Enviando resultados para o componente pai");
        const enderecoCompleto = `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
        onSearchResults(results, coordinates, "cata-bagulho", enderecoCompleto);
      } else if (selectedService === "feiras-livres") {
        const response = await fetch('/api/feiras', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endereco: `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`,
            numero,
            latitude: coordinates.lat,
            longitude: coordinates.lng
          })
        });

        const data = await response.json();

        if (!data.success || !data.data?.feiras || data.data.feiras.length === 0) {
          setNoResultsMessage(
            "Nenhuma feira livre encontrada para este endereço.",
          );
          return;
        }

        const enderecoCompleto = `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
        onSearchResults(data.data.feiras, coordinates, "feiras-livres", enderecoCompleto);
      } else if (selectedService === "coleta-lixo") {
        const response = await fetch('/api/coleta-lixo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endereco: `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`,
            numero,
            latitude: coordinates.lat,
            longitude: coordinates.lng
          })
        });

        const data = await response.json();

        if (!data.success || !data.data) {
          setNoResultsMessage(
            "Nenhuma informação de coleta de lixo encontrada para este endereço.",
          );
          return;
        }

        const enderecoCompleto = `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
        onSearchResults(data.data, coordinates, "coleta-lixo", enderecoCompleto);
      } else if (selectedService === "saude") {
        const response = await fetch('/api/saude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cep: cep.replace(/\D/g, ''),
            numero,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            filtros: filtrosSaude,
            raio: 5000 // 5km
          })
        });

        const data = await response.json();

        console.log('🔍 [SearchBar] Resposta da API de saúde:', data);

        if (!data.success || !data.estabelecimentos || data.estabelecimentos.length === 0) {
          setNoResultsMessage(
            "Nenhum estabelecimento de saúde encontrado para este endereço.",
          );
          return;
        }

        const enderecoCompleto = `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
        onSearchResults(data.estabelecimentos, coordinates, "saude", enderecoCompleto);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar serviços";
      console.error("Erro na busca:", error);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Método para obter coordenadas aproximadas baseadas no CEP
  const obterCoordenadasAproximadasPorCEP = (cep: string): { lat: number; lng: number } | undefined => {
    const cepNumerico = cep.replace(/\D/g, '');
    
    // Coordenadas mais precisas por região de São Paulo baseadas no CEP
    const coordenadasPorRegiao: { [key: string]: { lat: number; lng: number } } = {
      // Centro (01000-01999) - Centro Histórico, República, Sé
      '01': { lat: -23.5505, lng: -46.6333 },
      // Zona Norte (02000-02999) - Santana, Tucuruvi, Casa Verde
      '02': { lat: -23.4800, lng: -46.6200 },
      // Zona Leste (03000-03999) - Tatuapé, Mooca, Penha
      '03': { lat: -23.5400, lng: -46.4800 },
      // Zona Sul (04000-04999) - Vila Olímpia, Moema, Campo Belo
      '04': { lat: -23.6000, lng: -46.6500 },
      // Zona Oeste (05000-05999) - Lapa, Pinheiros, Butantã
      '05': { lat: -23.5500, lng: -46.7200 },
      // Zona Norte (06000-06999) - Freguesia do Ó, Pirituba
      '06': { lat: -23.4500, lng: -46.7000 },
      // Zona Leste (07000-07999) - São Miguel, Itaquera
      '07': { lat: -23.5000, lng: -46.4000 },
      // Zona Sul (08000-08999) - Santo Amaro, Jabaquara
      '08': { lat: -23.6500, lng: -46.6200 },
      // Zona Sul (09000-09999) - Interlagos, Campo Limpo
      '09': { lat: -23.7000, lng: -46.7000 },
    };

    const prefixo = cepNumerico.substring(0, 2);
    const coordenadas = coordenadasPorRegiao[prefixo];
    
    if (coordenadas) {
      // Adicionar variação mais sutil baseada no CEP para evitar sobreposição
      const variacaoLat = (parseInt(cepNumerico.substring(2, 4)) / 100) * 0.005;
      const variacaoLng = (parseInt(cepNumerico.substring(4, 6)) / 100) * 0.005;
      
      return {
        lat: coordenadas.lat + variacaoLat,
        lng: coordenadas.lng + variacaoLng
      };
    }
    
    // Fallback para São Paulo centro
    return { lat: -23.5505, lng: -46.6333 };
  };

  return (
    <Card padding="md" className="mb-6">
      <h2 className="text-2xl font-bold text-dark-primary mb-6">
        Buscar {selectedService === "cata-bagulho" ? "Cata-Bagulho" : selectedService === "feiras-livres" ? "Feiras Livres" : selectedService === "coleta-lixo" ? "Coleta de Lixo" : "Saúde Pública"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Input
            label="CEP"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => handleCepChange(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={9}
            error={cepError}
            helperText="Digite o CEP para buscar o endereço automaticamente"
            disabled={loadingCep}
          />
          {loadingCep && (
            <div className="mt-2">
              <Loading size="sm" variant="dots" text="Buscando endereço..." />
            </div>
          )}
        </div>

        <div>
          <Input
            ref={numeroInputRef}
            label="Número"
            placeholder="123"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loadingCep}
          />
        </div>
      </div>

      {endereco.logradouro && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Input
              label="Logradouro"
              value={endereco.logradouro}
              readOnly
              variant="filled"
            />
          </div>
          <div>
            <Input
              label="Bairro"
              value={endereco.bairro}
              readOnly
              variant="filled"
            />
          </div>
          <div>
            <Input
              label="Cidade"
              value={endereco.localidade}
              readOnly
              variant="filled"
            />
          </div>
          <div>
            <Input
              label="Estado"
              value={endereco.uf}
              readOnly
              variant="filled"
            />
          </div>
        </div>
      )}

      {/* Filtros de Saúde */}
      {selectedService === "saude" && (
        <div className="mb-6">
          <HealthLayerSelector
            filtros={filtrosSaude}
            onFiltroChange={(novosFiltros) => {
              setFiltrosSaude(novosFiltros);
              // Aplicar filtros em tempo real se já tiver coordenadas
              buscarEstabelecimentosTempoReal(novosFiltros);
            }}
          />
        </div>
      )}

      <Button
        onClick={handleSearch}
        disabled={loading || loadingCep || !cep || !numero || !endereco.logradouro}
        variant="primary"
        size="lg"
        className="w-full"
      >
        {loading ? (
          <>
            <Loading size="sm" variant="dots" />
            Buscando serviços...
          </>
        ) : (
          "Buscar Serviços"
        )}
      </Button>

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
}
