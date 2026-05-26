import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AgeCategory, Answer, ChildProfile, UserProfile } from './types';
import { QUESTIONS_DATA } from './data/questions';
import { cn } from './lib/utils';
import { Baby, Info, CheckCircle2, AlertCircle, RefreshCcw, ArrowRight, Activity, Smile, ArrowLeft, Check, LogOut, Loader2, Sparkles, Moon, Sun, Users, MessageSquare, Download, MapPin } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import AuthView from './components/AuthView';
import ChildOnboardingView from './components/ChildOnboardingView';
import DashboardView from './components/DashboardView';
import NakesDashboardView from './components/NakesDashboardView';
import ChatView from './components/ChatView';
import ParentChatList from './components/ParentChatList';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';

type ViewState = 'HOME' | 'ONBOARDING' | 'DASHBOARD' | 'QUESTIONNAIRE' | 'RESULT' | 'HISTORY_DETAIL' | 'NAKES_DASHBOARD' | 'NAKES_CHAT' | 'PARENT_CHAT_LIST' | 'PARENT_CHAT';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [targetChatUser, setTargetChatUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [view, setView] = useState<ViewState>('HOME');
  const [age, setAge] = useState<AgeCategory | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoadingProfile(true);
        try {
          // Fetch user profile to get role
          const userDocSnap = await getDoc(doc(db, 'users', currentUser.uid));
          let currentRole = 'orang_tua'; // default
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            currentRole = data.role || 'orang_tua';
            setUserProfile(data as UserProfile);
          } else {
            // Provide a default user profile if none exists
            const fallbackProfile: UserProfile = { uid: currentUser.uid, email: currentUser.email || '', role: 'orang_tua' };
            setUserProfile(fallbackProfile);
          }

          if (currentRole === 'nakes') {
             setView('NAKES_DASHBOARD');
          } else {
            const q = query(collection(db, 'childProfiles'), where('userId', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            const profiles: ChildProfile[] = [];
            querySnapshot.forEach((docSnap) => {
              profiles.push({ id: docSnap.id, ...docSnap.data() } as ChildProfile);
            });
            setChildProfiles(profiles);
            if (profiles.length > 0) {
              setActiveProfileId(profiles[0].id || null);
              setView('DASHBOARD');
            } else {
              setView('ONBOARDING');
            }
          }
        } catch (err) {
          console.error("Error fetching user data", err);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        setChildProfiles([]);
        setActiveProfileId(null);
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const activeProfile = childProfiles.find(p => p.id === activeProfileId);

  const handleStartQuestionnaire = (selectedAge: AgeCategory) => {
    setAge(selectedAge);
    setAnswers({});
    setView('QUESTIONNAIRE');
  };

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = async () => {
    setView('RESULT');
    // save to firestore
    if (user && activeProfileId && age) {
      const totalScore = Object.values(answers).reduce((acc: number, score: number) => acc + score, 0);
      const resultId = user.uid + '_' + Date.now().toString();
      setCurrentResultId(resultId);
      try {
        await setDoc(doc(db, 'questionnaireResults', resultId), {
          userId: user.uid,
          profileId: activeProfileId,
          ageCategory: age,
          answers: answers,
          totalScore: totalScore,
          createdAt: serverTimestamp()
        });
      } catch(err) {
        console.error("Failed to save result", err);
      }
    }
  };

  const handleResetToDashboard = () => {
    setAge(null);
    setAnswers({});
    setView('DASHBOARD');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAge(null);
      setAnswers({});
      setView('HOME');
    } catch (err) {
      console.error("Error signing out", err);
    }
  };

  const handleProfileComplete = (profile: ChildProfile) => {
    setChildProfiles(prev => [...prev, profile]);
    setActiveProfileId(profile.id || null);
    setView('DASHBOARD');
  };

  if (loadingUser || loadingProfile) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] dark:bg-slate-950 flex items-center justify-center font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-slate-700 dark:text-slate-300" />
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="flex h-screen bg-[#F4F5F7] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 overflow-hidden">
      {/* Sidebar (Hidden on mobile) */}
      <aside className="w-[260px] hidden lg:flex flex-col pt-8 pb-6 px-5 shrink-0 overflow-y-auto">
        <div className="flex items-center px-3 mb-5">
           <img src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779549262/ChatGPT_Image_May_23__2026__10_10_14_PM-removebg-preview_k2cxf5.webp" alt="Kuisioner Anak Logo" className="h-16 w-auto object-contain" />
        </div>

        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Menu</div>
        <nav className="space-y-1.5 mb-8">
           <button 
             onClick={() => setView(userProfile?.role === 'nakes' ? 'NAKES_DASHBOARD' : 'DASHBOARD')}
             className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' || view === 'NAKES_DASHBOARD' || view === 'NAKES_CHAT' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-100 dark:border-slate-800" : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-50")}
           >
             <Activity className={cn("w-5 h-5", view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' || view === 'NAKES_DASHBOARD' || view === 'NAKES_CHAT' ? "text-[#1b4332] dark:text-emerald-400" : "text-slate-400")} />
             Dashboard
           </button>
           <button 
             disabled
             className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 font-semibold rounded-xl text-sm cursor-not-allowed"
           >
             <CheckCircle2 className="w-5 h-5" />
             Tugas <span className="ml-auto text-[9px] bg-slate-200 text-slate-500 dark:text-slate-400 py-0.5 px-2 rounded-full uppercase tracking-wider">Cooming Soon</span>
           </button>
           {userProfile?.role !== 'nakes' && (
             <button 
               onClick={() => setView('ONBOARDING')}
               className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'ONBOARDING' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-100 dark:border-slate-800" : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-50")}
             >
               <Smile className={cn("w-5 h-5", view === 'ONBOARDING' ? "text-[#1b4332] dark:text-emerald-400" : "text-slate-400")} />
               Tambah Anak
             </button>
           )}
           {userProfile?.role === 'orang_tua' && (
             <button 
               onClick={() => setView('PARENT_CHAT_LIST')}
               className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-100 dark:border-slate-800" : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-50")}
             >
               <MessageSquare className={cn("w-5 h-5", view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' ? "text-[#1b4332] dark:text-emerald-400" : "text-slate-400")} />
               Konsultasi Nakes
             </button>
           )}
        </nav>

        <div className="mt-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Pengaturan</div>
          <button 
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
             className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 transition-colors text-sm font-semibold"
          >
             {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          </button>
          <button 
             onClick={handleLogout}
             className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-sm font-semibold"
          >
             <LogOut className="w-5 h-5" />
             Keluar
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <main className="flex-1 lg:my-3 lg:mr-3 bg-white dark:bg-slate-900 lg:rounded-[32px] shadow-[0_2px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-700/50 flex flex-col overflow-hidden relative w-full h-full lg:h-[calc(100vh-24px)]">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 shadow-sm z-30">
          <div className="flex items-center">
            <img src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779549262/ChatGPT_Image_May_23__2026__10_10_14_PM-removebg-preview_k2cxf5.webp" alt="Kuisioner Anak Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 bg-slate-50 dark:bg-slate-800 rounded-lg">
               {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 bg-slate-50 dark:bg-slate-800 rounded-lg">
               <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-[88px] items-center justify-between px-10 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50 z-30">
           {/* Search Placeholder */}
           <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-full px-5 py-3 w-[360px] text-slate-400 text-sm font-medium hover:bg-slate-100 dark:bg-slate-800 transition-colors cursor-text">
              <span className="opacity-70">Cari data anak...</span>
           </div>
           
           <div className="flex items-center gap-8">
              {view === 'QUESTIONNAIRE' && (
                <button
                  onClick={handleResetToDashboard}
                  className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors"
                >
                  Batalkan Skrining
                </button>
              )}
              {view === 'ONBOARDING' && activeProfile && (
                <button
                  onClick={() => setView('DASHBOARD')}
                  className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 transition-colors"
                >
                  Kembali ke Dashboard
                </button>
              )}
              
              {/* Profile Display Box */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-full pl-2 pr-6 py-2 shadow-sm">
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm shadow-inner uppercase font-bold">
                    {user.email?.charAt(0) || 'U'}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-50 leading-none mb-1 flex items-center gap-2">
                      {user.email?.split('@')[0]}
                      {userProfile?.role === 'nakes' && (
                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">Nakes</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">{user.email}</span>
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10 bg-white dark:bg-slate-900">
          <AnimatePresence mode="wait">
            {view === 'ONBOARDING' && (
            <ChildOnboardingView key="onboarding" user={user} onComplete={handleProfileComplete} />
          )}
          {view === 'DASHBOARD' && activeProfile && (
            <DashboardView 
              key="dashboard" 
              profiles={childProfiles}
              activeProfileId={activeProfileId}
              onSelectProfile={setActiveProfileId}
              onAddProfile={() => setView('ONBOARDING')}
              onStartQuestionnaire={handleStartQuestionnaire}
              onViewHistoryDetail={(history) => {
                setSelectedHistory(history);
                setView('HISTORY_DETAIL');
              }}
            />
          )}
          {view === 'QUESTIONNAIRE' && age && (
            <QuestionnaireView
              key="questionnaire"
              age={age}
              answers={answers}
              onAnswer={handleAnswer}
              onSubmit={handleSubmit}
            />
          )}
          {view === 'RESULT' && age && (
            <ResultView
              key="result"
              age={age}
              answers={answers}
              profile={activeProfile}
              onClose={handleResetToDashboard}
              isHistoryMode={false}
              onAnalysisGenerated={async (analysis) => {
                if (currentResultId) {
                  try {
                    const { updateDoc } = await import('firebase/firestore');
                    await updateDoc(doc(db, 'questionnaireResults', currentResultId), {
                      aiAnalysis: analysis
                    });
                  } catch (e) {
                    console.error('Failed to save AI analysis', e);
                  }
                }
              }}
            />
          )}
          {view === 'HISTORY_DETAIL' && selectedHistory && (
            <ResultView
              key="history_detail"
              age={selectedHistory.ageCategory as AgeCategory}
              answers={selectedHistory.answers}
              profile={childProfiles.find(p => p.id === selectedHistory.profileId) || activeProfile}
              existingAnalysis={selectedHistory.aiAnalysis}
              onClose={() => {
                setSelectedHistory(null);
                setView('DASHBOARD');
              }}
              isHistoryMode={true}
            />
          )}
          {view === 'NAKES_DASHBOARD' && userProfile && (
             <NakesDashboardView 
               key="nakes_dashboard"
               userProfile={userProfile}
               onOpenChat={(targetParent) => {
                 setTargetChatUser(targetParent);
                 setView('NAKES_CHAT');
               }}
             />
          )}
          {view === 'NAKES_CHAT' && userProfile && targetChatUser && (
             <ChatView 
               key="nakes_chat"
               currentUser={userProfile}
               targetUser={targetChatUser}
               onBack={() => setView('NAKES_DASHBOARD')}
             />
          )}
          {view === 'PARENT_CHAT_LIST' && userProfile && (
             <ParentChatList 
               key="parent_chat_list"
               userProfile={userProfile}
               onOpenChat={(nakes) => {
                 setTargetChatUser(nakes);
                 setView('PARENT_CHAT');
               }}
             />
          )}
          {view === 'PARENT_CHAT' && userProfile && targetChatUser && (
             <ChatView 
               key="parent_chat"
               currentUser={userProfile}
               targetUser={targetChatUser}
               onBack={() => setView('PARENT_CHAT_LIST')}
             />
          )}
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}


const QuestionnaireView: React.FC<{
  age: AgeCategory;
  answers: Record<string, number>;
  onAnswer: (id: string, score: number) => void;
  onSubmit: () => void;
}> = ({ age, answers, onAnswer, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const questions = QUESTIONS_DATA[age];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const isComplete = answeredCount === questions.length;
  
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];

  const handleAnswerClick = (score: number) => {
    onAnswer(currentQuestion.id, score);
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-3xl mx-auto space-y-8 pb-32" 
    >
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm sticky top-[80px] z-20">
        <div className="flex justify-between items-end mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Progres Pengerjaan</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-none">{answeredCount}<span className="text-slate-400">/{questions.length}</span></span>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{Math.round(progress)}% Selesai</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#1b4332] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-center"
          >
            <span className="inline-flex px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider rounded-md mb-6 self-start">
              {currentQuestion.kategori}
            </span>
            <h3 className="text-xl sm:text-2xl font-medium leading-relaxed text-slate-900 dark:text-slate-50 mb-10">
              <span className="text-slate-300 font-normal mr-3">{currentIndex + 1}.</span>
              {currentQuestion.pertanyaan}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswerClick(1)}
                className={cn(
                  "p-6 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer",
                  currentAnswer === 1
                    ? "border-[#1b4332] bg-[#1b4332] text-white shadow-md shadow-[#1b4332]/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800"
                )}
              >
                <span className="text-lg font-bold">IYA</span>
                <span className={cn("text-xs font-medium", currentAnswer === 1 ? "text-emerald-100" : "text-slate-500 dark:text-slate-400")}>Skor: 1</span>
              </button>
              <button
                onClick={() => handleAnswerClick(0)}
                className={cn(
                  "p-6 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer",
                  currentAnswer === 0
                    ? "border-[#1b4332] bg-[#1b4332] text-white shadow-md shadow-[#1b4332]/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800"
                )}
              >
                <span className="text-lg font-bold">TIDAK</span>
                <span className={cn("text-xs font-medium", currentAnswer === 0 ? "text-emerald-100" : "text-slate-500 dark:text-slate-400")}>Skor: 0</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-3xl glass-dark text-white p-2.5 rounded-2xl z-30 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex gap-2.5">
           <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={cn(
                 "p-3 rounded-xl transition-all flex items-center justify-center",
                 currentIndex === 0 ? "text-slate-600 dark:text-slate-400 cursor-not-allowed" : "text-slate-300 hover:bg-white/10 dark:hover:bg-white/10 hover:text-white"
              )}
           >
              <ArrowLeft className="w-5 h-5" />
           </button>
           <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className={cn(
                 "p-3 rounded-xl transition-all flex items-center justify-center",
                 currentIndex === questions.length - 1 ? "text-slate-600 dark:text-slate-400 cursor-not-allowed" : "text-slate-300 hover:bg-white/10 dark:hover:bg-white/10 hover:text-white"
              )}
           >
             <ArrowRight className="w-5 h-5" />
           </button>
        </div>
        <button
          disabled={!isComplete}
          onClick={onSubmit}
          className={cn(
            "py-3 px-6 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/20",
            isComplete 
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 hover:bg-slate-100 dark:bg-slate-800 shadow-sm" 
              : "bg-white/10 dark:bg-white/10 text-slate-400 cursor-not-allowed"
          )}
        >
          {isComplete ? "Kirim Hasil" : "Jawab Semua (10)"}
        </button>
      </div>
    </motion.div>
  );
}

const ResultView: React.FC<{
  age: AgeCategory;
  answers: Record<string, number>;
  onClose: () => void;
  isHistoryMode: boolean;
  profile?: ChildProfile;
  existingAnalysis?: string;
  onAnalysisGenerated?: (analysis: string) => void;
}> = ({ age, answers, onClose, isHistoryMode, profile, existingAnalysis, onAnalysisGenerated }) => {
  const questions = QUESTIONS_DATA[age];
  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((acc: number, score: number) => acc + score, 0);
  }, [answers]);

  const categoryScores = useMemo(() => {
    const scores: Record<string, { total: number, max: number }> = {};
    questions.forEach(q => {
      if (!scores[q.kategori]) scores[q.kategori] = { total: 0, max: 0 };
      scores[q.kategori].max += 1;
      scores[q.kategori].total += answers[q.id] || 0;
    });
    return scores;
  }, [answers, questions]);

  let resultCategory = "";
  let resultColor = "";
  let resultIcon = null;
  let resultDescription = "";

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(existingAnalysis || null);
  const [loadingAi, setLoadingAi] = useState(!existingAnalysis);
  
  const [exportingPdf, setExportingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);

      setTimeout(async () => {
        const element = pdfRef.current;
        if (!element) {
          setExportingPdf(false);
          return;
        }

        try {
          const dataUrl = await toJpeg(element, { quality: 0.98, backgroundColor: '#ffffff', pixelRatio: 2 });
          
          const pdfWidthIn = 8.27; // A4 width in inches
          const pdfHeightIn = (element.offsetHeight * pdfWidthIn) / element.offsetWidth;
          
          const pdf = new jsPDF({
            orientation: pdfHeightIn > pdfWidthIn ? 'portrait' : 'landscape',
            unit: 'in',
            format: [pdfWidthIn, pdfHeightIn]
          });

          pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidthIn, pdfHeightIn);
          pdf.save(`Laporan_Perkembangan_${profile?.name || 'Anak'}.pdf`);
        } catch(e) {
             console.error("PDF generation error: ", e);
        } finally {
            setExportingPdf(false);
        }
      }, 500);

    } catch (err) {
      console.error(err);
      setExportingPdf(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (existingAnalysis) {
      return;
    }
    const fetchAiAnalysis = async () => {
      setLoadingAi(true);
      try {
        const qna = questions.map(q => ({
          kategori: q.kategori,
          pertanyaan: q.pertanyaan,
          jawaban: answers[q.id] === 1 ? 'Iya' : 'Tidak'
        }));
        
        const res = await fetch('/api/analyze-questionnaire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ageCategory: age, totalScore, qna })
        });
        const data = await res.json();
        if (isMounted) {
          setAiAnalysis(data.analysis);
          if (onAnalysisGenerated) onAnalysisGenerated(data.analysis);
        }
      } catch (err) {
        console.error("AI Analysis failed", err);
      } finally {
        if (isMounted) setLoadingAi(false);
      }
    };
    fetchAiAnalysis();
    return () => { isMounted = false; };
  }, [age, totalScore, answers, questions, existingAnalysis, onAnalysisGenerated]);

  if (totalScore >= 9) {
    resultCategory = "Perkembangan Anak Sesuai";
    resultColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
    resultIcon = <CheckCircle2 className="w-12 h-12 text-emerald-500" />;
    resultDescription = "Perkembangan anak Anda saat ini sesuai dengan tahapan usianya. Teruskan stimulasi yang selama ini dilakukan!";
  } else if (totalScore >= 7) {
    resultCategory = "Perkembangan Anak Meragukan";
    resultColor = "text-amber-600 bg-amber-50 border-amber-200";
    resultIcon = <AlertCircle className="w-12 h-12 text-amber-500" />;
    resultDescription = "Ada beberapa hal yang perlu distimulasi lebih lanjut. Jadwalkan evaluasi ulang 2 minggu lagi atau konsultasikan dengan tenaga kesehatan.";
  } else {
    resultCategory = "Ada Kemungkinan Penyimpangan";
    resultColor = "text-rose-600 bg-rose-50 border-rose-200";
    resultIcon = <Activity className="w-12 h-12 text-rose-500" />;
    resultDescription = "Disarankan untuk segera berkonsultasi dengan dokter spesialis anak atau tenaga kesehatan terdekat untuk evaluasi lebih komprehensif.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto pb-10"
    >
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.15 } }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        
        {/* Bento Box: Hasil Utama */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
          }}
          className={cn("col-span-1 md:col-span-5 p-8 rounded-3xl border flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden", resultColor)}
        >
          <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
            <div className="scale-[5] rotate-12">{resultIcon}</div>
          </div>
          <div className="relative z-10 mb-6">
            <div className="p-4 bg-white/60 dark:bg-slate-900/40 rounded-full shadow-sm backdrop-blur-md inline-flex">
              {resultIcon}
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-sm font-semibold uppercase tracking-wider opacity-70 mb-3">Skor Anda</div>
            <div className="text-7xl font-extrabold tracking-tight mb-2 text-slate-800 dark:text-slate-100">
              {totalScore}<span className="text-3xl font-medium text-slate-400 opacity-60">/10</span>
            </div>
            <h2 className="text-2xl font-bold mt-6 mb-3 tracking-tight">{resultCategory}</h2>
            <p className="text-sm opacity-80 max-w-sm mx-auto font-medium leading-relaxed">{resultDescription}</p>
          </div>
        </motion.div>

        {/* Bento Box: Analisis AI */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
          }}
          className="col-span-1 md:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden relative"
        >
          <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 tracking-tight">
              Analisis & Saran Ahli
            </h3>
          </div>
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto min-h-[300px]">
            {loadingAi ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="text-sm font-medium">Menyusun analisis khusus untuk anak Anda...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="markdown-body prose prose-slate prose-sm sm:prose-base dark:prose-invert prose-p:leading-relaxed prose-a:text-purple-600 dark:prose-a:text-purple-400 max-w-none">
                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
              </div>
            ) : (
               <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">Gagal memuat analisis.</div>
            )}
          </div>
        </motion.div>

        {/* Bento Box: Rekapitulasi */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
          }}
          className="col-span-1 md:col-span-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 tracking-tight">
              Rekapitulasi Jawaban
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:gap-px bg-slate-100 dark:bg-slate-800">
            {questions.map((q, i) => {
              const score = answers[q.id];
              return (
                <div key={q.id} className="p-6 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex flex-col">
                  <div className="flex items-start gap-4 mb-4 flex-1">
                    <span className="font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg w-8 h-8 flex items-center justify-center shrink-0 shadow-sm text-sm">{i + 1}</span>
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{q.kategori}</span>
                      <p className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-relaxed">{q.pertanyaan}</p>
                    </div>
                  </div>
                  <div className="mt-auto pl-12">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                      score === 1
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    )}>
                      {score === 1 ? 'Iya (Skor: 1)' : 'Tidak (Skor: 0)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <div className="flex justify-center gap-4 pt-10">
        <button
          onClick={handleExportPdf}
          disabled={exportingPdf}
          className="flex items-center justify-center min-w-[200px] gap-2.5 px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-all shadow-sm text-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {exportingPdf ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {exportingPdf ? 'Menyiapkan PDF...' : 'Export PDF'}
        </button>

        <button
          onClick={onClose}
          className="flex items-center justify-center min-w-[200px] gap-2.5 px-6 py-3.5 bg-slate-900 dark:bg-white border rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold transition-all shadow-md text-sm"
        >
          {isHistoryMode ? (
            <>
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Dashboard
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Selesai & Kembali
            </>
          )}
        </button>
      </div>

      {/* Hidden PDF Template */}
      <div className="absolute top-[9999px] left-[9999px] z-[-1] pointer-events-none overflow-hidden">
        <div ref={pdfRef} className="p-8 w-[800px] print-container font-sans" style={{ backgroundColor: '#ffffff', color: '#0f172a', display: 'block' }}>
           <div className="flex items-center gap-4 mb-8 pb-6 border-b" style={{ borderColor: '#e2e8f0' }}>
             <div className="p-3 rounded-xl" style={{ backgroundColor: '#ecfdf5' }}>
               <Activity className="w-8 h-8" style={{ color: '#059669' }} />
             </div>
             <div>
               <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Laporan Hasil Skrining Perkembangan</h1>
               <p style={{ color: '#64748b' }}>Aplikasi Kuisioner Tumbuh Kembang Anak</p>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-6 mb-8">
             <div className="p-5 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>Data Anak</h3>
                <div className="space-y-3">
                  <div><span className="block text-xs" style={{ color: '#64748b' }}>Nama Lengkap</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile?.name || '-'}</span></div>
                  <div><span className="block text-xs" style={{ color: '#64748b' }}>Usia</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile?.ageInMonths || '-'} Bulan</span></div>
                  <div><span className="block text-xs" style={{ color: '#64748b' }}>Jenis Kelamin</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile?.gender || '-'}</span></div>
                  <div className="flex gap-4">
                     <div><span className="block text-xs" style={{ color: '#64748b' }}>Tinggi Badan</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile?.heightCm || '-'} cm</span></div>
                     <div><span className="block text-xs" style={{ color: '#64748b' }}>Berat Badan</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile?.weightKg || '-'} kg</span></div>
                     {profile?.headCircumferenceCm && (
                       <div><span className="block text-xs" style={{ color: '#64748b' }}>Lingkar Kepala</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile.headCircumferenceCm} cm</span></div>
                     )}
                  </div>
                </div>
             </div>
             <div className="p-5 rounded-xl border flex flex-col justify-center items-center text-center" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>Hasil Skrining (Usia {age === '3_bulan' ? '3' : '6'} Bulan)</h3>
                <div className="text-5xl font-extrabold mb-2" style={{ color: '#1e293b' }}>{totalScore}<span className="text-xl" style={{ color: '#94a3b8' }}>/10</span></div>
                <div className="font-bold text-lg mb-1" style={{ color: '#059669' }}>{resultCategory}</div>
                <p className="text-xs px-4" style={{ color: '#475569' }}>{resultDescription}</p>
             </div>
           </div>

           <div className="mb-8">
             <h3 className="text-base font-bold mb-4 flex items-center gap-2 border-b pb-2" style={{ color: '#0f172a', borderColor: '#e2e8f0' }}>
               Rincian Parameter Skrining
             </h3>
             <div className="grid grid-cols-2 gap-4">
               {Object.entries(categoryScores).map(([cat, score]) => (
                 <div key={cat} className="p-4 rounded-lg border flex justify-between items-center" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                   <div className="text-xs font-bold uppercase" style={{ color: '#64748b' }}>{cat}</div>
                   <div className="font-bold text-lg" style={{ color: score.total === score.max ? '#059669' : '#d97706' }}>{score.total} / {score.max}</div>
                 </div>
               ))}
             </div>
           </div>

           <div className="mb-8">
             <h3 className="text-base font-bold mb-4 flex items-center gap-2 border-b pb-2" style={{ color: '#0f172a', borderColor: '#e2e8f0' }}>
               Grafik Pertumbuhan (Antropometri)
             </h3>
             <div className="p-5 rounded-xl border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                <p className="text-xs mb-4" style={{ color: '#64748b' }}>Posisi indikator merupakan estimasi relatif terhadap standar pertumbuhan anak seusianya (kurva KMS/WHO).</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span style={{ color: '#0f172a' }}>Berat Badan: {profile?.weightKg || '-'} kg</span>
                      <span style={{ color: profile?.weightKg && profile.weightKg > 3 ? '#10b981' : '#f59e0b' }}>{profile?.weightKg && profile.weightKg > 3 ? 'Normal' : 'Perlu Pantauan'}</span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                       <div className="h-full rounded-full" style={{ width: profile?.weightKg ? Math.min(Math.max((profile.weightKg / 10) * 100, 10), 100) + '%' : '0%', backgroundColor: profile?.weightKg && profile.weightKg > 3 ? '#10b981' : '#f59e0b' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span style={{ color: '#0f172a' }}>Tinggi Badan: {profile?.heightCm || '-'} cm</span>
                      <span style={{ color: profile?.heightCm && profile.heightCm > 50 ? '#10b981' : '#f59e0b' }}>{profile?.heightCm && profile.heightCm > 50 ? 'Normal' : 'Perlu Pantauan'}</span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                       <div className="h-full rounded-full" style={{ width: profile?.heightCm ? Math.min(Math.max((profile.heightCm / 80) * 100, 10), 100) + '%' : '0%', backgroundColor: profile?.heightCm && profile.heightCm > 50 ? '#10b981' : '#f59e0b' }}></div>
                    </div>
                  </div>
                  
                  {profile?.headCircumferenceCm && (
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span style={{ color: '#0f172a' }}>Lingkar Kepala: {profile.headCircumferenceCm} cm</span>
                        <span style={{ color: '#8b5cf6' }}>Terpantau</span>
                      </div>
                      <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                         <div className="h-full rounded-full" style={{ width: Math.min(Math.max((profile.headCircumferenceCm / 50) * 100, 10), 100) + '%', backgroundColor: '#8b5cf6' }}></div>
                      </div>
                    </div>
                  )}
                </div>
             </div>
           </div>

           <div className="mb-8 p-6 rounded-xl border" style={{ backgroundColor: '#faf5ff', borderColor: '#f3e8ff' }}>
             <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: '#581c87' }}>
               <Sparkles className="w-5 h-5" style={{ color: '#9333ea' }} />
               Analisis AI & Rekomendasi Stimulasi
             </h3>
             <div className="max-w-none text-sm pdf-markdown leading-relaxed whitespace-pre-wrap" style={{ color: '#334155' }}>
                <ReactMarkdown>{aiAnalysis || 'Analisis sedang disiapkan...'}</ReactMarkdown>
             </div>
           </div>
           
           <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: '#e2e8f0' }}>
             <p className="text-[10px] italic mb-3" style={{ color: '#64748b' }}>
               <strong>Penafian Medis:</strong> Laporan ini adalah hasil skrining awal berdasarkan input pengguna dan bukan merupakan diagnosis medis. Jika terdapat hasil "Meragukan" atau "Ada Kemungkinan Penyimpangan", serta kondisi parameter pertumbuhan di luar rentang normal, mohon segera berkonsultasi dengan Dokter Spesialis Anak (Sp.A) atau Pusat Layanan Kesehatan terdekat.
             </p>
             <p className="text-[10px]" style={{ color: '#94a3b8' }}>
               Dokumen ini dihasilkan secara otomatis oleh sistem Kuisioner Tumbuh Kembang Anak pada {new Date().toLocaleDateString('id-ID')}
             </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
