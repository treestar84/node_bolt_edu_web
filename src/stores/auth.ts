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
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        user.value = currentUser;
        await loadUserProfile();
      }
    } catch (err: any) {
      console.error('Auth initialization error:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  // Load user profile and progress
  const loadUserProfile = async () => {
    if (!user.value) return;

    try {
      const [profile, progress] = await Promise.all([
        getUserProfile(user.value.id),
        supabase.from('user_progress').select('*').eq('user_id', user.value.id).single()
      ]);

      userProfile.value = profile;
      userProgress.value = progress.data;
    } catch (err: any) {
      console.error('Error loading user profile:', err);
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

      // Check if username already exists
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        error.value = '이미 사용 중인 아이디입니다.';
        return false;
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        error.value = '아이디는 3-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.';
        return false;
      }

      const { user: newUser } = await signUp(username, password, userType, childAge);
      
      if (newUser) {
        user.value = newUser;
        await loadUserProfile();
      }

      return true;
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.message.includes('already registered')) {
        error.value = '이미 사용 중인 아이디입니다.';
      } else if (err.message.includes('Password')) {
        error.value = '비밀번호는 최소 6자 이상이어야 합니다.';
      } else {
        error.value = err.message;
      }
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

      const { user: loggedInUser } = await signIn(username, password);
      
      if (loggedInUser) {
        user.value = loggedInUser;
        await loadUserProfile();
      }

      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message.includes('Invalid login credentials')) {
        error.value = '아이디 또는 비밀번호가 올바르지 않습니다.';
      } else {
        error.value = err.message;
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut();
      user.value = null;
      userProfile.value = null;
      userProgress.value = null;
      error.value = '';
    } catch (err: any) {
      console.error('Logout error:', err);
      error.value = err.message;
    }
  };

  // Update user settings
  const updateSettings = async (updates: Partial<UserProfile>) => {
    if (!user.value || !userProfile.value) return false;

    try {
      isLoading.value = true;
      error.value = '';

      const updatedProfile = await updateUserProfile(user.value.id, updates);
      userProfile.value = { ...userProfile.value, ...updatedProfile };

      return true;
    } catch (err: any) {
      console.error('Settings update error:', err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Update user progress
  const updateProgress = async (updates: Partial<UserProgress>) => {
    if (!user.value || !userProgress.value) return false;

    try {
      const updatedProgress = await supabase
        .from('user_progress')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.value.id)
        .select()
        .single();

      if (updatedProgress.data) {
        userProgress.value = { ...userProgress.value, ...updatedProgress.data };
      }

      return true;
    } catch (err: any) {
      console.error('Progress update error:', err);
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