import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WordItem, Book, Language, GameMode, Badge, ApiKey } from '@/types';

export const useAppStore = defineStore('app', () => {
  // State
  const currentLanguage = ref<Language>('ko');
  const currentMode = ref<GameMode>('words');
  const isAdminMode = ref(false);
  const adminPassword = ref('');
  const isAdminLoggedIn = ref(false);
  const adminToken = ref<string>('');
  
  // Sample data with better audio URLs
  const words = ref<WordItem[]>([
    {
      id: '1',
      name: '고양이',
      nameEn: 'Cat',
      imageUrl: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/cat-ko.mp3',
      audioEn: '/audio/cat-en.mp3',
      category: 'animals'
    },
    {
      id: '2',
      name: '강아지',
      nameEn: 'Dog',
      imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/dog-ko.mp3',
      audioEn: '/audio/dog-en.mp3',
      category: 'animals'
    },
    {
      id: '3',
      name: '사과',
      nameEn: 'Apple',
      imageUrl: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/apple-ko.mp3',
      audioEn: '/audio/apple-en.mp3',
      category: 'fruits'
    },
    {
      id: '4',
      name: '바나나',
      nameEn: 'Banana',
      imageUrl: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/banana-ko.mp3',
      audioEn: '/audio/banana-en.mp3',
      category: 'fruits'
    },
    {
      id: '5',
      name: '자동차',
      nameEn: 'Car',
      imageUrl: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/car-ko.mp3',
      audioEn: '/audio/car-en.mp3',
      category: 'vehicles'
    },
    {
      id: '6',
      name: '버스',
      nameEn: 'Bus',
      imageUrl: 'https://images.pexels.com/photos/385998/pexels-photo-385998.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/bus-ko.mp3',
      audioEn: '/audio/bus-en.mp3',
      category: 'vehicles'
    },
    {
      id: '7',
      name: '집',
      nameEn: 'House',
      imageUrl: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/house-ko.mp3',
      audioEn: '/audio/house-en.mp3',
      category: 'objects'
    },
    {
      id: '8',
      name: '꽃',
      nameEn: 'Flower',
      imageUrl: 'https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/flower-ko.mp3',
      audioEn: '/audio/flower-en.mp3',
      category: 'nature'
    },
    {
      id: '9',
      name: '나무',
      nameEn: 'Tree',
      imageUrl: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/tree-ko.mp3',
      audioEn: '/audio/tree-en.mp3',
      category: 'nature'
    },
    {
      id: '10',
      name: '물',
      nameEn: 'Water',
      imageUrl: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/water-ko.mp3',
      audioEn: '/audio/water-en.mp3',
      category: 'nature'
    },
    {
      id: '11',
      name: '해',
      nameEn: 'Sun',
      imageUrl: 'https://images.pexels.com/photos/158163/clouds-cloudporn-sun-sunset-158163.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/sun-ko.mp3',
      audioEn: '/audio/sun-en.mp3',
      category: 'nature'
    },
    {
      id: '12',
      name: '달',
      nameEn: 'Moon',
      imageUrl: 'https://images.pexels.com/photos/39644/crescent-moon-moon-sky-lunar-39644.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/moon-ko.mp3',
      audioEn: '/audio/moon-en.mp3',
      category: 'nature'
    },
    {
      id: '13',
      name: '책',
      nameEn: 'Book',
      imageUrl: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/book-ko.mp3',
      audioEn: '/audio/book-en.mp3',
      category: 'objects'
    },
    {
      id: '14',
      name: '공',
      nameEn: 'Ball',
      imageUrl: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/ball-ko.mp3',
      audioEn: '/audio/ball-en.mp3',
      category: 'toys'
    },
    {
      id: '15',
      name: '비행기',
      nameEn: 'Airplane',
      imageUrl: 'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/airplane-ko.mp3',
      audioEn: '/audio/airplane-en.mp3',
      category: 'vehicles'
    },
    {
      id: '16',
      name: '기차',
      nameEn: 'Train',
      imageUrl: 'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/train-ko.mp3',
      audioEn: '/audio/train-en.mp3',
      category: 'vehicles'
    },
    {
      id: '17',
      name: '모자',
      nameEn: 'Hat',
      imageUrl: 'https://images.pexels.com/photos/35185/hats-fedora-hat-manufacture-stack.jpg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/hat-ko.mp3',
      audioEn: '/audio/hat-en.mp3',
      category: 'clothes'
    },
    {
      id: '18',
      name: '신발',
      nameEn: 'Shoes',
      imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/shoes-ko.mp3',
      audioEn: '/audio/shoes-en.mp3',
      category: 'clothes'
    },
    {
      id: '19',
      name: '물고기',
      nameEn: 'Fish',
      imageUrl: 'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/fish-ko.mp3',
      audioEn: '/audio/fish-en.mp3',
      category: 'animals'
    },
    {
      id: '20',
      name: '새',
      nameEn: 'Bird',
      imageUrl: 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=400',
      audioKo: '/audio/bird-ko.mp3',
      audioEn: '/audio/bird-en.mp3',
      category: 'animals'
    }
  ]);

  const books = ref<Book[]>([
    {
      id: '1',
      title: '동물 친구들',
      coverImage: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600',
      pages: [
        {
          id: '1-1',
          imageUrl: 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=600',
          audio: '/audio/book1-page1.mp3',
          text: '귀여운 고양이가 있어요. 고양이는 야옹야옹 울어요.'
        },
        {
          id: '1-2',
          imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600',
          audio: '/audio/book1-page2.mp3',
          text: '강아지가 뛰어놀아요. 강아지는 멍멍 짖어요.'
        },
        {
          id: '1-3',
          imageUrl: 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=600',
          audio: '/audio/book1-page3.mp3',
          text: '새가 하늘을 날아요. 새는 짹짹 노래해요.'
        },
        {
          id: '1-4',
          imageUrl: 'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&cs=tinysrgb&w=600',
          audio: '/audio/book1-page4.mp3',
          text: '물고기가 헤엄쳐요. 물고기는 물속에서 살아요.'
        }
      ]
    },
    {
      id: '2',
      title: '탈것 여행',
      coverImage: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=600',
      pages: [
        {
          id: '2-1',
          imageUrl: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=600',
          audio: '/audio/book2-page1.mp3',
          text: '자동차로 드라이브해요. 부릉부릉 소리가 나요.'
        },
        {
          id: '2-2',
          imageUrl: 'https://images.pexels.com/photos/385998/pexels-photo-385998.jpeg?auto=compress&cs=tinysrgb&w=600',
          audio: '/audio/book2-page2.mp3',
          text: '버스를 타고 여행가요. 많은 사람들이 함께 타요.'
        },
        {
          id: '2-3',
          imageUrl: 'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=600',
          audio: '/audio/book2-page3.mp3',
          text: '비행기가 높이 날아요. 구름 위로 날아가요.'
        },
        {
          id: '2-4',
          imageUrl: 'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=600',
          audio: '/audio/book2-page4.mp3',
          text: '기차가 철컥철컥 달려요. 기차역에서 출발해요.'
        }
      ]
    }
  ]);

  const quizScore = ref(0);
  const quizStreak = ref(0);
  const puzzleCompletions = ref(0);

  // Badge system with quiz and puzzle badges
  const badges = ref<Badge[]>([
    // Quiz badges (vehicles)
    { id: '1', name: '자동차 운전사', icon: '🚗', description: '퀴즈 5점 달성', requiredScore: 5, unlocked: false, category: 'quiz' },
    { id: '2', name: '버스 기사', icon: '🚌', description: '퀴즈 10점 달성', requiredScore: 10, unlocked: false, category: 'quiz' },
    { id: '3', name: '택시 운전사', icon: '🚕', description: '퀴즈 15점 달성', requiredScore: 15, unlocked: false, category: 'quiz' },
    { id: '4', name: '소방차 대장', icon: '🚒', description: '퀴즈 20점 달성', requiredScore: 20, unlocked: false, category: 'quiz' },
    { id: '5', name: '구급차 의사', icon: '🚑', description: '퀴즈 25점 달성', requiredScore: 25, unlocked: false, category: 'quiz' },
    { id: '6', name: '경찰차 경찰', icon: '🚓', description: '퀴즈 30점 달성', requiredScore: 30, unlocked: false, category: 'quiz' },
    { id: '7', name: '트럭 운전사', icon: '🚚', description: '퀴즈 35점 달성', requiredScore: 35, unlocked: false, category: 'quiz' },
    { id: '8', name: '기차 기관사', icon: '🚂', description: '퀴즈 40점 달성', requiredScore: 40, unlocked: false, category: 'quiz' },
    { id: '9', name: '지하철 기사', icon: '🚇', description: '퀴즈 45점 달성', requiredScore: 45, unlocked: false, category: 'quiz' },
    { id: '10', name: '전차 운전사', icon: '🚋', description: '퀴즈 50점 달성', requiredScore: 50, unlocked: false, category: 'quiz' },
    { id: '11', name: '모노레일 기사', icon: '🚝', description: '퀴즈 55점 달성', requiredScore: 55, unlocked: false, category: 'quiz' },
    { id: '12', name: '고속철 기사', icon: '🚄', description: '퀴즈 60점 달성', requiredScore: 60, unlocked: false, category: 'quiz' },
    { id: '13', name: '비행기 조종사', icon: '✈️', description: '퀴즈 65점 달성', requiredScore: 65, unlocked: false, category: 'quiz' },
    { id: '14', name: '헬리콥터 조종사', icon: '🚁', description: '퀴즈 70점 달성', requiredScore: 70, unlocked: false, category: 'quiz' },
    { id: '15', name: '로켓 우주인', icon: '🚀', description: '퀴즈 75점 달성', requiredScore: 75, unlocked: false, category: 'quiz' },
    { id: '16', name: '배 선장', icon: '🚢', description: '퀴즈 80점 달성', requiredScore: 80, unlocked: false, category: 'quiz' },
    { id: '17', name: '요트 선장', icon: '⛵', description: '퀴즈 85점 달성', requiredScore: 85, unlocked: false, category: 'quiz' },
    { id: '18', name: '잠수함 함장', icon: '🚤', description: '퀴즈 90점 달성', requiredScore: 90, unlocked: false, category: 'quiz' },
    { id: '19', name: '오토바이 라이더', icon: '🏍️', description: '퀴즈 95점 달성', requiredScore: 95, unlocked: false, category: 'quiz' },
    { id: '20', name: '레이싱카 드라이버', icon: '🏎️', description: '퀴즈 100점 달성', requiredScore: 100, unlocked: false, category: 'quiz' },
    
    // Puzzle badges (construction and tools)
    { id: '21', name: '퍼즐 초보자', icon: '🧩', description: '첫 퍼즐 완성', requiredScore: 1, unlocked: false, category: 'puzzle' },
    { id: '22', name: '망치 장인', icon: '🔨', description: '퍼즐 3개 완성', requiredScore: 3, unlocked: false, category: 'puzzle' },
    { id: '23', name: '드라이버 마스터', icon: '🪛', description: '퍼즐 5개 완성', requiredScore: 5, unlocked: false, category: 'puzzle' },
    { id: '24', name: '톱 전문가', icon: '🪚', description: '퍼즐 7개 완성', requiredScore: 7, unlocked: false, category: 'puzzle' },
    { id: '25', name: '렌치 기술자', icon: '🔧', description: '퍼즐 10개 완성', requiredScore: 10, unlocked: false, category: 'puzzle' },
    { id: '26', name: '못 박기 달인', icon: '🔩', description: '퍼즐 12개 완성', requiredScore: 12, unlocked: false, category: 'puzzle' },
    { id: '27', name: '삽 작업자', icon: '🪣', description: '퍼즐 15개 완성', requiredScore: 15, unlocked: false, category: 'puzzle' },
    { id: '28', name: '건설 현장 감독', icon: '👷', description: '퍼즐 20개 완성', requiredScore: 20, unlocked: false, category: 'puzzle' },
    { id: '29', name: '크레인 조작사', icon: '🏗️', description: '퍼즐 25개 완성', requiredScore: 25, unlocked: false, category: 'puzzle' },
    { id: '30', name: '퍼즐 마스터', icon: '🏆', description: '퍼즐 30개 완성', requiredScore: 30, unlocked: false, category: 'puzzle' }
  ]);

  const unlockedBadges = ref<string[]>([]);
  const apiKeys = ref<ApiKey[]>([]);

  // Actions
  const setLanguage = (lang: Language) => {
    currentLanguage.value = lang;
  };

  const setMode = (mode: GameMode) => {
    currentMode.value = mode;
  };

  const adminLogin = async (password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      // Check if the response is ok first
      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        return false;
      }

      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        return false;
      }

      if (data.success) {
        isAdminLoggedIn.value = true;
        adminToken.value = data.token;
        localStorage.setItem('adminToken', data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const adminLogout = async () => {
    try {
      if (adminToken.value) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken.value}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      isAdminLoggedIn.value = false;
      adminToken.value = '';
      adminPassword.value = '';
      localStorage.removeItem('adminToken');
    }
  };

  const verifyAdminToken = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        adminToken.value = token;
        isAdminLoggedIn.value = true;
        return true;
      }
    } catch (error) {
      console.error('Token verification error:', error);
    }

    localStorage.removeItem('adminToken');
    return false;
  };

  const addWord = (word: Omit<WordItem, 'id'>) => {
    const newWord: WordItem = {
      id: Date.now().toString(),
      ...word
    };
    words.value.push(newWord);
  };

  const updateWord = (id: string, updatedWord: Partial<WordItem>) => {
    const index = words.value.findIndex(w => w.id === id);
    if (index !== -1) {
      words.value[index] = { ...words.value[index], ...updatedWord };
    }
  };

  const deleteWord = (id: string) => {
    words.value = words.value.filter(w => w.id !== id);
  };

  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook: Book = {
      id: Date.now().toString(),
      ...book
    };
    books.value.push(newBook);
  };

  const updateBook = (id: string, updatedBook: Partial<Book>) => {
    const index = books.value.findIndex(b => b.id === id);
    if (index !== -1) {
      books.value[index] = { ...books.value[index], ...updatedBook };
    }
  };

  const deleteBook = (id: string) => {
    books.value = books.value.filter(b => b.id !== id);
  };

  const addBadge = (badge: Omit<Badge, 'id'>) => {
    const newBadge: Badge = {
      id: Date.now().toString(),
      ...badge
    };
    badges.value.push(newBadge);
    // Sort badges by category and required score
    badges.value.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category === 'quiz' ? -1 : 1;
      }
      return a.requiredScore - b.requiredScore;
    });
  };

  const updateBadge = (id: string, updatedBadge: Partial<Badge>) => {
    const index = badges.value.findIndex(b => b.id === id);
    if (index !== -1) {
      badges.value[index] = { ...badges.value[index], ...updatedBadge };
      // Sort badges by category and required score
      badges.value.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category === 'quiz' ? -1 : 1;
        }
        return a.requiredScore - b.requiredScore;
      });
    }
  };

  const deleteBadge = (id: string) => {
    badges.value = badges.value.filter(b => b.id !== id);
  };

  const incrementQuizScore = () => {
    quizScore.value++;
    quizStreak.value++;
    checkBadgeUnlocks();
  };

  const resetQuizStreak = () => {
    quizStreak.value = 0;
  };

  const incrementPuzzleCompletions = () => {
    puzzleCompletions.value++;
    checkBadgeUnlocks();
  };

  const checkBadgeUnlocks = () => {
    badges.value.forEach(badge => {
      if (!badge.unlocked) {
        let shouldUnlock = false;
        
        if (badge.category === 'quiz' && quizScore.value >= badge.requiredScore) {
          shouldUnlock = true;
        } else if (badge.category === 'puzzle' && puzzleCompletions.value >= badge.requiredScore) {
          shouldUnlock = true;
        }
        
        if (shouldUnlock) {
          badge.unlocked = true;
          if (!unlockedBadges.value.includes(badge.id)) {
            unlockedBadges.value.push(badge.id);
          }
        }
      }
    });
  };

  // API Key management
  const fetchApiKeys = async () => {
    if (!adminToken.value) return;

    try {
      const response = await fetch('/api/keys', {
        headers: {
          'Authorization': `Bearer ${adminToken.value}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        apiKeys.value = data.data;
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const createApiKey = async (name: string, description: string) => {
    if (!adminToken.value) return null;

    try {
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
    } catch (error) {
      console.error('Error creating API key:', error);
    }
    return null;
  };

  const deleteApiKey = async (id: string) => {
    if (!adminToken.value) return false;

    try {
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
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
    return false;
  };

  // Getters
  const currentWords = computed(() => words.value);
  const currentBooks = computed(() => books.value);
  const currentBadges = computed(() => badges.value);
  const availableBadges = computed(() => badges.value.filter(b => b.unlocked));
  const nextBadge = computed(() => {
    const quizBadges = badges.value.filter(b => b.category === 'quiz' && !b.unlocked && b.requiredScore > quizScore.value);
    const puzzleBadges = badges.value.filter(b => b.category === 'puzzle' && !b.unlocked && b.requiredScore > puzzleCompletions.value);
    
    const nextQuizBadge = quizBadges.length > 0 ? quizBadges[0] : null;
    const nextPuzzleBadge = puzzleBadges.length > 0 ? puzzleBadges[0] : null;
    
    // Return the closest badge
    if (!nextQuizBadge) return nextPuzzleBadge;
    if (!nextPuzzleBadge) return nextQuizBadge;
    
    const quizDistance = nextQuizBadge.requiredScore - quizScore.value;
    const puzzleDistance = nextPuzzleBadge.requiredScore - puzzleCompletions.value;
    
    return quizDistance <= puzzleDistance ? nextQuizBadge : nextPuzzleBadge;
  });
  
  const wordsByCategory = computed(() => {
    const categories: Record<string, WordItem[]> = {};
    words.value.forEach(word => {
      if (!categories[word.category]) {
        categories[word.category] = [];
      }
      categories[word.category].push(word);
    });
    return categories;
  });

  return {
    // State
    currentLanguage,
    currentMode,
    isAdminMode,
    adminPassword,
    isAdminLoggedIn,
    adminToken,
    words,
    books,
    quizScore,
    quizStreak,
    puzzleCompletions,
    badges,
    unlockedBadges,
    apiKeys,
    
    // Actions
    setLanguage,
    setMode,
    adminLogin,
    adminLogout,
    verifyAdminToken,
    addWord,
    updateWord,
    deleteWord,
    addBook,
    updateBook,
    deleteBook,
    addBadge,
    updateBadge,
    deleteBadge,
    incrementQuizScore,
    resetQuizStreak,
    incrementPuzzleCompletions,
    checkBadgeUnlocks,
    fetchApiKeys,
    createApiKey,
    deleteApiKey,
    
    // Getters
    currentWords,
    currentBooks,
    currentBadges,
    availableBadges,
    nextBadge,
    wordsByCategory
  };
});