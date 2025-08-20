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

interface SearchBarProps {
  onSearchResults: (results: CataBagulhoResult[], coordinates: { lat: number; lng: number }) => void;
  onError: (error: string) => void;
}

export function SearchBar({ onSearchResults, onError }: SearchBarProps) {
  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [endereco, setEndereco] = useState({
    logradouro: "",
    bairro: "",
    localidade: "",
    uf: "",
  });
  const [loading, setLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  
  const numeroInputRef = useRef<HTMLInputElement>(null);

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    setCepError(""); // Limpa erro anterior
    
    // Auto-busca quando CEP estiver completo
    if (formatted.replace(/\D/g, "").length === 8) {
      try {
        const cepData = await fetchCep(formatted);
        setEndereco({
          logradouro: cepData.logradouro,
          bairro: cepData.bairro,
          localidade: cepData.localidade,
          uf: cepData.uf,
        });
        
        // Move foco para o campo número
        setTimeout(() => {
          numeroInputRef.current?.focus();
        }, 100);
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        const errorMessage = error instanceof Error ? error.message : "CEP não encontrado";
        setCepError(errorMessage);
        
        // Limpa endereço quando CEP é inválido
        setEndereco({
          logradouro: "",
          bairro: "",
          localidade: "",
          uf: "",
        });
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
    
    try {
      // Tenta diferentes formatos de endereço para melhorar as chances de sucesso
      const enderecoFormats = [
        `${endereco.logradouro}, ${numero}, ${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil`,
        `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}, SP, Brasil`,
        `${endereco.logradouro}, ${endereco.localidade}, São Paulo, Brasil`,
        `${endereco.bairro}, ${endereco.localidade}, SP, Brasil`
      ];
      
      let geocodeResults = null;
      let enderecoUsado = "";
      
      // Tenta cada formato até encontrar um resultado
      for (const formato of enderecoFormats) {
        console.log("Tentando geocodificar:", formato);
        try {
          const resultado = await geocodeAddress(formato);
          if (resultado && resultado.length > 0) {
            geocodeResults = resultado;
            enderecoUsado = formato;
            break;
          }
        } catch (err) {
          console.warn("Formato falhou:", formato, err);
        }
      }
      
      if (!geocodeResults || geocodeResults.length === 0) {
        throw new Error("Não foi possível encontrar as coordenadas do endereço. Verifique se o CEP e número estão corretos.");
      }
      
      console.log("Sucesso com formato:", enderecoUsado);

      const { lat, lon } = geocodeResults[0];
      const coordinates = { lat: parseFloat(lat), lng: parseFloat(lon) };
      
      console.log("Coordenadas obtidas:", coordinates);

      // Busca serviços de Cata-Bagulho
      const results = await searchCataBagulho(coordinates.lat, coordinates.lng);
      
      if (!results || results.length === 0) {
        onError("Nenhum serviço de Cata-Bagulho encontrado para este endereço.");
        return;
      }

      onSearchResults(results, coordinates);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar serviços";
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

  return (
    <Card padding="md" className="mb-6">
      <h2 className="text-2xl font-bold text-dark-primary mb-6">
        Buscar Cata-Bagulho
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
          />
        </div>
        
        <div>
          <Input
            ref={numeroInputRef}
            label="Número"
            placeholder="123"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            onKeyPress={handleKeyPress}
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
        disabled={loading || !cep || !numero || !endereco.logradouro}
        variant="primary"
        size="lg"
        className="w-full"
      >
        {loading ? (
          <>
            <Loading size="sm" />
            Buscando...
          </>
        ) : (
          "Buscar Serviços"
        )}
      </Button>
    </Card>
  );
}