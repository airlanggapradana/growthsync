import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Loader2, Search, Briefcase, ChevronRight, MessageSquare } from 'lucide-react';

export default function ParentChatList({ userProfile, onOpenChat }: { userProfile: UserProfile, onOpenChat: (nakes: UserProfile) => void }) {
  const [nakesList, setNakesList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNakes = async () => {
      try {
        let q = query(collection(db, 'users'), where('role', '==', 'nakes'));
        const snap = await getDocs(q);
        let data = snap.docs.map(doc => doc.data() as UserProfile);
        
        if (userProfile.assignedNakesId) {
          data = data.filter(n => n.uid === userProfile.assignedNakesId);
        }

        setNakesList(data);
      } catch (err) {
        console.error("Error fetching nakes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNakes();
  }, [userProfile]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        <header>
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Konsultasi Nakes</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Pilih tenaga kesehatan yang tersedia untuk berkonsultasi mengenai perkembangan anak.
            </p>
          </div>
        </header>

        {loading ? (
             <div className="flex justify-center py-20">
               <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
             </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
             {nakesList.map((nakes) => (
               <div key={nakes.uid} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
                 
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">
                        {nakes.email.split('@')[0]}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Tenaga Kesehatan Terdaftar
                      </p>
                    </div>
                 </div>

                 <button 
                   onClick={() => onOpenChat(nakes)}
                   className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-xl transition-all"
                 >
                   <MessageSquare className="w-5 h-5 ml-0.5" />
                 </button>
                 
               </div>
             ))}
             
             {nakesList.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400">
                  Saat ini belum ada tenaga kesehatan yang terdaftar.
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
