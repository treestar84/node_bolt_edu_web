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
    
    // Auth helpers - Modified for username login
    async signUp(username: string, password: string, userType: string, childAge: number) {
      try {
        // Create a fake email from username for Supabase
        const email = `${username}@local.app`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Wait a bit for the user to be fully created
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create user profile with actual username
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              username,
              user_type: userType,
              child_age: childAge,
              site_name: '유아학습'
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw new Error(`프로필 생성 실패: ${profileError.message}`);
          }

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

          if (progressError) {
            console.error('Progress creation error:', progressError);
            // Don't throw error for progress, it's not critical
          }
        }

        return data;
      } catch (error) {
        console.error('SignUp error:', error);
        throw error;
      }
    },

    async signIn(username: string, password: string) {
      try {
        // Convert username to email format for Supabase
        const email = `${username}@local.app`;
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('SignIn error:', error);
        throw error;
      }
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    async getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },

    // Check if username exists
    async checkUsernameExists(username: string) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('username', username)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Username check error:', error);
          return false; // Assume username doesn't exist if we can't check
        }
        
        return !!data;
      } catch (error) {
        console.error('Username check error:', error);
        return false;
      }
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

      if (error && error.code !== 'PGRST116') throw error;
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