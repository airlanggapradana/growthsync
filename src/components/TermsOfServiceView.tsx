import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, Stethoscope, Home } from 'lucide-react';
import { applySEO, PAGE_SEO } from '../lib/seo';

export default function TermsOfServiceView() {
  const navigate = useNavigate();

  useEffect(() => {
    applySEO(PAGE_SEO.termsOfService());
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
          <span className="text-[#d9f99d] font-medium" aria-current="page">Syarat dan Ketentuan</span>
        </nav>

        {/* Hero Title */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#d9f99d] text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            Ketentuan Layanan Platform
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-4">
            Syarat dan Ketentuan Layanan
          </h1>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Terakhir diperbarui: 7 November 2026. Mohon baca syarat dan ketentuan ini dengan saksama sebelum menggunakan layanan Kindo.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-white/80 leading-relaxed text-sm sm:text-base">
          <section aria-labelledby="tos-1" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#d9f99d]">
                <FileText className="w-4 h-4" />
              </div>
              <h2 id="tos-1" className="text-xl sm:text-2xl font-semibold text-white">
                1. Penerimaan Ketentuan
              </h2>
            </div>
            <p className="text-white/70">
              Dengan mengakses dan mendaftar di platform Kindo (<a href="https://kindo.fun" className="text-[#d9f99d] underline">kindo.fun</a>), Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, Anda disarankan untuk tidak menggunakan platform ini.
            </p>
          </section>

          <section aria-labelledby="tos-2" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#d9f99d]">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h2 id="tos-2" className="text-xl sm:text-2xl font-semibold text-white">
                2. Sifat Layanan Medis & Deteksi Dini
              </h2>
            </div>
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 space-y-2 text-sm">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Pemberitahuan Medis Penting
              </div>
              <p>
                Kindo adalah instrumen skrining mandiri digital berbasis KPSP Kementerian Kesehatan RI. Hasil kuisioner, skor evaluasi, dan analisis kecerdasan buatan bersifat sebagai <strong>deteksi dini dan bahan edukasi</strong>, bukan diagnosa medis definitif.
              </p>
            </div>
            <p className="text-white/70">
              Pengguna disarankan untuk selalu mengonfirmasikan hasil evaluasi perkembangan kepada dokter spesialis anak, dokter umum, bidan di Posyandu, atau fasilitas kesehatan primer (Puskesmas).
            </p>
          </section>

          <section aria-labelledby="tos-3" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#d9f99d]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 id="tos-3" className="text-xl sm:text-2xl font-semibold text-white">
                3. Akun dan Tanggung Jawab Pengguna
              </h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-white/70">
              <li>Pengguna wajib memberikan data yang jujur dan akurat saat mengisi tanggal lahir dan respon kuesioner anak agar evaluasi tepat sasaran.</li>
              <li>Pengguna bertanggung jawab penuh atas keamanan kata sandi dan aktivitas yang dilakukan melalui akun pribadinya.</li>
              <li>Tenaga kesehatan yang tergabung di Kindo wajib memiliki kualifikasi atau izin praktik yang sah sesuai peraturan perundang-undangan di Indonesia.</li>
            </ul>
          </section>

          <section aria-labelledby="tos-4" className="space-y-4">
            <h2 id="tos-4" className="text-xl sm:text-2xl font-semibold text-white">
              4. Biaya Layanan
            </h2>
            <p className="text-white/70">
              Platform Kindo dapat diakses dan digunakan secara <strong className="text-white">gratis</strong> oleh orang tua untuk pengisian kuisioner KPSP, penerimaan laporan AI, panduan stimulasi, serta komunikasi telekonsultasi tumbuh kembang anak.
            </p>
          </section>

          <section aria-labelledby="tos-5" className="space-y-4">
            <h2 id="tos-5" className="text-xl sm:text-2xl font-semibold text-white">
              5. Hak Kekayaan Intelektual
            </h2>
            <p className="text-white/70">
              Seluruh kode sumber, desain grafis, logo Kindo, serta materi pendukung dikembangkan oleh tim mahasiswa Universitas Muhammadiyah Surakarta dan dilindungi oleh undang-undang hak cipta yang berlaku di Republik Indonesia.
            </p>
          </section>

          <section aria-labelledby="tos-6" className="space-y-4 border-t border-white/10 pt-8">
            <h2 id="tos-6" className="text-xl sm:text-2xl font-semibold text-white">
              6. Perubahan Ketentuan
            </h2>
            <p className="text-white/70">
              Kami berhak memperbarui Syarat dan Ketentuan ini sewaktu-waktu demi mematuhi perkembangan regulasi kesehatan digital. Perubahan akan diumumkan melalui pembaruan tanggal di halaman ini.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center text-xs text-white/40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Kindo. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Kebijakan Privasi
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

