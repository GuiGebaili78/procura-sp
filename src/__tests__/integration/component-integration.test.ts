/**
 * Testes de Integração de Componentes
 * Verifica se imports e módulos funcionam sem quebrar
 */

// Mock dos services para não fazer chamadas reais
jest.mock('@/services/viacep')
// Removido: jest.mock('@/services/nominatim')  
jest.mock('@/services/api')

import { SearchBar } from '@/components/search/SearchBar'

describe('Component Integration Tests', () => {
  describe('Module Imports', () => {
    it('deve conseguir importar SearchBar sem quebrar', () => {
      expect(SearchBar).toBeDefined()
      expect(typeof SearchBar).toBe('function')
    })

    it('deve conseguir importar services mockados', async () => {
      const { fetchCep } = await import('@/services/viacep')
      // Removido: const { geocodeAddress } = await import('@/services/nominatim')
      const { searchCataBagulho } = await import('@/services/api')

      expect(fetchCep).toBeDefined()
      // Removido: expect(geocodeAddress).toBeDefined()
      expect(searchCataBagulho).toBeDefined()
    })
  })

  describe('Mock Verification', () => {
    it('deve ter services mockados funcionando', async () => {
      const { fetchCep } = await import('@/services/viacep')
      
      // Verifica se é um mock
      expect(jest.isMockFunction(fetchCep)).toBe(true)
    })
  })
})