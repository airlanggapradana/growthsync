# GrowthSync (KINDO) Design System Implementation Plan
*(Halaman Aplikasi Selain Landing Page)*

Rencana eksekusi komprehensif untuk mengimplementasikan Design System GrowthSync (KINDO) v0.2 pada seluruh antarmuka internal aplikasi (Dashboard Orang Tua, Skrining KPSP, Hasil Skrining Bento Box, Pemantauan Pertumbuhan, Telekonsultasi/Chat, Puskesmas Finder, Auth/Onboarding, serta Dashboard Nakes dan Admin), tanpa mengubah halaman Landing Page.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi pada tahap klarifikasi interaktif:
> - **Navigasi Mobile**: Diterapkan **Bottom Navigation Bar** 4-5 item (`Beranda`, `Skrining`, `Tumbuh`, `Konsultasi`, `Profil`) khusus tampilan mobile (< 1024px), sedangkan desktop tetap menggunakan sidebar yang dapat diciutkan (*collapsible sidebar*).
> - **Format Hasil Skrining**: Menggunakan tata letak **Bento Box** lengkap dengan *ScoreRing*, 4 kartu aspek perkembangan, dan *accordion* saran stimulasi AI/lokal yang dapat dilipat agar tidak menciptakan dinding teks.
> - **Token Warna & Kontras**: Diterapkan secara penuh menggunakan palet Teal (`primary-700: #0F766E` untuk aksi utama/kontras 5.47:1, `primary-800: #115E59` untuk hover), Sky untuk aksen sekunder/tinggi badan, warna status semantik WCAG 2.2 AA, serta tipografi **Plus Jakarta Sans**.
> - **Ruang Lingkup**: Seluruh halaman **selain Landing Page** (Landing Page dipertahankan sebagaimana adanya sesuai instruksi eksplisit pengguna).

---

## 1. Overview & Core Concept

- **Tujuan Utama**: Mentransformasi aplikasi GrowthSync dari antarmuka klinis generik menjadi pengalaman pemantauan tumbuh kembang anak yang **tenang, hangat, kredibel, dan mudah digunakan**, terutama bagi orang tua yang sedang memegang balita dengan satu tangan.
- **Audiens Target**: 
  1. *Orang Tua*: Pengguna dominan ponsel, membutuhkan navigasi jempol yang nyaman (*bottom nav*), kartu status yang menenangkan, dan langkah tindakan yang jelas.
  2. *Tenaga Kesehatan (Nakes)*: Pengguna tablet/laptop, membutuhkan tabel pasien terstruktur dengan prioritas kasus penyimpangan.
  3. *Administrator*: Pengguna desktop, membutuhkan antrean verifikasi SIP dan ringkasan audit log.
- **Nilai Kunci**: Pemisahan tegas antara status evaluasi deterministik KPSP (aturan baku klinis) dan saran intervensi AI (bantuan kontekstual), jaminan kontras aksesibilitas WCAG 2.2 AA di mode terang maupun gelap, serta kecepatan respons antarmuka.

---

## 2. User Experience & Visual Design

### 2.1 Alur Pengguna per Halaman

1. **Autentikasi & Onboarding Anak (`/auth`, Onboarding)**:
   - Form terpusat (maks 440px) dengan seleksi peran melalui **dua kartu besar interaktif** (Orang Tua vs Tenaga Kesehatan), bukan dropdown.
   - Pendaftaran Nakes menyertakan alert info verifikasi SIP oleh admin.
   - Onboarding anak menggunakan *3-step stepper* (Identitas Anak → Pengukuran Awal → Selesai) dengan perhitungan otomatis usia dalam bulan.

