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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-100 selection:bg-blue-100 selection:text-blue-900 flex flex-col font-sans">
      <header className="h-[72px] bg-white border-b border-slate-200 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-[20px] font-extrabold text-blue-500 tracking-tight">Kuisioner</span>
              <span className="text-[20px] font-extrabold text-slate-900 tracking-tight">Anak</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {view === 'QUESTIONNAIRE' && (
              <>
                <div className="text-right hidden sm:block">
                  <div className="text-[14px] font-semibold text-slate-800">Orang Tua</div>
                  <div className="text-[12px] text-slate-500 font-medium tracking-wide leading-none mt-0.5">USIA: {age === '3_bulan' ? '3' : '6'} BULAN</div>
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-full hidden sm:flex items-center justify-center text-lg shadow-inner">
                  {activeProfile?.gender === 'Perempuan' ? '👧' : '👦'}
                </div>
                <button
                  onClick={handleResetToDashboard}
                  className="sm:ml-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-wider"
                >
                  Batal
                </button>
              </>
            )}
            <div className="w-[1px] h-6 bg-slate-200 mx-2 hidden sm:block"></div>
            <button
               onClick={handleLogout}
               className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-100"
               title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 lg:p-10">
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-3xl mx-auto space-y-8 pb-[140px]" 
    >
      <div className="bg-white p-6 sm:p-8 rounded-[20px] border border-slate-200 shadow-sm sticky top-[88px] z-20">
        <div className="text-[11px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Progres Pengerjaan</div>
        <div className="flex justify-between items-end mb-4">
          <span className="text-[24px] sm:text-[32px] font-extrabold text-slate-900 leading-none">{answeredCount}/{questions.length}</span>
          <span className="text-[14px] sm:text-[15px] text-slate-500 font-bold">{Math.round(progress)}% Selesai</span>
        </div>
        <div className="h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>
      </div>

      <div className="space-y-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-8 sm:p-12 rounded-[24px] border border-slate-200 shadow-sm flex flex-col justify-center"
          >
            <span className="inline-block px-[14px] py-[6px] rounded-full bg-sky-50 text-sky-700 text-[13px] font-bold uppercase tracking-[0.05em] mb-6 self-start">
              {currentQuestion.kategori}
            </span>
            <h3 className="text-[24px] sm:text-[32px] font-semibold leading-[1.3] text-slate-900 mb-8 sm:mb-12">
              <span className="text-slate-300 mr-3.5 font-bold">{currentIndex + 1}.</span>
              {currentQuestion.pertanyaan}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <button
                onClick={() => handleAnswerClick(1)}
                className={cn(
                  "p-6 sm:p-8 rounded-[20px] border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 outline-none cursor-pointer",
                  currentAnswer === 1
                    ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                )}
              >
                <span className="block text-[22px] sm:text-[24px] font-bold">IYA</span>
                <span className={cn("text-[13px] sm:text-[14px] font-medium", currentAnswer === 1 ? "text-blue-100" : "text-slate-500")}>Skor: 1</span>
              </button>
              <button
                onClick={() => handleAnswerClick(0)}
                className={cn(
                  "p-6 sm:p-8 rounded-[20px] border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 outline-none cursor-pointer",
                  currentAnswer === 0
                    ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                )}
              >
                <span className="block text-[22px] sm:text-[24px] font-bold">TIDAK</span>
                <span className={cn("text-[13px] sm:text-[14px] font-medium", currentAnswer === 0 ? "text-blue-100" : "text-slate-500")}>Skor: 0</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-md border-t border-slate-200 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-3">
             <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={cn(
                   "p-4 rounded-xl border-2 transition-all flex items-center justify-center",
                   currentIndex === 0 ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
             >
                <ArrowLeft className="w-6 h-6" />
             </button>
             <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className={cn(
                   "p-4 rounded-xl border-2 transition-all flex items-center justify-center",
                   currentIndex === questions.length - 1 ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
             >
               <ArrowRight className="w-6 h-6" />
             </button>
          </div>
          <button
            disabled={!isComplete}
            onClick={onSubmit}
            className={cn(
              "w-full sm:w-[300px] py-4 sm:py-5 px-8 rounded-[16px] font-extrabold text-[15px] sm:text-[16px] transition-all tracking-wider ml-auto",
              isComplete 
                ? "bg-emerald-500 text-white shadow-[0_10px_15px_-3px_rgba(16,185,129,0.3)] hover:bg-emerald-600 hover:-translate-y-0.5 cursor-pointer" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent font-bold"
            )}
          >
            {isComplete ? "SUBMIT SEKARANG" : "JAWAB SEMUA (10)"}
          </button>
        </div>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-12"
    >
      <div className={cn("p-10 sm:p-14 rounded-[32px] border text-center flex flex-col justify-center shadow-sm", resultColor)}>
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-white/70 rounded-full shadow-sm backdrop-blur-md">
            {resultIcon}
          </div>
        </div>
        <div className="text-[80px] font-black leading-none tracking-tighter mb-4 text-slate-800">{totalScore}<span className="text-[32px] font-bold text-slate-400 opacity-60">/10</span></div>
        <div className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-2">Kesimpulan Hasil</div>
        <h2 className="text-[28px] sm:text-[36px] font-extrabold mb-4 leading-tight">{resultCategory}</h2>
        <p className="text-[16px] sm:text-[18px] opacity-80 max-w-xl mx-auto font-medium leading-relaxed">{resultDescription}</p>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm mt-8 border-t-4 border-t-purple-400">
        <div className="p-6 sm:p-8 bg-purple-50/50 border-b border-slate-100 rounded-t-[24px] flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-bold text-[18px] sm:text-[20px] text-slate-800">
            Analisis & Saran
          </h3>
        </div>
        <div className="p-6 sm:p-8">
          {loadingAi ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <span className="text-[14px] font-medium">AI sedang menyusun analisis untuk Anda...</span>
            </div>
          ) : aiAnalysis ? (
            <div className="markdown-body prose prose-slate prose-p:leading-relaxed prose-li:marker:text-purple-400 prose-a:text-purple-600 max-w-none">
              <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
            </div>
          ) : (
             <div className="text-center py-6 text-slate-400 italic">Gagal memuat analisis.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm mt-8">
        <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-200 rounded-t-[24px]">
          <h3 className="font-bold text-[18px] sm:text-[20px] text-slate-800">
            Rekapitulasi Jawaban
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {questions.map((q, i) => {
            const score = answers[q.id];
            return (
              <div key={q.id} className="p-6 sm:p-8 flex gap-5 sm:gap-6 items-start hover:bg-slate-50/50 transition-colors">
                <span className="font-extrabold text-[20px] text-slate-300 shrink-0 select-none">{i + 1}.</span>
                <div className="flex-1">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{q.kategori}</span>
                  <p className="text-slate-800 text-[15px] sm:text-[16px] font-medium leading-relaxed mb-4">{q.pertanyaan}</p>
                  <span className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider",
                    score === 1
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
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
          className="flex items-center justify-center min-w-[240px] gap-3 px-8 py-4 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-extrabold rounded-[16px] transition-all shadow-sm"
        >
          {isHistoryMode ? (
            <>
              <ArrowLeft className="w-5 h-5" />
              KEMBALI KE DASHBOARD
            </>
          ) : (
            <>
              <RefreshCcw className="w-5 h-5" />
              KUESIONER BARU
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
