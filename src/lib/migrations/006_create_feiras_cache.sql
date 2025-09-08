-- Migração 006: Criar tabela de cache para Feiras Livres
-- Data: 2024-12-19
-- Descrição: Tabela para armazenar dados de feiras livres em cache

CREATE TABLE IF NOT EXISTS feiras_cache (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    endereco TEXT NOT NULL,
    data_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dados_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_feiras_cache_coords ON feiras_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_feiras_cache_endereco ON feiras_cache(endereco);
CREATE INDEX IF NOT EXISTS idx_feiras_cache_data ON feiras_cache(data_consulta);

-- Comentários para documentação
COMMENT ON TABLE feiras_cache IS 'Cache de dados de feiras livres por coordenadas geográficas';
COMMENT ON COLUMN feiras_cache.latitude IS 'Latitude da consulta';
COMMENT ON COLUMN feiras_cache.longitude IS 'Longitude da consulta';
COMMENT ON COLUMN feiras_cache.endereco IS 'Endereço consultado para referência';
COMMENT ON COLUMN feiras_cache.dados_json IS 'Dados das feiras em formato JSON';
COMMENT ON COLUMN feiras_cache.data_consulta IS 'Data/hora da consulta à API externa';
