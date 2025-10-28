/**
 * Serviço de geocoding usando Nominatim (OpenStreetMap) e Google Geocoding como fallback
 */

interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Geocodifica um endereço usando múltiplas fontes (Nominatim, ViaCEP+Nominatim)
 * @param address Endereço completo para geocodificar
 * @returns Array de resultados de geocoding ou array vazio em caso de erro
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult[]> {
  console.log(`🔍 [NominatimService] Geocodificando endereço: "${address}"`);
  
  // Tentar Nominatim direto primeiro (mais rápido)
  const nominatimResult = await tryNominatim(address);
  if (nominatimResult.length > 0) {
    console.log(`✅ [NominatimService] Sucesso via Nominatim direto`);
    return nominatimResult;
  }
  
  // Tentar ViaCEP + Nominatim como fallback (mais confiável para endereços brasileiros)
  const viaCepResult = await tryViaCEPGeocoding(address);
  if (viaCepResult.length > 0) {
    console.log(`✅ [NominatimService] Sucesso via ViaCEP + Nominatim`);
    return viaCepResult;
  }
  
  console.warn(`⚠️ [NominatimService] Nenhuma fonte conseguiu geocodificar o endereço`);
  return [];
}

/**
 * Tenta geocodificar usando Nominatim (OpenStreetMap)
 */
async function tryNominatim(address: string): Promise<GeocodeResult[]> {
  try {
    console.log(`🌍 [Nominatim] Tentando geocodificar...`);
    
    // Formatar endereço para melhorar busca no Nominatim
    // Remove CEP da query pois pode confundir o Nominatim
    let formattedAddress = address.replace(/\d{5}-?\d{3}/, '').trim();
    
    // Se não tem "São Paulo" ou "SP", adiciona
    if (!formattedAddress.toLowerCase().includes('são paulo') && !formattedAddress.includes(', SP')) {
      formattedAddress += ', São Paulo, SP, Brasil';
    } else if (!formattedAddress.toLowerCase().includes('brasil')) {
      formattedAddress += ', Brasil';
    }
    
    console.log(`🌍 [Nominatim] Query formatada: "${formattedAddress}"`);
    
    const url = `https://nominatim.openstreetmap.org/search?` + 
      `q=${encodeURIComponent(formattedAddress)}` +
      `&format=json` +
      `&addressdetails=1` +
      `&limit=3` + // Aumentado para 3 para ter mais opções
      `&countrycodes=br`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ProcuraSP-App/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`❌ [Nominatim] Erro HTTP: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn(`⚠️ [Nominatim] Nenhum resultado encontrado`);
      return [];
    }
    
    // Converter formato Nominatim para nosso formato
    const results: GeocodeResult[] = data.map((item: {
      lat: string;
      lon: string;
      display_name: string;
      address?: {
        city?: string;
        state?: string;
        country?: string;
      };
    }) => ({
      lat: item.lat,
      lon: item.lon,
      display_name: item.display_name,
      address: item.address
    }));
    
    console.log(`✅ [Nominatim] ${results.length} resultado(s) encontrado(s)`);
    return results;
    
  } catch (error) {
    console.error(`❌ [Nominatim] Erro:`, error);
    return [];
  }
}

/**
 * Tenta geocodificar usando ViaCEP API (fallback usando CEP do endereço)
 */
async function tryViaCEPGeocoding(address: string): Promise<GeocodeResult[]> {
  try {
    console.log(`📮 [ViaCEP] Tentando extrair CEP do endereço e geocodificar...`);
    
    // Extrair CEP do endereço (formato: xxxxx-xxx ou xxxxxxxx)
    const cepMatch = address.match(/(\d{5}-?\d{3})/);
    if (!cepMatch) {
      console.warn(`⚠️ [ViaCEP] CEP não encontrado no endereço`);
      return [];
    }
    
    const cep = cepMatch[1].replace(/\D/g, '');
    
    // Extrair número do endereço (primeiro número antes do hífen ou vírgula)
    const numeroMatch = address.match(/,\s*(\d+)\s*[-,]/);
    const numero = numeroMatch ? numeroMatch[1] : '';
    
    console.log(`📮 [ViaCEP] CEP extraído: ${cep}, Número: ${numero || 'S/N'}`);
    
    // Usar a API interna que usa ViaCEP + Nominatim
    const url = `/api/geocode-cep?cep=${cep}${numero ? `&numero=${numero}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ [ViaCEP] Erro HTTP: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.success || !data.coordenadas) {
      console.warn(`⚠️ [ViaCEP] Nenhum resultado encontrado`);
      return [];
    }
    
    // Converter formato para nosso formato
    const result: GeocodeResult = {
      lat: data.coordenadas.lat.toString(),
      lon: data.coordenadas.lng.toString(),
      display_name: data.enderecoCompleto || address,
      address: {
        city: data.endereco?.cidade || 'São Paulo',
        state: data.endereco?.uf || 'SP',
        country: 'Brasil'
      }
    };
    
    console.log(`✅ [ViaCEP] Coordenadas encontradas via CEP`);
    return [result];
    
  } catch (error) {
    console.error(`❌ [ViaCEP] Erro:`, error);
    return [];
  }
}

/**
 * Geocodifica um endereço e retorna apenas o primeiro resultado
 * @param address Endereço completo para geocodificar
 * @returns Primeiro resultado de geocoding ou null se não encontrar
 */
export async function geocodeAddressFirst(address: string): Promise<GeocodeResult | null> {
  const results = await geocodeAddress(address);
  return results.length > 0 ? results[0] : null;
}

/**
 * Geocodifica um endereço e retorna coordenadas como números
 * @param address Endereço completo para geocodificar
 * @returns Coordenadas como { lat: number, lng: number } ou null se não encontrar
 */
export async function geocodeAddressToCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
  const result = await geocodeAddressFirst(address);
  
  if (!result) {
    return null;
  }
  
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);
  
  if (isNaN(lat) || isNaN(lng)) {
    console.error(`❌ [NominatimService] Coordenadas inválidas: lat=${result.lat}, lng=${result.lon}`);
    return null;
  }
  
  return { lat, lng };
}
