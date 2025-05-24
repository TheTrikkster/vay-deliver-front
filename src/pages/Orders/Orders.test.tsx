import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Orders from './Orders';
import { store } from '../../store/userStore';
import { ordersApi } from '../../api/services/ordersApi';
import { fetchOrders } from '../../store/slices/ordersSlice'; // <— Import du thunk

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
        addTagError: 'Erreur lors de l’ajout du tag',

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
    (ordersApi.getAll as jest.Mock).mockResolvedValue({
      data: {
        orders: mockOrders,
        total: 2,
        totalPages: 1,
      },
    });
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Orders />
        </BrowserRouter>
      </Provider>
    );

  test('devrait afficher un indicateur de chargement', () => {
    // On simule loading=true avant le render
    store.dispatch({ type: fetchOrders.pending.type });
    renderComponent();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('devrait afficher la liste des commandes', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByTestId('order-card')).toHaveLength(2);
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
      expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    });
  });

  test('devrait ouvrir le modal de filtres', async () => {
    renderComponent();

    // Attendre que le loading disparaisse
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const filterButton = screen.getByRole('button', { name: /Filtres/i });
    fireEvent.click(filterButton);

    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
  });

  test('devrait activer le mode sélection', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    const selectionButton = screen.getByRole('button', { name: /Ajouter une note/i });
    fireEvent.click(selectionButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  test("devrait afficher un message d'erreur en cas d'échec", async () => {
    // On simule un rejet de l'API pour déclencher le catch et rejectWithValue
    (ordersApi.getAll as jest.Mock).mockRejectedValue(new Error('API failure'));

    renderComponent();

    await waitFor(() => {
      // Comme le thunk retourne rejectWithValue('fetchOrdersError'),
      // state.error === 'fetchOrdersError' et on affiche t('getOrdersError')
      expect(screen.getByText('Impossible de charger les commandes')).toBeInTheDocument();
    });
  });
});
