-- =====================================================
-- MIGRAÇÃO UNIFICADA - ESQUEMA COMPLETO DO BANCO
-- =====================================================
-- Arquivo: src/lib/migrations/000_init_schema.sql
-- Descrição: Esquema completo do banco de dados Procura SP
-- Data: 2024-12-19
-- 
-- Este arquivo contém o estado final do banco após todas
-- as migrações anteriores terem sido aplicadas.
-- =====================================================

-- Log da migração unificada
DO $$ 
BEGIN
    RAISE NOTICE 'Executando migração unificada 000_init_schema.sql';
    RAISE NOTICE 'Sistema Procura SP - Esquema completo do banco';
END $$;

-- =====================================================
-- TABELA: viacep_cache
-- =====================================================
-- Cache para dados do ViaCEP com TTL de 24 horas
CREATE TABLE IF NOT EXISTS viacep_cache (
  id SERIAL PRIMARY KEY,
  cep VARCHAR(9) NOT NULL UNIQUE, -- formato: 01001-000
  logradouro VARCHAR(255),
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

-- =====================================================
-- TABELA: catabagulho_cache
-- =====================================================
-- Cache para os resultados do web scraping do serviço Cata-Bagulho
CREATE TABLE IF NOT EXISTS catabagulho_cache (
  id SERIAL PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  results JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT unique_coords_catabagulho UNIQUE (latitude, longitude)
);

-- Índices para otimizar a busca por coordenadas e data de expiração
CREATE INDEX IF NOT EXISTS idx_catabagulho_cache_coords ON catabagulho_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_catabagulho_cache_expires ON catabagulho_cache(expires_at);

-- Comentários para documentação
COMMENT ON TABLE catabagulho_cache IS 'Cache para os resultados do web scraping do serviço Cata-Bagulho, com TTL de 24 horas.';
COMMENT ON COLUMN catabagulho_cache.latitude IS 'Latitude da busca original.';
COMMENT ON COLUMN catabagulho_cache.longitude IS 'Longitude da busca original.';
COMMENT ON COLUMN catabagulho_cache.results IS 'Resultados da busca em formato JSON.';
COMMENT ON COLUMN catabagulho_cache.expires_at IS 'Data e hora de expiração do registro de cache.';

-- =====================================================
-- TABELA: feiras_cache
-- =====================================================
-- Cache de dados de feiras livres por coordenadas geográficas
CREATE TABLE IF NOT EXISTS feiras_cache (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    endereco TEXT NOT NULL,
    data_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dados_json JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_coords_feiras UNIQUE (latitude, longitude)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_feiras_cache_coords ON feiras_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_feiras_cache_endereco ON feiras_cache(endereco);
CREATE INDEX IF NOT EXISTS idx_feiras_cache_data ON feiras_cache(data_consulta);
CREATE INDEX IF NOT EXISTS idx_feiras_cache_expires ON feiras_cache(expires_at);

-- Comentários para documentação
COMMENT ON TABLE feiras_cache IS 'Cache de dados de feiras livres por coordenadas geográficas';
COMMENT ON COLUMN feiras_cache.latitude IS 'Latitude da consulta';
COMMENT ON COLUMN feiras_cache.longitude IS 'Longitude da consulta';
COMMENT ON COLUMN feiras_cache.endereco IS 'Endereço consultado para referência';
COMMENT ON COLUMN feiras_cache.dados_json IS 'Dados das feiras em formato JSON';
COMMENT ON COLUMN feiras_cache.data_consulta IS 'Data/hora da consulta à API externa';
COMMENT ON COLUMN feiras_cache.expires_at IS 'Data e hora de expiração do registro de cache (24 horas)';

-- =====================================================
-- TABELA: coleta_lixo_cache
-- =====================================================
-- Cache de dados de coleta de lixo por coordenadas geográficas
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

-- =====================================================
-- TABELA: estabelecimentos_saude
-- =====================================================
-- Tabela principal com dados dos estabelecimentos de saúde
CREATE TABLE IF NOT EXISTS estabelecimentos_saude (
    id INTEGER PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    endereco TEXT,
    bairro VARCHAR(100),
    regiao VARCHAR(50),
    cep VARCHAR(10),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    esfera_administrativa VARCHAR(20) NOT NULL, -- Municipal, Estadual, Privado
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_saude_coordenadas 
ON estabelecimentos_saude(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_estabelecimentos_saude_esfera 
ON estabelecimentos_saude(esfera_administrativa);

CREATE INDEX IF NOT EXISTS idx_estabelecimentos_saude_tipo 
ON estabelecimentos_saude(tipo);

CREATE INDEX IF NOT EXISTS idx_estabelecimentos_saude_bairro 
ON estabelecimentos_saude(bairro);

-- Comentários para documentação
COMMENT ON TABLE estabelecimentos_saude IS 'Estabelecimentos de saúde de São Paulo com dados geográficos';
COMMENT ON COLUMN estabelecimentos_saude.id IS 'ID único do estabelecimento';
COMMENT ON COLUMN estabelecimentos_saude.nome IS 'Nome do estabelecimento';
COMMENT ON COLUMN estabelecimentos_saude.tipo IS 'Tipo do estabelecimento (UBS, Hospital, etc.)';
COMMENT ON COLUMN estabelecimentos_saude.endereco IS 'Endereço completo';
COMMENT ON COLUMN estabelecimentos_saude.bairro IS 'Bairro do estabelecimento';
COMMENT ON COLUMN estabelecimentos_saude.regiao IS 'Região administrativa de SP';
COMMENT ON COLUMN estabelecimentos_saude.cep IS 'CEP do estabelecimento';
COMMENT ON COLUMN estabelecimentos_saude.latitude IS 'Latitude para geolocalização';
COMMENT ON COLUMN estabelecimentos_saude.longitude IS 'Longitude para geolocalização';
COMMENT ON COLUMN estabelecimentos_saude.esfera_administrativa IS 'Esfera administrativa (Municipal, Estadual, Privado)';
COMMENT ON COLUMN estabelecimentos_saude.ativo IS 'Indica se o estabelecimento está ativo';

-- =====================================================
-- TABELA: migrations
-- =====================================================
-- Tabela para controle de migrações (criada automaticamente pelo sistema)
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentários para documentação
COMMENT ON TABLE migrations IS 'Controle de migrações executadas no banco de dados';
COMMENT ON COLUMN migrations.filename IS 'Nome do arquivo de migração executado';
COMMENT ON COLUMN migrations.executed_at IS 'Data/hora da execução da migração';

-- =====================================================
-- LOG FINAL
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE 'Migração unificada concluída com sucesso!';
    RAISE NOTICE 'Esquema completo do banco Procura SP criado.';
    RAISE NOTICE 'Tabelas criadas: viacep_cache, catabagulho_cache, feiras_cache, coleta_lixo_cache, estabelecimentos_saude, migrations';
END $$;

