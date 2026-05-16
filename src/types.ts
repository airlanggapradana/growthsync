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
  ageInMonths: number;
  heightCm: number;
  weightKg: number;
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
