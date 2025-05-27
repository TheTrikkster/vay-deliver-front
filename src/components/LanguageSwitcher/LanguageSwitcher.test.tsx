import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';

// Mock react-i18next before imports
jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: jest.fn(),
}));
import { useTranslation } from 'react-i18next';
const mockedUseTranslation = useTranslation as jest.Mock;

describe('LanguageSwitcher', () => {
  let changeLanguageMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
    changeLanguageMock = jest.fn();
    // Default mock: initial language 'en'
    mockedUseTranslation.mockReturnValue({
      i18n: { language: 'en', changeLanguage: changeLanguageMock },
    });
  });

  it('affiche le drapeau et le nom de la langue courante', () => {
    render(<LanguageSwitcher />);
    const toggle = screen.getByRole('button', { name: /English/i });
    expect(toggle).toHaveTextContent('🇬🇧');
    expect(toggle).toHaveTextContent('English');
  });

  it('ouvre et ferme le dropdown au clic', () => {
    render(<LanguageSwitcher />);
    const toggle = screen.getByRole('button', { name: /English/i });

    // Menu fermé initialement
    expect(screen.queryByText('Français')).toBeNull();

    // Ouvrir
    fireEvent.click(toggle);
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Русский')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();

    // Fermer
    fireEvent.click(toggle);
    expect(screen.queryByText('Français')).toBeNull();
  });

  it('change la langue et ferme le menu quand on choisit une langue', () => {
    render(<LanguageSwitcher />);
    const toggle = screen.getByRole('button', { name: /English/i });
    fireEvent.click(toggle);

    const frenchOption = screen.getByRole('button', { name: /Français/i });
    fireEvent.click(frenchOption);

    expect(changeLanguageMock).toHaveBeenCalledWith('fr');
    expect(screen.queryByText('Français')).toBeNull();
  });

  it('affiche un indicateur de sélection sur la langue active', () => {
    // Remock initial language to 'ru'
    changeLanguageMock = jest.fn();
    mockedUseTranslation.mockReturnValue({
      i18n: { language: 'ru', changeLanguage: changeLanguageMock },
    });
    render(<LanguageSwitcher />);

    // Ouvrir le dropdown
    const toggle = screen.getByRole('button', { name: /Русский/i });
    act(() => fireEvent.click(toggle));
    expect(screen.getByText('Français')).toBeInTheDocument();

    // Trouver l'option 'Русский' dans le dropdown
    const dropdownOptions = screen
      .getAllByRole('button')
      .filter(btn => btn.textContent?.includes('Русский') && btn.className.includes('w-full'));
    expect(dropdownOptions).toHaveLength(1);
    const rusOption = dropdownOptions[0];

    // Vérifier le style sélectionné
    expect(rusOption).toHaveClass('bg-gray-50');
    expect(rusOption).toHaveClass('font-medium');

    // Vérifier la coche présente
    const checkmark = rusOption.querySelector('svg');
    expect(checkmark).toBeInTheDocument();
  });

  it('ferme le menu quand on clique en dehors', () => {
    render(<LanguageSwitcher />);
    const toggle = screen.getByRole('button', { name: /English/i });
    fireEvent.click(toggle);
    expect(screen.getByText('Français')).toBeInTheDocument();

    act(() => {
      fireEvent.mouseDown(document.body);
    });
    expect(screen.queryByText('Français')).toBeNull();
  });
});
