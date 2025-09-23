# Configuração das APIs de Geocoding

## APIs Gratuitas Disponíveis

### 1. OpenCage Geocoding API
- **Limite gratuito:** 2.500 requisições/dia
- **Registro:** https://opencagedata.com/api
- **Chave:** Substitua `YOUR_OPENCAGE_API_KEY` no código

### 2. MapBox Geocoding API
- **Limite gratuito:** 100.000 requisições/mês
- **Registro:** https://www.mapbox.com/
- **Token:** Substitua `YOUR_MAPBOX_TOKEN` no código

### 3. Nominatim (OpenStreetMap)
- **Limite gratuito:** 1.000 requisições/hora
- **Registro:** Não necessário
- **Uso:** Já configurado, sem chave

## Como Configurar

1. **Para OpenCage:**
   - Acesse https://opencagedata.com/api
   - Crie uma conta gratuita
   - Copie sua chave API
   - Substitua `YOUR_OPENCAGE_API_KEY` no arquivo `src/app/api/cep/[cep]/route.ts`

2. **Para MapBox:**
   - Acesse https://www.mapbox.com/
   - Crie uma conta gratuita
   - Gere um token de acesso
   - Substitua `YOUR_MAPBOX_TOKEN` no arquivo `src/app/api/cep/[cep]/route.ts`

3. **Para Nominatim:**
   - Já está configurado e funcionando
   - Não requer chave

## Estratégia de Fallback

O sistema tenta as APIs na seguinte ordem:
1. **OpenCage** (mais preciso)
2. **Nominatim** (gratuito, sem chave)
3. **MapBox** (alto limite)
4. **Coordenadas aproximadas** (fallback final)

## Scripts Disponíveis

- `scripts/geocoding-multiplas-apis-feiras.js` - Completa coordenadas das feiras
- `scripts/geocoding-estavel-feiras.js` - Script estável para feiras
- `scripts/geocoding-rapido-feiras.js` - Script rápido para feiras


