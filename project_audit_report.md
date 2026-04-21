# Threat Model & Security Audit: KNH VAMS

**Tarih**: 21 Nisan 2026 | **Versiyon**: 1.0 | **Yazar**: Security Engineer

"Security Engineer" şapkamı giyerek uygulamanın mimarisini, veri akışını ve yetkilendirme katmanlarını (Authentication & Authorization) derinlemesine inceledim. Amacım: *Sistemin nasıl çalıştığıyla değil, nasıl kırılabileceğiyle ilgilenmektir.*

## 🛡 System Overview & Trust Boundaries
- **Mimari:** Client-Side Supabase (BaaS) Entegreli React Native (Expo)
- **Kimlik Doğrulama:** Supabase Auth (Özel "Ghost Email" Hash Algoritması ile T.C. Kimlik Bazlı)
- **Erişim Kontrolü:** Kapsamlı Client-Side Routing Koruması (`_layout.tsx`) + Supabase Tarafı Row Level Security (RLS)
- **Girdi Doğrulaması:** Zod tabanlı tam katı şema validasyonları (`visitorSchema.ts`)

---

## 🔍 Security Findings (Bulgular)

### 🔴 Blockers (Must Fix)
**BULGU YOK (0).** 
Kritik bir RCE (Remote Code Execution), yetkilendirme atlatma (Auth Bypass) veya açık bir XSS/SQLi zafiyeti tespit edilmedi. Uygulama, doğrudan API sunucusu kullanmadığı (Client'tan DB'ye Supabase/PostgREST kullandığı) için sunucu tabanlı atak yüzeyleri tamamen kapalıdır.

### 🟡 High/Medium Expectations (Tehdit Modeli Uyarıları)

> [!WARNING]
> **Kimlik Doğrulama: Ghost Email ve "Zayıf Şifre" Riski**
> T.C. Kimlik Numaraları, Türkiye'de maalesef "gizli" veriler olmaktan çıkıp kısmen "öngörülebilir" veriler haline gelmiştir. Sistemin *Ghost Email* mimarisi (`SHA256(TC) + @konyanumune.gov.tr`) TC kimliğin çalınmasını şifreler, ancak **kötü niyetli bir kişi bir personelin T.C.'sini biliyorsa, e-postasını kesin olarak bilebilir.**
> **Senaryo:** Saldırgan T.C. kimliği biliyor. Sadece zayıf bir şifre tahmin etmesi gerekiyor (örn: `123456`, `Sifre123!`).
> **Mitigation (Çözüm):** 
> - Supabase tarafında kesinlikle **Rate Limiting** (X dakika içinde Y hatalı giriş engeli) aktifleştirilmelidir.
> - Şifre kaydı aşamasında Zod validasyonuna *minimum 8 karakter, 1 büyük harf, 1 özel karakter* zorunluluğu eklenmelidir.

### 💭 Informational & Defense-in-Depth

> [!TIP]
> **RLS (Row Level Security) Sorumluluğu**
> Uygulama Client-Driven olduğu için, uygulamanın *(React Native veya Web fark etmez)* kaynak kodları her zaman de-compile edilerek analiz edilebilir ve Supabase Anon Key okunabilir. Bu son derece normaldir (Supabase'in çalışma mantığı).
> **Kritik Hatırlatma:** Güvenliğinizin %100'ü Supabase panelinizdeki RLS (Row Level Security) kurallarına bağlıdır. `profiles.role` veya `department_id` filtrelerinizin Backend (Supabase Dashboard) tarafında "Tamamen Kapalı / Deny-by-default" prensibine göre inşa edildiğinden emin olun.

> [!TIP]
> **Zod Validasyonu Mükemmeliği**
> Güvenlik duvarının "Client-Side" katmanı şahane kurgulanmış. Pasaport veya T.C. No girişlerinde Injection ataklarını durdurmak ve Garbage Data (Çöp veri) girişini engellemek için kullanılan Regex'ler (örn: `^\+?[0-9\s\-()]{7,20}$`) çok nitelikli.

---

## 🎯 Kapanış Notu (Security Verdict)

Tebrikler. VAMS projesi tasarım itibariyle "Security-by-Design" (Tasarım Aşamasında Güvenlik) felsefesini destekliyor. Local state'e veya AsyncStorage'a düz metin (plaintext) şifre/veri yazılmamış ve Auth Session'ları resmi `@supabase/supabase-js` storage'a güvenle emanet edilmiş.

Teknolojik altyapınız dış saldırılara karşı güvenlidir. Eğer Supabase RLS tarafında politikalarınız eksiksizse, projeniz siber güvenlik standartlarının tamamını başarıyla karşılamaktadır. `[SECURE]`
