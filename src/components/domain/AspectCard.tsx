import React from 'react';
import { Activity, Hand, MessageCircle, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';

interface AspectCardProps {
  category?: string;
  aspect?: string;
  score: number;
  maxScore: number;
  className?: string;
}

export function getAspectTheme(category: string) {
  const norm = category.toLowerCase();
  if (norm.includes('kasar') || norm.includes('gross')) {
    return {
      color: '#0D9488',
      icon: Activity,
      labelKey: 'questionnaire.category.gross_motor',
      defaultLabel: 'Gerak Kasar',
      bgLight: '#F0FDFA',
      borderLight: '#CCFBF1',
      badgeClass: 'bg-[#F0FDFA] text-[#0D9488] border-[#CCFBF1] dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60'
    };
  }
  if (norm.includes('halus') || norm.includes('fine')) {
    return {
      color: '#0284C7',
      icon: Hand,
      labelKey: 'questionnaire.category.fine_motor',
      defaultLabel: 'Gerak Halus',
      bgLight: '#F0F9FF',
      borderLight: '#BAE6FD',
      badgeClass: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD] dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60'
    };
  }
  if (norm.includes('bicara') || norm.includes('bahasa') || norm.includes('speech')) {
    return {
      color: '#7C3AED',
      icon: MessageCircle,
      labelKey: 'questionnaire.category.speech',
      defaultLabel: 'Bicara & Bahasa',
      bgLight: '#F5F3FF',
      borderLight: '#DDD6FE',
      badgeClass: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE] dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60'
    };
  }
  // Default: Sosialisasi dan Kemandirian
  return {
    color: '#B45309',
    icon: Users,
    labelKey: 'questionnaire.category.social',
    defaultLabel: 'Sosialisasi & Kemandirian',
    bgLight: '#FFFBEB',
    borderLight: '#FDE68A',
    badgeClass: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
  };
}

export default function AspectCard({ category, aspect, score, maxScore, className }: AspectCardProps) {
  const { t } = useLanguage();
  const theme = getAspectTheme(category || aspect || '');
  const Icon = theme.icon;
  const isPerfect = score === maxScore;

  return (
    <div
      className={cn(
        "p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between",
        theme.badgeClass,
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-white/70 dark:bg-black/30 shadow-xs">
            <Icon className="w-4 h-4" style={{ color: theme.color }} />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
            {t(theme.labelKey) || theme.defaultLabel}
          </span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30 tabular-nums">
          {score}/{maxScore}
        </span>
      </div>

      <div className="w-full bg-black/5 dark:bg-white/10 h-2 rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%`,
            backgroundColor: theme.color
          }}
        />
      </div>

      <div className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>{isPerfect ? 'Tercapai Penuh' : `${maxScore - score} Perlu Latihan`}</span>
        <span className="tabular-nums font-semibold">{Math.round((score / (maxScore || 1)) * 100)}%</span>
      </div>
    </div>
  );
}
