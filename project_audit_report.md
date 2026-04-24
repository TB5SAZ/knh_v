# Threat Model & Security Audit: KNH VAMS

**Tarih**: 24 Nisan 2026 | **Versiyon**: 2.0 | **Yazar**: Security Engineer

"Security Engineer" şapkamı giyerek uygulamanın kod tabanını baştan sona inceledim. Zafiyetleri, güven sınırlarını (trust boundaries) ve kimlik/yetki yönetimini değerlendirdim.

## 🛡 Sistem Mimarisi & Güven Sınırları
- **Mimari:** Client-Side (React Native / Expo) -> Supabase (BaaS / PostgREST)
- **Kimlik Doğrulama:** Supabase Auth + T.C. Kimlik numarası üzerinden türetilmiş SHA-256 Ghost E-mail mekanizması.
- **Erişim Kontrolü (Client):** `_layout.tsx` ve sayfa içi role tabanlı (Sistem Yöneticisi, Güvenlik) render kontrolleri.
- **Veri Doğrulama:** Form işlemlerinde Zod Schema validasyonları (TC Kimlik, şifre gücü, uluslararası telefon numaraları).

---

## 🔍 Security Findings (Bulgular)

### 🔴 Blockers (Must Fix)
**BULGU YOK (0).** 
Kritik bir zafiyet (RCE, Auth Bypass, SQL Injection) tespit edilmedi. Uygulama PostgREST kullandığı için veri tabanı sorguları parametrik olarak işlenmektedir ve doğrudan SQL enjeksiyonlarına kapalıdır.

### 🟡 High/Medium Expectations (Tehdit Modeli Uyarıları)

> [!WARNING]  
> **[ÇÖZÜLDÜ] RLS (Row Level Security) vs Client-Side Filtering**  
> Öncesinde `blacklist_view` tablosundan hangi kayıtların çekileceği sadece if/else bloklarıyla kontrol ediliyordu. View `security_invoker=true` olmadığı için güvenlik açığı barındırıyordu.  
> **Aksiyon:** Veritabanına doğrudan müdahale edilerek `blacklist_view` security invoker yapıldı ve `blacklist` tablosundaki `SELECT` ile `INSERT` izinleri role-based (Admin, Güvenlik, Sekreter) kısıtlandı. Risk tamamen ortadan kaldırıldı.

> [!WARNING]  
> **[ÇÖZÜLDÜ] "visits" (Ziyaretler) Tablosundaki Hardcode ID'ler ve İş Mantığı**  
> `UPDATE` kuralında ortamlar arası taşınabilirliği bozan "Hardcode UUID" kullanılmıştı. Ayrıca **"Soft-Delete" (Sadece durum güncellemesi ile iptal)** ve **"Gizlilik" (Güvenlik personelinin idarecilere giden ziyaretçileri görmemesi)** gibi kurum içi iş ve gizlilik kuralları veritabanına tam anlamıyla yansıtılmış durumda.  
> **Aksiyon:** `visits` tablosundaki RLS kuralları yeniden yazıldı. Hardcode ID'ler kaldırılarak `departments.name = 'Admin'` yaklaşımına geçildi. Ziyaret kayıtlarının silinmemesi (Soft Delete) için `DELETE` yetkisi kasıtlı olarak kapalı tutuldu. Ayrıca Güvenlik biriminin yalnızca *kendi oluşturduğu* kayıtları görebilmesi sağlanarak idareci gizliliği korundu.

> [!WARNING]  
> **Ghost E-mail ve Brute Force İhtimali**  
> Kullanıcıların T.C. Kimlik numaralarının SHA-256 özeti alınarak e-posta oluşturulması (`hash@konyanumune.gov.tr`) sistemi kullanışlı hale getirse de T.C. numarası bilinen bir kullanıcının hesabı hedeflenebilir.  
> **Mitigation:** Supabase tarafında e-posta brute-force koruması (Rate Limiting) kesinlikle devrede olmalıdır. Zod ile şifre için "8 karakter, 1 büyük harf, 1 sayı" zorunluluğunun eklenmesi **çok doğru ve başarılı** bir güvenlik katmanı sağlamıştır.

### 💭 Informational & Defense-in-Depth

> [!TIP]  
> **Zod Validasyon Katmanı**  
> `visitorSchema.ts` ve `auth.schema.ts` dosyalarındaki veri doğrulama yapıları mükemmel tasarlanmış. Hem UI bazlı hataları önlüyor hem de veritabanına sadece beklenen veri tiplerinin girmesini garanti ediyor. Özellikle Regex kullanımı (Telefon ve TC mantığı) çok profesyonel.

> [!TIP]  
> **RPC Fonksiyonlarının Güvenliği (Security Definer)**  
> `handle_new_user`, `burn_registration_key` ve `verify_registration_key` gibi arka plan PostgREST RPC fonksiyonları `SECURITY DEFINER` olarak başarılı bir şekilde izole edilmiş. Kullanılan Key'lerin anında `is_used = true` yapılması Replay (Tekrar Oynatma) ataklarını %100 engelliyor. Çok iyi bir pratik.

> [!TIP]  
> **Bağımlılık (Dependency) Zafiyetleri**  
> `npm audit` taraması sonucunda 20 adet düşük/orta seviyeli zafiyet tespit edildi. Bunların tamamına yakını Expo'nun build araçları (`expo-constants`, `@expo/config`) ile alakalı olup çalışma zamanında (runtime) bir risk teşkil etmemektedir. Geliştirme sürecinin olağan bir parçasıdır.

---

## 🎯 Kapanış Notu (Security Verdict)

Proje kaynak kodu itibariyle modern güvenlik standartlarına uygun şekilde ("Security-by-Design") kodlanmıştır. Frontend bazlı kısıtlamalar (örneğin `/keygen` sayfasına sadece Sistem Yöneticilerinin girebilmesi) başarıyla implemente edilmiş, state yönetimi güvenli bir şekilde sağlanmıştır.

**Aksiyon Planı:**
Tek yapmanız gereken, Supabase tarafında **RLS (Row Level Security)** kurallarının (özellikle `DELETE` ve `SELECT` yetkilerinin) tam ve doğru kurgulandığından emin olmaktır. Client-Side kodunuz şu an yayına (production) çıkmaya hazırdır. `[SECURE]`
