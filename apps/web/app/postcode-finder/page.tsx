"use client";
import { useState, useContext } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { LanguageContext } from "../client-layout";

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



// Mock search results
const mockResults = {
  "sydney": [
    { suburb: "Sydney", state: "NSW", postcode: "2000" },
    { suburb: "Sydney South", state: "NSW", postcode: "2001" },
    { suburb: "Sydney International Airport", state: "NSW", postcode: "2020" }
  ],
  "melbourne": [
    { suburb: "Melbourne", state: "VIC", postcode: "3000" },
    { suburb: "Melbourne East", state: "VIC", postcode: "3002" }
  ],
  "brisbane": [
    { suburb: "Brisbane", state: "QLD", postcode: "4000" },
    { suburb: "Brisbane Adelaide Street", state: "QLD", postcode: "4000" }
  ]
};

export default function PostcodeFinderPage() {
  // 글로벌 언어 컨텍스트 사용
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.toLowerCase();
    const results = [];
    
    Object.keys(mockResults).forEach(key => {
      if (key.includes(query)) {
        results.push(...mockResults[key]);
      }
    });
    
    setSearchResults(results);
    setHasSearched(true);
    
    // Add to recent searches
    if (query && !recentSearches.includes(query)) {
      const updatedSearches = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(updatedSearches);
    }
  };
  
  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
    const results = mockResults[search.toLowerCase()] || [];
    setSearchResults(results);
    setHasSearched(true);
  };
  
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.searchContainer}>
          <h2 className={styles.searchTitle}>{t.findPostcode}</h2>
          <div className={styles.searchInputContainer}>
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
              onClick={handleSearch}
            >
              {t.search}
            </button>
          </div>
        </div>
        
        <div className={styles.resultsContainer}>
          {hasSearched && (
            <>
              <h3 className={styles.sectionTitle}>{t.results}</h3>
              {searchResults.length > 0 ? (
                <table className={styles.resultsTable}>
                  <thead>
                    <tr>
                      <th>{t.suburb}</th>
                      <th>{t.state}</th>
                      <th>{t.postcode}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((result, index) => (
                      <tr key={index}>
                        <td>{result.suburb}</td>
                        <td>{result.state}</td>
                        <td>{result.postcode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.noResults}>{t.noResults}</p>
              )}
            </>
          )}
        </div>
        
        <div className={styles.recentSearchesSection}>
          <h3 className={styles.sectionTitle}>{t.recentSearches}</h3>
          {recentSearches.length > 0 ? (
            <div className={styles.recentSearchesList}>
              {recentSearches.map((search, index) => (
                <button 
                  key={index} 
                  className={styles.recentSearchItem}
                  onClick={() => handleRecentSearchClick(search)}
                >
                  {search}
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.noRecentSearches}>{t.noRecentSearches}</p>
          )}
        </div>
        
        <div className={styles.navigationFooter}>
          <Link href="/" className={styles.backLink}>
            ← {t.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
