# Comandos para Executar Testes - Projeto Procura-SP

## 🚀 Comandos Principais

### **1. Rodar TODOS os Testes (Recomendado)**
```bash
npm run test:all
```
- ✅ **56 testes passando** - 100% de sucesso
- ✅ **Cobertura de código** incluída
- ✅ **Tempo de execução**: ~4 segundos
- ✅ **Todos os tipos de teste**: unit, integration, database, services

### **2. Rodar Testes em Modo Watch (Desenvolvimento)**
```bash
npm run test:watch
```
- 🔄 **Execução contínua** - roda automaticamente quando arquivos mudam
- ⚡ **Ideal para desenvolvimento** - feedback imediato
- 🎯 **Foco em arquivos modificados**

## 🧪 Comandos Específicos

### **Testes de Integração**
```bash
npm run test:integration
```
- Testa integração entre componentes
- Verifica APIs e banco de dados
- Simula fluxos completos do usuário

### **Testes de Banco de Dados**
```bash
npm run test:database
```
- ✅ **8 testes passando**
- Verifica conexão com PostgreSQL
- Testa queries e filtros
- Valida performance do banco

### **Testes de Serviços**
```bash
npm run test:services
```
- ✅ **16 testes passando**
- Testa todos os serviços (Cata-Bagulho, Feiras, Coleta, Saúde)
- Valida APIs e estruturas de dados
- Simula fluxo completo do usuário

### **Testes Unitários**
```bash
npm run test:unit
```
- Testa funções e utilitários isoladamente
- Valida constantes e helpers
- Verifica lógica de negócio

### **Teste Completo (Script Customizado)**
```bash
npm run test:complete
```
- Executa script personalizado
- Relatório detalhado
- Validação completa do sistema

## 📊 Resumo dos Testes

### **Status Atual:**
- ✅ **9 suites de teste** executando
- ✅ **56 testes passando** - 0 falhas
- ✅ **Cobertura de código**: 22.63% statements
- ✅ **Tempo total**: ~4 segundos

### **Tipos de Teste:**
1. **API Routes** - 6 testes
2. **Page Rendering** - 6 testes  
3. **Database Connections** - 5 testes
4. **API Responses** - 3 testes
5. **Database Integration** - 6 testes
6. **Component Integration** - 3 testes
7. **Constants** - 4 testes
8. **Database Tests** - 8 testes
9. **Complete Services** - 16 testes

## 🎯 Quando Usar Cada Comando

### **Durante Desenvolvimento:**
```bash
npm run test:watch
```
- Para feedback contínuo
- Detecta problemas imediatamente
- Ideal para TDD (Test-Driven Development)

### **Antes de Commits:**
```bash
npm run test:all
```
- Validação completa
- Cobertura de código
- Garantia de qualidade

### **Para Debug Específico:**
```bash
npm run test:services    # Problemas com APIs
npm run test:database    # Problemas com banco
npm run test:integration # Problemas de integração
```

### **Para CI/CD:**
```bash
npm run test:all
```
- Execução única
- Relatório de cobertura
- Validação completa

## 🔧 Configuração

### **Jest Configuration:**
- **Timeout**: 30 segundos
- **Environment**: jsdom
- **Setup**: `src/__tests__/setup/jest.setup.ts`
- **Mocks**: Automáticos para APIs e banco

### **Coverage Threshold:**
- **Statements**: 20%
- **Branches**: 0%
- **Functions**: 0%
- **Lines**: 20%

## 📈 Interpretando Resultados

### **✅ Sucesso:**
```
Test Suites: 9 passed, 9 total
Tests:       56 passed, 56 total
Time:        3.995 s
```

### **❌ Falha:**
```
Test Suites: 1 failed, 9 total
Tests:       55 passed, 1 failed
```

### **Cobertura:**
```
File                      | % Stmts | % Branch | % Funcs | % Lines
All files                 |   22.63 |     4.42 |    6.16 |   23.37
```

## 🚀 Próximos Passos

### **Melhorias Sugeridas:**
1. **Aumentar cobertura** para 50%+
2. **Adicionar testes E2E** com Playwright
3. **Testes de performance** com Lighthouse
4. **Testes de acessibilidade** com axe-core

### **Integração CI/CD:**
```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npm run test:all
```

## 📝 Conclusão

O sistema de testes está **100% funcional** com:
- ✅ **56 testes passando**
- ✅ **Cobertura de código** ativa
- ✅ **Múltiplos tipos de teste**
- ✅ **Execução rápida** (~4 segundos)
- ✅ **Comandos organizados** por categoria

**Comando recomendado para uso diário: `npm run test:all`**
