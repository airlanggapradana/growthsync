import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '../../lib/utils';

export type KpspStatus = 'sesuai' | 'meragukan' | 'penyimpangan';

interface StatusBadgeProps {
  status: KpspStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export function getKpspStatusInfo(scoreOrStatus: number | string, lang: 'id' | 'en' = 'id') {
  let status: KpspStatus = 'sesuai';
  if (typeof scoreOrStatus === 'number') {
    if (scoreOrStatus >= 9) status = 'sesuai';
    else if (scoreOrStatus >= 7) status = 'meragukan';
    else status = 'penyimpangan';
  } else {
    const s = scoreOrStatus.toLowerCase();
    if (s.includes('sesuai') || s.includes('appropriate')) status = 'sesuai';
    else if (s.includes('ragu') || s.includes('doubtful')) status = 'meragukan';
    else status = 'penyimpangan';
  }

  switch (status) {
    case 'sesuai':
      return {
        status,
        label: lang === 'en' ? 'Development Appropriate' : 'Perkembangan Sesuai',
        shortLabel: lang === 'en' ? 'Appropriate' : 'Sesuai',
        icon: CheckCircle2,
        bgLight: '#F0FDF4',
        textLight: '#15803D',
        borderLight: '#BBF7D0',
        badgeClass: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
        cardClass: 'bg-[#F0FDF4] border-[#BBF7D0] dark:bg-emerald-950/30 dark:border-emerald-900/50',
        textClass: 'text-[#15803D] dark:text-emerald-300'
      };
    case 'meragukan':
      return {
        status,
        label: lang === 'en' ? 'Needs Extra Stimulation' : 'Perlu Stimulasi Tambahan',
        shortLabel: lang === 'en' ? 'Doubtful' : 'Meragukan',
        icon: AlertTriangle,
        bgLight: '#FFFBEB',
        textLight: '#B45309',
        borderLight: '#FDE68A',
        badgeClass: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
        cardClass: 'bg-[#FFFBEB] border-[#FDE68A] dark:bg-amber-950/30 dark:border-amber-900/50',
        textClass: 'text-[#B45309] dark:text-amber-300'
      };
    case 'penyimpangan':
    default:
      return {
        status,
        label: lang === 'en' ? 'Medical Referral Advised' : 'Disarankan Rujukan Medis',
        shortLabel: lang === 'en' ? 'Deviation' : 'Penyimpangan',
        icon: AlertOctagon,
        bgLight: '#FEF2F2',
        textLight: '#B91C1C',
        borderLight: '#FECACA',
        badgeClass: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
        cardClass: 'bg-[#FEF2F2] border-[#FECACA] dark:bg-rose-950/30 dark:border-rose-900/50',
        textClass: 'text-[#B91C1C] dark:text-rose-300'
      };
  }
}

export default function StatusBadge({ status, size = 'md', className, showIcon = true }: StatusBadgeProps) {
  const info = getKpspStatusInfo(status);
  const Icon = info.icon;

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs md:text-sm px-3.5 py-1 gap-2',
    lg: 'text-sm md:text-base px-4 py-1.5 gap-2.5 font-bold'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-colors shrink-0 shadow-xs',
        info.badgeClass,
        sizeStyles[size],
        className
      )}
    >
      {showIcon && <Icon className={cn('shrink-0', iconSizes[size])} />}
      <span>{info.label}</span>
    </span>
  );
}
