import { 
  API_ENDPOINTS, 
  SERVICE_ICONS, 
  SERVICE_TYPES,
  SAMPLE_STREETS
} from '@/utils/constants'

describe('Constants', () => {
  describe('API_ENDPOINTS', () => {
    it('deve ter endpoint básico definido', () => {
      expect(API_ENDPOINTS.BACKEND_BASE).toBe('/api')
    })
  })

  describe('SERVICE_ICONS', () => {
    it('deve ter ícones para serviços principais', () => {
      expect(SERVICE_ICONS['cata-bagulho']).toBe('🚛')
      expect(SERVICE_ICONS['coleta-lixo']).toBe('🗑️')
      expect(SERVICE_ICONS['saude']).toBe('🏥')
    })
  })

  describe('SERVICE_TYPES', () => {
    it('deve ter tipos de serviços definidos', () => {
      expect(Array.isArray(SERVICE_TYPES)).toBe(true)
      expect(SERVICE_TYPES.length).toBeGreaterThan(0)
      expect(SERVICE_TYPES[0]).toHaveProperty('value')
      expect(SERVICE_TYPES[0]).toHaveProperty('label')
    })
  })

  describe('SAMPLE_STREETS', () => {
    it('deve ter ruas de exemplo de São Paulo', () => {
      expect(Array.isArray(SAMPLE_STREETS)).toBe(true)
      expect(SAMPLE_STREETS).toContain('Avenida Paulista')
      expect(SAMPLE_STREETS).toContain('Rua Augusta')
    })
  })
})