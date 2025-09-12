# Fase 6: Implementação da Funcionalidade de Saúde

## 📋 **Objetivo**
Implementar funcionalidade completa de busca e exibição de estabelecimentos de saúde públicos, integrando com a API oficial do CNES (Cadastro Nacional de Estabelecimentos de Saúde) do Ministério da Saúde.

## 🎯 **Funcionalidades a Implementar**

### **1. Integração com API CNES** 🏥
- **Fonte:** https://servicos.saude.gov.br/cnes/EstabelecimentoSaudeService/v2r0?wsdl
- **Credenciais:** CNES.PUBLICO / cnes#2015public (públicas)
- **Dados a extrair:**
  - Unidades Básicas de Saúde (UBS)
  - Hospitais
  - Postos de Saúde
  - Farmácias Populares
  - Maternidades
  - Unidades de Urgência
  - Academias da Saúde
  - Centros de Atenção Psicossocial (CAPS)
  - Unidades de Saúde Bucal
  - Unidades de Doenças Raras

### **2. Sistema de Cache** 💾
- **Tabela:** `saude_cache`
- **Duração:** 24 horas
- **Chave:** Coordenadas + filtros aplicados
- **Estrutura:** Similar ao cache de feiras e coleta de lixo

### **3. Interface de Usuário** 🎨
- **Cartão na página de serviços:** Habilitar botão "Buscar"
- **Seletor de serviços:** Adicionar "Saúde Pública"
- **Filtros de camadas:** Checkboxes para tipos de estabelecimentos
- **Mapa interativo:** Marcadores coloridos por tipo
- **Lista de resultados:** Cards com informações detalhadas

## 🔧 **Arquivos a Criar/Modificar**

### **Backend:**
1. **`src/types/saude.ts`** (NOVO)
   - Interfaces para estabelecimentos de saúde
   - Tipos para API CNES e cache
   - Filtros de camadas

2. **`src/lib/services/saude.service.ts`** (NOVO)
   - Integração com API SOAP do CNES
   - Lógica de cache
   - Processamento de dados XML

3. **`src/app/api/saude/route.ts`** (NOVO)
   - Endpoint da API
   - Validação de parâmetros
   - Tratamento de erros

4. **`src/lib/migrations/009_create_saude_cache.sql`** (NOVO)
   - Tabela de cache
   - Índices para performance

### **Frontend:**
1. **`src/components/health/HealthLayerSelector.tsx`** (NOVO)
   - Componente para seleção de camadas
   - Checkboxes para tipos de estabelecimentos

2. **`src/components/health/HealthList.tsx`** (NOVO)
   - Componente para exibir resultados
   - Cards organizados por tipo

3. **`src/components/health/HealthCard.tsx`** (NOVO)
   - Card individual de estabelecimento
   - Informações detalhadas

4. **`src/components/health/HealthDetailsModal.tsx`** (NOVO)
   - Modal com detalhes completos
   - Informações de contato e serviços

5. **`src/app/servicos/page.tsx`** (MODIFICAR)
   - Habilitar botão "Buscar" no cartão de saúde
   - Roteamento para página de busca

6. **`src/components/search/ServiceSelector.tsx`** (MODIFICAR)
   - Adicionar opção "saude"

7. **`src/components/map/MapView.tsx`** (MODIFICAR)
   - Suporte a marcadores de saúde
   - Cores diferentes por tipo

8. **`src/app/buscar/page.tsx`** (MODIFICAR)
   - Suporte ao novo tipo de serviço
   - Integração com filtros de camadas

## 🚀 **Fluxo de Funcionamento**

### **1. Busca de Estabelecimentos:**
```
1. Usuário digita CEP e número
2. Geocodificação do endereço
3. Usuário seleciona camadas (tipos de estabelecimentos)
4. Verificação de cache (24h)
5. Se não tem cache → Consulta API CNES
6. Processamento de resposta XML
7. Filtragem por proximidade
8. Salvamento no cache
9. Retorno dos dados
```

### **2. Exibição dos Resultados:**
```
1. Mapa com marcadores coloridos por tipo
2. Lista de estabelecimentos ordenada por distância
3. Cards com informações básicas
4. Modal com detalhes completos
5. Filtros de camadas funcionais
```

