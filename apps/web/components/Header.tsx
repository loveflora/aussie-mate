"use client";
import { useState, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { LanguageContext } from "../app/client-layout";
import { useAuth } from "../contexts/AuthContext";

// Header component for navigation and language switching
export default function Header() {
  const pathname = usePathname();
  const { language, setLanguage } = useContext(LanguageContext);
  const { user } = useAuth(); // 사용자 인증 정보 가져오기
  
  // Check if the current path matches the link
  const isActive = (path) => {
    return pathname === path;
  };
  
  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };
  
  // Translations for navigation items
  const t = {
    home: language === 'ko' ? '홈' : 'Home',
    community: language === 'ko' ? '커뮤니티' : 'Community',
    postcodes: language === 'ko' ? '우편번호 찾기' : 'Postcode Finder',
    visaInfo: language === 'ko' ? '마이페이지' : 'My Page',
    language: language === 'ko' ? 'English' : '한국어',
    login: language === 'ko' ? '로그인' : 'Log in',
    signup: language === 'ko' ? '회원가입' : 'Sign up'
  };
  
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/">
            <Image 
              src="/banner.png" 
              alt="Aussie Mate Logo" 
              width={200} 
              height={200} 
              className={styles.logoImage}
              priority
            />
          </Link>
        </div>
        
        <nav className={styles.navigation}>
          {/* <Link 
            href="/" 
            className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}
          >
            {t.home}
          </Link> */}
          <Link 
            href="/community" 
            className={`${styles.navItem} ${isActive('/community') ? styles.active : ''}`}
          >
            {t.community}
          </Link>
          <Link 
            href="/postcode-finder" 
            className={`${styles.navItem} ${isActive('/postcode-finder') ? styles.active : ''}`}
          >
            {t.postcodes}
          </Link>
          <Link 
            href="/mypage"
            className={`${styles.navItem} ${isActive('/mypage') ? styles.active : ''}`}
          >
            {t.visaInfo}
          </Link>

           {/* 언어 전환 버튼 */}
   <button 
            onClick={toggleLanguage} 
            className={styles.languageToggle}
          >
            {t.language}
          </button>
        </nav>
        
        <div className={styles.rightSection}>

  

          {/* 로그인/회원가입 버튼 */}
          <div className={styles.authButtons}>
            <Link href="/auth/login" className={styles.loginButton}>
              {t.login}
            </Link>
            <Link href="/auth/signup" className={styles.signupButton}>
              {t.signup}
            </Link>
          </div>
          
       
        </div>
      </div>
    </header>
  );
}
