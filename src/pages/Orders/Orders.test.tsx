import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Orders from './Orders';
import { store } from '../../store/userStore';
import { ordersApi } from '../../api/services/ordersApi';
import { fetchOrders, resetError } from '../../store/slices/ordersSlice'; // <— Import du thunk et resetError

// Mock des dépendances
jest.mock('../../api/services/ordersApi');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock pour react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        // boutons / labels
        cancel: 'Annuler',
        selectAll: 'Sélectionner tout',
        deselectAll: 'Désélectionner tout',
        filters: 'Filtres',
        addNote: 'Ajouter une note',
        getOrdersError: 'Impossible de charger les commandes',
        addTagError: "Erreur lors de l'ajout du tag",

        // statuts du composant Order
        active: 'Active',
        completed: 'Terminée',
        canceled: 'Annulée',

        // modal de suppression de tag (si utilisé là aussi)
        deleteTag: 'Supprimer le tag',
        deleteTagConfirmation: 'Voulez-vous vraiment supprimer ce tag ?',
      };
      return translations[key] ?? key;
    },
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
}));

// Mock du composant Menu
jest.mock('../../components/Menu/Menu', () => () => <div data-testid="mock-menu">Menu</div>);

// Mock du composant OrderCard
jest.mock(
  '../../components/OrderCard/OrderCard',
  () =>
    ({ firstName, lastName, isSelected }: any) => (
      <div data-testid="order-card" data-selected={isSelected}>
        {firstName} {lastName}
      </div>
    )
);

// Mock du composant Loading
jest.mock('../../components/Loading', () => () => <div data-testid="spinner">Loading...</div>);

// Mock du composant OrdersFilterModal
jest.mock(
  '../../components/OrdersFilterModal/OrdersFilterModal',
  () =>
    ({ isOpen }: { isOpen: boolean }) =>
      isOpen ? <div data-testid="filter-modal">Commandes</div> : null
);

describe('Orders', () => {
  const mockOrders = [
    {
      _id: '1',
      firstName: 'Jean',
      lastName: 'Dupont',
      items: [],
      address: '123 Rue de Paris',
      tagNames: ['Urgent'],
    },
    {
      _id: '2',
      firstName: 'Marie',
      lastName: 'Martin',
      items: [],
      address: '456 Rue de Lyon',
      tagNames: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Réinitialiser l'état du store pour les erreurs
    act(() => {
      store.dispatch(resetError());
    });

    (ordersApi.getAll as jest.Mock).mockResolvedValue({
      data: {
        orders: mockOrders,
        total: 2,
        totalPages: 1,
      },
    });
  });

  const renderComponent = async () => {
    let component;
    await act(async () => {
      component = render(
        <Provider store={store}>
          <BrowserRouter>
            <Orders />
          </BrowserRouter>
        </Provider>
      );
    });
    return component;
  };

  test('devrait afficher un indicateur de chargement', async () => {
    // Créer une promesse qui ne se résout pas immédiatement pour simuler le loading
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    (ordersApi.getAll as jest.Mock).mockReturnValue(pendingPromise);

    await renderComponent();

    // Vérifier que le spinner est affiché pendant le loading
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Résoudre la promesse pour nettoyer
    act(() => {
      resolvePromise!({
        data: {
          orders: mockOrders,
          total: 2,
          totalPages: 1,
        },
      });
    });

    // Attendre que le loading disparaisse
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });
  });

  test('devrait afficher la liste des commandes', async () => {
    await renderComponent();

    await waitFor(() => {
      expect(screen.getAllByTestId('order-card')).toHaveLength(2);
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
      expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    });
  });

  test('devrait ouvrir le modal de filtres', async () => {
    await renderComponent();

    // Attendre que le loading disparaisse
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const filterButton = screen.getByRole('button', { name: /Filtres/i });

    act(() => {
      fireEvent.click(filterButton);
    });

    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
  });

  test('devrait activer le mode sélection', async () => {
    await renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const selectionButton = screen.getByRole('button', { name: /Ajouter une note/i });

    act(() => {
      fireEvent.click(selectionButton);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      // Vérifier qu'il n'y a plus de bouton "sélectionner tout"
      expect(screen.queryByRole('button', { name: /Sélectionner tout/i })).not.toBeInTheDocument();
    });
  });

  test("devrait afficher un message d'erreur en cas d'échec", async () => {
    // Mocker console.error pour éviter l'affichage de l'erreur pendant le test
    const originalError = console.error;
    console.error = jest.fn();

    // On simule un rejet de l'API pour déclencher le catch et rejectWithValue
    (ordersApi.getAll as jest.Mock).mockRejectedValue(new Error('API failure'));

    await renderComponent();

    // Attendre que le loading disparaisse et que l'erreur soit affichée
    await waitFor(
      () => {
        // Vérifier que le loading a disparu
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
        // Vérifier que le message d'erreur est affiché
        expect(screen.getByText('Impossible de charger les commandes')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Restaurer console.error
    console.error = originalError;
  });
});
