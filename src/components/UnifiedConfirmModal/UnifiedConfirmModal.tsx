import React from 'react';
import { useTranslation } from 'react-i18next';

interface UnifiedConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: 'normal' | 'danger';
  isLoading?: boolean;
  // Textes personnalisables (optionnel, sinon utilise i18n)
  cancelText?: string;
  confirmText?: string;
  loadingText?: string;
  // Namespace i18n personnalisé (par défaut: 'confirmModal')
  translationNamespace?: string;
}

const UnifiedConfirmModal: React.FC<UnifiedConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'normal',
  isLoading = false,
  cancelText,
  confirmText,
  loadingText,
  translationNamespace = 'confirmModal',
}) => {
  const { t } = useTranslation(translationNamespace);

  if (!isOpen) return null;

  const handleClose = () => {
    // Empêcher la fermeture pendant le loading
    if (isLoading) return;
    onClose();
  };

  const handleConfirm = () => {
    // Empêcher les clics multiples pendant le loading
    if (isLoading) return;
    onConfirm();
  };

  const getButtonColors = () => {
    if (variant === 'danger') {
      return {
        normal: 'bg-red-500 hover:bg-red-600',
        disabled: 'disabled:bg-red-500 disabled:hover:bg-red-500',
      };
    }
    return {
      normal: 'bg-green-500 hover:bg-green-600',
      disabled: 'disabled:bg-green-500 disabled:hover:bg-green-500',
    };
  };

  const buttonColors = getButtonColors();

  // Utiliser les textes personnalisés ou les traductions par défaut
  const finalCancelText = cancelText || t('cancel');
  const finalConfirmText = confirmText || t('confirm');
  const finalLoadingText = loadingText || t('loading', 'Loading...');

  return (
    <div className="px-4 md:px-0 fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="mb-4 text-gray-600">{message}</p>
        <div className="flex justify-center gap-2">
          <button
            className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleClose}
            disabled={isLoading}
          >
            {finalCancelText}
          </button>
          <button
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative ${buttonColors.normal} ${buttonColors.disabled}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>{finalLoadingText}</span>
              </div>
            ) : (
              finalConfirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedConfirmModal;
