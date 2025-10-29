import { useCallback } from 'react';
import { searchCataBagulho } from '../services/api';
import { CataBagulhoResult } from '../types/cataBagulho';
import { FeiraLivre } from '../types/feiraLivre';
import { ColetaLixoResponse } from '../types/coletaLixo';
import { EstabelecimentoSaude } from '../lib/services/saudeLocal.service';
import { buscarColetaEcourbis } from '../services/ecourbis';

interface Coordinates {
  lat: number;
  lng: number;
}

interface SearchParams {
  cep: string;
  numero: string;
  coordinates: Coordinates;
  enderecoCompleto: string;
  categorias?: string[];
}

interface UseServiceSearchReturn {
  searchCataBagulho: (params: SearchParams) => Promise<CataBagulhoResult[]>;
  searchFeiras: (params: SearchParams) => Promise<FeiraLivre[]>;
  searchColetaLixo: (params: SearchParams) => Promise<ColetaLixoResponse>;
  searchSaude: (params: SearchParams) => Promise<EstabelecimentoSaude[]>;
  searchEstabelecimentosTempoReal: (params: SearchParams) => Promise<EstabelecimentoSaude[]>;
}

export function useServiceSearch(): UseServiceSearchReturn {
  const searchCataBagulhoCallback = useCallback(async (params: SearchParams): Promise<CataBagulhoResult[]> => {
    console.log("🔍 [ServiceSearch] Iniciando busca de Cata-Bagulho...");
    console.log("📍 [ServiceSearch] Coordenadas:", params.coordinates);
    
    const results = await searchCataBagulho(params.coordinates.lat, params.coordinates.lng);
    
    console.log("📊 [ServiceSearch] Resultados recebidos:", results);
    console.log("📊 [ServiceSearch] Quantidade de resultados:", results?.length || 0);

    if (!results || results.length === 0) {
      console.log("❌ [ServiceSearch] Nenhum resultado encontrado");
      return [];
    }

    console.log("✅ [ServiceSearch] Enviando resultados para o componente pai");
    return results;
  }, []);

  const searchFeiras = useCallback(async (params: SearchParams): Promise<FeiraLivre[]> => {
    console.log("🔍 [ServiceSearch] Iniciando busca de Feiras...");
    console.log("📍 [ServiceSearch] Coordenadas:", params.coordinates);
    console.log("🏠 [ServiceSearch] Endereço:", params.enderecoCompleto);
    
    const response = await fetch('/api/feiras', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: params.coordinates.lat,
        lng: params.coordinates.lng,
        raio: 5 // 5km de raio
      })
    });

    const data = await response.json();
    
    console.log("📊 [ServiceSearch] Resposta da API de feiras:", data);

    if (!data.success || !data.data?.feiras || data.data.feiras.length === 0) {
      console.log("❌ [ServiceSearch] Nenhuma feira encontrada");
      return [];
    }

    console.log("✅ [ServiceSearch] Feiras encontradas:", data.data.feiras.length);
    console.log("✅ [ServiceSearch] Primeira feira:", data.data.feiras[0]);
    return data.data.feiras;
  }, []);

  const searchColetaLixo = useCallback(async (params: SearchParams): Promise<ColetaLixoResponse> => {
    console.log('🔍 [ServiceSearch] Buscando coleta de lixo (client-side)...');
    console.log('📍 [ServiceSearch] Coordenadas:', params.coordinates);
    
    // Buscar direto do navegador do usuário (não passa pelo servidor)
    // Isso funciona porque o usuário tem IP brasileiro
    const resultado = await buscarColetaEcourbis(
      params.coordinates.lat,
      params.coordinates.lng
    );

    if (!resultado) {
      throw new Error("Nenhuma informação de coleta de lixo encontrada para este endereço.");
    }

    const response: ColetaLixoResponse = {
      coletaComum: resultado.coletaComum,
      coletaSeletiva: resultado.coletaSeletiva,
      endereco: params.enderecoCompleto,
      latitude: params.coordinates.lat,
      longitude: params.coordinates.lng,
      dataConsulta: new Date().toISOString()
    };

    console.log('✅ [ServiceSearch] Coleta encontrada:', {
      coletaComum: response.coletaComum.length,
      coletaSeletiva: response.coletaSeletiva.length
    });

    return response;
  }, []);

  const searchSaude = useCallback(async (params: SearchParams): Promise<EstabelecimentoSaude[]> => {
    if (!params.categorias || params.categorias.length === 0) {
      throw new Error("Categorias de saúde são obrigatórias");
    }

    const response = await fetch('/api/saude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cep: params.cep.replace(/\D/g, ''),
        numero: params.numero,
        latitude: params.coordinates.lat,
        longitude: params.coordinates.lng,
        categorias: params.categorias,
        raio: 5000 // 5km
      })
    });

    const data = await response.json();

    console.log('🔍 [ServiceSearch] Resposta da API de saúde:', data);

    if (!data.success || !data.data?.estabelecimentos || data.data.estabelecimentos.length === 0) {
      return [];
    }

    return data.data.estabelecimentos;
  }, []);

  const searchEstabelecimentosTempoReal = useCallback(async (params: SearchParams): Promise<EstabelecimentoSaude[]> => {
    if (!params.categorias || params.categorias.length === 0) {
      console.log('⚠️ [ServiceSearch] Não é possível aplicar filtros em tempo real - categorias não fornecidas');
      return [];
    }

    try {
      console.log('🔄 [ServiceSearch] Buscando estabelecimentos em tempo real...');
      console.log('🔧 [ServiceSearch] Categorias:', params.categorias);
      
      const response = await fetch('/api/saude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep: params.cep.replace(/\D/g, ''),
          numero: params.numero,
          latitude: params.coordinates.lat,
          longitude: params.coordinates.lng,
          categorias: params.categorias
        })
      });

      const data = await response.json();

      console.log('🔄 [ServiceSearch] Resposta da API (tempo real):', data);

      if (data.success && data.data?.estabelecimentos) {
        console.log('✅ [ServiceSearch] Filtros aplicados em tempo real:', data.data.estabelecimentos.length, 'estabelecimentos');
        return data.data.estabelecimentos;
      } else {
        console.log('⚠️ [ServiceSearch] Nenhum resultado encontrado com os filtros aplicados');
        return [];
      }
    } catch (error) {
      console.error('❌ [ServiceSearch] Erro ao aplicar filtros em tempo real:', error);
      return [];
    }
  }, []);

  return {
    searchCataBagulho: searchCataBagulhoCallback,
    searchFeiras,
    searchColetaLixo,
    searchSaude,
    searchEstabelecimentosTempoReal,
  };
}
