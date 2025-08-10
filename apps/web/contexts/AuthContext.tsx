"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { authApi } from "api";
import { User, Session, Provider } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: { state?: string }) => Promise<any>;
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
  const [configError, setConfigError] = useState<Error | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await authApi.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        setConfigError(null);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setConfigError(error instanceof Error ? error : new Error("Unknown authentication error"));
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    try {
      // Set up auth state change listener
      const { data: { subscription } } = authApi.onAuthStateChange((event, session) => {
        setSession(session);
        setUser(session?.user || null);
      });

      // Clean up subscription on unmount
      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth state change listener:", error);
    }
  }, []);

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authApi.signIn(email, password);
      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      
      // Provide more user-friendly error messages
      if (error instanceof Error && error.message.includes("Supabase configuration is missing")) {
        throw new Error("Authentication system is not properly configured. Please contact support.");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: { state?: string }) => {
    setIsLoading(true);
    try {
      const result = await authApi.signUp(email, password, metadata);
      return result;
    } catch (error) {
      console.error("Sign up error:", error);
      
      // Provide more user-friendly error messages
      if (error instanceof Error && error.message.includes("Supabase configuration is missing")) {
        throw new Error("Authentication system is not properly configured. Please contact support.");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const result = await authApi.signOut();
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
      // For web, we can use window.location.origin for the redirect URL
      const redirectTo = typeof window !== "undefined" 
        ? `${window.location.origin}/auth/callback` 
        : undefined;
      
      const result = await authApi.signInWithProvider(provider, redirectTo);
      return result;
    } catch (error) {
      console.error("OAuth sign in error:", error);
      
      // Provide more user-friendly error messages
      if (error instanceof Error && error.message.includes("Supabase configuration is missing")) {
        throw new Error("Social login is not properly configured. Please contact support.");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const result = await authApi.resetPassword(email);
      return result;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // If there's a configuration error, we can render an error message
  if (configError && !isLoading) {
    console.error("Authentication configuration error:", configError);
  }

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
