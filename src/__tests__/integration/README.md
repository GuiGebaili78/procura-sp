# Testes de Integração - Projeto Procura-SP

## 📋 Visão Geral

Este diretório contém testes de integração abrangentes que simulam um usuário real testando todos os serviços do sistema. Os testes verificam:

- ✅ **Request/Response** das APIs
- ✅ **Integração** entre componentes
- ✅ **Banco de dados** e conexões
- ✅ **Layout** da página
- ✅ **Performance** e UX
- ✅ **Acessibilidade**
- ✅ **Tratamento de erros**

## 🧪 Testes Disponíveis

### 1. **teste-completo-servicos.test.ts**
Teste principal que simula um usuário testando todos os serviços sequencialmente:

- **Cata-Bagulho** - Busca e exibição de serviços
- **Feiras Livres** - Busca e exibição de feiras
- **Coleta de Lixo** - Informações de coleta
- **Saúde Pública** - Estabelecimentos com filtros

**Cenários testados:**
- Preenchimento de CEP e número
- Busca automática de endereço
- Validações de campos obrigatórios
- Estados de loading
- Tratamento de erros
- Filtros em tempo real (saúde)
- Navegação por teclado
- Acessibilidade

### 2. **teste-banco-dados.test.ts**
Teste específico para integração com banco de dados:

- **Conexão** com PostgreSQL
- **Queries** de estabelecimentos de saúde
- **Filtros** por tipo e esfera administrativa
- **Estatísticas** do banco
- **Performance** das consultas
- **Tratamento de erros** de conexão

## 🚀 Como Executar

### **Teste Completo (Recomendado)**
```bash
npm run test:complete
```
Executa o teste completo que simula um usuário real testando todos os serviços.

### **Teste de Integração**
```bash
npm run test:integration
```
Executa todos os testes de integração.

### **Teste de Banco de Dados**
```bash
npm run test:database
```
Executa apenas os testes relacionados ao banco de dados.

### **Teste Específico**
```bash
npm test -- --testPathPattern=teste-completo-servicos.test.ts
```
Executa um teste específico.

## 📊 O que é Verificado

### **APIs e Integração**
- ✅ Resposta correta das APIs
- ✅ Formato dos dados retornados
- ✅ Tratamento de erros de rede
- ✅ Timeout e fallbacks
- ✅ Cache funcionando

### **Componentes e UI**
- ✅ Renderização correta dos componentes
- ✅ Estados de loading
- ✅ Mensagens de erro
- ✅ Validações de formulário
- ✅ Responsividade

### **Banco de Dados**
- ✅ Conexão estabelecida
- ✅ Queries executando corretamente
- ✅ Filtros aplicados
- ✅ Dados retornados no formato esperado
- ✅ Performance aceitável

### **Acessibilidade**
- ✅ Labels corretos para screen readers
- ✅ Navegação por teclado
- ✅ Contraste de cores
- ✅ Foco visível
- ✅ ARIA attributes

### **Performance**
- ✅ Tempo de resposta das APIs
- ✅ Renderização dos componentes
- ✅ Uso de memória
- ✅ Bundle size

## 🔧 Configuração

### **Mocks Configurados**
- `fetch` - APIs externas
- `next/navigation` - Router do Next.js
- `next/dynamic` - Componentes dinâmicos
- `localStorage` - Armazenamento local
- `database` - Conexão com banco

### **Dados de Teste**
- **CEP**: `01310-100` (Av Paulista)
- **Número**: `123`
- **Coordenadas**: `-23.5505, -46.6333`
- **Endereço**: Avenida Paulista, Bela Vista, São Paulo - SP

## 📈 Interpretando os Resultados

### **✅ Sucesso**
```
✅ Teste completo executado com sucesso!
🎉 Todos os serviços foram testados:
   • ✅ Cata-Bagulho
   • ✅ Feiras Livres
   • ✅ Coleta de Lixo
   • ✅ Saúde Pública
📊 Resultado: Nenhum problema detectado!
```

### **❌ Falha**
```
❌ Teste falhou!
🔍 Verifique os erros acima para identificar problemas.
💡 Possíveis causas:
   • APIs não estão respondendo
   • Banco de dados não está conectado
   • Componentes com problemas de renderização
   • Erros de integração entre serviços
```

## 🐛 Troubleshooting

### **Problemas Comuns**

1. **APIs não respondem**
   - Verificar se o servidor está rodando
   - Verificar URLs das APIs
   - Verificar CORS

2. **Banco de dados não conecta**
   - Verificar se o Docker está rodando
   - Verificar variáveis de ambiente
   - Verificar migrações

3. **Componentes não renderizam**
   - Verificar imports
   - Verificar dependências
   - Verificar mocks

4. **Testes lentos**
   - Verificar timeouts
   - Verificar mocks
   - Verificar performance

### **Logs Úteis**
- Console do navegador
- Logs do servidor
- Logs do banco de dados
- Logs do Jest

## 📝 Adicionando Novos Testes

Para adicionar novos testes de integração:

1. **Criar arquivo** em `src/__tests__/integration/`
2. **Seguir padrão** dos testes existentes
3. **Usar mocks** apropriados
4. **Documentar** o que está sendo testado
5. **Atualizar** este README

### **Estrutura Recomendada**
```typescript
describe('Nome do Teste', () => {
  beforeEach(() => {
    // Setup
  });

  it('deve fazer algo específico', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 🎯 Objetivos dos Testes

- **Detectar problemas** antes da produção
- **Validar integração** entre componentes
- **Garantir qualidade** do código
- **Facilitar manutenção** do sistema
- **Documentar comportamento** esperado
- **Automatizar validações** manuais

---

**Status**: ✅ Testes implementados e funcionando
**Última atualização**: Fase 8 - Refatoração e Testes
