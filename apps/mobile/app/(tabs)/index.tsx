import { StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

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

export default function HomeScreen() {
  const [language, setLanguage] = useState('ko'); // 'ko' for Korean, 'en' for English
  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };
  
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
      icon: 'map',
      color: '#E3F2FD',
      iconColor: '#2196F3',
      route: '/postcode-finder',
    },
    {
      id: 2,
      title: t.communityTitle,
      description: t.communityDesc,
      icon: 'people',
      color: '#E8F5E9',
      iconColor: '#4CAF50',
      route: '/community',
    },
    {
      id: 3,
      title: t.visaGuideTitle,
      description: t.visaGuideDesc,
      icon: 'document-text',
      color: '#FFF3E0',
      iconColor: '#FF9800',
      route: '/visa-guide',
    },
    {
      id: 4,
      title: t.koreanServicesTitle,
      description: t.koreanServicesDesc,
      icon: 'location',
      color: '#F3E5F5',
      iconColor: '#9C27B0',
      route: '/korean-services',
    },
  ];

  // Calculate progress percentage
  const progressWidth = `${visaProgress.percentComplete}%`;

  // Render feature card
  const renderFeatureCard = (feature) => (
    <Link key={feature.id} href={feature.route} asChild>
      <TouchableOpacity style={styles.featureCard}>
        <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
          <IconSymbol name={feature.icon} size={24} color={feature.iconColor} />
        </View>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </TouchableOpacity>
    </Link>
  );

  // Render activity item
  const renderActivityItem = (activity) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <IconSymbol name={activity.icon} size={20} color="#666" />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>{activity.text}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>{t.welcome}</Text>
          <Text style={styles.title}>Aussie Mate</Text>
        </View>
        <View style={styles.languageToggle}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
            <Text style={styles.languageButtonText}>{language === 'ko' ? 'English' : '한국어'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Visa Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>{t.visaProgress}</Text>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressDays}>{visaProgress.daysCompleted}</Text>
            <Text style={styles.progressTotal}>/ {visaProgress.totalDays}{language === 'ko' ? '일' : ' days'}</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: progressWidth, backgroundColor: '#4CAF50' }]} />
          </View>
          
          <Text style={styles.progressRemaining}>{t.daysRemaining} {visaProgress.remainingDays}{language === 'ko' ? '일' : ' days'}</Text>
          
          <TouchableOpacity style={styles.progressButton}>
            <Text style={styles.progressButtonText}>{t.updateVisaInfo}</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Cards */}
        <Text style={styles.sectionTitle}>{t.quickMenu}</Text>
        <View style={styles.featuresGrid}>
          {features.map(renderFeatureCard)}
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>{t.recentActivity}</Text>
          {recentActivities.map(renderActivityItem)}
          
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>{t.viewMore}</Text>
          </TouchableOpacity>
        </View>

        {/* Australia Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.didYouKnow}</Text>
          <Text style={styles.infoText}>{t.sydneyInfo}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressDays: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressTotal: {
    fontSize: 16,
    color: '#666',
    marginLeft: 6,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressRemaining: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  progressButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  activitySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    marginRight: 12,
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
    color: '#999',
  },
  viewMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewMoreText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  languageToggle: {
    marginLeft: 10,
  },
  languageButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  languageButtonText: {
    color: '#333',
    fontWeight: '500',
  },
});
