'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWashingMachines } from '../../contexts/WashingMachineContext';
import Layout from '../../components/Layout';
import Image from 'next/image';

export default function AddMachinePage() {
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();
  const { addMachine } = useWashingMachines();
  const [formData, setFormData] = useState({
    machineNumber: '',
    capacity: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    } else if (user?.role !== 'admin') {
      router.push('/home');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.machineNumber || !formData.capacity) {
      setError(t('error.add.incomplete'));
      return;
    }

    const capacityNum = parseInt(formData.capacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      setError('กรุณากรอกน้ำหนักที่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);

    const result = await addMachine({
      name: `เครื่องซักผ้า ${formData.machineNumber}`,
      machineNumber: formData.machineNumber,
      capacity: capacityNum,
      status: 'available',
      location: 'ชั้น 1',
    });

    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || t('error.add.failed'));
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{t('add.title')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('add.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-[var(--shadow-card)] border border-[var(--border-light)]">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center justify-center flex-1">
                {/* Washing Machine */}
                <div className="flex items-center justify-center w-full">
                  <Image src="/images/washing.png" alt={t('common.washingMachine')} width={220} height={220} className="object-contain" />
                </div>
              </div>

              <div className="space-y-6 flex-1">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">{t('add.machineNumber')}</label>
                  <input
                    type="text"
                    value={formData.machineNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, machineNumber: e.target.value });
                      setError('');
                    }}
                    className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-xl bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all"
                    placeholder={t('add.placeholder.number')}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">{t('add.capacity')}</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => {
                      setFormData({ ...formData, capacity: e.target.value });
                      setError('');
                    }}
                    className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-xl bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all"
                    placeholder={t('add.placeholder.capacity')}
                    required
                    min="1"
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:bg-[var(--brand-primary)]/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all min-h-[48px] flex items-center justify-center gap-2 shadow-md shadow-[var(--brand-primary)]/20 hover:shadow-lg"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {t('add.submit')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

