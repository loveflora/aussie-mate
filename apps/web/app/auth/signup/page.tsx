"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LanguageContext } from "../../client-layout";
import { useAuth } from "../../../contexts/AuthContext";
import { authApi } from "api";
import styles from "./signup.module.css";

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useContext(LanguageContext);
  const { signUp, signInWithProvider } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingSending, setIsVerifyingSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<{ type: "error" | "success" | "info", text: string } | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Translations
  const translations = {
    ko: {
      title: "회원가입",
      email: "이메일",
      password: "비밀번호",
      confirmPassword: "비밀번호 확인",
      state: "거주 지역(주)",
      statePlaceholder: "거주 중인 호주 주를 선택해주세요",
      signUpButton: "가입하기",
      verifyButton: "이메일 인증하기",
      verified: "인증 완료",
      verifySuccess: "인증 메일이 발송되었습니다. 이메일을 확인해주세요.",
      verifyError: "인증 메일 발송 중 오류가 발생했습니다.",
      verifyComplete: "이메일 인증이 완료되었습니다.",
      verifyRequired: "이메일 인증이 필요합니다. 이메일 인증을 완료해주세요.",
      emailExists: "이미 가입된 이메일입니다. 로그인해 주세요.",
      passwordMismatch: "비밀번호가 일치하지 않습니다.",
      googleSignUp: "구글로 가입하기",
      facebookSignUp: "페이스북으로 가입하기",
      appleSignUp: "애플로 가입하기",
      or: "또는",
      login: "이미 계정이 있으신가요? 로그인"
    },
    en: {
      title: "Sign Up",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      state: "Residential State",
      statePlaceholder: "Select your Australian state",
      signUpButton: "Sign Up",
      verifyButton: "Verify Email",
      verified: "Verified",
      verifySuccess: "Verification email has been sent. Please check your inbox.",
      verifyError: "Failed to send verification email.",
      verifyComplete: "Email verification complete.",
      verifyRequired: "Email verification required. Please verify your email before signing up.",
      emailExists: "Email already registered. Please log in.",
      passwordMismatch: "Passwords don't match",
      googleSignUp: "Sign up with Google",
      facebookSignUp: "Sign up with Facebook",
      appleSignUp: "Sign up with Apple",
      or: "OR",
      login: "Already have an account? Log in"
    }
  };

  const t = language === "ko" ? translations.ko : translations.en;

  // 페이지 로드 시 URL 파라미터 체크
  useEffect(() => {
    const verified = searchParams.get('verified');
    const verifiedEmail = searchParams.get('email');
    
    if (verified === 'true' && verifiedEmail) {
      setEmail(verifiedEmail);
      setIsEmailVerified(true);
      setVerifyMessage({
        type: "success",
        text: t.verifyComplete || "Email verification complete."
      });
    }
    
    // 인증 상태 체크를 위한 함수
    const checkVerificationStatus = async () => {
      const { verified } = await authApi.checkEmailVerificationStatus();
      if (verified) {
        setIsEmailVerified(true);
        setVerifyMessage({
          type: "success",
          text: t.verifyComplete || "Email verification complete."
        });
      }
    };
    
    // 로그인 상태라면 이메일 인증 상태 확인
    if (email) {
      checkVerificationStatus();
    }
  }, [searchParams, t.verifyComplete]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // 이메일 인증 확인
    if (!isEmailVerified) {
      setError(t.verifyRequired || "Please verify your email first.");
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError(t.passwordMismatch || "Passwords do not match.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, { state });
      
      if (error) {
        setError(error.message);
      } else {
        // 가입 완료 후 홈페이지로 리다이렉트
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialSignUp = async (provider: 'google' | 'facebook' | 'apple') => {
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
  
  // 이메일 인증 메일 발송
  const handleSendVerification = async () => {
    // 이메일 형식 검사
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("유효한 이메일 주소를 입력해주세요.");
      return;
    }
    
    setIsVerifyingSending(true);
    setError(null);
    
    try {
      // 이메일 중복 확인
      const { exists, error: existsError } = await authApi.checkEmailExists(email);
      
      if (existsError) {
        setError(existsError.message);
        return;
      }
      
      if (exists) {
        // 이미 가입된 이메일인 경우 오류를 표시하는 대신 메시지로 알림
        setVerifyMessage({ 
          type: "info", 
          text: t.emailExists || "This email is already registered."
        });
        return;
      }
      
      // 인증 메일 발송
      const { error } = await authApi.sendEmailVerification(email);
      
      if (error) {
        setError(error.message || t.verifyError || "Error sending verification email.");
        setVerifyMessage({ type: "error", text: t.verifyError || "Error sending verification email." });
      } else {
        setVerifyMessage({ type: "success", text: t.verifySuccess || "Verification email sent. Please check your inbox." });
        // 3초 후 성공 메시지 숨김
        setTimeout(() => setVerifyMessage(null), 3000);
      }
    } catch (error: any) {
      setError(error.message || t.verifyError || "Error sending verification email.");
      setVerifyMessage({ type: "error", text: t.verifyError || "Error sending verification email." });
    } finally {
      setIsVerifyingSending(false);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupForm}>
        <h1 className={styles.title}>{t.title || "Sign Up"}</h1>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        {verifyMessage && (
          <div className={
            verifyMessage.type === 'error' ? styles.errorMessage : 
            verifyMessage.type === 'success' ? styles.successMessage :
            styles.infoMessage
          }>
            {verifyMessage.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">{t.email || "Email"}</label>
            <div className={styles.emailVerifyGroup}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // 이메일이 변경되면 인증 상태 리셋
                  if (isEmailVerified) {
                    setIsEmailVerified(false);
                    setVerifyMessage(null);
                  }
                }}
                required
                disabled={isLoading}
                className={styles.input}
              />
              {isEmailVerified ? (
                <span className={styles.verifiedBadge}>
                  {t.verified || "Verified"}
                </span>
              ) : (
                <button 
                  type="button"
                  onClick={handleSendVerification}
                  disabled={isVerifyingSending || !email}
                  className={styles.verifyButton}
                >
                  {isVerifyingSending ? "..." : t.verifyButton || "Verify Email"}
                </button>
              )}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">{t.password || "Password"}</label>
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
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">{t.confirmPassword || "Confirm Password"}</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="state">{t.state || "Residential State"}</label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={isLoading}
              className={styles.input}
            >
              <option value="">{t.statePlaceholder || "Select your Australian state"}</option>
              <option value="NSW">New South Wales (NSW)</option>
              <option value="VIC">Victoria (VIC)</option>
              <option value="QLD">Queensland (QLD)</option>
              <option value="SA">South Australia (SA)</option>
              <option value="WA">Western Australia (WA)</option>
              <option value="TAS">Tasmania (TAS)</option>
              <option value="NT">Northern Territory (NT)</option>
              <option value="ACT">Australian Capital Territory (ACT)</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={styles.signupButton}
          >
            {isLoading ? "로딩 중..." : t.signUpButton || "Sign Up"}
          </button>
        </form>
        
        {/* <div className={styles.divider}>
          <span>{t.or || "OR"}</span>
        </div> */}
        
        {/* <div className={styles.socialButtons}>
          <button 
            onClick={() => handleSocialSignUp('google')} 
            disabled={isLoading}
            className={`${styles.socialButton} ${styles.googleButton}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            {t.googleSignUp || "Sign up with Google"}
          </button>
          
          <button 
            onClick={() => handleSocialSignUp('facebook')} 
            disabled={isLoading}
            className={`${styles.socialButton} ${styles.facebookButton}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {t.facebookSignUp || "Sign up with Facebook"}
          </button>
          
          <button 
            onClick={() => handleSocialSignUp('apple')} 
            disabled={isLoading}
            className={`${styles.socialButton} ${styles.appleButton}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 384 512">
              <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            {t.appleSignUp || "Sign up with Apple"}
          </button>
        </div> */}
        
        <div className={styles.loginLink}>
          <Link href="/auth/login">
            {t.login || "Already have an account? Log in"}
          </Link>
        </div>
      </div>
    </div>
  );
}
