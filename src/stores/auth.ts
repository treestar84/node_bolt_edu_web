import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSupabase } from '@/composables/useSupabase';
import type { UserProfile, UserProgress } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const { supabase, signUp, signIn, signOut, getCurrentUser, getUserProfile, updateUserProfile, checkUsernameExists } = useSupabase();
  
  const user = ref<any>(null);
  const userProfile = ref<UserProfile | null>(null);
  const userProgress = ref<UserProgress | null>(null);
  const isLoading = ref(false);
  const error = ref<string>('');

  const isAuthenticated = computed(() => !!user.value);
  const siteName = computed(() => userProfile.value?.siteName || '유아학습');
  const childAge = computed(() => userProfile.value?.childAge || 4);
  const mainImageUrl = computed(() => userProfile.value?.mainImageUrl);

  // Initialize auth state
  const initialize = async () => {
    try {
      isLoading.value = true;
      console.log('🔄 Initializing auth store...');
      
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        console.log('👤 Found existing user:', currentUser.id);
        user.value = currentUser;
        await loadUserProfile();
      } else {
        console.log('👤 No existing user found');
      }
    } catch (err: any) {
      console.error('💥 Auth initialization error:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  // Load user profile and progress
  const loadUserProfile = async () => {
    if (!user.value) {
      console.log('⚠️ No user to load profile for');
      return;
    }

    try {
      console.log('📋 Loading user profile and progress...');
      
      const profile = await getUserProfile(user.value.id);
      userProfile.value = profile;
      console.log('✅ Profile loaded:', profile.username);

      // Load progress separately with error handling
      try {
        const progressResult = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.value.id)
          .single();
        
        if (progressResult.data) {
          userProgress.value = progressResult.data;
          console.log('✅ Progress loaded:', progressResult.data);
        } else {
          console.log('📊 No progress found, creating initial progress...');
          // Create initial progress if it doesn't exist
          const { data: newProgress } = await supabase
            .from('user_progress')
            .insert({
              user_id: user.value.id,
              quiz_score: 0,
              quiz_streak: 0,
              puzzle_completions: 0,
              words_learned: 0,
              books_read: 0
            })
            .select()
            .single();
          
          if (newProgress) {
            userProgress.value = newProgress;
            console.log('✅ Initial progress created:', newProgress);
          }
        }
      } catch (progressError: any) {
        console.error('⚠️ Error loading user progress:', progressError);
        // Initialize default progress
        userProgress.value = {
          id: '',
          userId: user.value.id,
          quizScore: 0,
          quizStreak: 0,
          puzzleCompletions: 0,
          wordsLearned: 0,
          booksRead: 0,
          updatedAt: new Date().toISOString()
        };
        console.log('📊 Using default progress');
      }
    } catch (err: any) {
      console.error('💥 Error loading user profile:', err);
      error.value = err.message;
    }
  };

  // Register new user with username
  const register = async (
    username: string, 
    password: string, 
    userType: 'teacher' | 'director' | 'parent',
    childAge: number
  ) => {
    try {
      isLoading.value = true;
      error.value = '';
      
      console.log('🚀 Starting registration process...');
      console.log('📝 Registration data:', { username, userType, childAge });

      // Validate username format
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        const errorMsg = '아이디는 3-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.';
        console.error('❌ Username validation failed:', errorMsg);
        error.value = errorMsg;
        return false;
      }

      // Validate password
      if (password.length < 6) {
        const errorMsg = '비밀번호는 최소 6자 이상이어야 합니다.';
        console.error('❌ Password validation failed:', errorMsg);
        error.value = errorMsg;
        return false;
      }

      // Check if username already exists
      console.log('🔍 Checking username availability...');
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        const errorMsg = '이미 사용 중인 아이디입니다.';
        console.error('❌ Username already exists:', errorMsg);
        error.value = errorMsg;
        return false;
      }

      console.log('✅ Username is available, proceeding with signup...');
      const { user: newUser } = await signUp(username, password, userType, childAge);
      
      if (newUser) {
        console.log('🎉 User created successfully, loading profile...');
        user.value = newUser;
        await loadUserProfile();
        console.log('✅ Registration completed successfully');
      }

      return true;
    } catch (err: any) {
      console.error('💥 Registration error:', err);
      
      // Enhanced error handling with more specific messages
      if (err.message.includes('rate limit') || err.message.includes('email rate limit')) {
        error.value = '회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      } else if (err.message.includes('already registered') || err.message.includes('already been registered')) {
        error.value = '이미 사용 중인 아이디입니다.';
      } else if (err.message.includes('Password') || err.message.includes('password')) {
        error.value = '비밀번호는 최소 6자 이상이어야 합니다.';
      } else if (err.message.includes('프로필 생성 실패')) {
        error.value = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
      } else if (err.message.includes('row-level security') || err.message.includes('RLS')) {
        error.value = '데이터베이스 권한 오류입니다. 관리자에게 문의하세요.';
      } else if (err.message.includes('데이터베이스 권한 오류')) {
        error.value = err.message;
      } else if (err.message.includes('수동으로 로그인')) {
        error.value = '계정이 생성되었습니다. 로그인 페이지에서 다시 로그인해주세요.';
      } else {
        error.value = err.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
      }
      
      console.error('📝 Final error message:', error.value);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Login user with username
  const login = async (username: string, password: string) => {
    try {
      isLoading.value = true;
      error.value = '';
      
      console.log('🔐 Starting login process for:', username);

      const { user: loggedInUser } = await signIn(username, password);
      
      if (loggedInUser) {
        console.log('✅ Login successful, loading profile...');
        user.value = loggedInUser;
        await loadUserProfile();
        console.log('🎉 Login completed successfully');
      }

      return true;
    } catch (err: any) {
      console.error('💥 Login error:', err);
      if (err.message.includes('Invalid login credentials') || err.message.includes('invalid_credentials')) {
        error.value = '아이디 또는 비밀번호가 올바르지 않습니다.';
      } else if (err.message.includes('Email not confirmed')) {
        error.value = '이메일 인증이 필요합니다. 관리자에게 문의하세요.';
      } else {
        error.value = err.message || '로그인 중 오류가 발생했습니다.';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      await signOut();
      user.value = null;
      userProfile.value = null;
      userProgress.value = null;
      error.value = '';
      console.log('✅ Logout completed');
    } catch (err: any) {
      console.error('💥 Logout error:', err);
      error.value = err.message;
    }
  };

  // Update user settings
  const updateSettings = async (updates: Partial<UserProfile>) => {
    if (!user.value || !userProfile.value) {
      console.error('⚠️ No user or profile to update');
      return false;
    }

    try {
      isLoading.value = true;
      error.value = '';
      
      console.log('📝 Updating user settings:', updates);

      const updatedProfile = await updateUserProfile(user.value.id, updates);
      userProfile.value = { ...userProfile.value, ...updatedProfile };
      
      console.log('✅ Settings updated successfully');
      return true;
    } catch (err: any) {
      console.error('💥 Settings update error:', err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Update user progress
  const updateProgress = async (updates: Partial<UserProgress>) => {
    if (!user.value || !userProgress.value) {
      console.error('⚠️ No user or progress to update');
      return false;
    }

    try {
      console.log('📈 Updating user progress:', updates);
      
      const updatedProgress = await supabase
        .from('user_progress')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.value.id)
        .select()
        .single();

      if (updatedProgress.data) {
        userProgress.value = { ...userProgress.value, ...updatedProgress.data };
        console.log('✅ Progress updated successfully');
      }

      return true;
    } catch (err: any) {
      console.error('💥 Progress update error:', err);
      error.value = err.message;
      return false;
    }
  };

  return {
    // State
    user,
    userProfile,
    userProgress,
    isLoading,
    error,
    
    // Computed
    isAuthenticated,
    siteName,
    childAge,
    mainImageUrl,
    
    // Actions
    initialize,
    register,
    login,
    logout,
    updateSettings,
    updateProgress,
    loadUserProfile
  };
});