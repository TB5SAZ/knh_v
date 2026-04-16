import { generateSecureKey } from '../secureRandom';

// Testler sırasında Native modüle ihtiyaç duymamak için mockluyoruz
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn().mockImplementation(async (length: number) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }),
}));

describe('generateSecureKey', () => {
  it('should generate a string of the requested length', async () => {
    const key16 = await generateSecureKey(16);
    expect(key16.length).toBe(16);

    const key32 = await generateSecureKey(32);
    expect(key32.length).toBe(32);
  });

  it('should only contain alphanumeric characters', async () => {
    const key = await generateSecureKey(100);
    // Yalnızca A-Z, a-z ve 0-9 karakterlerini içerdiğinden emin oluyoruz
    expect(key).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('should return empty string if length is 0', async () => {
    const key = await generateSecureKey(0);
    expect(key).toBe('');
  });
});
