import React, { useState } from 'react';
import { motion } from 'motion/react';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChildProfile } from '../types';
import { Baby, Loader2, ArrowRight } from 'lucide-react';
import { User } from 'firebase/auth';
import { cn } from '../lib/utils';

export default function ChildOnboardingView({ user, onComplete }: { key?: string, user: User, onComplete: (profile: ChildProfile) => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan' | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) {
      alert('Pilih jenis kelamin anak.');
      return;
    }

    setLoading(true);

    try {
      const profileData: ChildProfile = {
        name,
        ageInMonths: parseInt(age, 10),
        heightCm: parseFloat(height),
        weightKg: parseFloat(weight),
        ...(headCirc ? { headCircumferenceCm: parseFloat(headCirc) } : {}),
        gender: gender as 'Laki-laki' | 'Perempuan',
      };

      const firestoreData = {
        ...profileData,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      };

      const profileId = user.uid + '_' + Date.now().toString();
      await setDoc(doc(db, 'childProfiles', profileId), firestoreData);
      onComplete({ id: profileId, ...profileData });
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data profil anak.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl mx-auto space-y-8 mt-6"
    >
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700/60 mb-2">
          <Baby className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Profil Anak
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Silakan isi data anak untuk menyesuaikan informasi perkembangan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Lengkap Anak</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
            placeholder="e.g. Arjuna Putra"
            maxLength={100}
          />
        </div>

        <div className="space-y-3">
           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jenis Kelamin</label>
           <div className="grid grid-cols-2 gap-4">
             <button
                type="button"
                onClick={() => setGender('Laki-laki')}
                className={cn(
                  "py-4 rounded-xl border-2 font-semibold text-sm transition-subtle flex items-center justify-center gap-2",
                  gender === 'Laki-laki' 
                    ? "border-blue-500 bg-blue-50 text-blue-700" 
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 hover:border-slate-300"
                )}
             >
                <span className="text-xl">👦</span> Laki-laki
             </button>
             <button
                type="button"
                onClick={() => setGender('Perempuan')}
                className={cn(
                  "py-4 rounded-xl border-2 font-semibold text-sm transition-subtle flex items-center justify-center gap-2",
                  gender === 'Perempuan' 
                    ? "border-pink-500 bg-pink-50 text-pink-700" 
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 hover:border-slate-300"
                )}
             >
                <span className="text-xl">👧</span> Perempuan
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Usia (Bulan)</label>
            <input
              type="number"
              required
              min="0"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle text-sm font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lingkar Kepala (cm) - Opsional</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={headCirc}
              onChange={(e) => setHeadCirc(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle text-sm font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tinggi Badan (cm)</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle text-sm font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Berat Badan (kg)</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl outline-none transition-subtle text-sm font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400"
              placeholder="0.0"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1b4332] hover:bg-[#0f2c20] active:bg-[#0a1e16] text-white font-medium rounded-xl transition-subtle disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Simpan Profil Anak
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
