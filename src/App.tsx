import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AgeCategory, Answer, ChildProfile, UserProfile } from './types';
import { QUESTIONS_DATA, AGE_EQUIPMENT_DATA } from './data/questions';
import { cn, formatIndonesianName } from './lib/utils';
import { Baby, Info, CheckCircle2, AlertCircle, RefreshCcw, ArrowRight, Activity, Smile, ArrowLeft, Check, LogOut, Loader2, Sparkles, Moon, Sun, Users, MessageSquare, Download, MapPin, Languages, PanelLeftClose, PanelLeftOpen, Menu, X, BookOpen } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import LandingView from './components/LandingView';
import AuthView from './components/AuthView';
import ChildOnboardingView from './components/ChildOnboardingView';
import DashboardView from './components/DashboardView';
import NakesDashboardView from './components/NakesDashboardView';
import AdminDashboardView from './components/AdminDashboardView';
import ChatView from './components/ChatView';
import ParentChatList from './components/ParentChatList';
import KonsultasiNakesView from './components/KonsultasiNakesView';
import QuestionnaireView from './components/QuestionnaireView';
import ResultView from './components/ResultView';
import EdukasiTumbuhKembang from './components/EdukasiTumbuhKembang';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import TermsOfServiceView from './components/TermsOfServiceView';
import BottomNav from './components/domain/BottomNav';
import { useLanguage } from './contexts/LanguageContext';
import { applySEO, PAGE_SEO } from './lib/seo';

