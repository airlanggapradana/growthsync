import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export default function ScoreRing({
  score,
  maxScore = 10,
  size = 140,
  strokeWidth = 10,
  className,
  label = 'Skor KPSP'
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(Math.max(score / maxScore, 0), 1);
  const strokeDashoffset = circumference - ratio * circumference;

  let color = '#0F766E'; // teal primary-700
  if (score >= 9) {
    color = '#15803D'; // green Sesuai
  } else if (score >= 7) {
    color = '#B45309'; // amber Meragukan
  } else {
    color = '#B91C1C'; // red Penyimpangan
  }

  return (
    <div className={cn("relative inline-flex flex-col items-center justify-center select-none", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
          fill="transparent"
        />
        {/* Animated Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
          {score}
          <span className="text-base font-semibold text-slate-400 dark:text-slate-500 ml-0.5">/{maxScore}</span>
        </span>
        {label && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
