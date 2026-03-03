'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useWashingMachines } from '../contexts/WashingMachineContext';
import Layout from '../components/Layout';
import Image from 'next/image';

type StatusFilter = 'all' | 'available' | 'in-use';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();
  const { machines, updateMachine, isLoading } = useWashingMachines();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Real-time countdown timer - calculate from updated_date every second
  const [displayTime, setDisplayTime] = useState<Map<string, number>>(new Map());

  // Helper function to calculate time remaining from updated_date
  const calculateTimeFromUpdatedDate = (updatedDate: string | null | undefined): number | undefined => {
    if (!updatedDate) return undefined;

    try {
      let startTime: number;
      const dateStr = typeof updatedDate === 'string' ? updatedDate.trim() : String(updatedDate);

      // Backend uses Jackson with JavaTimeModule, which serializes LocalDateTime as ISO string
      // Format: "2024-01-01T12:00:00" or "2024-01-01T12:00:00.000" (without timezone)
      // Parse ISO string without timezone as local time
      if (dateStr.includes('T')) {
        // ISO format: "2024-01-01T12:00:00" or "2024-01-01T12:00:00.000"
        // Split to get date and time parts
        const [datePart, timePart] = dateStr.split('T');
        if (datePart && timePart) {
          const [year, month, day] = datePart.split('-').map(Number);
          const timeStr = timePart.split('.')[0]; // Remove milliseconds if present
          const [hour, minute, second = 0] = timeStr.split(':').map(Number);

          // Create Date object using local time (matches Backend's LocalDateTime)
          const dateObj = new Date(year, month - 1, day, hour, minute, second);
          startTime = dateObj.getTime();

          if (isNaN(startTime)) {
            console.warn('Invalid date parsed from:', dateStr);
            return undefined;
          }
        } else {
          // Fallback to standard Date parsing
          const dateObj = new Date(dateStr);
          if (isNaN(dateObj.getTime())) {
            console.warn('Failed to parse date:', dateStr);
            return undefined;
          }
          startTime = dateObj.getTime();
        }
      } else {
        // Try parsing as JSON (for array/object format)
        try {
          const parsed = JSON.parse(dateStr);
          if (Array.isArray(parsed)) {
            // LocalDateTime array format: [2024, 1, 1, 12, 0, 0, 0]
            const [year, month, day, hour = 0, minute = 0, second = 0] = parsed;
            startTime = new Date(year, month - 1, day, hour, minute, second).getTime();
          } else if (typeof parsed === 'object' && parsed !== null) {
            // Object format: { year: 2024, month: 1, day: 1, hour: 12, ... }
            const { year, month, day, hour = 0, minute = 0, second = 0 } = parsed;
            startTime = new Date(year, month - 1, day, hour, minute, second).getTime();
          } else {
            console.warn('Unknown updated_date format:', updatedDate);
            return undefined;
          }
        } catch {
          // Try standard Date parsing as last resort
          const dateObj = new Date(dateStr);
          if (isNaN(dateObj.getTime())) {
            console.warn('Failed to parse updated_date:', updatedDate);
            return undefined;
          }
          startTime = dateObj.getTime();
        }
      }

      if (isNaN(startTime)) {
        console.warn('Invalid startTime from updated_date:', updatedDate);
        return undefined;
      }

      const now = Date.now();
      const elapsedMilliseconds = now - startTime;
      const elapsedMinutes = elapsedMilliseconds / 60000; // elapsed in minutes (with decimals)

      // Default duration: 5 minutes
      const defaultDuration = 5; // minutes
      const remainingMinutes = defaultDuration - elapsedMinutes;

      // Return remaining time in minutes (with decimals for precision)
      return remainingMinutes > 0 ? remainingMinutes : undefined;
    } catch (error) {
      console.error('Error calculating time from updated_date:', error, 'updatedDate:', updatedDate);
      return undefined;
    }
  };

  useEffect(() => {
    // Calculate initial time from updated_date
    const initialDisplayTime = new Map<string, number>();

    machines.forEach((machine) => {
      if (machine.status === 'in-use' && machine.updatedDate) {
        const timeRemaining = calculateTimeFromUpdatedDate(machine.updatedDate);
        if (timeRemaining !== undefined && timeRemaining > 0) {
          initialDisplayTime.set(machine.id, timeRemaining);
        }
      }
    });
    setDisplayTime(initialDisplayTime);

    // Update countdown every second by recalculating from updated_date
    const interval = setInterval(() => {
      const newDisplayTime = new Map<string, number>();
      let hasChanges = false;

      machines.forEach((machine) => {
        if (machine.status === 'in-use' && machine.updatedDate) {
          // Recalculate time remaining from updated_date every second
          const timeRemaining = calculateTimeFromUpdatedDate(machine.updatedDate);

          if (timeRemaining !== undefined && timeRemaining > 0) {
            // Round to 2 decimal places for display
            const roundedTime = Math.round(timeRemaining * 100) / 100;
            newDisplayTime.set(machine.id, roundedTime);
            hasChanges = true;

            // If time is up (less than 0.1 minute), change status to available
            if (timeRemaining < 0.1) {
              updateMachine(machine.id, {
                status: 'available',
                currentUser: undefined,
                timeRemaining: undefined,
                program: undefined,
              });
            }
          } else {
            // Time is up, change status to available
            updateMachine(machine.id, {
              status: 'available',
              currentUser: undefined,
              timeRemaining: undefined,
              program: undefined,
            });
          }
        }
      });

      if (hasChanges) {
        setDisplayTime(newDisplayTime);
      }
    }, 1000); // Update every second for real-time countdown

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machines]);

  const handleStatusChange = async (id: string, status: 'available' | 'in-use' | 'maintenance') => {
    await updateMachine(id, {
      status,
      ...(status === 'available' && {
        currentUser: undefined,
        timeRemaining: undefined,
        program: undefined,
      }),
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <p className="text-[#333333]">{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  // Format time remaining to readable format (with seconds)
  const formatTimeRemaining = (minutes: number | undefined): string => {
    if (!minutes || minutes <= 0) return '';

    // Convert minutes to total seconds for precise calculation
    const totalSeconds = Math.floor(minutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    // Build time string with appropriate units
    const parts: string[] = [];

    if (hours > 0) {
      parts.push(`${hours} ${t('home.hours')}`);
    }
    if (mins > 0) {
      parts.push(`${mins} ${t('home.minutes')}`);
    }
    if (secs > 0 || (hours === 0 && mins === 0)) {
      // Always show seconds if less than a minute, or if it's the only unit
      parts.push(`${secs} ${t('home.seconds')}`);
    }

    return parts.length > 0 ? parts.join(' ') : '0 ' + t('home.seconds');
  };

  // Filter machines by status
  const filteredMachines = machines.filter((machine) => {
    if (statusFilter === 'all') return true;
    return machine.status === statusFilter;
  });

  // Count machines by status
  const statusCounts = {
    all: machines.length,
    available: machines.filter(m => m.status === 'available').length,
    'in-use': machines.filter(m => m.status === 'in-use').length,
  };

  return (
    <Layout
      headerExtra={
        <div className="hidden sm:flex items-center gap-1.5 bg-[#F1F5F9] rounded-xl p-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${statusFilter === 'all'
              ? 'bg-white text-[#1E293B] shadow-sm'
              : 'text-[#94A3B8] hover:text-[#64748B]'
              }`}
          >
            {t('admin.filter.all')} ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('in-use')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${statusFilter === 'in-use'
              ? 'bg-white text-[#1E293B] shadow-sm'
              : 'text-[#94A3B8] hover:text-[#64748B]'
              }`}
          >
            {t('home.status.active')} ({statusCounts['in-use']})
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${statusFilter === 'available'
              ? 'bg-white text-[#1E293B] shadow-sm'
              : 'text-[#94A3B8] hover:text-[#64748B]'
              }`}
          >
            {t('home.status.available')} ({statusCounts.available})
          </button>
        </div>
      }
    >
      <div>
        {/* Mobile filter pills */}
        <div className="sm:hidden flex gap-2 mb-4 overflow-x-auto pb-1">
          <button onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${statusFilter === 'all' ? 'bg-[#4F6EF7] text-white shadow-sm' : 'bg-white text-[#94A3B8] border border-[#E2E8F0]'}`}>
            {t('admin.filter.all')} ({statusCounts.all})
          </button>
          <button onClick={() => setStatusFilter('in-use')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${statusFilter === 'in-use' ? 'bg-[#3B82F6] text-white shadow-sm' : 'bg-white text-[#94A3B8] border border-[#E2E8F0]'}`}>
            {t('home.status.active')} ({statusCounts['in-use']})
          </button>
          <button onClick={() => setStatusFilter('available')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${statusFilter === 'available' ? 'bg-[#22C55E] text-white shadow-sm' : 'bg-white text-[#94A3B8] border border-[#E2E8F0]'}`}>
            {t('home.status.available')} ({statusCounts.available})
          </button>
        </div>

        {/* Title + Status Summary */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1D26] tracking-tight">
              {t('home.title')}
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              {t('home.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-xs font-semibold text-[#16A34A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
              {t('home.status.available')}: {statusCounts.available}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBEAFE] text-xs font-semibold text-[#2563EB]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse-dot"></span>
              {t('home.status.in-use')}: {statusCounts['in-use']}
            </span>
          </div>
        </div>

        {/* Machine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMachines.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[#E2E8F0]">
              <svg className="size-12 text-[#CBD5E1] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              </svg>
              <p className="text-[#94A3B8] text-sm font-medium">{t('admin.filter.noResults')}</p>
            </div>
          ) : (
            filteredMachines.map((machine) => {
              const currentTimeRemaining = displayTime.get(machine.id) ??
                (machine.status === 'in-use' && machine.updatedDate
                  ? calculateTimeFromUpdatedDate(machine.updatedDate)
                  : undefined);
              const showTimeRemaining = machine.status === 'in-use' && currentTimeRemaining !== undefined && currentTimeRemaining > 0;
              const totalCycleTime = 45 * 60; // 45 min default cycle
              const progress = showTimeRemaining && currentTimeRemaining ? Math.max(0, Math.min(100, ((totalCycleTime - currentTimeRemaining) / totalCycleTime) * 100)) : 0;

              const statusConfig = {
                'available': { label: t('home.status.available'), bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', dot: 'bg-[#22C55E]', imageBg: 'from-[#F0FDF4] to-white' },
                'in-use': { label: t('home.status.in-use'), bg: 'bg-[#DBEAFE]', text: 'text-[#2563EB]', dot: 'bg-[#3B82F6]', imageBg: 'from-[#EFF6FF] to-white' },
                'maintenance': { label: t('home.status.error'), bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', dot: 'bg-[#EF4444]', imageBg: 'from-[#FEF2F2] to-white' },
              }[machine.status] || { label: t('home.status.available'), bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', dot: 'bg-[#22C55E]', imageBg: 'from-[#F0FDF4] to-white' };
              const isError = machine.status === 'maintenance';

              return (
                <div
                  key={machine.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-lg transition-all duration-300"
                >
                  {/* ── Header: Machine Name ── */}
                  <div className="px-5 pt-5 pb-2">
                    <h3 className="text-lg font-bold text-[#1A1D26] tracking-tight">
                      MACHINE-{machine.machineNumber ? machine.machineNumber.padStart(3, '0') : String(machine.id).padStart(3, '0')}
                    </h3>
                    <p className="text-[13px] text-[#94A3B8] mt-0.5 font-medium">
                      {machine.name || t('common.washingMachine')} {t('home.machineNo')} {machine.machineNumber || machine.id}
                    </p>
                  </div>

                  {/* ── Info Row: Status / Capacity / Time ── */}
                  <div className="px-5 pb-3 grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-medium mb-1">{t('home.status.label')}</p>
                      <div className="flex items-center gap-1.5">
                        <span className={`size-2.5 rounded-full ${statusConfig.dot}`}></span>
                        <span className={`text-[13px] font-semibold ${statusConfig.text}`}>{statusConfig.label}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-medium mb-1">{t('home.capacity')}</p>
                      <p className="text-[13px] font-semibold text-[#1E293B]">{(machine.capacity || 0)} {t('home.kg')}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-medium mb-1">{t('home.timeRemaining')}</p>
                      <p className="text-[13px] font-semibold text-[#1E293B] tabular-nums">
                        {showTimeRemaining && currentTimeRemaining ? formatTimeRemaining(currentTimeRemaining) : '-'}
                      </p>
                    </div>
                  </div>

                  {/* ── Machine Image ── */}
                  <div className={`mx-4 mb-4 rounded-xl bg-gradient-to-b ${statusConfig.imageBg} flex items-center justify-center overflow-hidden`}
                    style={{ minHeight: '180px' }}
                  >
                    {isError ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="size-16 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-2">
                          <svg className="size-8 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <p className="text-[12px] font-semibold text-[#EF4444] uppercase tracking-wide">{t('home.status.error')}</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Image
                          src="/images/washing.png"
                          alt={t('common.washingMachine')}
                          width={160}
                          height={160}
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