2. **Dashboard Orang Tua (`/dashboard`)**:
   - Header sapaan ramah + `ChildSwitcher` dengan foto/avatar dan badge usia bulan.
   - Kartu hero *"Jadwal Skrining Berikutnya"* sesuai kelompok usia KPSP aktif dengan tombol CTA utama `primary-700`.
   - Ringkasan skrining terakhir dengan `StatusBadge` semantik (Sesuai / Perlu Stimulasi / Disarankan Rujukan).
   - 3 Kartu metrik antropometri terbaru (Berat Badan, Tinggi Badan, Lingkar Kepala) dengan angka tabular (`tabular-nums`) dan tren mini.
   - Grafik pertumbuhan WHO terintegrasi dengan filter chip metrik (Semua / BB / TB / LK) tanpa label diagnosa gizi prematur.
   - Baris aksi cepat: Konsultasi Nakes & Puskesmas Terdekat.

3. **Skrining KPSP (`/screening`)**:
   - Skrining interaktif **satu pertanyaan per layar** dengan bilah progres tipis dan indikator "Pertanyaan X dari 10".
   - Layar persiapan alat KPSP (benang wol, kubus, kismis/biskuit, pensil) sebelum kuesioner dimulai.
   - `QuestionCard` berukuran teks `body-lg` (18px) untuk kenyamanan membaca, disertai ilustrasi panduan dan dua tombol sentuh besar **Ya** (hijau/centang) dan **Tidak** (abu-abu netral/silang) dengan tinggi minimum 56px.
   - Penyimpanan otomatis (*auto-save*) lokal agar progres tidak hilang jika koneksi terputus.
   - Layar tinjauan ringkasan 10 jawaban sebelum konfirmasi pengiriman akhir.

4. **Hasil Skrining Bento Box (`/result`)**:
   - Bagian atas lipatan layar: Kartu status utama (8 kolom) berisi label status, kalimat penenang, dan tombol aksi rujukan/chat + `ScoreRing` interaktif (4 kolom).
   - 4 Kartu aspek KPSP (Gerak Kasar [Teal], Gerak Halus [Sky], Bicara & Bahasa [Violet], Sosialisasi & Kemandirian [Amber]) dengan skor pencapaian per aspek.
   - Panel Saran Stimulasi AI/Lokal dengan tata letak *accordion* yang dapat dilipat per kategori perkembangan, dilengkapi badge transparan `Local Engine` bila mode fallback aktif.
   - Catatan disclaimer medis standar pada bagian bawah dan tombol unduh PDF resmi.

5. **Telekonsultasi (`/chat` / `KonsultasiNakesView`)**:
   - Banner darurat tetap di bagian atas: *"Chat ini bukan untuk kondisi darurat. Hubungi 119 atau datang ke IGD."*
   - Gelembung pesan: pesan sendiri di kanan (`bg-primary-700 text-white rounded-2xl rounded-tr-sm`), pesan nakes di kiri (`bg-subtle text-primary rounded-2xl rounded-tl-sm`).
   - Pengelompokan kontak berdasarkan profesi (Dokter Spesialis Anak, Bidan Desa, dsb.).
   - Composer input dengan auto-resize textarea dan pintasan keyboard (Enter kirim, Shift+Enter baris baru).

6. **Puskesmas Finder (`PuskesmasMapModal`)**:
   - Kartu puskesmas informatif dengan jarak riil/estimasi, alamat, tombol telepon faskes, dan navigasi rute Google Maps.
   - Banner peringatan deteksi lokasi jika koordinat GPS gagal/fallback ke Jakarta dengan tombol set lokasi manual.

7. **Dashboard Nakes & Admin (`/nakes`, `/admin`)**:
   - Nakes: Kartu metrik ringkasan pasien + tabel daftar pasien dengan pengurutan prioritas status *Penyimpangan* di baris teratas.
   - Admin: Kartu statistik pengguna dan rasio fallback AI, tabel verifikasi SIP Nakes, serta tabel log audit aktivitas.

### 2.2 Tema Visual & Token Desain

