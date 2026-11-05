import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Shield, Sparkles, Activity, ArrowRight, HeartPulse, LineChart, Stethoscope, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import ThreeBackground from './ThreeBackground';
import { applySEO, PAGE_SEO } from '../lib/seo';

export default function LandingView() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 4000], ['0%', '-20%']);

  const [activeSection, setActiveSection] = React.useState('beranda');

  // Apply landing page SEO metadata
  React.useEffect(() => {
    applySEO(PAGE_SEO.landing());
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['beranda', 'fitur', 'cara-kerja', 'tim-kami'];
      let current = 'beranda';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust threshold based on navigation height or preference
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
            current = section;
          }
        }
      }
      
      setActiveSection((prev) => (prev !== current ? current : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050A07] font-sans text-slate-50 relative overflow-hidden selection:bg-[#d9f99d] selection:text-[#050A07]">
      {/* Background Image Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.img 
          src="https://res.cloudinary.com/airlanggapradana/image/upload/v1780067014/Gemini_Generated_Image_vsgdkrvsgdkrvsgd_pugw7v.webp" 
          alt="Latar belakang alam hijau yang menenangkan"
          width={1920}
          height={1080}
          className="w-full h-[130vh] object-cover absolute top-0 left-0"
          style={{ y: backgroundY }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050A07] via-[#050A07]/10 to-[#050A07] z-10" />
      </div>

      <ThreeBackground />

      {/* Ambient Background Glows */}
      <motion.div 
        animate={{ 
          opacity: [0.02, 0.04, 0.02],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#d9f99d] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          opacity: [0.05, 0.1, 0.05],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-emerald-900 opacity-[0.1] blur-[150px] rounded-full pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          opacity: [0.03, 0.06, 0.03],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="fixed top-1/2 right-0 w-[600px] h-[600px] bg-[#8cc63f] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" 
      />

      {/* Navigation (Floating Pill) */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-6 inset-x-0 z-50 flex justify-center px-4"
      >
        <nav aria-label="Navigasi utama Kindo" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full w-full max-w-5xl px-4 py-3 flex items-center justify-between shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 pl-2">
             <img src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779549262/ChatGPT_Image_May_23__2026__10_10_14_PM-removebg-preview_k2cxf5.webp" alt="Logo Kindo" width={32} height={32} className="h-8 w-auto object-contain brightness-0 invert" />
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
      <section id="beranda" className="pt-40 pb-20 px-6 min-h-[85vh] flex flex-col items-center justify-center relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
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
      </section>

      {/* Glowing Cards / Features Section */}
      <section id="fitur" className="py-24 relative z-10 w-full max-w-6xl mx-auto px-6">
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
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] hover:bg-white/10 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.5)] group relative overflow-hidden"
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
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] hover:bg-white/10 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.5)] group relative overflow-hidden md:-mt-8"
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
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] hover:bg-white/10 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.5)] group relative overflow-hidden"
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
      <section id="cara-kerja" className="py-32 relative z-10 border-t border-white/5 bg-white/[0.02]">
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
                  className="flex gap-6 p-6 rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm"
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
      <section id="tim-kami" className="py-32 relative z-10 border-t border-white/5">
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

      {/* Trusted By / Footer */}
      <footer className="py-12 border-t border-white/10 relative z-10 bg-black/20 text-center flex flex-col items-center">
        <p className="text-xs tracking-widest uppercase text-white/40 font-semibold mb-8">Didukung oleh Institusi Besar</p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mb-16 px-6">
           <img src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779886057/Resmi_Logo_UMS_White_FullText_1_pygmt0.webp" alt="Logo Universitas Muhammadiyah Surakarta" width={160} height={40} loading="lazy" className="h-10 w-auto object-contain brightness-0 invert" />
        </div>
        
        <div className="w-full max-w-5xl border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 px-6 text-xs text-white/40">
           <div className="flex items-center gap-2">
              <img src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779549262/ChatGPT_Image_May_23__2026__10_10_14_PM-removebg-preview_k2cxf5.webp" alt="Logo Kindo" width={24} height={24} loading="lazy" className="w-6 h-6 brightness-0 invert opacity-50" />
              <span>© {new Date().getFullYear()} Kindo. All rights reserved.</span>
           </div>
           <div className="flex gap-6">
             <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
             <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
