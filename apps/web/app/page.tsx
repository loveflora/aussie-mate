"use client";

import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import { useContext } from "react";
import Link from "next/link";
import { LanguageContext } from "./client-layout";

// UI text translations
const translations = {
  en: {
    welcome: "Hello!",
    visaProgress: "Working Holiday Visa Progress",
    daysRemaining: "Days remaining:",
    updateVisaInfo: "Update Visa Information",
    quickMenu: "Quick Menu",
    recentActivity: "Recent Activity",
    viewMore: "View More",
    didYouKnow: "Did You Know?",
    sydneyInfo: "Sydney, Australia is known as one of the world's most beautiful natural harbors, famous for landmarks like the Opera House and Harbour Bridge. Sydney is also a place where you can experience diverse cultures and food, and is home to many Korean residents.",
    postcodeFinderTitle: "Postcode Finder",
    postcodeFinderDesc: "Find postcodes with Australian addresses",
    communityTitle: "Community",
    communityDesc: "Connect with other Koreans in Australia",
    visaGuideTitle: "Visa Guide",
    visaGuideDesc: "Visa information and application guides",
    koreanServicesTitle: "Korean Services",
    koreanServicesDesc: "Find Korean services near you",
    visaAlert: "Visa renewal notification has arrived",
    commentAlert: "A comment has been added to your community post",
    searchAlert: "You performed a Sydney postcode search",
    hoursAgo: "2 hours ago",
    hoursAgo2: "4 hours ago",
    yesterday: "Yesterday",
  },
  ko: {
    welcome: "안녕하세요!",
    visaProgress: "워킹 홀리데이 비자 진행 상황",
    daysRemaining: "남은 기간:",
    updateVisaInfo: "비자 정보 업데이트",
    quickMenu: "빠른 메뉴",
    recentActivity: "최근 활동",
    viewMore: "더보기",
    didYouKnow: "알고 계셨나요?",
    sydneyInfo: "호주 시드니는 세계에서 가장 아름다운 자연 항구 중 하나로 꼽히며, 오페라 하우스와 하버 브릿지 같은 랜드마크로 유명합니다. 시드니는 또한 다양한 문화와 음식을 체험할 수 있는 곳으로, 많은 한국인들이 거주하고 있는 도시이기도 합니다.",
    postcodeFinderTitle: "우편번호 찾기",
    postcodeFinderDesc: "호주 주소로 우편번호를 찾아보세요",
    communityTitle: "커뮤니티",
    communityDesc: "다른 호주 한인들과 소통하세요",
    visaGuideTitle: "비자 가이드",
    visaGuideDesc: "비자 정보 및 신청 가이드",
    koreanServicesTitle: "한인 서비스",
    koreanServicesDesc: "주변 한인 서비스를 찾아보세요",
    visaAlert: "비자 갱신 알림이 도착했습니다",
    commentAlert: "커뮤니티 게시글에 댓글이 달렸습니다",
    searchAlert: "시드니 우편번호 검색을 수행했습니다",
    hoursAgo: "2시간 전",
    hoursAgo2: "4시간 전",
    yesterday: "어제",
  }
};

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  // 글로벌 언어 컨텍스트 사용
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  
  // Mock data for visa progress
  const visaProgress = {
    daysCompleted: 182,
    totalDays: 365,
    remainingDays: 183,
    percentComplete: 50,
  };

  // Mock data for recent activities
  const recentActivities = [
    { 
      id: 1, 
      icon: 'document-text', 
      text: t.visaAlert, 
      time: t.hoursAgo
    },
    { 
      id: 2, 
      icon: 'chatbubble', 
      text: t.commentAlert, 
      time: t.hoursAgo2
    },
    { 
      id: 3, 
      icon: 'map', 
      text: t.searchAlert, 
      time: t.yesterday
    },
  ];

  // Feature cards data
  const features = [
    {
      id: 1,
      title: t.postcodeFinderTitle,
      description: t.postcodeFinderDesc,
      icon: '🔍',
      color: '#E3F2FD',
      iconColor: '#2196F3',
      route: '/postcode-finder',
    },
    {
      id: 2,
      title: t.communityTitle,
      description: t.communityDesc,
      icon: '👥',
      color: '#E8F5E9',
      iconColor: '#4CAF50',
      route: '/community',
    },
    {
      id: 3,
      title: t.visaGuideTitle,
      description: t.visaGuideDesc,
      icon: '📄',
      color: '#FFF3E0',
      iconColor: '#FF9800',
      route: '/visa-guide',
    },
    {
      id: 4,
      title: t.koreanServicesTitle,
      description: t.koreanServicesDesc,
      icon: '📍',
      color: '#F3E5F5',
      iconColor: '#9C27B0',
      route: '/korean-services',
    },
  ];

  // Calculate progress percentage
  const progressWidth = `${visaProgress.percentComplete}%`;

  return (
    <div className={styles.scrollContainer}>
      {/* Visa Progress Section */}
      {/* <div className={styles.progressCard}>
        <h2 className={styles.progressTitle}>{t.visaProgress}</h2>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar} style={{ width: progressWidth, backgroundColor: "#007AFF" }}></div>
        </div>
        
        <div>
          <div className={styles.progressTextRow}>
            <span className={styles.daysLabel}>{t.daysRemaining}</span>
            <span className={styles.progressDays}>{visaProgress.remainingDays}</span>
            <span className={styles.progressTotal}>/ {visaProgress.totalDays}</span>
          </div>
          <button className={styles.progressButton}>{t.updateVisaInfo}</button>
        </div>
      </div> */}

      {/* Quick Menu Section */}
      <h2 className={styles.sectionTitle}>{t.quickMenu}</h2>
      <div className={styles.featuresGrid}>
        {features.map((feature) => (
          <Link href={feature.route} key={feature.id} className={styles.featureCard} style={{ backgroundColor: feature.color }}>
            <div className={styles.iconContainer} style={{ backgroundColor: feature.iconColor }}>
              {feature.icon}
            </div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className={styles.activitySection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 className={styles.sectionTitle} style={{ margin: '0' }}>{t.recentActivity}</h2>
          <button className={styles.viewMoreButton}>
            {t.viewMore}
          </button>
        </div>
        {recentActivities.map((activity) => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={styles.activityIcon}>
              {activity.icon === 'document-text' ? '📄' : 
              activity.icon === 'chatbubble' ? '💬' : '🗺️'}
            </div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>{activity.text}</p>
              <span className={styles.activityTime}>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className={styles.infoCard}>
        <h3 className={styles.infoTitle}>{t.didYouKnow}</h3>
        <p className={styles.infoText}>{t.sydneyInfo}</p>
      </div>
    </div>
  );
}
