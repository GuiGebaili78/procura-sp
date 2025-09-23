import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '@/components/search/SearchBar';
import { ServiceCard } from '@/components/services/ServiceCard';
import { HealthCard } from '@/components/health/HealthCard';

// Mock do contexto
jest.mock('@/context/AppContext', () => ({
  useAppContext: () => ({
    searchData: null,
    setSearchData: jest.fn(),
    loading: false,
    setLoading: jest.fn(),
  }),
}));

describe('Componentes - Integração', () => {
  describe('SearchBar', () => {
    it('deve renderizar campos de busca', () => {
      render(<SearchBar />);
      
      expect(screen.getByPlaceholderText(/CEP/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/número/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
    });

    it('deve validar CEP antes de buscar', async () => {
      render(<SearchBar />);
      
      const cepInput = screen.getByPlaceholderText(/CEP/i);
      const numeroInput = screen.getByPlaceholderText(/número/i);
      const buscarButton = screen.getByRole('button', { name: /buscar/i });

      fireEvent.change(cepInput, { target: { value: '123' } });
      fireEvent.change(numeroInput, { target: { value: '123' } });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.getByText(/CEP inválido/i)).toBeInTheDocument();
      });
    });

    it('deve permitir busca com dados válidos', async () => {
      render(<SearchBar />);
      
      const cepInput = screen.getByPlaceholderText(/CEP/i);
      const numeroInput = screen.getByPlaceholderText(/número/i);
      const buscarButton = screen.getByRole('button', { name: /buscar/i });

      fireEvent.change(cepInput, { target: { value: '01310100' } });
      fireEvent.change(numeroInput, { target: { value: '123' } });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.queryByText(/CEP inválido/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('ServiceCard', () => {
    const mockService = {
      id: 1,
      nome: 'Teste',
      endereco: 'Rua Teste, 123',
      horario: '08:00 - 17:00',
      dias: ['Segunda', 'Terça'],
      distancia: 1.5
    };

    it('deve renderizar informações do serviço', () => {
      render(<ServiceCard service={mockService} />);
      
      expect(screen.getByText('Teste')).toBeInTheDocument();
      expect(screen.getByText('Rua Teste, 123')).toBeInTheDocument();
      expect(screen.getByText('08:00 - 17:00')).toBeInTheDocument();
    });

    it('deve mostrar botão de ver no mapa', () => {
      render(<ServiceCard service={mockService} />);
      
      expect(screen.getByRole('button', { name: /ver no mapa/i })).toBeInTheDocument();
    });
  });

  describe('HealthCard', () => {
    const mockHealth = {
      id: 1,
      nome: 'UBS Teste',
      endereco: 'Rua Saúde, 456',
      tipo: 'UNIDADE BASICA DE SAUDE',
      esferaAdministrativa: 'Municipal',
      distancia: 2.0
    };

    it('deve renderizar informações de saúde', () => {
      render(<HealthCard health={mockHealth} />);
      
      expect(screen.getByText('UBS Teste')).toBeInTheDocument();
      expect(screen.getByText('Rua Saúde, 456')).toBeInTheDocument();
      expect(screen.getByText('Municipal')).toBeInTheDocument();
    });

    it('deve mostrar tipo de estabelecimento', () => {
      render(<HealthCard health={mockHealth} />);
      
      expect(screen.getByText(/unidade básica/i)).toBeInTheDocument();
    });
  });
});






