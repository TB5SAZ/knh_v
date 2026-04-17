# KNH_VAMS (Ziyaretçi ve Randevu Takip Sistemi) - PRD

## 1. Proje Özeti (Project Overview)
**KNH_VAMS**, kurum içi veya tesis genelinde ziyaretçi giriş-çıkışlarını ve randevu süreçlerini güvenli, izlenebilir ve dijital bir şekilde yönetmeyi amaçlayan **Evrensel bir Mobil/Web Uygulamasıdır (Universal App)**. Bu sistem, danışma/güvenlik personelinin giriş-çıkış işlemlerini hızla yapmasını, çalışanların kendi randevularını yönetmesini ve yöneticilerin bu süreçleri denetlemesini sağlar.

## 2. Hedef Kitle ve Kullanıcı Rolleri
- **Güvenlik/Danışma Personeli:** Tesise gelen ziyaretçilerin kimlik tespitini yapar, randevuları doğrular, giriş-çıkış işlemlerini kaydeder ve gerekirse kişileri kara listeden (Blacklist) kontrol eder.
- **Kurum Çalışanları:** Kendi misafirleri için randevu oluşturur, gelen randevu taleplerini yönetir ve geçmiş randevularını görüntüler.
- **Sistem Yöneticileri (Admin):** Sistemdeki kullanıcıları, departmanları, güvenlik konfigürasyonlarını ve yetkilendirmeleri yönetir.

## 3. Temel Özellikler (Core Features)

### 3.1. Kimlik Doğrulama ve Yönlendirme
- **Kullanıcı Kaydı ve Girişi:** E-posta/Şifre ile güvenli kimlik doğrulama.
- **Rol Tabanlı Yönlendirme:** Kullanıcının rolüne (Admin, Security, Employee) göre ilgili sayfaya veya yetkilendirildiği işlemlere yönlendirilmesi.

### 3.2. Dashboard (Gösterge Paneli)
- Günlük beklenen ziyaretçi sayısı.
- İçerideki aktif ziyaretçi sayısı.
- Son gerçekleşen giriş-çıkışların anlık özeti veya grafikleri.

### 3.3. Randevu Yönetimi (Appointments)
- Çalışanlar tarafından misafirler için ileri tarihli randevu oluşturulması.
- Randevu durumu takibi (Bekliyor, Onaylandı, Gerçekleşti, İptal Edildi).
- İlgili personel ile ziyaret edilecek departmanın esnek seçimi.

### 3.4. Ziyaretçi Yönetimi (Visitors)
- Ziyaretçi bilgilerinin sisteme eklenmesi, güncellenmesi ve detaylarının görüntülenmesi.
- Ziyaretçi girişine/çıkışına dair logların tutulması.
- Zod üzerinden sıkı form denetimi.

### 3.5. Kara Liste (Blacklist)
- Belirli amaçlarla tesise girmesi yasaklanmış/sakıncalı bulunan kişilerin kayıt altına alınması.
- Ziyaretçi girişi veya randevu esnasında otomatik kara liste kontrolü uyarısı.

### 3.6. Şifreleme ve Güvenlik (Keygen / Security)
- Verilerin korunması için kriptografik anahtarların (`generateSecureKey` vb.) uygulama içinde yetkili kişilerce çevrimdışı/çevrimiçi yöntemlerle oluşturulması ve yönetimi.
- PII (Kişisel Veri) niteliği taşıyan ve KVKK açısından hassas bilgilerin hashlenebilmesi/şifrelenmesi.

### 3.7. Ayarlar ve Profil Yönetimi (Settings)
- Kullanıcı profillerinin, şifrelerinin güncellenmesi.
- Tesis genel ayarları veya departman (`departmentService`) kurallarının belirlenmesi.

## 4. Teknik Mimari (Tech Stack)

### 4.1. Frontend (İstemci)
- **Framework:** React Native + Expo (File-based routing with `expo-router`).
- **Styling:** NativeWind v4 (Tailwind CSS entegrasyonu) ve Global CSS.
- **UI Kütüphanesi:** Gluestack UI v3 (Açık kaynak evrensel bileşenler).
- **Responsive Tasarım:** Breakpointler kullanılarak hem mobil cihazlarda (iOS/Android) hem de büyük masaüstü/tablet ekranlarında kesintisiz UI.
- **Form & Validasyon:** React Hook Form + Zod.

### 4.2. Backend & Veritabanı
- **Altyapı:** Supabase (PostgreSQL Tabanlı Backend-as-a-Service).
- **Veri Güvenliği:** Row-Level Security (RLS) politikaları sayesinde her kullanıcı sadece yetkisine göre veri okur/yazar.
- **Servis Katmanı:** `services` (auth, profile, visitor, department, key) klasöründe API iletişimi soyutlanmıştır.

## 5. Güvenlik Gereksinimleri
- Supabase API anahtarları sıkı bir şekilde erişim denetimine tabi olmalıdır.
- Sadece HTTPS protokolü üzerinden iletişim yapılmalı.
- Güçlü parola politikaları ve oturum yönetim kısıtlamaları (Sentry veya loglama desteği).

## 6. Sürüm ve Geliştirme Haritası (Roadmap)
- **v1.0 (MVP):** Auth sistemi, temel rol atamaları, Randevu oluşturma ve Ziyaretçi Onaylama.
- **v1.1:** Kara liste (Blacklist) uyarı otomasyonu ve departman bazlı randevu onay akışları.
- **v1.2:** Gelişmiş PII Kriptografi Altyapısının tam entegrasyonu, i18n entegrasyonu (Çoklu dil).

---
*Not: Bu PRD, mevcut repo özellikleri analiz edilerek oluşturulmuştur, projenin büyümesiyle birlikte güncellenecektir.*
