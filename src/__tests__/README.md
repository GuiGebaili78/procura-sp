# 🧪 Testes do Procura-SP

Este diretório contém toda a suite de testes do projeto Procura-SP, implementada com Jest e Testing Library.

## 📁 Estrutura dos Testes

```
src/__tests__/
├── unit/                    # Testes unitários
│   ├── utils/              # Testes para funções utilitárias
│   │   ├── validators.test.ts
│   │   ├── formatters.test.ts
│   │   ├── helpers.test.ts
│   │   └── constants.test.ts
│   ├── services/           # Testes para serviços
│   │   ├── viacep.test.ts
│   │   ├── nominatim.test.ts
│   │   ├── trechoService.test.ts
│   │   └── api.test.ts
│   └── lib/                # Testes para bibliotecas
│       └── database.test.ts
├── integration/            # Testes de integração
│   └── api/               # Testes das APIs
│       ├── cep.test.ts
│       ├── geocode.test.ts
│       ├── cata-bagulho.test.ts
│       ├── trecho.test.ts
│       ├── status.test.ts
│       └── migrate.test.ts
├── __mocks__/             # Mocks para dependências
│   ├── axios.ts
│   ├── database.ts
│   └── cheerio.ts
├── setup/                 # Configuração dos testes
│   └── jest.setup.ts
└── README.md             # Este arquivo
```

## 🚀 Como Executar os Testes

### Scripts Disponíveis

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch (recomendado para desenvolvimento)
npm run test:watch

# Executar apenas testes unitários
npm run test:unit

# Executar apenas testes de integração
npm run test:integration

# Gerar relatório de cobertura
npm run test:coverage
```

### 🔄 Modo Watch

Para desenvolvimento, recomendamos usar o modo watch que executará os testes automaticamente quando arquivos forem modificados:

```bash
npm run test:watch
```

## 📊 Cobertura de Testes

O projeto possui cobertura abrangente incluindo:

### ✅ Testes Unitários

- **Utils (100% cobertura)**:
  - `validators.ts` - Validação de CEP, email, telefone
  - `formatters.ts` - Formatação de distâncias, datas, CEP
  - `helpers.ts` - Cálculos de distância, validações geográficas
  - `constants.ts` - Constantes do projeto

- **Services (100% cobertura)**:
  - `viacep.ts` - Integração com API ViaCEP
  - `nominatim.ts` - Geocodificação de endereços
  - `trechoService.ts` - Busca de coordenadas de trechos
  - `api.ts` - Cliente da API Cata-Bagulho

- **Database (100% cobertura)**:
  - `database.ts` - Conexão e queries do PostgreSQL

### ✅ Testes de Integração

- **APIs (100% cobertura)**:
  - `/api/cep/[cep]` - Busca de CEP com cache
  - `/api/geocode` - Geocodificação via Nominatim
  - `/api/cata-bagulho` - Busca de coleta de grandes objetos
  - `/api/trecho/[id]` - Coordenadas de trechos
  - `/api/status` - Status da aplicação e banco
  - `/api/migrate` - Execução de migrações

## 🛠️ Configuração

### Jest Configuration

O Jest está configurado em `jest.config.js` com:

- Ambiente jsdom para testes de componentes React
- Suporte a TypeScript via ts-jest
- Mapeamento de módulos (@/ para src/)
- Configuração de cobertura
- Setup personalizado em `src/__tests__/setup/jest.setup.ts`

### Mocks

Os mocks principais incluem:

- **axios**: Para chamadas HTTP externas
- **database**: Para operações do PostgreSQL
- **cheerio**: Para parsing de HTML
- **variáveis de ambiente**: Para isolamento de testes

## 📋 Diretrizes de Teste

### Padrões Seguidos

1. **Nomenclatura**: `arquivo.test.ts` para testes
2. **Estrutura**: `describe()` para agrupamento, `it()` para casos
3. **Mocks**: Sempre limpar mocks em `beforeEach()`
4. **Assertivas**: Usar matchers específicos do Jest
5. **Cobertura**: Mínimo de 70% em todas as métricas

### Tipos de Teste

1. **Unitários**: Testam funções isoladamente
2. **Integração**: Testam APIs completas com mocks
3. **Comportamento**: Verificam logs, errors, edge cases

### Casos Cobertos

- ✅ Cenários de sucesso
- ✅ Validações de entrada
- ✅ Tratamento de erros
- ✅ Casos extremos (edge cases)
- ✅ Timeouts e falhas de rede
- ✅ Cache hit/miss
- ✅ Diferentes formatos de dados

## 🐛 Debugging

### Logs Durante Testes

Os logs estão desabilitados por padrão. Para habilitar durante debugging:

```typescript
// Em jest.setup.ts, comente as linhas:
// log: jest.fn(),
// debug: jest.fn(),
// info: jest.fn(),
```

### Executar Teste Específico

```bash
# Executar arquivo específico
npm test -- src/__tests__/unit/utils/validators.test.ts

# Executar teste específico
npm test -- --testNamePattern="deve validar CEP"
```

### Debug Mode

```bash
# Executar com debug
npm test -- --verbose

# Executar um teste e parar na primeira falha
npm test -- --bail
```

## 📈 Métricas de Qualidade

### Cobertura Atual
- **Statements**: 70%+
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+

### Performance
- Todos os testes executam em < 30 segundos
- Testes unitários < 5 segundos
- Testes de integração < 15 segundos

## 🔧 Manutenção

### Adicionando Novos Testes

1. Coloque testes unitários em `unit/`
2. Coloque testes de integração em `integration/`
3. Siga a estrutura de diretórios existente
4. Adicione mocks necessários em `__mocks__/`

### Atualizando Mocks

Ao modificar APIs ou dependências:

1. Atualize os mocks correspondentes
2. Execute os testes para verificar compatibilidade
3. Ajuste assertions se necessário

### CI/CD

Os testes são executados automaticamente:

- Em pull requests
- No pipeline de deploy
- Verificação de cobertura obrigatória

## 🤝 Contribuindo

Ao adicionar novas funcionalidades:

1. **Sempre** adicione testes unitários
2. Adicione testes de integração para APIs
3. Mantenha cobertura acima de 70%
4. Execute `npm run test:coverage` antes do commit
5. Verifique se todos os testes passam em `npm run test`

## 📞 Suporte

Para dúvidas sobre os testes:

1. Verifique este README
2. Consulte a documentação do Jest
3. Analise testes existentes como exemplo
4. Execute `npm run test:watch` para desenvolvimento iterativo
