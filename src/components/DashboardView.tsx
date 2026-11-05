import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ChildProfile, AgeCategory, QuestionnaireResult, GrowthRecord, UserProfile } from '../types';
import { 
  Baby, LineChart, Play, ChevronRight, Calculator, Ruler, Scale, History, 
  CheckCircle2, AlertCircle, Activity, ChevronDown, Plus, ArrowUpRight, 
  Bell, AlertTriangle, Map as MapIcon, Edit3, Trash2, Save, X, CircleDot, 
  Download, RotateCcw, Calendar, FileText, Sparkles, User, Info, ArrowRight
} from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';
import { cn, formatIndonesianName } from '../lib/utils';
import PuskesmasMapModal from './PuskesmasMapModal';
import StatusBadge from './domain/StatusBadge';
import { useLanguage } from '../contexts/LanguageContext';

// Standard WHO Median estimates based on month and gender
function getWhoMedianValue(month: number, isBoy: boolean, metric: 'weight' | 'height' | 'head'): number {
  if (metric === 'weight') {
    // WHO Weight-for-age median approximation (0-72 months)
    const base = isBoy ? 3.3 : 3.2;
    if (month <= 12) {
      return +(base + (isBoy ? 6.3 : 5.7) * Math.pow(month / 12, 0.7)).toFixed(1);
    }
    const weight12 = isBoy ? 9.6 : 8.9;
    return +(weight12 + (month - 12) * 0.18).toFixed(1);
  }
  if (metric === 'height') {
    // WHO Length/Height-for-age median approximation
    const base = isBoy ? 49.9 : 49.1;
    if (month <= 12) {
      return +(base + (isBoy ? 25.8 : 24.9) * Math.pow(month / 12, 0.72)).toFixed(1);
    }
    const height12 = isBoy ? 75.7 : 74.0;
    return +(height12 + (month - 12) * 0.7).toFixed(1);
  }
  // Head circumference median approximation
  const base = isBoy ? 34.5 : 33.9;
  if (month <= 12) {
    return +(base + (isBoy ? 11.6 : 11.1) * Math.pow(month / 12, 0.65)).toFixed(1);
  }
  const head12 = isBoy ? 46.1 : 45.0;
  return +(head12 + (month - 12) * 0.08).toFixed(1);
}

