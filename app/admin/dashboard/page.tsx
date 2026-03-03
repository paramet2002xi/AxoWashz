'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import { adminDashboardApi } from '../../lib/api';
import type { DashboardStats, FanLogItem, PageResponse } from '../../lib/api';
import { mockDashboardStats, getMockLogsPage, mockDailyRevenueTotal, mockDailyUsageTotal, mockIncomeByWeek, mockIncomeByMonth, mockIncomeByYear, mockUsageByWeek, mockUsageByMonth, mockUsageByYear, type IncomeDataPoint } from '../../lib/mockDashboardData';

const PAGE_SIZE = 20;

const CHART_PADDING = { top: 20, right: 20, bottom: 36, left: 44 };
const CHART_WIDTH = 340;
const CHART_HEIGHT = 180;

function buildLinePath(data: IncomeDataPoint[], width: number, height: number): string {
  if (data.length === 0) return '';
  const max = Math.max(...data.map(d => d.value), 1);
  const min = 0;
  const range = max - min || 1;
  const stepX = data.length <= 1 ? width : (width - 0) / (data.length - 1);
  const points = data.map((d, i) => {
    const x = CHART_PADDING.left + i * stepX;
    const y = CHART_PADDING.top + height - ((d.value - min) / range) * height;
    return `${x},${y}`;
  });
  return `M ${points.join(' L ')}`;
}

function buildAreaPath(data: IncomeDataPoint[], width: number, height: number): string {
  const linePath = buildLinePath(data, width, height);
  if (!linePath) return '';
  const maxX = CHART_PADDING.left + (data.length <= 1 ? 0 : (width * (data.length - 1)) / (data.length - 1));
  const baseY = CHART_PADDING.top + height;
  return `${linePath} L ${CHART_PADDING.left + width},${baseY} L ${CHART_PADDING.left},${baseY} Z`;
}

