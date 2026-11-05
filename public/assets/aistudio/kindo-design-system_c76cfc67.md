# Design System: GrowthSync (KINDO)

> **Status**: DRAFT v0.2. Keputusan desain sudah dicentang; 3 item peninjauan klinis (Bagian 14) masih menunggu Nakes. Perubahan v0.2: perbaikan 8 pasangan warna yang gagal kontras (Bagian 2).
> **Acuan**: `Overview.md` (arsitektur, peran, alur kerja).
> **Catatan**: Sama seperti Overview, file ini tidak untuk di-commit ke repositori Git.
> **Stack target**: React 19, TypeScript, Vite 6, Tailwind CSS v4, `motion/react`, Recharts, Three.js.

---

## 1. Arah Desain

### 1.1 Prinsip utama

GrowthSync dipakai orang tua yang sedang cemas soal anaknya. Antarmuka harus terasa **tenang, jelas, dan dapat dipercaya**, bukan dramatis.

| Prinsip | Artinya dalam UI | Yang dihindari |
|---|---|---|
| **Tenang, bukan klinis dingin** | Warna teal lembut, ruang kosong lega, sudut membulat | Putih rumah sakit yang steril, merah mencolok |
| **Satu layar, satu keputusan** | Skrining KPSP satu pertanyaan per layar dengan progres jelas | Form panjang 10 pertanyaan sekaligus |
| **Status tidak bergantung warna** | Hijau/kuning/merah selalu disertai ikon dan label teks | Badge yang hanya dibedakan warna |
| **Hasil dulu, penjelasan kemudian** | Bento Box hasil: status besar, lalu aspek, lalu saran AI | Dinding teks Markdown dari AI di atas lipatan layar |
| **Jujur soal batas** | Disclaimer skrining bukan diagnosis, badge "Local Engine" saat fallback | Menyembunyikan asal analisis |
| **Mobile-first untuk orang tua** | Bottom nav, target sentuh besar, satu tangan | Sidebar desktop yang dipaksakan ke ponsel |

### 1.2 Karakter visual

- **Referensi gaya**: SaaS kesehatan modern (kartu bersih, bento layout, data viz minimalis, tipografi humanis).
- **Mood**: hangat, profesional, ramah keluarga.
- **Bentuk**: radius sedang-besar, bayangan sangat halus, border tipis sebagai pemisah utama.
- **Ilustrasi**: bentuk organik sederhana (lingkaran, blob lembut). Hindari ilustrasi anak yang terlalu kartun agar tetap kredibel bagi Nakes.

### 1.3 Pendekatan per peran

| Peran | Perangkat dominan | Layout | Kepadatan informasi |
|---|---|---|---|
| Orang Tua | Ponsel | Bottom nav + konten satu kolom | Rendah, tindakan besar |
| Nakes | Laptop/tablet | Sidebar + tabel/daftar pasien | Sedang-tinggi |
| Admin | Desktop | Sidebar + dashboard statistik | Tinggi |

---

## 2. Design Tokens

Semua token didefinisikan sebagai CSS variable via Tailwind v4 `@theme`, lalu dipakai lewat utility class. Jangan hardcode hex di komponen.

### 2.1 Warna brand

**Primary: Teal** (kesehatan, ketenangan, tidak identik dengan merah darurat)

| Token | Hex | Penggunaan |
|---|---|---|
| `primary-50` | `#F0FDFA` | Latar section lembut |
| `primary-100` | `#CCFBF1` | Hover ringan, chip aktif |
| `primary-200` | `#99F6E4` | Border fokus lembut |
| `primary-300` | `#5EEAD4` | Aksen dark mode |
| `primary-400` | `#2DD4BF` | Ilustrasi, progress (non-teks) |
| `primary-500` | `#14B8A6` | Dekoratif saja (ilustrasi, area gradien). **Bukan** untuk teks atau garis grafik (2.49:1 di putih) |
| `primary-600` | `#0D9488` | Ikon dan garis grafik (3.74:1 di putih). **Bukan** untuk teks (di bawah 4.5:1) |
| `primary-700` | `#0F766E` | **Tombol primer** (teks putih, 5.47:1) dan **semua link/teks aksen** (5.47:1 di putih) |
| `primary-800` | `#115E59` | Hover tombol primer |
| `primary-900` | `#134E4A` | Teks di atas latar primary-50 |

**Secondary: Sky** untuk informasi, link sekunder, dan data tinggi badan.

