import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';

// 테스트용 사용자 데이터 - 실제로는 API 호출을 통해 가져와야 함
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
  },
};

export default function EditProfileScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState('ko'); // 실제로는 전역 상태에서 가져와야 함

  // 번역 텍스트
  const translations = {
    ko: {
      editProfile: "프로필 수정",
      back: "뒤로 가기",
      personalInfo: "개인 정보",
      profilePicture: "프로필 사진",
      upload: "업로드",
      removeImage: "이미지 제거",
      username: "이름",
      email: "이메일",
      visaInfo: "비자 정보",
      visaType: "비자 종류",
      visaStartDate: "시작일",
      visaEndDate: "만료일",
      visaStatus: "상태",
      save: "저장",
      cancel: "취소",
      requiredField: "필수 항목입니다",
      invalidEmail: "유효한 이메일 주소를 입력해주세요",
      updateSuccess: "프로필이 성공적으로 업데이트되었습니다",
    },
    en: {
      editProfile: "Edit Profile",
      back: "Back",
      personalInfo: "Personal Information",
      profilePicture: "Profile Picture",
      upload: "Upload",
      removeImage: "Remove Image",
      username: "Name",
      email: "Email",
      visaInfo: "Visa Information",
      visaType: "Visa Type",
      visaStartDate: "Start Date",
      visaEndDate: "End Date",
      visaStatus: "Status",
      save: "Save",
      cancel: "Cancel",
      requiredField: "This field is required",
      invalidEmail: "Please enter a valid email address",
      updateSuccess: "Your profile has been successfully updated",
    }
  };

  // 현재 언어에 맞는 번역 선택
  const t = translations[language];

  // 폼 상태
  const [formData, setFormData] = useState({
    username: mockUser.username,
    email: mockUser.email,
    visaType: mockUser.visaInfo.type,
    visaStartDate: mockUser.visaInfo.startDate,
    visaEndDate: mockUser.visaInfo.endDate,
    visaStatus: mockUser.visaInfo.status,
    profileImage: mockUser.profileImage,
  });

  // 오류 상태
  const [errors, setErrors] = useState({
    username: "",
    email: "",
  });

  // 이미지 상태
  const [hasProfileImage, setHasProfileImage] = useState(!!mockUser.profileImage);

  // 입력 필드 변경 핸들러
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 실시간 유효성 검사
    if (name === "username") {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, username: t.requiredField }));
      } else {
        setErrors(prev => ({ ...prev, username: "" }));
      }
    }

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, email: t.requiredField }));
      } else if (!emailRegex.test(value)) {
        setErrors(prev => ({ ...prev, email: t.invalidEmail }));
      } else {
        setErrors(prev => ({ ...prev, email: "" }));
      }
    }
  };

  // 이미지 업로드 핸들러 (실제 구현은 API 연동 필요)
  const handleImageUpload = () => {
    // 이미지 피커/카메라 기능 구현 필요
    Alert.alert('이미지 업로드', '카메라나 갤러리에서 이미지 선택 기능을 구현해주세요.');
    setHasProfileImage(true);
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setHasProfileImage(false);
    setFormData(prev => ({ ...prev, profileImage: null }));
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    router.back();
  };

  // 폼 제출 핸들러
  const handleSubmit = () => {
    // 유효성 검사
    let isValid = true;
    const newErrors = { username: "", email: "" };
    
    if (!formData.username.trim()) {
      newErrors.username = t.requiredField;
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t.requiredField;
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t.invalidEmail;
      isValid = false;
    }
    
    setErrors(newErrors);
    
    if (isValid) {
      // 실제로는 여기서 API 호출을 통해 데이터를 저장해야 함
      console.log("Saving profile:", formData);
      
      // 성공 시 사용자에게 알림
      Alert.alert(
        t.updateSuccess,
        '',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
              <Text style={styles.backButtonText}>← {t.back}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.editProfile}</Text>
            <View style={styles.headerRight} />
          </View>
          
          {/* 프로필 이미지 섹션 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.profilePicture}</Text>
            <View style={styles.profileImageSection}>
              <View style={styles.profileImage}>
                {hasProfileImage ? (
                  <Text style={styles.profileImageText}>🖼️</Text>
                ) : (
                  <Text style={styles.profileImageText}>👤</Text>
                )}
              </View>
              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={handleImageUpload}
                >
                  <Text style={styles.uploadButtonText}>{t.upload}</Text>
                </TouchableOpacity>
                {hasProfileImage && (
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={handleRemoveImage}
                  >
                    <Text style={styles.removeImageText}>{t.removeImage}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          
          {/* 개인 정보 섹션 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.personalInfo}</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.username}</Text>
              <TextInput
                style={[
                  styles.textInput, 
                  errors.username ? styles.inputError : null
                ]}
                value={formData.username}
                onChangeText={(value) => handleChange('username', value)}
                placeholder={t.username}
              />
              {errors.username ? (
                <Text style={styles.errorText}>{errors.username}</Text>
              ) : null}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.email}</Text>
              <TextInput
                style={[
                  styles.textInput, 
                  errors.email ? styles.inputError : null
                ]}
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                placeholder={t.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>
          </View>
          
          {/* 비자 정보 섹션 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.visaInfo}</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.visaType}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.visaType}
                onChangeText={(value) => handleChange('visaType', value)}
                placeholder={t.visaType}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.visaStartDate}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.visaStartDate}
                onChangeText={(value) => handleChange('visaStartDate', value)}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.visaEndDate}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.visaEndDate}
                onChangeText={(value) => handleChange('visaEndDate', value)}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.visaStatus}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.visaStatus}
                onChangeText={(value) => handleChange('visaStatus', value)}
                placeholder={t.visaStatus}
              />
            </View>
          </View>
          
          {/* 액션 버튼 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>{t.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSubmit}
            >
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerRight: {
    width: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  profileImageSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileImageText: {
    fontSize: 36,
  },
  imageActions: {
    flex: 1,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  removeImageButton: {
    alignSelf: 'flex-start',
  },
  removeImageText: {
    color: '#ff3b30',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
