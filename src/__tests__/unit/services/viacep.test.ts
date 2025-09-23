import { fetchCep } from '@/services/viacep';
import axios from 'axios';

// Mock do axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ViaCep Service', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
  });

  describe('fetchCep', () => {
    it('deve buscar CEP válido', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            cep: '01310-100',
            logradouro: 'Avenida Paulista',
            bairro: 'Bela Vista',
            localidade: 'São Paulo',
            uf: 'SP'
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await fetchCep('01310100');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/cep/01310100');
      expect(result).toEqual(mockResponse.data.data);
    });

    it('deve tratar erro de CEP inválido', async () => {
      await expect(fetchCep('123')).rejects.toThrow('CEP inválido. Forneça 8 dígitos numéricos.');
    });

    it('deve tratar erro de resposta do servidor', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'CEP não encontrado'
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await expect(fetchCep('00000000')).rejects.toThrow('Falha de conexão com o servidor.');
    });

    it('deve tratar erro de rede', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchCep('01310100')).rejects.toThrow('Falha de conexão com o servidor.');
    });
  });
});
