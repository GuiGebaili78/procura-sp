import { NextRequest } from 'next/server';

// Mock das rotas da API
jest.mock('@/app/api/cep/[cep]/route', () => ({
  GET: jest.fn(),
}));

jest.mock('@/app/api/coleta-lixo/route', () => ({
  GET: jest.fn(),
}));

jest.mock('@/app/api/feiras/route', () => ({
  GET: jest.fn(),
}));

jest.mock('@/app/api/saude/route', () => ({
  GET: jest.fn(),
}));

describe('API Routes - Integração Completa', () => {
  describe('GET /api/cep/[cep]', () => {
    it('deve retornar dados do CEP', async () => {
      const { GET } = await import('@/app/api/cep/[cep]/route');
      const request = new NextRequest('http://localhost:3000/api/cep/01310100');
      
      const response = await GET(request, { params: { cep: '01310100' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('cep');
      expect(data).toHaveProperty('logradouro');
    });

    it('deve tratar CEP inválido', async () => {
      const { GET } = await import('@/app/api/cep/[cep]/route');
      const request = new NextRequest('http://localhost:3000/api/cep/00000000');
      
      const response = await GET(request, { params: { cep: '00000000' } });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/coleta-lixo', () => {
    it('deve retornar informações de coleta', async () => {
      const { GET } = await import('@/app/api/coleta-lixo/route');
      const request = new NextRequest('http://localhost:3000/api/coleta-lixo?cep=01310100&numero=123');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('comum');
      expect(data).toHaveProperty('seletiva');
    });

    it('deve tratar parâmetros faltando', async () => {
      const { GET } = await import('@/app/api/coleta-lixo/route');
      const request = new NextRequest('http://localhost:3000/api/coleta-lixo');
      
      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/feiras', () => {
    it('deve retornar feiras livres', async () => {
      const { GET } = await import('@/app/api/feiras/route');
      const request = new NextRequest('http://localhost:3000/api/feiras?cep=01310100&numero=123');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('GET /api/saude', () => {
    it('deve retornar estabelecimentos de saúde', async () => {
      const { GET } = await import('@/app/api/saude/route');
      const request = new NextRequest('http://localhost:3000/api/saude?cep=01310100&numero=123&ubs=true&hospitais=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('deve filtrar por tipo de estabelecimento', async () => {
      const { GET } = await import('@/app/api/saude/route');
      const request = new NextRequest('http://localhost:3000/api/saude?cep=01310100&numero=123&ubs=true&hospitais=false');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });
});






