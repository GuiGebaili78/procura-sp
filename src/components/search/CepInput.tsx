import React, { useRef } from 'react';
import { Input } from '../ui/Input';
import { Loading } from '../ui/Loading';

interface CepInputProps {
  cep: string;
  numero: string;
  loadingCep: boolean;
  cepError: string;
  onCepChange: (value: string) => Promise<void>;
  onNumeroChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
}

export function CepInput({
  cep,
  numero,
  loadingCep,
  cepError,
  onCepChange,
  onNumeroChange,
  onKeyPress,
  disabled = false,
}: CepInputProps) {
  const numeroInputRef = useRef<HTMLInputElement>(null);

  const handleCepChange = async (value: string) => {
    await onCepChange(value);
    
    // Move foco para o campo número quando CEP estiver completo
    if (value.replace(/\D/g, "").length === 8) {
      setTimeout(() => {
        numeroInputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <Input
          label="CEP"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => handleCepChange(e.target.value)}
          onKeyPress={onKeyPress}
          maxLength={9}
          error={cepError}
          helperText="Digite o CEP para buscar o endereço automaticamente"
          disabled={loadingCep || disabled}
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
          onChange={(e) => onNumeroChange(e.target.value)}
          onKeyPress={onKeyPress}
          disabled={loadingCep || disabled}
        />
      </div>
    </div>
  );
}
