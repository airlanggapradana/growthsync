import React from 'react';
import { Activity, ClipboardCheck, MessageSquare, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';

export type BottomNavTab = 'dashboard' | 'screening' | 'growth' | 'chat' | 'profile';

interface BottomNavProps {
  currentTab: BottomNavTab | string;
  onSelectTab: (tab: BottomNavTab) => void;
  unreadCount?: number;
  userRole?: 'orang_tua' | 'nakes' | 'admin';
  className?: string;
}

export default function BottomNav({
  currentTab,
  onSelectTab,
  unreadCount = 0,
  userRole = 'orang_tua',
  className
}: BottomNavProps) {
  const { t } = useLanguage();

  if (userRole === 'admin') {
    return null;
  }

  const items = userRole === 'nakes' ? [
    { id: 'dashboard' as BottomNavTab, label: t('Dashboard'), icon: Activity },
    { id: 'chat' as BottomNavTab, label: 'Konsultasi', icon: MessageSquare, badge: unreadCount },
    { id: 'profile' as BottomNavTab, label: t('Profil'), icon: User }
  ] : [
    { id: 'screening' as BottomNavTab, label: 'Skrining', icon: ClipboardCheck },
    { id: 'dashboard' as BottomNavTab, label: 'Beranda', icon: Activity },
    { id: 'chat' as BottomNavTab, label: 'Konsultasi', icon: MessageSquare, badge: unreadCount }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 flex items-center justify-around shadow-lg",
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={cn(
              "relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] py-1 transition-all select-none touch-manipulation",
              isActive
                ? "text-[#0F766E] dark:text-[#5EEAD4] font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            )}
          >
            <div className="relative">
              <Icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110 stroke-[2.4]" : "stroke-[1.8]")} />
              {Boolean(item.badge && item.badge > 0) && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ring-2 ring-white dark:ring-slate-900 tabular-nums">
                  {item.badge && item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className={cn("text-[10px] tracking-tight mt-1 truncate max-w-[64px]", isActive ? "font-bold" : "font-normal")}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute top-0 w-8 h-0.5 bg-[#0F766E] dark:bg-[#5EEAD4] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
