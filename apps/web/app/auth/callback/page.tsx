"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "api";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL
        const hash = window.location.hash;
        
        // If there is no hash, redirect to login page
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
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">로그인 처리 중...</h2>
        <p className="mt-2">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
}