export default function DashboardView({ 
  profiles, 
  activeProfileId, 
  userProfile,
  onSelectProfile, 
  onAddProfile, 
  onStartQuestionnaire,
  onViewHistoryDetail,
  onUpdateProfile
}: { 
  key?: string;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  userProfile?: UserProfile | null;
  onSelectProfile: (id: string | null) => void;
  onAddProfile: () => void;
  onStartQuestionnaire: (age: AgeCategory) => void;
  onViewHistoryDetail: (history: QuestionnaireResult) => void;
  onUpdateProfile?: (profile: ChildProfile) => void;
}) {
  const [history, setHistory] = useState<QuestionnaireResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showAgeSelectModal, setShowAgeSelectModal] = useState(false);
  const [ageOptions, setAgeOptions] = useState<number[]>([]);
  const { language, t } = useLanguage();

  const profile = profiles.find(p => p.id === activeProfileId);
  const isBoy = profile?.gender === 'Laki-laki';

  const parentName = useMemo(() => {
    return formatIndonesianName(userProfile?.name, auth.currentUser?.email);
  }, [userProfile?.name, auth.currentUser?.email]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser || !activeProfileId) return;
      setLoadingHistory(true);
      try {
        const q = query(
          collection(db, 'questionnaireResults'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
            } as QuestionnaireResult;
          })
          .filter(result => result.profileId === activeProfileId);
        setHistory(results);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [activeProfileId]);
  
  // Growth Tracking States & Handlers
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'height' | 'head' | 'all'>('weight');
  const [isGrowthModalOpen, setIsGrowthModalOpen] = useState(false);
  const [editingRecordMonth, setEditingRecordMonth] = useState<number | null>(null);

  // Form states for manual growth entry
  const [formMonth, setFormMonth] = useState<number>(6);
  const [formWeight, setFormWeight] = useState<string>('7.5');
  const [formHeight, setFormHeight] = useState<string>('65');
  const [formHeadCircumference, setFormHeadCircumference] = useState<string>('42');
  const [formDate, setFormDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [formNote, setFormNote] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Generate realistic WHO / Kemenkes baseline trajectory
  const getInitialBaselineRecords = (prof: ChildProfile): GrowthRecord[] => {
    const age = prof.ageInMonths || 6;
    const currentWeight = prof.weightKg || 7.5;
    const currentHeight = prof.heightCm || 65;
    const currentHead = prof.headCircumferenceCm || 42;
    const isChildBoy = prof.gender === 'Laki-laki';

    // Birth baseline estimates (WHO median)
    const birthWeight = isChildBoy ? 3.3 : 3.2;
    const birthHeight = isChildBoy ? 49.9 : 49.1;
    const birthHead = isChildBoy ? 34.5 : 33.9;

    const records: GrowthRecord[] = [];
    const milestoneSteps = [0, 1, 2, 3, 4, 5, 6, 9, 12, 15, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72];
    const steps = milestoneSteps.filter(m => m <= age);
    if (!steps.includes(age)) steps.push(age);

    steps.sort((a, b) => a - b).forEach(m => {
      if (m === 0) {
        records.push({
          month: 0,
          weightKg: +birthWeight.toFixed(1),
          heightCm: +birthHeight.toFixed(1),
          headCircumferenceCm: +birthHead.toFixed(1),
          date: 'Saat Lahir',
          note: 'Data Lahir (Standar WHO)'
        });
      } else if (m === age) {
        records.push({
          month: age,
          weightKg: +currentWeight.toFixed(1),
          heightCm: +currentHeight.toFixed(1),
          headCircumferenceCm: +currentHead.toFixed(1),
          date: format(new Date(), 'yyyy-MM-dd'),
          note: 'Pengukuran Terkini'
        });
      } else {
        const ratio = age > 0 ? m / age : 0;
        const growthFactor = Math.pow(ratio, 0.7);
        const interpolatedWeight = birthWeight + (currentWeight - birthWeight) * growthFactor;
        const interpolatedHeight = birthHeight + (currentHeight - birthHeight) * growthFactor;
        const interpolatedHead = birthHead + (currentHead - birthHead) * growthFactor;

        records.push({
          month: m,
          weightKg: +interpolatedWeight.toFixed(1),
          heightCm: +interpolatedHeight.toFixed(1),
          headCircumferenceCm: +interpolatedHead.toFixed(1),
          date: `Bulan ke-${m}`,
          note: 'Standar WHO'
        });
      }
    });

    return records;
  };

  // Load and cache growth records when active profile changes
  useEffect(() => {
    if (!profile) return;
    const cacheKey = `growth_records_${profile.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGrowthRecords(parsed);
          return;
        }
      } catch (e) {
        console.error("Error reading cached growth records", e);
      }
    }

    if (profile.growthHistory && profile.growthHistory.length > 0) {
      setGrowthRecords(profile.growthHistory);
      if (profile.id) {
        localStorage.setItem(cacheKey, JSON.stringify(profile.growthHistory));
      }
    } else {
      const initial = getInitialBaselineRecords(profile);
      setGrowthRecords(initial);
      if (profile.id) {
        localStorage.setItem(cacheKey, JSON.stringify(initial));
      }
    }
  }, [profile?.id]);

  // Real data prepared for chart visualization with WHO median baseline
  const chartData = useMemo(() => {
    return growthRecords.map(rec => {
      const metricKey = selectedMetric === 'all' || selectedMetric === 'weight' ? 'weight' : selectedMetric;
      const whoMedian = getWhoMedianValue(rec.month, isBoy, metricKey);
      return {
        rawMonth: rec.month,
        month: `Bln ${rec.month}`,
        weight: rec.weightKg,
        height: rec.heightCm,
        head: rec.headCircumferenceCm || 0,
        whoMedian,
        date: rec.date || '',
        note: rec.note || ''
      };
    });
  }, [growthRecords, isBoy, selectedMetric]);

  const latestGrowthRecord = useMemo(() => {
    if (!growthRecords || growthRecords.length === 0) return null;
    return growthRecords[growthRecords.length - 1];
  }, [growthRecords]);

  const handleOpenGrowthModal = (rec?: GrowthRecord) => {
    if (rec) {
      setEditingRecordMonth(rec.month);
      setFormMonth(rec.month);
      setFormWeight(String(rec.weightKg));
      setFormHeight(String(rec.heightCm));
      setFormHeadCircumference(String(rec.headCircumferenceCm || 40));
      setFormDate(rec.date && rec.date.includes('-') ? rec.date : format(new Date(), 'yyyy-MM-dd'));
      setFormNote(rec.note || '');
    } else {
      setEditingRecordMonth(null);
      const currentAge = profile?.ageInMonths ?? 6;
      setFormMonth(currentAge);
      setFormWeight(String(profile?.weightKg ?? 7.5));
      setFormHeight(String(profile?.heightCm ?? 65));
      setFormHeadCircumference(String(profile?.headCircumferenceCm ?? 42));
      setFormDate(format(new Date(), 'yyyy-MM-dd'));
      setFormNote('');
    }
    setSaveStatus('idle');
    setIsGrowthModalOpen(true);
  };

  const handleSaveGrowthRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const monthNum = parseInt(String(formMonth), 10);
    const weightNum = parseFloat(String(formWeight));
    const heightNum = parseFloat(String(formHeight));
    const headNum = parseFloat(String(formHeadCircumference));

    if (isNaN(monthNum) || monthNum < 0) return;
    if (isNaN(weightNum) || weightNum <= 0) return;
    if (isNaN(heightNum) || heightNum <= 0) return;
    if (isNaN(headNum) || headNum <= 0) return;

    setSaveStatus('saving');

    const newRecord: GrowthRecord = {
      month: monthNum,
      weightKg: weightNum,
      heightCm: heightNum,
      headCircumferenceCm: headNum,
      date: formDate || format(new Date(), 'yyyy-MM-dd'),
      note: formNote.trim() || undefined
    };

    let updatedRecords = [...growthRecords];
    const existingIdx = updatedRecords.findIndex(r => r.month === monthNum);
    if (existingIdx >= 0) {
      updatedRecords[existingIdx] = newRecord;
    } else {
      updatedRecords.push(newRecord);
    }

    updatedRecords.sort((a, b) => a.month - b.month);
    setGrowthRecords(updatedRecords);

    if (profile.id) {
      localStorage.setItem(`growth_records_${profile.id}`, JSON.stringify(updatedRecords));
    }

    const latestRec = updatedRecords[updatedRecords.length - 1];
    const updatedProfile: ChildProfile = {
      ...profile,
      weightKg: latestRec.weightKg,
      heightCm: latestRec.heightCm,
      headCircumferenceCm: latestRec.headCircumferenceCm,
      growthHistory: updatedRecords
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }

    if (auth.currentUser && profile.id) {
      try {
        const docRef = doc(db, 'childProfiles', profile.id);
        await updateDoc(docRef, {
          userId: auth.currentUser.uid,
          name: profile.name,
          gender: profile.gender,
          ageInMonths: profile.ageInMonths,
          weightKg: latestRec.weightKg,
          heightCm: latestRec.heightCm,
          headCircumferenceCm: latestRec.headCircumferenceCm,
          growthHistory: updatedRecords,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Preserved in local storage (Firestore update deferred):", err);
      }
    }

    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
      setIsGrowthModalOpen(false);
    }, 600);
  };

  const handleExportCsv = () => {
    if (!growthRecords || growthRecords.length === 0) return;
    const childName = profile?.name || 'Anak';
    const headers = ['Bulan Ke', 'Usia (Bulan)', 'Berat Badan (kg)', 'Tinggi Badan (cm)', 'Lingkar Kepala (cm)', 'Tanggal', 'Catatan'];
    const rows = growthRecords.map(r => [
      `Bulan ${r.month}`,
      r.month,
      r.weightKg,
      r.heightCm,
      r.headCircumferenceCm || '-',
      `"${r.date || '-'}"`,
      `"${(r.note || '-').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Grafik_Pertumbuhan_${childName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const latestScreening = history.length > 0 ? history[0] : null;

  if (!profile) return null;

  const isTimeForScreening = history.length === 0 || (latestScreening && differenceInMonths(new Date(), new Date(latestScreening.createdAt)) >= 3);

  const AVAILABLE_AGES = [3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, 72];
  
  const handleStartClicked = () => {
    if (!profile) return;
    const months = profile.ageInMonths;
    if (months < 3) {
      onStartQuestionnaire('3_bulan');
      return;
    }
    if (AVAILABLE_AGES.includes(months)) {
      onStartQuestionnaire(`${months}_bulan` as AgeCategory);
    } else {
      let options = [...AVAILABLE_AGES];
      options.sort((a, b) => Math.abs(a - months) - Math.abs(b - months));
      let closest = options.slice(0, 2);
      closest.sort((a, b) => a - b);
      setAgeOptions(closest);
      setShowAgeSelectModal(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full mx-auto space-y-6 pb-20 lg:pb-8 font-sans"
    >
      {/* Alert Jadwal Skrining Berikutnya per Section 4.3 */}
      {isTimeForScreening && !loadingHistory && (
        <div className="bg-[#F0FDFA] dark:bg-teal-950/30 border border-[#99F6E4] dark:border-teal-800/60 rounded-3xl p-5 flex items-start gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#0F766E]/10 dark:bg-teal-900/50 flex items-center justify-center shrink-0 text-[#0F766E] dark:text-[#5EEAD4]">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#0F766E] dark:text-[#5EEAD4] text-base mb-1">
              {t('dashboard.screening_time')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
              {history.length === 0 
                ? t('dashboard.screening_desc_1')
                : t('dashboard.screening_desc_2')}
            </p>
            <button 
               onClick={handleStartClicked}
               className="h-11 px-5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('dashboard.start_screening')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Card Sapaan & Child Switcher (Teal Primary-700 / 900) */}
      <div className="rounded-3xl p-6 sm:p-8 md:p-10 relative flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl text-white z-20">
         {/* Background layer with overflow-hidden to clip blur bubble while allowing dropdown to float */}
         <div className="absolute inset-0 bg-gradient-to-br from-[#0F766E] via-[#115E59] to-[#134E4A] rounded-3xl overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
         </div>

         <div className="relative z-10 w-full md:w-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {t('dashboard.hello')}, {parentName} <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-teal-100/90 text-sm sm:text-base font-medium mt-1.5">
              {t('dashboard.greeting', { name: profile?.name || '' })}
            </p>
         </div>

         <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
             <button 
               onClick={() => setIsMapOpen(true)}
               className="flex-1 md:flex-none justify-center h-11 px-4 sm:px-5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border border-white/15 cursor-pointer"
             >
               <MapIcon className="w-4 h-4" /> 
               <span>{t('dashboard.search_clinic')}</span>
             </button>

             <button 
               onClick={handleStartClicked}
               className="flex-1 md:flex-none justify-center h-11 px-5 sm:px-6 bg-white hover:bg-teal-50 text-[#0F766E] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98 shrink-0"
             >
               <Plus className="w-4 h-4 stroke-[2.5]" /> 
               <span>{t('dashboard.screening')}</span>
             </button>

             {/* ChildSwitcher Selector per Section 4.3 */}
             <div className="relative w-full md:w-auto mt-1 md:mt-0">
                 <button 
                   onClick={() => setShowProfileMenu(!showProfileMenu)}
                   className="w-full md:w-auto justify-center h-11 px-4 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs sm:text-sm font-bold transition-all border border-white/20 shadow-xs flex items-center gap-2 cursor-pointer"
                 >
                   <span className="text-base leading-none">{profile.gender === 'Perempuan' ? '👧' : '👦'}</span>
                   <span className="truncate max-w-[120px]">{profile.name}</span>
                   <ChevronDown className="w-4 h-4 ml-0.5 opacity-80" />
                 </button>
                 
                 <AnimatePresence>
                    {showProfileMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowProfileMenu(false)}
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#111A2B] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-50 text-slate-800 dark:text-slate-100"
                        >
                          <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Pilih Profil Anak
                          </div>
                        {profiles.map(p => (
                          <button 
                            key={p.id} 
                            onClick={() => {
                              onSelectProfile(p.id!);
                              setShowProfileMenu(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors text-xs sm:text-sm font-semibold cursor-pointer",
                              p.id === activeProfileId ? "bg-[#F0FDFA] dark:bg-teal-950/40 text-[#0F766E] dark:text-[#5EEAD4]" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                          >
                             <div className="flex items-center gap-2.5">
                               <span className="text-base leading-none">{p.gender === 'Perempuan' ? '👧' : '👦'}</span>
                               <span className="truncate max-w-[120px]">{p.name}</span>
                             </div>
                             <span className="text-[11px] font-medium text-slate-400 tabular-nums">{p.ageInMonths} bln</span>
                          </button>
                        ))}
                        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                          <button 
                            onClick={() => {
                              onAddProfile();
                              setShowProfileMenu(false);
                            }}
                            className="w-full justify-center h-10 px-3 flex items-center gap-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl transition-all text-xs font-bold shadow-xs cursor-pointer"
                          >
                             <Plus className="w-4 h-4" />
                             <span>{t('dashboard.add_new_child')}</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                 </AnimatePresence>
             </div>
         </div>
      </div>

      {/* Row 1: Stat Cards with Tabular Numerals & High Contrast */}
      <div className="flex items-center justify-between mb-1 px-1">
         <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{t('dashboard.overview')}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Usia */}
        <div className="bg-white dark:bg-[#111A2B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-card hover:shadow-raised transition-all">
           <div className="flex justify-between items-start">
             <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{t('dashboard.child_age')}</span>
             <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
               <span className="text-sm">{profile.gender === 'Perempuan' ? '👧' : '👦'}</span>
             </div>
           </div>
           <div className="mt-4">
             <div className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white tabular-nums mb-1">
               {profile.ageInMonths}
             </div>
             <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{t('dashboard.month')}</span>
                <span>{t('dashboard.actual')}</span>
             </div>
           </div>
        </div>

        {/* Card 2: Tinggi Badan */}
        <div className="bg-white dark:bg-[#111A2B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-card hover:shadow-raised transition-all">
           <div className="flex justify-between items-start">
             <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{t('dashboard.height')}</span>
             <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#0284C7] dark:text-sky-300 flex items-center justify-center">
               <Ruler className="w-4 h-4" />
             </div>
           </div>
           <div className="mt-4">
             <div className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white tabular-nums mb-1">
               {profile.heightCm}
             </div>
             <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">cm</span>
                <span>{t('dashboard.current')}</span>
             </div>
           </div>
        </div>

        {/* Card 3: Berat Badan */}
        <div className="bg-white dark:bg-[#111A2B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-card hover:shadow-raised transition-all">
           <div className="flex justify-between items-start">
             <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{t('dashboard.weight')}</span>
             <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
               <Scale className="w-4 h-4" />
             </div>
           </div>
           <div className="mt-4">
             <div className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white tabular-nums mb-1">
               {profile.weightKg}
             </div>
             <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">kg</span>
                <span>{t('dashboard.current')}</span>
             </div>
           </div>
        </div>

        {/* Card 4: Skor Skrining Terakhir */}
        <div className="bg-white dark:bg-[#111A2B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-card hover:shadow-raised transition-all">
           <div className="flex justify-between items-start">
             <span className="font-semibold text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{t('dashboard.last_score')}</span>
             <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center">
               <Activity className="w-4 h-4" />
             </div>
           </div>
           <div className="mt-4">
             <div className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white tabular-nums mb-1">
               {latestScreening ? latestScreening.totalScore : '-'}
               {latestScreening && <span className="text-base text-slate-400 font-medium ml-0.5">/10</span>}
             </div>
             <div className="text-xs font-semibold">
                {latestScreening ? (
                   <StatusBadge status={latestScreening.totalScore >= 9 ? 'sesuai' : latestScreening.totalScore >= 7 ? 'meragukan' : 'penyimpangan'} size="sm" />
                ) : (
                   <span className="text-slate-400 font-medium">Belum Skrining</span>
                )}
             </div>
           </div>
        </div>
      </div>

      {/* Row 2: Growth Chart (AreaChart + Median WHO Dashed Line #64748B) & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Chart Column (col-span-2) */}
         <div className="lg:col-span-2 bg-white dark:bg-[#111A2B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
               <div>
                  <div className="flex items-center gap-2.5">
                     <h3 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl">{t('dashboard.periodic_growth')}</h3>
                     <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1] dark:bg-teal-950/40 dark:text-[#5EEAD4] dark:border-teal-800/60">
                       Acuan WHO
                     </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                     Garis putus-putus menunjukkan median acuan WHO sesuai usia anak.
                  </p>
               </div>
               
               <div className="flex items-center flex-wrap gap-2">
                 <button 
                   onClick={() => handleOpenGrowthModal()}
                   className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                 >
                   <Edit3 className="w-3.5 h-3.5" />
                   <span>Input / Edit</span>
                 </button>
                 <button 
                   onClick={handleExportCsv}
                   title="Export Data ke CSV"
                   className="h-9 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                 >
                   <Download className="w-3.5 h-3.5" />
                   <span>{t('dashboard.export')}</span>
                 </button>
               </div>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
                  <button
                    onClick={() => setSelectedMetric('weight')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedMetric === 'weight'
                        ? "bg-white dark:bg-slate-900 text-[#0D9488] shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Scale className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>Berat (kg)</span>
                  </button>
                  <button
                    onClick={() => setSelectedMetric('height')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedMetric === 'height'
                        ? "bg-white dark:bg-slate-900 text-[#0284C7] shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Ruler className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Tinggi (cm)</span>
                  </button>
                  <button
                    onClick={() => setSelectedMetric('head')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedMetric === 'head'
                        ? "bg-white dark:bg-slate-900 text-[#7C3AED] shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <CircleDot className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Lingkar Kepala</span>
                  </button>
                  <button
                    onClick={() => setSelectedMetric('all')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedMetric === 'all'
                        ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Semua Metrik</span>
                  </button>
               </div>

               {latestGrowthRecord && (
                 <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
                    <span className="text-[11px] text-slate-400">Terkini ({latestGrowthRecord.month} bln):</span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#F0FDFA] dark:bg-teal-950/40 text-[#0D9488] border border-[#CCFBF1] dark:border-teal-800/60 tabular-nums">
                       ⚖️ {latestGrowthRecord.weightKg} kg
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#F0F9FF] dark:bg-sky-950/40 text-[#0284C7] border border-[#BAE6FD] dark:border-sky-800/60 tabular-nums">
                       📏 {latestGrowthRecord.heightCm} cm
                    </span>
                 </div>
               )}
            </div>

            {/* Interactive Chart Area conforming to Section 2.4 */}
            <div className="h-[280px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.02}/>
                      </linearGradient>
                      <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0284C7" stopOpacity={0.02}/>
                      </linearGradient>
                      <linearGradient id="colorHead" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={['auto', 'auto']}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                    <Tooltip 
                       content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                             const d = payload[0].payload;
                             return (
                                <div className="bg-white dark:bg-[#111A2B] p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 min-w-[220px] text-xs">
                                   <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                                         {label} ({d.rawMonth} Bulan)
                                      </span>
                                      {d.date && <span className="text-[10px] text-slate-400">{d.date}</span>}
                                   </div>
                                   <div className="space-y-1.5 tabular-nums">
                                      <div className="flex items-center justify-between">
                                         <span className="flex items-center gap-1.5 text-slate-500">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]"></span>
                                            Berat Badan:
                                         </span>
                                         <span className="font-bold text-slate-900 dark:text-white">{d.weight} kg</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                         <span className="flex items-center gap-1.5 text-slate-500">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
                                            Tinggi Badan:
                                         </span>
                                         <span className="font-bold text-slate-900 dark:text-white">{d.height} cm</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                         <span className="flex items-center gap-1.5 text-slate-500">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></span>
                                            Lingkar Kepala:
                                         </span>
                                         <span className="font-bold text-slate-900 dark:text-white">{d.head ? d.head + ' cm' : '-'}</span>
                                      </div>
                                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                                         <span className="text-[#64748B] font-medium">Median WHO:</span>
                                         <span className="font-bold text-[#64748B]">{d.whoMedian}</span>
                                      </div>
                                   </div>
                                </div>
                             );
                          }
                          return null;
                       }}
                    />
                    
                    {/* Median WHO Dashed Line (#64748B) */}
                    {selectedMetric !== 'all' && (
                      <Area 
                        type="monotone" 
                        dataKey="whoMedian" 
                        name="Median WHO"
                        stroke="#64748B" 
                        strokeWidth={2} 
                        strokeDasharray="4 4"
                        fill="none" 
                        dot={false}
                      />
                    )}

                    {(selectedMetric === 'weight' || selectedMetric === 'all') && (
                       <Area 
                         type="monotone" 
                         dataKey="weight" 
                         name="Berat (kg)"
                         stroke="#0D9488" 
                         strokeWidth={3} 
                         fillOpacity={1} 
                         fill="url(#colorWeight)" 
                         activeDot={{ r: 5, fill: '#0D9488', stroke: '#fff', strokeWidth: 2 }} 
                       />
                    )}
                    {(selectedMetric === 'height' || selectedMetric === 'all') && (
                       <Area 
                         type="monotone" 
                         dataKey="height" 
                         name="Tinggi (cm)"
                         stroke="#0284C7" 
                         strokeWidth={3} 
                         fillOpacity={1} 
                         fill="url(#colorHeight)" 
                         activeDot={{ r: 5, fill: '#0284C7', stroke: '#fff', strokeWidth: 2 }} 
                       />
                    )}
                    {(selectedMetric === 'head' || selectedMetric === 'all') && (
                       <Area 
                         type="monotone" 
                         dataKey="head" 
                         name="Lingkar Kepala (cm)"
                         stroke="#7C3AED" 
                         strokeWidth={3} 
                         fillOpacity={1} 
                         fill="url(#colorHead)" 
                         activeDot={{ r: 5, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }} 
                       />
                    )}
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
               <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                  Total {growthRecords.length} titik data pengukuran tercatat
               </span>
               <button
                 onClick={() => handleOpenGrowthModal()}
                 className="text-[#0F766E] dark:text-[#5EEAD4] font-bold hover:underline flex items-center gap-1 cursor-pointer"
               >
                 <span>Kelola Data</span>
                 <ChevronRight className="w-3.5 h-3.5" />
               </button>
            </div>
         </div>

         {/* Riwayat Skrining (Right Col) */}
         <div className="bg-white dark:bg-[#111A2B] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl">{t('dashboard.history')}</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Arsip skrining KPSP berkala</p>
                 </div>
                 <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg tabular-nums">
                   {history.length} Skrining
                 </span>
              </div>
              
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                 {loadingHistory ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium">{t('dashboard.loading')}</div>
                 ) : history.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                      {t('dashboard.no_history')}
                    </div>
                 ) : (
                    history.map((result) => {
                       const formattedDate = format(new Date(result.createdAt), "dd MMM yyyy", { locale: language === 'id' ? idLocale : enUS });

                       return (
                         <button 
                           onClick={() => onViewHistoryDetail(result)} 
                           key={result.id} 
                           className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#0F766E] hover:bg-[#F0FDFA]/50 dark:hover:bg-teal-950/20 transition-all text-left cursor-pointer group"
                         >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                 <FileText className="w-5 h-5 text-slate-500 group-hover:text-[#0F766E] transition-colors" />
                              </div>
                              <div>
                                 <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                   KPSP {result.ageCategory.replace('_', ' ')}
                                 </div>
                                 <div className="text-[11px] text-slate-400 font-medium">{formattedDate}</div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white tabular-nums">
                                {result.totalScore}/10
                              </span>
                              <StatusBadge status={result.totalScore >= 9 ? 'sesuai' : result.totalScore >= 7 ? 'meragukan' : 'penyimpangan'} size="sm" showIcon={false} />
                            </div>
                         </button>
                       )
                    })
                 )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
               <button 
                 onClick={handleStartClicked} 
                 className="w-full h-11 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs sm:text-sm font-bold rounded-xl flex justify-center items-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
               >
                  <Plus className="w-4 h-4" />
                  <span>{t('dashboard.create_new_screening')}</span>
               </button>
            </div>
         </div>
      </div>

      <PuskesmasMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />

      {/* Modal Input Pertumbuhan Manual */}
      <AnimatePresence>
        {isGrowthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#111A2B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl relative my-8 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] dark:bg-teal-950/40 text-[#0F766E] flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {editingRecordMonth !== null ? 'Edit Data Pengukuran' : 'Catat Data Pertumbuhan'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tinggi, berat, dan lingkar kepala untuk {profile?.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGrowthModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveGrowthRecord} className="space-y-4 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Usia Bulan Ke
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="72"
                      value={formMonth}
                      onChange={(e) => setFormMonth(parseInt(e.target.value) || 0)}
                      disabled={editingRecordMonth !== null}
                      className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tanggal Ukur
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Berat (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value)}
                      className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tinggi (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formHeight}
                      onChange={(e) => setFormHeight(e.target.value)}
                      className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      LK (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formHeadCircumference}
                      onChange={(e) => setFormHeadCircumference(e.target.value)}
                      className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="Contoh: Pengukuran Posyandu Melati"
                    className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsGrowthModalOpen(false)}
                    className="h-11 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan Data'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Pilihan Usia KPSP */}
      <AnimatePresence>
        {showAgeSelectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#111A2B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                Pilih Kelompok Usia Skrining
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Usia ananda saat ini ({profile.ageInMonths} bulan) berada di antara kelompok usia KPSP standar. Silakan pilih kuesioner yang paling sesuai:
              </p>
              <div className="space-y-3">
                {ageOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setShowAgeSelectModal(false);
                      onStartQuestionnaire(`${opt}_bulan` as AgeCategory);
                    }}
                    className="w-full p-4 rounded-2xl border-2 border-[#0F766E]/30 bg-[#F0FDFA] dark:bg-teal-950/40 hover:border-[#0F766E] hover:bg-[#CCFBF1]/50 text-left transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#0F766E] dark:text-[#5EEAD4]">
                        Kuesioner {opt} Bulan
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {opt < profile.ageInMonths ? 'Evaluasi kemampuan dasar' : 'Evaluasi kemampuan lanjutan'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0F766E]" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowAgeSelectModal(false)}
                className="mt-6 w-full h-11 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl"
              >
                Batal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
