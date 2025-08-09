import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Alert } from 'react-native';
import type { Database } from 'database';

// Expo Config에서 환경 변수 가져오기
const expoConfig = Constants.expoConfig || Constants.manifest;
const supabaseUrl = expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = expoConfig?.extra?.supabaseAnonKey || '';

// 모바일 앱용 Supabase 클라이언트 초기화
const getSupabaseClientMobile = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL 또는 Anon Key가 설정되지 않았습니다');
    Alert.alert('설정 오류', '앱 설정이 올바르지 않습니다. 앱을 다시 시작해주세요.');
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  signInWithProvider: (provider: Provider) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => ({}),
  signInWithProvider: async () => ({}),
  resetPassword: async () => ({}),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabaseClient = getSupabaseClientMobile();
        const { data } = await supabaseClient.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Store session in secure storage if available
        if (data.session) {
          await SecureStore.setItemAsync('supabase-session', JSON.stringify(data.session));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        
        // Try to get session from secure storage as fallback
        try {
          const storedSession = await SecureStore.getItemAsync('supabase-session');
          if (storedSession) {
            const parsedSession = JSON.parse(storedSession) as Session;
            setSession(parsedSession);
            setUser(parsedSession.user);
          }
        } catch (secureStoreError) {
          console.error("Error retrieving session from secure store:", secureStoreError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const supabaseClient = getSupabaseClientMobile();
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      // Update secure store
      if (session) {
        await SecureStore.setItemAsync('supabase-session', JSON.stringify(session));
      } else {
        await SecureStore.deleteItemAsync('supabase-session');
      }
    });

    // Clean up subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const supabaseClient = getSupabaseClientMobile();
      const result = await supabaseClient.auth.signIn({ email, password });
      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const supabaseClient = getSupabaseClientMobile();
      const result = await supabaseClient.auth.signUp({ email, password });
      return result;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const supabaseClient = getSupabaseClientMobile();
      const result = await supabaseClient.auth.signOut();
      await SecureStore.deleteItemAsync('supabase-session');
      return result;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    setIsLoading(true);
    try {
      // For mobile deep linking
      const redirectUrl = `com.aussiematey.app://auth/callback`;
      const supabaseClient = getSupabaseClientMobile();
      const result = await supabaseClient.auth.signInWithProvider(provider, redirectUrl);
      return result;
    } catch (error) {
      console.error("OAuth sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const supabaseClient = getSupabaseClientMobile();
      const result = await supabaseClient.auth.api.resetPasswordForEmail(email);
      return result;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        signInWithProvider,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
