import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AgeCategory, Answer, ChildProfile } from './types';
import { QUESTIONS_DATA } from './data/questions';
import { cn } from './lib/utils';
import { Baby, Info, CheckCircle2, AlertCircle, RefreshCcw, ArrowRight, Activity, Smile, ArrowLeft, Check, LogOut, Loader2, Sparkles } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import AuthView from './components/AuthView';
import ChildOnboardingView from './components/ChildOnboardingView';
import DashboardView from './components/DashboardView';
import ReactMarkdown from 'react-markdown';

type ViewState = 'HOME' | 'ONBOARDING' | 'DASHBOARD' | 'QUESTIONNAIRE' | 'RESULT' | 'HISTORY_DETAIL';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [view, setView] = useState<ViewState>('HOME');
  const [age, setAge] = useState<AgeCategory | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId -> score (0 or 1)
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoadingProfile(true);
        try {
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
        } catch (err) {
          console.error("Error fetching child profiles", err);
        } finally {
          setLoadingProfile(false);
        }
      } else {
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
      <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="flex h-screen bg-[#F4F5F7] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar (Hidden on mobile) */}
      <aside className="w-[260px] hidden lg:flex flex-col pt-8 pb-6 px-5 shrink-0 overflow-y-auto">
        <div className="flex items-center gap-3 px-3 mb-10">
           <div className="w-10 h-10 bg-[#1b4332] rounded-xl flex items-center justify-center shadow-sm">
             <Baby className="w-6 h-6 text-white" />
           </div>
           <div className="font-bold tracking-tight text-slate-900 text-xl">
              Kuisioner<span className="text-emerald-700">Anak</span>
           </div>
        </div>

        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Menu</div>
        <nav className="space-y-1.5 mb-8">
           <button 
             onClick={() => setView('DASHBOARD')}
             className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900")}
           >
             <Activity className={cn("w-5 h-5", view === 'DASHBOARD' || view === 'HISTORY_DETAIL' || view === 'QUESTIONNAIRE' || view === 'RESULT' ? "text-[#1b4332]" : "text-slate-400")} />
             Dashboard
           </button>
           <button 
             disabled
             className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 font-semibold rounded-xl text-sm cursor-not-allowed"
           >
             <CheckCircle2 className="w-5 h-5" />
             Tugas <span className="ml-auto text-[9px] bg-slate-200 text-slate-500 py-0.5 px-2 rounded-full uppercase tracking-wider">Cooming Soon</span>
           </button>
           <button 
             onClick={() => setView('ONBOARDING')}
             className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors", view === 'ONBOARDING' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900")}
           >
             <Smile className={cn("w-5 h-5", view === 'ONBOARDING' ? "text-[#1b4332]" : "text-slate-400")} />
             Tambah Anak
           </button>
        </nav>

        <div className="mt-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Pengaturan</div>
          <button 
             onClick={handleLogout}
             className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-sm font-semibold"
          >
             <LogOut className="w-5 h-5" />
             Keluar
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <main className="flex-1 lg:my-3 lg:mr-3 bg-white lg:rounded-[32px] shadow-[0_2px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-200/50 flex flex-col overflow-hidden relative w-full h-full lg:h-[calc(100vh-24px)]">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0 bg-white shadow-sm z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1b4332] flex items-center justify-center">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold tracking-tight text-slate-900 text-lg">Kuisioner<span className="text-emerald-700">Anak</span></div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-slate-900 bg-slate-50 rounded-lg">
             <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-[88px] items-center justify-between px-10 shrink-0 bg-white border-b border-slate-100/50 z-30">
           {/* Search Placeholder */}
           <div className="flex items-center bg-slate-50 border border-slate-100 rounded-full px-5 py-3 w-[360px] text-slate-400 text-sm font-medium hover:bg-slate-100 transition-colors cursor-text">
              <span className="opacity-70">Cari data anak...</span>
           </div>
           
           <div className="flex items-center gap-8">
              {view === 'QUESTIONNAIRE' && (
                <button
                  onClick={handleResetToDashboard}
                  className="text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                >
                  Batalkan Skrining
                </button>
              )}
              {view === 'ONBOARDING' && activeProfile && (
                <button
                  onClick={() => setView('DASHBOARD')}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Kembali ke Dashboard
                </button>
              )}
              
              {/* Profile Display Box */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-full pl-2 pr-6 py-2 shadow-sm">
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm shadow-inner uppercase font-bold">
                    {user.email?.charAt(0) || 'U'}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 leading-none mb-1">{user.email?.split('@')[0]}</span>
                    <span className="text-[10px] text-slate-500 font-medium leading-none">{user.email}</span>
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10 bg-white">
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
              existingAnalysis={selectedHistory.aiAnalysis}
              onClose={() => {
                setSelectedHistory(null);
                setView('DASHBOARD');
              }}
              isHistoryMode={true}
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm sticky top-[80px] z-20">
        <div className="flex justify-between items-end mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Progres Pengerjaan</span>
            <span className="text-2xl font-bold text-slate-900 leading-none">{answeredCount}<span className="text-slate-400">/{questions.length}</span></span>
          </div>
          <span className="text-sm text-slate-500 font-medium">{Math.round(progress)}% Selesai</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
            className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-center"
          >
            <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider rounded-md mb-6 self-start">
              {currentQuestion.kategori}
            </span>
            <h3 className="text-xl sm:text-2xl font-medium leading-relaxed text-slate-900 mb-10">
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
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span className="text-lg font-bold">IYA</span>
                <span className={cn("text-xs font-medium", currentAnswer === 1 ? "text-emerald-100" : "text-slate-500")}>Skor: 1</span>
              </button>
              <button
                onClick={() => handleAnswerClick(0)}
                className={cn(
                  "p-6 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer",
                  currentAnswer === 0
                    ? "border-[#1b4332] bg-[#1b4332] text-white shadow-md shadow-[#1b4332]/10"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span className="text-lg font-bold">TIDAK</span>
                <span className={cn("text-xs font-medium", currentAnswer === 0 ? "text-emerald-100" : "text-slate-500")}>Skor: 0</span>
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
                 currentIndex === 0 ? "text-slate-600 cursor-not-allowed" : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
           >
              <ArrowLeft className="w-5 h-5" />
           </button>
           <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className={cn(
                 "p-3 rounded-xl transition-all flex items-center justify-center",
                 currentIndex === questions.length - 1 ? "text-slate-600 cursor-not-allowed" : "text-slate-300 hover:bg-white/10 hover:text-white"
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
              ? "bg-white text-slate-900 hover:bg-slate-100 shadow-sm" 
              : "bg-white/10 text-slate-400 cursor-not-allowed"
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
  existingAnalysis?: string;
  onAnalysisGenerated?: (analysis: string) => void;
}> = ({ age, answers, onClose, isHistoryMode, existingAnalysis, onAnalysisGenerated }) => {
  const questions = QUESTIONS_DATA[age];
  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((acc: number, score: number) => acc + score, 0);
  }, [answers]);

  let resultCategory = "";
  let resultColor = "";
  let resultIcon = null;
  let resultDescription = "";

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(existingAnalysis || null);
  const [loadingAi, setLoadingAi] = useState(!existingAnalysis);

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
      className="max-w-3xl mx-auto space-y-8 pb-10"
    >
      <div className={cn("p-8 sm:p-12 rounded-2xl border flex flex-col justify-center shadow-sm relative overflow-hidden", resultColor)}>
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <div className="scale-[4] origin-top-right mix-blend-overlay">{resultIcon}</div>
        </div>
        <div className="flex justify-center mb-6 relative z-10">
          <div className="p-4 bg-white/70 rounded-full shadow-sm backdrop-blur-md">
            {resultIcon}
          </div>
        </div>
        <div className="text-center relative z-10">
          <div className="text-6xl sm:text-7xl font-bold tracking-tight mb-4 text-slate-800">
            {totalScore}<span className="text-3xl font-medium text-slate-400">/10</span>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">Kesimpulan Hasil</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">{resultCategory}</h2>
          <p className="text-sm sm:text-base opacity-80 max-w-xl mx-auto font-medium leading-relaxed">{resultDescription}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 bg-purple-50 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg shadow-sm border border-purple-200/50">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900 tracking-tight">
            Analisis & Saran
          </h3>
        </div>
        <div className="p-6 sm:p-8">
          {loadingAi ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-4">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <span className="text-sm font-medium">Menyusun analisis...</span>
            </div>
          ) : aiAnalysis ? (
            <div className="markdown-body prose prose-slate prose-sm sm:prose-base prose-p:leading-relaxed prose-a:text-purple-600 max-w-none">
              <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
            </div>
          ) : (
             <div className="text-center py-8 text-slate-400 text-sm">Gagal memuat analisis.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-900 tracking-tight">
            Rekapitulasi Jawaban
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {questions.map((q, i) => {
            const score = answers[q.id];
            return (
              <div key={q.id} className="p-6 sm:p-8 flex gap-4 sm:gap-6 items-start hover:bg-slate-50/50 transition-subtle">
                <span className="font-bold text-lg text-slate-300 shrink-0 select-none w-6">{i + 1}.</span>
                <div className="flex-1">
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{q.kategori}</span>
                  <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed mb-4">{q.pertanyaan}</p>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold",
                    score === 1
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  )}>
                    {score === 1 ? 'Iya (Skor: 1)' : 'Tidak (Skor: 0)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onClose}
          className="flex items-center justify-center min-w-[200px] gap-2.5 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-subtle shadow-sm text-sm"
        >
          {isHistoryMode ? (
            <>
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </>
          ) : (
            <>
              <RefreshCcw className="w-4 h-4" />
              Kuisioner Baru
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
