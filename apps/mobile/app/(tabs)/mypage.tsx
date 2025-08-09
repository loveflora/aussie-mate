import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  useColorScheme
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

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
      link: "/community",
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

export default function MyPageScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [language, setLanguage] = useState('ko'); // 언어 설정 (실제로는 앱 전체 설정에서 가져와야 함)
  const { user } = useAuth(); // 사용자 인증 정보 가져오기

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
      dataManagement: "데이터 관리",
      downloadData: "내 데이터 다운로드",
      deleteAccount: "계정 삭제",
      logout: "로그아웃",
      on: "켜짐",
      off: "꺼짐",
      manage: "관리",
      download: "다운로드",
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
      downloadData: "Download My Data",
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

  // 수정 페이지로 이동
  const handleEditProfile = () => {
    router.push('/mypage/edit');
  };

  // 비자 진행 바 너비 계산
  const progressWidth = `${mockUser.visaInfo.percentComplete}%`;

  // 설정 항목 렌더링 함수
  const renderSettingItem = (label, value, onPress) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </TouchableOpacity>
  );

  // 활동 항목 아이콘 선택 함수
  const getActivityIcon = (iconName) => {
    switch (iconName) {
      case 'chatbubble':
        return '💬';
      case 'document-text':
        return '📄';
      case 'map':
        return '🗺️';
      default:
        return '📌';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.myPage}</Text>
        </View>

        {/* 로그인이 필요한 경우 로그인/회원가입 버튼 표시 */}
        {!user ? (
          <View style={styles.card}>
            <Text style={styles.loginMessage}>
              {language === 'ko' ? '로그인이 필요합니다.' : 'Login required.'}
            </Text>
            <TouchableOpacity 
              style={styles.authButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.authButtonText}>
                {language === 'ko' ? '로그인' : 'Login'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.authButton, styles.signupButton]}
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={styles.authButtonText}>
                {language === 'ko' ? '회원가입' : 'Sign up'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 로그인한 경우 기존 프로필 표시 */
          <View style={styles.card}>
            <View style={styles.profileSection}>
              <View style={styles.profileImage}>
                <Text style={styles.profileImageText}>👤</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.username}>{mockUser.username}</Text>
                <Text style={styles.email}>{mockUser.email}</Text>
                <Text style={styles.memberSince}>
                  {t.memberSince}: {mockUser.memberSince}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editButtonText}>{t.edit}</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* 비자 정보 섹션 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.visaInformation}</Text>
          
          {/* 진행 상태 바 */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                {width: mockUser.visaInfo.percentComplete + '%'}
              ]}
            />
          </View>
          
          <View style={styles.visaInfoGrid}>
            <View style={styles.visaItem}>
              <Text style={styles.visaLabel}>{t.visaType}</Text>
              <Text style={styles.visaValue}>{mockUser.visaInfo.type}</Text>
            </View>
            
            <View style={styles.visaItem}>
              <Text style={styles.visaLabel}>{t.visaStatus}</Text>
              <Text style={styles.visaValue}>{mockUser.visaInfo.status}</Text>
            </View>
            
            <View style={styles.visaItem}>
              <Text style={styles.visaLabel}>{t.visaStartDate}</Text>
              <Text style={styles.visaValue}>{mockUser.visaInfo.startDate}</Text>
            </View>
            
            <View style={styles.visaItem}>
              <Text style={styles.visaLabel}>{t.visaEndDate}</Text>
              <Text style={styles.visaValue}>{mockUser.visaInfo.endDate}</Text>
            </View>
            
            <View style={styles.visaItem}>
              <Text style={styles.visaLabel}>{t.daysRemaining}</Text>
              <Text style={styles.visaValue}>
                {mockUser.visaInfo.remainingDays} {t.days}
              </Text>
            </View>
          </View>
        </View>
        
        {/* 활동 내역 섹션 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.recentActivities}</Text>
          <View style={styles.activitiesList}>
            {mockUser.activities.map((activity) => (
              <TouchableOpacity 
                key={activity.id} 
                style={styles.activityItem}
                onPress={() => router.push(activity.link)}
              >
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>
                    {getActivityIcon(activity.icon)}
                  </Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.text}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 설정 섹션 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.settings}</Text>
          <View style={styles.settingsList}>
            {renderSettingItem(
              t.notifications,
              t.on,
              () => Alert.alert('알림 설정', '알림 설정을 변경하시겠습니까?')
            )}
            
            {renderSettingItem(
              t.language,
              language === 'ko' ? '한국어' : 'English',
              () => setLanguage(language === 'ko' ? 'en' : 'ko')
            )}
            
            {renderSettingItem(
              t.darkMode,
              t.off,
              () => Alert.alert('다크 모드', '다크 모드를 변경하시겠습니까?')
            )}
            
            {renderSettingItem(
              t.privacySettings,
              t.manage,
              () => Alert.alert('개인정보 설정', '개인정보 설정을 변경하시겠습니까?')
            )}
            
      
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => Alert.alert('로그아웃', '로그아웃 하시겠습니까?')}
          >
            <Text style={styles.logoutButtonText}>{t.logout}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileImageText: {
    fontSize: 30,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#888',
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  visaInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  visaItem: {
    width: '50%',
    padding: 6,
  },
  visaItemInner: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  visaLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  visaValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#888',
  },
  settingsList: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    color: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loginMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  authButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  authButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#34C759',
  },
});
