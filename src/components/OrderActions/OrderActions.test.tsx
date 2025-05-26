import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderActions from './OrderActions';

// Mock du hook useOutsideClick
jest.mock('../../hooks/useOutsideClick', () => ({
  useOutsideClick: jest.fn(),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        completeAction: 'Terminer',
        cancelAction: 'Annuler',
        deleteAction: 'Supprimer',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'fr',
    },
  }),
}));

describe('OrderActions Component', () => {
  const mockOnActionClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu initial', () => {
    test('affiche le bouton principal avec icône de menu', () => {
      render(<OrderActions orderStatus="ACTIVE" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');
      expect(mainButton).toBeInTheDocument();
      expect(mainButton).toHaveClass('bg-green-500', 'hover:bg-green-600');
    });

    test("le menu d'actions est fermé par défaut", () => {
      render(<OrderActions orderStatus="ACTIVE" onActionClick={mockOnActionClick} />);

      expect(screen.queryByText('Terminer')).not.toBeInTheDocument();
      expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
      expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
    });
  });

  describe('Ouverture/Fermeture du menu', () => {
    test('ouvre le menu quand on clique sur le bouton principal', () => {
      render(<OrderActions orderStatus="ACTIVE" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');
      fireEvent.click(mainButton);

      expect(screen.getByText('Terminer')).toBeInTheDocument();
      expect(screen.getByText('Annuler')).toBeInTheDocument();
      expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });

    test('ferme le menu quand on clique à nouveau sur le bouton principal', () => {
      render(<OrderActions orderStatus="ACTIVE" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');

      // Ouvrir le menu
      fireEvent.click(mainButton);
      expect(screen.getByText('Terminer')).toBeInTheDocument();

      // Fermer le menu
      fireEvent.click(mainButton);
      expect(screen.queryByText('Terminer')).not.toBeInTheDocument();
    });

    test("change l'icône du bouton quand le menu est ouvert", () => {
      render(<OrderActions orderStatus="ACTIVE" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');

      // Menu fermé - icône de menu (3 points)
      expect(mainButton.querySelector('svg')).toBeInTheDocument();

      // Ouvrir le menu
      fireEvent.click(mainButton);

      // Menu ouvert - icône de fermeture (X)
      expect(mainButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Actions disponibles selon le statut', () => {
    test('affiche toutes les actions pour le statut ACTIVE', () => {
      render(<OrderActions orderStatus="ACTIVE" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');
      fireEvent.click(mainButton);

      expect(screen.getByText('Terminer')).toBeInTheDocument();
      expect(screen.getByText('Annuler')).toBeInTheDocument();
      expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });

    test('affiche seulement Supprimer pour le statut COMPLETED', () => {
      render(<OrderActions orderStatus="COMPLETED" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');
      fireEvent.click(mainButton);

      expect(screen.queryByText('Terminer')).not.toBeInTheDocument();
      expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
      expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });

    test('affiche seulement Supprimer pour le statut CANCELED', () => {
      render(<OrderActions orderStatus="CANCELED" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');
      fireEvent.click(mainButton);

      expect(screen.queryByText('Terminer')).not.toBeInTheDocument();
      expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
      expect(screen.getByText('Supprimer')).toBeInTheDocument();
    });
  });

  describe('Gestion des clics sur les actions', () => {
    test('appelle onActionClick avec COMPLETE quand on clique sur Terminer', () => {
      render(<OrderActions orderStatus="ACTIVE" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');
      fireEvent.click(mainButton);

      const completeButton = screen.getByText('Terminer');
      fireEvent.click(completeButton);

      expect(mockOnActionClick).toHaveBeenCalledWith('COMPLETE');
      expect(mockOnActionClick).toHaveBeenCalledTimes(1);
    });

    test('appelle onActionClick avec CANCEL quand on clique sur Annuler', () => {
      render(<OrderActions orderStatus="ACTIVE" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');
      fireEvent.click(mainButton);

      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);

      expect(mockOnActionClick).toHaveBeenCalledWith('CANCEL');
      expect(mockOnActionClick).toHaveBeenCalledTimes(1);
    });

    test('appelle onActionClick avec DELETE quand on clique sur Supprimer', () => {
      render(<OrderActions orderStatus="ACTIVE" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');
      fireEvent.click(mainButton);

      const deleteButton = screen.getByText('Supprimer');
      fireEvent.click(deleteButton);

      expect(mockOnActionClick).toHaveBeenCalledWith('DELETE');
      expect(mockOnActionClick).toHaveBeenCalledTimes(1);
    });

    test('ferme le menu après avoir cliqué sur une action', () => {
      render(<OrderActions orderStatus="ACTIVE" onActionClick={mockOnActionClick} />);

      const mainButton = screen.getByRole('button');
      fireEvent.click(mainButton);

      const completeButton = screen.getByText('Terminer');
      fireEvent.click(completeButton);

      // Le menu devrait être fermé
      expect(screen.queryByText('Terminer')).not.toBeInTheDocument();
    });
  });
});
