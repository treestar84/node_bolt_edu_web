import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSupabase } from '@/composables/useSupabase';
import type { WordItem, Book, Quiz, Badge, ApiKey, Language } from '@/types';

export const useAppStore = defineStore('app', () => {
  const { supabase } = useSupabase();
  
  // Language state
  const currentLanguage = ref<Language>('ko');
  
  // Words state - 이제 데이터베이스에서 로드
  const currentWords = ref<WordItem[]>([]);

  // Books state - 이제 데이터베이스에서 로드
  const currentBooks = ref<Book[]>([]);

  // Quiz state
  const quizScore = ref(0);
  const quizStreak = ref(0);

  // Puzzle state
  const puzzleCompletions = ref(0);

  // Badge state
  const currentBadges = ref<Badge[]>([]);
  const unlockedBadges = ref<string[]>([]);

  // Admin state
  const isAdminLoggedIn = ref(false);
  const adminToken = ref<string>('');

  // API Keys state
  const apiKeys = ref<ApiKey[]>([]);

  // Computed properties
  const wordsByCategory = computed(() => {
    const grouped: Record<string, WordItem[]> = {};
    currentWords.value.forEach(word => {
      if (!grouped[word.category]) {
        grouped[word.category] = [];
      }
      grouped[word.category].push(word);
    });
    return grouped;
  });

  const availableBadges = computed(() => {
    return currentBadges.value.filter(badge => badge.unlocked);
  });

  const nextBadge = computed(() => {
    const unlockedBadges = currentBadges.value.filter(b => b.unlocked);
    const lockedBadges = currentBadges.value.filter(b => !b.unlocked);
    
    if (lockedBadges.length === 0) return null;
    
    return lockedBadges.reduce((next, badge) => {
      if (!next || badge.requiredScore < next.requiredScore) {
        return badge;
      }
      return next;
    });
  });

  // Actions
  const setLanguage = (language: Language) => {
    currentLanguage.value = language;
  };

  // 데이터베이스에서 단어 로드
  const loadWords = async () => {
    try {
      console.log('📚 Loading words from database...');
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('owner_type', 'global') // 공용 단어만 로드 (관리자가 추가한 것들)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading words:', error);
        return;
      }

      // 데이터베이스 형식을 프론트엔드 형식으로 변환
      currentWords.value = (data || []).map(transformWordFromDB);
      console.log('✅ Words loaded:', currentWords.value.length);
    } catch (error) {
      console.error('💥 Error in loadWords:', error);
    }
  };

  // 데이터베이스에서 책 로드
  const loadBooks = async () => {
    try {
      console.log('📖 Loading books from database...');
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          book_pages (*)
        `)
        .eq('owner_type', 'global') // 공용 책만 로드 (관리자가 추가한 것들)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading books:', error);
        return;
      }

      // 데이터베이스 형식을 프론트엔드 형식으로 변환
      currentBooks.value = (data || []).map(transformBookFromDB);
      console.log('✅ Books loaded:', currentBooks.value.length);
    } catch (error) {
      console.error('💥 Error in loadBooks:', error);
    }
  };

  // 데이터베이스에서 뱃지 로드
  const loadBadges = async () => {
    try {
      console.log('🏆 Loading badges from database...');
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('required_score');

      if (error) {
        console.error('❌ Error loading badges:', error);
        return;
      }

      currentBadges.value = data || [];
      console.log('✅ Badges loaded:', currentBadges.value.length);
    } catch (error) {
      console.error('💥 Error in loadBadges:', error);
    }
  };

  // 모든 데이터 로드
  const loadAllData = async () => {
    console.log('🔄 Loading all data from database...');
    await Promise.all([
      loadWords(),
      loadBooks(),
      loadBadges()
    ]);
    console.log('✅ All data loaded successfully');
  };

  // 단어 추가 (데이터베이스에 저장)
  const addWord = async (word: Omit<WordItem, 'id'>) => {
    try {
      console.log('➕ Adding word to database:', word.name);
      
      const { data, error } = await supabase
        .from('words')
        .insert({
          name: word.name,
          name_en: word.nameEn,
          image_url: word.imageUrl,
          audio_ko: word.audioKo,
          audio_en: word.audioEn,
          category: word.category,
          min_age: word.minAge || 3,
          max_age: word.maxAge || 6,
          owner_type: 'global', // 관리자가 추가하는 것은 공용으로 설정
          owner_id: null
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding word:', error);
        throw error;
      }

      // 로컬 상태 업데이트
      const newWord = transformWordFromDB(data);
      currentWords.value.unshift(newWord);
      
      console.log('✅ Word added successfully:', newWord.name);
      return newWord;
    } catch (error) {
      console.error('💥 Error in addWord:', error);
      throw error;
    }
  };

  // 단어 수정
  const updateWord = async (id: string, updates: Partial<WordItem>) => {
    try {
      console.log('📝 Updating word in database:', id);
      
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.nameEn) dbUpdates.name_en = updates.nameEn;
      if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
      if (updates.audioKo) dbUpdates.audio_ko = updates.audioKo;
      if (updates.audioEn) dbUpdates.audio_en = updates.audioEn;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.minAge) dbUpdates.min_age = updates.minAge;
      if (updates.maxAge) dbUpdates.max_age = updates.maxAge;

      const { data, error } = await supabase
        .from('words')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating word:', error);
        throw error;
      }

      // 로컬 상태 업데이트
      const index = currentWords.value.findIndex(w => w.id === id);
      if (index !== -1) {
        currentWords.value[index] = transformWordFromDB(data);
      }
      
      console.log('✅ Word updated successfully');
      return transformWordFromDB(data);
    } catch (error) {
      console.error('💥 Error in updateWord:', error);
      throw error;
    }
  };

  // 단어 삭제
  const deleteWord = async (id: string) => {
    try {
      console.log('🗑️ Deleting word from database:', id);
      
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting word:', error);
        throw error;
      }

      // 로컬 상태 업데이트
      currentWords.value = currentWords.value.filter(w => w.id !== id);
      
      console.log('✅ Word deleted successfully');
      return true;
    } catch (error) {
      console.error('💥 Error in deleteWord:', error);
      throw error;
    }
  };

  // 책 추가 (데이터베이스에 저장)
  const addBook = async (book: Omit<Book, 'id'>) => {
    try {
      console.log('➕ Adding book to database:', book.title);
      
      // 먼저 책 정보 삽입
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .insert({
          title: book.title,
          cover_image: book.coverImage,
          min_age: book.minAge || 3,
          max_age: book.maxAge || 6,
          owner_type: 'global', // 관리자가 추가하는 것은 공용으로 설정
          owner_id: null
        })
        .select()
        .single();

      if (bookError) {
        console.error('❌ Error adding book:', bookError);
        throw bookError;
      }

      // 책 페이지들 삽입
      const pagesData = book.pages.map((page, index) => ({
        book_id: bookData.id,
        page_number: index + 1,
        image_url: page.imageUrl,
        audio_url: page.audioUrl,
        text_content: page.textContent || null
      }));

      const { data: pagesResult, error: pagesError } = await supabase
        .from('book_pages')
        .insert(pagesData)
        .select();

      if (pagesError) {
        console.error('❌ Error adding book pages:', pagesError);
        // 책 삭제 후 에러 던지기
        await supabase.from('books').delete().eq('id', bookData.id);
        throw pagesError;
      }

      // 로컬 상태 업데이트
      const newBook = transformBookFromDB({
        ...bookData,
        book_pages: pagesResult
      });
      currentBooks.value.unshift(newBook);
      
      console.log('✅ Book added successfully:', newBook.title);
      return newBook;
    } catch (error) {
      console.error('💥 Error in addBook:', error);
      throw error;
    }
  };

  // 책 수정
  const updateBook = async (id: string, updates: Partial<Book>) => {
    try {
      console.log('📝 Updating book in database:', id);
      
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.coverImage) dbUpdates.cover_image = updates.coverImage;
      if (updates.minAge) dbUpdates.min_age = updates.minAge;
      if (updates.maxAge) dbUpdates.max_age = updates.maxAge;

      const { data, error } = await supabase
        .from('books')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating book:', error);
        throw error;
      }

      // 페이지 업데이트 (필요한 경우)
      if (updates.pages) {
        // 기존 페이지 삭제
        await supabase
          .from('book_pages')
          .delete()
          .eq('book_id', id);

        // 새 페이지 삽입
        const pagesData = updates.pages.map((page, index) => ({
          book_id: id,
          page_number: index + 1,
          image_url: page.imageUrl,
          audio_url: page.audioUrl,
          text_content: page.textContent || null
        }));

        const { data: pagesResult, error: pagesError } = await supabase
          .from('book_pages')
          .insert(pagesData)
          .select();

        if (pagesError) {
          console.error('❌ Error updating book pages:', pagesError);
          throw pagesError;
        }

        // 로컬 상태 업데이트
        const updatedBook = transformBookFromDB({
          ...data,
          book_pages: pagesResult
        });

        const index = currentBooks.value.findIndex(b => b.id === id);
        if (index !== -1) {
          currentBooks.value[index] = updatedBook;
        }

        return updatedBook;
      } else {
        // 페이지 업데이트 없이 책 정보만 업데이트
        const index = currentBooks.value.findIndex(b => b.id === id);
        if (index !== -1) {
          currentBooks.value[index] = { ...currentBooks.value[index], ...updates };
        }
      }
      
      console.log('✅ Book updated successfully');
      return currentBooks.value.find(b => b.id === id);
    } catch (error) {
      console.error('💥 Error in updateBook:', error);
      throw error;
    }
  };

  // 책 삭제
  const deleteBook = async (id: string) => {
    try {
      console.log('🗑️ Deleting book from database:', id);
      
      // 책 페이지들이 CASCADE로 자동 삭제됨
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting book:', error);
        throw error;
      }

      // 로컬 상태 업데이트
      currentBooks.value = currentBooks.value.filter(b => b.id !== id);
      
      console.log('✅ Book deleted successfully');
      return true;
    } catch (error) {
      console.error('💥 Error in deleteBook:', error);
      throw error;
    }
  };

  // 데이터 변환 함수들
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

  const incrementQuizScore = () => {
    quizScore.value++;
    quizStreak.value++;
    checkAndUnlockBadges();
  };

  const resetQuizStreak = () => {
    quizStreak.value = 0;
  };

  const incrementPuzzleCompletions = () => {
    puzzleCompletions.value++;
    checkAndUnlockPuzzleBadges();
  };

  const checkAndUnlockBadges = () => {
    currentBadges.value.forEach(badge => {
      if (!badge.unlocked && badge.category === 'quiz' && quizScore.value >= badge.requiredScore) {
        badge.unlocked = true;
        if (!unlockedBadges.value.includes(badge.id)) {
          unlockedBadges.value.push(badge.id);
        }
      }
    });
  };

  const checkAndUnlockPuzzleBadges = () => {
    currentBadges.value.forEach(badge => {
      if (!badge.unlocked && badge.category === 'puzzle' && puzzleCompletions.value >= badge.requiredScore) {
        badge.unlocked = true;
        if (!unlockedBadges.value.includes(badge.id)) {
          unlockedBadges.value.push(badge.id);
        }
      }
    });
  };

  const addBadge = (badge: Omit<Badge, 'id' | 'unlocked'>) => {
    const newBadge: Badge = {
      ...badge,
      id: Date.now().toString(),
      unlocked: false
    };
    currentBadges.value.push(newBadge);
  };

  const updateBadge = (id: string, updates: Partial<Badge>) => {
    const index = currentBadges.value.findIndex(b => b.id === id);
    if (index !== -1) {
      currentBadges.value[index] = { ...currentBadges.value[index], ...updates };
    }
  };

  const deleteBadge = (id: string) => {
    currentBadges.value = currentBadges.value.filter(b => b.id !== id);
  };

  // Admin functions
  const adminLogin = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        adminToken.value = data.token;
        isAdminLoggedIn.value = true;
        localStorage.setItem('adminToken', data.token);
        
        // 관리자 로그인 후 데이터 로드
        await loadAllData();
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const adminLogout = async (): Promise<void> => {
    try {
      if (adminToken.value) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken.value}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      adminToken.value = '';
      isAdminLoggedIn.value = false;
      localStorage.removeItem('adminToken');
    }
  };

  const verifyAdminToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return false;
      }

      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        adminToken.value = token;
        isAdminLoggedIn.value = true;
        
        // 토큰 검증 후 데이터 로드
        await loadAllData();
        
        return true;
      } else {
        localStorage.removeItem('adminToken');
        return false;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('adminToken');
      return false;
    }
  };

  // API Key functions
  const fetchApiKeys = async (): Promise<void> => {
    try {
      if (!adminToken.value) return;

      const response = await fetch('/api/keys', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken.value}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        apiKeys.value = data.data || [];
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const createApiKey = async (name: string, description: string): Promise<ApiKey | null> => {
    try {
      if (!adminToken.value) return null;

      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchApiKeys(); // Refresh the list
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating API key:', error);
      return null;
    }
  };

  const deleteApiKey = async (id: string): Promise<boolean> => {
    try {
      if (!adminToken.value) return false;

      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken.value}`,
        },
      });

      if (response.ok) {
        await fetchApiKeys(); // Refresh the list
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
  };

  return {
    // State
    currentLanguage,
    currentWords,
    currentBooks,
    quizScore,
    quizStreak,
    puzzleCompletions,
    currentBadges,
    unlockedBadges,
    isAdminLoggedIn,
    adminToken,
    apiKeys,
    
    // Computed
    wordsByCategory,
    availableBadges,
    nextBadge,
    
    // Actions
    setLanguage,
    loadAllData,
    loadWords,
    loadBooks,
    loadBadges,
    addWord,
    updateWord,
    deleteWord,
    addBook,
    updateBook,
    deleteBook,
    incrementQuizScore,
    resetQuizStreak,
    incrementPuzzleCompletions,
    addBadge,
    updateBadge,
    deleteBadge,
    adminLogin,
    adminLogout,
    verifyAdminToken,
    fetchApiKeys,
    createApiKey,
    deleteApiKey
  };
});