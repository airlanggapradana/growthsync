import React, { useState } from 'react';
import { motion } from 'motion/react';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChildProfile } from '../types';
import { Baby, Loader2, ArrowRight } from 'lucide-react';
import { User } from 'firebase/auth';

export default function ChildOnboardingView({ user, onComplete }: { key?: string, user: User, onComplete: (profile: ChildProfile) => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8 mt-10"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-blue-100 text-blue-600 shadow-sm border border-blue-200">
          <Baby className="w-10 h-10" />
        </div>
        <h2 className="text-[32px] sm:text-[40px] font-extrabold text-slate-900 tracking-tight leading-[1.1]">
          Profil Anak
        </h2>
        <p className="text-slate-600 sm:text-lg font-medium">
          Silakan isi data anak Anda terlebih dahulu untuk menyesuaikan informasi perkembangan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-[24px] border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-[13px] font-bold uppercase tracking-wider text-slate-600">Nama Lengkap Anak</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-colors font-medium text-slate-800 placeholder:text-slate-400"
            placeholder="e.g. Arjuna Putra"
            maxLength={100}
          />
        </div>

        <div className="space-y-3">
           <label className="text-[13px] font-bold uppercase tracking-wider text-slate-600">Jenis Kelamin</label>
           <div className="grid grid-cols-2 gap-4">
             <button
                type="button"
                onClick={() => setGender('Laki-laki')}
                className={`py-4 rounded-xl border-2 font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${
                  gender === 'Laki-laki' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                }`}
             >
                👦 Laki-laki
             </button>
             <button
                type="button"
                onClick={() => setGender('Perempuan')}
                className={`py-4 rounded-xl border-2 font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${
                  gender === 'Perempuan' 
                    ? 'border-pink-500 bg-pink-50 text-pink-700' 
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                }`}
             >
                👧 Perempuan
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[13px] font-bold uppercase tracking-wider text-slate-600">Usia (Bulan)</label>
            <input
              type="number"
              required
              min="0"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-colors font-medium text-slate-800 placeholder:text-slate-400"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold uppercase tracking-wider text-slate-600">Tinggi Badan (cm)</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-colors font-medium text-slate-800 placeholder:text-slate-400"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold uppercase tracking-wider text-slate-600">Berat Badan (kg)</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-colors font-medium text-slate-800 placeholder:text-slate-400"
              placeholder="0.0"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white bg-blue-500 hover:bg-blue-600 font-extrabold text-[16px] tracking-wider rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                SIMPAN PROFIL <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
