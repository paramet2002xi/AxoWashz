'use client';

import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmButtonColor = 'bg-red-500 hover:bg-red-600',
  isLoading = false,
}: ConfirmationModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 border border-[#F2F4F7]">
        <h2 className="text-xl font-bold text-[#333333] mb-4">{title}</h2>
        <p className="text-[#333333] mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-[#F2F4F7] hover:bg-[#E0E4E9] text-[#333333] font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {cancelText || t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 ${confirmButtonColor} text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md`}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {confirmText || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}


