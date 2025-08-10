"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "api";
import { LanguageContext } from "../../client-layout";
import styles from "../login/login.module.css"; // Reusing login styles

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useContext(LanguageContext);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success" | "info", text: string } | null>(null);
  const token = searchParams.get('token') || '';
  
  // Translations
  const t = {
    ko: {
      title: "비밀번호 재설정",
      password: "새 비밀번호",
      confirmPassword: "비밀번호 확인",
      resetButton: "비밀번호 재설정",
      passwordMismatch: "비밀번호가 일치하지 않습니다.",
      passwordRequirements: "비밀번호는 최소 8자 이상이어야 합니다.",
      success: "비밀번호가 성공적으로 재설정되었습니다!",
      loginLink: "로그인 페이지로 이동",
      invalidToken: "유효하지 않거나 만료된 토큰입니다. 비밀번호 재설정을 다시 요청해주세요.",
      verifyingToken: "토큰을 확인하는 중입니다...",
      resetError: "비밀번호 재설정 중 오류가 발생했습니다. 다시 시도해주세요.",
      backToLogin: "로그인으로 돌아가기"
    },
    en: {
      title: "Reset Password",
      password: "New Password",
      confirmPassword: "Confirm Password",
      resetButton: "Reset Password",
      passwordMismatch: "Passwords do not match.",
      passwordRequirements: "Password must be at least 8 characters long.",
      success: "Your password has been successfully reset!",
      loginLink: "Go to Login",
      invalidToken: "Invalid or expired token. Please request a new password reset.",
      verifyingToken: "Verifying token...",
      resetError: "An error occurred while resetting your password. Please try again.",
      backToLogin: "Back to Login"
    }
  }[language];

  // Verify token validity on page load
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setMessage({
        type: "error",
        text: t.invalidToken
      });
      return;
    }

    setMessage({
      type: "info",
      text: t?.verifyingToken
    });
    
    // Here we would typically verify the token validity
    // For now, we'll just assume it's valid if it exists
    setIsTokenValid(true);
    setMessage(null);
  }, [token, t?.invalidToken, t?.verifyingToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password.length < 8) {
      setMessage({
        type: "error",
        text: t.passwordRequirements
      });
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: t.passwordMismatch
      });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const { error } = await authApi.verifyRecovery(token, password);
      
      if (error) {
        setMessage({
          type: "error",
          text: error?.message || t?.resetError
        });
      } else {
        setMessage({
          type: "success",
          text: t?.success
        });
        
        // Redirect to login page after successful reset
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: t?.resetError
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h1 className={styles.title}>{t?.title}</h1>
        
        {message && (
          <div className={
            message.type === 'error' ? styles.errorMessage :
            message.type === 'success' ? styles.successMessage : 
            styles.infoMessage
          }>
            {message.text}
          </div>
        )}
        
        {isTokenValid && !message?.type?.includes("success") ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="password">{t?.password}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={styles.input}
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">{t?.confirmPassword}</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className={styles.input}
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className={styles.loginButton}
            >
              {isLoading ? "처리 중..." : t?.resetButton}
            </button>
          </form>
        ) : (
          message?.type === "success" && (
            <div className={styles.successState} style={{ textAlign: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <p style={{ color: '#4CAF50', fontSize: '1.2em', margin: '15px 0' }}>{message.text}</p>
              <div style={{ marginTop: '20px' }}>
                <Link href="/auth/login" className={styles.loginButton}>
                  {t?.loginLink}
                </Link>
              </div>
            </div>
          )
        )}
        
        {!isTokenValid && (
          <div className={styles.backToLogin} style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/auth/login" className={styles.forgotPassword}>
              {t.backToLogin}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
