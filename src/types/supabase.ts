export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          user_type: 'teacher' | 'director' | 'parent';
          site_name: string;
          main_image_url: string | null;
          child_age: number; // FIXED: Use snake_case to match database
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          user_type: 'teacher' | 'director' | 'parent';
          site_name?: string;
          main_image_url?: string | null;
          child_age?: number; // FIXED: Use snake_case to match database
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          user_type?: 'teacher' | 'director' | 'parent';
          site_name?: string;
          main_image_url?: string | null;
          child_age?: number; // FIXED: Use snake_case to match database
          created_at?: string;
          updated_at?: string;
        };
      };
      words: {
        Row: {
          id: string;
          name: string;
          name_en: string;
          image_url: string;
          audio_ko: string;
          audio_en: string;
          category: string;
          min_age: number;
          max_age: number;
          owner_type: 'global' | 'user';
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en: string;
          image_url: string;
          audio_ko: string;
          audio_en: string;
          category: string;
          min_age?: number;
          max_age?: number;
          owner_type?: 'global' | 'user';
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string;
          image_url?: string;
          audio_ko?: string;
          audio_en?: string;
          category?: string;
          min_age?: number;
          max_age?: number;
          owner_type?: 'global' | 'user';
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          cover_image: string;
          min_age: number;
          max_age: number;
          owner_type: 'global' | 'user';
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          cover_image: string;
          min_age?: number;
          max_age?: number;
          owner_type?: 'global' | 'user';
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          cover_image?: string;
          min_age?: number;
          max_age?: number;
          owner_type?: 'global' | 'user';
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      book_pages: {
        Row: {
          id: string;
          book_id: string;
          page_number: number;
          image_url: string;
          audio_url: string;
          text_content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          page_number: number;
          image_url: string;
          audio_url: string;
          text_content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          page_number?: number;
          image_url?: string;
          audio_url?: string;
          text_content?: string | null;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          quiz_score: number;
          quiz_streak: number;
          puzzle_completions: number;
          words_learned: number;
          books_read: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_score?: number;
          quiz_streak?: number;
          puzzle_completions?: number;
          words_learned?: number;
          books_read?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_score?: number;
          quiz_streak?: number;
          puzzle_completions?: number;
          words_learned?: number;
          books_read?: number;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          icon: string;
          description: string;
          category: 'quiz' | 'puzzle' | 'words' | 'books';
          required_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          description: string;
          category: 'quiz' | 'puzzle' | 'words' | 'books';
          required_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          description?: string;
          category?: 'quiz' | 'puzzle' | 'words' | 'books';
          required_score?: number;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          unlocked_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}