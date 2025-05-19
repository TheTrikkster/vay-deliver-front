import React, { useState } from 'react';
import Menu from '../components/Menu/Menu';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ProductStatus } from '../types/product';
import { useAuthenticator } from '@aws-amplify/ui-react';

function Settings() {
  const { user, signOut } = useAuthenticator();
  const [status, setStatus] = useState(ProductStatus.INACTIVE);
  return (
    <div>
      <Menu />
      <LanguageSwitcher />
      <button onClick={signOut}>Sign Out</button>
      <div className="flex flex-col items-center justify-center">
        <h1>Settings</h1>

        <div className="flex justify-end">
          <button
            onClick={() => {
              const newStatus =
                status === ProductStatus.ACTIVE ? ProductStatus.INACTIVE : ProductStatus.ACTIVE;

              setStatus(newStatus);
            }}
            className={`relative inline-flex h-7 md:h-8 w-12 md:w-14 items-center rounded-full transition-colors focus:outline-none ${
              status == ProductStatus.ACTIVE ? 'bg-[#22C55D]' : 'bg-[#9DA0A5]'
            }`}
            aria-pressed={status === ProductStatus.ACTIVE}
            aria-label={status === ProductStatus.ACTIVE ? 'disable' : 'enable'}
          >
            <span
              className={`inline-block h-5 md:h-6 w-5 md:w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                status == ProductStatus.ACTIVE ? 'translate-x-6 md:translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <textarea className="border" />

        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Confirm</button>
      </div>
    </div>
  );
}

export default Settings;
