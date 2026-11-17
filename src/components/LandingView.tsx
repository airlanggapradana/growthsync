import React from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';
import { Shield, Sparkles, Activity, ArrowRight, HeartPulse, LineChart, Stethoscope, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { applySEO, PAGE_SEO } from '../lib/seo';
import { KINDO_LOGO_URL } from './PageTransition';

export default function LandingView() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 26,
    mass: 0.25,
    restDelta: 0.0005,
  });
  const backgroundY = useTransform(smoothProgress, [0, 1], [0, -180]);
  const heroY = useTransform(smoothProgress, [0, 0.35], [0, 56]);
  const heroScale = useTransform(smoothProgress, [0, 0.35], [1, 0.96]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.28], [1, 0.2]);

  const [activeSection, setActiveSection] = React.useState('beranda');

  // Apply landing page SEO metadata
  React.useEffect(() => {
    applySEO(PAGE_SEO.landing());
  }, []);

  // Track active section with IntersectionObserver (zero main-thread reflow on scroll)
  React.useEffect(() => {
    const sections = ['beranda', 'fitur', 'cara-kerja', 'tim-kami'];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection((prev) => (prev !== entry.target.id ? entry.target.id : prev));
          }
        }
      },
      {
        rootMargin: '-35% 0px -35% 0px',
        threshold: 0,
      }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050A07] font-sans text-slate-50 relative overflow-x-clip selection:bg-[#d9f99d] selection:text-[#050A07]">
      {/* GPU-Composited Parallax Background Image Layer */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{ contain: 'strict' }}
      >
        <motion.div
          className="absolute -top-[5vh] left-0 w-full h-[125vh] will-change-transform"
          style={
            prefersReducedMotion
              ? undefined
              : {
                  y: backgroundY,
                  backfaceVisibility: 'hidden',
                }
          }
        >
          <img
            src="https://res.cloudinary.com/airlanggapradana/image/upload/v1780067014/Gemini_Generated_Image_vsgdkrvsgdkrvsgd_pugw7v.webp"
            alt=""
            width={1920}
            height={1080}
            decoding="async"
            className="w-full h-full object-cover transform-gpu"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050A07] via-[#050A07]/15 to-[#050A07] z-10" />
      </div>

      {/* Lightweight Radial Ambient Glows (zero blur-filter repaint cost on scroll) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          contain: 'strict',
          backgroundImage:
            'radial-gradient(680px 380px at 50% 6%, rgba(217, 249, 157, 0.05), transparent 70%), radial-gradient(620px 620px at 5% 95%, rgba(6, 78, 59, 0.22), transparent 70%), radial-gradient(520px 520px at 96% 52%, rgba(140, 198, 63, 0.06), transparent 70%)',
        }}
      />

      {/* Navigation (Floating Pill) */}
      <motion.div 
        initial={prefersReducedMotion ? false : { y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 will-change-transform"
      >
        <nav aria-label="Navigasi utama Kindo" className="bg-[#0B1410]/80 backdrop-blur-md border border-white/10 rounded-full w-full max-w-5xl px-4 py-3 flex items-center justify-between shadow-2xl shadow-black/50 transform-gpu">
          <div className="flex items-center gap-3 pl-2">
             <div className="w-8 h-8 rounded-lg bg-white p-0.5 shadow-sm flex items-center justify-center shrink-0">
               <img src={KINDO_LOGO_URL} alt="Logo Kindo" width={32} height={32} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
             </div>
             <span className="font-bold tracking-widest text-sm text-white/90 hidden sm:block">KINDO</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button 
              onClick={() => scrollToSection('beranda')} 
              className={cn("cursor-pointer transition-colors relative", activeSection === 'beranda' ? "text-[#bef264] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#bef264] after:rounded-full" : "text-white/70 hover:text-white")}
            >Beranda</button>
            <button 
              onClick={() => scrollToSection('fitur')} 
              className={cn("cursor-pointer transition-colors relative", activeSection === 'fitur' ? "text-[#bef264] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#bef264] after:rounded-full" : "text-white/70 hover:text-white")}
            >Fitur</button>
            <button 
              onClick={() => scrollToSection('cara-kerja')} 
              className={cn("cursor-pointer transition-colors relative", activeSection === 'cara-kerja' ? "text-[#bef264] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#bef264] after:rounded-full" : "text-white/70 hover:text-white")}
            >Cara Kerja</button>
            <button 
              onClick={() => scrollToSection('tim-kami')} 
              className={cn("cursor-pointer transition-colors relative", activeSection === 'tim-kami' ? "text-[#bef264] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#bef264] after:rounded-full" : "text-white/70 hover:text-white")}
            >Tim Kami</button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/auth/login')}
              className="text-sm font-medium px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              Masuk
            </button>
            <button 
              onClick={() => navigate('/auth/register')}
              className="bg-gradient-to-b from-[#d9f99d] to-[#bef264] hover:to-[#a3e635] text-[#050A07] px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(217,249,157,0.4)] flex items-center gap-2"
            >
              Mulai Sekarang <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </motion.div>

      {/* Hero Section */}
      <section id="beranda" aria-label="Beranda Kindo" className="pt-40 pb-20 px-6 min-h-[85vh] flex flex-col items-center justify-center relative z-10 text-center">
        <motion.div
          style={
            prefersReducedMotion
              ? undefined
              : {
                  y: heroY,
                  scale: heroScale,
                  opacity: heroOpacity,
                  willChange: 'transform, opacity',
                }
          }
          className="w-full"
        >
        <motion.div 
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center max-w-4xl mx-auto space-y-8"
        >
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm text-white/80">
            <span className="w-2 h-2 rounded-full bg-[#d9f99d] shadow-[0_0_10px_#d9f99d]"></span>
            Kini terintegrasi dengan <span className="text-white font-medium">Bantuan AI</span> <ChevronRight className="w-3 h-3 text-white/50" />
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-medium leading-[1.1] tracking-tight text-white mb-6">
            Kesehatan yang <span className="italic font-serif text-[#d9f99d] pr-2">tumbuh</span> bersama anak Anda.
          </h1>
          
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl leading-relaxed">
            Platform komprehensif bagi orang tua yang mendambakan kejelasan, kecepatan, dan pertumbuhan berkelanjutan dalam memantau perkembangan buah hati.
          </p>

          <div className="flex flex-col items-center gap-6 pt-4">
            <button 
              onClick={() => navigate('/auth/register')}
              className="bg-gradient-to-b from-[#d9f99d] to-[#bef264] hover:to-[#a3e635] text-[#050A07] px-8 py-4 rounded-full text-base font-bold transition-all shadow-[0_0_40px_rgba(217,249,157,0.3)] hover:shadow-[0_0_60px_rgba(217,249,157,0.4)] flex items-center justify-center gap-2 group"
            >
              Mulai Evaluasi Gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-white/50 font-medium">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#d9f99d]" /> Gratis digunakan</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#d9f99d]" /> Konsultasi cepat</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#d9f99d]" /> Hasil akurat</span>
            </div>
          </div>
        </motion.div>
        </motion.div>
      </section>

      {/* Glowing Cards / Features Section */}
      <section id="fitur" aria-label="Fitur Kindo" className="py-24 relative z-10 w-full max-w-6xl mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
          className="grid md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
            }}
            className="bg-[#0B1510]/85 border border-white/10 p-8 rounded-[32px] hover:bg-[#101E17]/90 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.5)] group relative overflow-hidden transform-gpu"
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#d9f99d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center bg-white/5 text-[#d9f99d]">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-lg text-white">Kuisioner Akurat</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-12">
              Pertanyaan disesuaikan dengan rentang usia spesifik dari 0 bulan hingga 6 tahun untuk mendeteksi penyimpangan.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#d9f99d]/20 blur-xl rounded-full" />
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300" alt="Visualisasi data perkembangan anak" width={300} height={96} loading="lazy" className="w-full h-24 object-cover rounded-xl opacity-30 mix-blend-screen" />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
            }}
            className="bg-[#0B1510]/85 border border-white/10 p-8 rounded-[32px] hover:bg-[#101E17]/90 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.5)] group relative overflow-hidden md:-mt-8 transform-gpu"
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#d9f99d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center bg-white/5 text-[#d9f99d]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-lg text-white">Analisis Cerdas</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-12">
              Bantuan AI yang memotong kebingungan dan menyoroti wawasan penting untuk tindakan perbaikan.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative flex items-end justify-center h-36">
               <div className="absolute inset-0 bg-gradient-to-t from-[#d9f99d]/20 to-transparent rounded-2xl" />
               <div className="w-full h-1/2 border-t border-[#d9f99d]/50 relative">
                  <div className="absolute top-0 right-1/4 -translate-y-1/2 w-3 h-3 bg-[#d9f99d] rounded-full shadow-[0_0_15px_#d9f99d]" />
                  <span className="absolute -top-8 right-1/4 translate-x-4 text-xs font-bold text-[#d9f99d] bg-white/10 px-2 py-1 rounded-md">Optimal</span>
               </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
            }}
            className="bg-[#0B1510]/85 border border-white/10 p-8 rounded-[32px] hover:bg-[#101E17]/90 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.5)] group relative overflow-hidden transform-gpu"
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#d9f99d]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center bg-white/5 text-[#d9f99d]">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-lg text-white">Konsultasi Nakes</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-12">
              Terhubung dengan bidan dan dokter sehingga Anda dapat bergerak cepat, tanpa risiko keraguan.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative flex items-center justify-center h-36">
               <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center relative">
                 <div className="w-10 h-10 rounded-full border border-[#d9f99d]/50 flex items-center justify-center bg-[#d9f99d]/10 shadow-[0_0_20px_rgba(217,249,157,0.3)]">
                   <Shield className="w-4 h-4 text-[#d9f99d]" />
                 </div>
                 <div className="absolute -inset-4 border border-white/5 rounded-full" />
               </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Layer */}
      <section id="cara-kerja" aria-label="Cara Kerja Kindo" className="py-32 relative z-10 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-4xl lg:text-5xl font-medium tracking-tight">Proses yang Mudah, Aman & Cepat.</h2>
              <p className="text-lg text-white/60 leading-relaxed">
                Platform kami ditujukan mereduksi kebingungan orang tua saat membaca buku KIA (Kesehatan Ibu dan Anak). Kami mendigitalisasikan proses tersebut agar setiap pengecekan bisa dilakukan langsung dari rumah.
              </p>
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
              className="space-y-4"
            >
              {[
                  { step: '01', title: 'Buat Profil Anak', desc: 'Isi data jenis kelamin dan tanggal lahir anak untuk mendaftar.' },
                  { step: '02', title: 'Jawab Kuisioner', desc: 'Pertanyaan disesuaikan dengan usia persis anak.' },
                  { step: '03', title: 'Dapatkan Laporan', desc: 'Laporan evaluasi beserta analisis asisten AI medis.' },
                  { step: '04', title: 'Tindakan Medis', desc: 'Konsultasi virtual dengan nakes tersertifikasi.' },
              ].map((item, id) => (
                <motion.div 
                  key={id} 
                  variants={{
                    hidden: { opacity: 0, x: 30 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
                  }}
                  className="flex gap-6 p-6 rounded-[24px] bg-[#0B1510]/80 border border-white/10 hover:bg-[#101E17]/90 transition-colors transform-gpu"
                >
                  <div className="text-xl font-serif italic text-[#d9f99d]/50 pt-1">{item.step}</div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
        </div>
      </section>

      {/* Our Team */}
      <section id="tim-kami" aria-label="Tim Pengembang Kindo" className="py-32 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto mb-16"
          >
             <h2 className="text-4xl font-medium tracking-tight mb-4">Dikembangkan Oleh Tim Ahli</h2>
             <p className="text-white/60">Mahasiswa Universitas Muhammadiyah Surakarta mendedikasikan platform ini demi kesehatan masa depan bangsa.</p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12 }
              }
            }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-6xl mx-auto"
          >
            {[
              { name: 'ASROFI NOOR MASITHOH', role: 'Developer', photo: '/team/asrofi.webp' },
              { name: 'PUTRI AZZAHRA NAMORA', role: 'Developer', photo: '/team/putri.webp' },
              { name: 'REJA ARRAFI', role: 'Developer', photo: '/team/reja.webp' },
              { name: 'AIRLANGGA PRADANA PRAKUSA', role: 'Developer', photo: '/team/rangga.webp' },
              { name: 'SHAFWAN AULIA RAHMAN', role: 'Developer', photo: '/team/shafwan.webp' },
            ].map((member) => (
              <motion.div 
                key={member.name} 
                variants={{
                  hidden: { opacity: 0, scale: 0.92, y: 20 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } }
                }}
                className="w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(20%-20px)] max-w-[210px] flex-shrink-0 group cursor-pointer"
              >
                <div className="aspect-[3/4] w-full rounded-[24px] sm:rounded-[28px] overflow-hidden mb-3 bg-white/5 border border-white/10 group-hover:border-[#d9f99d]/50 transition-all duration-300 relative shadow-lg shadow-black/40">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />
                   <img 
                      src={member.photo} 
                      alt={member.name} 
                      className="w-full h-full object-cover object-top grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 inset-x-4 z-20 text-left">
                      <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight leading-snug mb-1">
                        {member.name}
                      </h3>
                      <p className="text-[11px] font-medium text-[#d9f99d] tracking-wide">
                        {member.role}
                      </p>
                    </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 relative z-10 bg-black/20 text-center flex flex-col items-center" aria-label="Footer Kindo">
        <p className="text-xs tracking-widest uppercase text-white/40 font-semibold mb-8">Didukung oleh Institusi Besar</p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mb-16 px-6">
           <img src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779886057/Resmi_Logo_UMS_White_FullText_1_pygmt0.webp" alt="Logo Universitas Muhammadiyah Surakarta" width={160} height={40} loading="lazy" className="h-10 w-auto object-contain brightness-0 invert" />
        </div>
        
        <div className="w-full max-w-5xl border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 px-6 text-xs text-white/40">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white/90 p-0.5 flex items-center justify-center shrink-0">
                <img src={KINDO_LOGO_URL} alt="Logo Kindo" width={24} height={24} loading="lazy" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span>© {new Date().getFullYear()} Kindo. All rights reserved.</span>
           </div>
           <nav aria-label="Footer links" className="flex gap-6">
             <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
           </nav>
        </div>
      </footer>
    </div>
  );
}
