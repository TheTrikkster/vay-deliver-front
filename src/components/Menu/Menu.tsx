import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthenticator } from '@aws-amplify/ui-react';

interface MenuProps {
  showAddProd?: boolean;
}

function Menu({ showAddProd = false }: MenuProps) {
  const { signOut } = useAuthenticator();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('menu');

  const MENU_LINKS = [
    { path: '/admin-products', label: t('links.products') },
    { path: '/admin-orders', label: t('links.orders') },
    { path: '/admin-settings', label: t('links.settings') },
    { path: '/logout', label: t('links.logout') },
  ];

  const isActivePage = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center py-4 pl-4 pr-2">
          <div>
            {showAddProd && (
              <Link
                to="/create-product"
                className="flex items-center gap-2 text-[#1E1E1E] hover:text-[#9DA0A5] transition-colors"
              >
                <span className="text-base md:text-xl font-medium">{t('actions.add')}</span>
                <span className="text-2xl md:text-3xl font-light leading-none">+</span>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="p-1 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label={isOpen ? t('aria.toggleMenu') : t('aria.openMenu')}
            aria-expanded={isOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('aria.mainMenu')}
        className={`fixed inset-0 bg-white z-40 transform transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-2 p-1 text-gray-700 hover:bg-gray-100"
          aria-label={t('aria.closeMenu')}
          data-testid="close-menu-button"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <nav className="flex flex-col items-center justify-center h-full space-y-8 text-2xl">
          {MENU_LINKS.map(({ path, label }) =>
            path === '/logout' ? (
              <button
                key={path}
                onClick={signOut}
                className="hover:text-gray-600 rounded transition-colors"
                type="button"
              >
                {label}
              </button>
            ) : (
              <Link
                key={path}
                to={path}
                className={`hover:text-gray-600 transition-colors ${
                  isActivePage(path) ? 'text-[#4F46E5] font-medium' : ''
                }`}
              >
                {label}
              </Link>
            )
          )}
        </nav>
      </div>
    </>
  );
}

export default Menu;
