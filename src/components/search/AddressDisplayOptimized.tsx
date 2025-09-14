import React, { memo, useMemo } from 'react';
import { Input } from '../ui/Input';

interface EnderecoData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

interface AddressDisplayProps {
  endereco: EnderecoData;
}

export const AddressDisplayOptimized = memo(function AddressDisplayOptimized({ endereco }: AddressDisplayProps) {
  // Memoizar se deve renderizar o componente
  const shouldRender = useMemo(() => {
    return !!endereco.logradouro;
  }, [endereco.logradouro]);

  // Só renderiza se tiver logradouro preenchido
  if (!shouldRender) {
    return null;
  }

  return (
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
  );
});
