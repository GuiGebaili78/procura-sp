import '@testing-library/jest-dom'

// Mock de variáveis de ambiente para testes
Object.assign(process.env, { NODE_ENV: 'test' })
process.env.POSTGRES_HOST = 'localhost'
process.env.POSTGRES_PORT = '5432'
process.env.POSTGRES_USER = 'test_user'
process.env.POSTGRES_DB = 'test_db'
process.env.POSTGRES_PASSWORD = 'test_password'

// Mock do fetch global
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
