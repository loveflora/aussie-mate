"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { LanguageContext } from "../client-layout";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

// 테스트용 사용자 데이터
const mockUser = {
  username: "김호주",
  email: "kim@example.com",
  memberSince: "2025-01-15",
  profileImage: null,
  visaInfo: {
    type: "Working Holiday (417)",
    startDate: "2025-01-20",
    endDate: "2026-01-19",
    status: "Active",
    remainingDays: 163,
    totalDays: 365,
    percentComplete: 55,
  },
  activities: [
    {
      id: 1,
      type: "community",
      text: "커뮤니티에 새 글을 작성했습니다.",
      link: "/community/1",
      time: "2시간 전",
      icon: "chatbubble",
    },
    {
      id: 2,
      type: "visa",
      text: "비자 정보를 업데이트했습니다.",
      link: "/visa",
      time: "3일 전",
      icon: "document-text",
    },
    {
      id: 3,
      type: "location",
      text: "새 주소를 등록했습니다: 시드니 CBD",
      link: "/postcode-finder",
      time: "1주일 전",
      icon: "map",
    },
  ],
};

export default function MyPage() {
  // 글로벌 언어 컨텍스트 사용
  const { language } = useContext(LanguageContext);
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth(); // 인증 컨텍스트 사용
  const [showLogoutModal, setShowLogoutModal] = useState(false); // 로그아웃 모달 상태
  const [logoutLoading, setLogoutLoading] = useState(false); // 로그아웃 로딩 상태
  
  // 수정 페이지로 이동하는 함수
  const handleEditClick = () => {
    router.push("/mypage/edit");
  };
  
  // 로그아웃 모달 표시 함수
  const showLogoutConfirmation = () => {
    setShowLogoutModal(true);
  };
  
  // 로그아웃 모달 닫기 함수
  const hideLogoutModal = () => {
    setShowLogoutModal(false);
  };
  
  // 로그아웃 처리 함수
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error("Logout error:", error);
        alert(language === 'ko' ? "로그아웃 중 오류가 발생했습니다." : "Error during logout.");
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert(language === 'ko' ? "로그아웃 중 오류가 발생했습니다." : "Error during logout.");
    } finally {
      setLogoutLoading(false);
      hideLogoutModal();
    }
  };

  // 번역 텍스트
  const translations = {
    ko: {
      myPage: "마이페이지",
      profile: "프로필",
      edit: "수정",
      memberSince: "가입일",
      visaInformation: "비자 정보",
      visaType: "비자 종류",
      visaStartDate: "시작일",
      visaEndDate: "만료일",
      visaStatus: "상태",
      daysRemaining: "남은 기간",
      days: "일",
      recentActivities: "최근 활동",
      settings: "설정",
      notifications: "알림 설정",
      language: "언어",
      darkMode: "다크 모드",
      privacySettings: "개인정보 설정",
      deleteAccount: "계정 삭제",
      logout: "로그아웃",
      on: "켜짐",
      off: "꺼짐",
      manage: "관리",
      download: "Download",
    },
    en: {
      myPage: "My Page",
      profile: "Profile",
      edit: "Edit",
      memberSince: "Member since",
      visaInformation: "Visa Information",
      visaType: "Visa Type",
      visaStartDate: "Start Date",
      visaEndDate: "End Date",
      visaStatus: "Status",
      daysRemaining: "Days Remaining",
      days: "days",
      recentActivities: "Recent Activities",
      settings: "Settings",
      notifications: "Notifications",
      language: "Language",
      darkMode: "Dark Mode",
      privacySettings: "Privacy Settings",
      dataManagement: "Data Management",
      deleteAccount: "Delete Account",
      logout: "Log Out",
      on: "On",
      off: "Off",
      manage: "Manage",
      download: "Download",
    }
  };

  // 현재 언어에 맞는 번역 선택
  const t = translations[language];

  // 비자 진행 바 너비 계산
  const progressWidth = `${mockUser.visaInfo.percentComplete}%`;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* 프로필 섹션 */}
        <div className={styles.profileSection}>
          <div className={styles.profileImage}>
            {mockUser.profileImage ? (
              <img src={mockUser.profileImage} alt="Profile" />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.username}>{mockUser.username}</h1>
            <p className={styles.email}>{user?.email || mockUser.email}</p>
            <p className={styles.memberSince}>
              {t.memberSince}: {mockUser.memberSince}
            </p>
          </div>
          <button onClick={handleEditClick} className={styles.editButton}>
            {t.edit}
          </button>
        </div>

        {/* 비자 정보 섹션 */}
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>{t.visaInformation}</h2>
          
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: progressWidth }}></div>
          </div>
          
          <div className={styles.visaInfo}>
            <div className={styles.visaDetail}>
              <p className={styles.visaLabel}>{t.visaType}</p>
              <p className={styles.visaValue}>{mockUser.visaInfo.type}</p>
            </div>
            
            <div className={styles.visaDetail}>
              <p className={styles.visaLabel}>{t.visaStatus}</p>
              <p className={styles.visaValue}>{mockUser.visaInfo.status}</p>
            </div>
            
            <div className={styles.visaDetail}>
              <p className={styles.visaLabel}>{t.visaStartDate}</p>
              <p className={styles.visaValue}>{mockUser.visaInfo.startDate}</p>
            </div>
            
            <div className={styles.visaDetail}>
              <p className={styles.visaLabel}>{t.visaEndDate}</p>
              <p className={styles.visaValue}>{mockUser.visaInfo.endDate}</p>
            </div>
            
            <div className={styles.visaDetail}>
              <p className={styles.visaLabel}>{t.daysRemaining}</p>
              <p className={styles.visaValue}>
                {mockUser.visaInfo.remainingDays} {t.days}
              </p>
            </div>
          </div>
        </div>

        {/* 활동 내역 섹션 */}
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>{t.recentActivities}</h2>
          <div className={styles.activityList}>
            {mockUser.activities.map((activity) => (
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
        </div>

        {/* 설정 섹션 */}
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>{t.settings}</h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>{t.notifications}</span>
              <span className={styles.settingAction}>{t.on}</span>
            </div>
            
            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>{t.language}</span>
              <span className={styles.settingAction}>{language === 'ko' ? '한국어' : 'English'}</span>
            </div>
            
            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>{t.darkMode}</span>
              <span className={styles.settingAction}>{t.off}</span>
            </div>
            
            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>{t.privacySettings}</span>
              <span className={styles.settingAction}>{t.manage}</span>
            </div>
            
            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>{t.dataManagement}</span>
              <span className={styles.settingAction}>{t.download}</span>
            </div>
          </div>
          
          <button 
            onClick={showLogoutConfirmation} 
            className={styles.logoutButton}
          >
            {t.logout}
          </button>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>
              {language === 'ko' ? '로그아웃' : 'Logout'}
            </h3>
            <p className={styles.modalText}>
              {language === 'ko' 
                ? '정말 로그아웃 하시겠습니까?' 
                : 'Are you sure you want to log out?'}
            </p>
            <div className={styles.modalButtons}>
              <button 
                className={`${styles.modalButton} ${styles.cancelButton}`}
                onClick={hideLogoutModal}
                disabled={logoutLoading}
              >
                {language === 'ko' ? '취소' : 'Cancel'}
              </button>
              <button 
                className={`${styles.modalButton} ${styles.confirmButton}`}
                onClick={handleLogout}
                disabled={logoutLoading}
              >
                {logoutLoading 
                  ? (language === 'ko' ? '처리 중...' : 'Processing...') 
                  : (language === 'ko' ? '로그아웃' : 'Logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
