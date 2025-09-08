-- Migração 007: Corrigir tabela feiras_cache para funcionar como catabagulho_cache
-- Data: 2024-12-19
-- Descrição: Adicionar coluna expires_at e constraint unique para funcionar como cache

-- Adicionar coluna expires_at
ALTER TABLE feiras_cache 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Atualizar registros existentes (se houver) para ter expires_at baseado em data_consulta + 24h
UPDATE feiras_cache 
SET expires_at = data_consulta + INTERVAL '24 hours' 
WHERE expires_at IS NULL;

-- Tornar a coluna NOT NULL
ALTER TABLE feiras_cache 
ALTER COLUMN expires_at SET NOT NULL;

-- Adicionar constraint unique para coordenadas (como no catabagulho)
-- Primeiro verificar se a constraint já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_coords_feiras'
    ) THEN
        ALTER TABLE feiras_cache
        ADD CONSTRAINT unique_coords_feiras UNIQUE (latitude, longitude);
    END IF;
END $$;

-- Adicionar índice para expires_at
CREATE INDEX IF NOT EXISTS idx_feiras_cache_expires ON feiras_cache(expires_at);

-- Comentários atualizados
COMMENT ON COLUMN feiras_cache.expires_at IS 'Data e hora de expiração do registro de cache (24 horas)';
