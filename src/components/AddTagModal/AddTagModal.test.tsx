import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AddTagModal from './AddTagModal';
import ordersReducer from '../../store/slices/ordersSlice';
import { OrderStatus } from '../../types/order';
import { ordersApi } from '../../api/services/ordersApi';

// Mock de react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        title: 'Новая заметка',
        placeholder: 'Введите текст заметки',
        cancel: 'Отменить',
        confirm: 'Подтвердить',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ru',
    },
  }),
}));

// Remplacer le mock du thunk par un mock du service API
jest.mock('../../api/services/ordersApi', () => ({
  ordersApi: {
    getAll: jest.fn(),
    addTagToOrders: jest.fn().mockResolvedValue({ data: {} }),
  },
}));

// Créer un store de test avec l'état initial correct
const createTestStore = () => {
  return configureStore({
    reducer: {
      orders: ordersReducer,
    },
    preloadedState: {
      orders: {
        orders: [],
        loading: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        isSelectionMode: false,
        selectedOrderIds: [],
        currentFilters: 'status=ACTIVE',
        isOnline: true,
        pendingOperations: [],
        filtersObject: {
          status: 'ACTIVE' as OrderStatus,
          tagNames: [],
          position: { lat: '', lng: '', address: '' },
        },
      },
    },
  });
};

// Wrapper pour le rendu avec Redux
const renderWithRedux = (ui: React.ReactElement) => {
  const store = createTestStore();
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
};

describe('AddTagModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ne devrait pas rendre le modal quand isOpen est false', () => {
    renderWithRedux(<AddTagModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Новая заметка')).not.toBeInTheDocument();
  });

  test('devrait rendre le modal quand isOpen est true', () => {
    renderWithRedux(<AddTagModal {...defaultProps} />);
    expect(screen.getByText('Новая заметка')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите текст заметки')).toBeInTheDocument();
    expect(screen.getByText('Отменить')).toBeInTheDocument();
    expect(screen.getByText('Подтвердить')).toBeInTheDocument();
  });

  test("devrait mettre à jour le texte de la note quand l'utilisateur tape", async () => {
    renderWithRedux(<AddTagModal {...defaultProps} />);
    const textareaElement = screen.getByPlaceholderText('Введите текст заметки');
    await userEvent.type(textareaElement, 'Test note');
    expect(textareaElement).toHaveValue('Test note');
  });

  test('devrait appeler onClose quand le bouton Отменить est cliqué', () => {
    renderWithRedux(<AddTagModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Отменить'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('devrait appeler onSuccess avec le texte de la note quand le bouton Подтвердить est cliqué', async () => {
    renderWithRedux(<AddTagModal {...defaultProps} orderId="6811c84661f8fec77062c39e" />);

    await userEvent.type(screen.getByPlaceholderText('Введите текст заметки'), 'Test note');
    await userEvent.click(screen.getByText('Подтвердить'));

    // Vérifier que l'API est appelée avec les bons paramètres
    await waitFor(() => {
      expect(ordersApi.addTagToOrders).toHaveBeenCalledWith(
        ['Test note'],
        ['6811c84661f8fec77062c39e']
      );
    });

    // Vérifier que onSuccess est appelé après la résolution
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('Test note');
    });
  });

  test('devrait désactiver le bouton de confirmation si le texte est trop court', async () => {
    renderWithRedux(<AddTagModal {...defaultProps} />);
    const textareaElement = screen.getByPlaceholderText('Введите текст заметки');
    const confirmButton = screen.getByText('Подтвердить');

    // Vérifier que le bouton est désactivé initialement
    expect(confirmButton).toBeDisabled();

    // Ajouter un caractère
    await userEvent.type(textareaElement, 'a');
    expect(confirmButton).toBeDisabled();

    // Ajouter un deuxième caractère
    await userEvent.type(textareaElement, 'b');
    expect(confirmButton).not.toBeDisabled();
  });

  test('devrait avoir les classes de style appropriées', () => {
    const { container } = renderWithRedux(<AddTagModal {...defaultProps} />);
    const modalElement = container.firstChild;
    expect(modalElement).toHaveClass('fixed');
    expect(modalElement).toHaveClass('inset-0');
    expect(modalElement).toHaveClass('bg-black');
    expect(modalElement).toHaveClass('bg-opacity-50');
  });

  test('devrait appeler addTagToOrders avec orderId quand fourni', async () => {
    const { store } = renderWithRedux(<AddTagModal {...defaultProps} orderId="123" />);
    const textareaElement = screen.getByPlaceholderText('Введите текст заметки');

    // S'assurer que le texte a au moins 2 caractères pour activer le bouton
    await userEvent.type(textareaElement, 'Test note');

    // Vérifier que le bouton n'est plus désactivé
    const confirmButton = screen.getByText('Подтвердить');
    expect(confirmButton).not.toBeDisabled();

    // Cliquer sur le bouton
    await userEvent.click(confirmButton);

    // Vérifier que l'action a été appelée avec les bons paramètres
    await waitFor(() => {
      expect(ordersApi.addTagToOrders).toHaveBeenCalledWith(['Test note'], ['123']);
    });
  });

  test('devrait appeler addTagToOrders avec selectedOrderIds quand fourni', async () => {
    const { store } = renderWithRedux(
      <AddTagModal {...defaultProps} selectedOrderIds={['123', '456']} />
    );
    const textareaElement = screen.getByPlaceholderText('Введите текст заметки');
    await userEvent.type(textareaElement, 'Test note');

    const confirmButton = screen.getByText('Подтвердить');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(ordersApi.addTagToOrders).toHaveBeenCalledWith(['Test note'], ['123', '456']);
    });
  });

  test("devrait gérer les erreurs lors de l'ajout du tag", async () => {
    // Mock de console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock de l'API pour simuler une erreur
    (ordersApi.addTagToOrders as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    renderWithRedux(<AddTagModal {...defaultProps} />);
    const textareaElement = screen.getByPlaceholderText('Введите текст заметки');

    // S'assurer que le texte a au moins 2 caractères pour activer le bouton
    await userEvent.type(textareaElement, 'Test note');

    // Cliquer sur le bouton de confirmation
    await userEvent.click(screen.getByText('Подтвердить'));

    // Vérifier que l'erreur est bien gérée
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});
