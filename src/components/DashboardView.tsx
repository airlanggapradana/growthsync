import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ChildProfile, AgeCategory, QuestionnaireResult } from '../types';
import { Baby, LineChart, Play, ChevronRight, Calculator, Ruler, Scale, History, CheckCircle2, AlertCircle, Activity, ChevronDown, Plus, ArrowUpRight, Bell, AlertTriangle, Map as MapIcon } from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../lib/utils';
import PuskesmasMapModal from './PuskesmasMapModal';

export default function DashboardView({ 
  profiles, 
  activeProfileId, 
  onSelectProfile, 
  onAddProfile, 
  onStartQuestionnaire,
  onViewHistoryDetail
}: { 
  key?: string;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  onSelectProfile: (id: string | null) => void;
  onAddProfile: () => void;
  onStartQuestionnaire: (age: AgeCategory) => void;
  onViewHistoryDetail: (history: QuestionnaireResult) => void;
}) {
  const [history, setHistory] = useState<QuestionnaireResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

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
  
  // Dummy chart data representing generic CDC/WHO growth curve
  const chartData = useMemo(() => {
    if (!profile) return [];
    let data = [];
    const age = profile.ageInMonths;
    const startMonth = Math.max(0, age - 5);
    
    for (let i = startMonth; i < age; i++) {
        data.push({
            month: `Bln ${i}`,
            weight: +(profile.weightKg * (0.5 + 0.5 * (i/age))).toFixed(1),
            height: +(profile.heightCm * (0.8 + 0.2 * (i/age))).toFixed(1),
        });
    }
    
    data.push({
        month: `Bln ${age}`,
        weight: profile.weightKg,
        height: profile.heightCm,
    });
    return data;
  }, [profile]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full mx-auto space-y-6"
    >
      {isTimeForScreening && !loadingHistory && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-sm mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
              Waktunya Skrining Perkembangan!
            </h3>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400/80 mb-3 leading-relaxed">
              {history.length === 0 
                ? "Ayo lakukan skrining pertama untuk memantau perkembangan optimal anak Anda. Kenali potensi dan kebutuhan mereka seawal mungkin!"
                : "Sudah lebih dari 3 bulan sejak skrining terakhir. Ayo perbarui data untuk memastikan anak Anda tetap berada di jalur perkembangan yang tepat!"}
            </p>
            <button 
               onClick={() => {
                  if (profile.ageInMonths <= 4) onStartQuestionnaire('3_bulan');
                  else onStartQuestionnaire('6_bulan');
               }}
               className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              Mulai Skrining Sekarang
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2">
         <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5">Pantau, prioritaskan, dan capai perkembangan optimal anak Anda.</p>
         </div>
         <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsMapOpen(true)}
               className="px-5 py-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-full text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors shadow-sm flex items-center gap-2"
             >
               <MapIcon className="w-4 h-4" /> Cari Puskesmas
             </button>
             <button 
               onClick={() => {
                  if (profile.ageInMonths <= 4) onStartQuestionnaire('3_bulan');
                  else onStartQuestionnaire('6_bulan');
               }}
               className="px-5 py-2.5 bg-[#1b4332] text-white rounded-full text-sm font-semibold hover:bg-[#0f2c20] transition-colors shadow-sm flex items-center gap-2 relative"
             >
               {isTimeForScreening && !loadingHistory && (
                 <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
                 </span>
               )}
               <Plus className="w-4 h-4" /> Mulai Skrining
             </button>
             <div className="relative">
                 <button 
                   onClick={() => setShowProfileMenu(!showProfileMenu)}
                   className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold hover:bg-slate-50 dark:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
                 >
                   <span className="text-lg leading-none mr-0.5">{profile.gender === 'Perempuan' ? '👧' : '👦'}</span>
                   {profile.name} <ChevronDown className="w-4 h-4 ml-1 text-slate-400" />
                 </button>
                 
                 <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden z-50 text-slate-900 dark:text-slate-50"
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
                              p.id === activeProfileId ? "bg-slate-50 dark:bg-slate-800 text-[#1b4332] dark:text-emerald-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 hover:text-slate-900 dark:text-slate-50"
                            )}
                          >
                             <span className="text-lg leading-none">{p.gender === 'Perempuan' ? '👧' : '👦'}</span>
                             {p.name}
                          </button>
                        ))}
                        <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
                          <button 
                            onClick={() => {
                              onAddProfile();
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 rounded-lg transition-colors text-sm font-semibold"
                          >
                             <div className="w-6 flex justify-center"><Plus className="w-4 h-4 text-slate-400" /></div>
                             Tambah Anak Baru
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
             </div>
         </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Card 1: Green */}
        <div className="bg-[#1b4332] text-white p-5 lg:p-6 rounded-[24px] relative overflow-hidden shadow-sm flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-emerald-100/90 text-sm">Usia Anak</div>
             <div className="w-7 h-7 bg-white/10 dark:bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-sm shadow-sm hover:bg-white/20 dark:hover:bg-white/20 transition-colors cursor-pointer">
               <ArrowUpRight className="w-3.5 h-3.5" />
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2">{profile.ageInMonths}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <span className="bg-white/10 dark:bg-white/10 px-2 py-0.5 rounded border border-white/10">Bulan</span> Sesuai target
             </div>
           </div>
        </div>

        {/* Card 2: White */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 p-5 lg:p-6 rounded-[24px] relative overflow-hidden shadow-sm flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 dark:text-slate-400 text-sm">Tinggi Badan</div>
             <div className="w-7 h-7 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors cursor-pointer">
               <ArrowUpRight className="w-3.5 h-3.5" />
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-slate-900 dark:text-slate-50">{profile.heightCm}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">cm</span> Data bulan ini
             </div>
           </div>
        </div>

        {/* Card 3: White */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 p-5 lg:p-6 rounded-[24px] relative overflow-hidden shadow-sm flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 dark:text-slate-400 text-sm">Berat Badan</div>
             <div className="w-7 h-7 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors cursor-pointer">
               <ArrowUpRight className="w-3.5 h-3.5" />
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-slate-900 dark:text-slate-50">{profile.weightKg}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">kg</span> Data bulan ini
             </div>
           </div>
        </div>

        {/* Card 4: White */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 p-5 lg:p-6 rounded-[24px] relative overflow-hidden shadow-sm flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 dark:text-slate-400 text-sm">Tes Terakhir</div>
             <div className="w-7 h-7 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors cursor-pointer">
               <ArrowUpRight className="w-3.5 h-3.5" />
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-slate-900 dark:text-slate-50">{latestScreening ? latestScreening.totalScore : '-'}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {latestScreening ? (
                   latestScreening.totalScore >= 9 ? (
                     <span className="text-emerald-600">Sesuai Usia</span>
                   ) : (
                     <span className="text-amber-600">Cek Lanjut</span>
                   )
                ) : 'Belum ada'}
             </div>
           </div>
        </div>
      </div>

      {/* Row 2: Analytics & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Chart */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-6 font-sans">Project Analytics <span className="opacity-0 w-0 block text-[0px]">Kurva Pertumbuhan</span></h3>
            <div className="flex-1 min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="var(--color-brand-chart)" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="var(--color-brand-chart)" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="month" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                   <YAxis stroke="#cbd5e1" hide fontSize={11} tickLine={false} axisLine={false} />
                   <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--bg-grid)" />
                   <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-card)', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)', backgroundColor: 'var(--bg-card)' }}
                      labelStyle={{ fontWeight: '600', color: 'var(--text-primary)' }}
                      itemStyle={{ color: 'var(--color-brand-chart)', fontWeight: 700 }}
                   />
                   <Area type="monotone" dataKey="weight" stroke="var(--color-brand-chart)" strokeWidth={3} fillOpacity={1} fill="url(#colorGreen)" name="Berat (kg)" />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Reminders & Project (History) */}
         <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-slate-900 dark:text-slate-50">Riwayat Skrining</h3>
               <button className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800">+ Baru</button>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
               {loadingHistory ? (
                  <div className="text-center py-6 text-slate-400 text-sm font-medium">Memuat...</div>
               ) : history.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm font-medium bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">Belum ada riwayat</div>
               ) : (
                  history.map((result) => {
                     const formattedDate = format(new Date(result.createdAt), "dd MMM yyyy", { locale: id });
                     let iconColor = "text-emerald-600";
                     if (result.totalScore < 7) iconColor = "text-rose-600";
                     else if (result.totalScore < 9) iconColor = "text-amber-600";

                     return (
                       <button onClick={() => onViewHistoryDetail(result)} key={result.id} className="w-full flex items-start gap-3 hover:bg-slate-50 dark:bg-slate-800 p-2 rounded-xl transition-colors text-left group">
                          <div className={cn("mt-1 shrink-0", iconColor)}>
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-50 text-sm mb-0.5 group-hover:text-[#1b4332] dark:text-emerald-400 transition-colors">Hasil Skrining Usia {result.ageCategory === '3_bulan' ? '3' : '6'} Bln</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Skor: {result.totalScore}/10 • {formattedDate}</div>
                          </div>
                       </button>
                     )
                  })
               )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <button onClick={() => {
                  if (profile.ageInMonths <= 4) onStartQuestionnaire('3_bulan');
                  else onStartQuestionnaire('6_bulan');
               }} className="w-full py-2.5 bg-[#1b4332] text-white text-sm font-semibold rounded-xl flex justify-center items-center gap-2 hover:bg-[#0f2c20]">
                 <Play className="w-3.5 h-3.5 fill-current" /> Mulai Sekarang
               </button>
            </div>
         </div>
      </div>
      <PuskesmasMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </motion.div>
  );
}
