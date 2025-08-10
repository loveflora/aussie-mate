"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LanguageContext } from "../../client-layout";
import { useAuth } from "../../../contexts/AuthContext";
import { authApi } from "api";
import styles from "./complete-profile.module.css";

export default function CompleteProfile() {
  const router = useRouter();
  const { language } = useContext(LanguageContext);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    nickname: "",
    state: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isRejoiningUser, setIsRejoiningUser] = useState(false);
  // 클라이언트 사이드 렌더링인지 확인하는 상태
  const [isMounted, setIsMounted] = useState(false);
  
  // 컴포넌트 마운트 여부 확인 (클라이언트 사이드에서만)
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // 로그인 상태 확인 및 이미 프로필이 완성된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (!isMounted) return; // 클라이언트 사이드 렌더링이 아니면 실행하지 않음
    
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    // 이미 프로필이 완성된 사용자는 홈으로 리다이렉트
    const userMetadata = user.user_metadata || {};
    if (userMetadata.profile_completed === true) {
      router.push("/");
      return;
    }

    // 이전 닉네임과 거주 지역 정보가 있으면 불러오기
    const loadPreviousData = async () => {
      try {
        // 기존 메타데이터에서 정보 확인
        if (userMetadata.nickname || userMetadata.state) {
          setIsRejoiningUser(true);
          setFormData({
            nickname: userMetadata.nickname || "",
            state: userMetadata.state || ""
          });

          // 닉네임이 이미 있는 경우 중복 확인 수행
          if (userMetadata.nickname) {
            const { available } = await authApi.checkNicknameAvailability(userMetadata.nickname);
            setIsNicknameAvailable(available);
          }
        }
      } catch (err) {
        console.error("기존 프로필 정보 불러오기 오류:", err);
      }
    };

    loadPreviousData();
  }, [user, router, isMounted]);

  // 번역 텍스트
  const translations = {
    ko: {
      title: "프로필 설정",
      subtitle: "마지막 단계입니다! 닉네임과 거주 지역을 입력해주세요.",
      nickname: "닉네임",
      nicknamePlaceholder: "사용할 닉네임을 입력해주세요",
      nicknameAvailable: "사용 가능한 닉네임입니다",
      nicknameUnavailable: "이미 사용 중인 닉네임입니다",
      nicknameRequired: "닉네임을 입력해주세요",
      nicknameTooShort: "닉네임은 최소 3자 이상이어야 합니다",
      nicknameCheck: "중복 확인",
      checking: "확인 중...",
      state: "거주 지역(주)",
      statePlaceholder: "거주 중인 호주 주를 선택해주세요",
      completeButton: "프로필 설정 완료",
      errorOccurred: "오류가 발생했습니다"
    },
    en: {
      title: "Complete Your Profile",
      subtitle: "Last step! Please enter your nickname and residential state.",
      nickname: "Nickname",
      nicknamePlaceholder: "Enter your nickname",
      nicknameAvailable: "Nickname is available",
      nicknameUnavailable: "Nickname is already taken",
      nicknameRequired: "Please enter a nickname",
      nicknameTooShort: "Nickname must be at least 3 characters",
      nicknameCheck: "Check availability",
      checking: "Checking...",
      state: "Residential State",
      statePlaceholder: "Select your Australian state",
      completeButton: "Complete Profile",
      errorOccurred: "An error occurred"
    }
  };

  // 현재 언어에 맞는 번역 선택
  const t = language === "ko" ? translations.ko : translations.en;

  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 닉네임이 변경되면 가용성 상태 초기화
    if (name === 'nickname' && isNicknameAvailable !== null) {
      setIsNicknameAvailable(null);
    }
  };

  // 닉네임 중복 확인
  const handleNicknameCheck = async () => {
    setIsCheckingNickname(true);
    setIsNicknameAvailable(null);
    setError(null);
    
    // 닉네임이 비어있는 경우
    if (formData.nickname.trim() === '') {
      setError(t.nicknameRequired || "Please enter a nickname");
      setIsCheckingNickname(false);
      return;
    }
    
    // 최소 길이 확인
    if (formData.nickname.length < 3) {
      setError(t.nicknameTooShort || "Nickname must be at least 3 characters");
      setIsCheckingNickname(false);
      return;
    }
    
    try {
      const { available, error } = await authApi.checkNicknameAvailability(formData.nickname);
      
      if (error) {
        setError(error.message);
        setIsNicknameAvailable(false);
      } else {
        setIsNicknameAvailable(available);
        if (!available) {
          setError(t.nicknameUnavailable || "Nickname is already taken");
        }
      }
    } catch (error: any) {
      setError(error.message);
      setIsNicknameAvailable(false);
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // 닉네임 확인
    if (!formData.nickname) {
      setError(t.nicknameRequired || "Please enter a nickname");
      return;
    }
    
    // 닉네임 길이 확인
    if (formData.nickname.length < 3) {
      setError(t.nicknameTooShort || "Nickname must be at least 3 characters");
      return;
    }
    
    // 닉네임 중복 확인
    if (isNicknameAvailable === null) {
      // 중복 확인이 안 된 경우 자동으로 확인
      await handleNicknameCheck();
      return; // 중복 확인 후 다시 제출해야 함
    }
    
    // 닉네임 중복 확인 실패
    if (!isNicknameAvailable) {
      setError(t.nicknameUnavailable || "Nickname is already taken");
      return;
    }
    
    // 주(State) 선택 확인
    if (!formData.state) {
      setError(t.statePlaceholder || "Please select your residential state");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 프로필 정보 업데이트
      const { error } = await authApi.updateUserProfile({
        nickname: formData.nickname,
        state: formData.state,
        profile_completed: true
      });
      
      if (error) {
        setError(error.message);
      } else {
        // 성공적으로 업데이트 후 홈페이지로 리다이렉트
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || t.errorOccurred || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>{t.title || "Complete Your Profile"}</h1>
        {isMounted && (
          <p className={styles.subtitle}>
            {isRejoiningUser 
              ? (language === "ko" 
                  ? "이전에 사용하던 계정입니다. 닉네임과 거주 지역을 확인해주세요." 
                  : "This is your previous account. Please verify your nickname and residential state.")
              : (t.subtitle || "Last step! Please enter your nickname and residential state.")}
          </p>
        )}
        {!isMounted && (
          <p className={styles.subtitle}>{t.subtitle || "Last step! Please enter your nickname and residential state."}</p>
        )}
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="nickname">{t.nickname || "Nickname"}</label>
            <div className={styles.nicknameCheckGroup}>
              <input
                id="nickname"
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder={t.nicknamePlaceholder || "Enter your nickname"}
                required
                disabled={isLoading}
                className={styles.input}
              />
              <button 
                type="button"
                onClick={handleNicknameCheck}
                disabled={isCheckingNickname}
                className={styles.nicknameCheckButton}
              >
                {isCheckingNickname ? t.checking || "Checking..." : t.nicknameCheck || "Check availability"}
              </button>
            </div>
            {isNicknameAvailable !== null && !error?.includes(t.nicknameTooShort || "minimum") && (
              <div className={isNicknameAvailable ? styles.nicknameAvailable : styles.nicknameUnavailable}>
                {isNicknameAvailable ? t.nicknameAvailable || "Nickname is available" : t.nicknameUnavailable || "Nickname is already taken"}
              </div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="state">{t.state || "Residential State"}</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              disabled={isLoading}
              className={styles.select}
            >
              <option value="" disabled>{t.statePlaceholder || "Select your Australian state"}</option>
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
            disabled={isLoading || isNicknameAvailable === null}
            className={styles.submitButton}
          >
            {isLoading ? "로딩 중..." : t.completeButton || "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
