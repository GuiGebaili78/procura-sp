# Plano de Refatoração - Projeto Procura-SP

## 📋 Análise Completa do Projeto

### 🎯 Objetivos da Refatoração
- **Reduzir duplicação de código** - Consolidar componentes similares
- **Melhorar performance** - Lazy loading e otimizações
- **Padronizar interfaces** - Tipos mais específicos e consistentes
- **Simplificar estrutura** - Componentes mais enxutos e focados
- **Implementar testes** - Qualidade e confiabilidade

## 🔍 Pontos Identificados para Refatoração

### 1. **Componentes com Duplicação de Lógica**

#### **A. SearchBar.tsx (548 linhas) - CRÍTICO**
**Problemas identificados:**
- ✅ **Lógica de busca duplicada** - 4 tipos de serviços com código similar
- ✅ **Estado complexo** - 20+ estados diferentes
- ✅ **Função gigante** - `handleSearch` com 150+ linhas
- ✅ **Filtros hardcoded** - 50+ filtros de saúde inline
- ✅ **Geocoding duplicado** - Lógica repetida em vários lugares

**Refatoração proposta:**
```typescript
// Separar em hooks customizados
const useCepSearch = () => { /* lógica CEP */ };
const useGeocoding = () => { /* lógica geocoding */ };
const useServiceSearch = () => { /* lógica de busca */ };

// Componentes menores
<CepInput />
<AddressDisplay />
<ServiceFilters />
<SearchButton />
```

#### **B. ServicesList.tsx - MÉDIO**
**Problemas identificados:**
- ✅ **Switch case complexo** - 4 tipos de serviços
- ✅ **Props drilling** - Muitas props passadas
- ✅ **Lógica condicional** - Múltiplos ifs aninhados

**Refatoração proposta:**
```typescript
// Factory pattern para tipos de serviço
const ServiceListFactory = {
  'cata-bagulho': CataBagulhoList,
  'feiras-livres': FeirasList,
  'coleta-lixo': ColetaLixoList,
  'saude': HealthList
};
```

#### **C. MapView.tsx (274+ linhas) - MÉDIO**
**Problemas identificados:**
- ✅ **Múltiplas responsabilidades** - Mapa + marcadores + rotas
- ✅ **Props complexas** - 8+ props diferentes
- ✅ **Lógica condicional** - isFeira, isSaude, etc.

**Refatoração proposta:**
```typescript
// Separar responsabilidades
<MapContainer>
  <MapController />
  <UserMarker />
  <ServiceMarkers />
  <RouteController />
</MapContainer>
```

### 2. **Serviços com Lógica Duplicada**

#### **A. banco-saude.service.ts (275 linhas) - CRÍTICO**
**Problemas identificados:**
- ✅ **Query SQL gigante** - 100+ linhas de mapeamento
- ✅ **Função monolítica** - `construirQuerySQL` muito complexa
- ✅ **Mapeamento hardcoded** - 50+ tipos mapeados inline

**Refatoração proposta:**
```typescript
// Separar em módulos
const TipoMapper = { /* mapeamento de tipos */ };
const QueryBuilder = { /* construção de queries */ };
const DistanceCalculator = { /* cálculos de distância */ };
```

#### **B. APIs com validação duplicada**
**Problemas identificados:**
- ✅ **Validação repetida** - CEP, coordenadas, parâmetros
- ✅ **Response format** - Estrutura inconsistente
- ✅ **Error handling** - Lógica duplicada

**Refatoração proposta:**
```typescript
// Middleware de validação
const validateCep = (cep: string) => { /* validação CEP */ };
const validateCoordinates = (lat: number, lng: number) => { /* validação coords */ };
const validateFilters = (filtros: FiltroSaude) => { /* validação filtros */ };
```

### 3. **Tipos e Interfaces**

#### **A. FiltroSaude (87 propriedades) - CRÍTICO**
**Problemas identificados:**
- ✅ **Interface gigante** - 87 propriedades boolean
- ✅ **Manutenção difícil** - Adicionar novo tipo requer mudanças em 5+ arquivos
- ✅ **Performance** - Re-renders desnecessários

