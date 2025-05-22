import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store/userStore';

function CompletedOrder() {
  const navigate = useNavigate();
  const { t } = useTranslation('completedOrder');
  const { products } = useSelector((state: RootState) => state.client);

  return products.length === 0 ? (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('emptyCart')}</h2>
        <p className="text-gray-600 mb-6">{t('addProducts')}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#4F46E5] text-white py-3 px-6 rounded-full text-lg font-medium hover:bg-[#4338CA] transition-colors"
        >
          {t('backToHome')}
        </button>
      </div>
    </div>
  ) : (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="text-2xl font-semibold text-[#4F46E5] mb-4">{t('orderSuccess')}</div>
      <div className="text-gray-600">{t('redirecting')}</div>
      <button
        onClick={() => navigate('/')}
        className="bg-[#4F46E5] hover:bg-[#4355DA] text-white px-4 py-2 rounded-md"
      >
        {t('goToHome')}
      </button>
    </div>
  );
}

export default CompletedOrder;
