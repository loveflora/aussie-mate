"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LanguageContext } from "../../client-layout";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();
  const { language } = useContext(LanguageContext);
  const { signIn, signInWithProvider } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Translations
  const t = {
    ko: {
      title: "로그인",
      email: "이메일",
      password: "비밀번호",
      loginButton: "로그인",
      forgotPassword: "비밀번호를 잊으셨나요?",
      signUp: "계정이 없으신가요? 가입하기",
      googleLogin: "구글로 로그인",
      facebookLogin: "페이스북으로 로그인",
      appleLogin: "애플로 로그인",
      or: "또는"
    },
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      loginButton: "Login",
      forgotPassword: "Forgot your password?",
      signUp: "Don't have an account? Sign up",
      googleLogin: "Login with Google",
      facebookLogin: "Login with Facebook",
      appleLogin: "Login with Apple",
      or: "OR"
    }
  }[language];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
      // No need to redirect here - the OAuth flow will handle the redirect
    } catch (err: any) {
      setError(err.message || "소셜 로그인 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };
  
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h1 className={styles.title}>{t?.title}</h1>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">{t?.email}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className={styles.input}
            />
          </div>
          
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
            />
          </div>
          
          <Link href="/auth/forgot-password" className={styles.forgotPassword}>
            {t.forgotPassword}
          </Link>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={styles.loginButton}
          >
            {isLoading ? "로딩 중..." : t?.loginButton}
          </button>
        </form>
        
        <div className={styles.divider}>
          <span>{t?.or}</span>
        </div>
        
        <div className={styles.socialButtons}>
          <button 
            onClick={() => handleSocialLogin('google')} 
            disabled={isLoading}
            className={`${styles.socialButton} ${styles.googleButton}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            {t.googleLogin}
          </button>
          
          <button 
            onClick={() => handleSocialLogin('facebook')} 
            disabled={isLoading}
            className={`${styles.socialButton} ${styles.facebookButton}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {t.facebookLogin}
          </button>
          
          <button 
            onClick={() => handleSocialLogin('apple')} 
            disabled={isLoading}
            className={`${styles.socialButton} ${styles.appleButton}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 384 512">
              <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            {t.appleLogin}
          </button>
        </div>
        
        <div className={styles.signUpLink}>
          <Link href="/auth/signup">
            {t.signUp}
          </Link>
        </div>
      </div>
    </div>
  );
}
