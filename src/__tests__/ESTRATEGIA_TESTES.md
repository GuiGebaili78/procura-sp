# 🧪 Estratégia de Testes - Procura-SP

## 📋 Visão Geral

O projeto agora possui **duas estratégias de teste** para diferentes cenários:

### 1. **Testes Unitários** (Rápidos, com Mocks)
- **Quando usar**: Desenvolvimento diário, CI/CD
- **Características**: Rápidos, não dependem de serviços externos
- **Comando**: `npm test` ou `npm run test:unit`

### 2. **Testes de Integração Reais** (Lentos, sem Mocks)
- **Quando usar**: Validação completa, detecção de problemas reais
- **Características**: Testam conexões reais, detectam problemas de infraestrutura
- **Comando**: `npm run test:integration:real`

## 🎯 Por que Duas Estratégias?

### **Problema Anterior:**
- ❌ Todos os testes usavam mocks
- ❌ Testes passavam mesmo com Docker offline
- ❌ Não detectavam problemas reais de conexão
- ❌ Falsa sensação de segurança

### **Solução Atual:**
- ✅ Testes unitários rápidos para desenvolvimento
- ✅ Testes reais para validação completa
- ✅ Detectam quando Docker está offline
- ✅ Testam queries reais e performance

## 🚀 Comandos Disponíveis

### **Desenvolvimento Diário (Rápido)**
```bash
# Testes unitários com mocks (rápidos)
npm test
npm run test:watch
npm run test:unit
```

### **Validação Completa (Real)**
```bash
# Testes reais que detectam problemas de infraestrutura
npm run test:integration:real
npm run test:database:real
```

### **Todos os Testes**
```bash
# Executa todos os testes (unitários + integração)
npm run test:all
```

## 📊 Tipos de Teste

### **Testes Unitários** (`src/__tests__/unit/`)
- ✅ **Mocks**: Database, APIs externas, localStorage
- ✅ **Rápidos**: < 5 segundos
- ✅ **Isolados**: Não dependem de serviços externos
- ✅ **CI/CD**: Ideais para pipelines automatizados

**Exemplos:**
- Validação de CEP
- Formatação de dados
- Lógica de componentes
- Funções utilitárias

### **Testes de Integração Reais** (`src/__tests__/integration/`)
- ❌ **Sem Mocks**: Conexão real com banco
- ⏱️ **Lentos**: 10-30 segundos
- 🔗 **Dependentes**: Requerem Docker rodando
- 🎯 **Detectam**: Problemas reais de infraestrutura

**Exemplos:**
- Conexão real com PostgreSQL
- Queries espaciais reais
- Performance de banco
- Migrações de schema

## 🔧 Configuração

### **Jest Config Normal** (`jest.config.js`)
- Usa `jest.setup.ts` (com mocks)
- Timeout: 10 segundos
- Mocks habilitados

### **Jest Config Real** (`jest.config.real.js`)
- Usa `jest.setup.real.ts` (sem mocks de banco)
- Timeout: 30 segundos
- Conexão real com banco

## 🐳 Requisitos

### **Testes Unitários**
- ✅ Node.js
- ✅ NPM
- ❌ Docker (não necessário)

### **Testes de Integração Reais**
- ✅ Node.js
- ✅ NPM
- ✅ Docker rodando
- ✅ Banco PostgreSQL acessível

## 📈 Fluxo de Trabalho Recomendado

### **Durante Desenvolvimento:**
1. `npm run test:watch` - Testes unitários em tempo real
2. Desenvolver funcionalidades
3. Testes passam rapidamente

### **Antes do Commit:**
1. `npm run test:unit` - Verificar testes unitários
2. `npm run test:integration:real` - Validar com banco real
3. Commit apenas se ambos passarem

### **CI/CD Pipeline:**
1. `npm run test:unit` - Testes rápidos obrigatórios
2. `npm run test:integration:real` - Testes reais (opcional, pode ser lento)

## 🚨 Quando os Testes Reais Falham

### **Docker Offline:**
```
❌ Connection failed: connect ECONNREFUSED 127.0.0.1:5434
```
**Solução**: `npm run docker:up`

### **Banco Não Inicializado:**
```
❌ relation "estabelecimentos_saude" does not exist
```
**Solução**: `npm run migrate`

### **Migrações Pendentes:**
```
❌ column "ativo" does not exist
```
**Solução**: `npm run docker:reset`

## 🎯 Benefícios da Nova Estratégia

### **Para Desenvolvimento:**
- ⚡ Testes rápidos durante desenvolvimento
- 🔄 Feedback imediato
- 🚫 Não bloqueia por problemas de infraestrutura

### **Para Qualidade:**
- 🎯 Detecta problemas reais
- 📊 Valida performance real
- 🔍 Testa integração completa

### **Para Deploy:**
- ✅ Confiança na qualidade
- 🚀 Detecção precoce de problemas
- 📈 Melhor cobertura de testes

## 📝 Adicionando Novos Testes

### **Teste Unitário:**
```typescript
// src/__tests__/unit/services/meu-service.test.ts
describe('MeuService', () => {
  it('deve fazer algo', () => {
    // Teste com mocks
  })
})
```

### **Teste de Integração Real:**
```typescript
// src/__tests__/integration/meu-integration.test.ts
describe('Teste REAL de Integração', () => {
  it('deve conectar com banco real', async () => {
    // Teste sem mocks
  })
})
```

## 🔍 Debugging

### **Testes Unitários Falhando:**
```bash
npm test -- --verbose
```

### **Testes Reais Falhando:**
```bash
npm run test:integration:real -- --verbose
```

### **Verificar Status do Docker:**
```bash
docker ps
npm run docker:up
```

---

**Status**: ✅ Estratégia implementada e funcionando
**Última atualização**: Correção da estratégia de mocks