type ViewState = 'HOME' | 'ONBOARDING' | 'DASHBOARD' | 'QUESTIONNAIRE' | 'RESULT' | 'HISTORY_DETAIL' | 'EDUKASI' | 'NAKES_DASHBOARD' | 'NAKES_CHAT' | 'PARENT_CHAT_LIST' | 'PARENT_CHAT' | 'ADMIN_DASHBOARD';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Apply SEO metadata on authenticated view changes (all private — noindex)
  useEffect(() => {
    if (!user) return; // Public routes handle their own SEO (LandingView, AuthView)
    switch (view) {
      case 'DASHBOARD':
      case 'HISTORY_DETAIL':
        applySEO(PAGE_SEO.dashboard());
        break;
      case 'QUESTIONNAIRE':
        applySEO(PAGE_SEO.questionnaire(age ? age.replace(/_/g, ' ') : undefined));
        break;
      case 'RESULT':
        applySEO(PAGE_SEO.result());
        break;
      case 'NAKES_DASHBOARD':
      case 'NAKES_CHAT':
        applySEO(PAGE_SEO.nakesDashboard());
        break;
      case 'ADMIN_DASHBOARD':
        applySEO(PAGE_SEO.adminDashboard());
        break;
      default:
        // ONBOARDING, PARENT_CHAT_LIST, PARENT_CHAT — keep dashboard noindex
        applySEO(PAGE_SEO.dashboard());
    }
  }, [view, age, user]);

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

  // Live user presence tracking in Firestore
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, {
      isOnline: true,
      lastActive: serverTimestamp()
    }).catch(() => {});

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateDoc(userRef, {
          isOnline: true,
          lastActive: serverTimestamp()
        }).catch(() => {});
      } else {
        updateDoc(userRef, {
          isOnline: false,
          lastActive: serverTimestamp()
        }).catch(() => {});
      }
    };

    const handleBeforeUnload = () => {
      updateDoc(userRef, {
        isOnline: false,
        lastActive: serverTimestamp()
      }).catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateDoc(userRef, {
        isOnline: false,
        lastActive: serverTimestamp()
      }).catch(() => {});
    };
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

  if (location.pathname === '/privacy-policy') {
    return <PrivacyPolicyView />;
  }
  if (location.pathname === '/terms-of-service') {
    return <TermsOfServiceView />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/auth/login" element={<AuthView initialMode="login" onBack={() => navigate('/')} />} />
        <Route path="/auth/register" element={<AuthView initialMode="register" onBack={() => navigate('/')} />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyView />} />
        <Route path="/terms-of-service" element={<TermsOfServiceView />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Wrapped content component goes here...
  return (
    <div className="flex h-screen bg-[#0F766E] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 overflow-hidden">
      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-4/5 max-w-xs bg-[#0F766E] text-white flex flex-col p-6 shadow-2xl h-full overflow-y-auto z-10"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <img src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779886057/Resmi_Logo_UMS_White_FullText_1_pygmt0.webp" alt="Kuisioner Anak Logo" className="h-10 w-auto object-contain" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest px-2 mb-3">{t('sidebar.menu')}</div>
              <nav className="space-y-1.5 mb-6">
                 <button 
                   onClick={() => {
                     setView(userProfile?.role === 'admin' ? 'ADMIN_DASHBOARD' : userProfile?.role === 'nakes' ? 'NAKES_DASHBOARD' : 'DASHBOARD');
                     setMobileMenuOpen(false);
                   }}
                   className={cn("flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'ADMIN_DASHBOARD' || view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' || view === 'NAKES_DASHBOARD' || view === 'NAKES_CHAT' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
                 >
                   <div className="flex items-center gap-3">
                     <Activity className={cn("w-5 h-5", view === 'ADMIN_DASHBOARD' || view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' || view === 'NAKES_DASHBOARD' || view === 'NAKES_CHAT' ? "text-white" : "opacity-70")} />
                     {t('Dashboard')}
                   </div>
                   {unreadCount > 0 && userProfile?.role === 'nakes' && (
                     <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                       {unreadCount > 99 ? '99+' : unreadCount}
                     </span>
                   )}
                 </button>
                 {userProfile?.role === 'orang_tua' && (
                   <button 
                     onClick={() => {
                       setView('ONBOARDING');
                       setMobileMenuOpen(false);
                     }}
                     className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'ONBOARDING' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
                   >
                     <Smile className={cn("w-5 h-5", view === 'ONBOARDING' ? "text-white" : "opacity-70")} />
                     {t('Tambah Anak')}
                   </button>
                 )}
                 {userProfile?.role === 'orang_tua' && (
                   <button 
                     onClick={() => {
                       setView('EDUKASI');
                       setMobileMenuOpen(false);
                     }}
                     className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'EDUKASI' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
                   >
                     <BookOpen className={cn("w-5 h-5", view === 'EDUKASI' ? "text-white" : "opacity-70")} />
                     {t('Edukasi')}
                   </button>
                 )}
                 {userProfile?.role === 'orang_tua' && (
                   <button 
                     onClick={() => {
                       setView('PARENT_CHAT_LIST');
                       setMobileMenuOpen(false);
                     }}
                     className={cn("flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
                   >
                     <div className="flex items-center gap-3">
                       <MessageSquare className={cn("w-5 h-5", view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' ? "text-white" : "opacity-70")} />
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

              <div className="mt-auto pt-4 border-t border-white/10 space-y-1">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest px-2 mb-2">{t('Pengaturan')}</div>
                <button 
                   onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                   className="flex items-center justify-between w-full px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors text-sm font-semibold"
                >
                   <div className="flex items-center gap-3">
                     <Languages className="w-5 h-5 opacity-70" />
                     {t('Bahasa')}
                   </div>
                   <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{language}</span>
                </button>
                <button 
                   onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                   className="flex items-center gap-3 w-full px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors text-sm font-semibold"
                >
                   {theme === 'dark' ? <Sun className="w-5 h-5 opacity-70" /> : <Moon className="w-5 h-5 opacity-70" />}
                   {theme === 'dark' ? t('Mode Terang') : t('Mode Gelap')}
                </button>
                <button 
                   onClick={handleLogout}
                   className="flex items-center gap-3 w-full px-4 py-2.5 text-white/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-sm font-semibold"
                >
                   <LogOut className="w-5 h-5 opacity-70" />
                   {t('sidebar.logout')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar (Collapsible on Desktop) */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col pt-7 pb-6 shrink-0 transition-all duration-300 ease-in-out relative z-40 select-none overflow-y-auto overflow-x-hidden",
          isSidebarCollapsed ? "w-[80px] px-3 items-center" : "w-[260px] px-5"
        )}
      >
        {/* Top Logo Header */}
        <div className={cn("w-full flex items-center mb-6", isSidebarCollapsed ? "justify-center px-1" : "justify-center px-2")}>
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-center w-full overflow-hidden">
              <img 
                src="https://res.cloudinary.com/airlanggapradana/image/upload/v1779886057/Resmi_Logo_UMS_White_FullText_1_pygmt0.webp" 
                alt="Kuisioner Anak Logo" 
                className="h-14 w-auto object-contain transition-all duration-300" 
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center p-0.5 transition-transform hover:scale-105 cursor-pointer focus:outline-none"
              title="Perluas Navbar"
              aria-label="Perluas Navbar"
            >
              <img 
                src="/Resmi_Logo_UMS_Color.png" 
                alt="Universitas Muhammadiyah Surakarta Logo" 
                className="w-full h-full object-contain drop-shadow-sm" 
                referrerPolicy="no-referrer"
              />
            </button>
          )}
        </div>

        {/* Navigation Menu Section */}
        {!isSidebarCollapsed ? (
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest px-4 mb-3 w-full">
            {t('sidebar.menu')}
          </div>
        ) : (
          <div className="w-8 h-px bg-white/15 my-2 mx-auto shrink-0" />
        )}

        <nav className={cn("space-y-1.5 mb-8 w-full", isSidebarCollapsed && "flex flex-col items-center")}>
          {/* Dashboard Item */}
          {!isSidebarCollapsed ? (
            <button 
              onClick={() => setView(userProfile?.role === 'admin' ? 'ADMIN_DASHBOARD' : userProfile?.role === 'nakes' ? 'NAKES_DASHBOARD' : 'DASHBOARD')}
              className={cn("flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'ADMIN_DASHBOARD' || view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' || view === 'NAKES_DASHBOARD' || view === 'NAKES_CHAT' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
            >
              <div className="flex items-center gap-3">
                <Activity className={cn("w-5 h-5", view === 'ADMIN_DASHBOARD' || view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' || view === 'NAKES_DASHBOARD' || view === 'NAKES_CHAT' ? "text-white" : "opacity-70")} />
                <span>{t('Dashboard')}</span>
              </div>
              {unreadCount > 0 && userProfile?.role === 'nakes' && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ) : (
            <div className="relative group w-full flex justify-center">
              <button 
                onClick={() => setView(userProfile?.role === 'admin' ? 'ADMIN_DASHBOARD' : userProfile?.role === 'nakes' ? 'NAKES_DASHBOARD' : 'DASHBOARD')}
                className={cn(
                  "w-11 h-11 flex items-center justify-center rounded-xl transition-all relative",
                  view === 'ADMIN_DASHBOARD' || view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' || view === 'NAKES_DASHBOARD' || view === 'NAKES_CHAT'
                    ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
                title={t('Dashboard')}
                aria-label="Dashboard"
              >
                <Activity className={cn("w-5 h-5", view === 'ADMIN_DASHBOARD' || view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' || view === 'NAKES_DASHBOARD' || view === 'NAKES_CHAT' ? "text-white" : "opacity-80")} />
                {unreadCount > 0 && userProfile?.role === 'nakes' && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-[#0F766E]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-white/10">
                {t('Dashboard')}
              </div>
            </div>
          )}

          {/* Tasks (Coming Soon) */}
          {!isSidebarCollapsed ? (
            <button 
              disabled
              className="flex items-center gap-3 w-full px-4 py-3 text-white/40 font-semibold rounded-xl text-sm cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5 opacity-50" />
              <span>{t('sidebar.tasks')}</span> 
              <span className="ml-auto text-[9px] bg-white/10 text-white/50 py-0.5 px-2 rounded-full uppercase tracking-wider">{t('sidebar.coming_soon')}</span>
            </button>
          ) : (
            <div className="relative group w-full flex justify-center">
              <button 
                disabled
                className="w-11 h-11 flex items-center justify-center text-white/30 rounded-xl cursor-not-allowed"
                title={`${t('sidebar.tasks')} (${t('sidebar.coming_soon')})`}
                aria-label="Tasks"
              >
                <CheckCircle2 className="w-5 h-5 opacity-40" />
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-white/10">
                {t('sidebar.tasks')} <span className="ml-1 text-[9px] text-white/50">({t('sidebar.coming_soon')})</span>
              </div>
            </div>
          )}

          {/* Tambah Anak */}
          {userProfile?.role === 'orang_tua' && (
            !isSidebarCollapsed ? (
              <button 
                onClick={() => setView('ONBOARDING')}
                className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'ONBOARDING' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
              >
                <Smile className={cn("w-5 h-5", view === 'ONBOARDING' ? "text-white" : "opacity-70")} />
                <span>{t('Tambah Anak')}</span>
              </button>
            ) : (
              <div className="relative group w-full flex justify-center">
                <button 
                  onClick={() => setView('ONBOARDING')}
                  className={cn(
                    "w-11 h-11 flex items-center justify-center rounded-xl transition-all",
                    view === 'ONBOARDING' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                  title={t('Tambah Anak')}
                  aria-label="Tambah Anak"
                >
                  <Smile className={cn("w-5 h-5", view === 'ONBOARDING' ? "text-white" : "opacity-80")} />
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-white/10">
                  {t('Tambah Anak')}
                </div>
              </div>
            )
          )}

          {/* Edukasi Tumbuh Kembang */}
          {userProfile?.role === 'orang_tua' && (
            !isSidebarCollapsed ? (
              <button 
                onClick={() => setView('EDUKASI')}
                className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'EDUKASI' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
              >
                <BookOpen className={cn("w-5 h-5", view === 'EDUKASI' ? "text-white" : "opacity-70")} />
                <span>{t('Edukasi')}</span>
              </button>
            ) : (
              <div className="relative group w-full flex justify-center">
                <button 
                  onClick={() => setView('EDUKASI')}
                  className={cn(
                    "w-11 h-11 flex items-center justify-center rounded-xl transition-all",
                    view === 'EDUKASI' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                  title={t('sidebar.education')}
                  aria-label="Edukasi Tumbuh Kembang"
                >
                  <BookOpen className={cn("w-5 h-5", view === 'EDUKASI' ? "text-white" : "opacity-80")} />
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-white/10">
                  {t('sidebar.education')}
                </div>
              </div>
            )
          )}

          {/* Chat / Konsultasi */}
          {userProfile?.role === 'orang_tua' && (
            !isSidebarCollapsed ? (
              <button 
                onClick={() => setView('PARENT_CHAT_LIST')}
                className={cn("flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white")}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className={cn("w-5 h-5", view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' ? "text-white" : "opacity-70")} />
                  <span>{t('sidebar.chat')}</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            ) : (
              <div className="relative group w-full flex justify-center">
                <button 
                  onClick={() => setView('PARENT_CHAT_LIST')}
                  className={cn(
                    "w-11 h-11 flex items-center justify-center rounded-xl transition-all relative",
                    view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' ? "bg-white/20 text-white font-bold shadow-sm ring-1 ring-white/20" : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                  title={t('sidebar.chat')}
                  aria-label="Konsultasi Chat"
                >
                  <MessageSquare className={cn("w-5 h-5", view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' ? "text-white" : "opacity-80")} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-[#0F766E]">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-white/10">
                  {t('sidebar.chat')}
                </div>
              </div>
            )
          )}
        </nav>

        {/* Settings Area */}
        <div className={cn("mt-auto w-full", isSidebarCollapsed ? "flex flex-col items-center space-y-2" : "")}>
          {!isSidebarCollapsed ? (
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-widest px-4 mb-3">{t('Pengaturan')}</div>
          ) : (
            <div className="w-8 h-px bg-white/15 my-2 mx-auto shrink-0" />
          )}

          {/* Bahasa */}
          {!isSidebarCollapsed ? (
            <button 
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="flex items-center justify-between w-full px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors text-sm font-semibold"
            >
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 opacity-70" />
                <span>{t('Bahasa')}</span>
              </div>
              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{language}</span>
            </button>
          ) : (
            <div className="relative group w-full flex justify-center">
              <button 
                onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                className="w-11 h-11 flex flex-col items-center justify-center text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
                title={`${t('Bahasa')} (${language.toUpperCase()})`}
                aria-label="Ganti Bahasa"
              >
                <Languages className="w-4 h-4 opacity-80" />
                <span className="text-[8px] font-extrabold uppercase mt-0.5 tracking-tight">{language}</span>
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-white/10">
                {t('Bahasa')}: {language === 'id' ? 'Indonesia' : 'English'}
              </div>
            </div>
          )}

          {/* Theme */}
          {!isSidebarCollapsed ? (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors text-sm font-semibold"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 opacity-70 text-amber-300" /> : <Moon className="w-5 h-5 opacity-70" />}
              <span>{theme === 'dark' ? t('Mode Terang') : t('Mode Gelap')}</span>
            </button>
          ) : (
            <div className="relative group w-full flex justify-center">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-11 h-11 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
                title={theme === 'dark' ? t('Mode Terang') : t('Mode Gelap')}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 opacity-80 text-amber-300" /> : <Moon className="w-5 h-5 opacity-80" />}
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-white/10">
                {theme === 'dark' ? t('Mode Terang') : t('Mode Gelap')}
              </div>
            </div>
          )}

          {/* Logout */}
          {!isSidebarCollapsed ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-white/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-sm font-semibold"
            >
              <LogOut className="w-5 h-5 opacity-70" />
              <span>{t('sidebar.logout')}</span>
            </button>
          ) : (
            <div className="relative group w-full flex justify-center">
              <button 
                onClick={handleLogout}
                className="w-11 h-11 flex items-center justify-center text-white/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                title={t('sidebar.logout')}
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5 opacity-80" />
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-rose-950 text-rose-200 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-rose-500/20">
                {t('sidebar.logout')}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Wrapper */}
      <main className="flex-1 lg:my-3 lg:mr-3 bg-white dark:bg-slate-900 lg:rounded-[32px] shadow-[0_2px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-700/50 flex flex-col overflow-hidden relative w-full h-full lg:h-[calc(100vh-24px)]">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 shadow-sm z-30">
          <div className="flex items-center gap-2.5">
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Buka Menu"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <img 
              src="https://res.cloudinary.com/airlanggapradana/image/upload/v1793887621/Smiling_Child_Growth_Healthcare_Logo_bwwi6q.png" 
              alt="Kuisioner Anak Logo" 
              className="h-9 w-auto object-contain" 
              referrerPolicy="no-referrer"
            />
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
        <header className="hidden lg:flex h-[88px] items-center justify-between px-8 xl:px-10 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50 z-30">
           {/* Sidebar Toggle & Search */}
           <div className="flex items-center gap-3">
             <button
               type="button"
               onClick={() => setIsSidebarCollapsed(prev => !prev)}
               className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/80 dark:border-slate-800"
               title={isSidebarCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
               aria-label="Toggle Sidebar"
             >
               {isSidebarCollapsed ? (
                 <PanelLeftOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
               ) : (
                 <PanelLeftClose className="w-5 h-5" />
               )}
             </button>

             {/* Search Placeholder */}
             <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-full px-5 py-3 w-[300px] xl:w-[360px] text-slate-400 text-sm font-medium hover:bg-slate-100 dark:bg-slate-800 transition-colors cursor-text">
                <span className="opacity-70">Cari data anak...</span>
             </div>
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
                      {formatIndonesianName(userProfile?.name, user.email)}
                      {userProfile?.role === 'nakes' && (
                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">Nakes</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">{user.email}</span>
                 </div>
              </div>
           </div>
        </header>

        <div className={cn(
          "flex-1 overflow-y-auto",
          (view === 'PARENT_CHAT_LIST' || view === 'PARENT_CHAT' || view === 'NAKES_CHAT')
            ? "p-3 sm:p-5 lg:p-6 pb-24 lg:pb-8 bg-slate-50 dark:bg-slate-950 flex flex-col h-full"
            : view === 'QUESTIONNAIRE'
              ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-24 bg-slate-50 dark:bg-slate-950 w-full"
              : "px-6 py-8 lg:px-10 lg:py-10 pb-28 lg:pb-12 bg-white dark:bg-slate-900"
        )}>
          <AnimatePresence mode="wait">
            {view === 'ONBOARDING' && (
            <ChildOnboardingView key="onboarding" user={user} onComplete={handleProfileComplete} />
          )}
          {view === 'DASHBOARD' && activeProfile && (
            <DashboardView 
              key="dashboard" 
              profiles={childProfiles}
              activeProfileId={activeProfileId}
              userProfile={userProfile}
              onSelectProfile={setActiveProfileId}
              onAddProfile={() => setView('ONBOARDING')}
              onStartQuestionnaire={handleStartQuestionnaire}
              onViewHistoryDetail={(history) => {
                setSelectedHistory(history);
                setView('HISTORY_DETAIL');
              }}
              onUpdateProfile={handleUpdateProfile}
              onOpenEdukasi={() => setView('EDUKASI')}
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
              onGoToChat={() => setView('PARENT_CHAT_LIST')}
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
          {view === 'EDUKASI' && (
            <motion.div
              key="edukasi"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto pb-16 space-y-6"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setView('DASHBOARD')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('app.back_to_dashboard')}</span>
                </button>
              </div>

              <EdukasiTumbuhKembang 
                initialCategory="sesuai"
                isEmbeddedInResult={false}
                onGoToChat={() => setView('PARENT_CHAT_LIST')}
              />
            </motion.div>
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
             <KonsultasiNakesView 
               key="nakes_chat"
               currentUser={userProfile}
               initialTargetUser={targetChatUser}
               unreadCount={unreadCount}
               onBackToDashboard={() => setView('NAKES_DASHBOARD')}
             />
          )}
          {view === 'PARENT_CHAT_LIST' && userProfile && (
             <KonsultasiNakesView 
               key="parent_chat_list"
               currentUser={userProfile}
               initialTargetUser={targetChatUser}
               unreadCount={unreadCount}
               onBackToDashboard={() => setView('DASHBOARD')}
             />
          )}
          {view === 'PARENT_CHAT' && userProfile && (
             <KonsultasiNakesView 
               key="parent_chat"
               currentUser={userProfile}
               initialTargetUser={targetChatUser}
               unreadCount={unreadCount}
               onBackToDashboard={() => setView('DASHBOARD')}
             />
          )}
        </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation (< lg) */}
      {userProfile && (
        <BottomNav
          currentTab={
            view === 'QUESTIONNAIRE' || view === 'RESULT' ? 'screening' :
            view === 'PARENT_CHAT' || view === 'PARENT_CHAT_LIST' || view === 'NAKES_CHAT' ? 'chat' :
            view === 'ONBOARDING' ? 'growth' :
            'dashboard'
          }
          unreadCount={unreadCount}
          userRole={userProfile.role}
          onSelectTab={(tab) => {
            if (tab === 'dashboard') {
              setView(userProfile?.role === 'admin' ? 'ADMIN_DASHBOARD' : userProfile?.role === 'nakes' ? 'NAKES_DASHBOARD' : 'DASHBOARD');
            } else if (tab === 'screening') {
              if (activeProfile) {
                const months = activeProfile.ageInMonths;
                const available = [3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, 72];
                const nearest = available.sort((a, b) => Math.abs(a - months) - Math.abs(b - months))[0];
                handleStartQuestionnaire(`${nearest}_bulan` as AgeCategory);
              } else {
                setView('DASHBOARD');
              }
            } else if (tab === 'growth') {
              setView(userProfile?.role === 'orang_tua' ? 'DASHBOARD' : 'NAKES_DASHBOARD');
            } else if (tab === 'chat') {
              setView(userProfile?.role === 'nakes' ? 'NAKES_CHAT' : 'PARENT_CHAT_LIST');
            } else if (tab === 'profile') {
              setView(userProfile?.role === 'admin' ? 'ADMIN_DASHBOARD' : userProfile?.role === 'nakes' ? 'NAKES_DASHBOARD' : 'DASHBOARD');
            }
          }}
        />
      )}
    </div>
  );
}


