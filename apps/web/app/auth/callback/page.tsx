"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "api";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL
        const hash = window.location.hash;
        const url = window.location.href;
        
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
        if (!hash) {
          router.push("/login");
          return;
        }

        // Get the session
        const { data } = await authApi.getSession();
        
        // If user is authenticated, redirect to home page
        if (data.session) {
          router.push("/");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error handling auth callback:", error);
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">로그인 처리 중...</h2>
        <p className="mt-2">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
}
