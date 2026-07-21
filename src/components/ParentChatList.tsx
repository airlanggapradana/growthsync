import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Loader2, Briefcase } from 'lucide-react';

export default function ParentChatList({ userProfile, unreadCount, onOpenChat }: { userProfile: UserProfile, unreadCount?: number, onOpenChat: (nakes: UserProfile) => void }) {
  const [nakesList, setNakesList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNakes = async () => {
      try {
        if (!userProfile.assignedNakesId) {
           setNakesList([]);
           setLoading(false);
           return;
        }
        let q = query(collection(db, 'users'), where('role', '==', 'nakes'));
        const snap = await getDocs(q);
        let data = snap.docs.map(doc => doc.data() as UserProfile);
        
        data = data.filter(n => n.uid === userProfile.assignedNakesId);
        setNakesList(data);
        if (data.length > 0) {
          onOpenChat(data[0]);
        }
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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Konsultasi Nakes</h1>
        </header>

        {loading ? (
             <div className="flex justify-center py-20">
               <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
             </div>
        ) : (
          <div className="w-full pb-20">
             {nakesList.length === 0 && (
                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-xl mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                     <Briefcase className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-3">Belum Ada Nakes</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    Saat ini belum ada tenaga kesehatan yang menangani profil Anda. Harap tunggu hingga Nakes mengambil profil Anda untuk memulai konsultasi.
                  </p>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
