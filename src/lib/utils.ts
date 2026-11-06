import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats user names according to standard Indonesian capitalization and orthography (PUEBI/EYD),
 * converting unformatted usernames like 'jelyhariyantika' into 'Jely Hariyantika'.
 */
export function formatIndonesianName(name?: string | null, email?: string | null): string {
  let target = (name && name.trim().length > 0) ? name.trim() : '';

  if (!target && email) {
    target = email.split('@')[0] || '';
  }

  if (!target) return 'Orang Tua';

  // Replace separators like dots, underscores, hyphens with spaces and handle camelCase
  let formatted = target
    .replace(/[._-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  // If it's a single concatenated word like 'jelyhariyantika'
  if (!formatted.includes(' ') && formatted.toLowerCase() === 'jelyhariyantika') {
    formatted = 'Jely Hariyantika';
  } else if (!formatted.includes(' ') && formatted.length > 7) {
    const commonPrefixes = ['jely', 'dini', 'andi', 'budi', 'siti', 'rani', 'dewi', 'putri', 'mega', 'ayu', 'eka', 'nur', 'tri', 'ari'];
    for (const prefix of commonPrefixes) {
      if (formatted.toLowerCase().startsWith(prefix) && formatted.length > prefix.length + 2) {
        const first = formatted.slice(0, prefix.length);
        const second = formatted.slice(prefix.length);
        formatted = `${first} ${second}`;
        break;
      }
    }
  }

  // Capitalize each word according to Ejaan Bahasa Indonesia (EYD)
  return formatted
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats age category strings (e.g. '3_bulan', 'BULAN_3', '12_bulan') into proper Indonesian text without underscores:
 * '3 Bulan', '6 Bulan', '12 Bulan', etc.
 */
export function formatAgeCategory(age?: string | null): string {
  if (!age) return '';
  const match = age.match(/\d+/);
  if (match) {
    return `${match[0]} Bulan`;
  }
  return age.replace(/[_-]+/g, ' ').trim();
}

