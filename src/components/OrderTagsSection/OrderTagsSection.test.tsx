import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderTagsSection from './OrderTagsSection';

// Mock des composants enfants
jest.mock('../AddTagModal/AddTagModal', () => {
  return function MockAddTagModal({ isOpen, onClose, onConfirm, orderId }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="add-tag-modal">
        <button onClick={() => onConfirm('nouveau-tag')}>Confirmer</button>
        <button onClick={onClose}>Fermer</button>
        <span>Order ID: {orderId}</span>
      </div>
    );
  };
});

jest.mock('../ConfirmModal', () => {
  return function MockConfirmModal({ isOpen, onClose, onConfirm, title, message }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirmer</button>
        <button onClick={onClose}>Annuler</button>
      </div>
    );
  };
});

// Mock du hook useOrderTags
const mockAddTag = jest.fn();
const mockRemoveTag = jest.fn();

jest.mock('../../hooks/useOrderTags/useOrderTags', () => ({
  useOrderTags: jest.fn(),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        notes: 'Notes',
        addTag: 'Ajouter tag +',
        deleteTag: 'Supprimer le tag',
        deleteTagConfirmation: 'Êtes-vous sûr de vouloir supprimer ce tag ?',
        noNotesAdded: 'Aucune note ajoutée',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'fr',
    },
  }),
}));

// Import du mock après la déclaration
import { useOrderTags } from '../../hooks/useOrderTags/useOrderTags';
const mockUseOrderTags = useOrderTags as jest.MockedFunction<typeof useOrderTags>;

