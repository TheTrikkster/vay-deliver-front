import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <header className="p-4 bg-gray-100">
        <LanguageSwitcher />
      </header>
      <main>{children}</main>
    </>
  );
};

export default Layout;
