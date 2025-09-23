import { searchCataBagulho } from '@/services/api';
import axios from 'axios';

// Mock do axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  let mockInstance: { get: jest.Mock };

  beforeEach(() => {
    mockInstance = {
      get: jest.fn()
    };
    mockedAxios.create.mockReturnValue(mockInstance);
    
    // Mock da função isAxiosError
    mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);
    
    // Limpar mocks
    jest.clearAllMocks();
  });

  describe('searchCataBagulho', () => {
    it('deve buscar cata bagulho com sucesso', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            nome: 'Trecho Teste',
            endereco: 'Rua Teste, 123',
            horario: '08:00 - 17:00'
          }
        ]
      };

      mockInstance.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await searchCataBagulho(-23.5505, -46.6333);

      expect(mockInstance.get).toHaveBeenCalledWith('/cata-bagulho', {
        params: { lat: -23.5505, lng: -46.6333 }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('deve retornar array vazio quando não há dados', async () => {
      const mockResponse = {
        success: false,
        data: null
      };

      mockInstance.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await searchCataBagulho(-23.5505, -46.6333);

      expect(result).toEqual([]);
    });

    it('deve tratar erro de servidor', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Erro interno do servidor'
          }
        },
        isAxiosError: true
      };

      mockInstance.get.mockRejectedValueOnce(mockError);

      await expect(searchCataBagulho(-23.5505, -46.6333)).rejects.toThrow('Erro do servidor: Erro interno do servidor');
    });

    it('deve tratar erro de conexão', async () => {
      const mockError = {
        request: {},
        message: 'Network Error',
        isAxiosError: true
      };

      mockInstance.get.mockRejectedValueOnce(mockError);

      await expect(searchCataBagulho(-23.5505, -46.6333)).rejects.toThrow('Servidor não está respondendo. Verifique sua conexão.');
    });
  });
});
