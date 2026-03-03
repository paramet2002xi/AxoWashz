'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Image from 'next/image';

interface LayoutProps {
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}

/* ─────────────────────────────────────
   NavItem — Sidebar navigation button
   Matches ref: full-width rounded pill
   with blue bg on active state
───────────────────────────────────── */
function NavItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full h-[42px] flex items-center gap-3 px-4 rounded-xl text-left text-[14px] transition-all duration-200 ${active
        ? 'bg-[#EEF2FF] text-[#4F6EF7] font-semibold'
        : 'text-[#64748B] font-medium hover:bg-[#F1F5F9] hover:text-[#1E293B]'
        }`}
    >
      <span className={`size-5 flex-shrink-0 flex items-center justify-center [&_svg]:size-[18px] ${active ? 'text-[#4F6EF7]' : ''}`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

/* ── Section Label (e.g. "MANAGEMENT") ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
      {children}
    </p>
  );
}

export default function Layout({ children, headerExtra }: LayoutProps) {
  const { user, logout, login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;
  const isAdminSettingsActive =
    pathname.startsWith('/admin') && !pathname.startsWith('/admin/dashboard');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
    };
    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageDropdown]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  /* ── Icons ── */
  const dashboardIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
      />
    </svg>
  );
  const homeIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
  const settingsIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  /* ── Shared sidebar inner content ── */
  const sidebarInner = (
    <>
      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-6 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-[#4F6EF7] flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image src="/images/LogoAxy.png" alt="AxoWash" width={24} height={24} className="object-contain brightness-0 invert" />
          </div>
          <span className="text-[16px] font-bold text-[#4F6EF7] tracking-tight">AxoWash</span>
        </div>
      </div>

      {/* ── Nav items ── */}
      <div className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-1">
          {user?.role === 'admin' && (
            <NavItem
              active={isActive('/admin/dashboard')}
              onClick={() => router.push('/admin/dashboard')}
              icon={dashboardIcon}
              label={t('dashboard.title')}
            />
          )}
          <NavItem
            active={isActive('/home')}
            onClick={() => router.push('/home')}
            icon={homeIcon}
            label={t('nav.home')}
          />
        </div>

        {user?.role === 'admin' && (
          <>
            <SectionLabel>
              {t('nav.management')}
            </SectionLabel>
            <div className="space-y-1">
              <NavItem
                active={isAdminSettingsActive}
                onClick={() => router.push('/admin')}
                icon={settingsIcon}
                label={t('nav.settings')}
              />
            </div>
          </>
        )}
      </div>

      {/* ── User card at bottom ── */}
      <div className="px-4 pb-5 pt-3 flex-shrink-0">
        {/* Language toggle */}
        <div className="relative mb-3" ref={languageDropdownRef}>
          <button
            type="button"
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="w-full h-9 flex items-center justify-between gap-2 px-3 rounded-lg text-[13px] text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm">{language === 'th' ? '🇹🇭' : '🇬🇧'}</span>
              <span>{language === 'th' ? 'ไทย' : 'English'}</span>
            </div>
            <svg className={`size-3.5 text-[#94A3B8] transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showLanguageDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg border border-[#E2E8F0] shadow-lg overflow-hidden z-50 animate-scale-in">
              <button type="button" onClick={() => { setLanguage('th'); setShowLanguageDropdown(false); }}
                className={`w-full h-9 flex items-center gap-2.5 px-3 text-[13px] transition-colors ${language === 'th' ? 'bg-[#EEF2FF] text-[#4F6EF7] font-medium' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
                <span className="text-sm">🇹🇭</span><span>ไทย</span>
              </button>
              <button type="button" onClick={() => { setLanguage('en'); setShowLanguageDropdown(false); }}
                className={`w-full h-9 flex items-center gap-2.5 px-3 text-[13px] transition-colors ${language === 'en' ? 'bg-[#EEF2FF] text-[#4F6EF7] font-medium' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
                <span className="text-sm">🇬🇧</span><span>English</span>
              </button>
            </div>
          )}
        </div>

        {/* User profile row */}
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-gradient-to-br from-[#4F6EF7] to-[#06B6D4] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1A1D26] truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-[11px] text-[#94A3B8] truncate">
              {user?.role === 'admin' ? t('nav.role.admin') : t('nav.role.user')}
            </p>
          </div>
          {/* Logout */}
          <button
            type="button"
            onClick={async () => {
              logout();
              if (user?.role === 'admin') {
                const ok = await login('user001', 'user001', true);
                if (ok) router.replace('/home');
              } else {
                router.push('/?admin=1');
              }
            }}
            className="size-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-all duration-200"
            title={user?.role === 'admin' ? t('nav.logout') : t('login.admin')}
          >
            <svg className="size-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex">
      {/* ═══════════════════════════════════════
          Desktop Sidebar (Admin only)
      ═══════════════════════════════════════ */}
      {isAdmin && (
        <aside className="hidden md:flex fixed left-0 top-0 w-[200px] h-screen bg-white flex-col z-50">
          {sidebarInner}
        </aside>
      )}

      {/* ═══════════════════════════════════════
          Mobile Sidebar Drawer (Admin only)
      ═══════════════════════════════════════ */}
      {isAdmin && mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 w-[260px] h-full bg-white flex flex-col shadow-2xl animate-fade-up">
            {sidebarInner}
          </aside>
        </div>
      )}

      {/* ═══════════════════════════════════════
          Main Content Area
      ═══════════════════════════════════════ */}
      <div className={`flex-1 flex flex-col ${isAdmin ? 'md:ml-[200px]' : ''} min-h-screen`}>

        {/* ── User Top Bar (non-admin) ── */}
        {!isAdmin && (
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F1F5F9] px-4 sm:px-6 lg:px-[80px] h-[60px] flex items-center gap-4">
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="size-8 rounded-lg bg-[#4F6EF7] flex items-center justify-center">
                <Image src="/images/LogoAxy.png" alt="AxoWash" width={20} height={20} className="object-contain brightness-0 invert" />
              </div>
              <span className="text-[16px] font-bold text-[#4F6EF7] tracking-tight">AxoWash</span>
            </div>
            <div className="flex-1" />
            {headerExtra}

            {/* Desktop: inline buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="relative" ref={languageDropdownRef}>
                <button type="button" onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="h-9 flex items-center gap-2 px-3 rounded-lg text-[13px] text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
                  <span className="text-sm">{language === 'th' ? '🇹🇭' : '🇬🇧'}</span>
                  <span>{language === 'th' ? 'ไทย' : 'EN'}</span>
                </button>
                {showLanguageDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-lg border border-[#E2E8F0] shadow-lg overflow-hidden z-50 animate-scale-in w-28">
                    <button type="button" onClick={() => { setLanguage('th'); setShowLanguageDropdown(false); }}
                      className={`w-full h-9 flex items-center gap-2 px-3 text-[13px] transition-colors ${language === 'th' ? 'bg-[#EEF2FF] text-[#4F6EF7] font-medium' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
                      🇹🇭 ไทย
                    </button>
                    <button type="button" onClick={() => { setLanguage('en'); setShowLanguageDropdown(false); }}
                      className={`w-full h-9 flex items-center gap-2 px-3 text-[13px] transition-colors ${language === 'en' ? 'bg-[#EEF2FF] text-[#4F6EF7] font-medium' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
                      🇬🇧 English
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => { logout(); router.push('/?admin=1'); }}
                className="h-9 flex items-center gap-2 px-4 rounded-lg text-[13px] font-medium text-[#4F6EF7] bg-[#EEF2FF] hover:bg-[#E0E7FF] transition-colors"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{t('login.admin')}</span>
              </button>
            </div>

            {/* Mobile: hamburger */}
            <div className="sm:hidden relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="size-9 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {mobileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-50 overflow-hidden animate-scale-in">
                  {/* Language options */}
                  <button type="button" onClick={() => { setLanguage('th'); setMobileMenuOpen(false); }}
                    className={`w-full h-11 flex items-center gap-3 px-4 text-[13px] transition-colors ${language === 'th' ? 'bg-[#EEF2FF] text-[#4F6EF7] font-semibold' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}>
                    🇹🇭 ไทย
                  </button>
                  <button type="button" onClick={() => { setLanguage('en'); setMobileMenuOpen(false); }}
                    className={`w-full h-11 flex items-center gap-3 px-4 text-[13px] transition-colors ${language === 'en' ? 'bg-[#EEF2FF] text-[#4F6EF7] font-semibold' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}>
                    🇬🇧 English
                  </button>
                  <div className="h-px bg-[#E2E8F0]" />
                  <button
                    onClick={() => { logout(); router.push('/?admin=1'); setMobileMenuOpen(false); }}
                    className="w-full h-11 flex items-center gap-3 px-4 text-[13px] font-medium text-[#4F6EF7] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t('login.admin')}
                  </button>
                </div>
              )}
            </div>
          </header>
        )}

        {/* ── Desktop Header Bar — Admin (Search + Filters + Bell) ── */}
        {isAdmin && (
          <header className="hidden md:flex sticky top-0 z-40 bg-white/80 backdrop-blur-md items-center gap-4 px-6 lg:px-8 h-[60px] border-b border-[#F1F5F9]">
            {/* Search */}
            <div className="flex-1 max-w-xl relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('home.search')}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F1F5F9] text-[14px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/30 border border-transparent focus:border-[#4F6EF7]/20 transition-all"
              />
            </div>

            {/* Spacer — pushes filters + bell to the right */}
            <div className="flex-1" />

            {/* Filter pills slot (from page) */}
            {headerExtra}

            {/* Notification bell */}
            <button className="relative size-10 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#64748B] transition-colors">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white"></span>
            </button>
          </header>
        )}

        {/* ── Mobile Top Bar (Admin only) ── */}
        {isAdmin && (
          <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F1F5F9] px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-[#4F6EF7] flex items-center justify-center">
                <Image src="/images/LogoAxy.png" alt="AxoWash" width={16} height={16} className="object-contain brightness-0 invert" />
              </div>
              <span className="text-[14px] font-bold text-[#4F6EF7]">AxoWash</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative size-8 rounded-lg flex items-center justify-center text-[#94A3B8]">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="size-9 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </header>
        )}

        {/* ── Page Content ── */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${isAdmin ? 'lg:p-8' : 'lg:px-[80px] lg:py-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
