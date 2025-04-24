import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Menu() {
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

  const menuItems = [
    { name: 'Продукты', path: '/products' },
    { name: 'Заказы', path: '/orders' },
    { name: 'Доставки', path: '/deliveries' },
    { name: 'О нас', path: '/about' },
    { name: 'Контакты', path: '/contact' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Header desktop et mobile */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a href="/create-product">
              <div className="flex items-center gap-2 text-[#1E1E1E] hover:text-[#9DA0A5]">
                <span className="text-xl font-medium">Добавить</span>
                <span className="text-3xl font-light leading-none">+</span>
              </div>
            </a>

            {/* Navigation desktop */}
            <nav className="hidden md:flex space-x-8">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`py-2 px-3 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#22C55D] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Bouton connexion desktop */}
            <div className="hidden md:block">
              <Link
                to="/login"
                className="py-2 px-4 border border-[#22C55D] text-[#22C55D] rounded-lg hover:bg-[#22C55D] hover:text-white transition-colors"
              >
                Войти
              </Link>
            </div>

            {/* Bouton hamburger mobile */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMenu}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 w-64 bg-white z-40 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-[#22C55D]">Меню</span>
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
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
            </div>
          </div>

          {/* Navigation mobile */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-4">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#22C55D] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Bouton connexion mobile */}
          <div className="p-4 border-t">
            <Link
              to="/login"
              className="block w-full py-2 text-center bg-[#22C55D] text-white rounded-lg hover:bg-[#1FAA4F] transition-colors"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>

      {/* Espace pour compenser la hauteur du header fixe */}
      <div className="h-16"></div>
    </>
  );
}

export default Menu;
