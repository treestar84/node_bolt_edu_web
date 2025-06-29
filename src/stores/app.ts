import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WordItem, Book, Quiz, Badge, ApiKey, Language } from '@/types';

export const useAppStore = defineStore('app', () => {
  // Language state
  const currentLanguage = ref<Language>('ko');
  
  // Words state
  const currentWords = ref<WordItem[]>([
    {
      id: '1',
      name: '고양이',
      nameEn: 'Cat',
      imageUrl: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=300',
      audioKo: '/audio/cat-ko.mp3',
      audioEn: '/audio/cat-en.mp3',
      category: 'animals'
    },
    {
      id: '2',
      name: '강아지',
      nameEn: 'Dog',
      imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=300',
      audioKo: '/audio/dog-ko.mp3',
      audioEn: '/audio/dog-en.mp3',
      category: 'animals'
    },
    {
      id: '3',
      name: '사과',
      nameEn: 'Apple',
      imageUrl: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=300',
      audioKo: '/audio/apple-ko.mp3',
      audioEn: '/audio/apple-en.mp3',
      category: 'fruits'
    },
    {
      id: '4',
      name: '바나나',
      nameEn: 'Banana',
      imageUrl: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=300',
      audioKo: '/audio/banana-ko.mp3',
      audioEn: '/audio/banana-en.mp3',
      category: 'fruits'
    },
    {
      id: '5',
      name: '자동차',
      nameEn: 'Car',
      imageUrl: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=300',
      audioKo: '/audio/car-ko.mp3',
      audioEn: '/audio/car-en.mp3',
      category: 'vehicles'
    },
    {
      id: '6',
      name: '버스',
      nameEn: 'Bus',
      imageUrl: 'https://images.pexels.com/photos/385998/pexels-photo-385998.jpeg?auto=compress&cs=tinysrgb&w=300',
      audioKo: '/audio/bus-ko.mp3',
      audioEn: '/audio/bus-en.mp3',
      category: 'vehicles'
    }
  ]);

  // Books state
  const currentBooks = ref<Book[]>([
    {
      id: '1',
      title: '동물 친구들',
      coverImage: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=400',
      pages: [
        {
          id: 'page-1',
          imageUrl: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=400',
          audio: '/audio/book1-page1.mp3',
          text: '귀여운 고양이가 있어요'
        },
        {
          id: 'page-2',
          imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
          audio: '/audio/book1-page2.mp3',
          text: '강아지도 함께 놀아요'
        },
        {
          id: 'page-3',
          imageUrl: 'https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=400',
          audio: '/audio/book1-page3.mp3',
          text: '새들이 하늘을 날아요'
        },
        {
          id: 'page-4',
          imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
          audio: '/audio/book1-page4.mp3',
          text: '모든 동물들이 친구예요'
        }
      ]
    }
  ]);

  // Quiz state
  const quizScore = ref(0);
  const quizStreak = ref(0);

  // Puzzle state
  const puzzleCompletions = ref(0);

  // Badge state
  const currentBadges = ref<Badge[]>([
    {
      id: 'badge-1',
      name: '첫 걸음',
      icon: '🚗',
      description: '첫 번째 퀴즈 정답',
      requiredScore: 1,
      unlocked: false,
      category: 'quiz'
    },
    {
      id: 'badge-2',
      name: '운전 초보',
      icon: '🚌',
      description: '퀴즈 5점 달성',
      requiredScore: 5,
      unlocked: false,
      category: 'quiz'
    },
    {
      id: 'badge-3',
      name: '운전 고수',
      icon: '🚀',
      description: '퀴즈 10점 달성',
      requiredScore: 10,
      unlocked: false,
      category: 'quiz'
    },
    {
      id: 'badge-4',
      name: '퍼즐 마스터',
      icon: '🧩',
      description: '첫 번째 퍼즐 완성',
      requiredScore: 1,
      unlocked: false,
      category: 'puzzle'
    }
  ]);

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

  const addWord = (word: Omit<WordItem, 'id'>) => {
    const newWord: WordItem = {
      ...word,
      id: Date.now().toString()
    };
    currentWords.value.push(newWord);
  };

  const updateWord = (id: string, updates: Partial<WordItem>) => {
    const index = currentWords.value.findIndex(w => w.id === id);
    if (index !== -1) {
      currentWords.value[index] = { ...currentWords.value[index], ...updates };
    }
  };

  const deleteWord = (id: string) => {
    currentWords.value = currentWords.value.filter(w => w.id !== id);
  };

  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...book,
      id: Date.now().toString()
    };
    currentBooks.value.push(newBook);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    const index = currentBooks.value.findIndex(b => b.id === id);
    if (index !== -1) {
      currentBooks.value[index] = { ...currentBooks.value[index], ...updates };
    }
  };

  const deleteBook = (id: string) => {
    currentBooks.value = currentBooks.value.filter(b => b.id !== id);
  };

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