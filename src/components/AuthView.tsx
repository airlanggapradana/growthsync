import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, Users, Stethoscope, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
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
      setError('Email dan kata sandi harus diisi.');
      return;
    }

    if (!isLogin) {
      if (!fullName) {
        setError(role === 'orang_tua' ? 'Nama Orang Tua harus diisi.' : 'Nama Lengkap Tenaga Kesehatan harus diisi.');
        return;
      }
      if (role === 'nakes' && !sip) {
        setError('Nomor SIP (Surat Izin Praktik) harus diisi.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi kata sandi tidak cocok.');
        return;
      }
      if (!selectedProvince || !selectedRegency || !selectedDistrict || !selectedVillage) {
        setError('Mohon lengkapi data wilayah tempat tinggal / faskes.');
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
          userData.isVerified = false; // Admin verifikasi
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar. Silakan login atau gunakan email lain.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Email atau kata sandi tidak sesuai. Silakan periksa kembali.');
      } else if (err.code === 'auth/weak-password') {
        setError('Kata sandi terlalu pendek. Gunakan minimal 6 karakter.');
      } else {
        setError(`Terjadi kendala: ${err.message || 'Silakan coba lagi.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans bg-[#F8FAFC] dark:bg-[#0B1220] text-[#0F172A] dark:text-[#F1F5F9] relative overflow-hidden">
      {/* Subtle background ambient blur */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-[#CCFBF1]/60 dark:bg-teal-950/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[#E0F2FE]/60 dark:bg-sky-950/20 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[480px] bg-white dark:bg-[#111A2B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 lg:p-10 relative z-10"
      >
        {/* Top Header & Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="/Resmi_Logo_UMS_Color.png" 
              alt="Kindo Logo" 
              className="w-10 h-10 object-contain drop-shadow-xs" 
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white leading-tight">
                KINDO
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tumbuh Kembang Anak
              </p>
            </div>
          </div>

          {onBack && (
            <button 
              type="button"
              onClick={onBack}
              className="text-xs font-semibold text-slate-500 hover:text-[#0F766E] dark:hover:text-[#5EEAD4] flex items-center gap-1.5 transition-colors p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isLogin ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isLogin 
              ? 'Lanjutkan pemantauan tumbuh kembang buah hati secara terpadu.'
              : 'Daftar untuk mulai skrining KPSP dan konsultasi tenaga medis.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs sm:text-sm text-[#B91C1C] dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pilih Peran Pengguna
              </label>
              {/* Dua Kartu Besar Sesuai Section 4.2 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('orang_tua')}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer",
                    role === 'orang_tua'
                      ? "border-[#0F766E] bg-[#F0FDFA] dark:bg-teal-950/40 text-[#0F766E] dark:text-[#5EEAD4] shadow-xs ring-1 ring-[#0F766E]"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Users className="w-6 h-6 mb-2 text-[#0F766E] dark:text-[#5EEAD4]" />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Orang Tua</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pantau tumbuh kembang anak</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('nakes')}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer",
                    role === 'nakes'
                      ? "border-[#0F766E] bg-[#F0FDFA] dark:bg-teal-950/40 text-[#0F766E] dark:text-[#5EEAD4] shadow-xs ring-1 ring-[#0F766E]"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Stethoscope className="w-6 h-6 mb-2 text-[#0F766E] dark:text-[#5EEAD4]" />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Tenaga Kesehatan</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Dokter, bidan, kader</div>
                  </div>
                </button>
              </div>

              {role === 'nakes' && (
                <div className="p-3 bg-[#F0F9FF] dark:bg-sky-950/30 border border-[#BAE6FD] dark:border-sky-800/60 rounded-xl flex items-start gap-2.5 text-xs text-[#0369A1] dark:text-sky-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#0284C7]" />
                  <span>Akun Nakes akan aktif setelah nomor SIP diverifikasi oleh Admin.</span>
                </div>
              )}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {role === 'orang_tua' ? 'Nama Orang Tua' : 'Nama Lengkap & Gelar'}
              </label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] focus:ring-2 focus:ring-[#99F6E4] rounded-xl outline-none transition-all text-sm text-slate-900 dark:text-white"
                placeholder={role === 'orang_tua' ? "Contoh: Siti Rahmawati" : "Contoh: dr. Budi Santoso, Sp.A"}
                required
              />
            </div>
          )}

          {role === 'nakes' && !isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor SIP (Surat Izin Praktik)
              </label>
              <input 
                type="text" 
                value={sip}
                onChange={(e) => setSip(e.target.value)}
                className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] focus:ring-2 focus:ring-[#99F6E4] rounded-xl outline-none transition-all text-sm text-slate-900 dark:text-white"
                placeholder="Nomor SIP resmi Anda"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Alamat Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] focus:ring-2 focus:ring-[#99F6E4] rounded-xl outline-none transition-all text-sm text-slate-900 dark:text-white"
              placeholder="nama@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] focus:ring-2 focus:ring-[#99F6E4] rounded-xl outline-none transition-all text-sm text-slate-900 dark:text-white"
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Konfirmasi Kata Sandi
              </label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] focus:ring-2 focus:ring-[#99F6E4] rounded-xl outline-none transition-all text-sm text-slate-900 dark:text-white"
                placeholder="Ulangi kata sandi"
                required
                minLength={6}
              />
            </div>
          )}

          {!isLogin && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Domisili / Wilayah Faskes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full h-12 px-3 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  required
                >
                  <option value="" disabled>Pilih Provinsi</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>

                <select
                  value={selectedRegency}
                  onChange={(e) => setSelectedRegency(e.target.value)}
                  disabled={!selectedProvince}
                  className="w-full h-12 px-3 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white disabled:opacity-50"
                  required
                >
                  <option value="" disabled>Pilih Kab/Kota</option>
                  {regencies.map((r) => (
                    <option key={r.code} value={r.code}>{r.name}</option>
                  ))}
                </select>

                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedRegency}
                  className="w-full h-12 px-3 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white disabled:opacity-50"
                  required
                >
                  <option value="" disabled>Pilih Kecamatan</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>

                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full h-12 px-3 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white disabled:opacity-50"
                  required
                >
                  <option value="" disabled>Pilih Kelurahan/Desa</option>
                  {villages.map((v) => (
                    <option key={v.code} value={v.code}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 mt-4 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? 'Masuk' : 'Daftar Sekarang'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs sm:text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            {isLogin ? 'Belum memiliki akun?' : 'Sudah memiliki akun?'}
          </span>{' '}
          <button 
            type="button"
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
            className="text-[#0F766E] dark:text-[#5EEAD4] font-bold hover:underline"
          >
            {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
