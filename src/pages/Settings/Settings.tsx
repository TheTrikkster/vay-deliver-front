import React, { useState } from 'react';
import Menu from '../../components/Menu/Menu';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { ProductStatus } from '../../types/product';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useTranslation } from 'react-i18next';

function Settings() {
  const { t } = useTranslation('settings');
  const { signOut } = useAuthenticator();
  const [status, setStatus] = useState(ProductStatus.INACTIVE);
  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen md:bg-gray-50">
      <Menu />
      <div className="w-full px-6 pt-10 md:px-4 md:py-4 md:max-w-2xl md:mx-auto md:py-8">
        <div className="bg-white md:rounded-lg md:shadow-sm md:p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{t('title')}</h1>
            <div className="flex items-center justify-between md:space-x-4">
              <LanguageSwitcher />
              <button
                onClick={signOut}
                className="text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded px-4 py-2 transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 mb-10">
            <h2 className="text-base md:text-lg font-medium text-gray-800">
              {status === ProductStatus.ACTIVE ? t('siteEnabled') : t('siteDisabled')}
            </h2>
            <button
              onClick={() => {
                const newStatus =
                  status === ProductStatus.ACTIVE ? ProductStatus.INACTIVE : ProductStatus.ACTIVE;
                setStatus(newStatus);
              }}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none md:h-8 md:w-14 ${
                status === ProductStatus.ACTIVE ? 'bg-[#22C55D]' : 'bg-[#9DA0A5]'
              }`}
              aria-pressed={status === ProductStatus.ACTIVE}
              aria-label={status === ProductStatus.ACTIVE ? 'disable' : 'enable'}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm md:h-6 md:w-6 ${
                  status === ProductStatus.ACTIVE ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {status === ProductStatus.INACTIVE && (
            <>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('visitorMessage')}
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t('placeholder')}
                  className="w-full h-28 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-500 placeholder-gray-400 text-base mb-8 outline-none resize-none"
                />
              </div>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-md transition-colors text-sm md:text-base">
                {t('confirm')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
