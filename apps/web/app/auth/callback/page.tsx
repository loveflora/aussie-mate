"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "api";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash and URL only in browser context
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const url = typeof window !== 'undefined' ? window.location.href : '';
        
        console.log('Auth Callback - URL:', url);
        console.log('Auth Callback - Hash:', hash);
        
        // 이메일 인증 처리
        const type = searchParams.get('type');
        if (type === 'recovery' || type === 'signup' || type === 'email' || url.includes('verify-email')) {
          // 이메일 인증인 경우 가입 페이지로 직접 리다이렉트
          const token = hash.includes('access_token=') ? 
            new URLSearchParams(hash.substring(1)).get('access_token') : 
            searchParams.get('token');
          
          // 이메일 정보 가져오기 시도
          if (token) {
            try {
              const { email } = await authApi.verifyEmailSignup(token);
              if (email) {
                router.push(`/auth/signup?verified=true&email=${encodeURIComponent(email)}`);
              } else {
                // 이메일을 확인할 수 없는 경우 기본 리다이렉트
                router.push('/auth/signup?verified=true');
              }
              return;
            } catch (err) {
              // 토큰 처리 실패 시 기본 페이지로 이동
              router.push('/auth/signup');
              return;
            }
          }
        }
        
        // 일반 OAuth 콜백 처리
        if (!hash && !url.includes('provider=')) {
          setError('인증 정보를 찾을 수 없습니다.');
          router.push("/auth/login");
          return;
        }

        // Get the session
        const { data, error: sessionError } = await authApi.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('로그인 처리 중 오류가 발생했습니다.');
          router.push("/auth/login");
          return;
        }
        
        // If user is authenticated
        if (data.session) {
          // 사용자 메타데이터 확인
          const userMetadata = data.session.user?.user_metadata || {};
          const isNewUser = !userMetadata.hasOwnProperty('profile_completed');
          const isProfileCompleted = userMetadata.profile_completed === true;
          // 계정 삭제 여부 확인
          const wasAccountDeleted = userMetadata.account_deleted === true;
          
          console.log('User metadata:', userMetadata);
          console.log('Is new user:', isNewUser);
          console.log('Profile completed status:', isProfileCompleted);
          console.log('Was account deleted:', wasAccountDeleted);
          
          // 이전에 삭제된 계정이면 프로필을 다시 작성하도록 설정
          if (wasAccountDeleted) {
            console.log('삭제 후 재가입한 소셜 계정 감지: 프로필 재설정 필요');
            try {
              await authApi.updateUserProfile({
                profile_completed: false,
                account_deleted: false // 삭제 표시 제거
              });
              console.log('프로필 재설정 상태로 변경 완료');
              router.push("/auth/complete-profile");
              return;
            } catch (err) {
              console.error('삭제된 계정 처리 중 오류:', err);
            }
          }
          
          // 새 소셜 로그인 사용자면 profile_completed=false 설정
          if (isNewUser) {
            console.log('새 소셜 로그인 사용자 감지: 프로필 완성 상태 설정');
            try {
              await authApi.updateUserProfile({
                profile_completed: false
              });
              console.log('프로필 완성 상태 설정 완료');
              router.push("/auth/complete-profile");
              return;
            } catch (err) {
              console.error('프로필 상태 설정 중 오류:', err);
            }
          }
          
          // 프로필이 완성되지 않은 사용자면 프로필 완성 페이지로 리다이렉트
          if (!isProfileCompleted) {
            console.log('프로필 미완성 사용자: 프로필 완성 페이지로 이동');
            router.push("/auth/complete-profile");
          } else {
            // 기존 사용자는 홈페이지로 리다이렉트
            console.log('프로필 완성된 사용자: 홈으로 이동');
            router.push("/");
          }
        } else {
          setError('세션 정보를 찾을 수 없습니다.');
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Error handling auth callback:", error);
        setError('인증 처리 중 오류가 발생했습니다.');
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {loading && (
          <>
            <h2 className="text-xl font-semibold">로그인 처리 중...</h2>
            <p className="mt-2">잠시만 기다려 주세요.</p>
          </>
        )}
        {error && (
          <p className="text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
