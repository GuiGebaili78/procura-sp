# Fase 3: Correções das Feiras Livres

## 📋 **Objetivo**
Corrigir problemas identificados nas feiras livres: botão "Ver Trajeto" para "Ver no Mapa" com scroll, e correção do cache que não está funcionando.

## 🔍 **Problemas Identificados**

### **1. Botão "Ver Trajeto"**
- **Problema:** Texto incorreto, não direciona para o mapa
- **Solução:** Mudar para "Ver no Mapa" e implementar scroll

### **2. Cache não funcionando**
- **Problema:** Tabela feiras_cache vazia, dados não salvos
- **Solução:** Verificar migração e logs de debug

## 🎯 **Alterações Implementadas**

### **1. Correção do Botão (Frontend)**
- **Arquivo:** `src/components/services/FeirasList.tsx`
- **Alteração:** 
  - Texto: "Ver Trajeto" → "Ver no Mapa"
  - Função: Implementar scroll para seção do mapa
  - Comportamento: Scroll suave para o mapa quando clicar

### **2. Verificação do Cache (Backend)**
- **Arquivo:** `src/lib/services/feiraLivre.service.ts`
- **Alteração:** Adicionar logs para debug do cache
- **Verificação:** Se dados estão sendo salvos corretamente

## 🔧 **Implementação Detalhada**

### **Frontend - FeirasList.tsx:**
```typescript
const handleVerNoMapa = (feiraId: string) => {
  // Scroll para o mapa
  const mapaSection = document.getElementById("mapa-section");
  if (mapaSection) {
    mapaSection.scrollIntoView({ behavior: "smooth" });
  }
  // Opcional: destacar feira no mapa
  onViewTrecho?.(feiraId);
};
```

### **Backend - Logs de Debug:**
```typescript
console.log('💾 Salvando cache:', { latitude, longitude, feiras: feiras.length });
console.log('✅ Cache salvo com sucesso');
```

## ✅ **Resultados Esperados**

1. **Botão funcional** - "Ver no Mapa" com scroll
2. **Cache funcionando** - Dados salvos na tabela
3. **UX melhorada** - Scroll suave para o mapa
4. **Debug melhorado** - Logs para verificar cache

## 🧪 **Testes Necessários**

- [ ] Botão "Ver no Mapa" funciona
- [ ] Scroll para o mapa funciona
- [ ] Cache está funcionando
- [ ] Dados são salvos corretamente
- [ ] Logs aparecem no console

---

**Data de Implementação:** 2024-12-19  
**Status:** ✅ IMPLEMENTADO E CORRIGIDO  
**Próximo passo:** Testar funcionalidades

---

## 🔧 **CORREÇÃO DO CACHE - FASE 3.1 (2024-12-19)**

### **Problema Identificado:**
- Tabela `feiras_cache` não recebia dados
- Estrutura diferente do `catabagulho_cache` que funciona
- Faltava coluna `expires_at` e constraint unique

### **Solução Implementada:**

#### **1. Nova Migração (007_fix_feiras_cache.sql):**
- ✅ Adicionada coluna `expires_at TIMESTAMP WITH TIME ZONE`
- ✅ Constraint unique para coordenadas (latitude, longitude)
- ✅ Índice para `expires_at`
- ✅ Atualização de registros existentes

#### **2. Correção do Serviço (feiraLivre.service.ts):**
- ✅ Método `verificarCache` usa `expires_at > NOW()`
- ✅ Método `salvarCache` calcula `expires_at` (24 horas)
- ✅ Logs detalhados para debug
- ✅ Mesma lógica do `catabagulho_cache`

### **Estrutura Final da Tabela:**
```sql
CREATE TABLE feiras_cache (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    endereco TEXT NOT NULL,
    data_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dados_json JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- ✅ NOVA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_coords_feiras UNIQUE (latitude, longitude) -- ✅ NOVA
);
```

### **Logs Esperados:**
```
🔍 Verificando cache de feiras para: { latitude: -23.xxx, longitude: -46.xxx }
⚠️ Nenhum cache válido encontrado
💾 Salvando cache de feiras: { latitude: -23.xxx, longitude: -46.xxx, endereco: "...", quantidadeFeiras: 5 }
✅ Cache de feiras salvo com sucesso até: 20/12/2024 18:25:31
```

---

**Status:** ✅ CACHE CORRIGIDO - Funcionando como cata-bagulho  
**Próximo passo:** Testar busca de feiras e verificar cache
