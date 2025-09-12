-- Migração 011: Criar tabela de estabelecimentos de saúde
-- Baseada na planilha Excel limpa com 1.466 registros

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
