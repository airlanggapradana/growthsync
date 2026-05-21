import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Baby, Loader2, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar. Silakan login.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Email atau password salah.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu lemah. Minimal 6 karakter.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
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
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-900/20"></div>
      </div>
      
      {/* Left Side Content (Logo & Text) */}
      <div className="hidden lg:flex flex-col justify-between absolute inset-0 z-10 p-12 xl:p-16 w-[calc(100%-540px)] pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <div className="font-semibold tracking-tight text-white text-xl">
              Kuisioner<span className="text-white/60">Anak</span>
            </div>
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
      <header className="lg:hidden absolute top-0 left-0 w-full p-6 z-30 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
          <Baby className="w-5 h-5 text-white" />
        </div>
        <div className="font-semibold tracking-tight text-white text-lg drop-shadow-sm">
          Kuisioner<span className="text-white/80">Anak</span>
        </div>
      </header>

      {/* Right Side Card Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="w-full lg:max-w-[480px] xl:max-w-[520px] bg-white lg:rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)] relative z-20 min-h-screen lg:min-h-0 lg:h-[calc(100vh-48px)] flex flex-col px-8 py-10 sm:p-12 overflow-y-auto"
      >
        <div className="my-auto pt-16 lg:pt-0">
          <div className="flex flex-col items-start mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {isLogin ? 'Selamat Datang' : 'Buat Akun'}
            </h2>
            <p className="text-slate-500 text-sm">
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
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle text-sm font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="email@contoh.com"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle text-sm font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Ulangi password"
                  required
                  minLength={6}
                />
              </div>
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
            <span className="text-slate-500">
              {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            </span>
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-slate-900 font-semibold hover:underline transition-all ml-1"
            >
              {isLogin ? 'Daftar sekarang' : 'Masuk sekarang'}
            </button>
          </div>
          
          <div className="mt-8 flex gap-3 items-start p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Aplikasi ini membutuhkan fitur otentikasi melalui Firebase. Pastikan opsi 'Email/Password' telah diaktifkan pada konsol Firebase Anda.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
