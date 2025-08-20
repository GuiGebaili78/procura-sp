-- Migração inicial do sistema Procura SP
-- Arquivo: frontend/src/lib/migrations/001_initial_setup.sql

-- Criação de extensões úteis (se necessário)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurações iniciais do banco
-- COMMENT ON DATABASE procura_sp_db IS 'Banco de dados do sistema Procura SP - Serviços Públicos SP';

-- Log da migração inicial
DO $$ 
BEGIN
    RAISE NOTICE 'Executando migração inicial 001_initial_setup.sql';
    RAISE NOTICE 'Sistema Procura SP - Base de dados inicializada';
END $$;
