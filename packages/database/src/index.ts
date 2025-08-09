export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Supabase 데이터베이스 스키마 타입 정의
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          email: string | null;
        };
        Insert: {
          id: string;
          created_at?: string | null;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // 추가 테이블은 여기에 정의
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
};

// Supabase 테이블에서 행 타입 추출을 위한 헬퍼 타입
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// 프로필 타입
export type Profile = Tables<'profiles'>;

export default Database;
