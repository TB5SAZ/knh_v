import * as Crypto from 'expo-crypto';

const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const MAX_UNBIASED_BYTE = 248;

export const generateSecureKey = async (length: number = 32): Promise<string> => {
  let result = '';
  
  while (result.length < length) {
    const bytesNeeded = length - result.length;
    const randomBytes = await Crypto.getRandomBytesAsync(bytesNeeded * 2);
    
    for (let i = 0; i < randomBytes.length && result.length < length; i++) {
      const byte = randomBytes[i];
      if (byte < MAX_UNBIASED_BYTE) {
        result += ALPHANUMERIC_CHARS[byte % ALPHANUMERIC_CHARS.length];
      }
    }
  }
  
  return result;
};
