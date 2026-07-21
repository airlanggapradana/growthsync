import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { UserProfile, ChildProfile, QuestionnaireResult } from '../types';
import { Loader2, Users, Search, ChevronRight, Activity, Smile, MapPin, MessageSquare, User as UserIcon, ShieldCheck, FileText, CalendarClock } from 'lucide-react';
import { cn } from '../lib/utils';
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
      // Fetch all orang_tua users
      const usersQ = query(collection(db, 'users'), where('role', '==', 'orang_tua'));
      const usersSnap = await getDocs(usersQ);
      
      const parentPromises = usersSnap.docs.map(async (userDoc) => {
        const userData = userDoc.data() as UserProfile;
        const uid = userData.uid || userDoc.id;
        // Fetch children for this parent
        const childrenQ = query(collection(db, 'childProfiles'), where('userId', '==', uid));
        const childrenSnap = await getDocs(childrenQ);
        
        const childrenWithHistoryPromises = childrenSnap.docs.map(async (docSnap) => {
          const childData = { id: docSnap.id, ...docSnap.data() } as ChildProfile;
          
          const historyQ = query(collection(db, 'questionnaireResults'), where('childId', '==', docSnap.id));
          const historySnap = await getDocs(historyQ);
          const historyData = historySnap.docs.map(hDoc => ({ id: hDoc.id, ...hDoc.data() } as QuestionnaireResult));
          
          // Sort descending based on createdAt string / date
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
      // Refresh list
      await fetchData();
    } catch (err) {
      console.error("Failed to claim parent", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredParents = parents.filter(p => p.email.toLowerCase().includes(searchTerm.toLowerCase()) || p.children.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())));

  const myPatients = filteredParents.filter(p => p.assignedNakesId === userProfile.uid);
  const unassignedParents = filteredParents.filter(p => !p.assignedNakesId || p.assignedNakesId === null);

  const displayList = activeTab === 'my_patients' ? myPatients : unassignedParents;

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-8">
        <header>
          <div className="flex items-center justify-between mb-4">
             <div>
               <h1 className="text-3xl font-bold tracking-tight text-[#263c32] dark:text-slate-100">{t('nakes.title')}</h1>
               <p className="text-sm font-medium text-slate-500 mt-1">
                 {t('nakes.subtitle')}
               </p>
             </div>
             <div className="flex flex-col items-end gap-2">
               <div className="bg-[#8cc63f]/20 text-[#263c32] dark:text-[#bef264] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                 <Activity className="w-4 h-4" />
                 {t('nakes.role_access')}
               </div>
               {userProfile.isVerified ? (
                 <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                   <ShieldCheck className="w-3.5 h-3.5" /> {t('nakes.verified')}
                 </span>
               ) : (
                 <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs px-2.5 py-1 rounded-full font-semibold">
                   {t('nakes.waiting_verification')}
                 </span>
               )}
             </div>
          </div>
          
          <div className="flex items-center gap-4 mt-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-full w-max">
             <button
               onClick={() => setActiveTab('my_patients')}
               className={cn("px-6 py-2.5 rounded-full text-sm font-bold transition-all", activeTab === 'my_patients' ? "bg-white dark:bg-slate-900 text-[#263c32] dark:text-[#bef264] shadow-sm flex items-center gap-2" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white line-clamp-1")}
             >
               {activeTab === 'my_patients' && <ShieldCheck className="w-4 h-4" />}
               {t('nakes.my_patients')} ({myPatients.length})
             </button>
             <button
               onClick={() => setActiveTab('unassigned')}
               className={cn("px-6 py-2.5 rounded-full text-sm font-bold transition-all", activeTab === 'unassigned' ? "bg-white dark:bg-slate-900 text-[#263c32] dark:text-[#bef264] shadow-sm flex items-center gap-2" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white")}
             >
               {activeTab === 'unassigned' && <Users className="w-4 h-4" />}
               {t('nakes.parent_list')} ({unassignedParents.length})
             </button>
          </div>

          <div className="relative mt-6">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('nakes.search')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full outline-none focus:border-[#8cc63f] focus:ring-4 focus:ring-[#8cc63f]/10 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </header>

        {loading ? (
             <div className="flex justify-center py-20">
               <Loader2 className="w-8 h-8 animate-spin text-[#8cc63f]" />
             </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-20">
             {displayList.map((parent) => (
               <div key={parent.uid} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                 
                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                      <UserIcon className="w-6 h-6 text-[#8cc63f]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#263c32] dark:text-slate-100 text-lg flex items-center gap-2">
                        {parent.email.split('@')[0]}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {parent.email}
                      </p>
                      
                      <div className="mt-4">
                         {parent.children.length === 0 && (
                            <span className="text-xs text-slate-400 italic">{t('nakes.no_child_profile')}</span>
                         )}
                         <div className={cn(activeTab === 'my_patients' ? "flex flex-col gap-4 w-full" : "flex flex-wrap gap-2")}>
                           {parent.children.map(child => {
                             if (activeTab === 'my_patients') {
                                const latestHistory = child.history?.[0];
                                const nextSchedule = latestHistory ? dayjs(latestHistory.createdAt).add(3, 'month') : null;
                                
                                return (
                                  <details key={child.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl group">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                                       <div className="flex items-center gap-2 font-bold text-[#263c32] dark:text-slate-200">
                                          <Smile className="w-4 h-4 text-[#8cc63f]" />
                                          {child.name} <span className="text-slate-400 font-medium ml-1">({child.ageInMonths} {t('dashboard.month')})</span>
                                       </div>
                                       <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                                    </summary>
                                    <div className="px-4 pb-4 flex flex-col gap-3">
                                      <div className="flex items-center gap-6 text-xs font-medium">
                                        <div className="flex flex-col">
                                          <span className="text-slate-400">{t('nakes.weight')}</span>
                                          <span className="font-bold text-slate-700 dark:text-slate-300">{child.weightKg || '-'} kg</span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-slate-400">{t('nakes.height')}</span>
                                          <span className="font-bold text-slate-700 dark:text-slate-300">{child.heightCm || '-'} cm</span>
                                        </div>
                                      </div>
                                      <div className="mt-1 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                         <div className="flex items-start gap-2">
                                           <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                           <div className="flex flex-col">
                                             <span className="text-slate-400 font-medium">{t('nakes.screening_history')}</span>
                                             <span className="font-bold text-slate-700 dark:text-slate-300">{child.history?.length || 0} {t('nakes.times')}</span>
                                             {latestHistory && <span className="text-slate-500 mt-0.5">{t('nakes.latest')} {dayjs(latestHistory.createdAt).format('DD MMM YYYY')}</span>}
                                           </div>
                                         </div>
                                         <div className="flex items-start gap-2">
                                           <CalendarClock className="w-4 h-4 text-amber-500 shrink-0" />
                                           <div className="flex flex-col">
                                             <span className="text-slate-400 font-medium">{t('nakes.next_schedule')}</span>
                                             <span className="font-bold text-amber-600">
                                                {nextSchedule ? nextSchedule.format('DD MMMM YYYY') : t('nakes.now')}
                                             </span>
                                           </div>
                                         </div>
                                      </div>
                                    </div>
                                  </details>
                                );
                             }

                             return (
                                  <div key={child.id} className="bg-[#8cc63f]/10 dark:bg-[#8cc63f]/5 text-[#263c32] dark:text-[#bef264] border border-[#8cc63f]/20 dark:border-[#8cc63f]/15 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold">
                                 <Smile className="w-3.5 h-3.5 text-[#8cc63f]" />
                                 {child.name} • {child.ageInMonths} {t('dashboard.month')}
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     </div>
                  </div>

                 <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    {activeTab === 'my_patients' ? (
                      <button 
                        onClick={() => onOpenChat(parent)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#263c32] dark:bg-emerald-600 hover:bg-[#1e3025] dark:hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-sm relative"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {t('nakes.chat_parent')}
                        {unreadCountsBySender[parent.uid] > 0 && (
                          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {unreadCountsBySender[parent.uid] > 99 ? '99+' : unreadCountsBySender[parent.uid]}
                          </span>
                        )}
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                           if (!userProfile.isVerified) {
                              alert(t('nakes.unverified_alert'));
                              return;
                           }
                           handleClaimParent(parent.uid);
                        }}
                        disabled={actionLoadingId === parent.uid || !userProfile.isVerified}
                        title={!userProfile.isVerified ? t('nakes.unverified_alert') : ""}
                        className={cn(
                          "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-md",
                          userProfile.isVerified 
                            ? "bg-[#8cc63f] hover:bg-[#7cb435] text-[#1e3025] shadow-[#8cc63f]/20" 
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                        )}
                      >
                        {actionLoadingId === parent.uid ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : userProfile.isVerified ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 opacity-50" />
                        )}
                        {t('nakes.select_serve')}
                      </button>
                    )}
                 </div>
                 
               </div>
             ))}
             
             {displayList.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="text-slate-500 font-medium">
                    {activeTab === 'my_patients' 
                      ? t('nakes.empty_patients') 
                      : t('nakes.empty_unassigned')}
                  </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
