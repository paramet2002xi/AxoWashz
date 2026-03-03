'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, clearAuthToken } from '../lib/api';

interface User {
  username: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loginError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // Check if user is logged in from localStorage (rememberMe = true) or sessionStorage (rememberMe = false)
    if (typeof window !== 'undefined') {
      // First check localStorage (persistent)
      let storedUser = localStorage.getItem('user');
      let storageType = 'localStorage';
      
      // If not in localStorage, check sessionStorage (session only)
      if (!storedUser) {
        storedUser = sessionStorage.getItem('user');
        storageType = 'sessionStorage';
      }
      
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          if (storageType === 'localStorage') {
            localStorage.removeItem('user');
          } else {
            sessionStorage.removeItem('user');
          }
        }
      }
    }
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean = true): Promise<boolean> => {
    try {
      setLoginError(null);
      
      // Validate input
      if (!username || !password) {
        setLoginError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
        return false;
      }

      const response = await authApi.login(username, password, rememberMe);
      
      // Determine role based on username (admin users typically start with 'admin')
      // You may need to adjust this based on your backend's role system
      const role: 'user' | 'admin' = username.toLowerCase().startsWith('admin') ? 'admin' : 'user';
      
      const userData: User = { username: response.username, role };
      setUser(userData);
      
      if (typeof window !== 'undefined') {
        // Clear both storages first
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        
        // Store based on rememberMe preference
        if (rememberMe) {
          // Persistent storage - survives browser close
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Session storage - cleared when browser tab closes
          sessionStorage.setItem('user', JSON.stringify(userData));
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'เกิดข้อผิดพลาดในการล็อกอิน กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน';
      setLoginError(errorMessage);
      return false;
    }
  };

  const logout = () => {
    // Clear user state immediately
    setUser(null);
    setLoginError(null);
    
    // Clear all auth-related data from both localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      clearAuthToken();
    }
    
    // Navigate to Role Selection page (AxoWash) using replace to prevent back navigation
    // This ensures logout always goes to role selection page regardless of current page
    if (typeof window !== 'undefined') {
      router.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loginError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
