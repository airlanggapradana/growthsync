import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { UserProfile, ChildProfile, QuestionnaireResult } from '../types';
import { Loader2, Users, Search, ChevronRight, Activity, Smile, MapPin, MessageSquare, User as UserIcon, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import dayjs from 'dayjs';

interface ParentData extends UserProfile {
  children: ChildProfile[];
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
        const childrenData = childrenSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChildProfile));
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
      alert("Akun Anda belum terverifikasi oleh Admin sehingga tidak dapat mengambil pasien.");
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
               <h1 className="text-3xl font-bold tracking-tight text-[#263c32]">Pasien & Layanan</h1>
               <p className="text-sm font-medium text-slate-500 mt-1">
                 Kelola data pertumbuhan anak dari setiap orang tua di area Anda.
               </p>
             </div>
             <div className="flex flex-col items-end gap-2">
               <div className="bg-[#8cc63f]/20 text-[#263c32] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                 <Activity className="w-4 h-4" />
                 Nakes Akses
               </div>
               {userProfile.isVerified ? (
                 <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                   <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi
                 </span>
               ) : (
                 <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                   Menunggu Verifikasi Admin
                 </span>
               )}
             </div>
          </div>
          
          <div className="flex items-center gap-4 mt-8 bg-slate-100 p-1 rounded-full w-max">
             <button
               onClick={() => setActiveTab('my_patients')}
               className={cn("px-6 py-2.5 rounded-full text-sm font-bold transition-all", activeTab === 'my_patients' ? "bg-white text-[#263c32] shadow-sm flex items-center gap-2" : "text-slate-500 hover:text-slate-900 line-clamp-1")}
             >
               {activeTab === 'my_patients' && <ShieldCheck className="w-4 h-4" />}
               Pasien Saya ({myPatients.length})
             </button>
             <button
               onClick={() => setActiveTab('unassigned')}
               className={cn("px-6 py-2.5 rounded-full text-sm font-bold transition-all", activeTab === 'unassigned' ? "bg-white text-[#263c32] shadow-sm flex items-center gap-2" : "text-slate-500 hover:text-slate-900")}
             >
               {activeTab === 'unassigned' && <Users className="w-4 h-4" />}
               Daftar Orang Tua ({unassignedParents.length})
             </button>
          </div>

          <div className="relative mt-6">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari email orang tua atau nama anak..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-full outline-none focus:border-[#8cc63f] focus:ring-4 focus:ring-[#8cc63f]/10 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
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
               <div key={parent.uid} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                 
                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      <UserIcon className="w-6 h-6 text-[#8cc63f]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#263c32] text-lg flex items-center gap-2">
                        {parent.email.split('@')[0]}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {parent.email}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {parent.children.length === 0 && (
                           <span className="text-xs text-slate-400 italic">Belum ada profil anak.</span>
                        )}
                        {parent.children.map(child => (
                           <div key={child.id} className="bg-[#8cc63f]/10 text-[#263c32] border border-[#8cc63f]/20 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold">
                             <Smile className="w-3.5 h-3.5 text-[#8cc63f]" />
                             {child.name} • {child.ageInMonths} bln
                           </div>
                        ))}
                      </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    {activeTab === 'my_patients' ? (
                      <button 
                        onClick={() => onOpenChat(parent)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#263c32] hover:bg-[#1e3025] text-white font-bold text-sm transition-all shadow-sm relative"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Chat Orang Tua
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
                              alert("Akun Anda belum terverifikasi oleh Admin.");
                              return;
                           }
                           handleClaimParent(parent.uid);
                        }}
                        disabled={actionLoadingId === parent.uid || !userProfile.isVerified}
                        title={!userProfile.isVerified ? "Akun Anda belum terverifikasi" : ""}
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
                        Pilih & Layani
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
                      ? 'Belum ada pasien yang Anda layani.' 
                      : 'Tidak ada daftar orang tua baru saat ini.'}
                  </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
