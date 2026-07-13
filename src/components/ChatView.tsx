import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { ArrowLeft, Send, User as UserIcon, Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import dayjs from 'dayjs';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
  read?: boolean;
}

export default function ChatView({ currentUser, targetUser, onBack }: { currentUser: UserProfile, targetUser: UserProfile | { email: string, uid: string }, onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const chatId = currentUser.role === 'nakes' 
    ? `${currentUser.uid}_${targetUser.uid}`
    : `${targetUser.uid}_${currentUser.uid}`;

  useEffect(() => {
    const q = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Mark messages as read if sent by the other user
      snapshot.docs.forEach(docSnap => {
        const msgData = docSnap.data();
        if (msgData.senderId !== currentUser.uid && msgData.read === false) {
          updateDoc(doc(db, 'messages', docSnap.id), { read: true }).catch(console.error);
        }
      });
    }, (error) => {
      console.warn("Chat listener failed/offline:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, currentUser.uid]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage('');
    try {
      await addDoc(collection(db, 'messages'), {
        chatId,
        senderId: currentUser.uid,
        receiverId: targetUser.uid,
        text,
        createdAt: serverTimestamp(),
        read: false
      });
      // the snapshot listener will update the UI
    } catch(err) {
      console.error("Failed to send msg", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm relative">
       {/* Header */}
       <header className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 sm:p-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1b4332]/10 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 text-[#1b4332] dark:text-emerald-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-50 leading-tight">
                  {targetUser.email.split('@')[0]}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize">
                  {currentUser.role === 'nakes' ? 'Orang Tua' : 'Tenaga Kesehatan'}
                </p>
              </div>
            </div>
          </div>
       </header>

       {/* Chat Area */}
       <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
         {loading ? (
           <div className="flex justify-center items-center h-full">
             <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
           </div>
         ) : messages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Mulai percakapan. Kirim pesan pengingat jadwal skrining anak atau konsultasi perkembangan.</p>
           </div>
         ) : (
           messages.map(msg => {
             const isMe = msg.senderId === currentUser.uid;
             return (
               <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                 <div className={cn(
                   "max-w-[75%] md:max-w-[60%] p-4 rounded-2xl md:rounded-[20px] text-[15px] leading-relaxed shadow-sm",
                   isMe ? "bg-[#1b4332] text-white rounded-br-none" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700"
                 )}>
                   {msg.text}
                   <div className={cn("text-[10px] sm:text-xs mt-2 font-medium opacity-70 flex justify-end", isMe ? "text-emerald-100" : "text-slate-500")}>
                     {msg.createdAt ? dayjs(msg.createdAt.toDate()).format('HH:mm') : 'Mengirim...'}
                   </div>
                 </div>
               </div>
             )
           })
         )}
         <div ref={endRef} />
       </div>

       {/* Input Area */}
       <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto">
             <button type="button" className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0">
               <PlusCircle className="w-6 h-6" />
             </button>
             <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex items-end shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-[#1b4332]/10 dark:focus-within:ring-emerald-500/10 transition-all font-medium">
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="Ketik pesan..."
                  className="w-full max-h-32 min-h-[52px] bg-transparent border-none outline-none resize-none p-4 pb-3.5 text-sm sm:text-[15px] dark:text-slate-50 placeholder:text-slate-400"
                  rows={1}
                />
             </div>
             <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="w-[52px] h-[52px] shrink-0 bg-[#1b4332] hover:bg-[#0f2c20] text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-emerald-900"
             >
                <Send className="w-5 h-5 ml-1" />
             </button>
          </form>
       </div>
    </div>
  );
}
