'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import Image from 'next/image';

export default function Home() {
  const { user, isAuthenticated, login, loginError } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const username = 'admin001';

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/home');
    }
  }, [isAuthenticated, user?.role, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rememberMePreference');
      if (saved !== null) setRememberMe(saved === 'true');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!password) {
      setPasswordError(t('login.error.password'));
      return;
    }
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rememberMePreference', rememberMe.toString());
    }
    const success = await login(username, password, rememberMe);
    if (success) {
      setTimeout(() => router.replace('/admin/dashboard'), 50);
    } else {
      setPasswordError(loginError || t('login.error.invalid'));
    }
    setIsLoading(false);
  };

  // ฟอร์ม Login (แอดมิน / ผู้ใช้) - เข้าหน้า Login เลย
  return (
    <div className="min-h-screen bg-[var(--surface-bg)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--brand-primary)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[var(--brand-accent)]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--brand-primary)]/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-10">
        <button
          type="button"
          onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
          className="px-4 py-2 bg-white/90 hover:bg-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg text-gray-700 transition-colors flex items-center gap-2"
          title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
        >
          <span className="text-base">{language === 'th' ? '🇹🇭' : '🇬🇧'}</span>
          <span>{language === 'th' ? 'TH' : 'EN'}</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-light)] p-8 animate-scale-in">
        <button
          type="button"
          onClick={async () => {
            // หน้าผู้ใช้ไม่ต้องเข้ารหัส — ล็อกอินเป็น user อัตโนมัติแล้วไป /home
            const ok = await login('user001', 'user001', true);
            if (ok) router.replace('/home');
          }}
          className="absolute left-6 top-6 flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
          aria-label={t('login.back')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>{t('login.back')}</span>
        </button>
        <div className="flex justify-center mb-6">
          <Image
            src="/images/LogoAxy.png"
            alt="AxoWash"
            width={110}
            height={66}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
          {t('role.admin')}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          {t('login.enterCredentials')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              {t('login.email')}
            </label>
            <input
              id="username"
              type="text"
              readOnly
              value={username}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-500 bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
                {t('login.password')}
              </label>
              <a href="#" className="text-sm text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] hover:underline">
                {t('login.forgotPassword')}
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => {
                const checked = e.target.checked;
                setRememberMe(checked);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('rememberMePreference', checked.toString());
                }
              }}
              className="w-4 h-4 text-[var(--brand-primary)] border-[var(--border-default)] rounded focus:ring-[var(--brand-primary)] cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 cursor-pointer">
              {t('login.remember')}
            </label>
          </div>

          {passwordError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {passwordError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[var(--brand-primary)] text-white font-semibold text-sm hover:bg-[var(--brand-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md shadow-[var(--brand-primary)]/20 hover:shadow-lg"
          >
            {isLoading && (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isLoading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>
      </div>
    </div>
  );
}
