# Dados JSON Locais

Esta pasta contém os dados JSON locais que servem como fallback quando as APIs externas não estão disponíveis.

## Arquivos

### `estabelecimentos-saude.json`
- **Fonte**: Dados oficiais da Prefeitura de São Paulo
- **Conteúdo**: Estabelecimentos de saúde (UBS, hospitais, clínicas, etc.)
- **Total**: ~18.000 registros
- **Uso**: Serviço de saúde pública local

### `feira-livre.json`
- **Fonte**: Planilha Excel da Prefeitura de São Paulo (Setembro 2024)
- **Conteúdo**: Feiras livres da cidade de São Paulo
- **Total**: 967 registros
- **Categorias**: Tradicional (956), Orgânica (11)
- **Dias**: Domingo (202), Terça-feira (133), Quarta-feira (161), Quinta-feira (140), Sexta-feira (139), Sábado (192)
- **Uso**: Serviço de feiras livres local

## Estrutura dos Dados

### Estabelecimentos de Saúde
```json
{
  "ID": "12345",
  "ESTABELECIMENTO": "Nome do estabelecimento",
  "TIPO": "UBS",
  "ENDERECO": "Endereço completo",
  "BAIRRO": "Nome do bairro",
  "REGIAO": "Região da cidade",
  "CEP": "00000-000",
  "LAT": "12345678",
  "LONG": "87654321",
  "DEPADM": "Municipal"
}
```

### Feiras Livres
```json
{
  "id": "feira-1",
  "numeroFeira": "1001-4",
  "diaSemana": "Domingo",
  "categoria": "Tradicional",
  "endereco": "TEIXEIRA LEITE C/ SAO PAULO - LIBERDADE",
  "enderecoOriginal": "TEIXEIRA LEITE C/ SAO PAULO",
  "numero": "S/N",
  "bairro": "LIBERDADE",
  "referencia": "BAIXOS VIADUTO GLICERIO",
  "cep": "01514-010",
  "subPrefeitura": "SE",
  "ativo": true,
  "dataAtualizacao": "2025-09-17T10:42:41.660Z"
}
```

## APIs Locais

### Estabelecimentos de Saúde
- **Endpoint**: `/api/import-estabelecimentos` (POST)
- **Serviço**: `src/lib/services/banco-saude.service.ts`

### Feiras Livres
- **Endpoint**: `/api/feiras-local` (GET)
- **Serviço**: `src/lib/services/feiraLivreLocal.service.ts`
- **Parâmetros**: `lat`, `lng`, `endereco`, `dia`, `categoria`

## Vantagens

1. **Disponibilidade**: Dados sempre disponíveis mesmo quando APIs externas estão offline
2. **Performance**: Acesso rápido aos dados sem dependência de rede
3. **Confiabilidade**: Dados estáticos e validados
4. **Backup**: Servem como backup dos dados do banco de dados

## Atualização

Para atualizar os dados:

1. **Estabelecimentos**: Baixar nova planilha da prefeitura e executar script de conversão
2. **Feiras**: Baixar nova planilha Excel e executar `scripts/convert-excel-to-json.js`

## Scripts de Conversão

- `scripts/convert-excel-to-json.js`: Converte Excel para JSON
- `scripts/clean-feira-livre-data.js`: Limpa e padroniza dados das feiras