| Token | Hex |
|---|---|
| `secondary-50` | `#F0F9FF` |
| `secondary-500` | `#0EA5E9` |
| `secondary-700` | `#0369A1` |

### 2.2 Warna status KPSP (semantik)

| Status | Skor | Latar | Teks/ikon | Border | Ikon | Label ID |
|---|---|---|---|---|---|---|
| Sesuai | 9-10 | `#F0FDF4` | `#15803D` | `#BBF7D0` | `CheckCircle2` | Perkembangan Sesuai |
| Meragukan | 7-8 | `#FFFBEB` | `#B45309` | `#FDE68A` | `AlertTriangle` | Perlu Stimulasi Tambahan |
| Penyimpangan | <7 | `#FEF2F2` | `#B91C1C` | `#FECACA` | `AlertOctagon` | Disarankan Rujukan Medis |

> Nada kata untuk status merah: **"Disarankan konsultasi"**, bukan "Anak Anda bermasalah". Orang tua yang cemas harus langsung melihat langkah berikutnya (tombol Chat Nakes / Puskesmas Terdekat).

### 2.3 Warna 4 aspek KPSP

Dipakai konsisten di Bento Box hasil, ikon aspek, dan legenda.

| Aspek | Warna | Hex (ikon/grafik) | Latar |
|---|---|---|---|
| Gerak Kasar | Teal | `#0D9488` | `#F0FDFA` |
| Gerak Halus | Sky | `#0284C7` | `#F0F9FF` |
| Bicara & Bahasa | Violet | `#7C3AED` | `#F5F3FF` |
| Sosialisasi & Kemandirian | Amber | `#B45309` | `#FFFBEB` |

### 2.4 Warna grafik pertumbuhan

| Metrik | Warna | Gaya garis |
|---|---|---|
| Berat Badan (kg) | `#0D9488` | Solid + area gradien 15% |
| Tinggi Badan (cm) | `#0284C7` | Solid + area gradien 15% |
| Lingkar Kepala (cm) | `#7C3AED` | Solid + area gradien 15% |
| Median WHO | `#64748B` | **Putus-putus**, tanpa area |

Dark mode: BB `#2DD4BF`, TB `#38BDF8`, LK `#A78BFA`, median `#8190A8`.

Pembeda metrik tidak hanya warna: tambahkan bentuk titik berbeda (lingkaran, kotak, segitiga) untuk aksesibilitas.

### 2.5 Netral

| Token | Light | Dark |
|---|---|---|
| `bg-app` | `#F8FAFC` | `#0B1220` |
| `bg-surface` (kartu) | `#FFFFFF` | `#111A2B` |
| `bg-surface-raised` | `#FFFFFF` | `#16223A` |
| `bg-subtle` | `#F1F5F9` | `#1B2942` |
| `border-default` | `#E2E8F0` | `#25344F` |
| `border-strong` (border input/kontrol) | `#7C8BA1` | `#5B6F92` |
| `text-primary` | `#0F172A` | `#F1F5F9` |
| `text-secondary` | `#475569` | `#A8B5CA` |
| `text-muted` | `#5B6B82` | `#8E9CB3` |

### 2.6 Kontras (sudah dihitung)

- Target: **WCAG 2.2 AA** (teks normal 4.5:1, komponen UI dan grafik 3:1).
- Rasio dihitung dengan rumus luminansi relatif WCAG (skrip Python, 2026-11-05) terhadap 31 pasangan warna di draft ini. Ini perhitungan matematis, bukan audit visual atau uji dengan pengguna.
- **Temuan dan perbaikan** (draft v0.1 awal gagal di 8 pasangan):

| Pasangan | Sebelum | Sesudah |
|---|---|---|
| Teks/link `primary-600` di putih | 3.74:1 (gagal) | Pakai `primary-700`: 5.47:1 |
| `text-muted` light di `bg-subtle` | 4.34:1 (gagal) | `#5B6B82`: 4.95:1 |
| `text-muted` dark di `bg-subtle` | 4.50:1 (batas) | `#8E9CB3`: 5.24:1 |
| Border input light `#CBD5E1` | 1.48:1 (gagal, min 3:1) | `#7C8BA1`: 3.46:1 |
| Border input dark `#364866` | 1.89:1 (gagal) | `#5B6F92`: 3.43:1 |
| Garis grafik BB `#14B8A6` | 2.49:1 (gagal) | `#0D9488`: 3.74:1 |
| Garis grafik TB `#0EA5E9` | 2.77:1 (gagal) | `#0284C7`: 4.10:1 |
| Garis median WHO `#94A3B8` | 2.56:1 (gagal) | `#64748B`: 4.76:1 |

