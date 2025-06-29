import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSupabase } from '@/composables/useSupabase';
import { useAuthStore } from './auth';
import type { WordItem, Book, Badge, UserBadge } from '@/types';

export const useContentStore = defineStore('content', () => {
  const { supabase, getWords, getBooks, getBadges, getUserBadges, unlockBadge } = useSupabase();
  const authStore = useAuthStore();
  
  const words = ref<WordItem[]>([]);
  const books = ref<Book[]>([]);
  const badges = ref<Badge[]>([]);
  const userBadges = ref<UserBadge[]>([]);
  const isLoading = ref(false);
  const error = ref<string>('');

  // Computed properties
  const wordsByCategory = computed(() => {
    const grouped: Record<string, WordItem[]> = {};
    words.value.forEach(word => {
      if (!grouped[word.category]) {
        grouped[word.category] = [];
      }
      grouped[word.category].push(word);
    });
    return grouped;
  });

  const availableBadges = computed(() => {
    return userBadges.value.map(ub => ub.badge);
  });

  const nextBadge = computed(() => {
    if (!authStore.userProgress) return null;
    
    const unlockedBadgeIds = userBadges.value.map(ub => ub.badgeId);
    const lockedBadges = badges.value.filter(b => !unlockedBadgeIds.includes(b.id));
    
    if (lockedBadges.length === 0) return null;
    
    return lockedBadges.reduce((next, badge) => {
      if (!next || badge.requiredScore < next.requiredScore) {
        return badge;
      }
      return next;
    });
  });

  // Load all content for current user
  const loadContent = async () => {
    if (!authStore.user || !authStore.userProfile) return;

    try {
      isLoading.value = true;
      error.value = '';

      const [wordsData, booksData, badgesData, userBadgesData] = await Promise.all([
        getWords(authStore.user.id, authStore.childAge),
        getBooks(authStore.user.id, authStore.childAge),
        getBadges(),
        getUserBadges(authStore.user.id)
      ]);

      words.value = wordsData.map(transformWordFromDB);
      books.value = booksData.map(transformBookFromDB);
      badges.value = badgesData;
      userBadges.value = userBadgesData;

    } catch (err: any) {
      console.error('Error loading content:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  // Add new word
  const addWord = async (wordData: Omit<WordItem, 'id' | 'ownerType' | 'ownerId'>) => {
    if (!authStore.user) return null;

    try {
      const { data, error: addError } = await supabase
        .from('words')
        .insert({
          name: wordData.name,
          name_en: wordData.nameEn,
          image_url: wordData.imageUrl,
          audio_ko: wordData.audioKo,
          audio_en: wordData.audioEn,
          category: wordData.category,
          min_age: wordData.minAge,
          max_age: wordData.maxAge,
          owner_type: 'user',
          owner_id: authStore.user.id
        })
        .select()
        .single();

      if (addError) throw addError;

      const newWord = transformWordFromDB(data);
      words.value.unshift(newWord);
      
      return newWord;
    } catch (err: any) {
      console.error('Error adding word:', err);
      error.value = err.message;
      return null;
    }
  };

  // Add new book
  const addBook = async (bookData: Omit<Book, 'id' | 'ownerType' | 'ownerId'>) => {
    if (!authStore.user) return null;

    try {
      // Insert book
      const { data: bookResult, error: bookError } = await supabase
        .from('books')
        .insert({
          title: bookData.title,
          cover_image: bookData.coverImage,
          min_age: bookData.minAge,
          max_age: bookData.maxAge,
          owner_type: 'user',
          owner_id: authStore.user.id
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // Insert pages
      const pagesData = bookData.pages.map((page, index) => ({
        book_id: bookResult.id,
        page_number: index + 1,
        image_url: page.imageUrl,
        audio_url: page.audioUrl,
        text_content: page.textContent
      }));

      const { data: pagesResult, error: pagesError } = await supabase
        .from('book_pages')
        .insert(pagesData)
        .select();

      if (pagesError) throw pagesError;

      const newBook = transformBookFromDB({
        ...bookResult,
        book_pages: pagesResult
      });

      books.value.unshift(newBook);
      return newBook;
    } catch (err: any) {
      console.error('Error adding book:', err);
      error.value = err.message;
      return null;
    }
  };

  // Check and unlock badges
  const checkBadgeUnlocks = async () => {
    if (!authStore.user || !authStore.userProgress) return [];

    const progress = authStore.userProgress;
    const unlockedBadgeIds = userBadges.value.map(ub => ub.badgeId);
    const newlyUnlocked: Badge[] = [];

    for (const badge of badges.value) {
      if (unlockedBadgeIds.includes(badge.id)) continue;

      let shouldUnlock = false;

      switch (badge.category) {
        case 'quiz':
          shouldUnlock = progress.quizScore >= badge.requiredScore;
          break;
        case 'puzzle':
          shouldUnlock = progress.puzzleCompletions >= badge.requiredScore;
          break;
        case 'words':
          shouldUnlock = progress.wordsLearned >= badge.requiredScore;
          break;
        case 'books':
          shouldUnlock = progress.booksRead >= badge.requiredScore;
          break;
      }

      if (shouldUnlock) {
        try {
          const result = await unlockBadge(authStore.user.id, badge.id);
          if (result) {
            userBadges.value.push(result);
            newlyUnlocked.push(badge);
          }
        } catch (err) {
          console.error('Error unlocking badge:', err);
        }
      }
    }

    return newlyUnlocked;
  };

  // Transform database objects to frontend types
  const transformWordFromDB = (dbWord: any): WordItem => ({
    id: dbWord.id,
    name: dbWord.name,
    nameEn: dbWord.name_en,
    imageUrl: dbWord.image_url,
    audioKo: dbWord.audio_ko,
    audioEn: dbWord.audio_en,
    category: dbWord.category,
    minAge: dbWord.min_age,
    maxAge: dbWord.max_age,
    ownerType: dbWord.owner_type,
    ownerId: dbWord.owner_id,
    createdAt: dbWord.created_at,
    updatedAt: dbWord.updated_at
  });

  const transformBookFromDB = (dbBook: any): Book => ({
    id: dbBook.id,
    title: dbBook.title,
    coverImage: dbBook.cover_image,
    minAge: dbBook.min_age,
    maxAge: dbBook.max_age,
    ownerType: dbBook.owner_type,
    ownerId: dbBook.owner_id,
    pages: (dbBook.book_pages || [])
      .sort((a: any, b: any) => a.page_number - b.page_number)
      .map((page: any) => ({
        id: page.id,
        bookId: page.book_id,
        pageNumber: page.page_number,
        imageUrl: page.image_url,
        audioUrl: page.audio_url,
        textContent: page.text_content
      })),
    createdAt: dbBook.created_at,
    updatedAt: dbBook.updated_at
  });

  return {
    // State
    words,
    books,
    badges,
    userBadges,
    isLoading,
    error,
    
    // Computed
    wordsByCategory,
    availableBadges,
    nextBadge,
    
    // Actions
    loadContent,
    addWord,
    addBook,
    checkBadgeUnlocks
  };
});