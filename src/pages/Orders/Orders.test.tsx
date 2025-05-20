import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import Orders from './Orders';
import { store } from '../../store/userStore';
import { ordersApi } from '../../api/services/ordersApi';

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
        cancel: 'Annuler',
        selectAll: 'Sélectionner tout',
        deselectAll: 'Désélectionner tout',
        filters: 'Filtres',
        addNote: 'Ajouter une note',
        getOrdersError: 'Impossible de charger les commandes',
        addTagError: 'Erreur lors de l’ajout du tag',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

// Mock du composant Menu
jest.mock('../../components/Menu/Menu', () => {
  return function MockMenu() {
    return <div data-testid="mock-menu">Menu</div>;
  };
});

// Mock du composant OrderCard
jest.mock('../../components/OrderCard/OrderCard', () => {
  return function MockOrderCard({ firstName, lastName, isSelected }: any) {
    return (
      <div data-testid="order-card" data-selected={isSelected}>
        {firstName} {lastName}
      </div>
    );
  };
});

// Mock du composant Loading
jest.mock('../../components/Loading', () => {
  return function MockLoading() {
    return <div data-testid="spinner">Loading...</div>;
  };
});

// Mock du composant OrdersFilterModal
jest.mock('../../components/OrdersFilterModal/OrdersFilterModal', () => {
  return function MockOrdersFilterModal({ isOpen }: { isOpen: boolean }) {
    return isOpen ? <div data-testid="filter-modal">Commandes</div> : null;
  };
});

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

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Orders />
        </BrowserRouter>
      </Provider>
    );
  };

  test('devrait afficher un indicateur de chargement', () => {
    (ordersApi.getAll as jest.Mock).mockImplementation(() => new Promise(() => {}));
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

    // Attendre que le composant soit chargé
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    // Trouver le bouton de filtres par son rôle et son texte
    const filterButton = screen.getByRole('button', { name: /Filtres/i });
    fireEvent.click(filterButton);

    // Vérifier que le modal est ouvert
    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
  });

  test('devrait activer le mode sélection', async () => {
    renderComponent();

    // Attendre que le composant soit chargé
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    // Trouver le bouton de sélection par son rôle et son texte
    const selectionButton = screen.getByRole('button', { name: /Ajouter une note/i });
    fireEvent.click(selectionButton);

    // Vérifier que le mode sélection est activé
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  test("devrait afficher un message d'erreur en cas d'échec", async () => {
    // Le message d'erreur affiché est en russe car il provient du store Redux et non du composant
    const errorMessage = 'Impossible de charger les commandes';
    (ordersApi.getAll as jest.Mock).mockRejectedValue(new Error(errorMessage));

    renderComponent();

    // Vérifier que le message d'erreur est affiché
    await waitFor(() => {
      // Vérifier que le message d'erreur est présent
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
