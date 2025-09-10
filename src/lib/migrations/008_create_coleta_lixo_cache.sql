-- Migração 008: Criar tabela de cache para Coleta de Lixo
-- Data: 2024-12-19
-- Descrição: Tabela para armazenar dados de coleta de lixo em cache

CREATE TABLE IF NOT EXISTS coleta_lixo_cache (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    endereco TEXT NOT NULL,
    data_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dados_json JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_coords_coleta_lixo UNIQUE (latitude, longitude)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_coleta_lixo_cache_coords ON coleta_lixo_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_coleta_lixo_cache_endereco ON coleta_lixo_cache(endereco);
CREATE INDEX IF NOT EXISTS idx_coleta_lixo_cache_data ON coleta_lixo_cache(data_consulta);
CREATE INDEX IF NOT EXISTS idx_coleta_lixo_cache_expires ON coleta_lixo_cache(expires_at);

-- Comentários para documentação
COMMENT ON TABLE coleta_lixo_cache IS 'Cache de dados de coleta de lixo por coordenadas geográficas';
COMMENT ON COLUMN coleta_lixo_cache.latitude IS 'Latitude da consulta';
COMMENT ON COLUMN coleta_lixo_cache.longitude IS 'Longitude da consulta';
COMMENT ON COLUMN coleta_lixo_cache.endereco IS 'Endereço consultado para referência';
COMMENT ON COLUMN coleta_lixo_cache.dados_json IS 'Dados da coleta de lixo em formato JSON';
COMMENT ON COLUMN coleta_lixo_cache.data_consulta IS 'Data/hora da consulta à API externa';
COMMENT ON COLUMN coleta_lixo_cache.expires_at IS 'Data e hora de expiração do registro de cache (24 horas)';
