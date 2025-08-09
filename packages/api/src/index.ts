import { createClient } from '@supabase/supabase-js';
import type { Database } from 'database';
import { Provider } from '@supabase/supabase-js';

// 플랫폼 감지 (웹 또는 모바일 환경)
const isBrowser = typeof window !== 'undefined';
const isServer = !isBrowser && typeof process !== 'undefined';
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// 환경 변수 초기화
let supabaseUrl = '';
let supabaseAnonKey = '';

// 환경 변수 로드
// 1. Next.js 환경 (서버 또는 웹 클라이언트)
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  console.log('✅ Next.js에서 환경 변수 로드됨');
}

if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 환경 정보:', {
    isBrowser,
    isServer,
    isReactNative,
    nodeEnv: process.env.NODE_ENV,
  });
  console.log('🔍 SUPABASE_URL:', supabaseUrl ? '(설정됨)' : '(설정되지 않음)');
}

// Supabase 클라이언트 생성 함수 (이제 동기 함수로 변환)
export const getSupabaseClient = () => {
  // Expo 환경의 경우 여기서는 처리하지 않음
  // 대신 각 앱에서 개별적으로 처리해야 함
  
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다. 기본값 또는 테스트 값을 사용합니다.');
    }
    // 개발 중 기본값 제공 (실제 프로덕션에서는 사용하지 않음)
    supabaseUrl = supabaseUrl || 'https://your-test-url.supabase.co';
    supabaseAnonKey = supabaseAnonKey || 'your-test-anon-key';
  }
  
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
  },
  
  getSession: async () => {
    const client = getSupabaseClient();
    return client.auth.getSession();
  },
  
  resetPassword: async (email: string) => {
    const client = getSupabaseClient();
    return client.auth.resetPasswordForEmail(email);
  },
  
  updatePassword: async (password: string) => {
    const client = getSupabaseClient();
    return client.auth.updateUser({ password });
  },
  
  signInWithProvider: async (provider: Provider, redirectTo?: string) => {
    const client = getSupabaseClient();
    return client.auth.signInWithOAuth({
      provider,
      options: redirectTo ? { redirectTo } : undefined,
    });
  },
  
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    const client = getSupabaseClient();
    return client.auth.onAuthStateChange(callback);
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
  },
  
  createProfile: async (userId: string, data: any) => {
    const client = getSupabaseClient();
    return client
      .from('profiles')
      .insert([{ id: userId, ...data }]);
  }
};

// 기타 API 함수들은 여기에 추가

// API 모듈 내보내기
export default {
  auth: authApi,
  users: usersApi,
  // 다른 API 모듈들 추가
};