## 📊 **Estrutura de Dados**

### **EstabelecimentoSaude Interface:**
```typescript
interface EstabelecimentoSaude {
  id: string;
  nome: string;
  tipo: string;
  tipoCodigo: string;
  endereco: string;
  bairro?: string;
  cidade: string;
  uf: string;
  cep?: string;
  telefone?: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  distancia?: number;
  horarioFuncionamento?: string;
  servicos?: string[];
  cnes?: string;
  gestao?: string;
  natureza?: string;
  esfera?: string;
  vinculoSus?: boolean;
  ativo?: boolean;
}
```

### **Filtros de Camadas:**
```typescript
interface FiltroSaude {
  ubs: boolean;
  hospitais: boolean;
  postos: boolean;
  farmacias: boolean;
  maternidades: boolean;
  urgencia: boolean;
  academias: boolean;
  caps: boolean;
  saudeBucal: boolean;
  doencasRaras: boolean;
}
```

### **Cache Structure:**
```sql
CREATE TABLE saude_cache (
    id SERIAL PRIMARY KEY,
    cep VARCHAR(8) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    filtros TEXT NOT NULL, -- JSON string dos filtros
    estabelecimentos TEXT NOT NULL, -- JSON string dos estabelecimentos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);
```

## 🎨 **Design da Interface**

### **Filtros de Camadas:**
```
🏥 UBS (Unidades Básicas de Saúde) - Azul
🏥 Hospitais - Vermelho
🏥 Postos de Saúde - Verde
💊 Farmácias Populares - Roxo
🏥 Maternidades - Rosa
🚑 Unidades de Urgência - Laranja
🏥 Academias da Saúde - Amarelo
🧠 Centros de Atenção Psicossocial - Cinza
🦷 Unidades de Saúde Bucal - Ciano
🏥 Unidades de Doenças Raras - Marrom
```

