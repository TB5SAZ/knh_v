export const CONFIG = {
  SEARCH_MIN_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,
  KEY_LENGTH: 32,
  MAX_SUGGESTIONS: 10,
} as const;

export const ERRORS = {
  NETWORK: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
  DUPLICATE_TC: 'Bu T.C. Kimlik / Pasaport no ile kayıtlı başka bir ziyaretçi bulunuyor.',
  INVALID_CREDENTIALS: 'T.C. Kimlik veya Şifre hatalı. Lütfen tekrar deneyiniz.',
  GENERIC: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.',
} as const;

export const DEPARTMENT_ROLES: Record<string, readonly string[]> = {
  'Başhekimlik': ['Başhekim', 'Başhekim Yrd.'],
  'Güvenlik': ['Güvenlik Amiri', 'Güvenlik Görevlisi'],
  'Admin': ['Sistem Yöneticisi'],
  'İdari ve Mali Hiz.': ['İdari ve Mali Hiz. Müd.', 'İdari ve Mali Hiz. Müd. Yrd.'],
  'Sağlık Bakım Hiz.': ['Sağlık Bakım Hiz. Müd.', 'Sağlık Bakım Hiz. Müd. Yrd.'],
  'Destek ve Kalite': ['Destek ve Kalite Müd.', 'Destek ve Kalite Müd. Yrd.'],
  'Sekreter': ['Sekreter']
} as const;
