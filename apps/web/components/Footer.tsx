import React, { useContext } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import { LanguageContext } from '../app/client-layout';

export default function Footer() {
  // 언어 컨텍스트 사용
  const { language } = useContext(LanguageContext);

  // 다국어 지원
  const t = {
    ko: {
      about: '소개',
      contact: '연락처',
      privacyPolicy: '개인정보 처리방침',
      termsOfService: '이용약관',
      faq: 'FAQ',
      copyright: '© 2025 Aussie Mate. 모든 권리 보유.',
      followUs: '소셜 미디어',
      address: '시드니, 호주',
      helpCenter: '고객센터',
    },
    en: {
      about: 'About',
      contact: 'Contact',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      faq: 'FAQ',
      copyright: '© 2025 Aussie Mate. All rights reserved.',
      followUs: 'Follow Us',
      address: 'Sydney, Australia',
      helpCenter: 'Help Center',
    }
  };

  // 현재 언어에 맞는 번역 선택
  const currentT = language === 'ko' ? t.ko : t.en;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>Aussie Mate</h3>
          <p>{currentT.address}</p>
          <p>info@aussiemate.com</p>
        </div>
        
        <div className={styles.footerSection}>
          <h3>{currentT.followUs}</h3>
          <div className={styles.socialLinks}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <span className={styles.socialIcon}>Facebook</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <span className={styles.socialIcon}>Instagram</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <span className={styles.socialIcon}>Twitter</span>
            </a>
          </div>
        </div>
        
        <div className={styles.footerSection}>
          <h3>{currentT.helpCenter}</h3>
          <ul className={styles.footerLinks}>
            <li>
              <Link href="/about">
                {currentT.about}
              </Link>
            </li>
            <li>
              <Link href="/contact">
                {currentT.contact}
              </Link>
            </li>
            <li>
              <Link href="/faq">
                {currentT.faq}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <div className={styles.legalLinks}>
          <Link href="/privacy-policy">
            {currentT.privacyPolicy}
          </Link>
          <Link href="/terms-of-service">
            {currentT.termsOfService}
          </Link>
        </div>
        <div className={styles.copyright}>
          {currentT.copyright}
        </div>
      </div>
    </footer>
  );
}
