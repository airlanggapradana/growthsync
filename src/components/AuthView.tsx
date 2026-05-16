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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="h-[72px] bg-white border-b border-slate-200 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 h-full flex items-center">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-[20px] font-extrabold text-blue-500 tracking-tight">Kuisioner</span>
              <span className="text-[20px] font-extrabold text-slate-900 tracking-tight">Anak</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 sm:p-10"
        >
          <div className="flex flex-col flex-1 items-center justify-center text-center mb-8">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-blue-100 text-blue-600 shadow-[0_4px_6px_-1px_rgba(59,130,246,0.1)] border border-blue-200 mb-4">
              <Baby className="w-8 h-8" />
            </div>
            <h2 className="text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
              {isLogin ? 'Selamat Datang' : 'Buat Akun'}
            </h2>
            <p className="text-slate-500 font-medium text-[15px]">
              {isLogin ? 'Masuk untuk memulai skrining perkembangan anak Anda.' : 'Daftar untuk mengakses kuisioner perkembangan anak.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[14px] font-semibold text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold uppercase tracking-wider text-slate-600">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-colors font-medium text-slate-800 placeholder:text-slate-400"
                placeholder="contoh@email.com"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold uppercase tracking-wider text-slate-600">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-colors font-medium text-slate-800 placeholder:text-slate-400"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold uppercase tracking-wider text-slate-600">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-colors font-medium text-slate-800 placeholder:text-slate-400"
                  placeholder="Ulangi password"
                  required
                  minLength={6}
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-extrabold rounded-xl transition-colors shadow-md shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center tracking-wider text-[15px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? 'MASUK SEKARANG' : 'DAFTAR SEKARANG'
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <span className="text-slate-500 font-medium text-[15px]">
              {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            </span>
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
            >
              {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </div>
          
          <div className="mt-6 flex gap-2 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-slate-500 font-medium">
              Aplikasi ini membutuhkan fitur otentikasi melalui Firebase. Pastikan opsi 'Email/Password' telah diaktifkan pada konsol Firebase Anda.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
