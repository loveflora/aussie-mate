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
  
  signUp: async (email: string, password: string, metadata?: any) => {
    const client = getSupabaseClient();
    try {
      // 1. 사용자 계정 생성
      const { data, error } = await client.auth.signUp({ 
        email, 
        password,
        options: {
          data: { 
            ...metadata,
            profile_completed: metadata?.nickname && metadata?.state ? true : false 
          }
        }
      });

      if (error) {
        return { data, error };
      }

      // 2. 닉네임과 state가 제공된 경우, 프로필 테이블에 저장
      if (data.user) {
        try {
          const profileData: Record<string, any> = { 
            id: data.user.id,
            email: email 
          };
          
          // 닉네임 있으면 username으로 저장
          if (metadata?.nickname) {
            profileData.username = metadata.nickname;
          }
          
          // state 있으면 저장
          if (metadata?.state) {
            profileData.state = metadata.state;
          }

          const { error: profileError } = await client
            .from('profiles')
            .upsert(profileData);

          if (profileError) {
            console.error("프로필 생성 오류:", profileError);
            // 사용자 계정이 생성되었으므로 오류를 반환하지 않음
          }
          
          // 사용자 생성 후 명시적으로 메타데이터 업데이트하여 동기화 보장
          if (metadata?.nickname || metadata?.state) {
            await client.auth.updateUser({
              data: {
                nickname: metadata?.nickname,
                state: metadata?.state,
                profile_completed: metadata?.nickname && metadata?.state ? true : false
              }
            });
          }
        } catch (profileErr) {
          console.error("프로필 생성 중 예외 발생:", profileErr);
          // 프로필 생성 실패하더라도 회원가입은 성공으로 처리
        }
      }

      return { data, error: null };
    } catch (err) {
      console.error("회원가입 오류:", err);
      return { data: null, error: err as any };
    }
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
  
  // 닉네임 중복 확인 함수
  checkNicknameAvailability: async (nickname: string) => {
    const client = getSupabaseClient();
    try {
      console.log('닉네임 중복 확인:', nickname);
      
      // 닉네임이 적어도 3자 이상인지 확인
      if (nickname.length < 3) {
        return { 
          available: false, 
          error: new Error('닉네임은 최소 3자 이상이어야 합니다.') 
        };
      }
      
      // 특수문자 제한을 완화: 알파벳, 숫자, 언더스코어, 한글 등 대부분의 문자 허용
      // 공백과 일부 특수문자만 제한
      const invalidChars = /[^\p{L}\p{N}_\-\.]/u;
      if (invalidChars.test(nickname)) {
        return { 
          available: false, 
          error: new Error('닉네임에 공백이나 특수문자를 포함할 수 없습니다.') 
        };
      }
      
      // 중복 확인 - 안전하게 처리
      let isAvailable = true;
      
      try {
        const { data, error } = await client
          .from('profiles')
          .select('username')
          .eq('username', nickname)
          .limit(1);
          
        if (!error && data && data.length > 0) {
          isAvailable = false;
        }
      } catch (e) {
        console.log('프로필 테이블 확인 중 오류 발생 (무시됨):', e);
        // 테이블이 존재하지 않을 수 있으므로, 오류 발생해도 사용 가능하다고 처리
        isAvailable = true;
      }
      
      return { 
        available: isAvailable, 
        error: isAvailable ? null : new Error('이미 사용 중인 닉네임입니다.') 
      };
    } catch (error) {
      console.error('Nickname check error:', error);
      // 오류 발생 시에도 닉네임 사용 가능하다고 응답 (UX 측면에서)
      return { available: true, error: null };
    }
  },
  
  // 계정 삭제 함수 (비밀번호 입력 필요 없음)
  deleteAccount: async () => {
    const client = getSupabaseClient();
    try {
      // 1. 현재 세션과 사용자 확인
      const { data: { user }, error: userError } = await client.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: userError || new Error('로그인된 사용자 정보를 가져올 수 없습니다.') };
      }
      
      // 2. 소셜 로그인 사용자 확인
      const isSocialUser = user.app_metadata?.provider && user.app_metadata.provider !== 'email';
      
      // 3. 프로필 데이터 삭제 시도 (테이블 존재하지 않을 수 있음)
      try {
        await client
          .from('profiles')
          .delete()
          .eq('id', user.id);
      } catch (e) {
        // 프로필 테이블 오류는 무시
        console.log('프로필 삭제 시도 중 오류 (무시됨):', e);
      }
      
      // 4. 수퍼베이스에서는 클라이언트 측 자체 계정 삭제가 제한됨
      // 계정 사용 불가능하게 처리
      
      // 4-1. 비밀번호 임의 변경 (보안 조치) - 소셜 로그인이 아닌 경우만
      if (!isSocialUser) {
        const randomPassword = Math.random().toString(36).slice(-10);
        await client.auth.updateUser({ password: randomPassword });
      }
      
      // 4-2. 사용자 메타데이터에 삭제 표시
      await client.auth.updateUser({
        data: { 
          account_deleted: true,
          deleted_at: new Date().toISOString()
        }
      });
      
      // 5. 로그아웃 처리
      await client.auth.signOut();
      
      return { success: true, error: null };
    } catch (error) {
      console.error('계정 삭제 오류:', error);
      return { success: false, error };
    }
  },
  
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    const client = getSupabaseClient();
    return client.auth.onAuthStateChange(callback);
  },
  
  // 사용자 프로필 및 메타데이터 업데이트 함수
  updateUserProfile: async (profileData: any) => {
    try {
      const client = getSupabaseClient();
      
      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user }, error: userError } = await client.auth.getUser();
      
      if (userError || !user) {
        return { error: userError || new Error('로그인된 사용자가 없습니다.') };
      }
      
      // 1. 사용자 메타데이터 업데이트 (user_metadata)
      const metaDataToUpdate: Record<string, any> = {};
      
      // profile_completed 플래그가 있으면 메타데이터에 포함
      if ('profile_completed' in profileData) {
        metaDataToUpdate.profile_completed = profileData.profile_completed;
      }
      
      // 닉네임이 있으면 메타데이터에도 저장 (일관성 유지)
      if ('nickname' in profileData) {
        metaDataToUpdate.nickname = profileData.nickname;
      }
      
      // state가 있으면 메타데이터에도 저장 (일관성 유지)
      if ('state' in profileData) {
        metaDataToUpdate.state = profileData.state;
      }
      
      // 메타데이터 업데이트가 필요한 경우에만 실행
      if (Object.keys(metaDataToUpdate).length > 0) {
        const { error: updateError } = await client.auth.updateUser({
          data: metaDataToUpdate
        });
        
        if (updateError) {
          return { error: updateError };
        }
      }
      
      // 2. 프로필 테이블 데이터 업데이트 (닉네임, 상태 등)
      const profileDataToUpdate: Record<string, any> = {};
      
      // nickname이 존재하면 username으로 변환하여 저장
      if ('nickname' in profileData) {
        profileDataToUpdate.username = profileData.nickname;
      }
      
      // state가 존재하면 저장
      if ('state' in profileData) {
        profileDataToUpdate.state = profileData.state;
      }

      // 프로필 데이터가 있으면 업데이트
      if (Object.keys(profileDataToUpdate).length > 0) {
        try {
          // 먼저 사용자 프로필이 존재하는지 확인
          const { data: existingProfile, error: fetchError } = await client
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
          
          if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = 결과가 없음
            console.error("프로필 조회 오류:", fetchError);
            return { error: fetchError };
          }
          
          // 프로필이 없으면 기본값과 함께 생성
          if (!existingProfile) {
            const { error: insertError } = await client
              .from('profiles')
              .insert({ 
                id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...profileDataToUpdate 
              });
            
            if (insertError) {
              console.error("프로필 생성 오류:", insertError);
              return { error: insertError };
            }
          } else {
            // 프로필이 있으면 업데이트만
            const { error: updateError } = await client
              .from('profiles')
              .update({
                ...profileDataToUpdate,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            if (updateError) {
              console.error("프로필 업데이트 오류:", updateError);
              return { error: updateError };
            }
          }
        } catch (profileErr) {
          console.error("프로필 테이블 업데이트 중 예외 발생:", profileErr);
          return { error: profileErr };
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      return { error };
    }
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
