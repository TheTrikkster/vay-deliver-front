import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Menu from './Menu';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Simuler les traductions en fonction des clés
      const translations: { [key: string]: string } = {
        'actions.add': 'Добавить',
        'links.products': 'Товары',
        'links.orders': 'Заказы',
        'links.settings': 'Настройки',
        'links.logout': 'Выйти',
        'aria.openMenu': 'Открыть меню',
        'aria.toggleMenu': 'Переключить меню',
        'aria.mainMenu': 'Menu principal',
        'aria.closeMenu': 'Закрыть меню',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ru',
    },
  }),
}));

// Mock useLocation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/admin-products',
  }),
}));

// Wrapper pour fournir le contexte du router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Menu Component', () => {
  beforeEach(() => {
    // Reset le body overflow avant chaque test
    document.body.style.overflow = 'auto';
  });

  test("rend le menu avec le bouton d'ouverture", () => {
    renderWithRouter(<Menu />);
    expect(screen.getByRole('button', { name: /открыть меню/i })).toBeInTheDocument();
  });

  test('affiche le bouton "Добавить" quand showAddProd est true', () => {
    renderWithRouter(<Menu showAddProd={true} />);
    expect(screen.getByText('Добавить')).toBeInTheDocument();
  });

  test('ne pas afficher le bouton "Добавить" quand showAddProd est false', () => {
    renderWithRouter(<Menu showAddProd={false} />);
    expect(screen.queryByText('Добавить')).not.toBeInTheDocument();
  });

  test('ouvre le menu quand on clique sur le bouton du menu', async () => {
    renderWithRouter(<Menu />);
    const menuButton = screen.getByRole('button', { name: /открыть меню/i });

    fireEvent.click(menuButton);

    // Vérifier que le menu est visible
    const menu = screen.getByRole('dialog');
    expect(menu).toHaveClass('opacity-100');
    expect(menu).toHaveClass('translate-x-0');
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('ferme le menu quand on clique sur le bouton de fermeture', async () => {
    renderWithRouter(<Menu />);

    // Ouvrir le menu
    fireEvent.click(screen.getByRole('button', { name: /открыть меню/i }));

    // Ajouter un data-testid dans le composant pour le bouton de fermeture
    const closeButton = screen.getByTestId('close-menu-button');
    fireEvent.click(closeButton);

    const menu = screen.getByRole('dialog');
    expect(menu).toHaveClass('opacity-0');
    expect(menu).toHaveClass('translate-x-full');
    expect(document.body.style.overflow).toBe('auto');
  });

  test('ferme le menu quand on appuie sur Escape', async () => {
    renderWithRouter(<Menu />);

    // Ouvrir le menu
    fireEvent.click(screen.getByRole('button', { name: /открыть меню/i }));

    // Simuler l'appui sur Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    const menu = screen.getByRole('dialog');
    expect(menu).toHaveClass('opacity-0');
    expect(menu).toHaveClass('translate-x-full');
  });

  test('ferme le menu quand on clique en dehors', async () => {
    renderWithRouter(<Menu />);

    // Ouvrir le menu
    fireEvent.click(screen.getByRole('button', { name: /открыть меню/i }));

    // Simuler un clic en dehors du menu
    fireEvent.mouseDown(document.body);

    const menu = screen.getByRole('dialog');
    expect(menu).toHaveClass('opacity-0');
    expect(menu).toHaveClass('translate-x-full');
  });

  test('affiche tous les liens du menu', () => {
    renderWithRouter(<Menu />);

    // Ouvrir le menu
    fireEvent.click(screen.getByRole('button', { name: /открыть меню/i }));

    // Vérifier la présence de tous les liens
    expect(screen.getByText('Товары')).toBeInTheDocument();
    expect(screen.getByText('Заказы')).toBeInTheDocument();
    expect(screen.getByText('Настройки')).toBeInTheDocument();
    expect(screen.getByText('Выйти')).toBeInTheDocument();
  });

  test('met en surbrillance le lien actif', () => {
    renderWithRouter(<Menu />);
    fireEvent.click(screen.getByRole('button', { name: /открыть меню/i }));

    const activeLink = screen.getByRole('link', { name: 'Товары' });
    expect(activeLink).toHaveAttribute('href', '/admin-products');
  });

  test("vérifie l'accessibilité du menu", () => {
    renderWithRouter(<Menu />);

    const menuButton = screen.getByRole('button', { name: /открыть меню/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
