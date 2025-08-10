"use client";

// 시작 부분에 Supabase 설정 파일 가져오기
import { fetchVicPostcodesGeoJson } from '../../../mobile/config/supabase';

import { useState, useContext, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { LanguageContext } from "../client-layout";
import { GoogleMap, LoadScript, Polygon, Marker } from '@react-google-maps/api';

// 지도 API 키 설정
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// React.useScript와 같은 커스텀 훅
function useScript(src) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!src) {
      setStatus('idle');
      return;
    }
    
    // 이미 로드된 스크립트가 있는지 확인
    let script = document.querySelector(`script[src="${src}"]`);
    
    if (!script) {
      // 없으면 생성
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.setAttribute('data-status', 'loading');
      document.body.appendChild(script);
      
      // 이벤트 핸들러
      const setAttributeFromEvent = (event) => {
        const newStatus = event.type === 'load' ? 'ready' : 'error';
        script.setAttribute('data-status', newStatus);
        setStatus(newStatus);
      };
      
      script.addEventListener('load', setAttributeFromEvent);
      script.addEventListener('error', setAttributeFromEvent);
    } else {
      // 이미 있으면 상태 설정
      const status = script.getAttribute('data-status');
      if (status) setStatus(status);
    }
    
    // 클린업 함수
    const setStateFromEvent = (event) => {
      setStatus(event.type === 'load' ? 'ready' : 'error');
    };
    
    // 이벤트 리스너 추가 및 제거
    script.addEventListener('load', setStateFromEvent);
    script.addEventListener('error', setStateFromEvent);
    
    return () => {
      if (script) {
        script.removeEventListener('load', setStateFromEvent);
        script.removeEventListener('error', setStateFromEvent);
      }
    };
  }, [src]);
  
  return status;
}

// UI text translations
const translations = {
  en: {
    postcodeFinderTitle: "Postcode Finder",
    findPostcode: "Find Australian Postcode",
    searchPlaceholder: "Enter suburb or address...",
    search: "Search",
    recentSearches: "Recent Searches",
    noRecentSearches: "No recent searches",
    results: "Results",
    noResults: "No results found",
    back: "Back to Home",
    suburb: "Suburb",
    state: "State",
    postcode: "Postcode"
  },
  ko: {
    postcodeFinderTitle: "우편번호 찾기",
    findPostcode: "호주 우편번호 찾기",
    searchPlaceholder: "지역 또는 주소 입력...",
    search: "검색",
    recentSearches: "최근 검색",
    noRecentSearches: "최근 검색 내역이 없습니다",
    results: "검색 결과",
    noResults: "검색 결과가 없습니다",
    back: "홈으로 돌아가기",
    suburb: "지역",
    state: "주",
    postcode: "우편번호"
  }
};

// 워홀 417 지역 적격 우편번호 데이터
const whv417PostcodesRegional = {
  singlePostcodes: [3139, 3753, 3756, 3758, 3762, 3764, 3979],
  ranges: [
    { start: 3211, end: 3334 },
    { start: 3340, end: 3424 },
    { start: 3430, end: 3649 },
    { start: 3658, end: 3749 },
    { start: 3778, end: 3781 },
    { start: 3810, end: 3909 },
    { start: 3921, end: 3925 },
    { start: 3945, end: 3974 },
    { start: 3979, end: 3996 }
  ]
};

// 워홀 417 리모트 적격 우편번호 데이터
const whv417PostcodesRemote = {
  singlePostcodes: [3424, 3506, 3509, 3512],
  ranges: [
    { start: 3889, end: 3892 },
  ]
};

// 491 비자 적격 우편번호 데이터
const visa491Postcodes = {
  singlePostcodes: [3139, 3329, 3334, 3341, 3235, 3240, 3328],
  ranges: [
    { start: 3097, end: 3099 },
    { start: 3233, end: 3234 },
    { start: 3236, end: 3239 },
    { start: 3241, end: 3325 },
    { start: 3345, end: 3424 },
    { start: 3430, end: 3799 },
    { start: 3809, end: 3909 },
    { start: 3912, end: 3971 },
    { start: 3978, end: 3996 },
    { start: 3211, end: 3232 },
    { start: 3330, end: 3333 },
    { start: 3340, end: 3342 },
  ]
};

