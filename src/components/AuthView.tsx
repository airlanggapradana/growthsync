import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, Users, Briefcase, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

export default function AuthView({ onBack, initialMode = 'login' }: { onBack?: () => void, initialMode?: 'login' | 'register' }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [sip, setSip] = useState('');
  const [role, setRole] = useState<UserRole>('orang_tua');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedRegency, setSelectedRegency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');

  useEffect(() => {
    if (!isLogin) {
      fetch('/api/wilayah/provinces')
        .then(res => res.json())
        .then(data => setProvinces(data.data || []))
        .catch(console.error);
    }
  }, [isLogin]);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`/api/wilayah/regencies/${selectedProvince}`)
        .then(res => res.json())
        .then(data => setRegencies(data.data || []))
        .catch(console.error);
      setSelectedRegency('');
      setDistricts([]);
      setSelectedDistrict('');
      setVillages([]);
      setSelectedVillage('');
    } else {
      setRegencies([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedRegency) {
      fetch(`/api/wilayah/districts/${selectedRegency}`)
        .then(res => res.json())
        .then(data => setDistricts(data.data || []))
        .catch(console.error);
      setSelectedDistrict('');
      setVillages([]);
      setSelectedVillage('');
    } else {
      setDistricts([]);
    }
  }, [selectedRegency]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`/api/wilayah/villages/${selectedDistrict}`)
        .then(res => res.json())
        .then(data => setVillages(data.data || []))
        .catch(console.error);
      setSelectedVillage('');
    } else {
      setVillages([]);
    }
  }, [selectedDistrict]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    if (!isLogin) {
      if (!fullName) {
        setError('Nama Lengkap harus diisi');
        return;
      }
      if (role === 'nakes' && !sip) {
        setError('Nomor SIP harus diisi untuk Tenaga Kesehatan');
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok');
        return;
      }
      if (!selectedProvince || !selectedRegency || !selectedDistrict || !selectedVillage) {
        setError('Mohon lengkapi data alamat Anda (Provinsi hingga Kelurahan/Desa)');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const selectedProvName = provinces.find(p => p.code === selectedProvince)?.name || '';
        const selectedRegName = regencies.find(r => r.code === selectedRegency)?.name || '';
        const selectedDistName = districts.find(d => d.code === selectedDistrict)?.name || '';
        const selectedVillName = villages.find(v => v.code === selectedVillage)?.name || '';

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userData: any = {
          uid: userCredential.user.uid,
          name: fullName,
          email: userCredential.user.email,
          role: role,
          province: selectedProvName,
          regency: selectedRegName,
          district: selectedDistName,
          village: selectedVillName,
          createdAt: new Date().toISOString()
        };
        
        if (role === 'nakes') {
          userData.sip = sip;
          userData.isVerified = false; // Admin must verify
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar. Silakan daftar menggunakan email lain atau langsung masuk.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Email atau password salah. Pastikan akun sudah terdaftar dan kredensial sudah benar.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu lemah. Minimal 6 karakter.');
      } else {
        setError(`Terjadi kesalahan: ${err.message || 'Silakan coba lagi.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 font-sans bg-[#263c32] relative overflow-hidden">
      {/* Floating Background Effects */}
      <div className="absolute top-[10%] left-[5%] w-16 h-16 rounded-full bg-white/5 blur-sm border border-white/10" />
      <div className="absolute top-[20%] left-[20%] w-32 h-32 rounded-full bg-white/5 blur-md" />
      <div className="absolute bottom-[20%] right-[10%] w-24 h-24 rounded-full bg-[#6b9d8d]/10 blur-sm" />
      <div className="absolute bottom-[5%] left-[25%] w-40 h-40 rounded-full bg-white/5 blur-lg" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl flex flex-col lg:flex-row bg-[#335041] lg:rounded-[40px] rounded-3xl overflow-hidden shadow-2xl relative z-10 lg:h-[750px]"
      >
        {/* LEFT COMPARTMENT - White */}
        <div className="lg:w-[45%] bg-white p-8 lg:p-12 flex flex-col relative z-20 overflow-hidden">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 relative z-10 w-48">
            <img 
              src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779884930/Resmi_Logo_UMS_Color_FullText_nppltl.webp" 
              alt="Logo" 
              className="h-full w-full object-contain" 
            />
          </div>

          {/* Curve matching the right side - optional but nice for aesthetics */}
          <div className="hidden lg:block absolute -right-[120px] top-1/2 -translate-y-1/2 w-[240px] h-[150%] bg-[#335041] rounded-[50%] pointer-events-none"></div>

          <div className="flex-1 flex flex-col items-center justify-center relative z-10 pl-4 lg:pr-16">
            <div className="relative w-full max-w-[300px] aspect-square flex items-center justify-center">
                <div className="absolute w-[110%] h-[110%] bg-emerald-50 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] transition-all animate-[spin_20s_linear_infinite]" style={{ animationDirection: 'reverse' }}></div>
                <div className="absolute w-full h-full bg-teal-50 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] mix-blend-multiply transition-all animate-[spin_15s_linear_infinite]"></div>
                
                <div className="relative z-10 text-center">
                  <h1 className="text-3xl font-extrabold text-[#233a30] mb-2 font-serif">
                    Skrining<br/>Tumbuh Kembang
                  </h1>
                  <p className="text-[#335041] text-sm mt-4 font-medium px-4">
                    Pantau tahapan perkembangan anak secara berkala dan terpercaya.
                  </p>
                </div>
            </div>
          </div>

          <div className="pt-10 relative z-10">
            <p className="text-xs text-slate-400 font-medium">© 2026 Aplikasi Tumbuh Kembang Anak</p>
            <p className="text-[10px] text-slate-400">Created by Universitas Muhammadiyah Surakarta</p>
          </div>
        </div>

        {/* RIGHT COMPARTMENT - Dark Green Form */}
        <div className="flex-1 lg:w-[55%] flex flex-col px-6 py-10 lg:p-16 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-md w-full mx-auto my-auto relative">
            {onBack && (
              <button 
                type="button"
                onClick={onBack}
                className="absolute -top-12 lg:-top-16 -left-2 lg:left-0 text-white/50 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
            )}
            <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">
              {isLogin ? 'Login' : 'Register'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl text-sm font-medium">
                  {error}
                </div>
              )}
              
              {!isLogin && (
                <div className="space-y-4 pb-2">
                  <label className="text-sm text-white/80 font-medium ml-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-6 py-4 bg-[#20362b] border border-transparent focus:border-[#6b9d8d]/50 focus:bg-[#20362b]/80 rounded-full outline-none transition-all text-white placeholder:text-white/30 text-sm"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <label className="text-sm text-white/80 font-medium ml-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-6 py-4 bg-[#20362b] border border-transparent focus:border-[#6b9d8d]/50 focus:bg-[#20362b]/80 rounded-full outline-none transition-all text-white placeholder:text-white/30 text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-sm text-white/80 font-medium ml-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full px-6 py-4 bg-[#20362b] border border-transparent focus:border-[#6b9d8d]/50 focus:bg-[#20362b]/80 rounded-full outline-none transition-all text-white placeholder:text-white/30 text-sm"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-[#6b9d8d] hover:text-[#8bc7b5] transition-colors mt-1 hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-4 pt-2">
                <div className="space-y-4">
                    <label className="text-sm text-white/80 font-medium ml-2">Konfirmasi Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full px-6 py-4 bg-[#20362b] border border-transparent focus:border-[#6b9d8d]/50 focus:bg-[#20362b]/80 rounded-full outline-none transition-all text-white placeholder:text-white/30 text-sm"
                      placeholder="Ulangi password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm text-white/80 font-medium ml-2">Daftar Sebagai</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('orang_tua')}
                        className={cn(
                          "flex items-center justify-center gap-1.5 py-3 px-2 rounded-full border transition-all text-xs font-semibold",
                          role === 'orang_tua' 
                            ? "border-[#6b9d8d] bg-[#6b9d8d]/20 text-white" 
                            : "border-transparent bg-[#20362b] text-white/50 hover:bg-[#20362b]/80 hover:text-white/80"
                        )}
                      >
                        <Users className="w-3.5 h-3.5 hidden sm:block" />
                        Orang Tua
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('nakes')}
                        className={cn(
                          "flex items-center justify-center gap-1.5 py-3 px-2 rounded-full border transition-all text-xs font-semibold",
                          role === 'nakes' 
                            ? "border-[#6b9d8d] bg-[#6b9d8d]/20 text-white" 
                            : "border-transparent bg-[#20362b] text-white/50 hover:bg-[#20362b]/80 hover:text-white/80"
                        )}
                      >
                        <Briefcase className="w-3.5 h-3.5 hidden sm:block" />
                        Nakes
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={cn(
                          "flex items-center justify-center gap-1.5 py-3 px-2 rounded-full border transition-all text-xs font-semibold",
                          role === 'admin' 
                            ? "border-[#6b9d8d] bg-[#6b9d8d]/20 text-white" 
                            : "border-transparent bg-[#20362b] text-white/50 hover:bg-[#20362b]/80 hover:text-white/80"
                        )}
                      >
                        <Lock className="w-3.5 h-3.5 hidden sm:block" />
                        Admin
                      </button>
                    </div>
                  </div>

                  {role === 'nakes' && (
                    <div className="space-y-4">
                      <label className="text-sm text-white/80 font-medium ml-2">Nomor SIP (Surat Izin Praktik)</label>
                      <input 
                        type="text" 
                        value={sip}
                        onChange={(e) => setSip(e.target.value)}
                        className="w-full px-6 py-4 bg-[#20362b] border border-transparent focus:border-[#6b9d8d]/50 focus:bg-[#20362b]/80 rounded-full outline-none transition-all text-white placeholder:text-white/30 text-sm"
                        placeholder="Masukkan Nomor SIP"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-sm text-white/80 font-medium ml-2">Provinsi</label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-6 py-4 bg-[#20362b] border border-transparent focus:border-[#6b9d8d]/50 focus:bg-[#20362b]/80 rounded-full outline-none transition-all text-white text-sm appearance-none"
                      required
                    >
                      <option value="" disabled className="bg-[#20362b]">Pilih Provinsi</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code} className="bg-[#20362b] text-white">{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedProvince && (
                    <div className="space-y-4">
                      <label className="text-sm text-white/80 font-medium ml-2">Kabupaten/Kota</label>
                      <select
                        value={selectedRegency}
                        onChange={(e) => setSelectedRegency(e.target.value)}
                        className="w-full px-6 py-4 bg-[#20362b] border border-transparent focus:border-[#6b9d8d]/50 focus:bg-[#20362b]/80 rounded-full outline-none transition-all text-white text-sm appearance-none"
                        required
                      >
                        <option value="" disabled className="bg-[#20362b]">Pilih Kabupaten/Kota</option>
                        {regencies.map((r) => (
                          <option key={r.code} value={r.code} className="bg-[#20362b] text-white">{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedRegency && (
                    <div className="space-y-4">
                      <label className="text-sm text-white/80 font-medium ml-2">Kecamatan</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full px-6 py-4 bg-[#20362b] border border-transparent focus:border-[#6b9d8d]/50 focus:bg-[#20362b]/80 rounded-full outline-none transition-all text-white text-sm appearance-none"
                        required
                      >
                        <option value="" disabled className="bg-[#20362b]">Pilih Kecamatan</option>
                        {districts.map((d) => (
                          <option key={d.code} value={d.code} className="bg-[#20362b] text-white">{d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedDistrict && (
                    <div className="space-y-4">
                      <label className="text-sm text-white/80 font-medium ml-2">Kelurahan/Desa</label>
                      <select
                        value={selectedVillage}
                        onChange={(e) => setSelectedVillage(e.target.value)}
                        className="w-full px-6 py-4 bg-[#20362b] border border-transparent focus:border-[#6b9d8d]/50 focus:bg-[#20362b]/80 rounded-full outline-none transition-all text-white text-sm appearance-none"
                        required
                      >
                        <option value="" disabled className="bg-[#20362b]">Pilih Kelurahan/Desa</option>
                        {villages.map((v) => (
                          <option key={v.code} value={v.code} className="bg-[#20362b] text-white">{v.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-8 bg-[#6b9d8d] hover:bg-[#5a8678] text-white font-semibold rounded-full transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-[#6b9d8d]/20 active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? 'Login Apps' : 'Register Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-white/60">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>
              <br/>
              <button 
                onClick={() => {
                  setError('');
                  setPassword('');
                  setConfirmPassword('');
                  if (isLogin) {
                    navigate('/auth/register');
                  } else {
                    navigate('/auth/login');
                  }
                }}
                className="text-[#6b9d8d] hover:text-[#8bc7b5] font-semibold hover:underline transition-all mt-1"
              >
                {isLogin ? 'Register Now' : 'Login Now'}
              </button>
            </div>

            <div className="mt-12 lg:mt-24 text-center">
              <a href="#" className="text-white/40 hover:text-white/60 text-xs border-b border-white/20 pb-0.5">
                Terms and Services
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
