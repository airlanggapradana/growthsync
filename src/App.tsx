import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AgeCategory, Answer, ChildProfile, UserProfile } from './types';
import { QUESTIONS_DATA, AGE_EQUIPMENT_DATA } from './data/questions';
import { cn } from './lib/utils';
import { Baby, Info, CheckCircle2, AlertCircle, RefreshCcw, ArrowRight, Activity, Smile, ArrowLeft, Check, LogOut, Loader2, Sparkles, Moon, Sun, Users, MessageSquare, Download, MapPin, Languages } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import LandingView from './components/LandingView';
import AuthView from './components/AuthView';
import ChildOnboardingView from './components/ChildOnboardingView';
import DashboardView from './components/DashboardView';
import NakesDashboardView from './components/NakesDashboardView';
import AdminDashboardView from './components/AdminDashboardView';
import ChatView from './components/ChatView';
import ParentChatList from './components/ParentChatList';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from './contexts/LanguageContext';

const categoryI18nKeyMap: Record<string, string> = {
  "Gerak Kasar": "questionnaire.category.gross_motor",
  "Gerak Halus": "questionnaire.category.fine_motor",
  "Bicara dan Bahasa": "questionnaire.category.speech",
  "Sosialisasi dan Kemandirian": "questionnaire.category.social"
};

type ViewState = 'HOME' | 'ONBOARDING' | 'DASHBOARD' | 'QUESTIONNAIRE' | 'RESULT' | 'HISTORY_DETAIL' | 'NAKES_DASHBOARD' | 'NAKES_CHAT' | 'PARENT_CHAT_LIST' | 'PARENT_CHAT' | 'ADMIN_DASHBOARD';