// 우편번호가 워홀 417 Regional 적격인지 확인하는 함수
const checkWhv417RegionalEligibility = (postcode) => {
  const postcodeNum = parseInt(postcode, 10);
  
  // 단일 우편번호 확인
  if (whv417PostcodesRegional.singlePostcodes.includes(postcodeNum)) {
    return true;
  }
  
  // 범위 확인
  for (const range of whv417PostcodesRegional.ranges) {
    if (postcodeNum >= range.start && postcodeNum <= range.end) {
      return true;
    }
  }
  
  return false;
};


// 우편번호가 워홀 417 Remote 적격인지 확인하는 함수
const checkWhv417RemoteEligibility = (postcode) => {
  const postcodeNum = parseInt(postcode, 10);
  
  // 단일 우편번호 확인
  if (whv417PostcodesRemote.singlePostcodes.includes(postcodeNum)) {
    return true;
  }
  
  // 범위 확인
  for (const range of whv417PostcodesRemote.ranges) {
    if (postcodeNum >= range.start && postcodeNum <= range.end) {
      return true;
    }
  }
  
  return false;
};

// 491 비자 적격 여부 확인 함수
const check491Eligibility = (postcodeStr) => {
  const postcode = parseInt(postcodeStr);
  
  // 단일 우편번호 확인
  if (visa491Postcodes.singlePostcodes.includes(postcode)) {
    return true;
  }
  
  // 범위 우편번호 확인
  for (const range of visa491Postcodes.ranges) {
    if (postcode >= range.start && postcode <= range.end) {
      return true;
    }
  }
  
  return false;
};


// 비자 필터 타입 정의
const VISA_FILTER = {
  ALL: 'all',
  WHV_417_REGIONAL: 'whv417regional',
  WHV_417_REMOTE: 'whv417remote',
  VISA_491: 'visa491', // 통합된 491 비자 필터
  BOTH: 'both',        // 두 비자 모두 적격
};

// 빅토리아 지역 중심점 좌표
const VICTORIA_REGION = {
  latitude: -37.0202,
  longitude: 144.9994,
  latitudeDelta: 5,
  longitudeDelta: 5,
};


// 빅토리아 지역의 대표적인 우편번호 지역
const SAMPLE_POSTCODES = [
  { 
    postcode: '3139', 
    name: 'Wandin',
    coordinates: { latitude: -37.7768, longitude: 145.4125 },
    eligible: true
  },
  { 
    postcode: '3550', 
    name: 'Bendigo',
    coordinates: { latitude: -36.7570, longitude: 144.2794 },
    eligible: true
  },
  { 
    postcode: '3630', 
    name: 'Shepparton',
    coordinates: { latitude: -36.3833, longitude: 145.4000 },
    eligible: true
  },
  { 
    postcode: '3825', 
    name: 'Moe',
    coordinates: { latitude: -38.1723, longitude: 146.2680 },
    eligible: true
  },
  { 
    postcode: '3350', 
    name: 'Ballarat',
    coordinates: { latitude: -37.5622, longitude: 143.8503 },
    eligible: true
  },
  { 
    postcode: '3690', 
    name: 'Wodonga',
    coordinates: { latitude: -36.1214, longitude: 146.8881 },
    eligible: true
  },
{ 
  postcode: '3220', 
  name: 'Geelong',
  coordinates: { latitude: -38.1499, longitude: 144.3617 },
  eligible: true
}
];



// 우편번호의 비자 자격 메시지를 반환하는 함수
const getVisaEligibilityMessage = (postcodeStr) => {
  if (!postcodeStr) return "No postcode information available.";
  
  const is417Regional = checkWhv417RegionalEligibility(postcodeStr);
  const is417Remote = checkWhv417RemoteEligibility(postcodeStr);
  const is491 = check491Eligibility(postcodeStr);
  
  let message = ``;
  
  if (!is417Regional && !is417Remote && !is491) {
    message += "This area is not eligible for any visa extension.";
    return message;
  }
  
  if (is417Regional) {
    message += "✅ WHV 417 Regional Australia\n";
  }
  
  if (is417Remote) {
    message += "✅ WHV 417 Remote Australia\n";
  }
  
  if (is491) {
    message += "✅ 491 visa\n";
  }
  
  return message;
};

// 우편번호 범위에 대응하는 대략적인 지리적 영역 폴리곤 (시각적 표현용)

// 폴리곤 데이터 초기화

