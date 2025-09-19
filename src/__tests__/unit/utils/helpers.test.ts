import { 
  haversineDistance, 
  clamp, 
  isValidLatLng 
} from '@/utils/helpers';

describe('Helpers', () => {
  describe('haversineDistance', () => {
    it('deve calcular distância entre dois pontos', () => {
      const distance = haversineDistance(-23.5505, -46.6333, -23.5506, -46.6334);
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });

    it('deve retornar 0 para pontos iguais', () => {
      const distance = haversineDistance(-23.5505, -46.6333, -23.5505, -46.6333);
      expect(distance).toBe(0);
    });

    it('deve calcular distância real entre São Paulo e Rio', () => {
      // São Paulo: -23.5505, -46.6333
      // Rio de Janeiro: -22.9068, -43.1729
      const distance = haversineDistance(-23.5505, -46.6333, -22.9068, -43.1729);
      expect(distance).toBeGreaterThan(300000); // Mais de 300km
      expect(distance).toBeLessThan(400000); // Menos de 400km
    });
  });

  describe('clamp', () => {
    it('deve limitar valor entre min e max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('deve usar valores padrão', () => {
      expect(clamp(0.5)).toBe(0.5);
      expect(clamp(-0.5)).toBe(0);
      expect(clamp(1.5)).toBe(1);
    });
  });

  describe('isValidLatLng', () => {
    it('deve validar coordenadas válidas', () => {
      expect(isValidLatLng(-23.5505, -46.6333)).toBe(true);
      expect(isValidLatLng(0, 0)).toBe(true);
      expect(isValidLatLng(90, 180)).toBe(true);
      expect(isValidLatLng(-90, -180)).toBe(true);
    });

    it('deve rejeitar coordenadas inválidas', () => {
      expect(isValidLatLng(91, 0)).toBe(false);
      expect(isValidLatLng(-91, 0)).toBe(false);
      expect(isValidLatLng(0, 181)).toBe(false);
      expect(isValidLatLng(0, -181)).toBe(false);
      expect(isValidLatLng(NaN, 0)).toBe(false);
      expect(isValidLatLng(0, NaN)).toBe(false);
      expect(isValidLatLng(undefined, 0)).toBe(false);
      expect(isValidLatLng(0, undefined)).toBe(false);
    });
  });
});
