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
    
    // Auth helpers - Modified for username login with enhanced debugging
    async signUp(username: string, password: string, userType: string, childAge: number) {
      try {
        console.log('🚀 Starting signup process for:', username);
        
        // Create a fake email from username for Supabase
        const email = `${username}@local.app`;
        
        console.log('📧 Creating auth user with email:', email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error('❌ Auth signup error:', error);
          throw error;
        }

        console.log('✅ Auth user created:', data.user?.id);

        if (data.user) {
          // Wait a bit for the user to be fully created in Supabase
          console.log('⏳ Waiting for user to be fully created...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time
          
          try {
            console.log('👤 Creating user profile...');
            
            // First, let's check if the user exists in auth
            const { data: currentUser } = await supabase.auth.getUser();
            console.log('🔍 Current auth user:', currentUser.user?.id);
            
            // Create user profile with actual username
            const profileData = {
              user_id: data.user.id,
              username,
              user_type: userType,
              child_age: childAge,
              site_name: '유아학습'
            };
            
            console.log('📝 Profile data to insert:', profileData);
            
            const { data: profileResult, error: profileError } = await supabase
              .from('user_profiles')
              .insert(profileData)
              .select()
              .single();

            if (profileError) {
              console.error('❌ Profile creation error:', {
                error: profileError,
                code: profileError.code,
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint
              });
              
              // More specific error handling
              if (profileError.code === '42501') {
                throw new Error('데이터베이스 권한 오류입니다. RLS 정책을 확인해주세요.');
              } else if (profileError.code === '23505') {
                throw new Error('이미 사용 중인 아이디입니다.');
              } else {
                throw new Error(`프로필 생성 실패: ${profileError.message}`);
              }
            }

            console.log('✅ Profile created successfully:', profileResult);

            // Initialize user progress
            console.log('📊 Creating user progress...');
            const progressData = {
              user_id: data.user.id,
              quiz_score: 0,
              quiz_streak: 0,
              puzzle_completions: 0,
              words_learned: 0,
              books_read: 0
            };
            
            console.log('📈 Progress data to insert:', progressData);
            
            const { data: progressResult, error: progressError } = await supabase
              .from('user_progress')
              .insert(progressData)
              .select()
              .single();

            if (progressError) {
              console.error('⚠️ Progress creation error (non-critical):', progressError);
              // Don't throw error for progress, it's not critical for signup
            } else {
              console.log('✅ Progress created successfully:', progressResult);
            }
            
          } catch (profileError) {
            console.error('💥 Error in profile creation process:', profileError);
            
            // Clean up the auth user if profile creation fails
            console.log('🧹 Cleaning up auth user due to profile creation failure...');
            try {
              await supabase.auth.signOut();
              console.log('✅ Auth user cleaned up');
            } catch (cleanupError) {
              console.error('❌ Failed to cleanup auth user:', cleanupError);
            }
            
            throw profileError;
          }
        }

        console.log('🎉 Signup process completed successfully');
        return data;
      } catch (error) {
        console.error('💥 SignUp error:', error);
        throw error;
      }
    },

    async signIn(username: string, password: string) {
      try {
        console.log('🔐 Starting signin process for:', username);
        
        // Convert username to email format for Supabase
        const email = `${username}@local.app`;
        
        console.log('📧 Signing in with email:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('❌ Auth signin error:', error);
          throw error;
        }
        
        console.log('✅ Signin successful:', data.user?.id);
        return data;
      } catch (error) {
        console.error('💥 SignIn error:', error);
        throw error;
      }
    },

    async signOut() {
      console.log('👋 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Signout error:', error);
        throw error;
      }
      console.log('✅ Signout successful');
    },

    async getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },

    // Check if username exists with better error handling
    async checkUsernameExists(username: string) {
      try {
        console.log('🔍 Checking if username exists:', username);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('username', username)
          .single();

        if (error) {
          console.log('📝 Username check error:', error);
          if (error.code === 'PGRST116') {
            // No rows returned - username doesn't exist
            console.log('✅ Username available');
            return false;
          } else {
            console.error('❌ Unexpected error checking username:', error);
            return false; // Assume username doesn't exist if we can't check
          }
        }
        
        console.log('⚠️ Username already exists');
        return !!data;
      } catch (error) {
        console.error('💥 Username check error:', error);
        return false;
      }
    },

    // Profile helpers
    async getUserProfile(userId: string) {
      console.log('👤 Getting user profile for:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Get profile error:', error);
        throw error;
      }
      console.log('✅ Profile retrieved:', data);
      return data;
    },

    async updateUserProfile(userId: string, updates: Partial<any>) {
      console.log('📝 Updating user profile for:', userId, updates);
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Update profile error:', error);
        throw error;
      }
      console.log('✅ Profile updated:', data);
      return data;
    },

    // Words helpers
    async getWords(userId: string, childAge: number) {
      console.log('📚 Getting words for user:', userId, 'age:', childAge);
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .or(`owner_type.eq.global,owner_id.eq.${userId}`)
        .lte('min_age', childAge)
        .gte('max_age', childAge)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Get words error:', error);
        throw error;
      }
      console.log('✅ Words retrieved:', data?.length);
      return data || [];
    },

    async addWord(wordData: any, userId: string) {
      console.log('➕ Adding word for user:', userId);
      const { data, error } = await supabase
        .from('words')
        .insert({
          ...wordData,
          owner_type: 'user',
          owner_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Add word error:', error);
        throw error;
      }
      console.log('✅ Word added:', data);
      return data;
    },

    // Books helpers
    async getBooks(userId: string, childAge: number) {
      console.log('📖 Getting books for user:', userId, 'age:', childAge);
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

      if (error) {
        console.error('❌ Get books error:', error);
        throw error;
      }
      console.log('✅ Books retrieved:', data?.length);
      return data || [];
    },

    // Progress helpers
    async getUserProgress(userId: string) {
      console.log('📊 Getting user progress for:', userId);
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Get progress error:', error);
        throw error;
      }
      console.log('✅ Progress retrieved:', data);
      return data;
    },

    async updateUserProgress(userId: string, updates: Partial<any>) {
      console.log('📈 Updating user progress for:', userId, updates);
      const { data, error } = await supabase
        .from('user_progress')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Update progress error:', error);
        throw error;
      }
      console.log('✅ Progress updated:', data);
      return data;
    },

    // Badges helpers
    async getBadges() {
      console.log('🏆 Getting badges...');
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('required_score');

      if (error) {
        console.error('❌ Get badges error:', error);
        throw error;
      }
      console.log('✅ Badges retrieved:', data?.length);
      return data || [];
    },

    async getUserBadges(userId: string) {
      console.log('🎖️ Getting user badges for:', userId);
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        console.error('❌ Get user badges error:', error);
        throw error;
      }
      console.log('✅ User badges retrieved:', data?.length);
      return data || [];
    },

    async unlockBadge(userId: string, badgeId: string) {
      console.log('🔓 Unlocking badge for user:', userId, 'badge:', badgeId);
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

      if (error && error.code !== '23505') {
        console.error('❌ Unlock badge error:', error);
        throw error; // Ignore duplicate key error
      }
      console.log('✅ Badge unlocked:', data);
      return data;
    }
  };
}