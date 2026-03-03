'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useWashingMachines } from '../../../contexts/WashingMachineContext';
import Layout from '../../../components/Layout';
import Image from 'next/image';
import ConfirmationModal from '../../../components/ConfirmationModal';

export default function EditMachinePage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const machineId = params.id as string;
  const { getMachineById, deleteMachine, updateMachine } = useWashingMachines();
  const [machine, setMachine] = useState(getMachineById(machineId));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    machineNumber: '',
    capacity: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    } else if (user?.role !== 'admin') {
      router.push('/home');
    }
  }, [isAuthenticated, user, router]);

  // โหลดข้อมูลเครื่องเฉพาะเมื่อ machineId เปลี่ยน อย่าใส่ getMachineById ใน deps เพราะจะทำให้ฟอร์มถูก reset ทุกครั้งที่พิมพ์
  useEffect(() => {
    const foundMachine = getMachineById(machineId);
    if (foundMachine) {
      setMachine(foundMachine);
      setFormData({
        machineNumber: foundMachine.machineNumber || '',
        capacity: foundMachine.capacity?.toString() || '',
      });
    } else {
      setError(t('error.delete.notFound'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineId]);

  const handleSave = async () => {
    if (!machine) return;

    setError('');
    setIsSaving(true);

    // Validate
    if (!formData.machineNumber || !formData.capacity) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      setIsSaving(false);
      return;
    }

    const capacityNum = parseInt(formData.capacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      setError('กรุณากรอกน้ำหนักที่ถูกต้อง');
      setIsSaving(false);
      return;
    }

    // Update machine
    const result = await updateMachine(machine.id, {
      machineNumber: formData.machineNumber,
      capacity: capacityNum,
      name: `เครื่องซักผ้า ${formData.machineNumber}`,
    });

    if (result.success) {
      // Update local machine state
      setMachine({
        ...machine,
        machineNumber: formData.machineNumber,
        capacity: capacityNum,
        name: `เครื่องซักผ้า ${formData.machineNumber}`,
      });
      alert('บันทึกข้อมูลสำเร็จ');
    } else {
      setError(result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }

    setIsSaving(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!machine) return;

    setIsDeleting(true);
    setError('');

    const result = await deleteMachine(machine.id);

    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || t('error.delete.failed'));
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Check if form data has been modified
  const hasChanges = machine && (
    formData.machineNumber !== (machine.machineNumber || '') ||
    formData.capacity !== (machine.capacity?.toString() || '')
  );

  if (!isAuthenticated || user?.role !== 'admin' || !machine) {
    return null;
  }

  if (!machine) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white rounded-xl px-6 py-4 mb-6 shadow-sm">
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            ) : (
              <p className="text-[#333333]">{t('common.loading')}</p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] transition-colors w-fit group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#F8FAFC] transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium text-sm">{t('nav.back' /* fallback if missing */) || 'กลับ'}</span>
          </button>

          <div className="h-4 w-[1px] bg-[#E2E8F0] hidden sm:block mx-1"></div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/images/LogoAxy.png"
                alt="Logo"
                width={24}
                height={24}
                className="object-contain brightness-0 invert"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">{t('edit.title')}</h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl p-6 shadow-[var(--shadow-card)] border border-[var(--border-light)] max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Section - Machine Illustration */}
            <div className="relative">
              {/* Washing Machine Illustration */}
              <div
                className={`flex-1 relative rounded-xl ml-4 sm:ml-0 overflow-hidden flex items-center justify-center p-6 border border-[#E2E8F0] shadow-sm bg-gradient-to-b from-[#F0FDF4] to-white`}
              >
                <div className="py-4 w-full h-full flex flex-col items-center flex-1 w-full flex align-center max-w-[250px]">
                  <Image
                    src="/images/washing.png"
                    alt={t('common.washingMachine')}
                    layout="responsive"
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Right Section - Edit Form */}
            <div className="flex flex-col justify-center gap-6">
              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    {t('add.machineNumber')}
                  </label>
                  <input
                    type="text"
                    value={formData.machineNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, machineNumber: e.target.value });
                      setError('');
                    }}
                    className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-xl bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all"
                    placeholder={t('add.placeholder.number')}
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    {t('add.capacity')}
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => {
                      setFormData({ ...formData, capacity: e.target.value });
                      setError('');
                    }}
                    className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-xl bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] transition-all"
                    placeholder={t('add.placeholder.capacity')}
                    min="1"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md shadow-[var(--brand-primary)]/20 hover:shadow-lg active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {isSaving && (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>

                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting || isSaving}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed disabled:hover:bg-red-300 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {isDeleting && (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {t('edit.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('edit.delete')}
        message={t('edit.confirm.delete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        isLoading={isDeleting}
      />
    </Layout>
  );
}

