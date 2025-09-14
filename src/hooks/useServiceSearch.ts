import { useCallback } from 'react';
import { searchCataBagulho } from '../services/api';
import { CataBagulhoResult } from '../types/cataBagulho';
import { FeiraLivre } from '../types/feiraLivre';
import { ColetaLixoResponse } from '../types/coletaLixo';
import { EstabelecimentoSaude, FiltroSaude } from '../types/saude';

interface Coordinates {
  lat: number;
  lng: number;
}

interface SearchParams {
  cep: string;
  numero: string;
  coordinates: Coordinates;
  enderecoCompleto: string;
  filtrosSaude?: FiltroSaude;
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
    const response = await fetch('/api/feiras', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endereco: params.enderecoCompleto,
        numero: params.numero,
        latitude: params.coordinates.lat,
        longitude: params.coordinates.lng
      })
    });

    const data = await response.json();

    if (!data.success || !data.data?.feiras || data.data.feiras.length === 0) {
      return [];
    }

    return data.data.feiras;
  }, []);

  const searchColetaLixo = useCallback(async (params: SearchParams): Promise<ColetaLixoResponse> => {
    const response = await fetch('/api/coleta-lixo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endereco: params.enderecoCompleto,
        numero: params.numero,
        latitude: params.coordinates.lat,
        longitude: params.coordinates.lng
      })
    });

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error("Nenhuma informação de coleta de lixo encontrada para este endereço.");
    }

    return data.data;
  }, []);

  const searchSaude = useCallback(async (params: SearchParams): Promise<EstabelecimentoSaude[]> => {
    if (!params.filtrosSaude) {
      throw new Error("Filtros de saúde são obrigatórios");
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
        filtros: params.filtrosSaude,
        raio: 5000 // 5km
      })
    });

    const data = await response.json();

    console.log('🔍 [ServiceSearch] Resposta da API de saúde:', data);

    if (!data.success || !data.estabelecimentos || data.estabelecimentos.length === 0) {
      return [];
    }

    return data.estabelecimentos;
  }, []);

  const searchEstabelecimentosTempoReal = useCallback(async (params: SearchParams): Promise<EstabelecimentoSaude[]> => {
    if (!params.filtrosSaude) {
      console.log('⚠️ [ServiceSearch] Não é possível aplicar filtros em tempo real - filtros não fornecidos');
      return [];
    }

    try {
      console.log('🔄 [ServiceSearch] Buscando estabelecimentos em tempo real...');
      console.log('🔧 [ServiceSearch] Filtros:', params.filtrosSaude);
      
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
          filtros: params.filtrosSaude
        })
      });

      const data = await response.json();

      console.log('🔄 [ServiceSearch] Resposta da API (tempo real):', data);

      if (data.success && data.estabelecimentos) {
        console.log('✅ [ServiceSearch] Filtros aplicados em tempo real:', data.estabelecimentos.length, 'estabelecimentos');
        return data.estabelecimentos;
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
