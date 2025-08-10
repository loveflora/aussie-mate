import { createClient } from '@supabase/supabase-js';

// Supabase URL과 API 키
// 실제 값으로 교체해야 합니다
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';


// 환경 정보 출력 (디버깅용)
console.log('🔍 환경 정보:', {
  isBrowser: typeof window !== 'undefined',
  isServer: typeof window === 'undefined',
  isReactNative: typeof navigator !== 'undefined' && navigator.product === 'ReactNative',
  nodeEnv: process.env.NODE_ENV,
});
console.log('🔍 SUPABASE_URL:', SUPABASE_URL || '(설정되지 않음)');

// Supabase 클라이언트 - 조건부 생성
let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.error('Supabase 클라이언트 생성 실패:', error);
  }
}

export { supabase };

// 로컬 JSON 파일을 가져오는 폴백 함수
const getLocalGeoJson = async () => {
  try {
    console.log('⚠️ Supabase 연결 불가: 로컬 파일 사용');
    // 브라우저/React Native 환경
    if (typeof window !== 'undefined') {
      // 웹에서는 fetch 사용
      try {
        const response = await fetch('/vic-postcodes.json');
        const data = await response.json();
        console.log("✅ 로컬 JSON 로드 성공");
        return data;
      } catch (e) {
        console.error('웹 환경 JSON 로드 실패:', e);
        console.log("🔄 빈 GeoJSON 반환");
        return {
          type: "FeatureCollection",
          features: []
        };
      }
    } else {
      // Node.js 환경(SSR)에서는 빈 GeoJSON 반환
      console.log("🔄 SSR 환경: 빈 GeoJSON 반환");
      return {
        type: "FeatureCollection",
        features: []
      };
    }
  } catch (error) {
    console.error('로컬 GeoJSON 파일 로드 실패:', error);
    console.log("🔄 오류 발생: 빈 GeoJSON 반환");
    // 빈 GeoJSON 구조 반환
    return {
      type: "FeatureCollection",
      features: []
    };
  }
};

// GeoJSON 데이터 가져오는 함수
export const fetchVicPostcodesGeoJson = async () => {
  // 디버깅용 로그
  if (typeof window !== 'undefined') {
    console.warn('🔍 fetchVicPostcodesGeoJson 함수 호출됨 (클라이언트)');
  } else {
    console.warn('🔍 fetchVicPostcodesGeoJson 함수 호출됨 (서버)');
  }

  // Supabase가 설정되지 않았으면 로컬 파일 사용
  if (!supabase) {
    console.warn('⚠️ Supabase 클라이언트 없음, getLocalGeoJson 호출');
    return await getLocalGeoJson();
  }

  try {
    console.warn('🔄 Supabase 스토리지 접근 시도');
    // Storage에서 파일 가져오기
    const { data, error } = await supabase
      .storage
      .from('geojson-data')
      .download('vic-postcodes.json');
    
    if (error) {
      console.error('❌ Supabase 스토리지 접근 실패:', error);
      console.warn('🔄 로컬 파일로 폴백');
      return await getLocalGeoJson();
    }
    
    console.warn('✅ Supabase에서 파일 다운로드 성공');
    
    // Blob을 JSON으로 변환
    const text = await data.text();
    const parsedData = JSON.parse(text);
    console.warn('✅ JSON 파싱 성공, 데이터 반환');
    return parsedData;
  } catch (error) {
    console.error('❌ GeoJSON 데이터 로딩 오류:', error);
    // 오류 발생 시 로컬 파일 사용
    console.warn('🔄 로컬 파일로 폴백 (catch 블록)');
    return await getLocalGeoJson();
  }
};

// 데이터베이스에서 가져오기
export const fetchVicPostcodesFromDb = async () => {
  // Supabase가 설정되지 않았으면 로컬 파일 사용
  if (!supabase) {
    return await getLocalGeoJson();
  }

  try {
    const { data, error } = await supabase
      .from('victoria_postcodes')
      .select('data')
      .single();
    
    if (error) {
      console.error('Supabase DB 접근 실패:', error);
      return await getLocalGeoJson();
    }
    
    return data.data; // JSONB 데이터 반환
  } catch (error) {
    console.error('GeoJSON DB 데이터 로딩 오류:', error);
    // 오류 발생 시 로컬 파일 사용
    return await getLocalGeoJson();
  }
};