function IncomeLineChart({
  period,
  onPeriodChange,
  t,
}: {
  period: 'week' | 'month' | 'year';
  onPeriodChange: (p: 'week' | 'month' | 'year') => void;
  t: (key: string) => string;
}) {
  const data = period === 'week' ? mockIncomeByWeek : period === 'month' ? mockIncomeByMonth : mockIncomeByYear;
  const path = buildLinePath(data, CHART_WIDTH, CHART_HEIGHT);
  const areaPath = buildAreaPath(data, CHART_WIDTH, CHART_HEIGHT);
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div id="income-chart" className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
        <h2 className="text-sm sm:text-base font-semibold text-[#1E293B] flex items-center gap-2">
          <div className="size-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          {t('dashboard.income')}
        </h2>
        <div className="flex rounded-lg border border-[#E2E8F0] overflow-hidden self-end">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all ${period === p ? 'bg-[#2F80ED] text-white shadow-sm' : 'bg-white text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
            >
              {p === 'week' ? t('dashboard.periodWeek') : p === 'month' ? t('dashboard.periodMonth') : t('dashboard.periodYear')}
            </button>
          ))}
        </div>
      </div>
      {/* Summary */}
      <div className="mb-3">
        <span className="text-2xl sm:text-3xl font-bold text-[#1E293B] tabular-nums">{totalValue.toLocaleString()}</span>
        <span className="text-xs sm:text-sm text-[#94A3B8] font-medium ml-1.5">{t('dashboard.currency')}</span>
      </div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${CHART_PADDING.left + CHART_WIDTH + CHART_PADDING.right} ${CHART_PADDING.top + CHART_HEIGHT + CHART_PADDING.bottom}`} className="min-w-[280px] w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2F80ED" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#2F80ED" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = CHART_PADDING.top + CHART_HEIGHT - pct * CHART_HEIGHT;
            return <line key={i} x1={CHART_PADDING.left} y1={y} x2={CHART_PADDING.left + CHART_WIDTH} y2={y} stroke="#F1F5F9" strokeWidth={1} />;
          })}
          <path d={areaPath} fill="url(#incomeAreaGradient)" />
          <path d={path} fill="none" stroke="#2F80ED" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {/* Data points */}
          {data.map((d, i) => {
            const stepX = data.length <= 1 ? CHART_WIDTH : CHART_WIDTH / (data.length - 1);
            const x = CHART_PADDING.left + i * stepX;
            const y = CHART_PADDING.top + CHART_HEIGHT - ((d.value - 0) / (maxVal || 1)) * CHART_HEIGHT;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={5} fill="white" stroke="#2F80ED" strokeWidth={2.5} />
              </g>
            );
          })}
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const val = Math.round(maxVal * pct);
            const y = CHART_PADDING.top + CHART_HEIGHT - pct * CHART_HEIGHT;
            return (
              <text key={i} x={CHART_PADDING.left - 8} y={y + 4} textAnchor="end" style={{ fontSize: 10, fontWeight: 500 }} fill="#94A3B8">
                {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            );
          })}
          {/* X-axis labels */}
          {data.map((d, i) => {
            const stepX = data.length <= 1 ? CHART_WIDTH : CHART_WIDTH / (data.length - 1);
            const x = CHART_PADDING.left + i * stepX;
            return (
              <text key={i} x={x} y={CHART_PADDING.top + CHART_HEIGHT + 20} textAnchor="middle" style={{ fontSize: 10, fontWeight: 500 }} fill="#94A3B8">
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const BAR_CHART_PADDING = { top: 20, right: 20, bottom: 36, left: 40 };
const BAR_CHART_WIDTH = 340;
const BAR_CHART_HEIGHT = 180;

function UsageBarChart({
  period,
  onPeriodChange,
  t,
}: {
  period: 'week' | 'month' | 'year';
  onPeriodChange: (p: 'week' | 'month' | 'year') => void;
  t: (key: string) => string;
}) {
  const data = period === 'week' ? mockUsageByWeek : period === 'month' ? mockUsageByMonth : mockUsageByYear;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = Math.min(32, (BAR_CHART_WIDTH - (data.length - 1) * 8) / data.length);
  const totalBarSpace = data.length * barW + (data.length - 1) * 8;
  const startOffset = (BAR_CHART_WIDTH - totalBarSpace) / 2;
  const gap = 8;
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div id="by-machine" className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E2E8F0]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
        <h2 className="text-sm sm:text-base font-semibold text-[#1E293B] flex items-center gap-2">
          <div className="size-7 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          {t('dashboard.usage')}
        </h2>
        <div className="flex rounded-lg border border-[#E2E8F0] overflow-hidden self-end">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all ${period === p ? 'bg-[#22C55E] text-white shadow-sm' : 'bg-white text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
            >
              {p === 'week' ? t('dashboard.periodWeek') : p === 'month' ? t('dashboard.periodMonth') : t('dashboard.periodYear')}
            </button>
          ))}
        </div>
      </div>
      {/* Summary */}
      <div className="mb-3">
        <span className="text-2xl sm:text-3xl font-bold text-[#1E293B] tabular-nums">{totalValue.toLocaleString()}</span>
        <span className="text-xs sm:text-sm text-[#94A3B8] font-medium ml-1.5">{t('dashboard.usage')}</span>
      </div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${BAR_CHART_PADDING.left + BAR_CHART_WIDTH + BAR_CHART_PADDING.right} ${BAR_CHART_PADDING.top + BAR_CHART_HEIGHT + BAR_CHART_PADDING.bottom}`} className="min-w-[280px] w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = BAR_CHART_PADDING.top + BAR_CHART_HEIGHT - pct * BAR_CHART_HEIGHT;
            return <line key={i} x1={BAR_CHART_PADDING.left} y1={y} x2={BAR_CHART_PADDING.left + BAR_CHART_WIDTH} y2={y} stroke="#F1F5F9" strokeWidth={1} />;
          })}
          {data.map((d, i) => {
            const barHeight = (d.value / maxVal) * BAR_CHART_HEIGHT;
            const x = BAR_CHART_PADDING.left + startOffset + i * (barW + gap);
            const y = BAR_CHART_PADDING.top + BAR_CHART_HEIGHT - barHeight;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barHeight}
                  rx={barW / 4}
                  ry={barW / 4}
                  fill="url(#barGradient)"
                  className="hover:opacity-80 transition-opacity"
                />
                {/* Value label on top */}
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" style={{ fontSize: 9, fontWeight: 600 }} fill="#64748B">
                  {d.value}
                </text>
                <text x={x + barW / 2} y={BAR_CHART_PADDING.top + BAR_CHART_HEIGHT + 18} textAnchor="middle" style={{ fontSize: 10, fontWeight: 500 }} fill="#94A3B8">
                  {d.label}
                </text>
              </g>
            );
          })}
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const val = Math.round(maxVal * pct);
            const y = BAR_CHART_PADDING.top + BAR_CHART_HEIGHT - pct * BAR_CHART_HEIGHT;
            return (
              <text key={i} x={BAR_CHART_PADDING.left - 8} y={y + 4} textAnchor="end" style={{ fontSize: 10, fontWeight: 500 }} fill="#94A3B8">
                {val}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function DashboardPageContent() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const useDemo = searchParams.get('demo') === '1';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logsPage, setLogsPage] = useState<PageResponse<FanLogItem> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incomePeriod, setIncomePeriod] = useState<'week' | 'month' | 'year'>('week');
  const [usagePeriod, setUsagePeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    } else if (user?.role !== 'admin') {
      router.push('/home');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      if (useDemo) {
        if (!cancelled) {
          setStats(mockDashboardStats);
          setLogsPage(getMockLogsPage(page, PAGE_SIZE));
        }
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const [statsRes, logsRes] = await Promise.all([
          adminDashboardApi.getStats(),
          adminDashboardApi.getLogs(page, PAGE_SIZE),
        ]);
        if (!cancelled) {
          setStats(statsRes);
          setLogsPage(logsRes);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setStats(mockDashboardStats);
          setLogsPage(getMockLogsPage(page, PAGE_SIZE));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.role, page, useDemo]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (loading && !stats) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-[40vh]">
          <p className="text-[#333333]">{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1E293B]">{t('dashboard.title')}</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">{t('dashboard.controlPanel')}</p>
        </div>

        {error && (
          <div className="mb-5 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="rounded-xl p-4 sm:p-5 text-white flex flex-col shadow-md bg-[#2F80ED]">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <span className="text-white/90 text-[11px] sm:text-sm font-medium leading-tight">{t('dashboard.dailyRevenue')}</span>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{(stats.logsToday * 40).toLocaleString()}</p>
                <span className="text-[11px] sm:text-xs text-white/70 font-medium">{t('dashboard.currency')}</span>
                <button type="button" onClick={() => document.getElementById('income-chart')?.scrollIntoView({ behavior: 'smooth' })} className="text-[11px] sm:text-sm text-white/90 hover:text-white flex items-center gap-1 mt-auto pt-2">
                  {t('dashboard.moreInfo')}
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="rounded-xl p-4 sm:p-5 text-white flex flex-col shadow-md bg-[#22C55E]">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <span className="text-white/90 text-[11px] sm:text-sm font-medium leading-tight">{t('dashboard.dailyUsage')}</span>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">{stats.logsToday.toLocaleString()}</p>
                <button type="button" onClick={() => document.getElementById('by-machine')?.scrollIntoView({ behavior: 'smooth' })} className="text-[11px] sm:text-sm text-white/90 hover:text-white flex items-center gap-1 mt-auto">
                  {t('dashboard.moreInfo')}
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <div className="rounded-xl p-4 sm:p-5 text-white flex flex-col shadow-md bg-[#F97316]">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <span className="text-white/90 text-[11px] sm:text-sm font-medium leading-tight">{t('dashboard.logsThisWeek')}</span>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">{stats.logsThisWeek.toLocaleString()}</p>
                <button type="button" onClick={() => document.getElementById('recent-logs')?.scrollIntoView({ behavior: 'smooth' })} className="text-[11px] sm:text-sm text-white/90 hover:text-white flex items-center gap-1 mt-auto">
                  {t('dashboard.moreInfo')}
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <div className="rounded-xl p-4 sm:p-5 text-white flex flex-col shadow-md bg-[#EF4444]">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <span className="text-white/90 text-[11px] sm:text-sm font-medium leading-tight">{t('dashboard.byMachine')}</span>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">{stats.byFan.length}</p>
                <button type="button" onClick={() => document.getElementById('by-machine')?.scrollIntoView({ behavior: 'smooth' })} className="text-[11px] sm:text-sm text-white/90 hover:text-white flex items-center gap-1 mt-auto">
                  {t('dashboard.moreInfo')}
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </>
        )}

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <IncomeLineChart period={incomePeriod} onPeriodChange={setIncomePeriod} t={t} />
            <UsageBarChart period={usagePeriod} onPeriodChange={setUsagePeriod} t={t} />
          </div>
        )}

        {/* Recent logs */}
        <div id="recent-logs" className="bg-white rounded-xl shadow-sm border border-[#F2F4F7] overflow-hidden">
          <h2 className="text-sm font-semibold text-[#1E293B] px-4 sm:px-6 py-3 sm:py-4 border-b border-[#F2F4F7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#2F80ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('dashboard.recentLogs')}
          </h2>
          {loading && !logsPage ? (
            <div className="p-8 text-center text-[#64748B]">{t('common.loading')}</div>
          ) : !logsPage?.content.length ? (
            <div className="p-8 text-center text-[#64748B]">{t('dashboard.noLogs')}</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-left text-[#64748B] uppercase tracking-wide text-xs">
                      <th className="px-4 py-3 font-medium">{t('dashboard.logDate')}</th>
                      <th className="px-4 py-3 font-medium">{t('dashboard.fanName')}</th>
                      <th className="px-4 py-3 font-medium">{t('dashboard.fanId')}</th>
                      <th className="px-4 py-3 font-medium">{t('dashboard.status')}</th>
                      <th className="px-4 py-3 font-medium">{t('dashboard.coin')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsPage.content.map((log) => (
                      <tr key={log.id} className="border-t border-[#F2F4F7] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 text-[#1E293B] whitespace-nowrap">{log.log_date ?? '-'}</td>
                        <td className="px-4 py-3 text-[#1E293B]">{log.fan_name ?? '-'}</td>
                        <td className="px-4 py-3 text-[#64748B]">{log.fan_id ?? '-'}</td>
                        <td className="px-4 py-3 text-[#1E293B]">{log.fan_status ?? '-'}</td>
                        <td className="px-4 py-3 text-[#1E293B] font-medium">{log.coin ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-[#F2F4F7]">
                {logsPage.content.map((log) => (
                  <div key={log.id} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-[#1E293B]">{log.fan_name ?? '-'}</span>
                      <span className="text-[11px] text-[#94A3B8]">{log.log_date ?? '-'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="text-[#64748B]">{t('dashboard.fanId')}: <span className="text-[#1E293B] font-medium">{log.fan_id ?? '-'}</span></span>
                      <span className="text-[#64748B]">{t('dashboard.status')}: <span className="text-[#1E293B] font-medium">{log.fan_status ?? '-'}</span></span>
                      <span className="text-[#64748B]">{t('dashboard.coin')}: <span className="text-[#1E293B] font-semibold">{log.coin ?? '-'}</span></span>
                    </div>
                  </div>
                ))}
              </div>

              {logsPage.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-[#F2F4F7] flex items-center justify-between bg-[#F8FAFC]">
                  <p className="text-[11px] sm:text-xs text-[#64748B]">
                    {logsPage.totalElements} {t('dashboard.totalLogs')}
                  </p>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="size-8 sm:px-3 sm:py-1.5 rounded-lg border border-[#E2E8F0] text-[#1E293B] disabled:opacity-40 hover:bg-[#EFF6FF] transition-colors flex items-center justify-center text-sm"
                    >
                      ←
                    </button>
                    <span className="px-2 sm:px-3 py-1.5 text-[#64748B] text-xs sm:text-sm tabular-nums">
                      {page + 1}/{logsPage.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(logsPage.totalPages - 1, p + 1))}
                      disabled={page >= logsPage.totalPages - 1}
                      className="size-8 sm:px-3 sm:py-1.5 rounded-lg border border-[#E2E8F0] text-[#1E293B] disabled:opacity-40 hover:bg-[#EFF6FF] transition-colors flex items-center justify-center text-sm"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-[40vh]">
          <p className="text-[#333333]">Loading...</p>
        </div>
      </Layout>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}
