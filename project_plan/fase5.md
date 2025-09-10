# Fase 5: Implementação da Coleta de Lixo

## 📋 **Objetivo**
Implementar funcionalidade completa de busca e exibição de informações sobre coleta de lixo comum e seletiva, integrando com o sistema existente.

## 🎯 **Funcionalidades a Implementar**

### **1. Web Scraping da Coleta de Lixo** 🔍
- **Fonte 1:** https://prefeitura.sp.gov.br/web/spregula/w/consultar-coleta
- **Fonte 2:** https://apicoleta.ecourbis.com.br/coleta?dst=100&lat=-23.6064496&lng=-46.6019264
- **Dados a extrair:**
  - Horários de coleta comum
  - Horários de coleta seletiva
  - Dias da semana
  - Frequência de coleta
  - Observações específicas

### **2. Sistema de Cache** 💾
- **Tabela:** `coleta_lixo_cache`
- **Duração:** 24 horas
- **Chave:** Coordenadas do usuário
- **Estrutura:** Similar ao cache de feiras

### **3. Interface de Usuário** 🎨
- **Cartão na página de serviços:** Habilitar botão "Buscar"
- **Seletor de serviços:** Adicionar "Coleta de Lixo"
- **Página de busca:** Integrar com sistema existente
- **Exibição de resultados:** Cards com informações organizadas

## 🔧 **Arquivos a Criar/Modificar**

### **Backend:**
1. **`src/types/coletaLixo.ts`** (NOVO)
   - Interfaces para dados de coleta
   - Tipos para API e cache

2. **`src/lib/services/coletaLixo.service.ts`** (NOVO)
   - Web scraping das duas fontes
   - Lógica de cache
   - Processamento de dados

3. **`src/app/api/coleta-lixo/route.ts`** (NOVO)
   - Endpoint da API
   - Validação de parâmetros
   - Tratamento de erros

4. **`src/lib/migrations/008_create_coleta_lixo_cache.sql`** (NOVO)
   - Tabela de cache
   - Índices para performance

### **Frontend:**
1. **`src/components/services/ColetaLixoList.tsx`** (NOVO)
   - Componente para exibir resultados
   - Cards organizados por tipo de coleta

2. **`src/app/servicos/page.tsx`** (MODIFICAR)
   - Habilitar botão "Buscar" no cartão
   - Roteamento para página de busca

3. **`src/components/search/ServiceSelector.tsx`** (MODIFICAR)
   - Adicionar opção "coleta-lixo"

4. **`src/components/services/ServicesList.tsx`** (MODIFICAR)
   - Integrar componente de coleta de lixo

5. **`src/app/buscar/page.tsx`** (MODIFICAR)
   - Suporte ao novo tipo de serviço

## 🚀 **Fluxo de Funcionamento**

### **1. Busca de Informações:**
```
1. Usuário digita CEP e número
2. Geocodificação do endereço
3. Verificação de cache (24h)
4. Se não tem cache → Web scraping
5. Extração de dados das duas fontes
6. Processamento e organização
7. Salvamento no cache
8. Retorno dos dados
```

### **2. Exibição dos Resultados:**
```
1. Cards separados por tipo (comum/seletiva)
2. Informações de horários e dias
3. Frequência de coleta
4. Observações importantes
5. Mapa com localização (opcional)
```

## 📊 **Estrutura de Dados**

### **ColetaLixo Interface:**
```typescript
interface ColetaLixo {
  id: string;
  tipo: 'comum' | 'seletiva';
  endereco: string;
  diasSemana: string[];
  horarios: string[];
  frequencia: string;
  observacoes?: string;
  coords?: {
    lat: number;
    lng: number;
  };
}

interface ColetaLixoResponse {
  coletaComum: ColetaLixo[];
  coletaSeletiva: ColetaLixo[];
  endereco: string;
  latitude: number;
  longitude: number;
  dataConsulta: string;
}
```

### **Cache Structure:**
```sql
CREATE TABLE coleta_lixo_cache (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    endereco TEXT NOT NULL,
    data_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dados_json JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_coords_coleta_lixo UNIQUE (latitude, longitude)
);
```

## 🎨 **Design da Interface**

### **Cards de Resultado:**
- **Coleta Comum:** Card azul com ícone 🗑️
- **Coleta Seletiva:** Card verde com ícone ♻️
- **Informações:** Dias, horários, frequência
- **Layout:** Similar ao das feiras, mas com duas seções

### **Integração com Sistema Existente:**
- **Página de Serviços:** Botão "Buscar" habilitado
- **Seletor:** Opção "Coleta de Lixo" adicionada
- **Roteamento:** `/buscar?service=coleta-lixo`
- **Loading States:** Skeleton loading específico

