-- =====================================================
-- MIGRAÇÃO: 002_remove_cache_tables.sql
-- Descrição: Remove tabelas de cache desnecessárias (saúde e feiras)
-- Motivo: Dados agora são fornecidos via arquivos JSON locais
-- Data: 2025-09-20
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Executando migração: 002_remove_cache_tables.sql';
END $$;

-- Remover tabelas de cache que não são mais necessárias
-- pois os dados agora vêm de arquivos JSON locais

-- 1. Remover tabela de cache de feiras (se existir)
DROP TABLE IF EXISTS feiras_cache CASCADE;

-- 2. Remover tabela de cache de saúde (se existir)
DROP TABLE IF EXISTS estabelecimentos_saude_cache CASCADE;

-- 3. Remover tabela de feiras (se existir - dados agora vêm do JSON)
DROP TABLE IF EXISTS feiras CASCADE;

-- 4. Remover tabela de estabelecimentos de saúde (se existir - dados agora vêm do JSON)
DROP TABLE IF EXISTS estabelecimentos_saude CASCADE;

-- 5. Remover tabela de cache de coleta de lixo (se existir)
DROP TABLE IF EXISTS coleta_lixo_cache CASCADE;

-- 6. Remover tabela de cache de feiras livres (se existir)
DROP TABLE IF EXISTS feira_livre_cache CASCADE;

-- 7. Remover tabela de cache de busca saúde (se existir)
DROP TABLE IF EXISTS busca_saude_cache CASCADE;

-- 8. Remover tabela de cache de cata-bagulho (se existir - manter apenas se necessário para performance)
-- DROP TABLE IF EXISTS catabagulho_cache CASCADE;

-- 9. Remover tabela de cache de viacep (se existir - manter apenas se necessário para performance)
-- DROP TABLE IF EXISTS viacep_cache CASCADE;

-- Verificar se as tabelas foram removidas
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'feiras_cache', 
        'estabelecimentos_saude_cache', 
        'feiras', 
        'estabelecimentos_saude',
        'coleta_lixo_cache',
        'feira_livre_cache',
        'busca_saude_cache'
    );
    
    IF table_count = 0 THEN
        RAISE NOTICE '✅ Todas as tabelas de cache desnecessárias foram removidas com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Ainda existem % tabelas de cache que não foram removidas', table_count;
    END IF;
END $$;

-- Listar tabelas restantes para verificação
DO $$
DECLARE
    table_record RECORD;
BEGIN
    RAISE NOTICE '📋 Tabelas restantes no banco:';
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    LOOP
        RAISE NOTICE '  - %', table_record.table_name;
    END LOOP;
END $$;

DO $$
BEGIN
    RAISE NOTICE 'Migração 002_remove_cache_tables.sql concluída com sucesso!';
END $$;