**Refatoração proposta:**
```typescript
// Estrutura hierárquica
interface FiltroSaude {
  tipos: TipoEstabelecimento[];
  esferas: EsferaAdministrativa[];
  regioes?: string[];
}

type TipoEstabelecimento = 'UBS' | 'HOSPITAL' | 'POSTO' | 'AMA' | ...;
type EsferaAdministrativa = 'MUNICIPAL' | 'ESTADUAL' | 'PRIVADO';
```

#### **B. Props interfaces duplicadas**
**Problemas identificados:**
- ✅ **18 interfaces Props** - Muitas similares
- ✅ **Props opcionais** - Inconsistência
- ✅ **Tipos any** - Violação das regras do projeto

**Refatoração proposta:**
```typescript
// Base props
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Props específicas
interface ServiceListProps extends BaseComponentProps {
  services: ServiceData[];
  onViewDetails: (id: string) => void;
}
```

### 4. **Performance e Otimização**

#### **A. Re-renders desnecessários**
**Problemas identificados:**
- ✅ **SearchBar re-renderiza** - A cada mudança de filtro
- ✅ **MapView re-renderiza** - A cada mudança de marcador
- ✅ **ServicesList re-renderiza** - A cada mudança de resultado

**Refatoração proposta:**
```typescript
// React.memo para componentes pesados
const SearchBar = React.memo(({ ... }) => { ... });
const MapView = React.memo(({ ... }) => { ... });

// useMemo para cálculos pesados
const filteredServices = useMemo(() => {
  return services.filter(/* lógica de filtro */);
}, [services, filters]);

// useCallback para funções
const handleSearch = useCallback(() => {
  // lógica de busca
}, [dependencies]);
```

#### **B. Bundle size**
**Problemas identificados:**
- ✅ **Leaflet completo** - Mesmo usando apenas marcadores
- ✅ **Componentes não lazy** - Todos carregados no bundle inicial
- ✅ **Imagens não otimizadas** - SVGs inline podem ser otimizados

**Refatoração proposta:**
```typescript
// Lazy loading de componentes
const MapView = lazy(() => import('./MapView'));
const HealthLayerSelector = lazy(() => import('./HealthLayerSelector'));

// Code splitting por rota
const BuscarPage = lazy(() => import('./buscar/page'));
const ServicosPage = lazy(() => import('./servicos/page'));
```

## 🚀 Plano de Implementação

### **Fase 1: Refatoração de Componentes (Prioridade ALTA)**

#### **1.1 SearchBar.tsx**
- [ ] **Extrair hooks customizados**
  - `useCepSearch` - Lógica de busca de CEP
  - `useGeocoding` - Lógica de geocoding
  - `useServiceSearch` - Lógica de busca de serviços
  - `useHealthFilters` - Lógica de filtros de saúde

- [ ] **Separar em componentes menores**
  - `CepInput` - Input de CEP com validação
  - `AddressDisplay` - Exibição do endereço
  - `ServiceFilters` - Filtros específicos por serviço
  - `SearchButton` - Botão de busca com loading

- [ ] **Implementar React.memo e useMemo**
  - Memoizar componentes pesados
  - Memoizar cálculos de coordenadas
  - Memoizar filtros aplicados

#### **1.2 ServicesList.tsx**
- [ ] **Implementar Factory Pattern**
  - `ServiceListFactory` - Mapeamento de tipos para componentes
  - `ServiceListRenderer` - Renderizador baseado no tipo

- [ ] **Reduzir props drilling**
  - Context API para estado compartilhado
  - Props mais específicas e tipadas

#### **1.3 MapView.tsx**
- [ ] **Separar responsabilidades**
  - `MapContainer` - Container base do mapa
  - `UserMarker` - Marcador do usuário
  - `ServiceMarkers` - Marcadores de serviços
  - `RouteController` - Controle de rotas

- [ ] **Otimizar re-renders**
  - Memoizar marcadores
  - Lazy loading de rotas
  - Debounce para mudanças de zoom

### **Fase 2: Refatoração de Serviços (Prioridade ALTA)**

#### **2.1 banco-saude.service.ts**
- [ ] **Separar em módulos**
  - `TipoMapper` - Mapeamento de tipos de estabelecimento
  - `QueryBuilder` - Construção de queries SQL
  - `DistanceCalculator` - Cálculos de distância
  - `CacheManager` - Gerenciamento de cache

