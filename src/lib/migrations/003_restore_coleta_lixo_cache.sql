-- =====================================================
-- MIGRAÇÃO: 003_restore_coleta_lixo_cache.sql
-- Descrição: Restaura a tabela de cache de coleta de lixo
-- Motivo: Serviço de coleta de lixo precisa de cache para performance
-- Data: 2025-09-20
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Executando migração: 003_restore_coleta_lixo_cache.sql';
END $$;

-- Criar tabela de cache para coleta de lixo
CREATE TABLE IF NOT EXISTS coleta_lixo_cache (
    id SERIAL PRIMARY KEY,
    latitude NUMERIC(10,8) NOT NULL,
    longitude NUMERIC(11,8) NOT NULL,
    endereco TEXT,
    dados_json JSONB NOT NULL,
    data_consulta TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Índices para otimização
    CONSTRAINT unique_coleta_lixo_coords UNIQUE (latitude, longitude)
);

-- Criar índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_coleta_lixo_cache_coords ON coleta_lixo_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_coleta_lixo_cache_expires ON coleta_lixo_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_coleta_lixo_cache_data_consulta ON coleta_lixo_cache(data_consulta);

-- Comentários para documentação
COMMENT ON TABLE coleta_lixo_cache IS 'Cache para dados de coleta de lixo por coordenadas';
COMMENT ON COLUMN coleta_lixo_cache.latitude IS 'Latitude da localização';
COMMENT ON COLUMN coleta_lixo_cache.longitude IS 'Longitude da localização';
COMMENT ON COLUMN coleta_lixo_cache.endereco IS 'Endereço pesquisado';
COMMENT ON COLUMN coleta_lixo_cache.dados_json IS 'Dados de coleta de lixo em formato JSON';
COMMENT ON COLUMN coleta_lixo_cache.data_consulta IS 'Data da consulta';
COMMENT ON COLUMN coleta_lixo_cache.expires_at IS 'Data de expiração do cache';

-- Verificar se a tabela foi criada
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'coleta_lixo_cache'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ Tabela coleta_lixo_cache criada com sucesso!';
    ELSE
        RAISE NOTICE '❌ Erro ao criar tabela coleta_lixo_cache';
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE 'Migração 003_restore_coleta_lixo_cache.sql concluída com sucesso!';
END $$;
