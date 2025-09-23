import React from 'react';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';

interface SearchButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  serviceName: string;
}

export function SearchButton({ loading, disabled, onClick, serviceName }: SearchButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
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
        `Buscar ${serviceName}`
      )}
    </Button>
  );
}
