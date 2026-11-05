import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';

export default function DisclaimerNote({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300",
        className
      )}
    >
      <ShieldAlert className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <span className="font-semibold text-slate-900 dark:text-slate-200">
          {t('app.medical_disclaimer_title') || 'Pernyataan Batasan Klinis'}:{' '}
        </span>
        <span>
          {t('app.medical_disclaimer_text') || 'Hasil ini adalah skrining awal, bukan diagnosis. Keputusan klinis tetap berada pada tenaga kesehatan.'}
        </span>
      </div>
    </div>
  );
}