- **Lolos tanpa perubahan**: tombol primer 5.47:1, hover 7.58:1, tombol danger 6.47:1, badge unread 4.83:1, status Sesuai 4.79:1, Meragukan 4.84:1, Penyimpangan 5.91:1, `text-primary`/`text-secondary` di semua latar, status dark mode (8.07-9.78:1).
- Catatan: `border-default` (`#E2E8F0`) sengaja tidak dihitung karena hanya pemisah dekoratif, bukan batas kontrol.
- Pasangan baru aspek KPSP (ikon di latar tint) dicek ulang: teal 3.59:1, sky 3.84:1, violet 5.20:1, amber 4.84:1. Semua di atas 3:1 untuk ikon/grafik.
- Rasio hanya memastikan keterbacaan secara matematis. Uji dengan pengguna low-vision dan layar ponsel di bawah cahaya terang tetap disarankan.

### 2.7 Tipografi

| Peran | Font | Fallback |
|---|---|---|
| UI & heading | **Plus Jakarta Sans** | `Inter, system-ui, sans-serif` |
| Angka data (opsional) | Plus Jakarta Sans dengan `tabular-nums` | - |

Alasan: Plus Jakarta Sans terbaca baik untuk bahasa Indonesia dan terasa hangat. Pilihan ini bersifat estetis, boleh diganti Inter bila ingin lebih netral.

| Token | Ukuran / line-height | Berat | Penggunaan |
|---|---|---|---|
| `display` | 40 / 48 | 800 | Hero landing (desktop) |
| `h1` | 30 / 38 | 700 | Judul halaman |
| `h2` | 24 / 32 | 700 | Judul section |
| `h3` | 20 / 28 | 600 | Judul kartu |
| `body-lg` | 18 / 28 | 400 | Teks pertanyaan KPSP |
| `body` | 16 / 24 | 400 | Teks umum |
| `body-sm` | 14 / 20 | 400 | Keterangan |
| `caption` | 12 / 16 | 500 | Label kecil, badge |
| `metric` | 32 / 40 | 700, `tabular-nums` | Angka statistik |

Aturan:
- Teks pertanyaan KPSP memakai `body-lg` agar nyaman dibaca sambil memegang anak.
- Ukuran dasar input **16px** supaya iOS tidak zoom otomatis.
- Terjemahan EN sering lebih panjang atau lebih pendek dari ID. Jangan memberi lebar tetap pada tombol dan tab.

### 2.8 Spasi, radius, bayangan

**Spasi** (basis 4px): `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
Padding kartu: 20px (mobile), 24px (desktop). Jarak antar kartu: 16px / 24px.

| Radius | Nilai | Penggunaan |
|---|---|---|
| `radius-sm` | 8px | Badge, chip kecil |
| `radius-md` | 12px | Input, tombol |
| `radius-lg` | 16px | Kartu |
| `radius-xl` | 24px | Kartu hero, Bento utama, modal |
| `radius-full` | 9999px | Avatar, pill |

| Bayangan | Nilai | Penggunaan |
|---|---|---|
| `shadow-card` | `0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.06)` | Kartu default |
| `shadow-raised` | `0 4px 12px rgb(15 23 42 / 0.08)` | Kartu hover, dropdown |
| `shadow-modal` | `0 16px 40px rgb(15 23 42 / 0.16)` | Modal, sheet |

Di dark mode, kurangi bayangan dan andalkan perbedaan `bg-surface` vs `bg-app` serta border.

### 2.9 Implementasi token (Tailwind v4)

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --font-sans: "Plus Jakarta Sans", "Inter", system-ui, sans-serif;

  --color-primary-50:  #F0FDFA;
  --color-primary-100: #CCFBF1;
  --color-primary-200: #99F6E4;
  --color-primary-300: #5EEAD4;
  --color-primary-400: #2DD4BF;
  --color-primary-500: #14B8A6;
  --color-primary-600: #0D9488;
  --color-primary-700: #0F766E;
  --color-primary-800: #115E59;
  --color-primary-900: #134E4A;

  --color-secondary-50:  #F0F9FF;
  --color-secondary-500: #0EA5E9; /* dekoratif; untuk garis/ikon pakai #0284C7 */
  --color-secondary-700: #0369A1;

  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --shadow-card:   0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.06);
  --shadow-raised: 0 4px 12px rgb(15 23 42 / 0.08);
  --shadow-modal:  0 16px 40px rgb(15 23 42 / 0.16);
}

/* Token semantik yang berganti per tema */
:root {
  --bg-app: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-subtle: #F1F5F9;
  --border-default: #E2E8F0;
  --border-strong: #7C8BA1;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #5B6B82;
}
.dark {
  --bg-app: #0B1220;
  --bg-surface: #111A2B;
  --bg-subtle: #1B2942;
  --border-default: #25344F;
  --border-strong: #5B6F92;
  --text-primary: #F1F5F9;
  --text-secondary: #A8B5CA;
  --text-muted: #8E9CB3;
}

@custom-variant dark (&:where(.dark, .dark *));
```

