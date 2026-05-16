import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ChildProfile, AgeCategory, QuestionnaireResult } from '../types';
import { Baby, LineChart, Play, ChevronRight, Calculator, Ruler, Scale, History, CheckCircle2, AlertCircle, Activity, ChevronDown, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
  // We use the child's input as the last point, and dummy data for previous months
  const chartData = useMemo(() => {
    if (!profile) return [];
    let data = [];
    const age = profile.ageInMonths;
    const startMonth = Math.max(0, age - 5);
    
    // Create some placeholder trend data leading up to the current value
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
      latestStatusColor = "bg-rose-100 text-rose-700 border-rose-200";
    } else if (latestScreening.totalScore < 9) {
      latestStatusText = "Meragukan";
      latestStatusColor = "bg-amber-100 text-amber-700 border-amber-200";
    } else {
      latestStatusText = "Sesuai";
      latestStatusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  }

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm relative z-10">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl shadow-inner border-2 shrink-0 ${
            profile.gender === 'Perempuan' ? 'bg-pink-100 border-pink-200' : 'bg-blue-100 border-blue-200'
          }`}>
            {profile.gender === 'Perempuan' ? '👧' : '👦'}
          </div>
          <div>
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 text-[28px] sm:text-[32px] font-extrabold text-slate-900 leading-tight hover:opacity-80 transition-opacity"
              >
                {profile.name}
                <ChevronDown className="w-6 h-6 text-slate-400" />
              </button>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden"
                  >
                    {profiles.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => {
                          onSelectProfile(p.id!);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          p.id === activeProfileId ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                         <span className="text-xl leading-none">{p.gender === 'Perempuan' ? '👧' : '👦'}</span>
                         {p.name}
                      </button>
                    ))}
                    <div className="border-t border-slate-100">
                      <button 
                        onClick={() => {
                          onAddProfile();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-600 font-bold"
                      >
                         <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                           <Plus className="w-3 h-3 text-slate-600" />
                         </div>
                         Tambah Anak
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="text-slate-500 font-bold uppercase tracking-wider text-[13px] mt-1 flex items-center gap-2">
              Profil Anak <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span> {profile.gender}
            </div>
          </div>
        </div>
        
        {!loadingHistory && latestScreening && (
          <div className="flex flex-col md:items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Skrining Terakhir</div>
            <div className="flex items-center gap-3">
              <div className={`px-2.5 py-1 rounded-md text-[13px] font-bold border ${latestStatusColor}`}>
                {latestStatusText}
              </div>
              <div className="text-[14px] font-bold text-slate-800">
                {format(new Date(latestScreening.createdAt), "dd MMM yyyy", { locale: id })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
             <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-1">Usia</div>
            <div className="text-[20px] font-extrabold text-slate-900">{profile.ageInMonths} Bulan</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
             <Ruler className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tinggi</div>
            <div className="text-[20px] font-extrabold text-slate-900">{profile.heightCm} cm</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
             <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-1">Berat</div>
            <div className="text-[20px] font-extrabold text-slate-900">{profile.weightKg} kg</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <LineChart className="w-6 h-6 text-blue-500" />
          <h3 className="text-[18px] sm:text-[20px] font-bold text-slate-900">Kurva Pertumbuhan (Ilustrasi)</h3>
        </div>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                 labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
              />
              <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" name="Berat (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-blue-500" />
            <h3 className="text-[18px] sm:text-[20px] font-bold text-slate-900">Riwayat Skrining</h3>
          </div>
        </div>
        {loadingHistory ? (
          <div className="py-8 text-center text-slate-400 font-medium">Memuat riwayat...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-medium">Belum ada riwayat skrining.</div>
        ) : (
          <div className="space-y-4">
            {history.map((result) => {
              const formattedDate = format(new Date(result.createdAt), "dd MMMM yyyy, HH:mm", { locale: id });
              let Icon = CheckCircle2;
              let iconColor = "text-emerald-500";
              let statusText = "Sesuai";
              
              if (result.totalScore < 7) {
                Icon = Activity;
                iconColor = "text-rose-500";
                statusText = "Ada Penyimpangan";
              } else if (result.totalScore < 9) {
                Icon = AlertCircle;
                iconColor = "text-amber-500";
                statusText = "Meragukan";
              }

              return (
                <button 
                  key={result.id} 
                  onClick={() => onViewHistoryDetail(result)}
                  className="w-full text-left p-5 rounded-[16px] border border-slate-100 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-100 flex items-center justify-between gap-4 transition-all cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-slate-900 mb-1">Usia {result.ageCategory === '3_bulan' ? '3 Bulan' : '6 Bulan'}</div>
                    <div className="text-[13px] text-slate-500 font-medium">{formattedDate}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Status</div>
                      <div className="text-[14px] font-bold text-slate-800">{statusText}</div>
                    </div>
                    <div className="flex items-center justify-center p-3 sm:px-4 sm:py-3 bg-white rounded-xl shadow-sm border border-slate-100 gap-2">
                       <span className="hidden sm:inline font-bold text-slate-400 text-[13px]">Skor</span>
                       <span className="font-extrabold text-[16px] text-slate-900">{result.totalScore}</span>
                       <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={() => {
            // Determine questionnaire based on age
            if (profile.ageInMonths <= 4) {
                onStartQuestionnaire('3_bulan');
            } else {
                onStartQuestionnaire('6_bulan');
            }
          }}
          className="w-full sm:w-auto px-10 py-5 bg-blue-500 hover:bg-blue-600 hover:-translate-y-1 text-white font-extrabold text-[16px] rounded-[16px] transition-all shadow-[0_10px_15px_-3px_rgba(59,130,246,0.3)] tracking-wider flex items-center justify-center gap-3"
        >
          MULAI SKRINING <Play className="w-5 h-5 fill-current" />
        </button>
      </div>
    </motion.div>
  );
}
