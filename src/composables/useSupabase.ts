import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function useSupabase() {
  return {
    supabase,
    
    // Auth helpers
    async signUp(email: string, password: string, username: string, userType: string, childAge: number) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            username,
            user_type: userType,
            child_age: childAge,
            site_name: '유아학습'
          });

        if (profileError) throw profileError;

        // Initialize user progress
        const { error: progressError } = await supabase
          .from('user_progress')
          .insert({
            user_id: data.user.id,
            quiz_score: 0,
            quiz_streak: 0,
            puzzle_completions: 0,
            words_learned: 0,
            books_read: 0
          });

        if (progressError) throw progressError;
      }

      return data;
    },

    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    async getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },

    // Profile helpers
    async getUserProfile(userId: string) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    },

    async updateUserProfile(userId: string, updates: Partial<any>) {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Words helpers
    async getWords(userId: string, childAge: number) {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .or(`owner_type.eq.global,owner_id.eq.${userId}`)
        .lte('min_age', childAge)
        .gte('max_age', childAge)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async addWord(wordData: any, userId: string) {
      const { data, error } = await supabase
        .from('words')
        .insert({
          ...wordData,
          owner_type: 'user',
          owner_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Books helpers
    async getBooks(userId: string, childAge: number) {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          book_pages (*)
        `)
        .or(`owner_type.eq.global,owner_id.eq.${userId}`)
        .lte('min_age', childAge)
        .gte('max_age', childAge)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    // Progress helpers
    async getUserProgress(userId: string) {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    },

    async updateUserProgress(userId: string, updates: Partial<any>) {
      const { data, error } = await supabase
        .from('user_progress')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Badges helpers
    async getBadges() {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('required_score');

      if (error) throw error;
      return data || [];
    },

    async getUserBadges(userId: string) {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async unlockBadge(userId: string, badgeId: string) {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId
        })
        .select(`
          *,
          badges (*)
        `)
        .single();

      if (error && error.code !== '23505') throw error; // Ignore duplicate key error
      return data;
    }
  };
}