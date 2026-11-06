import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AgeCategory, ChildProfile } from '../types';
import { QUESTIONS_DATA } from '../data/questions';
import { cn, formatAgeCategory } from '../lib/utils';
import { Sparkles, Loader2, Download, ArrowLeft, Check, RefreshCcw, ChevronDown, ChevronUp, MapPin, MessageSquare, Activity } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../contexts/LanguageContext';
import StatusBadge from './domain/StatusBadge';
import ScoreRing from './domain/ScoreRing';
import AspectCard from './domain/AspectCard';
import DisclaimerNote from './domain/DisclaimerNote';
import PuskesmasMapModal from './PuskesmasMapModal';

const categoryI18nKeyMap: Record<string, string> = {
  "Gerak Kasar": "questionnaire.category.gross_motor",
  "Gerak Halus": "questionnaire.category.fine_motor",
  "Bicara dan Bahasa": "questionnaire.category.speech",
  "Sosialisasi dan Kemandirian": "questionnaire.category.social"
};

interface ResultViewProps {
  age: AgeCategory;
  answers: Record<string, number>;
  onClose: () => void;
  isHistoryMode: boolean;
  profile?: ChildProfile;
  existingAnalysis?: string;
  existingAnalysisEn?: string;
  onSaveResult?: (analysis: string, analysisEn?: string) => void;
  onGoToChat?: () => void;
}

