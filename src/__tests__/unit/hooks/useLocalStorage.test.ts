import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('deve inicializar com valor padrão', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));

    expect(result.current[0]).toBe('default-value');
  });

  it('deve carregar valor do localStorage', () => {
    localStorageMock.getItem.mockReturnValue('"stored-value"');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));

    expect(result.current[0]).toBe('stored-value');
  });

  it('deve salvar valor no localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', '"new-value"');
    expect(result.current[0]).toBe('new-value');
  });

  it('deve tratar erro de JSON inválido', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));

    expect(result.current[0]).toBe('default-value');
  });

  it('deve funcionar com objetos', () => {
    const initialValue = { name: 'test', value: 123 };
    const { result } = renderHook(() => useLocalStorage('test-obj', initialValue));

    expect(result.current[0]).toEqual(initialValue);

    act(() => {
      result.current[1]({ name: 'updated', value: 456 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', value: 456 });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-obj', '{"name":"updated","value":456}');
  });
});
