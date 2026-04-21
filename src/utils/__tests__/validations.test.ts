import { isValidTC, maskTc } from '../validations';

describe('Validation Utils', () => {
  describe('isValidTC', () => {
    it('returns false for non-numeric inputs', () => {
      expect(isValidTC('123abc45678')).toBe(false);
    });

    it('returns false for strings that are not 11 digits', () => {
      expect(isValidTC('1234567890')).toBe(false);
      expect(isValidTC('123456789012')).toBe(false);
      expect(isValidTC('')).toBe(false);
    });

    it('returns false if the first digit is 0', () => {
      expect(isValidTC('01234567890')).toBe(false);
    });

    it('returns true for a mathematically valid TC number', () => {
      // 10000000146 passed the mathematical checksum logic.
      expect(isValidTC('10000000146')).toBe(true);
    });

    it('returns false for an invalid mathematical TC number', () => {
      expect(isValidTC('10000000147')).toBe(false);
    });
  });

  describe('maskTc', () => {
    it('masks long TC strings correctly leaving only last 4 digits visible', () => {
      expect(maskTc('12345678901')).toBe('*******8901');
    });

    it('returns original string if length is less than or equal to 4', () => {
      expect(maskTc('123')).toBe('123');
      expect(maskTc('1234')).toBe('1234');
    });

    it('returns empty string if input is null', () => {
      expect(maskTc(null)).toBe('');
    });
  });
});
