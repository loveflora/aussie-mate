import { createClient } from '@supabase/supabase-js';
import type { Database } from 'database';

// Supabase 클라이언트 초기화를 위한 환경 변수 불러오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 앱 플랫폼에 따라 환경 변수를 불러오는 방식이 다를 수 있음
export const getSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// 인증 관련 API 함수들
export const authApi = {
  signIn: async (email: string, password: string) => {
    const client = getSupabaseClient();
    return client.auth.signInWithPassword({ email, password });
  },
  
  signUp: async (email: string, password: string) => {
    const client = getSupabaseClient();
    return client.auth.signUp({ email, password });
  },
  
  signOut: async () => {
    const client = getSupabaseClient();
    return client.auth.signOut();
  },
  
  getUser: async () => {
    const client = getSupabaseClient();
    return client.auth.getUser();
  }
};

// 사용자 데이터 관련 API 함수들
export const usersApi = {
  getProfile: async (userId: string) => {
    const client = getSupabaseClient();
    return client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },
  
  updateProfile: async (userId: string, data: any) => {
    const client = getSupabaseClient();
    return client
      .from('profiles')
      .update(data)
      .eq('id', userId);
  }
};

// 기타 API 함수들은 여기에 추가

// API 모듈 내보내기
export default {
  auth: authApi,
  users: usersApi,
  // 다른 API 모듈들 추가
};
