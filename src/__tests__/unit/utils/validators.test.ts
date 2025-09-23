import { validateCep, validateEmail, validatePhone, formatCep } from '@/utils/validators';

describe('Validators', () => {
  describe('validateCep', () => {
    it('deve validar CEP válido', () => {
      expect(validateCep('12345-678')).toBe(true);
    });

    it('deve rejeitar CEP inválido', () => {
      expect(validateCep('12345678')).toBe(false);
      expect(validateCep('123')).toBe(false);
      expect(validateCep('12345-67')).toBe(false);
      expect(validateCep('')).toBe(false);
      expect(validateCep('abc')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('deve validar email válido', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('deve validar telefone válido', () => {
      expect(validatePhone('(11) 99999-9999')).toBe(true);
      expect(validatePhone('11999999999')).toBe(true);
    });

    it('deve rejeitar telefone inválido', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('formatCep', () => {
    it('deve formatar CEP corretamente', () => {
      expect(formatCep('12345678')).toBe('12345-678');
    });

    it('deve formatar CEP parcial', () => {
      expect(formatCep('12345')).toBe('12345');
    });

    it('deve remover caracteres não numéricos', () => {
      expect(formatCep('123.456-78')).toBe('12345-678');
    });
  });
});
