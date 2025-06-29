import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSupabase } from '@/composables/useSupabase';
import type { UserProfile, UserProgress } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const { supabase, signUp, signIn, signOut, getCurrentUser, getUserProfile, updateUserProfile } = useSupabase();
  
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

  // Register new user
  const register = async (
    email: string, 
    password: string, 
    username: string, 
    userType: 'teacher' | 'director' | 'parent',
    childAge: number
  ) => {
    try {
      isLoading.value = true;
      error.value = '';

      const { user: newUser } = await signUp(email, password, username, userType, childAge);
      
      if (newUser) {
        user.value = newUser;
        await loadUserProfile();
      }

      return true;
    } catch (err: any) {
      console.error('Registration error:', err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true;
      error.value = '';

      const { user: loggedInUser } = await signIn(email, password);
      
      if (loggedInUser) {
        user.value = loggedInUser;
        await loadUserProfile();
      }

      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      error.value = err.message;
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