-- Migração para criar tabela de cache do ViaCEP
-- Arquivo: frontend/src/lib/migrations/002_create_viacep_cache.sql

CREATE TABLE IF NOT EXISTS viacep_cache (
  id SERIAL PRIMARY KEY,
  cep VARCHAR(9) NOT NULL UNIQUE, -- formato: 01001-000
  logradouro VARCHAR(255),
  complemento VARCHAR(255),
  unidade VARCHAR(50),
  bairro VARCHAR(100),
  localidade VARCHAR(100),
  uf VARCHAR(2),
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_viacep_cache_cep ON viacep_cache(cep);
CREATE INDEX IF NOT EXISTS idx_viacep_cache_expires ON viacep_cache(expires_at);

-- Comentários para documentação
COMMENT ON TABLE viacep_cache IS 'Cache para dados do ViaCEP com TTL de 24 horas';
COMMENT ON COLUMN viacep_cache.cep IS 'CEP no formato 00000-000';
COMMENT ON COLUMN viacep_cache.expires_at IS 'Data/hora de expiração do cache';
COMMENT ON COLUMN viacep_cache.cached_at IS 'Quando foi armazenado no cache';