describe('OrderTagsSection Component', () => {
  const defaultProps = {
    orderId: 'order-123',
    tagNames: ['tag1', 'tag2', 'tag3'],
    onTagsUpdated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Configuration par défaut du mock
    mockUseOrderTags.mockReturnValue({
      addTag: mockAddTag,
      removeTag: mockRemoveTag,
      loading: false,
      error: null,
    });
  });

  describe('Rendu initial', () => {
    test("affiche le titre et le bouton d'ajout", () => {
      render(<OrderTagsSection {...defaultProps} />);

      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Ajouter tag +')).toBeInTheDocument();
    });

    test('affiche tous les tags fournis', () => {
      render(<OrderTagsSection {...defaultProps} />);

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
    });

    test('affiche les boutons de suppression pour chaque tag', () => {
      render(<OrderTagsSection {...defaultProps} />);

      const deleteButtons = screen.getAllByTitle('Supprimer cette note');
      expect(deleteButtons).toHaveLength(3);
    });

    test("n'affiche aucun tag quand la liste est vide", () => {
      render(<OrderTagsSection {...defaultProps} tagNames={[]} />);

      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.queryByTitle('Supprimer cette note')).not.toBeInTheDocument();
    });

    test("affiche le message quand aucune note n'est ajoutée", () => {
      render(<OrderTagsSection {...defaultProps} tagNames={[]} />);

      expect(screen.getByText('Aucune note ajoutée')).toBeInTheDocument();
    });
  });

  describe("Ouverture de la modale d'ajout de tag", () => {
    test("ouvre la modale d'ajout quand on clique sur le bouton", async () => {
      render(<OrderTagsSection {...defaultProps} />);

      const addButton = screen.getByText('Ajouter tag +');

      await act(async () => {
        fireEvent.click(addButton);
      });

      expect(screen.getByTestId('add-tag-modal')).toBeInTheDocument();
    });

    test("ferme la modale d'ajout quand on clique sur fermer", async () => {
      render(<OrderTagsSection {...defaultProps} />);

      // Ouvrir la modale
      await act(async () => {
        fireEvent.click(screen.getByText('Ajouter tag +'));
      });
      expect(screen.getByTestId('add-tag-modal')).toBeInTheDocument();

      // Fermer la modale
      await act(async () => {
        fireEvent.click(screen.getByText('Fermer'));
      });
      expect(screen.queryByTestId('add-tag-modal')).not.toBeInTheDocument();
    });

    test("passe le bon orderId à la modale d'ajout", async () => {
      render(<OrderTagsSection {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByText('Ajouter tag +'));
      });

      expect(screen.getByText('Order ID: order-123')).toBeInTheDocument();
    });
  });

  describe("Ajout d'un tag", () => {
    test('appelle addTag avec les bons paramètres', async () => {
      mockAddTag.mockResolvedValue(undefined);
      render(<OrderTagsSection {...defaultProps} />);

      // Ouvrir la modale et confirmer
      await act(async () => {
        fireEvent.click(screen.getByText('Ajouter tag +'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Confirmer'));
      });

      await waitFor(() => {
        expect(mockAddTag).toHaveBeenCalledWith('nouveau-tag', 'order-123');
      });
    });

    test('ferme la modale après ajout réussi', async () => {
      mockAddTag.mockResolvedValue(undefined);
      render(<OrderTagsSection {...defaultProps} />);

      // Ouvrir la modale et confirmer
      await act(async () => {
        fireEvent.click(screen.getByText('Ajouter tag +'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Confirmer'));
      });

      await waitFor(() => {
        expect(screen.queryByTestId('add-tag-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe("Suppression d'un tag", () => {
    test('ouvre la modale de confirmation quand on clique sur le bouton de suppression', async () => {
      render(<OrderTagsSection {...defaultProps} />);

      const deleteButtons = screen.getAllByTitle('Supprimer cette note');

      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
      expect(screen.getByText('Supprimer le tag')).toBeInTheDocument();
      expect(screen.getByText('Êtes-vous sûr de vouloir supprimer ce tag ?')).toBeInTheDocument();
    });

    test('ferme la modale de confirmation quand on clique sur Annuler', async () => {
      render(<OrderTagsSection {...defaultProps} />);

      // Ouvrir la modale de confirmation
      const deleteButtons = screen.getAllByTitle('Supprimer cette note');
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });
      expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();

      // Annuler
      await act(async () => {
        fireEvent.click(screen.getByText('Annuler'));
      });
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });

    test('appelle removeTag avec les bons paramètres', async () => {
      mockRemoveTag.mockResolvedValue(undefined);
      render(<OrderTagsSection {...defaultProps} />);

      // Ouvrir la modale de confirmation et confirmer
      const deleteButtons = screen.getAllByTitle('Supprimer cette note');
      await act(async () => {
        fireEvent.click(deleteButtons[0]); // Supprime 'tag1'
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Confirmer'));
      });

      await waitFor(() => {
        expect(mockRemoveTag).toHaveBeenCalledWith('order-123', 'tag1');
      });
    });

    test('ferme la modale après suppression réussie', async () => {
      mockRemoveTag.mockResolvedValue(undefined);
      render(<OrderTagsSection {...defaultProps} />);

      // Ouvrir la modale de confirmation et confirmer
      const deleteButtons = screen.getAllByTitle('Supprimer cette note');
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Confirmer'));
      });

      await waitFor(() => {
        expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Callback onTagsUpdated', () => {
    test("appelle onTagsUpdated après ajout réussi d'un tag", async () => {
      mockAddTag.mockImplementation(async () => {
        // Simuler l'appel automatique de onSuccess par le hook
        defaultProps.onTagsUpdated();
        return Promise.resolve();
      });

      render(<OrderTagsSection {...defaultProps} />);

      await act(async () => {
        fireEvent.click(screen.getByText('Ajouter tag +'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Confirmer'));
      });

      await waitFor(() => {
        expect(defaultProps.onTagsUpdated).toHaveBeenCalled();
      });
    });

    test("appelle onTagsUpdated après suppression réussie d'un tag", async () => {
      mockRemoveTag.mockImplementation(async () => {
        // Simuler l'appel automatique de onSuccess par le hook
        defaultProps.onTagsUpdated();
        return Promise.resolve();
      });

      render(<OrderTagsSection {...defaultProps} />);

      const deleteButtons = screen.getAllByTitle('Supprimer cette note');
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Confirmer'));
      });

      await waitFor(() => {
        expect(defaultProps.onTagsUpdated).toHaveBeenCalled();
      });
    });
  });

  describe('État de chargement', () => {
    test("désactive le bouton d'ajout pendant le chargement", () => {
      // Mock avec loading: true
      mockUseOrderTags.mockReturnValue({
        addTag: mockAddTag,
        removeTag: mockRemoveTag,
        loading: true,
        error: null,
      });

      render(<OrderTagsSection {...defaultProps} />);

      const addButton = screen.getByText('Ajouter tag +');
      expect(addButton).toBeDisabled();
    });

    test('désactive les boutons de suppression pendant le chargement', () => {
      // Mock avec loading: true
      mockUseOrderTags.mockReturnValue({
        addTag: mockAddTag,
        removeTag: mockRemoveTag,
        loading: true,
        error: null,
      });

      render(<OrderTagsSection {...defaultProps} />);

      const deleteButtons = screen.getAllByTitle('Supprimer cette note');
      deleteButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Gestion des cas limites', () => {
    test('gere correctement un orderId vide', async () => {
      render(<OrderTagsSection {...defaultProps} orderId="" />);

      await act(async () => {
        fireEvent.click(screen.getByText('Ajouter tag +'));
      });

      expect(screen.getByText('Order ID:')).toBeInTheDocument();
    });

    test('gère correctement des tags avec des caractères spéciaux', () => {
      const specialTags = ['tag-avec-tiret', 'tag_avec_underscore', 'tag avec espaces'];
      render(<OrderTagsSection {...defaultProps} tagNames={specialTags} />);

      specialTags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });

    test('gère la suppression du bon tag quand il y a des doublons', async () => {
      const duplicateTags = ['tag1', 'tag1', 'tag2'];
      render(<OrderTagsSection {...defaultProps} tagNames={duplicateTags} />);

      const deleteButtons = screen.getAllByTitle('Supprimer cette note');
      expect(deleteButtons).toHaveLength(3);

      // Supprimer le premier tag1
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Confirmer'));
      });

      expect(mockRemoveTag).toHaveBeenCalledWith('order-123', 'tag1');
    });
  });
});
