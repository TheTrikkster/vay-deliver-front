import React from 'react';
import { useTranslation } from 'react-i18next';

interface ContinueRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onCancel: () => void;
  isLoading: boolean;
  currentAction: 'COMPLETE' | 'CANCEL' | null;
}

const ContinueRouteModal: React.FC<ContinueRouteModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  onCancel,
  isLoading,
  currentAction,
}) => {
  const { t } = useTranslation('order');

  if (!isOpen) return null;

  const handleClose = () => {
    // Empêcher la fermeture pendant le loading
    if (isLoading) return;
    onClose();
  };

  const handleComplete = () => {
    // Empêcher les clics multiples pendant le loading
    if (isLoading) return;
    onComplete();
  };

  const handleCancel = () => {
    // Empêcher les clics multiples pendant le loading
    if (isLoading) return;
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 md:px-0">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        {/* En-tête avec icône */}
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('continueRouteTitle')}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{t('continueRouteMessage')}</p>
        </div>

        <div className="space-y-3">
          {/* Bouton Terminer avec icône */}
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="w-full px-4 py-3 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600 disabled:bg-green-500 disabled:hover:bg-green-500 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {currentAction === 'COMPLETE' && isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span className="font-medium">{t('completing')}</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">{t('terminateOrder')}</span>
              </>
            )}
          </button>

          {/* Bouton Annuler avec icône */}
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full px-4 py-3 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600 disabled:bg-red-500 disabled:hover:bg-red-500 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {currentAction === 'CANCEL' && isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span className="font-medium">{t('canceling')}</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="font-medium">{t('cancelOrder')}</span>
              </>
            )}
          </button>

          {/* Séparateur visuel */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>

          {/* Bouton Retour avec style différent */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl border border-gray-200 text-gray-700 font-medium flex items-center justify-center gap-2 hover:shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContinueRouteModal;
