"use client";

import { useState, createContext } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./layout.module.css";
import { AuthProvider } from "../contexts/AuthContext";

// Create a context for language
export const LanguageContext = createContext({
  language: "ko",
  setLanguage: (lang: string) => {},
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState("ko");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <AuthProvider>
        {/* Header is full width */}
        <Header language={language} setLanguage={setLanguage} />
        
        {/* 3-column layout container */}
        <div className={styles.layoutContainer}>
          {/* Left sidebar for ads */}
          <aside className={styles.sidebar}>
            <div className={styles.adPlaceholder}>
              <p>광고 영역</p>
            </div>
          </aside>

          {/* Main content */}
          <main className={styles.mainContent}>
            {children}
          </main>

          {/* Right sidebar for ads */}
          <aside className={styles.sidebar}>
            <div className={styles.adPlaceholder}>
              <p>광고 영역</p>
            </div>
          </aside>
        </div>
        
        {/* Footer is full width */}
        <Footer />
      </AuthProvider>
    </LanguageContext.Provider>
  );
}