---

## 3. Komponen Inti

### 3.1 Struktur folder yang disarankan

```
src/components/
├── ui/                     # Primitif generik (tanpa logika bisnis)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Input.tsx / Select.tsx / Textarea.tsx
│   ├── Modal.tsx / BottomSheet.tsx
│   ├── Tabs.tsx
│   ├── Alert.tsx
│   ├── Avatar.tsx
│   ├── Skeleton.tsx
│   ├── EmptyState.tsx
│   ├── Stepper.tsx
│   └── Toast.tsx
├── domain/                 # Komponen khusus GrowthSync
│   ├── StatusBadge.tsx         # Sesuai / Meragukan / Penyimpangan
│   ├── AspectCard.tsx          # 4 aspek KPSP
│   ├── QuestionCard.tsx        # Satu pertanyaan KPSP
│   ├── ScoreRing.tsx           # Lingkaran skor 0-10
│   ├── GrowthChart.tsx         # Recharts + median WHO
│   ├── ChildSwitcher.tsx
│   ├── ChatBubble.tsx / ChatComposer.tsx
│   ├── PuskesmasCard.tsx
│   ├── AiAnalysisPanel.tsx     # Render Markdown + badge Local Engine
│   └── DisclaimerNote.tsx
└── (view yang sudah ada: DashboardView, AuthView, dst.)
```

> Saran: pindahkan primitif ke `ui/` secara bertahap. Jangan refactor semua view sekaligus.

### 3.2 Button

| Varian | Tampilan | Penggunaan |
|---|---|---|
| `primary` | Latar `primary-700`, teks putih | Satu aksi utama per layar |
| `secondary` | Latar `primary-50`, teks `primary-800`, border `primary-200` | Aksi pendukung |
| `outline` | Transparan, border `border-strong` | Aksi netral |
| `ghost` | Tanpa latar | Aksi tersier, ikon |
| `danger` | Latar `#B91C1C`, teks putih | Hapus profil anak |

- Ukuran: `sm` 36px, `md` 44px, `lg` 52px. **Minimum target sentuh 44px.**
- Radius `radius-md`. State: hover (satu tingkat lebih gelap), focus-visible (ring 2px `primary-400` + offset 2px), disabled (opasitas 50%, tanpa pointer), loading (spinner + teks tetap).
- Tombol CTA di layar skrining dan hasil: lebar penuh pada mobile.

### 3.3 Card dan Bento Box

- Kartu: `bg-surface`, border `border-default`, `radius-lg`, `shadow-card`.
- Kartu interaktif: hover naik `shadow-raised`, tanpa transformasi besar.
- **Bento Box hasil skrining** (grid 12 kolom desktop, tumpuk di mobile):

```
┌───────────────────────────┬──────────────────┐
│  STATUS UTAMA (col 8)     │  SKOR (col 4)    │
│  Ikon + label + 1 kalimat │  ScoreRing 8/10  │
│  [Chat Nakes] [Puskesmas] │                  │
├─────────────┬─────────────┼─────────┬────────┤
│ Gerak Kasar │ Gerak Halus │ Bicara  │ Sosial │
│ (col 3)     │ (col 3)     │ (col 3) │ (col 3)│
├─────────────┴─────────────┴─────────┴────────┤
│  SARAN STIMULASI (AI)  [ID | EN]  badge mesin│
│  Markdown ringkas, bisa dilipat per aspek    │
├──────────────────────────────────────────────┤
│  [Simpan Rekap]  [Unduh PDF]                 │
└──────────────────────────────────────────────┘
```

Aturan Bento:
- Status utama dan tombol tindak lanjut selalu **di atas lipatan layar**.
- Saran AI dilipat per aspek (accordion) agar tidak menjadi dinding teks.
- Badge `Local Engine` tampil jika `isFallback = true`, dengan tooltip: "Analisis dibuat oleh mesin lokal karena layanan AI sedang tidak tersedia."

