// --- Caminho: frontend/src/services/nominatim.ts ---
import axios from "axios";
import { NominatimResult } from "../types/api";

export async function geocodeAddress(
  query: string,
): Promise<NominatimResult[]> {
  console.log(`🔍 [Nominatim] Geocodificando endereço: "${query}"`);

  // Tentar diferentes variações do endereço para melhor precisão
  const searchVariations = [
    query, // Endereço original
    query + ", São Paulo, SP, Brasil", // Com cidade e estado
    query.replace(/,.*$/, "") + ", São Paulo, SP, Brasil", // Apenas rua + cidade
    // Adicionar variações mais específicas para evitar ruas com nomes similares
    query.replace(/R\.?\s*/, "Rua "), // Trocar "R." por "Rua"
    query.replace(/R\.?\s*/, "Rua ") + ", São Paulo, SP, Brasil", // Com "Rua" + cidade
  ];

  for (let i = 0; i < searchVariations.length; i++) {
    const searchQuery = searchVariations[i];
    console.log(`🌐 [Nominatim] Tentativa ${i + 1}/${searchVariations.length}: "${searchQuery}"`);
    
    try {
      const directResponse = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: searchQuery,
            format: "json",
            limit: 5,
            countrycodes: "br",
            addressdetails: 1,
            bounded: 1, // Limitar busca ao Brasil
            viewbox: "-46.8,-23.8,-46.3,-23.4", // Caixa delimitadora de São Paulo
          },
          timeout: 15000,
          headers: {
            "User-Agent": "Procura-SP/1.0",
            "Accept": "application/json",
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
          },
          // Configurações para evitar CORS
          withCredentials: false,
        },
      );

      console.log(`📊 [Nominatim] Resposta recebida:`, {
        status: directResponse.status,
        dataLength: directResponse.data?.length || 0,
        hasData: !!directResponse.data
      });

      if (directResponse.data && Array.isArray(directResponse.data)) {
        if (directResponse.data.length > 0) {
          console.log(`✅ [Nominatim] Geocodificação bem-sucedida - ${directResponse.data.length} resultado(s) encontrado(s)`);
          console.log(`📍 [Nominatim] Primeiro resultado:`, {
            display_name: directResponse.data[0].display_name,
            lat: directResponse.data[0].lat,
            lon: directResponse.data[0].lon
          });
          return directResponse.data;
        } else {
          console.log(`⚠️ [Nominatim] Tentativa ${i + 1} sem resultados`);
          continue; // Tentar próxima variação
        }
      } else {
        console.log(`❌ [Nominatim] Resposta inválida na tentativa ${i + 1}`);
        continue; // Tentar próxima variação
      }
    } catch (error) {
      console.error(`❌ [Nominatim] Erro na tentativa ${i + 1}:`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          console.log(`⏰ [Nominatim] Timeout na tentativa ${i + 1} (15s)`);
        } else if (error.response?.status === 404) {
          console.log(`📍 [Nominatim] Endereço não encontrado na tentativa ${i + 1} (404)`);
        } else if (error.response?.status) {
          console.log(`🚫 [Nominatim] Erro HTTP ${error.response.status} na tentativa ${i + 1}`);
        }
      }
      
      // Se não é a última tentativa, continuar
      if (i < searchVariations.length - 1) {
        console.log(`🔄 [Nominatim] Tentando próxima variação...`);
        continue;
      }
    }
  }
  
  console.log(`❌ [Nominatim] Todas as tentativas falharam`);
  return []; // Retorna array vazio se todas as tentativas falharam
}