export default function PostcodeFinderPage() {
  'use client';
  // 글로벌 언어 컨텍스트 사용
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  

  const [region, setRegion] = useState(VICTORIA_REGION);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostcode, setSelectedPostcode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filter, setFilter] = useState(VISA_FILTER.ALL);
  const [searchResult, setSearchResult] = useState(null); // 검색 결과를 저장할 상태 추가
  const [resultType, setResultType] = useState('none'); // 검색 결과 타입
  const [geoJsonPolygons, setGeoJsonPolygons] = useState([]); // GeoJSON 폴리곤 상태

  useEffect(() => {
    loadGeoJsonData();
  }, []);
  

  // GeoJSON 데이터 로드 함수
  const loadGeoJsonData = async () => {
    try {
      setLoading(true);
      
      // Supabase에서 GeoJSON 데이터 로드
      const geoJsonData = await fetchVicPostcodesGeoJson();
      
      
      // DOM에 직접 기록 (콘솔이 보이지 않을 때 대안)
      const logElement = document.createElement('div');
      logElement.style.position = 'fixed';
      logElement.style.top = '10px';
      logElement.style.right = '10px';
      logElement.style.backgroundColor = 'rgba(0,0,0,0.8)';
      logElement.style.color = 'white';
      logElement.style.padding = '10px';
      logElement.style.zIndex = '9999';
      logElement.style.maxWidth = '400px';
      logElement.style.maxHeight = '200px';
      logElement.style.overflow = 'auto';
      
      // // 데이터 정보 표시 (특히 features 개수)
      // const featuresCount = geoJsonData && geoJsonData.features ? geoJsonData.features.length : 0;
      // logElement.innerHTML = `
      //   <div>✅ 데이터 로드 성공: ${geoJsonData ? '데이터 있음' : '데이터 없음'}</div>
      //   <div>🔢 Features 수: ${featuresCount}</div>
      //   <div style="margin-top:5px;font-size:12px;">데이터는 window.__geoJsonData에 저장됨</div>
      //   <button onclick="this.parentNode.remove()" style="margin-top:5px;padding:2px 5px;">닫기</button>
      // `;
      // document.body.appendChild(logElement);
      
      // 원래 콘솔 로그
      console.log("########################", geoJsonData);
      
      // 데이터가 없으면 빈 배열 반환
      if (!geoJsonData || !geoJsonData.features) {
        console.log("⚠️ GeoJSON 데이터 없음 또는 형식 오류");
        window.alert("GeoJSON 데이터 없음 또는 형식 오류");
        setGeoJsonPolygons([]);
        setLoading(false);
        return;
      }
      
      // 빅토리아주 폴리곤만 필터링 (예: 3xxx 우편번호)
      const victoriaPolygons = geoJsonData.features
        .filter(feature => {
          // 우편번호 속성이 있는지 확인하고 빅토리아주 우편번호인지 확인
          // 다양한 속성 이름을 확인
          const postcodeProps = ['POA_CODE', 'POA_CODE21', 'POA_NAME', 'POA', 'postcode', 'poa'];
          let postcode = '';
          
          for (const prop of postcodeProps) {
            if (feature.properties && feature.properties[prop]) {
              postcode = feature.properties[prop];
              break;
            }
          }
          
          // 빅토리아주는 3으로 시작하는 우편번호
          return postcode.toString().startsWith('3');
        })
        .map(feature => {
          // 우편번호 정보 추출
          const postcodeProps = ['POA_CODE', 'POA_CODE21', 'POA_NAME', 'POA', 'postcode', 'poa'];
          let postcode = 'Unknown';
          
          for (const prop of postcodeProps) {
            if (feature.properties && feature.properties[prop]) {
              postcode = feature.properties[prop];
              break;
            }
          }

          const postcodeStr = String(postcode);
        
          // 비자 적격성 체크
          const whv417RegionalStatus = checkWhv417RegionalEligibility(postcodeStr);
          const whv417RemoteStatus = checkWhv417RemoteEligibility(postcodeStr);
          const visa491Status = check491Eligibility(postcodeStr);


          // 색상 결정
          let fillColor = 'rgba(200, 200, 200, 0.2)'; // 기본 회색
          let strokeColor = 'rgba(150, 150, 150, 0.8)';
          let visaType = null;

          if (whv417RemoteStatus) {
            fillColor = 'rgba(255, 87, 34, 0.5)'; // 주황색/빨간색
            strokeColor = 'rgba(255, 87, 34, 0.8)';
            visaType = VISA_FILTER.WHV_417_REMOTE;
          } else if (whv417RegionalStatus) {
            fillColor = 'rgba(76, 175, 80, 0.5)'; // 녹색
            strokeColor = 'rgba(76, 175, 80, 0.8)';
            visaType = VISA_FILTER.WHV_417_REGIONAL;
          } else if (visa491Status) {
            fillColor = 'rgba(156, 39, 176, 0.5)'; // 보라색
            strokeColor = 'rgba(156, 39, 176, 0.8)';
            visaType = VISA_FILTER.VISA_491;
          }
        
          // 두 비자 타입 모두에 적격한 경우
          if (whv417RegionalStatus && visa491Status) {
            fillColor = 'rgba(0, 188, 212, 0.5)'; // 청록색
            strokeColor = 'rgba(0, 188, 212, 0.8)';
            visaType = VISA_FILTER.BOTH;
          }

          // 좌표 변환 및 폴리곤 생성
          try {
            if (feature.geometry?.type === 'Polygon') {
              // 폴리곤의 외곽 경계만 사용
              const coordinates = feature.geometry.coordinates[0].map(coord => ({
                latitude: coord[1],
                longitude: coord[0]
              }));
            
              // 폴리곤 추가
              if (coordinates.length > 2) {
                return {
                  id: postcodeStr,
                  name: postcodeStr,
                  coordinates,
                  fillColor,
                  strokeColor,
                  strokeWidth: 1,
                  visaType,
                  isMultiPolygonPart: false
                };
              }
            } 
            else if (feature.geometry?.type === 'MultiPolygon') {
         
              // MultiPolygon의 모든 폴리곤 순회하고 개별적으로 추가
              const polygons = [];
              for (let i = 0; i < feature.geometry.coordinates.length; i++) {
                // 각 폴리곤의 외부 링
                for (let j = 0; j < feature.geometry.coordinates[i].length; j++) {
                  const polygonCoords = feature.geometry.coordinates[i][j];
                
                  if (polygonCoords && polygonCoords.length > 2) {
                    const coordinates = polygonCoords.map(coord => ({
                      latitude: coord[1],
                      longitude: coord[0]
                    }));
                
             
                
                    // 각 폴리곤 부분마다 고유 ID 생성
                    polygons.push({
                      id: `${postcodeStr}-${i}-${j}`,
                      name: postcodeStr,
                      coordinates,
                      fillColor,
                      strokeColor,
                      strokeWidth: 1,
                      visaType,
                      isMultiPolygonPart: true,
                      parentId: postcodeStr
                    });
                  }
                }
              }
              return polygons;
            }
          } catch (error) {
            console.error(`Error processing postcode ${postcode}:`, error);
          }
        });
      
      // 유효한 폴리곤만 사용 (3개 이상의 좌표를 가진 폴리곤)
      const validPolygons = victoriaPolygons.flat().filter(
        polygon => polygon.coordinates && polygon.coordinates.length > 2
      );
     
      
      // 모든 유효 폴리곤을 사용
      setGeoJsonPolygons(validPolygons);
    } catch (error) {
      console.error('GeoJSON 데이터 로드 오류:', error);
      console.log("에러 발생:", error);
      Alert.alert('데이터 로드 오류', 'GeoJSON 파일을 로드하는데 문제가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경 처리
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // 현재 위치 가져오기
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        console.log('위치 권한 허용됨');
      } else if (result.state === 'prompt') {
        console.log('위치 권한 요청 중');
      } else if (result.state === 'denied') {
        console.log('위치 권한 거부됨');
        setErrorMsg('위치 권한이 거부되었습니다');
      }
    });
  
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log('위치 정보 성공:', pos.coords);
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.warn('위치 정보 실패:', err);
        setErrorMsg(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);
    
  

  const handleSearch = () => {
    // 우편번호로 검색
    if (searchQuery.trim() === '') {
      setSearchResult('Search error: Please enter a postcode');
      setResultType('none');
      return;
    }

    // 1단계: SAMPLE_POSTCODES에서 먼저 검색
    const foundPostcode = SAMPLE_POSTCODES.find(
      item => item.postcode === searchQuery ||
             item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundPostcode) {
      setRegion({
        latitude: foundPostcode.coordinates.latitude,
        longitude: foundPostcode.coordinates.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
      setSelectedPostcode(foundPostcode);
      // 검색 결과 설정
      setSearchResult({
        postcode: foundPostcode.postcode,
        name: foundPostcode.name,
        eligible: foundPostcode.eligible
      });
      setResultType('postcode');
    } else {
      // 2단계: geoJsonPolygons 배열에서 우편번호(id)로 검색
      const geoPolygon = geoJsonPolygons.find(p => p.id === searchQuery);

      if (geoPolygon) {
        // 폴리곤의 대략적인 중심점 계산 (첫번째 좌표를 사용하거나 평균 구하기)
        const coords = geoPolygon.coordinates;
        let centerLat = 0;
        let centerLng = 0;
        coords.forEach(c => {
          centerLat += c.latitude;
          centerLng += c.longitude;
        });
        centerLat /= coords.length;
        centerLng /= coords.length;

        setRegion({
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        });

        // 검색 결과 설정
        setSearchResult({
          postcode: geoPolygon.id,
          visaType: geoPolygon.visaType
        });
        setResultType('geojson');
        return;
      }

      // 3단계: 단순 우편번호 텍스트 유효성 검사
      if (/^\d{4}$/.test(searchQuery)) {
        const postcode = searchQuery;
        const whvRegionalEligible = checkWhv417RegionalEligibility(postcode);
        const whvRemoteEligible = checkWhv417RemoteEligibility(postcode);
        const visa491Eligible = check491Eligibility(postcode);
        
        // 검색 결과 설정
        setSearchResult({
          postcode,
          whvRegionalEligible,
          whvRemoteEligible,
          visa491Eligible
        });
        setResultType('simple');
      } else {
        setSearchResult(<>No search results.<br />Please try searching with a different postcode.</>);
        setResultType('none');
      }
    }
  };

  const handleMarkerPress = (postcode) => {
    setSelectedPostcode(postcode);
  };

  const checkCurrentLocation = async () => {
    if (!userLocation) {
      alert('No location information: Unable to retrieve current location. Please check location permissions.');
      return;
    }

    setRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    });
  };

  // 지도 빈 영역 클릭 핸들러 추가
  const handleMapPress = () => {
    // 선택된 우편번호 정보 초기화
    setSelectedPostcode(null);
  };

  // 유저 위치 마커 클릭 핸들러 함수 추가
  const handleMyLocationClick = async () => {
    if (!userLocation) return;
    
    try {
      // 역지오코딩으로 위치의 우편번호 찾기 시도
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      // 우편번호 추출 시도
      const postcode = data.address?.postcode || '3000'; // 기본값 설정
      
      // 선택된 우편번호 정보 설정
      setSelectedPostcode({
        postcode: postcode,
        name: data.address?.suburb || data.address?.city || 'Current Location',
        coordinates: userLocation,
        eligible: checkWhv417RegionalEligibility(postcode) || 
                 checkWhv417RemoteEligibility(postcode) || 
                 check491Eligibility(postcode)
      });
    } catch (error) {
      console.error('Error getting location info:', error);
      alert('Error: Could not determine postcode for this location');
    }
  };

  const containerStyle = {
    width: '100%',
    height: '400px'
  };
  
  const center = {
    lat: region.latitude,
    lng: region.longitude
  };

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
    >
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading map data...</p>
            </div>
          ) : (
            <div className={styles.mapContainer}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={7}
                onClick={handleMapPress}
              >
                {/* 폴리곤 렌더링 */}
                {(filter === VISA_FILTER.ALL
                  ? geoJsonPolygons
                  : geoJsonPolygons.filter(polygon => {
                      // 폴리곤의 우편번호 추출 (일반 폴리곤 또는 MultiPolygon 파트)
                      const postcodeStr = polygon.name || (polygon.id && !polygon.isMultiPolygonPart ? polygon.id : polygon.parentId || '');
                      
                      // 우편번호가 없으면 필터링에서 제외
                      if (!postcodeStr) return false;
                      
                      // 선택된 필터에 따라 적절한 확인 함수 사용
                      if (filter === VISA_FILTER.WHV_417_REGIONAL) {
                        return checkWhv417RegionalEligibility(postcodeStr);
                      }
                      if (filter === VISA_FILTER.WHV_417_REMOTE) {
                        return checkWhv417RemoteEligibility(postcodeStr);
                      }
                      if (filter === VISA_FILTER.VISA_491) {
                        return check491Eligibility(postcodeStr);
                      }
                         // 기본값으로 false 반환
                         return false;
                    })
                  ).map((polygonData, index) => {
                  // 필터에 따라 폴리곤 색상 설정
                  let fillColor = polygonData.fillColor;
                  let strokeColor = polygonData.strokeColor;
                  // 우편번호 추출
                  const postcodeStr = polygonData.name || (polygonData.id && !polygonData.isMultiPolygonPart ? polygonData.id : polygonData.parentId || '');
                  // 필터에 따라 색상 설정
                  if (filter === VISA_FILTER.ALL) {
                    // 원래 색상 유지
                  } else if (filter === VISA_FILTER.WHV_417_REGIONAL) {
                    fillColor = 'rgba(76, 175, 80, 0.5)'; // 녹색
                    strokeColor = 'rgba(76, 175, 80, 0.8)';
                  } else if (filter === VISA_FILTER.WHV_417_REMOTE) {
                    fillColor = 'rgba(255, 87, 34, 0.5)'; // 주황색/빨간색
                    strokeColor = 'rgba(255, 87, 34, 0.8)';
                  } else if (filter === VISA_FILTER.VISA_491) {
                    fillColor = 'rgba(178, 29, 198, 0.5)'; // 보라색
                    strokeColor = 'rgba(178, 29, 198, 0.8)';
                  }
                  return (
                    <Polygon
                      key={`polygon-${polygonData.id || index}`}
                      paths={polygonData.coordinates.map(coord => ({
                        lat: coord.latitude,
                        lng: coord.longitude
                      }))}
                      options={{
                        fillColor: fillColor,
                        strokeColor: strokeColor,
                        strokeWeight: polygonData.strokeWidth || 2,
                        clickable: true,
                        fillOpacity: 0.5
                      }}
                      onClick={() => {
                        // 우편번호 정보 표시 로직
                        const postcodeNum = parseInt(postcodeStr, 10);
                        const whv417RegionalEligible = checkWhv417RegionalEligibility(postcodeStr);
                        const whv417RemoteEligible = checkWhv417RemoteEligibility(postcodeStr);
                        const visa491Eligible = check491Eligibility(postcodeStr);
                        
                        // 검색 결과 상태 업데이트
                        setSearchResult({
                          type: 'success',
                          postcode: postcodeStr,
                          eligibility: {
                            whv417Regional: whv417RegionalEligible,
                            whv417Remote: whv417RemoteEligible,
                            visa491: visa491Eligible
                          }
                        });
                        
                        // 검색창에도 현재 우편번호 표시
                        setSearchQuery(postcodeStr);
                      }}
                    />
                  );
                })}
                
                {/* 사용자 위치 마커 */}
                {userLocation && (
                  <Marker
                    position={{
                      lat: userLocation.latitude,
                      lng: userLocation.longitude
                    }}
                    title="Your Location"
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                      scaledSize: { width: 32, height: 32 }
                    }}
                    onClick={handleMyLocationClick}
                  />
                )}
              </GoogleMap>
            </div>
          )}
        
          {/* <div className={styles.mapPlaceholder}>
            <button 
              className={styles.myLocationButton}
              onClick={checkCurrentLocation}
            >
              <FontAwesomeIcon icon={faLocationArrow} />
            </button>
          </div>
         */}
          {/* 필터 버튼 */}
          <div className={styles.filterContainer}>
            <div className={styles.filterButtonsWrapper}>
              <button
                className={`${styles.filterButton} ${filter === VISA_FILTER.ALL ? styles.activeFilterButton : ''}`}
                onClick={() => handleFilterChange(VISA_FILTER.ALL)}
              >
                <span className={`${styles.filterButtonText} ${filter === VISA_FILTER.ALL ? styles.activeFilterText : ''}`}>
                  All
                </span>
              </button>
              
              <button
                className={`${styles.filterButton} ${filter === VISA_FILTER.WHV_417_REGIONAL ? styles.activeFilterButton : ''}`}
                onClick={() => handleFilterChange(VISA_FILTER.WHV_417_REGIONAL)}
              >
                <span className={`${styles.filterButtonText} ${filter === VISA_FILTER.WHV_417_REGIONAL ? styles.activeFilterText : ''}`}>
                  <div className={styles.colorDot} style={{backgroundColor: 'rgba(76, 175, 80, 0.8)'}}></div>
                  417 Regional
                </span>
              </button>
              
              <button
                className={`${styles.filterButton} ${filter === VISA_FILTER.WHV_417_REMOTE ? styles.activeFilterButton : ''}`}
                onClick={() => handleFilterChange(VISA_FILTER.WHV_417_REMOTE)}
              >
                <span className={`${styles.filterButtonText} ${filter === VISA_FILTER.WHV_417_REMOTE ? styles.activeFilterText : ''}`}>
                  <div className={styles.colorDot} style={{backgroundColor: 'rgba(255, 87, 34, 0.8)'}}></div>
                  417 Remote
                </span>
              </button>
              
              <button
                className={`${styles.filterButton} ${filter === VISA_FILTER.VISA_491 ? styles.activeFilterButton : ''}`}
                onClick={() => handleFilterChange(VISA_FILTER.VISA_491)}
              >
                <span className={`${styles.filterButtonText} ${filter === VISA_FILTER.VISA_491 ? styles.activeFilterText : ''}`}>
                  <div className={styles.colorDot} style={{backgroundColor: 'rgba(178, 29, 198, 0.8)'}}></div>
                  491
                </span>
              </button>
            </div>
          </div>
        



        {/* 검색창 */}
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>

              <div className={styles.searchLeft}>

              <p className={styles.subtitle}>Victorian visa eligible regions</p>
              <h3 className={styles.sectionTitle}>Search by postcode</h3>
            
            
            
            
              <div className={styles.searchRow}>


                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  className={styles.searchButton}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('검색 버튼 클릭됨');
                    handleSearch();
                  }}
                  type="button"
                >
                  Search
                </button>
                </div>
                </div>


                
              
                  {/* 검색 결과 표시 */}
              {searchResult && (
                <div className={styles.searchResultDisplay}>
                  {resultType === 'none' && (
                    <p className={styles.errorMessage}>{searchResult}</p>
                  )}
                  
                  {resultType === 'postcode' && (
                    <div className={styles.resultCard}>
                      <h3>Postcode: {searchResult.postcode}</h3>
                      <p>Suburb: {searchResult.name}</p>
                      <p>Eligibility: {searchResult.eligible ? '✅ Eligible' : '❌ Not eligible'}</p>
                    </div>
                  )}
                  
                  {resultType === 'geojson' && (
                    <div className={styles.resultCard}>
                      <h3>Postcode: {searchResult.postcode}</h3>
                      <p>Eligibility: 
                        {searchResult.visaType === VISA_FILTER.WHV_417_REGIONAL && 'Working Holiday Visa 417 Regional Australia'}
                        {searchResult.visaType === VISA_FILTER.WHV_417_REMOTE && 'Working Holiday Visa 417 Remote Australia'}
                        {searchResult.visaType === VISA_FILTER.VISA_491 && '491 visa'}
                        {searchResult.visaType === VISA_FILTER.BOTH && 'Working Holiday Visa 417 and 491 visa'}
                        {!searchResult.visaType && 'This area is not eligible for any visa extension'}
                      </p>
                    </div>
                  )}
                  
                  {resultType === 'simple' && (
                    <div className={styles.resultCard}>
                      <h3>Postcode: {searchResult.postcode}</h3>
                      <div className={styles.eligibilityItem}>
                        <span className={styles.visaLabel}>Working Holiday Visa 417 Regional:</span>
                        <span className={searchResult.whvRegionalEligible ? styles.eligible : styles.ineligible}>
                          {searchResult.whvRegionalEligible ? '✅ Eligible area' : '❌ Ineligible area'}
                        </span>
                      </div>
                      <div className={styles.eligibilityItem}>
                        <span className={styles.visaLabel}>Working Holiday Visa 417 Remote:</span>
                        <span className={searchResult.whvRemoteEligible ? styles.eligible : styles.ineligible}>
                          {searchResult.whvRemoteEligible ? '✅ Eligible area' : '❌ Ineligible area'}
                        </span>
                      </div>
                      <div className={styles.eligibilityItem}>
                        <span className={styles.visaLabel}>491 visa:</span>
                        <span className={searchResult.visa491Eligible ? styles.eligible : styles.ineligible}>
                          {searchResult.visa491Eligible ? '✅ Eligible area' : '❌ Ineligible area'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

           
              </div>

          
        


            {/* 비자 정보 카드 섹션 */}
            <div className={styles.visaInfoCards}>
              {/* WHV 417 Regional 정보 */}
              <div className={styles.visaCard}>
                <div className={styles.visaCardHeader} style={{backgroundColor: 'rgba(76, 175, 80, 0.8)'}}>
                  <h3 className={styles.visaCardTitle}>Working Holiday Visa 417</h3>
                  <div className={styles.visaCardBadge}>Regional</div>
                </div>
                <div className={styles.visaCardBody}>
                  <div className={styles.postcodeList}>
                    3139, 3211-3334, 3340-3424, 3430-3649, 3658-3749, 3753, 3756, 3758, 3762, 3764, 
                    3778-3781, 3783, 3797, 3799, 3810-3909, 3921-3925, 3945-3974, 3979, 3981-3996
                  </div>
                </div>
              </div>

              {/* WHV 417 Remote 정보 */}
              <div className={styles.visaCard}>
                <div className={styles.visaCardHeader} style={{backgroundColor: 'rgba(255, 87, 34, 0.8)'}}>
                  <h3 className={styles.visaCardTitle}>Working Holiday Visa 417</h3>
                  <div className={styles.visaCardBadge}>Remote</div>
                </div>
                <div className={styles.visaCardBody}>
                  <div className={styles.postcodeList}>
                    3424, 3506, 3509, 3512, 3889-3892
                  </div>
                </div>
              </div>

              {/* Visa 491 정보 */}
              <div className={styles.visaCard}>
                <div className={styles.visaCardHeader} style={{backgroundColor: 'rgba(178, 29, 198, 0.8)'}}>
                  <h3 className={styles.visaCardTitle}>Skilled Work Regional Visa 491</h3>
                  <div className={styles.visaCardBadge}>Regional</div>
                </div>
                <div className={styles.visaCardBody}>
                  <div className={styles.postcodeCategory}>
                    <h4 className={styles.postcodeCategoryTitle}>Cities and major regional centres</h4>
                    <div className={styles.postcodeList}>
                      3211-3232, 3235, 3240, 3328, 3330-3333, 3340, 3342
                    </div>
                  </div>
                  
                  <div className={styles.postcodeCategory}>
                    <h4 className={styles.postcodeCategoryTitle}>Regional centres and other regional areas</h4>
                    <div className={styles.postcodeList}>
                      3097-3099, 3139, 3233-3234, 3236-3239, 3241-3325, 3329, 3334, 3341, 3345-3424, 3430-3799, 3809-3909, 3912-3971, 3978-3996
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sourceLinks}>
              <div className={styles.sourceItem}>
                <span className={styles.sourceLabel}>417 visa information:</span>
                <a 
                  className={styles.sourceLink}
                  href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417/specified-work"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles.linkText}>Department of Home Affairs</span>
                  <svg className={styles.externalLinkIcon} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
              
              <div className={styles.sourceItem}>
                <span className={styles.sourceLabel}>491 visa information:</span>
                <a
                  className={styles.sourceLink}
                  href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list/regional-postcodes"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles.linkText}>Regional Postcodes</span>
                  <svg className={styles.externalLinkIcon} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* 푸터 섹션 */}
            <div className={styles.footerSection}>
              {/* Disclaimer section */}
              <div className={styles.footerCard}>
                <h3 className={styles.footerCardTitle}>Disclaimer</h3>
                <p className={styles.footerCardText}>
                  This app is not affiliated with or endorsed by the Australian Government. 
                  It is provided for informational and reference purposes only.
                </p>
                <p className={styles.footerCardText}>
                  For the most accurate and up-to-date information, please visit the 
                  <a
                    className={styles.inlineLink}
                    href="https://immi.homeaffairs.gov.au/"
                    target="_blank"
                    rel="noopener noreferrer"
                  > Australian Department of Home Affairs</a>.
                </p>
              </div>
              
              {/* Contact section */}
              <div className={styles.footerCard}>
                <h3 className={styles.footerCardTitle}>Contact Us</h3>
                <p className={styles.footerCardText}>
                  Have questions or feedback? We'd love to hear from you.
                </p>
                <div className={styles.contactLinks}>
                  <a
                    className={styles.contactLink}
                    href="mailto:kshhhh0640@gmail.com?subject=Feedback"
                  >
                    <svg className={styles.contactIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>kshhhh0640@gmail.com</span>
                  </a>
                  <a
                    className={styles.contactLink}
                    href="https://www.freeprivacypolicy.com/live/d082fabb-af9f-43e3-b685-88588f31752a"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className={styles.contactIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                      <line x1="6" y1="1" x2="6" y2="4"></line>
                      <line x1="10" y1="1" x2="10" y2="4"></line>
                      <line x1="14" y1="1" x2="14" y2="4"></line>
                    </svg>
                    <span>Privacy Policy</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}