### 3.4 Badge dan Alert

- `StatusBadge`: pill `radius-full`, ikon 16px + label, mengikuti tabel 2.2.
- `Alert` varian `info`, `success`, `warning`, `danger`: ikon di kiri, judul tebal, isi `body-sm`.
- **Alert alat KPSP** (sebelum mulai skrining): varian `info`, daftar alat dengan ikon kecil per alat (benang wol, kubus, pensil, kertas).
- `DisclaimerNote`: varian `info` kecil, wajib muncul di halaman hasil dan di PDF.

### 3.5 Form

- Label di atas input, teks bantu di bawah, error dengan ikon + teks (bukan hanya border merah).
- Input tinggi 48px, radius 12px, border `border-strong`, fokus ring `primary-400`.
- Form wilayah bertingkat (Provinsi → Kab/Kota → Kecamatan → Desa): Select berantai, tiap level dinonaktifkan sampai level sebelumnya dipilih, dengan skeleton saat memuat dari `/api/wilayah/*`.
- Form pengukuran antropometri: satu input per baris di mobile, satuan (kg/cm) sebagai suffix di dalam input.
- Validasi rentang wajar (misal berat 1-30 kg untuk usia 3-72 bulan) dengan peringatan lunak, bukan blokir keras. **Rentang pastinya perlu divalidasi tenaga kesehatan.**

### 3.6 Navigasi

| Peran | Desktop | Mobile |
|---|---|---|
| Orang Tua | Sidebar kiri 256px (collapsible) | Bottom nav 4-5 item: Beranda, Skrining, Tumbuh, Chat, Profil |
| Nakes | Sidebar: Pasien, Klaim, Chat, Profil | Bottom nav 4 item |
| Admin | Sidebar: Statistik, Verifikasi, Registrasi Nakes, Log Audit | Sheet menu |

- Item aktif: latar `primary-50`, teks `primary-800`, indikator 3px di sisi.
- Badge unread chat: bulatan `#DC2626` dengan angka (maks "99+"), konsisten di sidebar dan bottom nav.
- Pemilih bahasa ID/EN dan toggle tema ada di header (desktop) atau halaman Profil (mobile).

---

## 4. Spesifikasi Layar Utama

### 4.1 Landing

- Hero dua kolom: teks + CTA ("Mulai Skrining Gratis", "Pelajari KPSP") dan kanvas 3D.
- **Three.js hanya hiasan.** Wajib: `prefers-reduced-motion` menonaktifkan animasi; ganti dengan gambar statis di perangkat lemah atau mode hemat data; lazy-load komponen 3D.
- Section: Masalah yang diselesaikan (3 kartu), Cara kerja (4 langkah), Fitur (bento), Keandalan (fallback AI), Untuk Nakes, CTA akhir.
- Peringatan performa: pengguna target banyak memakai ponsel kelas menengah dan jaringan terbatas. Ukur LCP sebelum mempertahankan kanvas 3D di hero.

### 4.2 Auth dan Onboarding

- Kartu tengah maks 440px. Pilihan peran sebagai **dua kartu besar** (Orang Tua / Tenaga Kesehatan), bukan dropdown.
- Registrasi Nakes menampilkan Alert: "Akun akan aktif setelah SIP diverifikasi admin."
- Onboarding anak: stepper 3 langkah (Identitas → Pengukuran → Selesai). Tampilkan estimasi usia otomatis dari tanggal lahir.

### 4.3 Dashboard Orang Tua

Urutan prioritas (atas ke bawah):
1. Sapaan + `ChildSwitcher` (avatar anak, nama, usia dalam bulan).
2. Kartu **"Skrining berikutnya"**: usia KPSP yang sesuai + tombol Mulai.
3. Ringkasan terbaru: status skrining terakhir (`StatusBadge`) + tanggal.
4. Kartu metrik: BB, TB, LK terakhir dengan tren kecil (sparkline).
5. Kurva pertumbuhan dengan filter metrik (chip: Semua / BB / TB / LK).
6. Aksi cepat: Chat Nakes, Puskesmas Terdekat.

### 4.4 Skrining KPSP

