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
      console.error('❌ Supabase 환경 변수가 설정되지 않았습니다. 로그인 및 인증 관련 기능이 작동하지 않습니다.');
      console.error('환경 변수를 .env.local 파일에 추가하세요:');
      console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    }
    
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
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

  verifyEmail: async (token: string) => {
    const client = getSupabaseClient();
    try {
      // Supabase의 verifyOtp 대신 직접 세션 확인 방식으로 변경
      console.log('토큰 확인 시도:', token);
      
      // hash와 token_hash는 다를 수 있으므로 다양한 방식 시도
      let result;
      let email = '';
      
      try {
        // 방법 1: 기본 이메일 확인 (type: email)
        result = await client.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });
        
        // 세션에서 이메일 추출
        if (result.data?.user) {
          email = result.data.user.email || '';
        }
      } catch (err) {
        console.log('첫번째 방식 실패, 다른 방식 시도중...');
        try {
          // 방법 2: 토큰만 사용
          result = await client.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          });
          
          // 세션에서 이메일 추출
          if (result.data?.user) {
            email = result.data.user.email || '';
          }
        } catch (err2) {
          // 방법 3: 세션 상태 확인
          const { data } = await client.auth.getSession();
          if (data.session) {
            result = { data: data.session, error: null };
            email = data.session?.user?.email || '';
            return { data: data.session, error: null, email };
          } else {
            throw new Error('인증에 실패했습니다');
          }
        }
      }
      
      return { ...result, email };
    } catch (error) {
      console.error('Email verification error:', error);
      return { error, email: '' };
    }
  },
  
  verifyEmailSignup: async (token: string) => {
    const client = getSupabaseClient();
    try {
      console.log('회원가입 이메일 토큰 확인 시도:', token);
      let email = '';
      
      // 여러 방식 시도
      try {
        // 방법 1: signup 유형으로 시도
        const result = await client.auth.verifyOtp({
          token_hash: token,
          type: 'signup',
        });
        
        // 세션에서 이메일 추출
        if (result.data?.user) {
          email = result.data.user.email || '';
        }
        
        return { ...result, email };
      } catch (err) {
        try {
          // 방법 2: 이메일 유형으로 시도
          const result = await client.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });
          
          // 세션에서 이메일 추출
          if (result.data?.user) {
            email = result.data.user.email || '';
          }
          
          return { ...result, email };
        } catch (err2) {
          // 방법 3: 세션에서 이메일 확인
          const { data } = await client.auth.getSession();
          if (data.session?.user?.email) {
            email = data.session.user.email;
          }
          
          // 방법 4: 커스텀 엔드포인트 사용 (Supabase에서 지원할 경우)
          const { error } = await fetch(`${client.auth.api.url}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }).then(res => res.json());
          
          if (error) throw error;
          return { error: null, email };
        }
      }
    } catch (error) {
      console.error('Signup verification error:', error);
      return { error, email: '' };
    }
  },
  
  verifyRecovery: async (token: string, newPassword: string) => {
    const client = getSupabaseClient();
    try {
      // First verify the recovery token
      const { error: verifyError } = await client.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      });
      
      if (verifyError) {
        return { error: verifyError };
      }
      
      // Then update the password
      const { error: updateError } = await client.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        return { error: updateError };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Password recovery error:', error);
      return { error };
    }
  },
  
  sendEmailVerification: async (email: string) => {
    const client = getSupabaseClient();
    try {
      console.log('이메일 인증 링크 전송 시도:', email);
      
      // 이메일 인증 링크 전송
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // 사용자가 존재하지 않으면 새로 생성하지 않음
          emailRedirectTo: `${window.location.origin}/auth/signup?verified=true&email=${encodeURIComponent(email)}`
        }
      });
      
      return { error };
    } catch (error) {
      console.error('Email verification send error:', error);
      return { error };
    }
  },
  
  // 이메일 중복 확인 함수
  checkEmailExists: async (email: string) => {
    const client = getSupabaseClient();
    try {
      console.log('이메일 존재 여부 확인:', email);
      
      // 직접적인 API가 없으므로 signUp API 사용해서 확인
      // 사용자가 이미 존재하면 오류 발생
      const { error } = await client.auth.signUp({
        email,
        password: `temp-${Math.random().toString(36).substring(2, 10)}`, // 임시 비밀번호
        options: {
          emailRedirectTo: window.location.origin,
          data: { checkOnly: true } // 실제 가입용이 아님을 표시
        }
      });
      
      // 이미 존재하는 이메일 관련 오류가 있으면 존재함
      if (error && (
        error.message.includes('already registered') || 
        error.message.includes('already in use') ||
        error.message.includes('already exists')
      )) {
        return { exists: true, error: null };
      }
      
      // 다른 오류이거나 오류가 없으면 존재하지 않음
      return { exists: false, error: error || null };
    } catch (error) {
      console.error('Email check error:', error);
      return { exists: false, error };
    }
  },
  
  // 현재 사용자의 이메일 인증 상태 확인
  checkEmailVerificationStatus: async () => {
    const client = getSupabaseClient();
    try {
      // 현재 세션 정보 가져오기
      const { data: { session }, error } = await client.auth.getSession();
      
      if (error || !session) {
        return { verified: false, error };
      }
      
      // email_confirmed_at이 있거나 app_metadata에 provider가 email이 아닌 경우(소셜 로그인) 이메일 인증된 것으로 간주
      const user = session.user;
      const verified = user.email_confirmed_at !== null || 
                       (user.app_metadata && user.app_metadata.provider !== 'email');
      
      return { verified, error: null };
    } catch (error) {
      console.error('Check email verification status error:', error);
      return { verified: false, error };
    }
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
