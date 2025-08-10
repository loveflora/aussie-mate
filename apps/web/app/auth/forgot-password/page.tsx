"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "api";
import { LanguageContext } from "../../client-layout";
import styles from "../login/login.module.css"; // Reusing login styles

export default function ForgotPassword() {
  const router = useRouter();
  const { language } = useContext(LanguageContext);
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success" | "info", text: string } | null>(null);
  
  // Translations
  const t = {
    ko: {
      title: "비밀번호 재설정 요청",
      email: "이메일",
      resetButton: "재설정 링크 전송",
      successMessage: "비밀번호 재설정 링크가 이메일로 전송되었습니다. 받은 편지함을 확인해주세요.",
      invalidEmail: "유효한 이메일 주소를 입력해주세요.",
      resetError: "비밀번호 재설정 링크 전송 중 오류가 발생했습니다.",
      backToLogin: "로그인으로 돌아가기"
    },
    en: {
      title: "Forgot Password",
      email: "Email",
      resetButton: "Send Reset Link",
      successMessage: "Password reset link has been sent to your email address. Please check your inbox.",
      invalidEmail: "Please enter a valid email address.",
      resetError: "An error occurred while sending the reset link.",
      backToLogin: "Back to Login"
    }
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({
        type: "error",
        text: t.invalidEmail
      });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const { error } = await authApi.resetPassword(email);
      
      if (error) {
        setMessage({
          type: "error",
          text: error.message || t.resetError
        });
      } else {
        setMessage({
          type: "success",
          text: t.successMessage
        });
        
        // Clear the email input after successful submission
        setEmail("");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: t.resetError
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h1 className={styles.title}>{t.title}</h1>
        
        {message && (
          <div className={
            message.type === 'error' ? styles.errorMessage :
            message.type === 'success' ? styles.successMessage : 
            styles.infoMessage
          }>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">{t.email}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || message?.type === 'success'}
              className={styles.input}
              autoComplete="email"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || message?.type === 'success'}
            className={styles.loginButton}
          >
            {isLoading ? "처리 중..." : t.resetButton}
          </button>
        </form>
        
        <div className={styles.signUpLink} style={{ marginTop: '1.5rem' }}>
          <Link href="/auth/login" className={styles.forgotPassword}>
            {t.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}