- **Satu pertanyaan per layar.** Header: "Pertanyaan 4 dari 10" + progress bar tipis.
- `QuestionCard`: teks `body-lg`, gambar ilustrasi (jika ada) dengan teks alternatif, dua tombol besar berdampingan **Ya** / **Tidak** (tinggi 56px, bukan hanya warna: ikon centang dan silang).
- Tombol "Kembali" selalu tersedia. Jawaban disimpan otomatis per langkah agar tidak hilang jika tab tertutup.
- Layar awal menampilkan alat yang perlu disiapkan; tombol "Mulai" aktif setelah orang tua mencentang "Alat sudah siap" (opsional, uji dengan pengguna).
- Layar ringkasan sebelum kirim: daftar 10 jawaban yang bisa diedit.
- Saat memanggil `/api/analyze-questionnaire`: skeleton Bento dengan pesan "Menyusun saran stimulasi…". Skor dan status dari aturan KPSP ditampilkan **langsung tanpa menunggu AI**; hanya panel saran yang memuat.

### 4.5 Pemantauan Pertumbuhan

- `GrowthChart` (Recharts `AreaChart`): sumbu X usia (bulan), garis median WHO putus-putus, tooltip menampilkan nilai anak vs median.
- Di mobile, grafik tinggi 240px, dapat digeser horizontal; tabel data tersedia sebagai alternatif aksesibel ("Lihat tabel").
- Form tambah pengukuran dalam `BottomSheet` (mobile) atau `Modal` (desktop).
- Penting: grafik berbasis median saja tidak menunjukkan persentil atau z-score. Teks UI jangan menyimpulkan "normal"/"stunting" dari posisi relatif median. Pernyataan status gizi sebaiknya melalui Nakes. **Perlu dikonfirmasi dengan tenaga medis** sebelum menambah label status gizi.

### 4.6 Telekonsultasi

- Layout dua panel di desktop (daftar kontak + percakapan), satu panel bergantian di mobile.
- `ChatBubble`: pesan sendiri di kanan (`primary-700`, teks putih), pesan lawan di kiri (`bg-subtle`). Radius 16px dengan sudut ekor 4px. Waktu dan status baca di bawah, `caption`.
- Daftar kontak dikelompokkan per profesi (Dokter Spesialis Anak, Bidan Desa, Ahli Gizi, Kader Posyandu) dengan header kelompok.
- Banner tetap di atas chat: "Chat ini bukan untuk kondisi darurat. Hubungi 119 atau datang ke IGD."
- Composer: textarea auto-resize, tombol kirim ikon, `Enter` kirim, `Shift+Enter` baris baru.

### 4.7 Puskesmas Finder

- Modal layar penuh di mobile, split view di desktop (daftar kiri, peta kanan).
- `PuskesmasCard`: nama, jarak, alamat ringkas, tombol "Rute" dan "Telepon" bila ada.
- Banner status sumber data: bila GPS ditolak dan koordinat default Jakarta dipakai, tampilkan Alert warning: **"Lokasi Anda tidak terdeteksi. Hasil ditampilkan untuk Jakarta."** dengan tombol "Atur lokasi manual". Tanpa ini pengguna di luar Jakarta bisa salah paham.
- Polyline rute: `secondary-500`, tebal 5px; marker terpilih berwarna `primary-700`.

### 4.8 Dashboard Nakes

- Header ringkasan: jumlah pasien, pesan belum dibaca, skrining berstatus Meragukan/Penyimpangan.
- Daftar pasien berupa **tabel** di desktop (nama anak, usia, orang tua, status terakhir, tanggal) dengan pencarian dan filter status; kartu di mobile.
- Status akun belum terverifikasi: panel penuh "Menunggu verifikasi SIP" dan aksi klaim pasien dinonaktifkan.
- Prioritas visual: pasien berstatus Penyimpangan diurutkan paling atas secara default.

### 4.9 Dashboard Admin

- Baris kartu metrik (pengguna, nakes terverifikasi, skrining bulan ini, rasio fallback AI).
- Antrean verifikasi SIP: tabel dengan aksi Verifikasi/Tolak. Tolak mewajibkan alasan (masuk `adminLogs.details`).
- Log audit: tabel dengan filter aksi dan rentang tanggal.
- Aksi destruktif memakai dialog konfirmasi dengan ringkasan target.

---

## 5. Data Visualization

- Gaya: grid horizontal tipis `border-default`, tanpa border sumbu, label `caption` `text-muted`.
- Maksimal 3 seri sekaligus selain median WHO.
- Tooltip: kartu kecil `shadow-raised`, tampilkan usia, nilai anak, nilai median, selisih.
- State kosong grafik: ilustrasi kecil + "Belum ada pengukuran. Tambahkan pengukuran pertama."
- Satuan selalu di judul sumbu atau tooltip.

