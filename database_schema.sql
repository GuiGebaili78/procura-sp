-- =====================================================
-- ESQUEMA COMPLETO DO BANCO DE DADOS - PROCURA SP
-- =====================================================
-- Arquivo: database_schema.sql
-- Descrição: Script completo para criar o banco de dados do Procura SP
-- Data: 2024-12-19
-- Versão: 1.0.0
-- 
-- Este arquivo contém o esquema completo do banco de dados
-- consolidado de todas as migrações anteriores.
-- 
-- INSTRUÇÕES DE USO:
-- 1. Conecte-se ao seu banco PostgreSQL
-- 2. Execute este script completo
-- 3. O banco será criado com todas as tabelas e estruturas necessárias
-- =====================================================

-- Log inicial
DO $$ 
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'CRIANDO BANCO DE DADOS PROCURA SP';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Sistema: Procura SP - Serviços de São Paulo';
    RAISE NOTICE 'Versão: 1.0.0';
    RAISE NOTICE 'Data: 2024-12-19';
    RAISE NOTICE '=====================================================';
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
  numero VARCHAR(20), -- Número do endereço quando fornecido
  latitude DECIMAL(10, 8), -- Latitude do endereço obtida via geocoding
  longitude DECIMAL(11, 8), -- Longitude do endereço obtida via geocoding
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_viacep_cache_cep ON viacep_cache(cep);
CREATE INDEX IF NOT EXISTS idx_viacep_cache_expires ON viacep_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_viacep_cache_coordinates ON viacep_cache(latitude, longitude);

-- Comentários para documentação
COMMENT ON TABLE viacep_cache IS 'Cache para dados do ViaCEP com TTL de 24 horas';
COMMENT ON COLUMN viacep_cache.cep IS 'CEP no formato 00000-000';
COMMENT ON COLUMN viacep_cache.expires_at IS 'Data/hora de expiração do cache';
COMMENT ON COLUMN viacep_cache.cached_at IS 'Quando foi armazenado no cache';
COMMENT ON COLUMN viacep_cache.latitude IS 'Latitude do endereço obtida via geocoding';
COMMENT ON COLUMN viacep_cache.longitude IS 'Longitude do endereço obtida via geocoding';
COMMENT ON COLUMN viacep_cache.numero IS 'Número do endereço quando fornecido';

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
COMMENT ON TABLE catabagulho_cache IS 'Cache para os resultados do web scraping do serviço Cata-Bagulho, com TTL de 24 horas';
COMMENT ON COLUMN catabagulho_cache.latitude IS 'Latitude da busca original';
COMMENT ON COLUMN catabagulho_cache.longitude IS 'Longitude da busca original';
COMMENT ON COLUMN catabagulho_cache.results IS 'Resultados da busca em formato JSON';
COMMENT ON COLUMN catabagulho_cache.expires_at IS 'Data e hora de expiração do registro de cache';

-- =====================================================
-- TABELA: coleta_lixo_cache
-- =====================================================
-- Cache de dados de coleta de lixo por coordenadas geográficas
CREATE TABLE IF NOT EXISTS coleta_lixo_cache (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    endereco TEXT,
    dados_json JSONB NOT NULL,
    data_consulta TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Limpar viacep_cache expirado
    DELETE FROM viacep_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Limpar catabagulho_cache expirado
    DELETE FROM catabagulho_cache WHERE expires_at < NOW();
    
    -- Limpar coleta_lixo_cache expirado
    DELETE FROM coleta_lixo_cache WHERE expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentário da função
COMMENT ON FUNCTION clean_expired_cache() IS 'Remove registros de cache expirados de todas as tabelas';

-- =====================================================
-- VIEWS PARA MONITORAMENTO
-- =====================================================

-- View para estatísticas do cache
CREATE OR REPLACE VIEW vw_cache_statistics AS
SELECT 
    'viacep_cache' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as registros_ativos,
    COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as registros_expirados
FROM viacep_cache
UNION ALL
SELECT 
    'catabagulho_cache' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as registros_ativos,
    COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as registros_expirados
FROM catabagulho_cache
UNION ALL
SELECT 
    'coleta_lixo_cache' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as registros_ativos,
    COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as registros_expirados
FROM coleta_lixo_cache;

-- Comentário da view
COMMENT ON VIEW vw_cache_statistics IS 'Estatísticas de todas as tabelas de cache';

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para viacep_cache
CREATE TRIGGER trigger_viacep_cache_updated_at
    BEFORE UPDATE ON viacep_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para coleta_lixo_cache
CREATE TRIGGER trigger_coleta_lixo_cache_updated_at
    BEFORE UPDATE ON coleta_lixo_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir registro de migração inicial
INSERT INTO migrations (filename) 
VALUES ('database_schema.sql') 
ON CONFLICT (filename) DO NOTHING;

-- =====================================================
-- LOG FINAL
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'BANCO DE DADOS PROCURA SP CRIADO COM SUCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tabelas criadas:';
    RAISE NOTICE '  ✅ viacep_cache - Cache de dados ViaCEP';
    RAISE NOTICE '  ✅ catabagulho_cache - Cache Cata-Bagulho';
    RAISE NOTICE '  ✅ coleta_lixo_cache - Cache Coleta de Lixo';
    RAISE NOTICE '  ✅ migrations - Controle de migrações';
    RAISE NOTICE '';
    RAISE NOTICE 'Views criadas:';
    RAISE NOTICE '  ✅ vw_cache_statistics - Estatísticas do cache';
    RAISE NOTICE '';
    RAISE NOTICE 'Funções criadas:';
    RAISE NOTICE '  ✅ clean_expired_cache() - Limpeza de cache';
    RAISE NOTICE '';
    RAISE NOTICE 'Triggers criados:';
    RAISE NOTICE '  ✅ Atualização automática de updated_at';
    RAISE NOTICE '';
    RAISE NOTICE 'Índices criados:';
    RAISE NOTICE '  ✅ Todos os índices de performance';
    RAISE NOTICE '';
    RAISE NOTICE 'Sistema pronto para uso!';
    RAISE NOTICE '=====================================================';
END $$;

-- =====================================================
-- INSTRUÇÕES PÓS-INSTALAÇÃO
-- =====================================================
/*
INSTRUÇÕES PARA USO:

1. DADOS JSON:
   - Os dados de feiras e estabelecimentos de saúde são fornecidos via arquivos JSON locais
   - Não são necessárias tabelas para esses dados no banco

2. CACHE:
   - Todas as tabelas de cache têm TTL de 24 horas
   - Use a função clean_expired_cache() para limpeza manual
   - Os caches são gerenciados automaticamente pela aplicação

3. MONITORAMENTO:
   - Use a view vw_cache_statistics para monitorar o status do cache
   - Verifique a tabela migrations para histórico de execuções

4. PERFORMANCE:
   - Todos os índices necessários foram criados
   - As consultas são otimizadas para coordenadas geográficas

5. MANUTENÇÃO:
   - Execute clean_expired_cache() periodicamente para limpeza
   - Monitore o tamanho das tabelas de cache
   - Faça backup regular dos dados importantes

SISTEMA PROCURA SP - VERSÃO 1.0.0
Data: 2024-12-19
*/

