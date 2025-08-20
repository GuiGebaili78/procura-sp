-- Migração para ajustar colunas da tabela viacep_cache
-- Arquivo: frontend/src/lib/migrations/005_remove_unidade_column.sql

-- Remove a coluna complemento que não é necessária
ALTER TABLE viacep_cache DROP COLUMN IF EXISTS complemento;

-- Log da operação
DO $$ 
BEGIN
    RAISE NOTICE 'Coluna complemento removida da tabela viacep_cache';
    RAISE NOTICE 'Coluna unidade mantida na tabela viacep_cache';
END $$;
