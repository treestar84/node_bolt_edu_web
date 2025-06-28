export interface WordItem {
  id: string;
  name: string;
  nameEn: string;
  imageUrl: string;
  audioKo: string;
  audioEn: string;
  category: string;
}

export interface BookPage {
  id: string;
  imageUrl: string;
  audio: string;
  text?: string;
}

export interface Book {
  id: string;
  title: string;
  coverImage: string;
  pages: BookPage[];
}

export interface Quiz {
  id: string;
  audioUrl: string;
  correctAnswerId: string;
  options: WordItem[];
  language: 'ko' | 'en';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiredScore: number;
  unlocked: boolean;
  category: 'quiz' | 'puzzle';
}

export interface ApiKey {
  id: string;
  name: string;
  description: string;
  key: string;
  active: boolean;
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
  keyPreview?: string;
}

export type Language = 'ko' | 'en';
export type GameMode = 'words' | 'quiz' | 'books' | 'puzzle';