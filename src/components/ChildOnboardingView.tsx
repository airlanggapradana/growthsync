import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChildProfile } from '../types';
import { Baby, Loader2, ArrowRight, ArrowLeft, Check, Sparkles, Ruler, Scale } from 'lucide-react';
import { User } from 'firebase/auth';
import { cn } from '../lib/utils';
import { differenceInMonths } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

export default function ChildOnboardingView({ user, onComplete }: { key?: string, user: User, onComplete: (profile: ChildProfile) => void }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [computedAgeInMonths, setComputedAgeInMonths] = useState<number | null>(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan' | ''>('');
  const [loading, setLoading] = useState(false);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!gender) {
      alert(t('onboarding.alert_gender'));
      return;
    }
    if (computedAgeInMonths === null) {
      alert(t('onboarding.alert_dob'));
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!height || !weight) return;

    setLoading(true);
    try {
      const profileData: ChildProfile = {
        name,
        birthDate,
        ageInMonths: computedAgeInMonths || 0,
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
      setStep(3);
      setTimeout(() => {
        onComplete({ id: profileId, ...profileData });
      }, 1200);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data profil anak.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto space-y-6 py-4"
    >
      {/* 3-Step Stepper Sesuai Section 4.2 */}
      <div className="flex items-center justify-between px-4 sm:px-8 mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors",
            step >= 1 ? "bg-[#0F766E] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
          )}>
            1
          </div>
          <span className={cn("text-xs font-semibold hidden sm:inline", step >= 1 ? "text-slate-900 dark:text-white" : "text-slate-400")}>
            Identitas
          </span>
        </div>

        <div className={cn("flex-1 h-0.5 mx-3 transition-colors", step >= 2 ? "bg-[#0F766E]" : "bg-slate-200 dark:bg-slate-800")} />

        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors",
            step >= 2 ? "bg-[#0F766E] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
          )}>
            2
          </div>
          <span className={cn("text-xs font-semibold hidden sm:inline", step >= 2 ? "text-slate-900 dark:text-white" : "text-slate-400")}>
            Pengukuran
          </span>
        </div>

        <div className={cn("flex-1 h-0.5 mx-3 transition-colors", step === 3 ? "bg-[#0F766E]" : "bg-slate-200 dark:bg-slate-800")} />

        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors",
            step === 3 ? "bg-[#0F766E] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
          )}>
            3
          </div>
          <span className={cn("text-xs font-semibold hidden sm:inline", step === 3 ? "text-slate-900 dark:text-white" : "text-slate-400")}>
            Selesai
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111A2B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              onSubmit={handleNextStep1} 
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#F0FDFA] dark:bg-teal-950/40 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Identitas Buah Hati</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Masukkan nama lengkap dan tanggal lahir anak</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('onboarding.name')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] focus:ring-2 focus:ring-[#99F6E4] rounded-xl outline-none transition-all text-sm text-slate-900 dark:text-white"
                  placeholder="Contoh: Muhammad Rayhan"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('onboarding.gender')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('Laki-laki')}
                    className={cn(
                      "h-12 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer",
                      gender === 'Laki-laki' 
                        ? "border-[#0284C7] bg-[#F0F9FF] dark:bg-sky-950/40 text-[#0284C7] dark:text-sky-300 ring-1 ring-[#0284C7]" 
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    )}
                  >
                    <span>👦</span> {t('onboarding.boy')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('Perempuan')}
                    className={cn(
                      "h-12 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer",
                      gender === 'Perempuan' 
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500" 
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    )}
                  >
                    <span>👧</span> {t('onboarding.girl')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('onboarding.dob')}
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    if (e.target.value) {
                      const months = differenceInMonths(new Date(), new Date(e.target.value));
                      setComputedAgeInMonths(Math.max(0, months));
                    } else {
                      setComputedAgeInMonths(null);
                    }
                  }}
                  className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] focus:ring-2 focus:ring-[#99F6E4] rounded-xl outline-none transition-all text-sm text-slate-900 dark:text-white"
                />
                {computedAgeInMonths !== null && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0FDFA] dark:bg-teal-950/40 text-[#0F766E] dark:text-[#5EEAD4] text-xs font-bold border border-[#CCFBF1] dark:border-teal-800/60">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Usia Terhitung: {computedAgeInMonths} Bulan</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <span>Lanjutkan ke Pengukuran</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              onSubmit={handleSubmit} 
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#F0F9FF] dark:bg-sky-950/40 text-[#0284C7] dark:text-sky-300 flex items-center justify-center">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Pengukuran Fisik Pertama</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Data berat dan tinggi untuk kurva pertumbuhan WHO</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('dashboard.weight')} (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="40"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full h-12 pl-4 pr-12 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] focus:ring-2 focus:ring-[#99F6E4] rounded-xl outline-none transition-all text-sm text-slate-900 dark:text-white"
                      placeholder="Contoh: 7.5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('dashboard.height')} (cm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="30"
                      max="140"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full h-12 pl-4 pr-12 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] focus:ring-2 focus:ring-[#99F6E4] rounded-xl outline-none transition-all text-sm text-slate-900 dark:text-white"
                      placeholder="Contoh: 65.0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">cm</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Lingkar Kepala (cm) - Opsional
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="25"
                    max="60"
                    step="0.1"
                    value={headCirc}
                    onChange={(e) => setHeadCirc(e.target.value)}
                    className="w-full h-12 pl-4 pr-12 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] focus:ring-2 focus:ring-[#99F6E4] rounded-xl outline-none transition-all text-sm text-slate-900 dark:text-white"
                    placeholder="Contoh: 42.0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">cm</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 px-5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Simpan & Selesai</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#15803D] dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Profil Berhasil Dibuat!</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Memuat dasbor tumbuh kembang untuk {name}...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
