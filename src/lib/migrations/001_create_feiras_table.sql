-- =====================================================
-- MIGRAÇÃO: Criação da tabela feiras
-- =====================================================
-- Arquivo: src/lib/migrations/001_create_feiras_table.sql
-- Descrição: Criação da tabela principal de feiras livres
-- Data: 2025-09-17
-- 
-- Esta migração cria a tabela feiras para armazenar
-- os dados das feiras livres de São Paulo
-- =====================================================

-- Log da migração
DO $$ 
BEGIN
    RAISE NOTICE 'Executando migração 001_create_feiras_table.sql';
    RAISE NOTICE 'Criando tabela feiras para dados das feiras livres';
END $$;

-- =====================================================
-- TABELA: feiras
-- =====================================================
-- Tabela principal com dados das feiras livres de São Paulo
CREATE TABLE IF NOT EXISTS feiras (
    id VARCHAR(50) PRIMARY KEY, -- feira-1, feira-2, etc.
    numero_feira VARCHAR(20) NOT NULL, -- 1001-4, 1002-1, etc.
    dia_semana VARCHAR(20) NOT NULL, -- Domingo, Segunda-feira, etc.
    categoria VARCHAR(20) NOT NULL DEFAULT 'Tradicional', -- Tradicional, Orgânica, Especial, Indígena
    endereco TEXT NOT NULL, -- Endereço completo formatado
    endereco_original VARCHAR(255), -- Endereço original da planilha
    numero VARCHAR(50), -- Número do endereço (pode ser S/N)
    bairro VARCHAR(100), -- Nome do bairro
    referencia TEXT, -- Referência para localização
    cep VARCHAR(10), -- CEP no formato 00000-000
    sub_prefeitura VARCHAR(50), -- Código da sub-prefeitura
    ativo BOOLEAN DEFAULT true, -- Indica se a feira está ativa
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_feiras_numero_feira ON feiras(numero_feira);
CREATE INDEX IF NOT EXISTS idx_feiras_dia_semana ON feiras(dia_semana);
CREATE INDEX IF NOT EXISTS idx_feiras_categoria ON feiras(categoria);
CREATE INDEX IF NOT EXISTS idx_feiras_bairro ON feiras(bairro);
CREATE INDEX IF NOT EXISTS idx_feiras_sub_prefeitura ON feiras(sub_prefeitura);
CREATE INDEX IF NOT EXISTS idx_feiras_cep ON feiras(cep);
CREATE INDEX IF NOT EXISTS idx_feiras_ativo ON feiras(ativo);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_feiras_dia_categoria ON feiras(dia_semana, categoria);
CREATE INDEX IF NOT EXISTS idx_feiras_bairro_ativo ON feiras(bairro, ativo);

-- Comentários para documentação
COMMENT ON TABLE feiras IS 'Feiras livres de São Paulo com dados organizados e padronizados';
COMMENT ON COLUMN feiras.id IS 'ID único da feira (feira-1, feira-2, etc.)';
COMMENT ON COLUMN feiras.numero_feira IS 'Número oficial da feira (1001-4, 1002-1, etc.)';
COMMENT ON COLUMN feiras.dia_semana IS 'Dia da semana em que a feira acontece';
COMMENT ON COLUMN feiras.categoria IS 'Categoria da feira (Tradicional, Orgânica, Especial, Indígena)';
COMMENT ON COLUMN feiras.endereco IS 'Endereço completo formatado para exibição';
COMMENT ON COLUMN feiras.endereco_original IS 'Endereço original conforme planilha da prefeitura';
COMMENT ON COLUMN feiras.numero IS 'Número do endereço (pode ser S/N)';
COMMENT ON COLUMN feiras.bairro IS 'Nome do bairro onde a feira acontece';
COMMENT ON COLUMN feiras.referencia IS 'Referência para localização da feira';
COMMENT ON COLUMN feiras.cep IS 'CEP do local da feira no formato 00000-000';
COMMENT ON COLUMN feiras.sub_prefeitura IS 'Código da sub-prefeitura responsável';
COMMENT ON COLUMN feiras.ativo IS 'Indica se a feira está ativa e funcionando';
COMMENT ON COLUMN feiras.data_atualizacao IS 'Data da última atualização dos dados';

-- =====================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_feiras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feiras_updated_at
    BEFORE UPDATE ON feiras
    FOR EACH ROW
    EXECUTE FUNCTION update_feiras_updated_at();

-- =====================================================
-- VIEW: Estatísticas das feiras
-- =====================================================
CREATE OR REPLACE VIEW vw_feiras_estatisticas AS
SELECT 
    COUNT(*) as total_feiras,
    COUNT(CASE WHEN ativo = true THEN 1 END) as feiras_ativas,
    COUNT(CASE WHEN ativo = false THEN 1 END) as feiras_inativas,
    COUNT(DISTINCT dia_semana) as dias_diferentes,
    COUNT(DISTINCT categoria) as categorias_diferentes,
    COUNT(DISTINCT bairro) as bairros_diferentes,
    COUNT(DISTINCT sub_prefeitura) as sub_prefeituras_diferentes
FROM feiras;

-- Comentário da view
COMMENT ON VIEW vw_feiras_estatisticas IS 'Estatísticas gerais das feiras livres';

-- =====================================================
-- VIEW: Feiras por dia da semana
-- =====================================================
CREATE OR REPLACE VIEW vw_feiras_por_dia AS
SELECT 
    dia_semana,
    COUNT(*) as total,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativas,
    COUNT(CASE WHEN categoria = 'Tradicional' THEN 1 END) as tradicionais,
    COUNT(CASE WHEN categoria = 'Orgânica' THEN 1 END) as organicas,
    COUNT(CASE WHEN categoria = 'Especial' THEN 1 END) as especiais,
    COUNT(CASE WHEN categoria = 'Indígena' THEN 1 END) as indigenas
FROM feiras
GROUP BY dia_semana
ORDER BY 
    CASE dia_semana
        WHEN 'Domingo' THEN 1
        WHEN 'Segunda-feira' THEN 2
        WHEN 'Terça-feira' THEN 3
        WHEN 'Quarta-feira' THEN 4
        WHEN 'Quinta-feira' THEN 5
        WHEN 'Sexta-feira' THEN 6
        WHEN 'Sábado' THEN 7
        ELSE 8
    END;

-- Comentário da view
COMMENT ON VIEW vw_feiras_por_dia IS 'Distribuição das feiras por dia da semana';

-- =====================================================
-- VIEW: Feiras por categoria
-- =====================================================
CREATE OR REPLACE VIEW vw_feiras_por_categoria AS
SELECT 
    categoria,
    COUNT(*) as total,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativas,
    COUNT(DISTINCT dia_semana) as dias_diferentes,
    COUNT(DISTINCT bairro) as bairros_diferentes
FROM feiras
GROUP BY categoria
ORDER BY total DESC;

-- Comentário da view
COMMENT ON VIEW vw_feiras_por_categoria IS 'Distribuição das feiras por categoria';

-- =====================================================
-- LOG FINAL
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE 'Migração 001_create_feiras_table.sql concluída com sucesso!';
    RAISE NOTICE 'Tabela feiras criada com índices e views estatísticas.';
    RAISE NOTICE 'Triggers configurados para atualização automática.';
END $$;
