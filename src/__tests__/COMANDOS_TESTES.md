# 🧪 Comandos de Teste - Procura-SP

## 🚀 Comandos Principais

### **`npm run test:all`** ⭐ **RECOMENDADO**
Executa **TODOS** os testes (unitários + integração real) com verificação inteligente:
- ✅ Testes unitários (rápidos, com mocks)
- 🐳 Verifica se Docker está rodando
- 🔗 Testes de integração real (se Docker estiver online)
- 📊 Resumo completo dos resultados

```bash
npm run test:all
```

### **`npm run test:all:coverage`**
Executa todos os testes com relatório de cobertura:
```bash
npm run test:all:coverage
```

## ⚡ Comandos Rápidos (Desenvolvimento)

### **`npm test`** ou **`npm run test:unit`**
Testes unitários rápidos (com mocks):
```bash
npm test
npm run test:unit
```

### **`npm run test:watch`**
Testes unitários em modo watch (recomendado para desenvolvimento):
```bash
npm run test:watch
```

## 🔗 Comandos de Integração

### **`npm run test:integration:real`**
Testes de integração real (requer Docker):
```bash
npm run test:integration:real
```

### **`npm run test:database:real`**
Teste específico de conexão real com banco:
```bash
npm run test:database:real
```

## 📊 Comandos com Cobertura

### **`npm run test:unit:coverage`**
Testes unitários com relatório de cobertura:
```bash
npm run test:unit:coverage
```

## 🎯 Comandos Específicos

### **`npm run test:database`**
Teste de banco com mocks (rápido):
```bash
npm run test:database
```

### **`npm run test:services`**
Teste completo de serviços:
```bash
npm run test:services
```

### **`npm run test:integration`**
Testes de integração com mocks:
```bash
npm run test:integration
```

## 📋 Fluxo de Trabalho Recomendado

### **Durante Desenvolvimento:**
```bash
# Modo watch para feedback imediato
npm run test:watch
```

### **Antes do Commit:**
```bash
# Validação completa
npm run test:all
```

### **Para CI/CD:**
```bash
# Testes rápidos obrigatórios
npm test

# Testes completos (opcional, pode ser lento)
npm run test:all
```

## 🐳 Requisitos por Comando

| Comando | Docker | Velocidade | Cobertura |
|---------|--------|------------|-----------|
| `npm test` | ❌ | ⚡ Rápido | ❌ |
| `npm run test:unit` | ❌ | ⚡ Rápido | ❌ |
| `npm run test:unit:coverage` | ❌ | ⚡ Rápido | ✅ |
| `npm run test:integration:real` | ✅ | 🐌 Lento | ❌ |
| `npm run test:database:real` | ✅ | 🐌 Lento | ❌ |
| `npm run test:all` | ✅* | 🐌 Lento | ❌ |
| `npm run test:all:coverage` | ✅* | 🐌 Lento | ✅ |

*Verifica se Docker está rodando, mas não falha se estiver offline

## 🚨 Resolução de Problemas

### **Docker Offline:**
```bash
# Iniciar Docker
npm run docker:up

# Depois executar testes
npm run test:all
```

### **Banco Não Inicializado:**
```bash
# Reset completo do banco
npm run docker:reset

# Depois executar testes
npm run test:all
```

### **Testes Lentos:**
```bash
# Usar apenas testes unitários para desenvolvimento
npm run test:watch
```

## 📈 Interpretando Resultados

### **✅ Sucesso Completo:**
```
🎉 TODOS OS TESTES PASSARAM!
🚀 O projeto está pronto para deploy.
```

### **⚠️ Docker Offline:**
```
✅ Testes unitários: PASSOU
⏭️  Testes reais: PULADO (Docker offline)
```

### **❌ Falhas:**
```
❌ ALGUNS TESTES FALHARAM!
🔍 Verifique os erros acima e corrija antes de continuar.
```

## 🎯 Dicas de Uso

1. **Desenvolvimento Diário**: Use `npm run test:watch`
2. **Validação Completa**: Use `npm run test:all`
3. **CI/CD**: Use `npm test` (rápido) + `npm run test:all` (completo)
4. **Debug**: Use `--verbose` para mais detalhes
5. **Cobertura**: Use `:coverage` quando precisar de relatórios

---

**Comando Principal**: `npm run test:all` 🎯

