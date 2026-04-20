import * as z from 'zod';
import { isValidTC } from '@/src/utils/validations';

export const visitorSchema = z.object({
  existingVisitorId: z.string().optional(),
  isExternal: z.boolean().default(true),
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(1, "Soyad zorunludur"),
  isForeign: z.boolean().default(false),
  tcNo: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  unitId: z.string().min(1, "Birim seçimi zorunludur"),
  targetUserId: z.string().min(1, "Kişi seçimi zorunludur"),
  visitDate: z.date({
    message: "Ziyaret tarihi seçimi zorunludur"
  }),
  visitTime: z.date({
    message: "Ziyaret saati seçimi zorunludur"
  }),
  visitReason: z.string().min(10, "Ziyaret nedeni en az 10 karakter olmalıdır"),
}).superRefine((data, ctx) => {
  if (data.phone && data.phone.trim() !== '') {
    if (!data.isForeign) {
      if (!/^(05)\d{9}$/.test(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Türkiye formatında giriniz (05xxxxxxxxx)",
          path: ["phone"]
        });
      }
    } else {
      if (!/^\+?[0-9\s\-()]{7,20}$/.test(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Geçerli bir uluslararası numara giriniz",
          path: ["phone"]
        });
      }
    }
  }

  if (!data.isExternal) {
    if (!data.title || data.title.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ünvan zorunludur",
        path: ["title"]
      });
    }
  } else {
    if (!data.isForeign) {
      const hasMaskedTc = data.tcNo && data.tcNo.includes('*');
      if (!hasMaskedTc && (!data.tcNo || !isValidTC(data.tcNo))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Geçerli bir T.C. Kimlik No giriniz",
          path: ["tcNo"]
        });
      }
    } else {
      const hasMaskedTc = data.tcNo && data.tcNo.includes('*');
      if (!hasMaskedTc && (!data.tcNo || !/^[a-zA-Z0-9]{5,20}$/.test(data.tcNo))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Geçerli bir Pasaport Numarası giriniz (5-20 hane)",
          path: ["tcNo"]
        });
      }
    }
  }
});

export type VisitorFormValues = z.infer<typeof visitorSchema>;

export const getDefaultVisitorFormValues = (now: Date = new Date()): Partial<VisitorFormValues> => ({
  isExternal: true,
  firstName: '',
  lastName: '',
  tcNo: '',
  title: '',
  phone: '',
  isForeign: false,
  unitId: '',
  targetUserId: '',
  visitDate: now,
  visitTime: now,
  visitReason: '',
  existingVisitorId: '',
});
