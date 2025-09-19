import '@testing-library/jest-dom'

// Polyfills para Node.js (necessário para PostgreSQL)
import { TextEncoder, TextDecoder } from 'util'

// Configurar polyfills globais
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Configuração para testes REAIS (sem mocks de banco)
// Usar variáveis de ambiente reais para conexão com banco

// NÃO mockar variáveis de ambiente - usar as reais
if (!process.env.POSTGRES_HOST) {
  process.env.POSTGRES_HOST = 'localhost'
  process.env.POSTGRES_PORT = '5434' // Porta do Docker
  process.env.POSTGRES_USER = 'procura_sp_user'
  process.env.POSTGRES_DB = 'procura_sp_db'
  process.env.POSTGRES_PASSWORD = 'procura_sp_password'
}

// Mock do fetch global (APIs externas ainda podem ser mockadas)
global.fetch = jest.fn()

// Mock básicos para browser APIs
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Log para indicar que estamos usando configuração real
console.log('🧪 Configuração de testes REAIS carregada')
console.log('📊 Banco de dados:', process.env.POSTGRES_HOST + ':' + process.env.POSTGRES_PORT)
console.log('⚠️  Estes testes requerem o Docker rodando!')