export default function ResultView({
  age,
  answers,
  onClose,
  isHistoryMode,
  profile,
  existingAnalysis,
  existingAnalysisEn,
  onSaveResult,
  onGoToChat
}: ResultViewProps) {
  const { language, t } = useLanguage();
  const questions = QUESTIONS_DATA[age] || [];

  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((acc: number, score: number) => acc + score, 0);
  }, [answers]);

  const categoryScores = useMemo(() => {
    const scores: Record<string, { total: number; max: number }> = {};
    questions.forEach(q => {
      if (!scores[q.kategori]) scores[q.kategori] = { total: 0, max: 0 };
      scores[q.kategori].max += 1;
      scores[q.kategori].total += answers[q.id] || 0;
    });
    return scores;
  }, [answers, questions]);

  // Determine KPSP Status
  const kpspStatus: 'sesuai' | 'meragukan' | 'penyimpangan' = useMemo(() => {
    if (totalScore >= 9) return 'sesuai';
    if (totalScore >= 7) return 'meragukan';
    return 'penyimpangan';
  }, [totalScore]);

  const statusTitle = useMemo(() => {
    if (kpspStatus === 'sesuai') return 'Perkembangan Sesuai Usia';
    if (kpspStatus === 'meragukan') return 'Perkembangan Meragukan';
    return 'Kemungkinan Penyimpangan';
  }, [kpspStatus]);

  const statusSubtitle = useMemo(() => {
    if (kpspStatus === 'sesuai') {
      return 'Perkembangan anak Anda berjalan sangat baik sesuai tahapan usianya. Terus berikan stimulasi harian dengan penuh kasih sayang!';
    }
    if (kpspStatus === 'meragukan') {
      return 'Terdapat beberapa aspek yang perlu dilatih lebih intensif. Lakukan stimulasi fokus selama 2 minggu ke depan sebelum evaluasi skrining ulang.';
    }
    return 'Perkembangan anak memerlukan evaluasi langsung oleh dokter spesialis anak atau tenaga kesehatan puskesmas untuk pemeriksaan komprehensif.';
  }, [kpspStatus]);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(existingAnalysis || null);
  const [aiAnalysisEn, setAiAnalysisEn] = useState<string | null>(existingAnalysisEn || null);
  const [loadingAi, setLoadingAi] = useState(!existingAnalysis);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(true);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);

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
          pdf.save(`Laporan_KPSP_${profile?.name || 'Anak'}.pdf`);
        } catch (e) {
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
    if (existingAnalysis) return;
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
          if (data.isFallback) setIsFallback(true);
        } catch (e) {
          console.error("Translation failed", e);
          setIsFallback(true);
        } finally {
          setLoadingAi(false);
        }
      };
      translateMissing();
    }
  }, [language, aiAnalysisEn, aiAnalysis]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto pb-24 space-y-6"
    >
      {/* Top Bento Box: Main Status & Score Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Utama Card (Col 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                KPSP Kemenkes RI • Skrining Usia {formatAgeCategory(age)}
              </span>
              <StatusBadge status={kpspStatus} size="md" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              {statusTitle}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-6">
              {statusSubtitle}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
              <span>Cari Faskes / Puskesmas</span>
            </button>

            {onGoToChat && (
              <button
                type="button"
                onClick={onGoToChat}
                className="px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-[#0F766E] dark:text-teal-300 text-xs sm:text-sm font-semibold hover:bg-teal-100/60 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Konsultasi Tenaga Kesehatan</span>
              </button>
            )}
          </div>
        </div>

        {/* ScoreRing Card (Col 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <ScoreRing score={totalScore} maxScore={10} size={150} strokeWidth={12} />
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Skor Perkembangan
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {totalScore >= 9 ? '9-10 Jawaban Ya (Optimal)' : totalScore >= 7 ? '7-8 Jawaban Ya (Perlu Latihan)' : '≤6 Jawaban Ya (Perlu Rujukan)'}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Aspect Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Evaluasi Berdasarkan 4 Aspek Perkembangan
          </h3>
          <span className="text-xs text-slate-400">Target skor per aspek</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AspectCard 
            aspect="gerak_kasar" 
            score={categoryScores['Gerak Kasar']?.total || 0} 
            maxScore={categoryScores['Gerak Kasar']?.max || 1} 
          />
          <AspectCard 
            aspect="gerak_halus" 
            score={categoryScores['Gerak Halus']?.total || 0} 
            maxScore={categoryScores['Gerak Halus']?.max || 1} 
          />
          <AspectCard 
            aspect="bicara_bahasa" 
            score={categoryScores['Bicara dan Bahasa']?.total || 0} 
            maxScore={categoryScores['Bicara dan Bahasa']?.max || 1} 
          />
          <AspectCard 
            aspect="kemandirian" 
            score={categoryScores['Sosialisasi dan Kemandirian']?.total || 0} 
            maxScore={categoryScores['Sosialisasi dan Kemandirian']?.max || 1} 
          />
        </div>
      </div>

      {/* Folding Accordion for AI Stimulation Advice */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full p-5 sm:p-6 bg-purple-50/40 dark:bg-purple-950/20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-left transition-colors hover:bg-purple-50/70"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-50 tracking-tight">
                {t('app.ai_analysis_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Panduan stimulasi harian dan intervensi dini berbasis usia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isFallback && (
              <span className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                Local Engine
              </span>
            )}
            <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              {isAccordionOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isAccordionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                {loadingAi ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" />
                    <span className="text-sm font-medium">{t('app.ai_loading')}</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="markdown-body prose prose-slate prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:leading-relaxed prose-li:my-1">
                    <ReactMarkdown>
                      {(language === 'en' && aiAnalysisEn) ? aiAnalysisEn : aiAnalysis}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-sm font-medium gap-3">
                    <span className="text-rose-500 font-bold">{t('app.ai_error')}</span>
                    <button
                      type="button"
                      onClick={fetchAiAnalysis}
                      className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 rounded-xl flex items-center gap-2 font-bold text-xs"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      <span>{t('app.ai_regenerate')}</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rekapitulasi 10 Jawaban */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            {t('app.recap_title')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            10 parameter perkembangan yang telah dievaluasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:gap-px bg-slate-100 dark:bg-slate-800">
          {questions.map((q, i) => {
            const score = answers[q.id];
            return (
              <div key={q.id} className="p-5 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {t(categoryI18nKeyMap[q.kategori] || q.kategori)}
                    </span>
                    <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
                      {t(`question.${q.id}`)}
                    </p>
                  </div>
                </div>

                <div className="pl-10 mt-auto">
                  <span className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tabular-nums",
                    score === 1
                      ? "bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800"
                      : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  )}>
                    {score === 1 ? 'Ya (Skor 1)' : 'Tidak (Skor 0)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medical Disclaimer per Design System */}
      <DisclaimerNote />

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={exportingPdf}
          className="flex items-center justify-center min-w-[180px] gap-2 px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all shadow-sm text-sm disabled:opacity-60"
        >
          {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>{exportingPdf ? t('app.preparing_pdf') : t('app.export_pdf')}</span>
        </button>

        {isHistoryMode ? (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center min-w-[180px] gap-2 px-5 py-3.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl font-bold transition-all shadow-sm text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('app.back_to_dashboard')}</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center min-w-[130px] gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all text-sm cursor-pointer"
            >
              {t('app.cancel')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (aiAnalysis && onSaveResult) {
                  onSaveResult(aiAnalysis, aiAnalysisEn || undefined);
                }
              }}
              disabled={loadingAi || !aiAnalysis}
              className="flex items-center justify-center min-w-[200px] gap-2 px-6 py-3.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl font-bold transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('app.save_result')}</span>
            </button>
          </>
        )}
      </div>

      {/* Puskesmas Map Modal */}
      <PuskesmasMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />

      {/* Hidden PDF Template */}
      <div className="absolute top-[9999px] left-[9999px] z-[-1] pointer-events-none overflow-hidden">
        <div ref={pdfRef} className="p-8 w-[800px] print-container font-sans" style={{ backgroundColor: '#ffffff', color: '#0f172a', display: 'block' }}>
           <div className="flex items-center gap-4 mb-8 pb-6 border-b" style={{ borderColor: '#e2e8f0' }}>
             <div className="p-3 rounded-xl" style={{ backgroundColor: '#f0fdfa' }}>
               <Activity className="w-8 h-8" style={{ color: '#0F766E' }} />
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
                </div>
             </div>
             <div className="p-5 rounded-xl border flex flex-col justify-center items-center text-center" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>Hasil Skrining KPSP</h3>
                <div className="text-5xl font-extrabold mb-2" style={{ color: '#1e293b' }}>{totalScore}<span className="text-xl" style={{ color: '#94a3b8' }}>/10</span></div>
                <div className="font-bold text-lg mb-1" style={{ color: '#0F766E' }}>{statusTitle}</div>
                <p className="text-xs px-4" style={{ color: '#475569' }}>{statusSubtitle}</p>
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
