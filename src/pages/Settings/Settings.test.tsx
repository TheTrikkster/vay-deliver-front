// src/pages/Settings.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from './Settings';

// Mock du hook useAuthenticator
jest.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: () => ({
    signOut: jest.fn(),
    user: { username: 'testuser' },
  }),
}));

// Mock de useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations = {
        title: 'Paramètres',
        logout: 'Déconnexion',
        siteEnabled: 'Site activé',
        siteDisabled: 'Le projet est inactif',
        visitorMessage: 'Message pour les visiteurs',
        placeholder: 'Par exemple: Les commandes sont temporairement fermées...',
        confirm: 'Confirmer',
      };
      return translations[key as keyof typeof translations] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock de Menu
jest.mock('../../components/Menu/Menu', () => {
  return function DummyMenu() {
    return <div data-testid="menu-component" />;
  };
});

// Mock de LanguageSwitcher
jest.mock('../../components/LanguageSwitcher', () => {
  return function DummyLanguageSwitcher() {
    return <div data-testid="language-switcher" />;
  };
});

describe('Settings Component', () => {
  test('rend le composant Settings correctement', () => {
    render(<Settings />);

    // Vérification des éléments essentiels
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
    expect(screen.getByTestId('menu-component')).toBeInTheDocument();
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
    expect(screen.getByText('Le projet est inactif')).toBeInTheDocument();
  });

  test('affiche le formulaire de message quand le site est inactif', () => {
    render(<Settings />);

    // Par défaut, le statut est inactif, on devrait voir le formulaire
    expect(screen.getByText('Message pour les visiteurs')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Confirmer')).toBeInTheDocument();
  });

  test('active/désactive le toggle quand on clique dessus', () => {
    render(<Settings />);

    // État initial: Inactif
    expect(screen.getByText('Le projet est inactif')).toBeInTheDocument();

    // Cliquer sur le toggle
    const toggleButton = screen.getByRole('button', { pressed: false });
    fireEvent.click(toggleButton);

    // État après clic: Actif
    expect(screen.getByText('Site activé')).toBeInTheDocument();
    expect(screen.queryByText('Message pour les visiteurs')).not.toBeInTheDocument();

    // Cliquer à nouveau sur le toggle
    fireEvent.click(toggleButton);

    // État après second clic: Inactif de nouveau
    expect(screen.getByText('Le projet est inactif')).toBeInTheDocument();
    expect(screen.getByText('Message pour les visiteurs')).toBeInTheDocument();
  });

  test('met à jour le message quand on saisit dans le textarea', () => {
    render(<Settings />);

    const textarea = screen.getByRole('textbox');
    const testMessage = 'Message de test';

    fireEvent.change(textarea, { target: { value: testMessage } });

    expect(textarea).toHaveValue(testMessage);
  });

  test('appelle signOut quand on clique sur le bouton de déconnexion', () => {
    // Créer un mock explicite que nous pourrons surveiller
    const signOutMock = jest.fn();

    // Réimplémenter le mock de useAuthenticator spécifiquement pour ce test
    jest.spyOn(require('@aws-amplify/ui-react'), 'useAuthenticator').mockReturnValue({
      signOut: signOutMock,
      user: { username: 'testuser' },
    });

    render(<Settings />);

    const logoutButton = screen.getByText('Déconnexion');
    fireEvent.click(logoutButton);

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });
});
