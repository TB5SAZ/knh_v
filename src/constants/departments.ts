export const TARGET_DEPARTMENTS = {
  // Örn: Başhekimlik (Özel yetkilinin görebileceği kısıtlı departman)
  RESTRICTED_VIEW_DEPT_ID: '45a7d371-17c9-4560-ae01-e104ffe30610',
  
  // Örn: Güvenlik Departmanı
  SECURITY_DEPT_ID: '4b82177d-a7ad-487e-9d3a-9181a937d99f',

  // Sekreter (Örn: Başhekimlik Sekreteri gibi özel yetkili profiller)
  SPECIAL_AUTH_DEPT_ID: '74f89e28-b11a-4824-bc7d-3f17d2e1c68a',

  // Admin Departmanı
  ADMIN_DEPT_ID: '6271e6d7-afda-49c3-979a-1ebaebffaa90',

  // Diğer ana departmanlar
  IDARI_MALI_HIZ_DEPT_ID: 'f58c2ffd-fca5-4240-9114-c4848e024542',
  DESTEK_KALITE_DEPT_ID: '8692513a-80aa-49ae-8a36-e08715ee131d',
  SAGLIK_BAKIM_HIZ_DEPT_ID: 'b07ef611-f913-48d3-b1a4-e5ed7da868cb'
};

// ID -> İsim eşleştirmesi (Kolay okunabilirlik ve yazdırma için)
export const DEPARTMENT_MAP: Record<string, string> = {
  '45a7d371-17c9-4560-ae01-e104ffe30610': 'Başhekimlik',
  'f58c2ffd-fca5-4240-9114-c4848e024542': 'İdari ve Mali Hiz.',
  '8692513a-80aa-49ae-8a36-e08715ee131d': 'Destek ve Kalite',
  'b07ef611-f913-48d3-b1a4-e5ed7da868cb': 'Sağlık Bakım Hiz.',
  '6271e6d7-afda-49c3-979a-1ebaebffaa90': 'Admin',
  '74f89e28-b11a-4824-bc7d-3f17d2e1c68a': 'Sekreter',
  '4b82177d-a7ad-487e-9d3a-9181a937d99f': 'Güvenlik',
};

// İsim -> ID eşleştirmesi (Kod içinde string yerine değişken kullanmak için)
export const DEPARTMENTS_BY_NAME = {
  BASHEKIMLIK: '45a7d371-17c9-4560-ae01-e104ffe30610',
  IDARI_MALI_HIZ: 'f58c2ffd-fca5-4240-9114-c4848e024542',
  DESTEK_KALITE: '8692513a-80aa-49ae-8a36-e08715ee131d',
  SAGLIK_BAKIM_HIZ: 'b07ef611-f913-48d3-b1a4-e5ed7da868cb',
  ADMIN: '6271e6d7-afda-49c3-979a-1ebaebffaa90',
  SEKRETER: '74f89e28-b11a-4824-bc7d-3f17d2e1c68a',
  GUVENLIK: '4b82177d-a7ad-487e-9d3a-9181a937d99f',
};
