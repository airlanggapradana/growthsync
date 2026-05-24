import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, Info, Users, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('orang_tua');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          role: role,
          createdAt: new Date().toISOString()
        });
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
    <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-end lg:p-6 font-sans bg-slate-900 overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779619895/ChatGPT_Image_May_24_2026_05_50_36_PM_eyx1md.webp" 
          alt="background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-slate-900/30 to-slate-900/20"></div>
      </div>
      
      {/* Left Side Content (Logo & Text) */}
      <div className="hidden lg:flex flex-col justify-between absolute inset-0 z-10 p-12 xl:p-16 w-[calc(100%-540px)] pointer-events-none">
          <div className="pointer-events-auto p-2 bg-white/50 backdrop-blur rounded-xl shadow-xl shadow-black/10 self-start inline-flex items-center justify-center">
            <img src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779549262/ChatGPT_Image_May_23__2026__10_10_14_PM-removebg-preview_k2cxf5.webp" alt="Kuisioner Anak Logo" className="h-10 w-auto object-contain" />
          </div>
          <div className="pointer-events-auto max-w-xl">
               <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                 Pantau perkembangan anak.<br/>Lebih cerdas, lebih mudah.
               </h1>
               <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                 Akses kuisioner skrining perkembangan berkala. Pantau rutin dan dapatkan analisis dari ahlinya.
               </p>
          </div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden absolute top-0 left-0 w-full p-6 z-30 flex items-center pointer-events-none">
        <div className="pointer-events-auto px-5 py-3 bg-white rounded-xl shadow-lg shadow-black/10 inline-flex items-center justify-center">
          <img src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779549262/ChatGPT_Image_May_23__2026__10_10_14_PM-removebg-preview_k2cxf5.webp" alt="Kuisioner Anak Logo" className="h-8 w-auto object-contain" />
        </div>
      </header>

      {/* Right Side Card Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="w-full lg:max-w-[480px] xl:max-w-[520px] bg-white dark:bg-slate-900 border border-white/40 dark:border-slate-800 lg:rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)] relative z-20 min-h-screen lg:min-h-0 lg:h-[calc(100vh-48px)] flex flex-col overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-72 h-72 rounded-full bg-emerald-100/60 dark:bg-emerald-900/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-teal-100/60 dark:bg-teal-900/20 blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz4KPC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz4KPC9zdmc+')] pointer-events-none opacity-50 dark:opacity-30"></div>

        <div className="relative z-10 flex flex-col flex-1 px-8 py-10 sm:p-12 overflow-y-auto">
          <div className="my-auto pt-16 lg:pt-0">
            <div className="flex flex-col items-start mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mb-2">
              {isLogin ? 'Selamat Datang' : 'Buat Akun'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isLogin ? 'Masuk ke akun Anda untuk melanjutkan.' : 'Daftar untuk mengakses kuisioner perkembangan.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle text-sm font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
                placeholder="email@contoh.com"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle text-sm font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Daftar Sebagai</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('orang_tua')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all text-sm font-semibold",
                        role === 'orang_tua' 
                          ? "border-[#1b4332] bg-[#1b4332]/5 text-[#1b4332] dark:text-emerald-400 dark:border-emerald-500/50 dark:bg-emerald-900/20" 
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <Users className="w-4 h-4" />
                      Orang Tua
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('nakes')}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all text-sm font-semibold",
                        role === 'nakes' 
                          ? "border-[#1b4332] bg-[#1b4332]/5 text-[#1b4332] dark:text-emerald-400 dark:border-emerald-500/50 dark:bg-emerald-900/20" 
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <Briefcase className="w-4 h-4" />
                      Tenaga Kesehatan
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Konfirmasi Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle text-sm font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
                    placeholder="Ulangi password"
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 mt-4 bg-[#1b4332] hover:bg-[#0f2c20] active:bg-[#0a1e16] text-white font-medium rounded-xl transition-subtle disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? 'Masuk' : 'Daftar'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            </span>
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-slate-900 dark:text-slate-50 font-semibold hover:underline transition-all ml-1"
            >
              {isLogin ? 'Daftar sekarang' : 'Masuk sekarang'}
            </button>
          </div>        
        </div>
        </div>
      </motion.div>
    </div>
  );
}
