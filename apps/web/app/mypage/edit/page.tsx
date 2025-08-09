"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { LanguageContext } from "../../client-layout";

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

export default function EditProfilePage() {
  const router = useRouter();
  const { language } = useContext(LanguageContext);

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

  // 이미지 미리보기 URL
  const [imagePreview, setImagePreview] = useState(null);

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 실시간 유효성 검사
    if (name === "username" && !value.trim()) {
      setErrors(prev => ({ ...prev, username: t.requiredField }));
    } else if (name === "username" && value.trim()) {
      setErrors(prev => ({ ...prev, username: "" }));
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
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, profileImage: null }));
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    
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
      
      // 성공 시 사용자를 마이페이지로 리다이렉트
      alert(t.updateSuccess);
      router.push("/mypage");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t.editProfile}</h1>
          <Link href="/mypage" className={styles.backButton}>
            ← {t.back}
          </Link>
        </div>
        
        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 프로필 이미지 섹션 */}
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>{t.profilePicture}</h2>
            <div className={styles.imageUploadSection}>
              <div className={styles.profileImagePreview}>
                {imagePreview || formData.profileImage ? (
                  <img src={imagePreview || formData.profileImage} alt="Profile Preview" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className={styles.imageUploadControls}>
                <label className={styles.uploadButton}>
                  {t.upload}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }} 
                  />
                </label>
                {(imagePreview || formData.profileImage) && (
                  <button 
                    type="button" 
                    className={styles.removeImageButton}
                    onClick={handleRemoveImage}
                  >
                    {t.removeImage}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* 개인 정보 섹션 */}
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>{t.personalInfo}</h2>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.formLabel}>{t.username}</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.username ? styles.formInputError : ''}`}
              />
              {errors.username && <p className={styles.errorMessage}>{errors.username}</p>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>{t.email}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
              />
              {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
            </div>
          </div>
          
          {/* 비자 정보 섹션 */}
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>{t.visaInfo}</h2>
            <div className={styles.formGroup}>
              <label htmlFor="visaType" className={styles.formLabel}>{t.visaType}</label>
              <input
                type="text"
                id="visaType"
                name="visaType"
                value={formData.visaType}
                onChange={handleChange}
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="visaStartDate" className={styles.formLabel}>{t.visaStartDate}</label>
              <input
                type="date"
                id="visaStartDate"
                name="visaStartDate"
                value={formData.visaStartDate}
                onChange={handleChange}
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="visaEndDate" className={styles.formLabel}>{t.visaEndDate}</label>
              <input
                type="date"
                id="visaEndDate"
                name="visaEndDate"
                value={formData.visaEndDate}
                onChange={handleChange}
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="visaStatus" className={styles.formLabel}>{t.visaStatus}</label>
              <input
                type="text"
                id="visaStatus"
                name="visaStatus"
                value={formData.visaStatus}
                onChange={handleChange}
                className={styles.formInput}
              />
            </div>
          </div>
          
          {/* 액션 버튼 */}
          <div className={styles.actionButtons}>
            <Link href="/mypage" className={styles.cancelButton}>
              {t.cancel}
            </Link>
            <button type="submit" className={styles.saveButton}>
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
