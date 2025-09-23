-- =====================================================
-- MIGRAÇÃO: Adicionar coordenadas à tabela viacep_cache
-- =====================================================
-- Arquivo: src/lib/migrations/004_add_coordinates_to_viacep_cache.sql
-- Descrição: Adiciona campos latitude e longitude à tabela viacep_cache
-- Data: 2025-01-20
-- =====================================================

-- Log da migração
DO $$ 
BEGIN
    RAISE NOTICE 'Executando migração 004_add_coordinates_to_viacep_cache.sql';
    RAISE NOTICE 'Adicionando campos de coordenadas à tabela viacep_cache';
END $$;

-- Adicionar campos de coordenadas se não existirem
DO $$ 
BEGIN
    -- Verificar se a coluna latitude já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'viacep_cache' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE viacep_cache ADD COLUMN latitude DECIMAL(10, 8);
        RAISE NOTICE 'Coluna latitude adicionada à tabela viacep_cache';
    ELSE
        RAISE NOTICE 'Coluna latitude já existe na tabela viacep_cache';
    END IF;

    -- Verificar se a coluna longitude já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'viacep_cache' 
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE viacep_cache ADD COLUMN longitude DECIMAL(11, 8);
        RAISE NOTICE 'Coluna longitude adicionada à tabela viacep_cache';
    ELSE
        RAISE NOTICE 'Coluna longitude já existe na tabela viacep_cache';
    END IF;

    -- Verificar se a coluna numero já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'viacep_cache' 
        AND column_name = 'numero'
    ) THEN
        ALTER TABLE viacep_cache ADD COLUMN numero VARCHAR(20);
        RAISE NOTICE 'Coluna numero adicionada à tabela viacep_cache';
    ELSE
        RAISE NOTICE 'Coluna numero já existe na tabela viacep_cache';
    END IF;
END $$;

-- Criar índice para coordenadas se não existir
CREATE INDEX IF NOT EXISTS idx_viacep_cache_coordinates ON viacep_cache(latitude, longitude);

-- Adicionar comentários
COMMENT ON COLUMN viacep_cache.latitude IS 'Latitude do endereço obtida via geocoding';
COMMENT ON COLUMN viacep_cache.longitude IS 'Longitude do endereço obtida via geocoding';
COMMENT ON COLUMN viacep_cache.numero IS 'Número do endereço quando fornecido';

-- Log final
DO $$ 
BEGIN
    RAISE NOTICE 'Migração 004 concluída com sucesso!';
    RAISE NOTICE 'Campos de coordenadas adicionados à tabela viacep_cache';
END $$;


