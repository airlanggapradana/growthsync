import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ChildProfile, AgeCategory, QuestionnaireResult, GrowthRecord } from '../types';
import { 
  Baby, LineChart, Play, ChevronRight, Calculator, Ruler, Scale, History, 
  CheckCircle2, AlertCircle, Activity, ChevronDown, Plus, ArrowUpRight, 
  Bell, AlertTriangle, Map as MapIcon, Edit3, Trash2, Save, X, CircleDot, 
  Download, RotateCcw, Calendar, FileText, Sparkles
} from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';
import { cn } from '../lib/utils';
import PuskesmasMapModal from './PuskesmasMapModal';
import { useLanguage } from '../contexts/LanguageContext';

export default function DashboardView({ 
  profiles, 
  activeProfileId, 
  onSelectProfile, 
  onAddProfile, 
  onStartQuestionnaire,
  onViewHistoryDetail,
  onUpdateProfile
}: { 
  key?: string;
  profiles: ChildProfile[];
  activeProfileId: string | null;
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
    const isBoy = prof.gender === 'Laki-laki';

    // Birth baseline estimates (WHO median)
    const birthWeight = isBoy ? 3.3 : 3.2;
    const birthHeight = isBoy ? 49.9 : 49.1;
    const birthHead = isBoy ? 34.5 : 33.9;

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

  // Real data prepared for chart visualization
  const chartData = useMemo(() => {
    return growthRecords.map(rec => ({
      rawMonth: rec.month,
      month: `Bln ${rec.month}`,
      weight: rec.weightKg,
      height: rec.heightCm,
      head: rec.headCircumferenceCm || 0,
      date: rec.date || '',
      note: rec.note || ''
    }));
  }, [growthRecords]);

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

  const handleDeleteRecord = async (monthToDelete: number) => {
    if (growthRecords.length <= 1) {
      alert("Minimal harus ada satu titik data pengukuran.");
      return;
    }

    const updatedRecords = growthRecords.filter(r => r.month !== monthToDelete);
    setGrowthRecords(updatedRecords);

    if (profile?.id) {
      localStorage.setItem(`growth_records_${profile.id}`, JSON.stringify(updatedRecords));
    }

    if (profile) {
      const latestRec = updatedRecords[updatedRecords.length - 1];
      const updatedProfile: ChildProfile = {
        ...profile,
        weightKg: latestRec.weightKg,
        heightCm: latestRec.heightCm,
        headCircumferenceCm: latestRec.headCircumferenceCm,
        growthHistory: updatedRecords
      };
      if (onUpdateProfile) onUpdateProfile(updatedProfile);

      if (auth.currentUser && profile.id) {
        try {
          const docRef = doc(db, 'childProfiles', profile.id);
          await updateDoc(docRef, {
            weightKg: latestRec.weightKg,
            heightCm: latestRec.heightCm,
            headCircumferenceCm: latestRec.headCircumferenceCm,
            growthHistory: updatedRecords,
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          console.warn("Sync delete to Firestore deferred:", err);
        }
      }
    }
  };

  const handleResetToWho = () => {
    if (!profile) return;
    if (confirm("Kembalikan kurva data ke acuan standar WHO/Kemenkes?")) {
      const initial = getInitialBaselineRecords(profile);
      setGrowthRecords(initial);
      if (profile.id) {
        localStorage.setItem(`growth_records_${profile.id}`, JSON.stringify(initial));
      }
    }
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
  let latestStatusText = "";
  let latestStatusColor = "";

  if (latestScreening) {
    if (latestScreening.totalScore < 7) {
      latestStatusText = "Ada Penyimpangan";
      latestStatusColor = "bg-red-50 text-red-700 border-red-200";
    } else if (latestScreening.totalScore < 9) {
      latestStatusText = "Meragukan";
      latestStatusColor = "bg-amber-50 text-amber-700 border-amber-200";
    } else {
      latestStatusText = "Sesuai";
      latestStatusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  }

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
      // Get the closest 2 options
      let closest = options.slice(0, 2);
      // Sort them ascending
      closest.sort((a, b) => a - b);
      setAgeOptions(closest);
      setShowAgeSelectModal(true);
    }
  };

  const getRecommendedAgeCategory = (months: number): AgeCategory => {
     if (months < 4.5) return '3_bulan';
     if (months < 7.5) return '6_bulan';
     if (months < 10.5) return '9_bulan';
     if (months < 13.5) return '12_bulan';
     if (months < 16.5) return '15_bulan';
     if (months < 19.5) return '18_bulan';
     if (months < 22.5) return '21_bulan';
     if (months < 27) return '24_bulan';
     if (months < 33) return '30_bulan';
     if (months < 39) return '36_bulan';
     if (months < 45) return '42_bulan';
     if (months < 51) return '48_bulan';
     if (months < 57) return '54_bulan';
     if (months < 63) return '60_bulan';
     if (months < 69) return '66_bulan';
     return '72_bulan';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full mx-auto space-y-6"
    >
      {isTimeForScreening && !loadingHistory && (
        <div className="bg-[#8cc63f]/10 dark:bg-[#8cc63f]/5 border border-[#8cc63f]/20 dark:border-[#8cc63f]/15 rounded-3xl p-5 flex items-start gap-4 shadow-sm mb-6 animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-full bg-[#8cc63f]/20 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-[#263c32] dark:text-[#bef264]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#263c32] dark:text-[#bef264] mb-1">
              {t('dashboard.screening_time')}
            </h3>
            <p className="text-sm font-medium text-[#263c32]/80 dark:text-[#bef264]/80 mb-3 leading-relaxed">
              {history.length === 0 
                ? t('dashboard.screening_desc_1')
                : t('dashboard.screening_desc_2')}
            </p>
            <button 
               onClick={handleStartClicked}
               className="px-5 py-2.5 bg-[#8cc63f] hover:bg-[#7cb435] text-[#1e3025] rounded-full text-sm font-bold transition-colors shadow-sm"
            >
              {t('dashboard.start_screening')}
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#263c32] rounded-[32px] p-8 md:p-10 mb-8 mt-2 relative flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-[#263c32]/20">
         <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
         </div>
         <div className="relative z-10 w-full md:w-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">{t('dashboard.hello')}, {auth.currentUser?.email?.split('@')[0] || t('dashboard.parent')}!! <span className="inline-block animate-wave">👋</span></h1>
            <p className="text-white/70 font-medium mt-2">{t('dashboard.greeting', { name: profile?.name || '' })}</p>
         </div>
         <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
             <button 
               onClick={() => setIsMapOpen(true)}
               className="flex-1 md:flex-none justify-center px-5 py-3 bg-white/10 text-white backdrop-blur-md rounded-full text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
             >
               <MapIcon className="w-4 h-4" /> {t('dashboard.search_clinic')}
             </button>
             <button 
               onClick={handleStartClicked}
               className="flex-1 md:flex-none justify-center px-5 py-3 bg-[#8cc63f] text-[#1e3025] rounded-full text-sm font-bold hover:bg-[#7cb435] transition-colors shadow-sm flex items-center gap-2 relative"
             >
               {isTimeForScreening && !loadingHistory && (
                 <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-[#8cc63f]"></span>
                 </span>
               )}
               <Plus className="w-4 h-4" /> {t('dashboard.screening')}
             </button>
             <div className="relative w-full md:w-auto mt-2 md:mt-0">
                 <button 
                   onClick={() => setShowProfileMenu(!showProfileMenu)}
                   className="w-full md:w-auto justify-center px-5 py-3 bg-white dark:bg-slate-900 text-[#263c32] dark:text-white rounded-full text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
                 >
                   <span className="text-lg leading-none mr-0.5">{profile.gender === 'Perempuan' ? '👧' : '👦'}</span>
                   {t('dashboard.profile')} <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                 </button>
                 
                 <AnimatePresence>
        

                    {showProfileMenu && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden z-50 text-slate-800 dark:text-slate-100"
                      >
                        {profiles.map(p => (
                          <button 
                            key={p.id} 
                            onClick={() => {
                              onSelectProfile(p.id!);
                              setShowProfileMenu(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors text-sm font-semibold",
                              p.id === activeProfileId ? "bg-slate-50 dark:bg-slate-800 text-[#8cc63f]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                            )}
                          >
                             <span className="text-lg leading-none">{p.gender === 'Perempuan' ? '👧' : '👦'}</span>
                             {p.name}
                          </button>
                        ))}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 mt-1">
                          <button 
                            onClick={() => {
                              onAddProfile();
                              setShowProfileMenu(false);
                            }}
                            className="w-full justify-center px-4 py-3 flex items-center gap-2 bg-[#8cc63f] hover:bg-[#7cb435] text-[#1e3025] rounded-xl transition-all text-sm font-bold shadow-sm"
                          >
                             <Plus className="w-4 h-4" />
                             {t('dashboard.add_new_child')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
             </div>
         </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="flex items-center justify-between mb-2 px-2">
         <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('dashboard.overview')}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 lg:p-6 rounded-[28px] relative overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 dark:text-slate-400 text-sm">{t('dashboard.child_age')}</div>
             <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#8cc63f] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
               <span className="text-lg flex leading-none pt-0.5">{profile.gender === 'Perempuan' ? '👧' : '👦'}</span>
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-[#263c32] dark:text-slate-100">{profile.ageInMonths}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{t('dashboard.month')}</span> {t('dashboard.actual')}
             </div>
           </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 lg:p-6 rounded-[28px] relative overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 dark:text-slate-400 text-sm">{t('dashboard.height')}</div>
             <div className="w-8 h-8 bg-[#8cc63f]/10 dark:bg-[#8cc63f]/20 rounded-full flex items-center justify-center text-[#8cc63f] cursor-pointer hover:bg-[#8cc63f]/20 dark:hover:bg-[#8cc63f]/30 transition-colors">
               <ArrowUpRight className="w-4 h-4" />
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-[#263c32] dark:text-slate-100">{profile.heightCm}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">cm</span> {t('dashboard.current')}
             </div>
           </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 lg:p-6 rounded-[28px] relative overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 dark:text-slate-400 text-sm">{t('dashboard.weight')}</div>
             <div className="w-8 h-8 bg-[#8cc63f]/10 dark:bg-[#8cc63f]/20 rounded-full flex items-center justify-center text-[#8cc63f] cursor-pointer hover:bg-[#8cc63f]/20 dark:hover:bg-[#8cc63f]/30 transition-colors">
               <ArrowUpRight className="w-4 h-4" />
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-[#263c32] dark:text-slate-100">{profile.weightKg}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">kg</span> {t('dashboard.current')}
             </div>
           </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 lg:p-6 rounded-[28px] relative overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 dark:text-slate-400 text-sm">{t('dashboard.last_score')}</div>
             <div className="w-8 h-8 bg-[#8cc63f]/10 dark:bg-[#8cc63f]/20 rounded-full flex items-center justify-center text-[#8cc63f] cursor-pointer hover:bg-[#8cc63f]/20 dark:hover:bg-[#8cc63f]/30 transition-colors">
               <ArrowUpRight className="w-4 h-4" />
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-[#263c32] dark:text-slate-100">{latestScreening ? latestScreening.totalScore : '-'}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                {latestScreening ? (
                   latestScreening.totalScore >= 9 ? (
                     <span className="bg-[#8cc63f]/20 text-[#263c32] dark:text-[#8cc63f] px-2 py-0.5 rounded-full">{t('dashboard.age_appropriate')}</span>
                   ) : (
                     <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">{t('dashboard.needs_review')}</span>
                   )
                ) : t('dashboard.none')}
             </div>
           </div>
        </div>
      </div>

      {/* Row 2: Analytics & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Chart - Enhanced with Manual Edit & Multi-Metric (Tinggi, Berat, Usia, Lingkar Kepala) */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            {/* Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
               <div>
                  <div className="flex items-center gap-2.5">
                     <h3 className="font-bold text-[#263c32] dark:text-slate-100 text-xl">{t('dashboard.periodic_growth')}</h3>
                     <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#8cc63f]/15 text-[#263c32] dark:text-[#8cc63f] border border-[#8cc63f]/30">
                       Kemenkes / WHO
                     </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                     Pantau perkembangan tinggi, berat, dan lingkar kepala sesuai usia bulan
                  </p>
               </div>
               
               <div className="flex items-center flex-wrap gap-2">
                 <button 
                   onClick={() => handleOpenGrowthModal()}
                   id="btn-edit-growth-manual"
                   className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#8cc63f] hover:bg-[#7cb435] text-[#1e3025] rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                 >
                   <Edit3 className="w-3.5 h-3.5" />
                   <span>Input / Edit Manual</span>
                 </button>
                 <button 
                   onClick={handleExportCsv}
                   title="Export Data ke CSV"
                   className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                 >
                   <Download className="w-3.5 h-3.5" />
                   <span>{t('dashboard.export')}</span>
                 </button>
               </div>
            </div>

            {/* Metric Toggle & Current Highlights */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setSelectedMetric('weight')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedMetric === 'weight'
                        ? "bg-white dark:bg-slate-900 text-[#263c32] dark:text-slate-100 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Scale className="w-3.5 h-3.5 text-[#8cc63f]" />
                    <span>Berat (kg)</span>
                  </button>
                  <button
                    onClick={() => setSelectedMetric('height')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedMetric === 'height'
                        ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Ruler className="w-3.5 h-3.5 text-sky-500" />
                    <span>Tinggi (cm)</span>
                  </button>
                  <button
                    onClick={() => setSelectedMetric('head')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedMetric === 'head'
                        ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <CircleDot className="w-3.5 h-3.5 text-purple-500" />
                    <span>Lingkar Kepala (cm)</span>
                  </button>
                  <button
                    onClick={() => setSelectedMetric('all')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedMetric === 'all'
                        ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Semua Metrik</span>
                  </button>
               </div>

               {latestGrowthRecord && (
                 <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="text-[11px] text-slate-400">Terkini ({latestGrowthRecord.month} bln):</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#263c32] dark:text-[#8cc63f] border border-emerald-200/50">
                       ⚖️ {latestGrowthRecord.weightKg} kg
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200/50">
                       📏 {latestGrowthRecord.heightCm} cm
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200/50">
                       🎯 {latestGrowthRecord.headCircumferenceCm} cm
                    </span>
                 </div>
               )}
            </div>

            {/* Main Interactive Chart */}
            <div className="flex-1 min-h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8cc63f" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8cc63f" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHead" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={['auto', 'auto']}
                    />
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#cbd5e1" strokeOpacity={0.2} />
                    <Tooltip 
                       content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                             const d = payload[0].payload;
                             return (
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 min-w-[220px] text-xs">
                                   <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                                      <span className="font-extrabold text-[#263c32] dark:text-slate-100 text-sm">
                                         {label} ({d.rawMonth} Bulan)
                                      </span>
                                      {d.date && <span className="text-[10px] text-slate-400">{d.date}</span>}
                                   </div>
                                   <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                         <span className="flex items-center gap-1.5 text-slate-500">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#8cc63f]"></span>
                                            Berat Badan:
                                         </span>
                                         <span className="font-bold text-slate-800 dark:text-slate-200">{d.weight} kg</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                         <span className="flex items-center gap-1.5 text-slate-500">
                                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                                            Tinggi Badan:
                                         </span>
                                         <span className="font-bold text-slate-800 dark:text-slate-200">{d.height} cm</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                         <span className="flex items-center gap-1.5 text-slate-500">
                                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                                            Lingkar Kepala:
                                         </span>
                                         <span className="font-bold text-slate-800 dark:text-slate-200">{d.head ? d.head + ' cm' : '-'}</span>
                                      </div>
                                      {d.note && (
                                         <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 italic">
                                            {d.note}
                                         </div>
                                      )}
                                   </div>
                                </div>
                             );
                          }
                          return null;
                       }}
                    />
                    {(selectedMetric === 'weight' || selectedMetric === 'all') && (
                       <Area 
                         type="monotone" 
                         dataKey="weight" 
                         name="Berat (kg)"
                         stroke="#8cc63f" 
                         strokeWidth={3.5} 
                         fillOpacity={selectedMetric === 'all' ? 0.15 : 1} 
                         fill="url(#colorWeight)" 
                         activeDot={{ r: 6, fill: '#8cc63f', stroke: '#fff', strokeWidth: 2 }} 
                       />
                    )}
                    {(selectedMetric === 'height' || selectedMetric === 'all') && (
                       <Area 
                         type="monotone" 
                         dataKey="height" 
                         name="Tinggi (cm)"
                         stroke="#0284c7" 
                         strokeWidth={3.5} 
                         fillOpacity={selectedMetric === 'all' ? 0.15 : 1} 
                         fill="url(#colorHeight)" 
                         activeDot={{ r: 6, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }} 
                       />
                    )}
                    {(selectedMetric === 'head' || selectedMetric === 'all') && (
                       <Area 
                         type="monotone" 
                         dataKey="head" 
                         name="Lingkar Kepala (cm)"
                         stroke="#8b5cf6" 
                         strokeWidth={3.5} 
                         fillOpacity={selectedMetric === 'all' ? 0.15 : 1} 
                         fill="url(#colorHead)" 
                         activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} 
                       />
                    )}
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            
            {/* Quick action footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
               <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8cc63f]" />
                  Total {growthRecords.length} titik data tercatat
               </span>
               <button
                 onClick={() => handleOpenGrowthModal()}
                 className="text-[#263c32] dark:text-[#8cc63f] font-bold hover:underline flex items-center gap-1 cursor-pointer"
               >
                 <span>Kelola Semua Titik Data</span>
                 <ChevronRight className="w-3.5 h-3.5" />
               </button>
            </div>
         </div>

         {/* Reminders & Project (History) */}
         <div className="bg-[#263c32] rounded-[32px] p-8 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
               <h3 className="font-bold text-white text-xl">{t('dashboard.history')}</h3>
               <button className="w-8 h-8 flex justify-center items-center bg-[#8cc63f]/20 rounded-full hover:bg-[#8cc63f]/30 transition-colors">
                  <Plus className="w-4 h-4 text-[#8cc63f]" />
               </button>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
               {loadingHistory ? (
                  <div className="text-center py-6 text-white/50 text-sm font-medium">{t('dashboard.loading')}</div>
               ) : history.length === 0 ? (
                  <div className="text-center py-8 text-white/50 text-sm font-medium bg-[#1e3025] rounded-[20px] border border-dashed border-white/10">{t('dashboard.no_history')}</div>
               ) : (
                  history.map((result) => {
                     const formattedDate = format(new Date(result.createdAt), "dd MMM", { locale: language === 'id' ? idLocale : enUS });
                     const isGood = result.totalScore >= 9;

                     return (
                       <button onClick={() => onViewHistoryDetail(result)} key={result.id} className="w-full flex items-center justify-between hover:bg-[#1e3025] p-4 rounded-[20px] transition-colors text-left group bg-[#1e3025]/50 border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", isGood ? "bg-[#8cc63f]/20 text-[#8cc63f]" : "bg-amber-500/20 text-amber-500")}>
                               {isGood ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                               <div className="font-bold text-white text-sm mb-0.5">{t('dashboard.assessment', { age: result.ageCategory.split('_')[0] })}</div>
                               <div className="text-xs text-white/50 font-medium">{formattedDate}</div>
                            </div>
                          </div>
                          <div className={cn("px-3 py-1 rounded-full text-xs font-bold", isGood ? "bg-[#8cc63f] text-[#1e3025]" : "bg-amber-500 text-white")}>
                             {result.totalScore} <span className="opacity-70 text-[10px]">/ 10</span>
                          </div>
                       </button>
                     )
                  })
               )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
               <button onClick={handleStartClicked} className="w-full py-3.5 bg-[#8cc63f] text-[#1e3025] text-sm font-bold rounded-full flex justify-center items-center hover:bg-[#7cb435] transition-colors">
                  {t('dashboard.create_new_screening')}
               </button>
            </div>
         </div>
      </div>
      <PuskesmasMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />

      <AnimatePresence>
        {/* Growth Tracking Edit & Add Modal */}
        {isGrowthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-8 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#8cc63f]/15 text-[#263c32] dark:text-[#8cc63f] flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#263c32] dark:text-slate-100">
                      {editingRecordMonth !== null ? 'Edit Titik Pertumbuhan' : 'Input Data Pertumbuhan'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Grafik berkala untuk {profile?.name || 'Anak'} (Tinggi, Berat, Usia, Lingkar Kepala)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGrowthModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {/* Form Input */}
                <form onSubmit={handleSaveGrowthRecord} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-[#263c32] dark:text-slate-200 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#8cc63f]" />
                      <span>{editingRecordMonth !== null ? `Edit Pengukuran Bulan ke-${editingRecordMonth}` : 'Tambah Pengukuran Baru'}</span>
                    </h4>
                    {editingRecordMonth !== null && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 font-semibold">
                        Sedang Mengedit Bulan ke-{editingRecordMonth}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Usia (Bulan) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                        Usia (Bulan) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={formMonth}
                          onChange={(e) => setFormMonth(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="cth: 12"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20 transition-all"
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">bulan</span>
                      </div>
                    </div>

                    {/* Berat Badan (kg) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#8cc63f]" />
                        <span>Berat Badan (kg)</span> <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0.5"
                          max="100"
                          value={formWeight}
                          onChange={(e) => setFormWeight(e.target.value)}
                          placeholder="cth: 9.2"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20 transition-all"
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">kg</span>
                      </div>
                    </div>

                    {/* Tinggi / Panjang Badan (cm) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-sky-500" />
                        <span>Tinggi Badan (cm)</span> <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="20"
                          max="200"
                          value={formHeight}
                          onChange={(e) => setFormHeight(e.target.value)}
                          placeholder="cth: 75.5"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20 transition-all"
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">cm</span>
                      </div>
                    </div>

                    {/* Lingkar Kepala (cm) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <CircleDot className="w-3.5 h-3.5 text-purple-500" />
                        <span>Lingkar Kepala (cm)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="20"
                          max="80"
                          value={formHeadCircumference}
                          onChange={(e) => setFormHeadCircumference(e.target.value)}
                          placeholder="cth: 46.0"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20 transition-all"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">cm</span>
                      </div>
                    </div>

                    {/* Tanggal Pengukuran */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tanggal Pengukuran</span>
                      </label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20 transition-all"
                      />
                    </div>

                    {/* Catatan Tambahan */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Catatan (Posyandu, Dokter, dll)</span>
                      </label>
                      <input
                        type="text"
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                        placeholder="cth: Posyandu Mawar / Imunisasi"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#8cc63f] focus:ring-2 focus:ring-[#8cc63f]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 mt-5">
                    {editingRecordMonth !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRecordMonth(null);
                          setFormMonth(profile?.ageInMonths ?? 12);
                          setFormWeight(String(profile?.weightKg ?? 9.5));
                          setFormHeight(String(profile?.heightCm ?? 76));
                          setFormHeadCircumference(String(profile?.headCircumferenceCm ?? 42));
                          setFormNote('');
                        }}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Batal Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#8cc63f] hover:bg-[#7cb435] text-[#1e3025] rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingRecordMonth !== null ? 'Perbarui Titik Ini' : 'Simpan Titik Data'}</span>
                    </button>
                  </div>
                </form>

                {/* Table of Points */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-[#263c32] dark:text-slate-200">
                      Daftar Titik Pengukuran ({growthRecords.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleResetToWho}
                      className="text-xs font-semibold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Pulihkan Kurva Standar</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10">
                          <tr>
                            <th className="px-3 py-2.5">Usia</th>
                            <th className="px-3 py-2.5">Berat</th>
                            <th className="px-3 py-2.5">Tinggi</th>
                            <th className="px-3 py-2.5">L. Kepala</th>
                            <th className="px-3 py-2.5">Tanggal / Ket</th>
                            <th className="px-3 py-2.5 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {growthRecords.map((r) => (
                            <tr
                              key={r.month}
                              className={cn(
                                "hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors",
                                editingRecordMonth === r.month && "bg-[#8cc63f]/10 dark:bg-[#8cc63f]/15"
                              )}
                            >
                              <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200">
                                {r.month} bln
                              </td>
                              <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                                <span className="font-semibold text-emerald-700 dark:text-[#8cc63f]">{r.weightKg}</span> kg
                              </td>
                              <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                                <span className="font-semibold text-sky-700 dark:text-sky-400">{r.heightCm}</span> cm
                              </td>
                              <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                                {r.headCircumferenceCm ? r.headCircumferenceCm + ' cm' : '-'}
                              </td>
                              <td className="px-3 py-2 text-slate-500 max-w-[140px] truncate">
                                <div>{r.date || '-'}</div>
                                {r.note && <div className="text-[10px] text-slate-400 truncate">{r.note}</div>}
                              </td>
                              <td className="px-3 py-2 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenGrowthModal(r)}
                                  className="p-1.5 text-slate-500 hover:text-[#263c32] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
                                  title="Edit titik ini"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord(r.month)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Hapus titik ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Data (.CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsGrowthModalOpen(false)}
                  className="px-6 py-2.5 bg-[#263c32] text-white hover:bg-[#1e3025] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showAgeSelectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
            >
              <h2 className="text-2xl font-bold text-[#263c32] dark:text-slate-100 mb-2">{t('dashboard.select_screening_age')}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">
                 <span dangerouslySetInnerHTML={{__html: t('dashboard.age_desc', { name: profile?.name || '', age: profile?.ageInMonths?.toString() || '' })}} />
              </p>
              
              <div className="grid grid-cols-1 gap-3 mb-6">
                {ageOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setShowAgeSelectModal(false);
                      onStartQuestionnaire(`${opt}_bulan` as AgeCategory);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-[#8cc63f] dark:hover:border-[#8cc63f] hover:bg-[#8cc63f]/5 dark:hover:bg-[#8cc63f]/5 transition-all group"
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-[#263c32] dark:text-slate-200 group-hover:bg-[#8cc63f] group-hover:text-[#1e3025] flex items-center justify-center font-bold transition-colors">
                           {opt}
                        </div>
                        <span className="font-bold text-[#263c32] dark:text-slate-200">{t('dashboard.questionnaire', { age: opt.toString() })}</span>
                     </div>
                     <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#8cc63f]" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAgeSelectModal(false)}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold transition-colors"
               >
                {t('dashboard.cancel')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
