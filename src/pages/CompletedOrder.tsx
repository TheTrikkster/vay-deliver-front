import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function CompletedOrder() {
  const navigate = useNavigate();
  const { t } = useTranslation('completedOrder');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      <div className="text-center">
        <div className="text-2xl font-semibold text-[#4F46E5] mb-4">{t('orderSuccess')}</div>
        <p className="text-gray-600 mb-6">{t('redirecting')}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#4F46E5] text-white py-3 px-6 rounded-full text-lg font-medium hover:bg-[#4338CA] transition-colors"
        >
          {t('goToHome')}
        </button>
      </div>
    </div>
  );
}

export default CompletedOrder;
