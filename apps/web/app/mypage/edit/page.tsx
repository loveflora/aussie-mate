"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { LanguageContext } from "../../client-layout";
import { useAuth } from "../../../contexts/AuthContext";
import { authApi } from "api";

// 테스트용 비자 정보 - 실제로는 API 호출을 통해 가져와야 함
const mockVisaInfo = {
  type: "Working Holiday (417)",
  startDate: "2025-01-20",
  endDate: "2026-01-19",
  status: "Active",
  remainingDays: 163,
};

export default function EditProfilePage() {
  const router = useRouter();
  const { language } = useContext(LanguageContext);
  const { user, deleteAccount } = useAuth();

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
      state: "거주 지역(주)", // 한국어 번역 추가
      statePlaceholder: "거주 중인 호주 주를 선택해주세요",
      save: "저장",
      cancel: "취소",
      requiredField: "필수 항목입니다",
      invalidEmail: "유효한 이메일 주소를 입력해주세요",
      updateSuccess: "프로필이 성공적으로 업데이트되었습니다",
    
      deleteAccountWarning: "계정을 삭제하면 복구할 수 없습니다. 신중하게 결정해 주세요.",
      deleteAccount: "계정 삭제",
      confirmDeletion: "계정 삭제 확인",
      deletionWarning: "이 작업은 취소할 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.",
      cancel: "취소",
      confirmDelete: "예, 계정을 삭제합니다",
      deleting: "삭제 중...",
      accountDeleted: "계정이 성공적으로 삭제되었습니다",
      deleteAccountError: "계정 삭제에 실패했습니다",
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
      state: "Residential State", // 영어 번역 추가
      statePlaceholder: "Select your Australian state",
    
      save: "Save",
      cancel: "Cancel",
      requiredField: "This field is required",
      invalidEmail: "Please enter a valid email address",
      updateSuccess: "Your profile has been successfully updated",

      deleteAccountWarning: "Once you delete your account, there is no going back. Please be certain.",
      deleteAccount: "Delete Account",
      confirmDeletion: "Confirm Account Deletion",
      deletionWarning: "This action cannot be undone. All your data will be permanently deleted.",
      cancel: "Cancel",
      confirmDelete: "Yes, Delete My Account",
      deleting: "Deleting...",
      accountDeleted: "Your account has been successfully deleted",
      deleteAccountError: "Failed to delete account",
    }
  };

  // 현재 언어에 맞는 번역 선택
  const t = language === "ko" ? translations.ko : translations.en;

  // 폼 상태 (초기값은 빈 값으로 설정)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    state: '',
    visaType: mockVisaInfo.type,
    visaStartDate: mockVisaInfo.startDate,
    visaEndDate: mockVisaInfo.endDate,
    visaStatus: mockVisaInfo.status,
    profileImage: null,
  });

  // 사용자 정보 불러오기
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};
      setFormData(prev => ({
        ...prev,
        username: metadata.nickname || '',
        email: user.email || '',
        state: metadata.state || '',
      }));
    }
  }, [user]);

  // 오류 상태
  const [errors, setErrors] = useState({
    username: "",
    email: "",
  });

  // 이미지 미리보기 URL
  const [imagePreview, setImagePreview] = useState(null);

  // 계정 삭제 관련 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 실시간 유효성 검사
    if (name === "username" && !value.trim()) {
      setErrors(prev => ({ ...prev, username: t.requiredField || "This field is required" }));
    } else if (name === "username" && value.trim()) {
      setErrors(prev => ({ ...prev, username: "" }));
    }
    
    // Email is read-only, no need to validate
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    let hasErrors = false;
    const newErrors = { ...errors };
    
    if (!formData.username.trim()) {
      newErrors.username = t.requiredField || "This field is required";
      hasErrors = true;
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      // API를 통해 프로필 업데이트
      const { error } = await authApi.updateUserProfile({
        nickname: formData.username,
        state: formData.state,
        profile_completed: true
      });
      
      if (error) {
        console.error("프로필 업데이트 오류:", error);
        alert(error.message);
      } else {
        alert(t.updateSuccess || "Your profile has been successfully updated");
        router.push("/mypage");
      }
    } catch (err) {
      console.error("프로필 업데이트 오류:", err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 계정 삭제 모달 표시
  const showDeleteModal = () => {
    setShowDeleteConfirm(true);
  };
  
  // 계정 삭제 모달 숨김
  const hideDeleteModal = () => {
    setShowDeleteConfirm(false);
  };

  // 계정 삭제 처리
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const { success, error } = await deleteAccount();
      if (success) {
        alert(t.accountDeleted || "Your account has been successfully deleted");
        router.push("/auth/login");
      } else if (error) {
        alert(error.message || t.deleteAccountError || "Failed to delete account");
      }
    } catch (err) {
      console.error("계정 삭제 오류:", err);
      alert(err.message || t.deleteAccountError || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      hideDeleteModal();
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t.editProfile || "Edit Profile"}</h1>
          <Link href="/mypage" className={styles.backLink}>
            ← {t.back || "Back"}
          </Link>
        </div>
        
        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 프로필 이미지 섹션 */}
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>{t.profilePicture || "Profile Picture"}</h2>
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
                  {t.upload || "Upload"}
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
                    {t.removeImage || "Remove Image"}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* 개인 정보 섹션 */}
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>{t.personalInfo || "Personal Information"}</h2>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.formLabel}>{t.username || "Name"}</label>
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
              <label htmlFor="email" className={styles.formLabel}>{t.email || "Email"}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                readOnly
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="state" className={styles.formLabel}>{t.state || "Residential State"}</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={styles.formInput}
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
          </div>
          
        
          
          {/* 액션 버튼 */}
          <div className={styles.actionButtons}>
            <Link href="/mypage" className={styles.cancelButton}>
              {t.cancel || "Cancel"}
            </Link>
            <button type="submit" className={styles.saveButton}>
              {t.save || "Save"}
            </button>
          </div>
        </form>

        {/* 계정 삭제 섹션 */}
        <div className={styles.dangerZone}>
          
          <p>{t.deleteAccountWarning || "Once you delete your account, there is no going back. Please be certain."}</p>
          <button 
            onClick={showDeleteModal}
            className={styles.deleteButton}
          >
            {t.deleteAccount || "Delete Account"}
          </button>
        </div>

        {/* 계정 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3 className={styles.modalTitle}>{t.confirmDeletion || "Confirm Account Deletion"}</h3>
              <p className={styles.modalText}>{t.deletionWarning || "This action cannot be undone. All your data will be permanently deleted."}</p>
              
              <div className={styles.modalButtons}>
                <button 
                  onClick={hideDeleteModal}
                  className={styles.cancelButton}
                  disabled={isDeleting}
                >
                  {t.cancel || "Cancel"}
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  className={styles.confirmDeleteButton}
                  disabled={isDeleting}
                >
                  {isDeleting ? (t.deleting || "Deleting...") : (t.confirmDelete || "Yes, Delete My Account")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
