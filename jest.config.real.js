const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const config = {
  testEnvironment: 'jsdom', // Voltar para jsdom para suportar testes de componentes
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/jest.setup.real.ts'],
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: false, // Não limpar mocks para testes reais
  testTimeout: 30000, // Timeout maior para testes reais
  // Não mockar database para testes reais
  unmockedModulePathPatterns: ['@/lib/database'],
}

module.exports = createJestConfig(config)
