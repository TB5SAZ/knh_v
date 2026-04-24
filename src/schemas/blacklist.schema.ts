import { z } from 'zod';

export const isValidTC = (tc: string) => {
  if (!/^[1-9]\d{10}$/.test(tc)) return false;
  const digits = tc.split('').map(Number);
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
  if ((sumOdd * 7 - sumEven) % 10 !== digits[9]) return false;
  const sumFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (sumFirst10 % 10 !== digits[10]) return false;
  return true;
};

export const addBlacklistSchema = z.object({
  tcNo: z.string()
    .length(11, 'TC No 11 haneli olmalıdır')
    .regex(/^\d+$/, 'Sadece rakam içermelidir')
    .refine(isValidTC, 'Geçersiz TC Kimlik No'),
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  department: z.string().min(1, 'Kısım / Departman seçmelisiniz'),
  personnel: z.string().min(1, 'Lütfen ilgili kişiyi seçiniz'),
  reason: z.string().min(10, 'Engellenme nedeni en az 10 karakter olmalıdır'),
});

export type AddBlacklistFormValues = z.infer<typeof addBlacklistSchema>;
