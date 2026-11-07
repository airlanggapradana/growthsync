/**
 * SEO utility — manages dynamic <head> metadata for each route/view.
 * Since this is a SPA (CSR), we manipulate the DOM directly via useEffect.
 * This avoids adding a third-party dependency (react-helmet) while keeping
 * metadata type-safe and reusable.
 */

export interface SEOMeta {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  /** JSON-LD structured data object (Rich Results). Injected into a dedicated script tag. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const BASE_URL = 'https://kindo.fun';
const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/airlanggapradana/image/upload/v1780069902/landing-page_z1k25e.webp';

/** Identifier used to track the dynamic JSON-LD script tag */
const DYNAMIC_JSONLD_ID = 'kindo-dynamic-jsonld';

/**
 * Inject or update a JSON-LD <script> tag for Rich Results.
 * Uses a dedicated script element distinct from the static one in index.html.
 */
function applyJsonLd(data: Record<string, unknown> | Record<string, unknown>[]): void {
  let el = document.getElementById(DYNAMIC_JSONLD_ID) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = DYNAMIC_JSONLD_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data, null, 0);
}

/** Remove the dynamic JSON-LD script tag (e.g., on private pages). */
function removeJsonLd(): void {
  const el = document.getElementById(DYNAMIC_JSONLD_ID);
  if (el) el.remove();
}

/**
 * Apply SEO meta tags to the current document <head>.
 * Call this inside a useEffect on route/view changes.
 */
export function applySEO(meta: SEOMeta): void {
  const {
    title,
    description,
    canonical,
    robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    ogTitle,
    ogDescription,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    jsonLd,
  } = meta;

  // --- Title ---
  document.title = title;

  // --- Helpers ---
  function setMeta(selector: string, attribute: string, value: string): void {
    let el = document.querySelector<HTMLMetaElement>(selector);
    if (!el) {
      el = document.createElement('meta');
      const [attr, val] = selector.replace('[', '').replace(']', '').split('=');
      el.setAttribute(attr.trim(), val.replace(/"/g, '').trim());
      document.head.appendChild(el);
    }
    el.setAttribute(attribute, value);
  }

  function setLink(rel: string, href: string): void {
    let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  }

  // --- Standard meta ---
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[name="robots"]', 'content', robots);

  // --- Canonical ---
  if (canonical) {
    setLink('canonical', canonical);
  }

  // --- Open Graph ---
  setMeta('meta[property="og:title"]', 'content', ogTitle ?? title);
  setMeta('meta[property="og:description"]', 'content', ogDescription ?? description);
  setMeta('meta[property="og:image"]', 'content', ogImage);
  setMeta('meta[property="og:type"]', 'content', ogType);
  if (canonical) {
    setMeta('meta[property="og:url"]', 'content', canonical);
  }

  // --- Twitter Card ---
  setMeta('meta[name="twitter:title"]', 'content', ogTitle ?? title);
  setMeta('meta[name="twitter:description"]', 'content', ogDescription ?? description);
  setMeta('meta[name="twitter:image"]', 'content', ogImage);
  if (canonical) {
    setMeta('meta[name="twitter:url"]', 'content', canonical);
  }

  // --- JSON-LD Rich Results ---
  if (jsonLd) {
    applyJsonLd(jsonLd);
  } else {
    removeJsonLd();
  }
}

/** Pre-defined SEO configs for each public route/view */
export const PAGE_SEO = {
  landing: (): SEOMeta => ({
    title: 'Kindo - Aplikasi Pemantauan Tumbuh Kembang Anak',
    description:
      'Platform digital pemantauan tumbuh kembang anak berbasis KPSP. Pantau perkembangan anak usia 0-72 bulan, konsultasi dengan nakes, dan dapatkan analisis AI secara gratis.',
    canonical: `${BASE_URL}/`,
    robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    ogType: 'website',
    // Landing page JSON-LD is handled statically in index.html for initial load.
    // No dynamic override needed here.
  }),

  login: (): SEOMeta => ({
    title: 'Masuk - Kindo',
    description:
      'Masuk ke akun Kindo Anda untuk melanjutkan pemantauan tumbuh kembang anak.',
    canonical: `${BASE_URL}/auth/login`,
    robots: 'noindex, nofollow',
  }),

  register: (): SEOMeta => ({
    title: 'Daftar Akun - Kindo',
    description:
      'Buat akun Kindo gratis dan mulai memantau tumbuh kembang anak Anda hari ini.',
    canonical: `${BASE_URL}/auth/register`,
    robots: 'noindex, nofollow',
  }),

  dashboard: (): SEOMeta => ({
    title: 'Dashboard - Kindo',
    description: 'Dashboard pemantauan tumbuh kembang anak Anda di Kindo.',
    robots: 'noindex, nofollow',
  }),

  questionnaire: (ageLabel?: string): SEOMeta => ({
    title: ageLabel
      ? `Kuisioner Usia ${ageLabel} - Kindo`
      : 'Kuisioner Tumbuh Kembang - Kindo',
    description: 'Isi kuisioner KPSP untuk memantau tumbuh kembang anak Anda.',
    robots: 'noindex, nofollow',
  }),

  result: (): SEOMeta => ({
    title: 'Hasil Evaluasi - Kindo',
    description: 'Lihat hasil evaluasi dan analisis tumbuh kembang anak Anda.',
    robots: 'noindex, nofollow',
  }),

  nakesDashboard: (): SEOMeta => ({
    title: 'Dashboard Tenaga Kesehatan - Kindo',
    description: 'Panel konsultasi untuk tenaga kesehatan di platform Kindo.',
    robots: 'noindex, nofollow',
  }),

  adminDashboard: (): SEOMeta => ({
    title: 'Dashboard Admin - Kindo',
    description: 'Panel administrasi platform Kindo.',
    robots: 'noindex, nofollow',
  }),

  privacyPolicy: (): SEOMeta => ({
    title: 'Kebijakan Privasi - Kindo',
    description:
      'Kebijakan privasi Kindo. Pelajari bagaimana kami menjaga dan mengenkripsi data pribadi anak dan keluarga Anda dengan standar keamanan tinggi.',
    canonical: `${BASE_URL}/privacy-policy`,
    robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    ogType: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Kebijakan Privasi - Kindo',
      url: `${BASE_URL}/privacy-policy`,
      description:
        'Kebijakan privasi Kindo mengenai pengelolaan dan keamanan data pribadi tumbuh kembang anak.',
      publisher: {
        '@type': 'Organization',
        name: 'Kindo',
        url: `${BASE_URL}/`,
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: `${BASE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Kebijakan Privasi',
            item: `${BASE_URL}/privacy-policy`,
          },
        ],
      },
    },
  }),

  termsOfService: (): SEOMeta => ({
    title: 'Syarat dan Ketentuan Layanan - Kindo',
    description:
      'Syarat dan ketentuan penggunaan platform Kindo. Ketahui panduan layanan pemantauan tumbuh kembang anak, analisis AI, dan konsultasi tenaga kesehatan.',
    canonical: `${BASE_URL}/terms-of-service`,
    robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    ogType: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Syarat dan Ketentuan Layanan - Kindo',
      url: `${BASE_URL}/terms-of-service`,
      description:
        'Syarat dan ketentuan penggunaan platform Kindo untuk pemantauan tumbuh kembang anak berbasis KPSP.',
      publisher: {
        '@type': 'Organization',
        name: 'Kindo',
        url: `${BASE_URL}/`,
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: `${BASE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Syarat dan Ketentuan',
            item: `${BASE_URL}/terms-of-service`,
          },
        ],
      },
    },
  }),
} as const;

