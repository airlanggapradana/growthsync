import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { cn } from '../lib/utils';

export const KINDO_LOGO_URL =
  'https://res.cloudinary.com/airlanggapradana/image/upload/v1793887621/Smiling_Child_Growth_Healthcare_Logo_bwwi6q.png';
const KINDO_FALLBACK_LOGO_URL = '/Resmi_Logo_UMS_Color.png';
const KINDO_LETTERS = ['K', 'I', 'N', 'D', 'O'];

interface KindoTransitionCurtainProps {
  active: boolean;
  variant?: 'boot' | 'navigate';
}

export function KindoTransitionCurtain({
  active,
  variant = 'navigate',
}: KindoTransitionCurtainProps) {
  const prefersReducedMotion = useReducedMotion();
  const [logoSrc, setLogoSrc] = useState(KINDO_LOGO_URL);

  // Preload brand logo once so every page transition renders instantaneously
  useEffect(() => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = KINDO_LOGO_URL;
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="kindo-page-transition-curtain"
          role="status"
          aria-live="polite"
          aria-label="Memuat halaman Kindo"
          initial={
            prefersReducedMotion
              ? { opacity: variant === 'boot' ? 1 : 0 }
              : variant === 'boot'
              ? { opacity: 1 }
              : { opacity: 0 }
          }
          animate={{ opacity: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0, transition: { duration: 0.24 } }
              : {
                  opacity: 0,
                  transition: {
                    duration: 0.65,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.22 }
              : {
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }
          }
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden select-none will-change-[opacity]"
          style={{
            pointerEvents: active ? 'auto' : 'none',
          }}
        >
          {/* Primary Curtain Surface */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#064E3B] via-[#0F766E] to-[#134E4A]"
            aria-hidden="true"
          />

          {/* Subtle Ambient Radial Mesh */}
          <motion.div
            aria-hidden="true"
            initial={prefersReducedMotion ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.06, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="absolute w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full bg-emerald-300/15 blur-3xl pointer-events-none"
          />

          {/* Center Brand Lockup: Kindo Logo + "KINDO" text underneath */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, transition: { duration: 0.42, ease: 'easeOut' } }
            }
            transition={{ duration: 0.5, delay: variant === 'boot' ? 0.05 : 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center justify-center px-6 text-center"
          >
            {/* Orbital Rings + Logo Emblem */}
            <div className="relative flex items-center justify-center mb-5">
              {!prefersReducedMotion && (
                <>
                  <motion.div
                    aria-hidden="true"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-white/15 border-t-[#BEF264]/80 border-r-emerald-200/40"
                  />
                  <motion.div
                    aria-hidden="true"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-40 h-40 sm:w-44 sm:h-44 rounded-full border border-white/10 border-b-teal-200/50"
                  />
                </>
              )}

              {/* Luminous Crest Container */}
              <motion.div
                initial={prefersReducedMotion ? false : { scale: 0.72, rotate: -6 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 160,
                  damping: 20,
                  delay: variant === 'boot' ? 0.08 : 0.22,
                }}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] bg-white shadow-[0_20px_50px_rgba(4,47,46,0.45)] ring-4 ring-white/20 flex items-center justify-center p-3.5"
              >
                <img
                  src={logoSrc}
                  alt="Logo Kindo"
                  onError={() => {
                    if (logoSrc !== KINDO_FALLBACK_LOGO_URL) {
                      setLogoSrc(KINDO_FALLBACK_LOGO_URL);
                    }
                  }}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-xs"
                />
              </motion.div>
            </div>

            {/* Staggered "KINDO" Wordmark Directly Underneath Logo */}
            <div className="flex items-center justify-center gap-0.5 sm:gap-1" aria-label="KINDO">
              {KINDO_LETTERS.map((letter, idx) => (
                <motion.span
                  key={`${letter}-${idx}`}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 0, y: 16, scale: 0.85 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: (variant === 'boot' ? 0.14 : 0.3) + idx * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-3xl sm:text-4xl font-extrabold tracking-[0.14em] text-white drop-shadow-sm"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Sleek Progress Sweep Bar */}
            <div className="mt-3.5 w-28 sm:w-32 h-[3px] rounded-full bg-white/20 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: variant === 'boot' ? 1.15 : 0.95,
                  delay: variant === 'boot' ? 0.12 : 0.24,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformOrigin: 'left center' }}
                className="w-full h-full rounded-full bg-gradient-to-r from-[#BEF264] via-emerald-200 to-white"
              />
            </div>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ duration: 0.45, delay: variant === 'boot' ? 0.32 : 0.52 }}
              className="mt-2.5 text-[11px] sm:text-xs font-medium tracking-wider text-emerald-100"
            >
              Tumbuh Kembang Anak
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PageMotionWrapperProps {
  pageKey: string;
  children: React.ReactNode;
  className?: string;
  disableTransform?: boolean;
}

export function PageMotionWrapper({
  pageKey,
  children,
  className,
}: PageMotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: prefersReducedMotion ? 0.2 : 0.28, ease: 'easeInOut' },
      }}
      transition={{
        duration: prefersReducedMotion ? 0.22 : 0.48,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
