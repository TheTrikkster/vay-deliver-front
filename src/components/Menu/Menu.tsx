import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Menu({ showAddProd = false }: { showAddProd?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Ferme le menu mobile quand on change de page
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Empêche le défilement du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center py-4 pl-4 pr-2">
          {/* Logo ou div vide */}
          <div>
            {showAddProd && (
              <a href="/create-product">
                <div className="flex justify-center items-center gap-2 text-[#1E1E1E] hover:text-[#9DA0A5]">
                  <span className="text-base md:text-xl font-medium">Добавить</span>
                  <span className="text-2xl md:text-3xl font-light leading-none">+</span>
                </div>
              </a>
            )}
          </div>

          {/* Bouton hamburger */}
          <button
            onClick={toggleMenu}
            className="p-1 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
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

      {/* Menu overlay */}
      <div
        className={`fixed inset-0 bg-white z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4 p-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
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

        <div className="flex flex-col items-center justify-center h-full space-y-8 text-2xl">
          <Link to="/products" className="hover:text-gray-600">
            Товары
          </Link>
          <Link to="/orders" className="hover:text-gray-600">
            Заказы
          </Link>
          <Link to="/settings" className="hover:text-gray-600">
            Настройки
          </Link>
          <Link to="/logout" className="hover:text-gray-600">
            Выйти
          </Link>
        </div>
      </div>
    </>
  );
}

export default Menu;