- [ ] **Implementar cache inteligente**
  - Cache por filtros específicos
  - Invalidação automática
  - Compressão de dados

#### **2.2 APIs**
- [ ] **Middleware de validação**
  - `validateCep` - Validação de CEP
  - `validateCoordinates` - Validação de coordenadas
  - `validateFilters` - Validação de filtros

- [ ] **Response padronizado**
  - Interface `ApiResponse<T>`
  - Error handling consistente
  - Logging padronizado

### **Fase 3: Refatoração de Tipos (Prioridade MÉDIA)**

#### **3.1 FiltroSaude**
- [ ] **Estrutura hierárquica**
  - `FiltroSaude` com propriedades agrupadas
  - `TipoEstabelecimento` como union type
  - `EsferaAdministrativa` como union type

- [ ] **Validação de tipos**
  - Type guards para validação
  - Schemas com Zod ou similar
  - Runtime validation

#### **3.2 Props interfaces**
- [ ] **Base props**
  - `BaseComponentProps` - Props comuns
  - `ServiceProps` - Props específicas de serviços
  - `MapProps` - Props específicas de mapa

- [ ] **Eliminar tipos any**
  - Substituir por tipos específicos
  - Type guards quando necessário
  - Unknown para casos incertos

### **Fase 4: Performance e Otimização (Prioridade MÉDIA)**

#### **4.1 Bundle optimization**
- [ ] **Lazy loading**
  - Componentes pesados
  - Páginas por rota
  - Bibliotecas externas

- [ ] **Code splitting**
  - Por funcionalidade
  - Por serviço
  - Por página

#### **4.2 Runtime optimization**
- [ ] **React.memo**
  - Componentes que re-renderizam muito
  - Listas grandes
  - Componentes de mapa

- [ ] **useMemo e useCallback**
  - Cálculos pesados
  - Funções passadas como props
  - Filtros e ordenações

### **Fase 5: Testes e Qualidade (Prioridade BAIXA)**

#### **5.1 Testes unitários**
- [ ] **Componentes críticos**
  - SearchBar
  - ServicesList
  - MapView

- [ ] **Hooks customizados**
  - useCepSearch
  - useGeocoding
  - useServiceSearch

#### **5.2 Testes de integração**
- [ ] **Fluxos completos**
  - Busca de Cata-Bagulho
  - Busca de Feiras
  - Busca de Saúde

- [ ] **APIs**
  - Endpoints críticos
  - Validações
  - Error handling

## 📊 Métricas de Sucesso

### **Antes da Refatoração:**
- **SearchBar.tsx**: 548 linhas
- **banco-saude.service.ts**: 275 linhas
- **FiltroSaude**: 87 propriedades
- **18 interfaces Props** similares
- **0 testes** implementados

### **Após a Refatoração (Meta):**
- **SearchBar.tsx**: < 200 linhas
- **banco-saude.service.ts**: < 150 linhas
- **FiltroSaude**: < 20 propriedades
- **< 10 interfaces Props** bem definidas
- **> 80% cobertura** de testes

### **Performance:**
- **Bundle size**: -30%
- **First load**: -40%
- **Re-renders**: -60%
- **Memory usage**: -25%

## 🎯 Próximos Passos

### **Implementação Imediata:**
1. **Refatorar SearchBar.tsx** - Maior impacto
2. **Implementar hooks customizados** - Reutilização
3. **Separar banco-saude.service.ts** - Manutenibilidade
4. **Otimizar FiltroSaude** - Performance

### **Implementação Gradual:**
1. **Testes unitários** - Qualidade
2. **Lazy loading** - Performance
3. **Code splitting** - Bundle size
4. **Documentação** - Manutenibilidade

## 📝 Conclusão

A refatoração proposta focará em:
- **Reduzir duplicação** de código em 60%
- **Melhorar performance** em 40%
- **Simplificar manutenção** com componentes menores
- **Implementar testes** para qualidade
- **Padronizar interfaces** para consistência

**Status: ✅ PLANO COMPLETO - PRONTO PARA IMPLEMENTAÇÃO**
