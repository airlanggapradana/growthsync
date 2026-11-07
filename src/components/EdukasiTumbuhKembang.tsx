import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  Lightbulb, 
  Calendar, 
  ShieldCheck, 
  HeartHandshake, 
  Smile, 
  MessageCircle, 
  Activity, 
  ChevronRight,
  Bookmark,
  Share2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  EDUKASI_CATEGORIES, 
  TRUSTED_RESOURCES, 
  CategoryEducationContent,
  RecommendedActivity,
  TrustedResource
} from '../data/edukasiData';

interface EdukasiTumbuhKembangProps {
  initialCategory?: 'sesuai' | 'meragukan' | 'penyimpangan';
  isEmbeddedInResult?: boolean;
  onGoToChat?: () => void;
  className?: string;
}

export default function EdukasiTumbuhKembang({
  initialCategory = 'sesuai',
  isEmbeddedInResult = false,
  onGoToChat,
  className
}: EdukasiTumbuhKembangProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activeCategoryKey, setActiveCategoryKey] = useState<'sesuai' | 'meragukan' | 'penyimpangan'>(initialCategory);
  const [selectedAspectFilter, setSelectedAspectFilter] = useState<'all' | 'gerak_kasar' | 'gerak_halus' | 'bicara_bahasa' | 'kemandirian'>('all');
  const [copiedResource, setCopiedResource] = useState<string | null>(null);

  const currentCategory: CategoryEducationContent = EDUKASI_CATEGORIES[activeCategoryKey];

  const filteredActivities = currentCategory.recommendedActivities.filter(act => {
    if (selectedAspectFilter === 'all') return true;
    return act.aspect === selectedAspectFilter;
  });

  const handleCopyLink = (url: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedResource(id);
      setTimeout(() => setCopiedResource(null), 2000);
    }
  };

  return (
    <section 
      aria-labelledby="edukasi-tumbuh-kembang-heading"
      className={cn(
        "bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-900/5 via-teal-900/5 to-slate-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shrink-0 shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#0F766E] dark:text-teal-400 uppercase tracking-wider">
                  {isEn ? 'KPSP Educational Hub' : 'Fitur Edukasi Tumbuh Kembang Anak'}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? 'Kemenkes RI Standard' : 'Standar Kemenkes RI'}
                </span>
              </div>
              <h2 id="edukasi-tumbuh-kembang-heading" className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {isEn ? 'Parenting Guidance & Recommended Activities' : 'Panduan Edukasi & Rekomendasi Aktivitas Orang Tua'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isEn 
                  ? 'Personalized stimulation recommendations based on child screening category and verified medical resources.'
                  : 'Saran stimulasi harian dan aktivitas terarah berdasarkan kategori hasil skrining perkembangan, dilengkapi rujukan resmi tepercaya.'}
              </p>
            </div>
          </div>

          {isEmbeddedInResult && (
            <div className="self-start md:self-auto px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isEn ? 'Active Result Category' : 'Kategori Hasil Skrining Terpilih'}</span>
            </div>
          )}
        </div>

        {/* 3 Interactive Category Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800/80">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            {isEn ? 'Select Screening Category to Explore:' : 'Pilih Kategori Skrining untuk Meninjau Edukasi:'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Sesuai */}
            <button
              type="button"
              onClick={() => {
                setActiveCategoryKey('sesuai');
                setSelectedAspectFilter('all');
              }}
              className={cn(
                "p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 relative cursor-pointer",
                activeCategoryKey === 'sesuai'
                  ? "bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 shadow-xs"
                  : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                activeCategoryKey === 'sesuai' 
                  ? "bg-emerald-600 text-white" 
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
              )}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={cn(
                  "text-xs font-bold block leading-tight",
                  activeCategoryKey === 'sesuai' ? "text-emerald-900 dark:text-emerald-200" : "text-slate-800 dark:text-slate-200"
                )}>
                  {isEn ? 'Appropriate' : 'Perkembangan Sesuai'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {isEn ? 'Score 9 - 10 (Optimal)' : 'Skor 9 - 10 (Optimal)'}
                </span>
              </div>
            </button>

            {/* Meragukan */}
            <button
              type="button"
              onClick={() => {
                setActiveCategoryKey('meragukan');
                setSelectedAspectFilter('all');
              }}
              className={cn(
                "p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 relative cursor-pointer",
                activeCategoryKey === 'meragukan'
                  ? "bg-amber-50/80 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 shadow-xs"
                  : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                activeCategoryKey === 'meragukan' 
                  ? "bg-amber-600 text-white" 
                  : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
              )}>
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={cn(
                  "text-xs font-bold block leading-tight",
                  activeCategoryKey === 'meragukan' ? "text-amber-900 dark:text-amber-200" : "text-slate-800 dark:text-slate-200"
                )}>
                  {isEn ? 'Doubtful' : 'Perkembangan Meragukan'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {isEn ? 'Score 7 - 8 (Focus 2 Wks)' : 'Skor 7 - 8 (Stimulasi 2 Minggu)'}
                </span>
              </div>
            </button>

            {/* Penyimpangan */}
            <button
              type="button"
              onClick={() => {
                setActiveCategoryKey('penyimpangan');
                setSelectedAspectFilter('all');
              }}
              className={cn(
                "p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 relative cursor-pointer",
                activeCategoryKey === 'penyimpangan'
                  ? "bg-rose-50/80 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 shadow-xs"
                  : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                activeCategoryKey === 'penyimpangan' 
                  ? "bg-rose-600 text-white" 
                  : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
              )}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={cn(
                  "text-xs font-bold block leading-tight",
                  activeCategoryKey === 'penyimpangan' ? "text-rose-900 dark:text-rose-200" : "text-slate-800 dark:text-slate-200"
                )}>
                  {isEn ? 'Possible Delay' : 'Kemungkinan Penyimpangan'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {isEn ? 'Score ≤ 6 (Clinical Referral)' : 'Skor ≤ 6 (Rujukan Medis Segera)'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Section 1: Category Summary & Clinical Meaning */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Summary Box */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>{isEn ? 'Category Overview' : 'Makna Kategori Perkembangan'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">
              {isEn ? currentCategory.titleEn : currentCategory.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-3">
              {isEn ? currentCategory.summaryEn : currentCategory.summary}
            </p>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-100 font-bold block mb-1">
                {isEn ? 'Clinical Context (Kemenkes):' : 'Penjelasan Klinis Kemenkes RI:'}
              </strong>
              {isEn ? currentCategory.clinicalMeaningEn : currentCategory.clinicalMeaning}
            </div>
          </div>

          {/* Follow-up & Next Steps Box */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#0F766E] dark:text-teal-400 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>{isEn ? 'Clinical Protocol' : 'Protokol Tindak Lanjut'}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                {isEn ? currentCategory.medicalNextSteps.actionTitleEn : currentCategory.medicalNextSteps.actionTitle}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 font-medium">
                {isEn ? currentCategory.medicalNextSteps.timelineEn : currentCategory.medicalNextSteps.timeline}
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {currentCategory.medicalNextSteps.steps.map((st, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{isEn ? st.textEn : st.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {onGoToChat && (
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={onGoToChat}
                  className="w-full py-2.5 px-3 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isEn ? 'Consult with Assigned Health Worker' : 'Diskusi dengan Tenaga Medis Rujukan'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Parenting Advice / Pola Asuh */}
        <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center gap-2 mb-3">
            <HeartHandshake className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {isEn ? currentCategory.parentingAdvice.titleEn : currentCategory.parentingAdvice.title}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {currentCategory.parentingAdvice.points.map((pt, i) => (
              <div 
                key={i} 
                className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100/80 dark:border-emerald-900/50 shadow-2xs flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {isEn ? pt.textEn : pt.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Recommended Activities with Aspect Filter */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  {isEn ? 'Recommended Home Activities for Parents' : 'Rekomendasi Aktivitas Harian di Rumah'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn ? 'Targeted stimulation routines by developmental aspect' : 'Latihan dan stimulasi terarah mencakup 4 aspek perkembangan anak'}
              </p>
            </div>

            {/* Filter Aspect Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
              {[
                { id: 'all', label: isEn ? 'All Aspects' : 'Semua Aspek' },
                { id: 'gerak_kasar', label: isEn ? 'Gross Motor' : 'Gerak Kasar' },
                { id: 'gerak_halus', label: isEn ? 'Fine Motor' : 'Gerak Halus' },
                { id: 'bicara_bahasa', label: isEn ? 'Speech' : 'Bicara' },
                { id: 'kemandirian', label: isEn ? 'Social' : 'Kemandirian' }
              ].map(tab => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setSelectedAspectFilter(tab.id as any)}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer",
                    selectedAspectFilter === tab.id
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActivities.map((activity) => (
              <div 
                key={activity.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div>
                  {/* Aspect Badge & Frequency */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-bold text-[#0F766E] dark:text-teal-400 uppercase tracking-wider">
                      {isEn ? activity.aspectLabelEn : activity.aspectLabel}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {isEn ? activity.frequencyEn : activity.frequency}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                    {isEn ? activity.titleEn : activity.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {isEn ? activity.descriptionEn : activity.description}
                  </p>
                </div>

                {/* Practical Tip */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold block mb-0.5">
                      {isEn ? 'Parenting Tip:' : 'Tips Orang Tua:'}
                    </strong>
                    {isEn ? activity.tipsEn : activity.tips}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Tautan Sumber Daya Tepercaya (Trusted Resources) */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  {isEn ? 'Trusted Child Development Resources' : 'Sumber Daya & Referensi Tepercaya'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn 
                  ? 'Official portals from the Ministry of Health, Pediatric Society, WHO, and UNICEF'
                  : 'Rujukan resmi dari Kementerian Kesehatan RI, IDAI, WHO, dan UNICEF untuk informasi tumbuh kembang lebih lanjut'}
              </p>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {TRUSTED_RESOURCES.length} {isEn ? 'verified sources' : 'sumber resmi diverifikasi'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {TRUSTED_RESOURCES.map((res: TrustedResource) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs flex flex-col justify-between group hover:border-[#0F766E]/50 dark:hover:border-teal-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800">
                      {isEn ? res.badgeEn : res.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(res.url, res.id)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                      title={isEn ? 'Copy Link' : 'Salin Tautan'}
                      aria-label="Salin Tautan"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug group-hover:text-[#0F766E] dark:group-hover:text-teal-400 transition-colors">
                    {res.title}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 block mb-2">
                    {res.organization}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-3">
                    {isEn ? res.descriptionEn : res.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {new URL(res.url).hostname}
                  </span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0F766E] dark:text-teal-400 hover:underline"
                  >
                    <span>{isEn ? 'Open Resource' : 'Buka Sumber'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {copiedResource && (
            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEn ? 'Resource link copied to clipboard!' : 'Tautan sumber daya berhasil disalin!'}</span>
              </span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
