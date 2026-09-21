// SVG Placeholder Generator for Nakes (Tenaga Kesehatan) & Users
// Replaces real human photos with professional, standardized medical vector placeholders

export function getNakesPlaceholder(category: 'dokter' | 'bidan' | 'gizi' | 'posyandu' | 'default' = 'default', initial: string = ''): string {
  // Common colors
  const primaryBg = category === 'bidan' 
    ? { start: '#065f46', end: '#047857' }
    : category === 'gizi'
    ? { start: '#166534', end: '#15803d' }
    : category === 'posyandu'
    ? { start: '#0f766e', end: '#115e59' }
    : { start: '#1b4332', end: '#2d6a4f' }; // Dokter & default nakes (Forest Green)

  const badgeColor = category === 'bidan' 
    ? '#10b981' 
    : category === 'gizi' 
    ? '#22c55e' 
    : category === 'posyandu' 
    ? '#14b8a6' 
    : '#10b981';

  const badgeIcon = category === 'posyandu'
    ? `<path d="M78 18 C74 18 71 21 71 25 C71 30 78 35 78 35 C78 35 85 30 85 25 C85 21 82 18 78 18 Z" fill="#ffffff"/>`
    : `<path d="M78 18 L78 30 M72 24 L84 24" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="nakesBg_${category}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryBg.start}"/>
      <stop offset="100%" stop-color="${primaryBg.end}"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#nakesBg_${category})"/>
  <!-- Head -->
  <circle cx="50" cy="37" r="15" fill="#f1f5f9"/>
  <!-- Clinician Coat / Scrub Body -->
  <path d="M22 88 C22 65 33 56 50 56 C67 56 78 65 78 88 Z" fill="#ffffff"/>
  <!-- Inner Scrub V-Neck -->
  <path d="M42 56 L50 69 L58 56 Z" fill="${primaryBg.start}"/>
  <path d="M50 69 L50 88" stroke="#cbd5e1" stroke-width="1.8"/>
  <!-- Stethoscope -->
  <path d="M38 54 C38 67 44 73 50 73 C56 73 62 67 62 54" fill="none" stroke="${badgeColor}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="50" cy="76" r="3" fill="${badgeColor}"/>
  <!-- Medical Badge -->
  <circle cx="78" cy="24" r="11" fill="${badgeColor}" stroke="#ffffff" stroke-width="2"/>
  ${badgeIcon}
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getParentPlaceholder(name: string = ''): string {
  const initialLetter = name ? name.trim().charAt(0).toUpperCase() : 'P';
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="parentBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#parentBg)"/>
  <!-- Parent Head -->
  <circle cx="50" cy="38" r="16" fill="#f8fafc"/>
  <!-- Body -->
  <path d="M22 88 C22 66 34 58 50 58 C66 58 78 66 78 88 Z" fill="#e2e8f0"/>
  <!-- Family Heart Badge -->
  <circle cx="78" cy="24" r="11" fill="#ec4899" stroke="#ffffff" stroke-width="2"/>
  <path d="M78 20 C76 18 73 18 73 21 C73 25 78 28 78 28 C78 28 83 25 83 21 C83 18 80 18 78 20 Z" fill="#ffffff"/>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
