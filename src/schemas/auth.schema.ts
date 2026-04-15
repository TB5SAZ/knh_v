import { z } from 'zod';
import { validateTcKimlik } from '@/src/utils/validators';

export const registerSchema = z.object({
  tcKimlik: z.string().length(11, 'TC Kimlik No 11 hane olmak zorundadır.').refine(validateTcKimlik, 'Geçersiz T.C. Kimlik No.'),
  firstName: z.string().min(1, 'Ad alanı boş bırakılamaz.'),
  lastName: z.string().min(1, 'Soyad alanı boş bırakılamaz.'),
  key: z.string().length(32, 'Geçersiz Key bilgisi girdiniz.'),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır.')
    .regex(/[a-zğüşıöç]/, 'Şifreniz en az bir küçük harf içermelidir.')
    .regex(/[A-ZĞÜŞİÖÇ]/, 'Şifreniz en az bir büyük harf içermelidir.')
    .regex(/[0-9]/, 'Şifreniz en az bir sayı içermelidir.'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Şifreler eşleşmiyor.',
  path: ['passwordConfirm'],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  tcKimlik: z.string().length(11, 'TC Kimlik No 11 hane olmak zorundadır.').refine(validateTcKimlik, 'Geçersiz T.C. Kimlik No.'),
  password: z.string().min(1, 'Şifre alanı boş bırakılamaz.'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