---

## 6. Motion

Gunakan `motion/react` secukupnya.

| Interaksi | Durasi | Easing |
|---|---|---|
| Hover/tekan tombol | 120ms | ease-out |
| Transisi antar pertanyaan KPSP | 200ms (geser + fade) | ease-in-out |
| Modal / bottom sheet | 240ms | ease-out |
| Munculnya Bento hasil | 300ms, stagger 50ms per kartu | ease-out |
| ScoreRing terisi | 600ms | ease-out |

- Hormati `prefers-reduced-motion`: ganti geser/skala dengan fade singkat atau tanpa animasi.
- Tidak ada animasi berulang di layar hasil skrining (orang tua sedang membaca informasi sensitif).

---

## 7. Aksesibilitas

| Area | Aturan |
|---|---|
| Kontras | WCAG 2.2 AA (lihat 2.6) |
| Fokus | Ring jelas di semua elemen interaktif, urutan tab logis |
| Status | Ikon + teks, tidak hanya warna |
| Target sentuh | Minimum 44x44px |
| Form | Label terhubung, error diumumkan (`aria-live="polite"`) |
| Grafik | Ringkasan teks + tabel data alternatif |
| Gambar KPSP | Teks alternatif deskriptif |
| Peta | Daftar Puskesmas bisa dipakai tanpa peta |
| Chat | Pesan baru diumumkan ke screen reader tanpa mengganggu pengetikan |
| Zoom | Tata letak tetap utuh pada zoom 200% |
| Bahasa | Atribut `lang` mengikuti pilihan ID/EN |

---

## 8. Konten dan Nada Bahasa

| Situasi | Hindari | Gunakan |
|---|---|---|
| Hasil merah | "Anak Anda mengalami keterlambatan" | "Beberapa kemampuan belum terlihat sesuai usia. Kami menyarankan konsultasi dengan tenaga kesehatan." |
| Hasil kuning | "Hasil buruk" | "Perlu dilatih lebih sering. Berikut kegiatan yang bisa dicoba di rumah." |
| Hasil hijau | "Anak pasti normal" | "Perkembangan sesuai tahapan usia. Lanjutkan stimulasi dan pantau berkala." |
| Fallback AI | Diam-diam mengganti sumber | "Analisis dibuat oleh mesin lokal." |
| Error jaringan | "Error 500" | "Koneksi bermasalah. Jawaban Anda tersimpan, coba lagi." |

- Disclaimer standar (halaman hasil + PDF): *"Hasil ini adalah skrining awal, bukan diagnosis. Keputusan klinis tetap berada pada tenaga kesehatan."*
- Semua teks lewat i18n (`id`/`en`). Tidak ada string hardcode di komponen.

---

## 9. Dark Mode

- Mengikuti preferensi sistem, bisa diganti manual, disimpan di `localStorage`.
- Status KPSP di dark mode: latar berupa warna status pada opasitas 12-16% di atas `bg-surface`, teks tint lebih terang (`green-300`, `amber-300`, `red-300`).
- Grafik: pertahankan warna seri, terangkan sedikit (satu tingkat), grid memakai `border-default` dark.
- Hindari putih murni `#FFFFFF` untuk teks besar di dark mode agar tidak silau.

---

## 10. Laporan PDF (jsPDF + html-to-image)

- Satu halaman A4 utama: kop (logo + nama anak + usia + tanggal), status besar, skor, tabel 4 aspek, ringkasan saran, disclaimer, footer "Dibuat oleh GrowthSync".
- Pakai skema warna cetak aman hitam-putih: status tetap terbaca lewat ikon dan label.
- Font sistem atau font yang di-embed; uji karakter Indonesia dan tanda baca.
- Hindari bayangan dan gradien di area cetak.
- Data identitas anak sensitif: tampilkan seperlunya (nama, usia), tanpa alamat lengkap.

---

## 11. Keamanan dan Privasi dalam UI

Bagian ini menyangkut desain karena data anak dan kesehatan bersifat sensitif.

- Konfirmasi eksplisit sebelum menghapus profil anak (dan jelaskan dampaknya pada riwayat skrining).
- Indikator "Data tersimpan di perangkat dan cloud" pada fitur antropometri hibrida.
- Nakes hanya melihat data pasien yang diklaim; UI jangan menampilkan daftar orang tua lain.
- Kunci API Maps dibatasi per domain/referrer di Google Cloud. Perhatikan bahwa kunci Maps JS di sisi klien **selalu terlihat** oleh pengguna, jadi pembatasan itu satu-satunya pengaman.
- Pesan chat berisi data kesehatan: pastikan aturan Firestore membatasi baca hanya untuk pengirim dan penerima. Ini perlu diaudit terpisah.

