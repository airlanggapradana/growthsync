import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { UserProfile, ChildProfile, QuestionnaireResult } from '../types';
import { 
  Loader2, Users, Search, ChevronRight, Activity, Smile, MapPin, 
  MessageSquare, User as UserIcon, ShieldCheck, FileText, CalendarClock, 
  AlertTriangle, AlertOctagon, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import StatusBadge, { getKpspStatusInfo } from './domain/StatusBadge';
import { useLanguage } from '../contexts/LanguageContext';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
dayjs.locale('id');

interface ChildWithHistory extends ChildProfile {
  history: QuestionnaireResult[];
}

interface ParentData extends UserProfile {
  children: ChildWithHistory[];
}

export default function NakesDashboardView({ 
  userProfile, 
  unreadCountsBySender = {}, 
  onOpenChat 
}: { 
  userProfile: UserProfile, 
  unreadCountsBySender?: Record<string, number>,
  onOpenChat: (parentData: ParentData) => void 
}) {
  const [parents, setParents] = useState<ParentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'my_patients' | 'unassigned'>('my_patients');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const { t } = useLanguage();

  const fetchData = async () => {
    try {
      setLoading(true);
      const usersQ = query(collection(db, 'users'), where('role', '==', 'orang_tua'));
      const usersSnap = await getDocs(usersQ);
      
      const parentPromises = usersSnap.docs.map(async (userDoc) => {
        const userData = userDoc.data() as UserProfile;
        const uid = userData.uid || userDoc.id;
        const childrenQ = query(collection(db, 'childProfiles'), where('userId', '==', uid));
        const childrenSnap = await getDocs(childrenQ);
        
        const childrenWithHistoryPromises = childrenSnap.docs.map(async (docSnap) => {
          const childData = { id: docSnap.id, ...docSnap.data() } as ChildProfile;
          
          const historyQ = query(collection(db, 'questionnaireResults'), where('profileId', '==', docSnap.id));
          const historySnap = await getDocs(historyQ);
          const historyData = historySnap.docs.map(hDoc => {
            const data = hDoc.data();
            return {
              id: hDoc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString())
            } as QuestionnaireResult;
          });
          
          historyData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          return {
            ...childData,
            history: historyData
          };
        });

        const childrenData = await Promise.all(childrenWithHistoryPromises);

        return {
          ...userData,
          uid,
          children: childrenData
        };
      });

      const allParents = await Promise.all(parentPromises);
      setParents(allParents);
    } catch(err) {
      console.error("Error fetching data for Nakes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimParent = async (parentId: string) => {
    if (!userProfile.isVerified) {
      alert(t('nakes.unverified_alert'));
      return;
    }
    setActionLoadingId(parentId);
    try {
      await updateDoc(doc(db, 'users', parentId), {
        assignedNakesId: userProfile.uid
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to claim parent", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper to determine worst status for sorting priority (Penyimpangan top, then Meragukan, then Sesuai)
  const getParentPriorityScore = (parent: ParentData): number => {
    let minScore = 10;
    parent.children.forEach(c => {
      const latest = c.history?.[0];
      if (latest && typeof latest.totalScore === 'number') {
        if (latest.totalScore < minScore) minScore = latest.totalScore;
      }
    });
    return minScore; // Lower score = higher priority
  };

  const filteredParents = useMemo(() => {
    const list = parents.filter(p => 
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.children.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Prioritas visual: Urutkan pasien dengan skor terendah (Penyimpangan) di paling atas per Section 4.8
    return list.sort((a, b) => getParentPriorityScore(a) - getParentPriorityScore(b));
  }, [parents, searchTerm]);

  const myPatients = filteredParents.filter(p => p.assignedNakesId === userProfile.uid);
  const unassignedParents = filteredParents.filter(p => !p.assignedNakesId || p.assignedNakesId === null);

  const displayList = activeTab === 'my_patients' ? myPatients : unassignedParents;

  // Header Summary Stats per Section 4.8
  const stats = useMemo(() => {
    let unreadTotal = 0;
    let deviationCount = 0;
    myPatients.forEach(p => {
      if (unreadCountsBySender[p.uid]) {
        unreadTotal += unreadCountsBySender[p.uid];
      }
      p.children.forEach(c => {
        const latest = c.history?.[0];
        if (latest && latest.totalScore < 9) {
          deviationCount += 1;
        }
      });
    });
    return {
      totalPatients: myPatients.length,
      unreadTotal,
      deviationCount
    };
  }, [myPatients, unreadCountsBySender]);

  return (
    <div className="w-full h-full flex flex-col items-center font-sans pb-16">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Unverified Account Alert Panel per Section 4.8 */}
        {!userProfile.isVerified && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs sm:text-sm text-[#B45309] dark:text-amber-300">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <span className="font-bold block mb-0.5">Menunggu Verifikasi SIP</span>
              <p className="leading-relaxed">
                Akun tenaga kesehatan Anda sedang dalam peninjauan oleh Administrator. Fitur klaim pasien dan tindak lanjut aktif akan terbuka penuh segera setelah dokumen SIP Anda diverifikasi.
              </p>
            </div>
          </div>
        )}

        <header>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
             <div>
               <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                 {t('nakes.title')}
               </h1>
               <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                 {t('nakes.subtitle')}
               </p>
             </div>
             <div className="flex items-center gap-2">
               {userProfile.isVerified ? (
                 <span className="bg-[#F0FDF4] dark:bg-emerald-950/40 text-[#15803D] dark:text-emerald-300 border border-[#BBF7D0] dark:border-emerald-800/60 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
                   <ShieldCheck className="w-4 h-4 text-emerald-600" /> {t('nakes.verified')}
                 </span>
               ) : (
                 <span className="bg-[#FFFBEB] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-800/60 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
                   <ShieldAlert className="w-4 h-4 text-amber-600" /> {t('nakes.waiting_verification')}
                 </span>
               )}
             </div>
          </div>

          {/* 3 Header Ringkasan KPI Cards per Section 4.8 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-white dark:bg-[#111A2B] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pasien Dampingan</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-1">
                {stats.totalPatients}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111A2B] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pesan Masuk Belum Dibaca</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-1 flex items-center gap-2">
                <span>{stats.unreadTotal}</span>
                {stats.unreadTotal > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">Baru</span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111A2B] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kasus Butuh Perhatian Khusus</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#B91C1C] dark:text-rose-400 tabular-nums mt-1 flex items-center gap-2">
                <span>{stats.deviationCount}</span>
                {stats.deviationCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/40 text-[#B91C1C] dark:text-rose-300 font-bold">
                    Perhatian
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl w-max">
               <button
                 onClick={() => setActiveTab('my_patients')}
                 className={cn(
                   "px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2", 
                   activeTab === 'my_patients' ? "bg-white dark:bg-slate-900 text-[#0F766E] dark:text-[#5EEAD4] shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                 )}
               >
                 <ShieldCheck className="w-4 h-4" />
                 <span>{t('nakes.my_patients')}</span>
                 <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 tabular-nums">({myPatients.length})</span>
               </button>
               <button
                 onClick={() => setActiveTab('unassigned')}
                 className={cn(
                   "px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2", 
                   activeTab === 'unassigned' ? "bg-white dark:bg-slate-900 text-[#0F766E] dark:text-[#5EEAD4] shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                 )}
               >
                 <Users className="w-4 h-4" />
                 <span>{t('nakes.parent_list')}</span>
                 <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 tabular-nums">({unassignedParents.length})</span>
               </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('nakes.search')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-white dark:bg-slate-900 border border-[#7C8BA1] dark:border-[#5B6F92] focus:border-[#0F766E] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" />
          </div>
        ) : (
          <div className="space-y-4">
             {displayList.map((parent) => (
               <div key={parent.uid} className="bg-white dark:bg-[#111A2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-raised transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                 
                 <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] dark:bg-teal-950/40 text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center shrink-0 border border-[#CCFBF1] dark:border-teal-800/60 font-bold">
                      {parent.name?.charAt(0) || parent.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                          {parent.name || parent.email.split('@')[0]}
                        </h3>
                        {parent.regency && (
                          <span className="text-[11px] text-slate-400 font-medium shrink-0">
                            • {parent.regency}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {parent.email}
                      </p>
                      
                      <div className="mt-3">
                         {parent.children.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">{t('nakes.no_child_profile')}</span>
                         ) : (
                           <div className="flex flex-wrap gap-2">
                             {parent.children.map(child => {
                               const latestHistory = child.history?.[0];
                               const hasDeviation = latestHistory && latestHistory.totalScore < 7;
                               const isDoubtful = latestHistory && latestHistory.totalScore >= 7 && latestHistory.totalScore < 9;

                               return (
                                 <div 
                                   key={child.id} 
                                   className={cn(
                                     "px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold",
                                     hasDeviation 
                                       ? "bg-rose-50 border-rose-200 text-[#B91C1C] dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300"
                                       : isDoubtful
                                         ? "bg-amber-50 border-amber-200 text-[#B45309] dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300"
                                         : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                   )}
                                 >
                                   <Smile className="w-3.5 h-3.5" />
                                   <span>{child.name}</span>
                                   <span className="opacity-60 tabular-nums">({child.ageInMonths} bln)</span>
                                   {latestHistory && (
                                     <span className="ml-1 px-1.5 py-0.2 rounded-md bg-white/70 dark:bg-black/30 text-[10px] tabular-nums font-bold">
                                       {latestHistory.totalScore}/10
                                     </span>
                                   )}
                                 </div>
                               );
                             })}
                           </div>
                         )}
                      </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    {activeTab === 'my_patients' ? (
                      <button 
                        onClick={() => onOpenChat(parent)}
                        className="flex-1 md:flex-none h-11 px-5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 relative cursor-pointer active:scale-98"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{t('nakes.chat_parent')}</span>
                        {Boolean(unreadCountsBySender[parent.uid] && unreadCountsBySender[parent.uid] > 0) && (
                          <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full ring-2 ring-white">
                            {unreadCountsBySender[parent.uid] > 99 ? '99+' : unreadCountsBySender[parent.uid]}
                          </span>
                        )}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleClaimParent(parent.uid)}
                        disabled={actionLoadingId === parent.uid || !userProfile.isVerified}
                        className={cn(
                          "flex-1 md:flex-none h-11 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2",
                          userProfile.isVerified 
                            ? "bg-[#0F766E] hover:bg-[#115E59] text-white cursor-pointer active:scale-98" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed shadow-none"
                        )}
                      >
                        {actionLoadingId === parent.uid ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        <span>{t('nakes.select_serve')}</span>
                      </button>
                    )}
                 </div>
               </div>
             ))}
             
             {displayList.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-3 bg-white dark:bg-[#111A2B] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                    <Users className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-semibold text-slate-500">
                    {activeTab === 'my_patients' ? t('nakes.empty_patients') : t('nakes.empty_unassigned')}
                  </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
