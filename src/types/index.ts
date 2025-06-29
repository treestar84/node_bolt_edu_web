export interface WordItem {
  id: string;
  name: string;
  nameEn: string;
  imageUrl: string;
  audioKo: string;
  audioEn: string;
  category: string;
  minAge: number;
  maxAge: number;
  ownerType: 'global' | 'user';
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookPage {
  id: string;
  bookId: string;
  pageNumber: number;
  imageUrl: string;
  audioUrl: string;
  textContent?: string;
}

export interface Book {
  id: string;
  title: string;
  coverImage: string;
  minAge: number;
  maxAge: number;
  ownerType: 'global' | 'user';
  ownerId?: string;
  pages: BookPage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  userType: 'teacher' | 'director' | 'parent';
  siteName: string;
  mainImageUrl?: string;
  childAge: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  quizScore: number;
  quizStreak: number;
  puzzleCompletions: number;
  wordsLearned: number;
  booksRead: number;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'quiz' | 'puzzle' | 'words' | 'books';
  requiredScore: number;
  createdAt?: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  unlockedAt: string;
}

export interface Quiz {
  id: string;
  audioUrl: string;
  correctAnswerId: string;
  options: WordItem[];
  language: 'ko' | 'en';
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
export type UserType = 'teacher' | 'director' | 'parent';