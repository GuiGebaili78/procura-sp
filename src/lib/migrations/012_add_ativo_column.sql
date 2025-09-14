-- Migração 012: Adicionar coluna 'ativo' na tabela estabelecimentos_saude
-- Para tabelas que já existem mas não têm a coluna 'ativo'

-- Verificar se a coluna 'ativo' não existe antes de adicionar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'estabelecimentos_saude' 
        AND column_name = 'ativo'
    ) THEN
        ALTER TABLE estabelecimentos_saude 
        ADD COLUMN ativo BOOLEAN DEFAULT true;
        
        -- Atualizar todos os registros existentes para ativo = true
        UPDATE estabelecimentos_saude 
        SET ativo = true 
        WHERE ativo IS NULL;
        
        RAISE NOTICE 'Coluna "ativo" adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna "ativo" já existe!';
    END IF;
END $$;
