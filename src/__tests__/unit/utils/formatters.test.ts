import { formatCep, formatDistanceMetersToKm, formatDateISO, formatTimeISO } from '@/utils/formatters';

describe('Formatters', () => {
  describe('formatCep', () => {
    it('deve formatar CEP com hífen', () => {
      expect(formatCep('12345678')).toBe('12345-678');
    });

    it('deve formatar CEP já formatado', () => {
      expect(formatCep('12345-678')).toBe('12345-678');
    });

    it('deve tratar CEP inválido', () => {
      expect(formatCep('123')).toBe('123');
    });

    it('deve tratar string vazia', () => {
      expect(formatCep('')).toBe('');
    });
  });

  describe('formatDistanceMetersToKm', () => {
    it('deve formatar distância em metros', () => {
      expect(formatDistanceMetersToKm(500)).toBe('500 m');
    });

    it('deve formatar distância em quilômetros', () => {
      expect(formatDistanceMetersToKm(1500)).toBe('1.5 km');
    });

    it('deve tratar valor nulo', () => {
      expect(formatDistanceMetersToKm(null)).toBe('—');
    });

    it('deve tratar valor inválido', () => {
      expect(formatDistanceMetersToKm('invalid')).toBe('—');
    });
  });

  describe('formatDateISO', () => {
    it('deve formatar data ISO', () => {
      // Usar data específica para evitar problemas de fuso horário
      expect(formatDateISO('2024-01-15T12:00:00Z')).toBe('15/01/2024');
    });

    it('deve tratar data inválida', () => {
      expect(formatDateISO('invalid-date')).toBe('Invalid Date');
    });

    it('deve tratar valor vazio', () => {
      expect(formatDateISO('')).toBe('—');
    });
  });

  describe('formatTimeISO', () => {
    it('deve formatar horário ISO', () => {
      expect(formatTimeISO('2024-01-15T14:30:00Z')).toBe('11:30');
    });

    it('deve tratar horário inválido', () => {
      expect(formatTimeISO('invalid-time')).toBe('Invalid Date');
    });

    it('deve tratar valor vazio', () => {
      expect(formatTimeISO('')).toBe('—');
    });
  });
});
