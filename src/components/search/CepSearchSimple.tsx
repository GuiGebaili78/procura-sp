"use client";

import React, { useState, useRef } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Loading } from "../ui/Loading";
import { Card } from "../ui/Card";
import { fetchCep } from "../../services/viacep";
import { geocodeAddress } from "../../services/nominatim";
import { formatCep } from "../../utils/validators";

interface CepSearchSimpleProps {
  onAddressFound: (
    cep: string,
    numero: string,
    endereco: {
      logradouro: string;
      bairro: string;
      localidade: string;
      uf: string;
    },
    coordinates: { lat: number; lng: number }
  ) => void;
  onError: (error: string) => void;
}

export function CepSearchSimple({ onAddressFound, onError }: CepSearchSimpleProps) {
  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [endereco, setEndereco] = useState({
    logradouro: "",
    bairro: "",
    localidade: "",
    uf: "",
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [cepError, setCepError] = useState("");
  const numeroInputRef = useRef<HTMLInputElement>(null);

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    setCepError("");

    if (formatted.replace(/\D/g, "").length < 8) {
      setNumero("");
      setEndereco({
        logradouro: "",
        bairro: "",
        localidade: "",
        uf: "",
      });
    }

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

        setNumero("");
        setTimeout(() => {
          numeroInputRef.current?.focus();
        }, 100);
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        const errorMessage =
          error instanceof Error ? error.message : "CEP não encontrado";
        setCepError(errorMessage);
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
    }
  };

  const handleSearch = async () => {
    if (!cep || !numero || !endereco.logradouro) {
      onError("Por favor, preencha o CEP e o número.");
      return;
    }

    setLoadingSearch(true);

    try {
      console.log(`🔍 [CepSearchSimple] Buscando coordenadas para CEP: ${cep}, Número: ${numero}`);
      
      // Buscar CEP novamente para obter coordenadas (a API /api/viacep já retorna coordenadas)
      const cepData = await fetchCep(cep, numero);
      
      console.log(`📊 [CepSearchSimple] Dados recebidos do CEP:`, cepData);
      
      // Verificar se as coordenadas vieram do ViaCEP
      if (cepData.latitude && cepData.longitude) {
        const coordinates = {
          lat: cepData.latitude,
          lng: cepData.longitude
        };
        
        console.log(`✅ [CepSearchSimple] Coordenadas encontradas via ViaCEP:`, coordinates);
        onAddressFound(cep, numero, endereco, coordinates);
        return;
      }
      
      // Se não vieram coordenadas do ViaCEP, tentar geocoding
      console.log(`⚠️ [CepSearchSimple] Coordenadas não vieram do ViaCEP, tentando geocoding...`);
      
      const enderecoCompleto = `${endereco.logradouro}, ${numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
      const geocodeResults = await geocodeAddress(enderecoCompleto);
      
      if (!geocodeResults || geocodeResults.length === 0) {
        throw new Error(
          "Não foi possível encontrar as coordenadas do endereço. Tente verificar se o endereço está correto ou tente novamente.",
        );
      }
      
      const coordinates = {
        lat: parseFloat(geocodeResults[0].lat),
        lng: parseFloat(geocodeResults[0].lon)
      };
      
      console.log(`✅ [CepSearchSimple] Coordenadas encontradas via Geocoding:`, coordinates);
      onAddressFound(cep, numero, endereco, coordinates);
      
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar endereço";
      console.error("❌ [CepSearchSimple] Erro na busca:", error);
      onError(message);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card padding="md">
      <h2 className="text-2xl font-bold text-dark-primary mb-6">
        📍 Informe seu Endereço
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
        disabled={loadingSearch || loadingCep || !cep || !numero || !endereco.logradouro}
        variant="primary"
        size="lg"
        className="w-full"
      >
        {loadingSearch ? (
          <>
            <Loading size="sm" variant="dots" />
            Buscando...
          </>
        ) : (
          "Buscar Serviços"
        )}
      </Button>
    </Card>
  );
}

