export type UserRole = 'orang_tua' | 'nakes' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  assignedNakesId?: string | null;
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  isVerified?: boolean; // For nakes
  sip?: string;
  specialty?: string;
  photoURL?: string;
  avatar?: string;
  isOnline?: boolean;
  lastActive?: any;
}

export type AgeCategory = '3_bulan' | '6_bulan' | '9_bulan' | '12_bulan' | '15_bulan' | '18_bulan' | '21_bulan' | '24_bulan' | '30_bulan' | '36_bulan' | '42_bulan' | '48_bulan' | '54_bulan' | '60_bulan' | '66_bulan' | '72_bulan';
export type DevelopmentCategory = 'Gerak Kasar' | 'Gerak Halus' | 'Sosialisasi dan Kemandirian' | 'Bicara dan Bahasa';

export interface Question {
  id: string;
  kategori: DevelopmentCategory;
  kategoriEn?: string;
  pertanyaan: string;
  pertanyaanEn?: string;
  imageUrl?: string;
}

export interface Answer {
  questionId: string;
  jawaban: 'IYA' | 'TIDAK';
  skor: number;
}

export interface GrowthRecord {
  id?: string;
  month: number;
  heightCm: number;
  weightKg: number;
  headCircumferenceCm?: number;
  date?: string;
  note?: string;
}

export interface ChildProfile {
  id?: string;
  userId?: string;
  name: string;
  birthDate?: string;
  ageInMonths: number;
  heightCm: number;
  weightKg: number;
  headCircumferenceCm?: number;
  gender: 'Laki-laki' | 'Perempuan';
  growthHistory?: GrowthRecord[];
}

export interface QuestionnaireResult {
  id?: string; // document id
  userId: string;
  profileId: string;
  ageCategory: AgeCategory;
  answers: Record<string, number>;
  totalScore: number;
  aiAnalysis?: string;
  aiAnalysisEn?: string;
  createdAt: string;
}