export default function App() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
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
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadCountsBySender, setUnreadCountsBySender] = useState<Record<string, number>>({});
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setUnreadCountsBySender({});
      return;
    }
    const qUnread = query(collection(db, 'messages'), where('receiverId', '==', user.uid), where('read', '==', false));
    const unsubscribeUnread = onSnapshot(qUnread, (snap) => {
      setUnreadCount(snap.docs.length);
      const counts: Record<string, number> = {};
      snap.docs.forEach(doc => {
         const senderId = doc.data().senderId;
         counts[senderId] = (counts[senderId] || 0) + 1;
      });
      setUnreadCountsBySender(counts);
    });
    return () => unsubscribeUnread();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (window.location.pathname.startsWith('/auth')) {
          navigate('/');
        }
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

          if (currentRole === 'admin') {
             setView('ADMIN_DASHBOARD');
          } else if (currentRole === 'nakes') {
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

  const handleSubmit = () => {
    setView('RESULT');
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
      navigate('/');
    } catch (err) {
      console.error("Error signing out", err);
    }
  };

  const handleProfileComplete = (profile: ChildProfile) => {
    setChildProfiles(prev => [...prev, profile]);
    setActiveProfileId(profile.id || null);
    setView('DASHBOARD');
  };

  const handleUpdateProfile = (updatedProfile: ChildProfile) => {
    setChildProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  if (loadingUser || loadingProfile) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] dark:bg-slate-950 flex items-center justify-center font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-slate-700 dark:text-slate-300" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/auth/login" element={<AuthView initialMode="login" onBack={() => navigate('/')} />} />
        <Route path="/auth/register" element={<AuthView initialMode="register" onBack={() => navigate('/')} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Wrapped content component goes here...
  return (
    <div className="flex h-screen bg-[#263c32] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 overflow-hidden">
      {/* Sidebar (Hidden on mobile) */}
      <aside className="w-[260px] hidden lg:flex flex-col pt-8 pb-6 px-5 shrink-0 overflow-y-auto">
        <div className="flex items-center px-3 mb-5">
           <img src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779886057/Resmi_Logo_UMS_White_FullText_1_pygmt0.webp" alt="Kuisioner Anak Logo" className="h-16 w-auto object-contain" />
        </div>

        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest px-4 mb-4">{t('sidebar.menu')}</div>
        <nav className="space-y-1.5 mb-8">
           <button 
             onClick={() => setView(userProfile?.role === 'admin' ? 'ADMIN_DASHBOARD' : userProfile?.role === 'nakes' ? 'NAKES_DASHBOARD' : 'DASHBOARD')}
             className={cn("flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'ADMIN_DASHBOARD' || view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' || view === 'NAKES_DASHBOARD' || view === 'NAKES_CHAT' ? "bg-[#8cc63f] text-[#1e3025] shadow-md shadow-[#8cc63f]/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
           >
             <div className="flex items-center gap-3">
               <Activity className={cn("w-5 h-5", view === 'ADMIN_DASHBOARD' || view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' || view === 'NAKES_DASHBOARD' || view === 'NAKES_CHAT' ? "text-[#1e3025]" : "opacity-70")} />
               {t('Dashboard')}
             </div>
             {unreadCount > 0 && userProfile?.role === 'nakes' && (
               <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                 {unreadCount > 99 ? '99+' : unreadCount}
               </span>
             )}
           </button>
           <button 
             disabled
             className="flex items-center gap-3 w-full px-4 py-3 text-white/40 font-semibold rounded-xl text-sm cursor-not-allowed"
           >
             <CheckCircle2 className="w-5 h-5 opacity-50" />
             {t('sidebar.tasks')} <span className="ml-auto text-[9px] bg-white/10 text-white/50 py-0.5 px-2 rounded-full uppercase tracking-wider">{t('sidebar.coming_soon')}</span>
           </button>
           {userProfile?.role === 'orang_tua' && (
             <button 
               onClick={() => setView('ONBOARDING')}
               className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'ONBOARDING' ? "bg-[#8cc63f] text-[#1e3025] shadow-md shadow-[#8cc63f]/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
             >
               <Smile className={cn("w-5 h-5", view === 'ONBOARDING' ? "text-[#1e3025]" : "opacity-70")} />
               {t('Tambah Anak')}
             </button>
           )}
           {userProfile?.role === 'orang_tua' && (
             <button 
               onClick={() => setView('PARENT_CHAT_LIST')}
               className={cn("flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' ? "bg-[#8cc63f] text-[#1e3025] shadow-md shadow-[#8cc63f]/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
             >
               <div className="flex items-center gap-3">
                 <MessageSquare className={cn("w-5 h-5", view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' ? "text-[#1e3025]" : "opacity-70")} />
                 {t('sidebar.chat')}
               </div>
               {unreadCount > 0 && (
                 <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                   {unreadCount > 99 ? '99+' : unreadCount}
                 </span>
               )}
             </button>
           )}
        </nav>

        <div className="mt-auto">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest px-4 mb-4">{t('Pengaturan')}</div>
          <button 
             onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
             className="flex items-center justify-between w-full px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors text-sm font-semibold"
          >
             <div className="flex items-center gap-3">
               <Languages className="w-5 h-5 opacity-70" />
               {t('Bahasa')}
             </div>
             <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{language}</span>
          </button>
          <button 
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
             className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors text-sm font-semibold"
          >
             {theme === 'dark' ? <Sun className="w-5 h-5 opacity-70" /> : <Moon className="w-5 h-5 opacity-70" />}
             {theme === 'dark' ? t('Mode Terang') : t('Mode Gelap')}
          </button>
          <button 
             onClick={handleLogout}
             className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-sm font-semibold"
          >
             <LogOut className="w-5 h-5 opacity-70" />
             {t('sidebar.logout')}
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
                  {t('app.cancel_screening')}
                </button>
              )}
              {view === 'ONBOARDING' && activeProfile && (
                <button
                  onClick={() => setView('DASHBOARD')}
                  className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50 transition-colors"
                >
                  {t('app.back_to_dashboard')}
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
              onUpdateProfile={handleUpdateProfile}
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
              onSaveResult={async (analysis, analysisEn) => {
                if (user && activeProfileId && age) {
                  const totalScore = Object.values(answers).reduce((acc: number, score: number) => acc + score, 0);
                  const resultId = user.uid + '_' + Date.now().toString();
                  try {
                    await setDoc(doc(db, 'questionnaireResults', resultId), {
                      userId: user.uid,
                      profileId: activeProfileId,
                      ageCategory: age,
                      answers: answers,
                      totalScore: totalScore,
                      aiAnalysis: analysis,
                      aiAnalysisEn: analysisEn || '',
                      createdAt: serverTimestamp()
                    });
                    handleResetToDashboard();
                  } catch (e) {
                    console.error('Failed to save AI analysis', e);
                    alert(t('app.save_error'));
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
              existingAnalysisEn={selectedHistory.aiAnalysisEn}
              onClose={() => {
                setSelectedHistory(null);
                setView('DASHBOARD');
              }}
              isHistoryMode={true}
            />
          )}
          {view === 'ADMIN_DASHBOARD' && userProfile && (
             <AdminDashboardView key="admin_dashboard" userProfile={userProfile} />
          )}
          {view === 'NAKES_DASHBOARD' && userProfile && (
             <NakesDashboardView 
               key="nakes_dashboard"
               userProfile={userProfile}
               unreadCountsBySender={unreadCountsBySender}
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
               unreadCount={unreadCount}
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
               onBack={() => setView('DASHBOARD')}
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
  const { t, language } = useLanguage();
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
      <div className="bg-[#263c32] p-8 rounded-[32px] shadow-xl shadow-[#263c32]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-end mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">{t('app.progress')}</span>
            <span className="text-3xl font-bold text-white leading-none">{answeredCount}<span className="text-white/40 text-xl font-medium ml-1">/ {questions.length}</span></span>
          </div>
          <span className="text-sm text-white/70 font-semibold">{Math.round(progress)}% {t('app.finished')}</span>
        </div>
        <div className="h-2 bg-black/20 rounded-full overflow-hidden relative z-10">
          <motion.div
            className="h-full bg-[#8cc63f] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>
      </div>

      {AGE_EQUIPMENT_DATA[age] && (
        <div className="bg-[#8cc63f]/10 dark:bg-[#8cc63f]/5 border border-[#8cc63f]/25 rounded-2xl p-4 flex items-start gap-3 text-xs md:text-sm text-[#263c32] dark:text-emerald-300 font-medium">
          <Info className="w-5 h-5 flex-shrink-0 text-[#8cc63f] mt-0.5" />
          <span>{AGE_EQUIPMENT_DATA[age]}</span>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-8 md:p-12 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-center"
          >
            <span className="inline-flex px-4 py-1.5 bg-[#8cc63f]/10 text-[#263c32] text-xs font-bold uppercase tracking-wider rounded-full mb-8 self-start">
              {t(categoryI18nKeyMap[currentQuestion.kategori] || currentQuestion.kategori)}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold leading-tight text-[#263c32] mb-6">
              <span className="text-slate-300 font-medium mr-3">{currentIndex + 1}.</span>
              {t(`question.${currentQuestion.id}`)}
            </h3>

            {currentQuestion.imageUrl && (
              <div className="mb-6 rounded-[24px] overflow-hidden border border-slate-100 flex justify-center bg-slate-50/50 p-4 max-w-full">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt={t(`question.${currentQuestion.id}`)}
                  className="max-h-64 md:max-h-80 object-contain rounded-xl hover:scale-[1.02] transition-transform duration-300 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="mb-10 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm text-slate-600">
               <div className="flex items-start gap-3">
                 <Info className="w-5 h-5 flex-shrink-0 text-[#8cc63f] mt-0.5" />
                 <div className="space-y-1.5 mt-0.5">
                   <p>&bull; <span dangerouslySetInnerHTML={{ __html: t('app.instruction_yes') }} /></p>
                   <p>&bull; <span dangerouslySetInnerHTML={{ __html: t('app.instruction_no') }} /></p>
                 </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <button
                onClick={() => handleAnswerClick(1)}
                className={cn(
                  "p-6 md:p-8 rounded-[24px] border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer",
                  currentAnswer === 1
                    ? "border-[#8cc63f] bg-[#8cc63f]/10"
                    : "border-slate-100 bg-white hover:border-[#8cc63f]/50 hover:bg-slate-50"
                )}
              >
                <span className={cn("text-2xl font-black", currentAnswer === 1 ? "text-[#263c32]" : "text-slate-400")}>{t('app.yes')}</span>
                <span className={cn("text-xs font-bold px-3 py-1 rounded-full", currentAnswer === 1 ? "bg-[#8cc63f] text-[#1e3025]" : "bg-slate-100 text-slate-400")}>{t('app.score', { score: '1' })}</span>
              </button>
              <button
                onClick={() => handleAnswerClick(0)}
                className={cn(
                  "p-6 md:p-8 rounded-[24px] border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer",
                  currentAnswer === 0
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-slate-100 bg-white hover:border-amber-500/50 hover:bg-slate-50"
                )}
              >
                <span className={cn("text-2xl font-black", currentAnswer === 0 ? "text-amber-600" : "text-slate-400")}>{t('app.no')}</span>
                <span className={cn("text-xs font-bold px-3 py-1 rounded-full", currentAnswer === 0 ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400")}>{t('app.score', { score: '0' })}</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-64px)] max-w-3xl bg-[#263c32]/90 backdrop-blur-xl text-white p-3 rounded-full z-30 shadow-2xl shadow-[#263c32]/30 flex items-center justify-between gap-4 border border-white/10">
        <div className="flex gap-2">
           <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={cn(
                 "w-12 h-12 rounded-full transition-all flex items-center justify-center",
                 currentIndex === 0 ? "text-white/20 cursor-not-allowed" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
           >
              <ArrowLeft className="w-5 h-5" />
           </button>
           <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className={cn(
                 "w-12 h-12 rounded-full transition-all flex items-center justify-center",
                 currentIndex === questions.length - 1 ? "text-white/20 cursor-not-allowed" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
           >
             <ArrowRight className="w-5 h-5" />
           </button>
        </div>
        <button
          disabled={!isComplete}
          onClick={onSubmit}
          className={cn(
            "py-3.5 px-8 rounded-full font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/20",
            isComplete 
              ? "bg-[#8cc63f] text-[#1e3025] hover:bg-[#7cb435] shadow-lg shadow-[#8cc63f]/20" 
              : "bg-white/5 text-white/30 cursor-not-allowed"
          )}
        >
          {isComplete ? t('app.submit_result') : t('app.answer_all', { count: questions.length.toString() })}
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
  existingAnalysisEn?: string;
  onSaveResult?: (analysis: string, analysisEn?: string) => void;
}> = ({ age, answers, onClose, isHistoryMode, profile, existingAnalysis, existingAnalysisEn, onSaveResult }) => {
  const { language, t } = useLanguage();
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
  const [aiAnalysisEn, setAiAnalysisEn] = useState<string | null>(existingAnalysisEn || null);
  const [loadingAi, setLoadingAi] = useState(!existingAnalysis);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  
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
      setAiAnalysis(data.analysisId);
      setAiAnalysisEn(data.analysisEn);
      if (data.isFallback !== undefined) {
        setIsFallback(data.isFallback);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (existingAnalysis) {
      return;
    }
    fetchAiAnalysis();
  }, [age, totalScore, answers, questions, existingAnalysis]);

  useEffect(() => {
    if (language === 'en' && !aiAnalysisEn && aiAnalysis) {
       const translateMissing = async () => {
         setLoadingAi(true);
         try {
           const res = await fetch('/api/translate-analysis', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ text: aiAnalysis, targetLang: 'en' })
           });
           const data = await res.json();
           setAiAnalysisEn(data.translatedText);
           if (data.isFallback) {
             setIsFallback(true);
           }
         } catch(e) {
           console.error("Translation failed", e);
           setIsFallback(true);
         } finally {
           setLoadingAi(false);
         }
       };
       translateMissing();
    }
  }, [language, aiAnalysisEn, aiAnalysis]);

  if (totalScore >= 9) {
    resultCategory = t('app.result_cat_appropriate');
    resultColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
    resultIcon = <CheckCircle2 className="w-12 h-12 text-emerald-500" />;
    resultDescription = t('app.result_desc_appropriate');
  } else if (totalScore >= 7) {
    resultCategory = t('app.result_cat_doubtful');
    resultColor = "text-amber-600 bg-amber-50 border-amber-200";
    resultIcon = <AlertCircle className="w-12 h-12 text-amber-500" />;
    resultDescription = t('app.result_desc_doubtful');
  } else {
    resultCategory = t('app.result_cat_deviation');
    resultColor = "text-rose-600 bg-rose-50 border-rose-200";
    resultIcon = <Activity className="w-12 h-12 text-rose-500" />;
    resultDescription = t('app.result_desc_deviation');
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
            <div className="text-sm font-semibold uppercase tracking-wider opacity-70 mb-3">{t('app.your_score')}</div>
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
          <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 tracking-tight">
                {t('app.ai_analysis_title')}
              </h3>
            </div>
            {isFallback && (
              <span className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                {language === 'en' ? 'Local Engine' : 'Mesin Lokal'}
              </span>
            )}
          </div>
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto min-h-[300px]">
            {isFallback && (
              <div className="mb-6 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/30 dark:border-amber-800/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
                <span className="text-base select-none">⚡</span>
                <p className="leading-relaxed">
                  {language === 'en' 
                    ? "Your Gemini API Key is depleted or unconfigured. App has seamlessly switched to high-quality local analysis calculations to guarantee 100% reliability."
                    : "Kunci API Gemini habis kuota atau belum dikonfigurasi. Aplikasi secara otomatis beralih ke analisis kalkulasi lokal berkualitas tinggi untuk keandalan 100%."}
                </p>
              </div>
            )}
            {loadingAi ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="text-sm font-medium">{t('app.ai_loading')}</span>
              </div>
            ) : aiAnalysis ? (
              <div className="markdown-body prose prose-slate prose-sm sm:prose-base dark:prose-invert prose-p:leading-relaxed prose-a:text-purple-600 dark:prose-a:text-purple-400 max-w-none">
                <ReactMarkdown>{(language === 'en' && aiAnalysisEn) ? aiAnalysisEn : aiAnalysis}</ReactMarkdown>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm font-medium gap-4">
                 <span className="text-rose-500 font-bold">{t('app.ai_error')}</span>
                 <p className="text-center text-slate-500 max-w-sm mb-2">{t('app.ai_retry')}</p>
                 <button onClick={fetchAiAnalysis} className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 rounded-xl flex items-center gap-2 font-bold transition-colors">
                   <RefreshCcw className="w-4 h-4 shrink-0 inline mr-2" />
                   {t('app.ai_regenerate')}
                 </button>
               </div>
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
              {t('app.recap_title')}
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
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t(categoryI18nKeyMap[q.kategori] || q.kategori)}</span>
                      <p className="text-slate-700 dark:text-slate-200 text-sm font-medium leading-relaxed">{t(`question.${q.id}`)}</p>
                    </div>
                  </div>
                  <div className="mt-auto pl-12">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                      score === 1
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    )}>
                      {score === 1 ? t('app.yes_score') : t('app.no_score')}
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
          {exportingPdf ? t('app.preparing_pdf') : t('app.export_pdf')}
        </button>

        {isHistoryMode ? (
          <button
            onClick={onClose}
            className="flex items-center justify-center min-w-[200px] gap-2.5 px-6 py-3.5 bg-slate-900 dark:bg-white border rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold transition-all shadow-md text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('app.back_to_dashboard')}
          </button>
        ) : (
          <>
            <button
              onClick={onClose}
              className="flex items-center justify-center min-w-[150px] gap-2.5 px-6 py-3.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-all shadow-sm text-sm"
            >
              {t('app.cancel')}
            </button>
            <button
              onClick={() => {
                if (aiAnalysis && onSaveResult) {
                  onSaveResult(aiAnalysis, aiAnalysisEn || undefined);
                }
              }}
              disabled={loadingAi || !aiAnalysis}
              className="flex items-center justify-center min-w-[200px] gap-2.5 px-6 py-3.5 bg-emerald-600 border border-emerald-600 rounded-xl hover:bg-emerald-700 text-white font-semibold transition-all shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:border-slate-400"
            >
              <Check className="w-5 h-5" />
              {t('app.save_result')}
            </button>
          </>
        )}
      </div>

      {/* Hidden PDF Template */}
      <div className="absolute top-[9999px] left-[9999px] z-[-1] pointer-events-none overflow-hidden">
        <div ref={pdfRef} className="p-8 w-[800px] print-container font-sans" style={{ backgroundColor: '#ffffff', color: '#0f172a', display: 'block' }}>
           <div className="flex items-center gap-4 mb-8 pb-6 border-b" style={{ borderColor: '#e2e8f0' }}>
             <div className="p-3 rounded-xl" style={{ backgroundColor: '#ecfdf5' }}>
               <Activity className="w-8 h-8" style={{ color: '#059669' }} />
             </div>
             <div>
               <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>{t('app.report_title')}</h1>
               <p style={{ color: '#64748b' }}>{t('app.report_subtitle')}</p>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-6 mb-8">
             <div className="p-5 rounded-xl border" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>{t('app.child_data')}</h3>
                <div className="space-y-3">
                  <div><span className="block text-xs" style={{ color: '#64748b' }}>{t('onboarding.name')}</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile?.name || '-'}</span></div>
                  <div><span className="block text-xs" style={{ color: '#64748b' }}>{t('dashboard.child_age')}</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile?.ageInMonths || '-'} {t('dashboard.month')}</span></div>
                  <div><span className="block text-xs" style={{ color: '#64748b' }}>{t('onboarding.gender')}</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile?.gender === 'Laki-laki' ? t('onboarding.boy') : profile?.gender === 'Perempuan' ? t('onboarding.girl') : '-'}</span></div>
                  <div className="flex gap-4">
                     <div><span className="block text-xs" style={{ color: '#64748b' }}>{t('dashboard.height')}</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile?.heightCm || '-'} cm</span></div>
                     <div><span className="block text-xs" style={{ color: '#64748b' }}>{t('dashboard.weight')}</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile?.weightKg || '-'} kg</span></div>
                     {profile?.headCircumferenceCm && (
                       <div><span className="block text-xs" style={{ color: '#64748b' }}>{t('onboarding.head_circ').split(' ')[0]}</span><span className="font-semibold" style={{ color: '#0f172a' }}>{profile.headCircumferenceCm} cm</span></div>
                     )}
                  </div>
                </div>
             </div>
             <div className="p-5 rounded-xl border flex flex-col justify-center items-center text-center" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>{t('dashboard.assessment', { age: age.split('_')[0] })}</h3>
                <div className="text-5xl font-extrabold mb-2" style={{ color: '#1e293b' }}>{totalScore}<span className="text-xl" style={{ color: '#94a3b8' }}>/10</span></div>
                <div className="font-bold text-lg mb-1" style={{ color: '#059669' }}>{resultCategory}</div>
                <p className="text-xs px-4" style={{ color: '#475569' }}>{resultDescription}</p>
             </div>
           </div>

           <div className="mb-8">
             <h3 className="text-base font-bold mb-4 flex items-center gap-2 border-b pb-2" style={{ color: '#0f172a', borderColor: '#e2e8f0' }}>
               {t('app.parameter_details')}
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
               {t('app.anthro_title')}
             </h3>
             <div className="p-5 rounded-xl border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                <p className="text-xs mb-4" style={{ color: '#64748b' }}>{t('app.anthro_desc')}</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span style={{ color: '#0f172a' }}>{t('dashboard.weight')}: {profile?.weightKg || '-'} kg</span>
                      <span style={{ color: profile?.weightKg && profile.weightKg > 3 ? '#10b981' : '#f59e0b' }}>{profile?.weightKg && profile.weightKg > 3 ? t('app.anthro_normal') : t('app.anthro_needs_review')}</span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                       <div className="h-full rounded-full" style={{ width: profile?.weightKg ? Math.min(Math.max((profile.weightKg / 10) * 100, 10), 100) + '%' : '0%', backgroundColor: profile?.weightKg && profile.weightKg > 3 ? '#10b981' : '#f59e0b' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span style={{ color: '#0f172a' }}>{t('dashboard.height')}: {profile?.heightCm || '-'} cm</span>
                      <span style={{ color: profile?.heightCm && profile.heightCm > 50 ? '#10b981' : '#f59e0b' }}>{profile?.heightCm && profile.heightCm > 50 ? t('app.anthro_normal') : t('app.anthro_needs_review')}</span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                       <div className="h-full rounded-full" style={{ width: profile?.heightCm ? Math.min(Math.max((profile.heightCm / 80) * 100, 10), 100) + '%' : '0%', backgroundColor: profile?.heightCm && profile.heightCm > 50 ? '#10b981' : '#f59e0b' }}></div>
                    </div>
                  </div>
                  
                  {profile?.headCircumferenceCm && (
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span style={{ color: '#0f172a' }}>{t('onboarding.head_circ').split(' ')[0]} {t('onboarding.head_circ').split(' ')[1]}: {profile.headCircumferenceCm} cm</span>
                        <span style={{ color: '#8b5cf6' }}>{t('app.anthro_monitored')}</span>
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
               {t('app.ai_analysis_title')}
             </h3>
             <div className="max-w-none text-sm pdf-markdown leading-relaxed whitespace-pre-wrap" style={{ color: '#334155' }}>
                <ReactMarkdown>{(language === 'en' && aiAnalysisEn) ? aiAnalysisEn : (aiAnalysis || t('app.ai_loading'))}</ReactMarkdown>
             </div>
           </div>
           
           <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: '#e2e8f0' }}>
             <p className="text-[10px] italic mb-3" style={{ color: '#64748b' }}>
               <strong>{t('app.medical_disclaimer_title')}:</strong> {t('app.medical_disclaimer_text')}
             </p>
             <p className="text-[10px]" style={{ color: '#94a3b8' }}>
               {t('app.auto_generated_doc', { date: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID') })}
             </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