### **Layout Proposto:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Buscar Serviços de Saúde                            │
├─────────────────────────────────────────────────────────┤
│ CEP: [_____] Número: [___] [Buscar]                    │
├─────────────────────────────────────────────────────────┤
│ 🏥 Filtros de Estabelecimentos:                        │
│ ☑️ UBS  ☑️ Hospitais  ☐ Postos  ☐ Farmácias           │
│ ☐ Maternidades  ☐ Urgência  ☐ Academias  ☐ CAPS       │
├─────────────────────────────────────────────────────────┤
│ 📍 Mapa Interativo (marcadores coloridos por tipo)     │
├─────────────────────────────────────────────────────────┤
│ 📋 Lista de Estabelecimentos Encontrados:              │
│ • UBS Vila Madalena - 0.8km                            │
│ • Hospital São Paulo - 1.2km                           │
└─────────────────────────────────────────────────────────┘
```

## 🔍 **Análise da API CNES**

### **Endpoint Principal:**
- **URL:** https://servicos.saude.gov.br/cnes/EstabelecimentoSaudeService/v2r0?wsdl
- **Protocolo:** SOAP
- **Autenticação:** Username/Password (públicas)

### **Métodos Disponíveis:**
- `requestListarUnidadesBasicasSaude`
- `requestListarHospitais`
- `requestListarPostosSaude`
- `requestListarFarmaciasPopular`
- `requestListarMaternidades`
- `requestListarUnidadesServicoUrgencia`
- `requestListarAcademiasSaude`
- `requestListarCentralAtencaoPsicossocial`
- `requestListarUnidadesSaudeBucal`
- `requestListarUnidadesDoencasRaras`

### **Parâmetros de Busca:**
- **Localização:** Latitude e longitude
- **Raio:** Distância em km (padrão: 10km)
- **Tipo:** Código do tipo de estabelecimento
- **Paginação:** Registro inicial e quantidade

## ⚡ **Considerações Técnicas**

### **API SOAP:**
- **XML Parsing:** Processamento de respostas XML
- **Headers:** Content-Type e SOAPAction corretos
- **Error Handling:** Fallbacks para API indisponível
- **Rate Limiting:** Controle de requisições

### **Performance:**
- **Cache:** 24 horas para evitar requisições desnecessárias
- **Timeout:** 15 segundos para requisições SOAP
- **Fallback:** Dados mock se API falhar
- **Paginação:** Limite de 50 resultados por tipo

### **Integração:**
- **Consistência:** Seguir padrões das outras funcionalidades
- **Reutilização:** Usar componentes existentes
- **Manutenibilidade:** Código organizado e documentado

## 📋 **Plano de Implementação**

### **Fase 6.1: Análise e Estrutura** (1-2 horas)
1. Analisar documentação CNES
2. Criar tipos TypeScript
3. Definir estrutura de dados
4. Criar migração do banco

### **Fase 6.2: Backend** (4-5 horas)
1. Implementar serviço SOAP
2. Criar API endpoint
3. Implementar sistema de cache
4. Testar integração com CNES

### **Fase 6.3: Frontend** (3-4 horas)
1. Criar componentes de saúde
2. Implementar filtros de camadas
3. Integrar com mapa
4. Criar interface de resultados

### **Fase 6.4: Integração** (2-3 horas)
1. Integrar com seletor de serviços
2. Habilitar botão na página de serviços
3. Implementar roteamento
4. Testar funcionalidade completa

### **Fase 6.5: Testes e Ajustes** (1-2 horas)
1. Testar funcionalidade completa
2. Ajustar interface
3. Otimizar performance
4. Documentar implementação

## 🎯 **Resultados Esperados**

### **Funcionalidades:**
- ✅ Busca de estabelecimentos por CEP
- ✅ Filtros de camadas funcionais
- ✅ Mapa com marcadores coloridos
- ✅ Cache de 24 horas
- ✅ Integração completa com sistema existente

### **UX:**
- ✅ Interface consistente com o resto do app
- ✅ Filtros visuais intuitivos
- ✅ Informações claras e organizadas
- ✅ Navegação fluida

### **Performance:**
- ✅ Resposta rápida com cache
- ✅ Fallbacks para API indisponível
- ✅ Tratamento de erros robusto
- ✅ Dados sempre atualizados

## 🚀 **Vantagens da Implementação**

### **Dados Oficiais:**
- ✅ **Fonte:** Ministério da Saúde
- ✅ **Atualização:** Tempo real via API
- ✅ **Confiabilidade:** Dados oficiais do CNES
- ✅ **Cobertura:** Todo o território nacional

### **Funcionalidades Avançadas:**
- ✅ **Múltiplos Tipos:** 10 categorias diferentes
- ✅ **Busca por Proximidade:** Raio configurável
- ✅ **Filtros Visuais:** Interface intuitiva
- ✅ **Cache Inteligente:** Performance otimizada

### **Integração Perfeita:**
- ✅ **Padrão Consistente:** Segue arquitetura existente
- ✅ **Componentes Reutilizáveis:** Código organizado
- ✅ **Manutenibilidade:** Fácil de expandir
- ✅ **Escalabilidade:** Preparado para crescimento

---

**Data de Criação:** 2024-12-19  
**Status:** 🚧 EM DESENVOLVIMENTO  
**Próximo passo:** Implementação do backend

## 📝 **Notas de Implementação**

### **Desafios Identificados:**
- **API SOAP:** Mais complexa que REST
- **XML Parsing:** Necessita biblioteca robusta
- **Rate Limiting:** Controle de requisições
- **Error Handling:** Fallbacks para indisponibilidade

### **Soluções Propostas:**
- **Biblioteca SOAP:** Usar `soap` ou `axios` com XML parsing
- **Cache Inteligente:** Reduzir chamadas à API
- **Dados Mock:** Fallback para desenvolvimento
- **Tratamento Robusto:** Múltiplas camadas de erro

### **Arquivos de Referência:**
- **Documentação CNES:** `public/cnes/`
- **Exemplos XML:** `public/cnes/XML-exemplos-projeto-soapUI/`
- **Contratos WSDL:** `public/cnes/contratos-wsdl.txt`
- **Manual de Integração:** `public/cnes/manual-de-integracao-soa-cnes.pdf`

