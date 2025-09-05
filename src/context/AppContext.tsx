"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import { ViaCepResponse } from "../types/location";
import { CataBagulhoResult } from "../types/cataBagulho";

interface AppState {
  // Address data
  cep: string;
  numero: string;
  endereco: ViaCepResponse | null;
  coordenadas: { lat: number; lng: number } | null;

  // Service data
  selectedService: string;
  searchResults: CataBagulhoResult[];

  // UI state
  isLoading: boolean;
  error: string | null;
  searchCompleted: boolean;
}

interface AppContextType extends AppState {
  // Actions
  setCep: (cep: string) => void;
  setNumero: (numero: string) => void;
  setEndereco: (endereco: ViaCepResponse | null) => void;
  setCoordenadas: (coords: { lat: number; lng: number } | null) => void;
  setSelectedService: (service: string) => void;
  setSearchResults: (results: CataBagulhoResult[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchCompleted: (completed: boolean) => void;
  resetSearch: () => void;
}

const initialState: AppState = {
  cep: "",
  numero: "",
  endereco: null,
  coordenadas: null,
  selectedService: "cata-bagulho",
  searchResults: [],
  isLoading: false,
  error: null,
  searchCompleted: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const actions = {
    setCep: (cep: string) => setState((prev) => ({ ...prev, cep })),
    setNumero: (numero: string) => setState((prev) => ({ ...prev, numero })),
    setEndereco: (endereco: ViaCepResponse | null) =>
      setState((prev) => ({ ...prev, endereco })),
    setCoordenadas: (coordenadas: { lat: number; lng: number } | null) =>
      setState((prev) => ({ ...prev, coordenadas })),
    setSelectedService: (selectedService: string) =>
      setState((prev) => ({ ...prev, selectedService })),
    setSearchResults: (searchResults: CataBagulhoResult[]) =>
      setState((prev) => ({ ...prev, searchResults })),
    setIsLoading: (isLoading: boolean) =>
      setState((prev) => ({ ...prev, isLoading })),
    setError: (error: string | null) =>
      setState((prev) => ({ ...prev, error })),
    setSearchCompleted: (searchCompleted: boolean) =>
      setState((prev) => ({ ...prev, searchCompleted })),
    resetSearch: () =>
      setState((prev) => ({
        ...prev,
        searchResults: [],
        coordenadas: null,
        error: null,
        searchCompleted: false,
      })),
  };

  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
