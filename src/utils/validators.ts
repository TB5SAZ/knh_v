export const validateTcKimlik = (tc: string) => {
  if (!/^[1-9]\d{10}$/.test(tc)) return false;
  const digits = tc.split('').map(Number);
  
  let digit10 = ((digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7 - (digits[1] + digits[3] + digits[5] + digits[7])) % 10;
  if (digit10 < 0) digit10 += 10;
  if (digit10 !== digits[9]) return false;

  const digit11 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
  if (digit11 !== digits[10]) return false;

  return true;
};