---

## 12. Catatan Risiko pada Overview (Perlu Verifikasi)

Temuan saat membaca Overview yang memengaruhi desain:

1. **Nama model "Gemini 3.8 Flash"** muncul berulang. Saya tidak bisa memverifikasi nama model ini, jadi cek kembali ke dokumentasi Google AI Studio agar string model di kode dan dokumen benar.
2. **Analisis AI untuk skrining anak adalah konten medis.** Desain di dokumen ini memisahkan skor/status (deterministik dari aturan KPSP) dari saran AI (bantuan). Pastikan arsitektur kode memang begitu, jangan sampai status ditentukan oleh LLM.
3. **Fallback koordinat Jakarta** berisiko menyesatkan pengguna di luar Jakarta; sudah ditangani lewat banner di 4.7.
4. **Haversine "dari database koordinat" saat offline** hanya sebaik data Puskesmas yang tersimpan. Cakupan dan kemutakhiran data itu tidak dijelaskan di Overview. Perlu dicek sebelum UI menjanjikan "Puskesmas terdekat".
5. **Penyimpanan hibrida `localStorage` + Firestore** berpotensi konflik data antar perangkat. Desain perlu state "Menyinkronkan…" dan aturan penyelesaian konflik.
6. **Kurva WHO** dalam Overview menyebut median. Untuk interpretasi gizi diperlukan persentil/z-score (standar WHO). Jangan menampilkan label status gizi sebelum ada validasi klinis.

---

## 13. Rencana Implementasi Bertahap

| Fase | Isi | Hasil |
|---|---|---|
| 1 | Token (`@theme`), font, dark mode, `Button`, `Card`, `Badge`, `Alert`, `Input` | Fondasi konsisten |
| 2 | `StatusBadge`, `QuestionCard`, `Stepper`, `ScoreRing`, alur skrining + Bento hasil | Alur inti selesai |
| 3 | `GrowthChart`, form antropometri, dashboard orang tua | Pemantauan tumbuh kembang |
| 4 | Chat, `PuskesmasCard`, modal peta | Konsultasi dan faskes |
| 5 | Dashboard Nakes dan Admin (tabel, filter, konfirmasi) | Peran non-orang-tua |
| 6 | Landing, PDF, polishing aksesibilitas, audit kontras | Rilis |

---

## 14. Checklist Review Sebelum Finalisasi

Status per 2026-11-05. Item bertanda [x] sudah diputuskan atau diverifikasi. Item bertanda [ ] **belum boleh dicentang** karena butuh pihak di luar dokumen ini.

- [x] Palet teal + sky disetujui
- [x] Font: Plus Jakarta Sans (fallback Inter)
- [x] Skrining satu pertanyaan per layar disetujui
- [x] Kanvas 3D di landing: **dipertahankan** dengan syarat lazy-load, gambar statis sebagai fallback di perangkat lemah dan `prefers-reduced-motion`, serta LCP diukur sebelum rilis. Jika LCP buruk di ponsel kelas menengah, ganti ke statis.
- [ ] Nada bahasa hasil (hijau/kuning/merah) ditinjau Nakes. **Menunggu**: perlu bidan/dokter anak membaca tabel di Bagian 8.
- [ ] Disclaimer dan teks darurat ditinjau Nakes. **Menunggu**: perlu peninjau yang sama; nomor darurat 119 juga perlu dikonfirmasi.
- [x] Rasio kontras diverifikasi (perhitungan WCAG, lihat 2.6). 8 pasangan gagal sudah diperbaiki; aspek KPSP di latar tint: teal 3.59:1, sky 3.84:1, violet 5.20:1, amber 4.84:1 (ikon/grafik, min 3:1). Uji visual di perangkat nyata belum dilakukan.
- [ ] Rentang validasi antropometri dikonfirmasi tenaga medis. **Menunggu**: tidak boleh memakai angka tebakan.
- [x] Keputusan label status gizi: **tidak ada** di versi ini. Grafik hanya menampilkan data anak dan median WHO tanpa label "normal/stunting". Ditinjau ulang bila persentil/z-score WHO sudah diimplementasikan dan divalidasi Nakes.
