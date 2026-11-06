import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AgeCategory } from '../types';
import { QUESTIONS_DATA, AGE_EQUIPMENT_DATA } from '../data/questions';
import { cn, formatAgeCategory } from '../lib/utils';
import { Info, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Check, X, ClipboardList, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const categoryI18nKeyMap: Record<string, string> = {
  "Gerak Kasar": "questionnaire.category.gross_motor",
  "Gerak Halus": "questionnaire.category.fine_motor",
  "Bicara dan Bahasa": "questionnaire.category.speech",
  "Sosialisasi dan Kemandirian": "questionnaire.category.social"
};

const categoryBadgeColor: Record<string, string> = {
  "Gerak Kasar": "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
  "Gerak Halus": "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
  "Bicara dan Bahasa": "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  "Sosialisasi dan Kemandirian": "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
};

const ILLUSTRATION_FALLBACKS: Record<string, string> = {
  q_3_9: "/illustrations/baby_head_45_deg.jpg",
  q_9_9: "/illustrations/baby_sitting_alone.jpg"
};

interface QuestionnaireViewProps {
  age: AgeCategory;
  answers: Record<string, number>;
  onAnswer: (id: string, score: number) => void;
  onSubmit: () => void;
}

export default function QuestionnaireView({ age, answers, onAnswer, onSubmit }: QuestionnaireViewProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPrepared, setIsPrepared] = useState<boolean>(!AGE_EQUIPMENT_DATA[age]);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const questions = QUESTIONS_DATA[age] || [];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const isComplete = answeredCount === questions.length;
  
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleAnswerClick = (score: number) => {
    if (!currentQuestion) return;
    onAnswer(currentQuestion.id, score);
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 250);
    } else {
      // Reached the last question, show review modal if all answered
      setTimeout(() => setShowReviewModal(true), 300);
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

  // Preparation Screen
  if (!isPrepared && AGE_EQUIPMENT_DATA[age]) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="w-full max-w-3xl mx-auto py-6"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 md:p-10 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-400 flex items-center justify-center mb-6">
            <ClipboardList className="w-6 h-6" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-teal-400">
            Panduan KPSP Kemenkes RI
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 mb-3">
            Persiapan Alat Skrining Usia {formatAgeCategory(age)}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Sebelum memulai 10 pertanyaan skrining perkembangan, mohon siapkan peralatan berikut agar proses pengamatan dapat dilakukan secara objektif.
          </p>

          <div className="bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/60 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#0F766E] dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Alat & Media yang Diperlukan:
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {AGE_EQUIPMENT_DATA[age]}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0" />
              <span>Pastikan anak dalam kondisi nyaman, tidak sedang mengantuk atau lapar.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0" />
              <span>Lakukan dalam suasana santai dan menyenangkan seperti bermain bersama.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0" />
              <span>Jawab berdasarkan kemampuan anak saat ini tanpa dipaksakan.</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPrepared(true)}
            className="w-full py-4 px-6 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl font-bold text-base transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Saya Siap, Mulai Skrining</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6 pb-12 max-w-4xl mx-auto" 
    >
      {/* Top Progress Card with Teal palette */}
      <div className="w-full bg-[#0F766E] dark:bg-slate-900 p-6 lg:p-7 rounded-[24px] shadow-sm relative overflow-hidden shrink-0 border border-teal-700/40 dark:border-slate-800 text-white">
        <div className="relative z-10 flex flex-wrap justify-between items-end gap-3 mb-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-200 dark:text-slate-400 mb-1">
              {t('app.progress')}
            </span>
            <span className="text-3xl lg:text-4xl font-extrabold text-white leading-none tracking-tight tabular-nums">
              {answeredCount}
              <span className="text-teal-200/70 text-lg font-medium ml-1.5">/ {questions.length} Pertanyaan</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold px-3 py-1 bg-white/15 dark:bg-slate-800 text-white rounded-full">
              Pertanyaan {currentIndex + 1} dari {questions.length}
            </span>
            <span className="text-xs font-bold bg-white text-[#0F766E] px-3 py-1 rounded-full shadow-sm tabular-nums">
              {Math.round(progress)}% Selesai
            </span>
          </div>
        </div>
        <div className="h-2.5 bg-black/25 dark:bg-slate-800 rounded-full overflow-hidden relative z-10">
          <motion.div
            className="h-full bg-teal-300 dark:bg-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>
      </div>

      {/* Equipment Reminder Badge if present */}
      {AGE_EQUIPMENT_DATA[age] && (
        <div className="w-full bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-800/60 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-700 dark:text-teal-200 shrink-0">
          <Info className="w-4 h-4 flex-shrink-0 text-[#0F766E] dark:text-teal-400 mt-0.5" />
          <span className="font-medium">
            <strong className="font-bold text-[#0F766E] dark:text-teal-300">Alat peraga: </strong>
            {AGE_EQUIPMENT_DATA[age]}
          </span>
        </div>
      )}

      {/* Main Question Card */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-10 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
          >
            <div className={cn(
              "w-full",
              currentQuestion.imageUrl ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : "flex flex-col"
            )}>
              <div className={cn(currentQuestion.imageUrl ? "lg:col-span-7 flex flex-col" : "w-full flex flex-col")}>
                <span className={cn(
                  "inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 self-start border",
                  categoryBadgeColor[currentQuestion.kategori] || "bg-slate-100 text-slate-700 border-slate-200"
                )}>
                  {t(categoryI18nKeyMap[currentQuestion.kategori] || currentQuestion.kategori)}
                </span>
                
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-snug text-slate-900 dark:text-white mb-6">
                  <span className="text-slate-300 dark:text-slate-600 font-semibold mr-2.5">{currentIndex + 1}.</span>
                  {t(`question.${currentQuestion.id}`)}
                </h3>

                <div className="mb-8 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                   <div className="flex items-start gap-2.5">
                     <Info className="w-4 h-4 flex-shrink-0 text-[#0F766E] dark:text-teal-400 mt-0.5" />
                     <div className="space-y-1">
                       <p>&bull; <span dangerouslySetInnerHTML={{ __html: t('app.instruction_yes') }} /></p>
                       <p>&bull; <span dangerouslySetInnerHTML={{ __html: t('app.instruction_no') }} /></p>
                     </div>
                   </div>
                </div>
                
                {/* 56px Ya / Tidak buttons with touch target >= 44px */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleAnswerClick(1)}
                    className={cn(
                      "min-h-[56px] py-4 px-6 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer select-none",
                      currentAnswer === 1
                        ? "border-[#0F766E] bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-300 shadow-sm ring-2 ring-[#0F766E]/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-[#0F766E]/40 text-slate-700 dark:text-slate-200"
                    )}
                  >
                    <CheckCircle2 className={cn("w-6 h-6 shrink-0", currentAnswer === 1 ? "text-[#0F766E] dark:text-teal-400" : "text-slate-400")} />
                    <span className="text-xl font-bold">{t('app.yes')}</span>
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto tabular-nums",
                      currentAnswer === 1 ? "bg-[#0F766E] text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                    )}>
                      Skor 1
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnswerClick(0)}
                    className={cn(
                      "min-h-[56px] py-4 px-6 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer select-none",
                      currentAnswer === 0
                        ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm ring-2 ring-amber-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-amber-400 text-slate-700 dark:text-slate-200"
                    )}
                  >
                    <AlertCircle className={cn("w-6 h-6 shrink-0", currentAnswer === 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400")} />
                    <span className="text-xl font-bold">{t('app.no')}</span>
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto tabular-nums",
                      currentAnswer === 0 ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                    )}>
                      Skor 0
                    </span>
                  </button>
                </div>
              </div>

              {currentQuestion.imageUrl && (
                <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 p-4 min-h-[260px]">
                  {!failedImages[currentQuestion.id] ? (
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt={t(`question.${currentQuestion.id}`)}
                      className="max-h-64 w-auto max-w-full object-contain rounded-xl shadow-xs"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = ILLUSTRATION_FALLBACKS[currentQuestion.id];
                        const img = e.currentTarget as HTMLImageElement;
                        if (fallback && img.getAttribute('src') !== fallback) {
                          img.src = fallback;
                        } else {
                          setFailedImages((prev) => ({ ...prev, [currentQuestion.id]: true }));
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center py-6 px-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-400 flex items-center justify-center mb-3">
                        <ClipboardList className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-bold text-[#0F766E] dark:text-teal-400 uppercase tracking-wider mb-1">
                        Panduan Observasi KPSP
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                        Lakukan pengamatan langsung pada respon dan gerakan tubuh anak sesuai arahan pertanyaan.
                      </p>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 text-center font-medium">
                    Ilustrasi Panduan Gerakan
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="sticky bottom-4 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white p-4 rounded-2xl z-30 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-2">
           <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={cn(
                 "h-11 px-4 rounded-xl transition-all flex items-center gap-2 font-semibold text-sm",
                 currentIndex === 0 ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
           >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
           </button>
           <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className={cn(
                 "h-11 px-4 rounded-xl transition-all flex items-center gap-2 font-semibold text-sm",
                 currentIndex === questions.length - 1 ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
           >
              <span>Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
           </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Periksa ({answeredCount}/{questions.length})</span>
          </button>

          <button
            type="button"
            disabled={!isComplete}
            onClick={onSubmit}
            className={cn(
              "h-11 px-6 rounded-xl font-bold text-sm transition-all focus:outline-none shrink-0 flex items-center gap-2 shadow-sm",
              isComplete 
                ? "bg-[#0F766E] hover:bg-[#115E59] text-white cursor-pointer" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            )}
          >
            <Check className="w-4 h-4" />
            <span>{isComplete ? 'Kirim Hasil Skrining' : `Jawab Semua (${answeredCount}/${questions.length})`}</span>
          </button>
        </div>
      </div>

      {/* Review Answers Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Ringkasan 10 Jawaban KPSP
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pastikan seluruh jawaban telah sesuai dengan kondisi anak Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const hasAnswered = ans !== undefined;
                  return (
                    <div 
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowReviewModal(false);
                      }}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            {q.kategori}
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium">
                            {t(`question.${q.id}`)}
                          </p>
                        </div>
                      </div>

                      <span className={cn(
                        "text-xs font-bold px-3 py-1 rounded-full shrink-0 tabular-nums",
                        hasAnswered && ans === 1 && "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300",
                        hasAnswered && ans === 0 && "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
                        !hasAnswered && "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {hasAnswered ? (ans === 1 ? 'Ya (1)' : 'Tidak (0)') : 'Belum'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm"
                >
                  Kembali Mengisi
                </button>
                <button
                  type="button"
                  disabled={!isComplete}
                  onClick={() => {
                    setShowReviewModal(false);
                    onSubmit();
                  }}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-sm transition-all",
                    isComplete 
                      ? "bg-[#0F766E] hover:bg-[#115E59] cursor-pointer" 
                      : "bg-slate-400 cursor-not-allowed opacity-50"
                  )}
                >
                  Kirim Hasil Skrining
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
