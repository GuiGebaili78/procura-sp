-- Script para popular a tabela estabelecimentos_saude
-- Execute este script no pgAdmin

-- Primeiro, limpar a tabela se já tiver dados
DELETE FROM estabelecimentos_saude;

-- Inserir os dados dos estabelecimentos
-- Coordenadas são divididas por 1.000.000 para obter valores corretos
INSERT INTO estabelecimentos_saude (id, nome, tipo, endereco, bairro, regiao, cep, latitude, longitude, esfera_administrativa) VALUES
(463, 'STA CASA DE SANTO AMARO-HOSP', 'Hospital', 'Rua Dr. Antonio Bento, 379', 'STO  AMARO', 'Sul', '04743030', -23.649638, -46.704747, 'Privado'),
(464, 'HOSPITAL SANTA HELENA', 'Hospital', 'Rua Santa Helena, 123', 'SANTO AMARO', 'Sul', '04743030', -23.649638, -46.704747, 'Privado'),
(465, 'UBS VILA NOVA CACHOEIRINHA', 'UBS', 'Rua Cachoeirinha, 456', 'VILA NOVA CACHOEIRINHA', 'Norte', '02675000', -23.450000, -46.650000, 'Municipal'),
(466, 'POSTO DE SAUDE JARDIM PAULISTA', 'Posto de Saúde', 'Rua Paulista, 789', 'JARDIM PAULISTA', 'Centro', '01310000', -23.550000, -46.650000, 'Municipal'),
(467, 'FARMACIA POPULAR CENTRO', 'Farmácia', 'Rua da Consolação, 321', 'CENTRO', 'Centro', '01302000', -23.550000, -46.650000, 'Estadual');

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_estabelecimentos FROM estabelecimentos_saude;

-- Verificar distribuição por esfera administrativa
SELECT esfera_administrativa, COUNT(*) as quantidade 
FROM estabelecimentos_saude 
GROUP BY esfera_administrativa;

-- Verificar distribuição por região
SELECT regiao, COUNT(*) as quantidade 
FROM estabelecimentos_saude 
GROUP BY regiao;