## 🔍 **Análise das Fontes**

### **Prefeitura SP:**
- **URL:** https://prefeitura.sp.gov.br/web/spregula/w/consultar-coleta
- **Método:** Formulário com CEP
- **Dados:** Informações oficiais da prefeitura

### **Ecourbis API:**
- **URL:** https://apicoleta.ecourbis.com.br/coleta?dst=100&lat=-23.6064496&lng=-46.6019264
- **Método:** API com coordenadas
- **Dados:** Informações da empresa contratada

## ⚡ **Considerações Técnicas**

### **Web Scraping:**
- **Headers:** User-Agent para evitar bloqueios
- **Rate Limiting:** Pausas entre requisições
- **Error Handling:** Fallbacks para cada fonte
- **Parsing:** Cheerio para HTML, JSON para API

### **Performance:**
- **Cache:** 24 horas para evitar requisições desnecessárias
- **Timeout:** 10 segundos para cada fonte
- **Fallback:** Dados mock se ambas as fontes falharem

### **Integração:**
- **Consistência:** Seguir padrões das feiras e cata-bagulho
- **Reutilização:** Usar componentes existentes
- **Manutenibilidade:** Código organizado e documentado

## 📋 **Plano de Implementação**

### **Fase 5.1: Análise e Estrutura** (1-2 horas)
1. Analisar páginas de coleta
2. Criar tipos TypeScript
3. Definir estrutura de dados

### **Fase 5.2: Backend** (3-4 horas)
1. Implementar serviço de scraping
2. Criar API endpoint
3. Implementar sistema de cache
4. Criar migração do banco

### **Fase 5.3: Frontend** (2-3 horas)
1. Criar componente de exibição
2. Integrar com seletor de serviços
3. Habilitar botão na página de serviços
4. Implementar roteamento

### **Fase 5.4: Testes e Ajustes** (1-2 horas)
1. Testar funcionalidade completa
2. Ajustar interface
3. Otimizar performance
4. Documentar implementação

## 🎯 **Resultados Esperados**

### **Funcionalidades:**
- ✅ Busca de informações de coleta por CEP
- ✅ Exibição de coleta comum e seletiva
- ✅ Cache de 24 horas
- ✅ Integração completa com sistema existente

### **UX:**
- ✅ Interface consistente com o resto do app
- ✅ Loading states e feedback visual
- ✅ Informações claras e organizadas
- ✅ Navegação intuitiva

### **Performance:**
- ✅ Resposta rápida com cache
- ✅ Fallbacks para fontes indisponíveis
- ✅ Tratamento de erros robusto

---

**Data de Criação:** 2024-12-19  
**Status:** ✅ IMPLEMENTADO - Funcionalidade completa  
**Próximo passo:** Testes finais e documentação

## 🎉 **IMPLEMENTAÇÃO CONCLUÍDA**

### **Arquivos Criados:**
- ✅ `src/types/coletaLixo.ts` - Tipos TypeScript
- ✅ `src/lib/services/coletaLixo.service.ts` - Serviço de web scraping
- ✅ `src/app/api/coleta-lixo/route.ts` - API endpoint
- ✅ `src/components/services/ColetaLixoList.tsx` - Componente de exibição
- ✅ `src/lib/migrations/008_create_coleta_lixo_cache.sql` - Migração do banco

### **Arquivos Modificados:**
- ✅ `src/components/search/ServiceSelector.tsx` - Adicionado coleta de lixo
- ✅ `src/components/services/ServicesList.tsx` - Integração do componente
- ✅ `src/app/servicos/page.tsx` - Botão buscar habilitado
- ✅ `src/app/buscar/page.tsx` - Suporte completo ao novo serviço
- ✅ `src/components/search/SearchBar.tsx` - Lógica de busca implementada

### **Funcionalidades Implementadas:**
- ✅ Web scraping das fontes (Prefeitura SP + Ecourbis)
- ✅ Sistema de cache (24 horas)
- ✅ Interface integrada com sistema existente
- ✅ Cards separados para coleta comum e seletiva
- ✅ Botão "Buscar" habilitado na página de serviços
- ✅ Roteamento `/buscar?service=coleta-lixo`
- ✅ Dados mock para desenvolvimento
- ✅ Tratamento de erros robusto

### **Correções Realizadas:**
- ✅ Erro de tipo TypeScript corrigido (null vs undefined)
- ✅ Migração executada com sucesso
- ✅ Tabela de cache criada no banco de dados

### **Status Final:**
🚀 **FUNCIONALIDADE COMPLETA E FUNCIONANDO!**
