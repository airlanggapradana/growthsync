export type UserRole = 'orang_tua' | 'nakes';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  assignedNakesId?: string | null;
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
}

export type AgeCategory = '3_bulan' | '6_bulan';
export type DevelopmentCategory = 'Gerak Kasar' | 'Gerak Halus' | 'Sosialisasi dan Kemandirian' | 'Bicara dan Bahasa';

export interface Question {
  id: string;
  kategori: DevelopmentCategory;
  pertanyaan: string;
}

export interface Answer {
  questionId: string;
  jawaban: 'IYA' | 'TIDAK';
  skor: number;
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
}

export interface QuestionnaireResult {
  id?: string; // document id
  userId: string;
  profileId: string;
  ageCategory: AgeCategory;
  answers: Record<string, number>;
  totalScore: number;
  aiAnalysis?: string;
  createdAt: string;
}
