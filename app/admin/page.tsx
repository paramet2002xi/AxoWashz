'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useWashingMachines } from '../contexts/WashingMachineContext';
import Layout from '../components/Layout';
import Image from 'next/image';

type StatusFilter = 'all' | 'available' | 'in-use';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();
  const { machines, isLoading } = useWashingMachines();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    // รอสักครู่ให้ AuthContext อัปเดตหลัง redirect จากหน้า login (กันกรณี user ยังเป็น null ใน render แรก)
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/');
      } else if (user?.role !== 'admin') {
        router.push('/home');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user?.role, router]);

  // Format time remaining to readable format
  const formatTimeRemaining = (minutes: number | undefined): string => {
    if (!minutes || minutes <= 0) return '';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours} ${t('home.hours')} ${mins} ${t('home.minutes')}`;
    } else if (hours > 0) {
      return `${hours} ${t('home.hours')}`;
    } else {
      return `${mins} ${t('home.minutes')}`;
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

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

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <p className="text-[#333333]">{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {t('admin.title')}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {t('admin.subtitle')}
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/add')}
            className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-[var(--brand-primary)]/20 hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('admin.add')}</span>
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${statusFilter === 'all'
              ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/20'
              : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--brand-primary-light)] hover:text-[var(--brand-primary)] border border-[var(--border-default)]'
              }`}
          >
            {t('admin.filter.all')} ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${statusFilter === 'available'
              ? 'bg-[var(--status-available)] text-white shadow-md shadow-[var(--status-available)]/20'
              : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--status-available-bg)] hover:text-[var(--status-available)] border border-[var(--border-default)]'
              }`}
          >
            {t('home.status.available')} ({statusCounts.available})
          </button>
          <button
            onClick={() => setStatusFilter('in-use')}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${statusFilter === 'in-use'
              ? 'bg-[var(--status-in-use)] text-white shadow-md shadow-[var(--status-in-use)]/20'
              : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--status-in-use-bg)] hover:text-[var(--status-in-use)] border border-[var(--border-default)]'
              }`}
          >
            {t('home.status.in-use')} ({statusCounts['in-use']})
          </button>
        </div>

        {/* Machine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachines.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-[#666666] text-center">
                {t('admin.filter.noResults')}
              </p>
            </div>
          ) : (
            filteredMachines.map((machine) => {
              const showTimeRemaining = machine.status === 'in-use' && machine.timeRemaining !== undefined && machine.timeRemaining > 0;

              return (
                <div
                  key={machine.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow border border-[#E2E8F0] relative"
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
                        {machine.status === 'available' ? (
                          <>
                            <span className="size-2.5 rounded-full bg-[#22C55E]"></span>
                            <span className="text-[13px] font-semibold text-[#16A34A]">{t('home.status.available')}</span>
                          </>
                        ) : machine.status === 'in-use' ? (
                          <>
                            <span className="size-2.5 rounded-full bg-[#3B82F6]"></span>
                            <span className="text-[13px] font-semibold text-[#2563EB]">{t('home.status.in-use')}</span>
                          </>
                        ) : (
                          <>
                            <span className="size-2.5 rounded-full bg-[#EF4444]"></span>
                            <span className="text-[13px] font-semibold text-[#DC2626]">{t('home.status.available')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-medium mb-1">{t('home.capacity')}</p>
                      <p className="text-[13px] font-semibold text-[#1E293B]">{(machine.capacity || 0)} {t('home.kg')}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-medium mb-1">{t('home.timeRemaining')}</p>
                      <p className="text-[13px] font-semibold text-[#1E293B] tabular-nums">
                        {showTimeRemaining && machine.timeRemaining !== undefined && machine.timeRemaining > 0
                          ? formatTimeRemaining(machine.timeRemaining)
                          : '-'
                        }
                      </p>
                    </div>
                  </div>

                  {/* ── Machine Image ── */}
                  <div className={`mx-4 mb-4 rounded-xl bg-gradient-to-b ${machine.status === 'available' ? 'from-[#F0FDF4]' : machine.status === 'in-use' ? 'from-[#EFF6FF]' : 'from-[#FEF2F2]'} to-white flex items-center justify-center overflow-hidden`}
                    style={{ minHeight: '180px' }}
                  >
                    <div className="py-4">
                      <Image
                        src="/images/washing.png"
                        alt={t('common.washingMachine')}
                        width={160}
                        height={160}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Edit Button - Bottom */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => router.push(`/admin/edit/${machine.id}`)}
                      className="w-full bg-[#2F80ED] hover:bg-[#2563EB] text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm hover:shadow-md mt-auto"
                    >
                      {t('edit.clickEdit')}
                    </button>
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
