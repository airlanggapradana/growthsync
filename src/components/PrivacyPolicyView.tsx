import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, HeartHandshake, Home } from 'lucide-react';
import { applySEO, PAGE_SEO } from '../lib/seo';

export default function PrivacyPolicyView() {
  const navigate = useNavigate();

  useEffect(() => {
    applySEO(PAGE_SEO.privacyPolicy());
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050A07] text-slate-100 font-sans selection:bg-[#d9f99d] selection:text-[#050A07]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#050A07]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
          >
            <img
              src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779549262/ChatGPT_Image_May_23__2026__10_10_14_PM-removebg-preview_k2cxf5.webp"
              alt="Logo Kindo"
              width={28}
              height={28}
              className="h-7 w-auto object-contain brightness-0 invert"
            />
            <span className="font-bold tracking-wider text-sm">KINDO</span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-white/50 flex items-center gap-2">
          <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" /> Beranda
          </Link>
          <span>/</span>
          <span className="text-[#d9f99d] font-medium" aria-current="page">Kebijakan Privasi</span>
        </nav>

        {/* Hero Title */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#d9f99d] text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Privasi & Perlindungan Data Anak
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-4">
            Kebijakan Privasi Kindo
          </h1>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Terakhir diperbarui: 7 November 2026. Kami berkomitmen untuk melindungi privasi Anda serta data tumbuh kembang buah hati Anda dengan standar keamanan tertinggi.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-white/80 leading-relaxed text-sm sm:text-base">
          <section aria-labelledby="section-1" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#d9f99d]">
                <Eye className="w-4 h-4" />
              </div>
              <h2 id="section-1" className="text-xl sm:text-2xl font-semibold text-white">
                1. Informasi yang Kami Kumpulkan
              </h2>
            </div>
            <p className="text-white/70">
              Kindo mengumpulkan informasi yang diperlukan untuk menyelenggarakan pemantauan tumbuh kembang anak berbasis Kuesioner Pra Skrining Perkembangan (KPSP) dari Kementerian Kesehatan RI:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-white/70">
              <li>
                <strong className="text-white">Data Akun Pengguna:</strong> Alamat email, nama lengkap, dan peran pengguna (orang tua atau tenaga kesehatan).
              </li>
              <li>
                <strong className="text-white">Data Profil Anak:</strong> Nama anak (atau inisial), jenis kelamin, dan tanggal lahir untuk menentukan kelompok kuesioner usia yang presisi (0 hingga 72 bulan).
              </li>
              <li>
                <strong className="text-white">Jawaban Kuesioner:</strong> Hasil respon terhadap pertanyaan skrining perkembangan gerak kasar, gerak halus, bahasa/bicara, dan kemandirian/sosial.
              </li>
              <li>
                <strong className="text-white">Data Komunikasi & Telekonsultasi:</strong> Riwayat pesan konsultasi antara orang tua dan tenaga kesehatan resmi (bidan/dokter).
              </li>
            </ul>
          </section>

          <section aria-labelledby="section-2" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#d9f99d]">
                <Database className="w-4 h-4" />
              </div>
              <h2 id="section-2" className="text-xl sm:text-2xl font-semibold text-white">
                2. Penggunaan Informasi
              </h2>
            </div>
            <p className="text-white/70">
              Informasi yang dikumpulkan digunakan semata-mata untuk tujuan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-white/70">
              <li>Menghasilkan analisis evaluasi perkembangan anak yang akurat dan tepat usia.</li>
              <li>Memberikan panduan stimulasi harian terarah bagi orang tua di rumah.</li>
              <li>Memfasilitasi konsultasi daring dengan tenaga kesehatan terverifikasi.</li>
              <li>Membantu pencarian fasilitas kesehatan atau Puskesmas rujukan terdekat secara geografis saat dibutuhkan intervensi lanjutan.</li>
            </ul>
          </section>

          <section aria-labelledby="section-3" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#d9f99d]">
                <Lock className="w-4 h-4" />
              </div>
              <h2 id="section-3" className="text-xl sm:text-2xl font-semibold text-white">
                3. Keamanan Data & Kerahasiaan
              </h2>
            </div>
            <p className="text-white/70">
              Kami menerapkan langkah-langkah teknis dan organisasional yang ketat:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-white/70">
              <li>Data disimpan dalam basis data terenkripsi Google Firebase Cloud Firestore dengan aturan keamanan ketat (Firestore Security Rules).</li>
              <li>Data anak Anda hanya dapat diakses oleh akun orang tua yang bersangkutan dan nakes yang dipilih dalam sesi konsultasi aktif.</li>
              <li>Kindo <strong className="text-white">tidak pernah menjual, menyewakan, atau memperdagangkan</strong> data pribadi Anda atau anak Anda kepada pihak ketiga mana pun.</li>
            </ul>
          </section>

          <section aria-labelledby="section-4" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#d9f99d]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h2 id="section-4" className="text-xl sm:text-2xl font-semibold text-white">
                4. Peran Kecerdasan Buatan (AI)
              </h2>
            </div>
            <p className="text-white/70">
              Kindo memanfaatkan teknologi kecerdasan buatan (Google Gemini API) untuk membantu menyusun ringkasan bahasa yang mudah dimengerti serta mengelompokkan rekomendasi stimulasi. AI bertindak sebagai pendukung edukasi awal dan <strong className="text-white">bukan pengganti diagnosa medis resmi</strong> dari dokter spesialis anak.
            </p>
          </section>

          <section aria-labelledby="section-5" className="space-y-4">
            <h2 id="section-5" className="text-xl sm:text-2xl font-semibold text-white">
              5. Hak Pengguna
            </h2>
            <p className="text-white/70">
              Anda berhak melihat, memperbarui profil anak, serta meminta penghapusan akun beserta riwayat kuesioner kapan saja melalui pengaturan akun atau menghubungi tim pengembang Kindo di Universitas Muhammadiyah Surakarta.
            </p>
          </section>

          <section aria-labelledby="section-6" className="space-y-4 border-t border-white/10 pt-8">
            <h2 id="section-6" className="text-xl sm:text-2xl font-semibold text-white">
              6. Hubungi Kami
            </h2>
            <p className="text-white/70">
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami melalui:
            </p>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white/80 space-y-1">
              <p><strong className="text-white">Tim Pengembang Kindo</strong></p>
              <p>Universitas Muhammadiyah Surakarta (UMS)</p>
              <p>Jl. A. Yani, Pabelan, Kartasura, Sukoharjo, Jawa Tengah 57169</p>
              <p>Situs Web: <a href="https://kindo.fun" className="text-[#d9f99d] underline">https://kindo.fun</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center text-xs text-white/40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Kindo. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms-of-service" className="hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link to="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

