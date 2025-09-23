import { useState, useCallback } from 'react';
import { fetchCep } from '../services/viacep';
import { formatCep } from '../utils/validators';

interface EnderecoData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

interface UseCepSearchReturn {
  cep: string;
  endereco: EnderecoData;
  loadingCep: boolean;
  cepError: string;
  handleCepChange: (value: string, onCepCleared?: () => void) => Promise<void>;
  handleCepChangeWithNumber: (value: string, numero: string, onCepCleared?: () => void) => Promise<void>;
  clearCep: () => void;
}

export function useCepSearch(): UseCepSearchReturn {
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState<EnderecoData>({
    logradouro: "",
    bairro: "",
    localidade: "",
    uf: "",
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState("");

  const handleCepChange = useCallback(async (value: string, onCepCleared?: () => void) => {
    const formatted = formatCep(value);
    setCep(formatted);
    setCepError(""); // Limpa erro anterior

    // Limpa o endereço se CEP incompleto
    if (formatted.replace(/\D/g, "").length < 8) {
      setEndereco({
        logradouro: "",
        bairro: "",
        localidade: "",
        uf: "",
      });
      // Chama callback para limpar campos relacionados (como número)
      if (onCepCleared) {
        onCepCleared();
      }
      return;
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
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        const errorMessage =
          error instanceof Error ? error.message : "CEP não encontrado";
        setCepError(errorMessage);

        // Limpa endereço quando CEP é inválido
        setEndereco({
          logradouro: "",
          bairro: "",
          localidade: "",
          uf: "",
        });
      } finally {
        setLoadingCep(false);
      }
    }
  }, []);

  const handleCepChangeWithNumber = useCallback(async (value: string, numero: string, onCepCleared?: () => void) => {
    const formatted = formatCep(value);
    setCep(formatted);
    setCepError(""); // Limpa erro anterior

    // Limpa o endereço se CEP incompleto
    if (formatted.replace(/\D/g, "").length < 8) {
      setEndereco({
        logradouro: "",
        bairro: "",
        localidade: "",
        uf: "",
      });
      // Chama callback para limpar campos relacionados (como número)
      if (onCepCleared) {
        onCepCleared();
      }
      return;
    }

    // Auto-busca quando CEP estiver completo
    if (formatted.replace(/\D/g, "").length === 8) {
      setLoadingCep(true);
      try {
        const cepData = await fetchCep(formatted, numero);
        setEndereco({
          logradouro: cepData.logradouro,
          bairro: cepData.bairro,
          localidade: cepData.localidade,
          uf: cepData.uf,
        });
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        const errorMessage =
          error instanceof Error ? error.message : "CEP não encontrado";
        setCepError(errorMessage);

        // Limpa endereço quando CEP é inválido
        setEndereco({
          logradouro: "",
          bairro: "",
          localidade: "",
          uf: "",
        });
      } finally {
        setLoadingCep(false);
      }
    }
  }, []);

  const clearCep = useCallback(() => {
    setCep("");
    setEndereco({
      logradouro: "",
      bairro: "",
      localidade: "",
      uf: "",
    });
    setCepError("");
  }, []);

  return {
    cep,
    endereco,
    loadingCep,
    cepError,
    handleCepChange,
    handleCepChangeWithNumber,
    clearCep,
  };
}