```
┌────────────────────────────────────────────────────────────────────────┐
│ PALET UTAMA (Teal)                                                     │
│ Primary-50:  #F0FDFA (Latar kartu lembut)                              │
│ Primary-700: #0F766E (Tombol primer & teks aksen - Rasio 5.47:1)       │
│ Primary-800: #115E59 (Hover tombol primer - Rasio 7.58:1)              │
│                                                                        │
│ PALET STATUS KPSP (WCAG 2.2 AA)                                        │
│ • Sesuai (9-10)       : Latar #F0FDF4, Teks/Ikon #15803D, Border #BBF7D0│
│ • Meragukan (7-8)     : Latar #FFFBEB, Teks/Ikon #B45309, Border #FDE68A│
│ • Penyimpangan (<7)   : Latar #FEF2F2, Teks/Ikon #B91C1C, Border #FECACA│
│                                                                        │
│ TIPOGRAFI & RADIUS                                                     │
│ Font UI: Plus Jakarta Sans / Inter | Angka: tabular-nums              │
│ Radius: sm (8px), md (12px - tombol/input), lg (16px), xl (24px)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Bottom Nav di Mobile vs Drawer Menu Samping**:
  - *Pilihan*: Menghadirkan *Bottom Navigation Bar* tetap di mobile dengan tinggi kompak (<15% viewport) yang memuat tab Beranda, Skrining, Tumbuh, Chat, dan Profil, sementara desktop tetap memakai sidebar collapsible.
  - *Alasan*: Ergonomi satu tangan (thumb zone) sangat krusial bagi orang tua yang sering menggendong bayi saat membuka aplikasi.
- **Keputusan 2: Pemisahan Skor KPSP dari Analisis AI**:
  - *Pilihan*: Skor total dan status (Sesuai/Meragukan/Penyimpangan) dihitung secara instan dan deterministik sesuai standar Depkes KPSP. Panel AI/fallback hanya mengisi rekomendasi aktivitas dan stimulasi dalam bentuk accordion yang dapat dilipat.
  - *Alasan*: Menjamin keandalan klinis tanpa ketergantungan latensi atau halusinasi LLM.
- **Keputusan 3: Penyelarasan Token Tailwind v4 di `src/index.css`**:
  - *Pilihan*: Menambahkan token `@theme` dan variabel CSS `:root` / `.dark` di `src/index.css` sesuai spesifikasi Bagian 2.9 dari design system, didukung `@custom-variant dark`.
  - *Alasan*: Menghilangkan hardcoded hex di berbagai komponen dan menjamin konsistensi kontras WCAG 2.2 AA.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APLIKASI KINDO (REACT 19 SPA)                      │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     Root Layout & Shell (`App.tsx`)                   │  │
│  │  • Desktop Collapsible Sidebar (256px / 80px)                         │  │
│  │  • Mobile Bottom Tab Navigation (Fixed h-16, 5 Tabs)                  │  │
│  │  • Top Header Bar (Child Selector, Theme Toggle, Language ID/EN)      │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │ Navigasi State / View                │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Halaman / Views Utama                         │  │
│  │                                                                       │  │
│  │  ┌────────────────────────┐  ┌─────────────────────────────────────┐  │  │
│  │  │ DashboardView          │  │ QuestionnaireView (Skrining KPSP)   │  │  │
│  │  │ • Hero Skrining Aktif  │  │ • Screen Persiapan Alat KPSP        │  │  │
│  │  │ • Metrik Antropometri  │  │ • One-Question-Per-Screen Card      │  │  │
│  │  │ • GrowthChart WHO Area │  │ • Ringkasan 10 Jawaban Tinjauan     │  │  │
│  │  └────────────────────────┘  └─────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌────────────────────────┐  ┌─────────────────────────────────────┐  │  │
│  │  │ ResultView (Bento Box) │  │ KonsultasiNakesView & PuskesmasMap  │  │  │
│  │  │ • Status Utama + Ring  │  │ • ChatBubble (Kiri/Kanan) & Banner  │  │  │
│  │  │ • 4 Aspek KPSP Cards   │  │ • PuskesmasCard & Filter Lokasi     │  │  │
│  │  │ • Accordion Saran AI   │  │                                     │  │  │
│  │  └────────────────────────┘  └─────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌────────────────────────┐  ┌─────────────────────────────────────┐  │  │
│  │  │ AuthView & Onboarding  │  │ NakesDashboard & AdminDashboard     │  │  │
│  │  │ • 2 Kartu Besar Peran  │  │ • Tabel Pasien (Prioritas Kasus)    │  │  │
│  │  │ • 3-Step Stepper Anak  │  │ • Verifikasi SIP & Audit Log        │  │  │
│  │  └────────────────────────┘  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │                      Komponen Domain & UI KINDO                       │  │
│  │  • StatusBadge (Sesuai/Meragukan/Penyimpangan dengan Ikon & Kontras)  │  │
│  │  • ScoreRing (SVG Radial Progress 0-10)                               │  │
│  │  • AspectCard (4 Aspek: Motorik Kasar, Halus, Bahasa, Sosial)         │  │
│  │  • GrowthChart (Recharts Area + Garis Putus-putus Median WHO)         │  │
│  │  • DisclaimerNote (Peringatan Skrining Bukan Diagnosis Medis)         │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │                Backend Express Server (`server.ts`)                   │  │
│  │  • `/api/analyze-questionnaire` (Gemini 3.8 Flash + Clinical Engine)  │  │
│  │  • `/api/nearby-puskesmas` (Maps / Haversine fallback)                │  │
│  │  • `/api/wilayah/*` (Data wilayah Indonesia berantai)                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Rencana Tahapan Eksekusi

1. **Langkah 1: Konfigurasi Token Desain & Tipografi**
   - Perbarui `src/index.css` dengan token Tailwind v4 (`--color-primary-*`, `--color-secondary-*`, `--radius-*`, `--shadow-*`, netral WCAG AA light & dark).
   - Memastikan font Plus Jakarta Sans dan angka tabular (`tabular-nums`) diaktifkan.

2. **Langkah 2: Shell Aplikasi & Navigasi Mobile**
   - Perbarui `src/App.tsx` untuk menghadirkan **Bottom Navigation Bar** di mobile untuk peran Orang Tua dan Nakes dengan target sentuh $\ge 44\text{px}$.
   - Mempertahankan collapsible sidebar pada desktop dengan logo UMS dan styling Teal `primary-700`.

3. **Langkah 3: Alur Skrining KPSP & Tinjauan Ringkasan**
   - Menambahkan layar persiapan alat sebelum mulai skrining.
   - Memperbarui komponen skrining satu pertanyaan per layar dengan tombol Ya/Tidak (tinggi 56px, icon Check/X).
   - Menambahkan dialog ringkasan 10 jawaban sebelum mengirim skrining.

4. **Langkah 4: Bento Box Hasil Skrining (`ResultView`)**
   - Merombak total tampilan hasil skrining ke format Bento Box: status utama di atas lipatan layar, `ScoreRing` (skor 0-10), 4 kartu aspek berwarna khusus, serta accordion saran AI dengan badge `Local Engine`.
   - Menambahkan `DisclaimerNote` standar pada hasil skrining dan laporan PDF.

5. **Langkah 5: Dashboard Orang Tua & Pemantauan Pertumbuhan**
   - Perbarui kartu metrik, tren antropometri, dan `GrowthChart` dengan garis putus-putus median WHO (`#64748B`), memastikan tanpa label status gizi prematur.
   - Perbarui kartu jadwal skrining berikutnya dan aksi cepat.

6. **Langkah 6: Auth, Chat, Puskesmas, serta Dashboard Nakes & Admin**
   - Terapkan seleksi 2 kartu besar di `AuthView` dan stepper 3 langkah di `ChildOnboardingView`.
   - Perbarui `KonsultasiNakesView` dengan banner darurat dan gelembung chat `primary-700`.
   - Perbarui `NakesDashboardView` dan `AdminDashboardView` dengan styling tabel berdensitas rapi dan prioritas kasus.

7. **Langkah 7: Verifikasi & Audit Kualitas**
   - Jalankan `compile_applet` dan `lint_applet` untuk memastikan zero errors dan type safety pada seluruh halaman.
