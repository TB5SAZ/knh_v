export function isValidTC(tc: string) {
  if (!/^[1-9][0-9]{10}$/.test(tc)) return false;
  const digits = tc.split('').map(Number);
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
  if ((sumOdd * 7 + sumEven * 9) % 10 !== digits[9]) return false;
  if ((sumOdd + sumEven + digits[9]) % 10 !== digits[10]) return false;
  return true;
}

export const maskTc = (tc: string | null) => {
  if (!tc) return '';
  if (tc.length <= 4) return tc;
  return '*'.repeat(tc.length - 4) + tc.slice(-4);
};
