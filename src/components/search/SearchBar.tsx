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

interface SearchBarProps {
  selectedService: string;
  onSearchResults: (
    results: CataBagulhoResult[] | FeiraLivre[],
    coordinates: { lat: number; lng: number },
    serviceType: string
  ) => void;
  onError: (error: string) => void;
  onSearchStart?: () => void;
}

export function SearchBar({ selectedService, onSearchResults, onError, onSearchStart }: SearchBarProps) {
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

  const numeroInputRef = useRef<HTMLInputElement>(null);

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
        const geocodeResults = await geocodeAddress(enderecoCompleto);
        if (geocodeResults && geocodeResults.length > 0) {
          coordinates = {
            lat: parseFloat(geocodeResults[0].lat),
            lng: parseFloat(geocodeResults[0].lon)
          };
          console.log("✅ Coordenadas reais obtidas via geocoding:", coordinates);
        }
      } catch {
        console.log("⚠️ Geocoding falhou, usando coordenadas aproximadas por CEP");
        coordinates = obterCoordenadasAproximadasPorCEP(cep);
      }
      
      if (!coordinates) {
        throw new Error(
          "Não foi possível encontrar as coordenadas do endereço. Verifique se o CEP e número estão corretos.",
        );
      }

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
        onSearchResults(results, coordinates, "cata-bagulho");
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

        onSearchResults(data.data.feiras, coordinates, "feiras-livres");
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
  const obterCoordenadasAproximadasPorCEP = (cep: string): { lat: number; lng: number } | null => {
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
        Buscar {selectedService === "cata-bagulho" ? "Cata-Bagulho" : "Feiras Livres"}
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
