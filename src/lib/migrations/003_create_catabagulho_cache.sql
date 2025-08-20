-- Migração para criar a tabela de cache do serviço Cata-Bagulho
-- Arquivo: frontend/src/lib/migrations/003_create_catabagulho_cache.sql

CREATE TABLE IF NOT EXISTS catabagulho_cache (
  id SERIAL PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  results JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Índice para otimizar a busca por coordenadas e data de expiração
CREATE INDEX IF NOT EXISTS idx_catabagulho_cache_coords ON catabagulho_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_catabagulho_cache_expires ON catabagulho_cache(expires_at);

-- Adiciona um índice único para evitar duplicatas exatas de coordenadas
-- Isso garante que para um par (lat, lng) só haverá um registro de cache por vez
ALTER TABLE catabagulho_cache
ADD CONSTRAINT unique_coords_catabagulho UNIQUE (latitude, longitude);


COMMENT ON TABLE catabagulho_cache IS 'Cache para os resultados do web scraping do serviço Cata-Bagulho, com TTL de 24 horas.';
COMMENT ON COLUMN catabagulho_cache.latitude IS 'Latitude da busca original.';
COMMENT ON COLUMN catabagulho_cache.longitude IS 'Longitude da busca original.';
COMMENT ON COLUMN catabagulho_cache.results IS 'Resultados da busca em formato JSON.';
COMMENT ON COLUMN catabagulho_cache.expires_at IS 'Data e hora de expiração do registro de cache.';
