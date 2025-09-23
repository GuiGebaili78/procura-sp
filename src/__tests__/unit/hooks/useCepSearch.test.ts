import { renderHook, act } from '@testing-library/react';
import { useCepSearch } from '@/hooks/useCepSearch';
import { fetchCep } from '@/services/viacep';

// Mock do serviço
jest.mock('@/services/viacep');
const mockedFetchCep = fetchCep as jest.MockedFunction<typeof fetchCep>;

describe('useCepSearch', () => {
  beforeEach(() => {
    mockedFetchCep.mockClear();
  });

  it('deve inicializar com estado padrão', () => {
    const { result } = renderHook(() => useCepSearch());

    expect(result.current.cep).toBe('');
    expect(result.current.loadingCep).toBe(false);
    expect(result.current.cepError).toBe('');
    expect(result.current.endereco.logradouro).toBe('');
  });

  it('deve buscar CEP com sucesso', async () => {
    const mockData = {
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP'
    };

    mockedFetchCep.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useCepSearch());

    await act(async () => {
      await result.current.handleCepChange('01310100');
    });

    expect(result.current.loadingCep).toBe(false);
    expect(result.current.cepError).toBe('');
    expect(result.current.endereco.logradouro).toBe('Avenida Paulista');
    expect(result.current.endereco.localidade).toBe('São Paulo');
  });

  it('deve tratar erro na busca', async () => {
    mockedFetchCep.mockRejectedValueOnce(new Error('CEP não encontrado'));

    const { result } = renderHook(() => useCepSearch());

    await act(async () => {
      await result.current.handleCepChange('00000000');
    });

    expect(result.current.loadingCep).toBe(false);
    expect(result.current.cepError).toBe('CEP não encontrado');
    expect(result.current.endereco.logradouro).toBe('');
  });

  it('deve limpar dados', () => {
    const { result } = renderHook(() => useCepSearch());

    act(() => {
      result.current.clearCep();
    });

    expect(result.current.cep).toBe('');
    expect(result.current.cepError).toBe('');
    expect(result.current.endereco.logradouro).toBe('');
  });

  it('deve formatar CEP automaticamente', async () => {
    const { result } = renderHook(() => useCepSearch());

    await act(async () => {
      await result.current.handleCepChange('12345678');
    });

    expect(result.current.cep).toBe('12345-678');
  });
});
