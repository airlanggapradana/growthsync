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
        <div className="bg-[#8cc63f]/10 border border-[#8cc63f]/20 rounded-3xl p-5 flex items-start gap-4 shadow-sm mb-6">
          <div className="w-10 h-10 rounded-full bg-[#8cc63f]/20 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-[#263c32]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#263c32] mb-1">
              Waktunya Skrining Perkembangan!
            </h3>
            <p className="text-sm font-medium text-[#263c32]/80 mb-3 leading-relaxed">
              {history.length === 0 
                ? "Ayo lakukan skrining pertama untuk memantau perkembangan optimal anak Anda. Kenali potensi dan kebutuhan mereka seawal mungkin!"
                : "Sudah lebih dari 3 bulan sejak skrining terakhir. Ayo perbarui data untuk memastikan anak Anda tetap berada di jalur perkembangan yang tepat!"}
            </p>
            <button 
               onClick={() => {
                  if (profile.ageInMonths <= 4) onStartQuestionnaire('3_bulan');
                  else onStartQuestionnaire('6_bulan');
               }}
               className="px-5 py-2.5 bg-[#8cc63f] hover:bg-[#7cb435] text-[#1e3025] rounded-full text-sm font-bold transition-colors shadow-sm"
            >
              Mulai Skrining Sekarang
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#263c32] rounded-[32px] p-8 md:p-10 mb-8 mt-2 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-[#263c32]/20">
         <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
         <div className="relative z-10 w-full md:w-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">Hello, {profile?.name} <span className="inline-block animate-wave">👋</span></h1>
            <p className="text-white/70 font-medium mt-2">Bagaimana perkembangan {profile?.name} hari ini?</p>
         </div>
         <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
             <button 
               onClick={() => setIsMapOpen(true)}
               className="flex-1 md:flex-none justify-center px-5 py-3 bg-white/10 text-white backdrop-blur-md rounded-full text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
             >
               <MapIcon className="w-4 h-4" /> Cari Puskesmas
             </button>
             <button 
               onClick={() => {
                  if (profile.ageInMonths <= 4) onStartQuestionnaire('3_bulan');
                  else onStartQuestionnaire('6_bulan');
               }}
               className="flex-1 md:flex-none justify-center px-5 py-3 bg-[#8cc63f] text-[#1e3025] rounded-full text-sm font-bold hover:bg-[#7cb435] transition-colors shadow-sm flex items-center gap-2 relative"
             >
               {isTimeForScreening && !loadingHistory && (
                 <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-[#8cc63f]"></span>
                 </span>
               )}
               <Plus className="w-4 h-4" /> Skrining
             </button>
             <div className="relative w-full md:w-auto mt-2 md:mt-0">
                 <button 
                   onClick={() => setShowProfileMenu(!showProfileMenu)}
                   className="w-full md:w-auto justify-center px-5 py-3 bg-white text-[#263c32] rounded-full text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                 >
                   <span className="text-lg leading-none mr-0.5">{profile.gender === 'Perempuan' ? '👧' : '👦'}</span>
                   Profil <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                 </button>
                 
                 <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden z-50 text-slate-800"
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
                              p.id === activeProfileId ? "bg-slate-50 text-[#8cc63f]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                          >
                             <span className="text-lg leading-none">{p.gender === 'Perempuan' ? '👧' : '👦'}</span>
                             {p.name}
                          </button>
                        ))}
                        <div className="p-2 border-t border-slate-100">
                          <button 
                            onClick={() => {
                              onAddProfile();
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-600 hover:text-[#263c32] rounded-xl transition-colors text-sm font-semibold"
                          >
                             <div className="w-6 flex justify-center"><Plus className="w-4 h-4" /></div>
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
      <div className="flex items-center justify-between mb-2 px-2">
         <h2 className="text-lg font-bold text-slate-800">Overview</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-white p-5 lg:p-6 rounded-[28px] relative overflow-hidden shadow-sm border border-slate-100 flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 text-sm">Usia Anak</div>
             <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#8cc63f] cursor-pointer hover:bg-slate-100 transition-colors">
               <span className="text-lg flex leading-none pt-0.5">{profile.gender === 'Perempuan' ? '👧' : '👦'}</span>
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-[#263c32]">{profile.ageInMonths}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="bg-slate-100 px-2 py-0.5 rounded-full">Bulan</span> Aktual
             </div>
           </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 lg:p-6 rounded-[28px] relative overflow-hidden shadow-sm border border-slate-100 flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 text-sm">Tinggi Badan</div>
             <div className="w-8 h-8 bg-[#8cc63f]/10 rounded-full flex items-center justify-center text-[#8cc63f] cursor-pointer hover:bg-[#8cc63f]/20 transition-colors">
               <ArrowUpRight className="w-4 h-4" />
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-[#263c32]">{profile.heightCm}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="bg-slate-100 px-2 py-0.5 rounded-full">cm</span> Saat ini
             </div>
           </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 lg:p-6 rounded-[28px] relative overflow-hidden shadow-sm border border-slate-100 flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 text-sm">Berat Badan</div>
             <div className="w-8 h-8 bg-[#8cc63f]/10 rounded-full flex items-center justify-center text-[#8cc63f] cursor-pointer hover:bg-[#8cc63f]/20 transition-colors">
               <ArrowUpRight className="w-4 h-4" />
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-[#263c32]">{profile.weightKg}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="bg-slate-100 px-2 py-0.5 rounded-full">kg</span> Saat ini
             </div>
           </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 lg:p-6 rounded-[28px] relative overflow-hidden shadow-sm border border-slate-100 flex flex-col justify-between h-[160px]">
           <div className="flex justify-between items-start">
             <div className="font-semibold text-slate-500 text-sm">Skor Terakhir</div>
             <div className="w-8 h-8 bg-[#8cc63f]/10 rounded-full flex items-center justify-center text-[#8cc63f] cursor-pointer hover:bg-[#8cc63f]/20 transition-colors">
               <ArrowUpRight className="w-4 h-4" />
             </div>
           </div>
           <div>
             <div className="text-[40px] font-bold tracking-tight leading-none mb-2 text-[#263c32]">{latestScreening ? latestScreening.totalScore : '-'}</div>
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                {latestScreening ? (
                   latestScreening.totalScore >= 9 ? (
                     <span className="bg-[#8cc63f]/20 text-[#263c32] px-2 py-0.5 rounded-full">Sesuai Usia</span>
                   ) : (
                     <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Cek Lanjut</span>
                   )
                ) : 'Belum ada'}
             </div>
           </div>
        </div>
      </div>

      {/* Row 2: Analytics & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Chart */}
         <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-bold text-[#263c32] text-xl">Pertumbuhan Berkala</h3>
               <div className="flex items-center gap-2">
                 <button className="w-8 h-8 rounded-full bg-slate-50 flex justify-center items-center hover:bg-slate-100 transition-colors"><ChevronDown className="w-4 h-4 text-slate-400" /></button>
                 <button className="px-4 py-1.5 bg-[#8cc63f] text-[#1e3025] rounded-full text-xs font-bold shadow-sm">Export</button>
               </div>
            </div>
            <div className="flex-1 min-h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#8cc63f" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#8cc63f" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="month" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                   <YAxis stroke="#cbd5e1" hide fontSize={11} tickLine={false} axisLine={false} />
                   <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                   <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px -4px rgba(0,0,0,0.1)', backgroundColor: '#ffffff', padding: '12px 16px' }}
                      labelStyle={{ fontWeight: '700', color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                      itemStyle={{ color: '#263c32', fontWeight: 800, fontSize: '16px' }}
                   />
                   <Area type="monotone" dataKey="weight" stroke="#8cc63f" strokeWidth={4} fillOpacity={1} fill="url(#colorBrand)" activeDot={{ r: 6, fill: '#8cc63f', stroke: '#fff', strokeWidth: 2 }} />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Reminders & Project (History) */}
         <div className="bg-[#263c32] rounded-[32px] p-8 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
               <h3 className="font-bold text-white text-xl">Riwayat Skrining</h3>
               <button className="w-8 h-8 flex justify-center items-center bg-[#8cc63f]/20 rounded-full hover:bg-[#8cc63f]/30 transition-colors">
                  <Plus className="w-4 h-4 text-[#8cc63f]" />
               </button>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
               {loadingHistory ? (
                  <div className="text-center py-6 text-white/50 text-sm font-medium">Memuat...</div>
               ) : history.length === 0 ? (
                  <div className="text-center py-8 text-white/50 text-sm font-medium bg-[#1e3025] rounded-[20px] border border-dashed border-white/10">Belum ada riwayat</div>
               ) : (
                  history.map((result) => {
                     const formattedDate = format(new Date(result.createdAt), "dd MMM", { locale: id });
                     const isGood = result.totalScore >= 9;

                     return (
                       <button onClick={() => onViewHistoryDetail(result)} key={result.id} className="w-full flex items-center justify-between hover:bg-[#1e3025] p-4 rounded-[20px] transition-colors text-left group bg-[#1e3025]/50 border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", isGood ? "bg-[#8cc63f]/20 text-[#8cc63f]" : "bg-amber-500/20 text-amber-500")}>
                               {isGood ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                               <div className="font-bold text-white text-sm mb-0.5">Asesmen {result.ageCategory === '3_bulan' ? '3' : '6'} Bln</div>
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
               <button onClick={() => {
                  if (profile.ageInMonths <= 4) onStartQuestionnaire('3_bulan');
                  else onStartQuestionnaire('6_bulan');
               }} className="w-full py-3.5 bg-[#8cc63f] text-[#1e3025] text-sm font-bold rounded-full flex justify-center items-center hover:bg-[#7cb435] transition-colors">
                  Buat Skrining Baru
               </button>
            </div>
         </div>
      </div>
      <PuskesmasMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </motion.div>
  );
}
