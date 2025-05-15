import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Order from './Order';
import { ordersApi } from '../../api/services/ordersApi';
import { AxiosResponse } from 'axios';

// Mocks
jest.mock('../../api/services/ordersApi');
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  useLocation: jest.fn().mockReturnValue({ pathname: '/order/123' }),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('../../api/config');

// 1. Ajouter le mock pour le composant Menu
jest.mock('../../components/Menu/Menu', () => {
  return function MockMenu() {
    return <div data-testid="mock-menu">Menu</div>;
  };
});

// Mock pour react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        errorLoadingOrder: 'Erreur de chargement de la commande',
        active: 'Active',
        completed: 'Terminée',
        canceled: 'Annulée',
        products: 'Produits',
        total: 'Total',
        notes: 'Notes',
        cancel: 'Annuler',
        complete: 'Terminer',
        whatsapp: 'WhatsApp',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

const mockedOrdersApi = ordersApi as jest.Mocked<typeof ordersApi>;
const mockedUseParams = useParams as jest.Mock;
const mockedUseNavigate = useNavigate as jest.Mock;
const mockedUseLocation = useLocation as jest.Mock;

describe('Order', () => {
  const mockNavigate = jest.fn();
  const mockOrderId = '123';
  const mockLocation = { pathname: '/order/123' };

  const mockOrderData = {
    firstName: 'Jean',
    lastName: 'Dupont',
    status: 'ACTIVE' as 'ACTIVE' | 'COMPLETED' | 'CANCELED',
    address: '123 Rue de Paris',
    phoneNumber: 1234567890,
    tagNames: ['Urgent', 'Livraison rapide'],
    items: [
      {
        product: { name: 'Produit 1', price: 10 },
        quantity: 2,
      },
      {
        product: { name: 'Produit 2', price: 15 },
        quantity: 1,
      },
    ],
  };

  // Créer une réponse Axios complète
  const createAxiosResponse = (data: any): AxiosResponse => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ id: mockOrderId });
    mockedUseNavigate.mockReturnValue(mockNavigate);
    mockedUseLocation.mockReturnValue(mockLocation);
    mockedOrdersApi.getById.mockResolvedValue(createAxiosResponse(mockOrderData));
  });

  test('devrait afficher un indicateur de chargement', () => {
    mockedOrdersApi.getById.mockImplementationOnce(() => new Promise(() => {})); // Ne résout jamais
    render(<Order />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
  });

  test('devrait récupérer et afficher les détails de la commande', async () => {
    render(<Order />);

    await waitFor(() => {
      expect(mockedOrdersApi.getById).toHaveBeenCalledWith(mockOrderId);
    });

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
      expect(screen.getByText('123 Rue de Paris')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument(); // Statut actif
    });
  });

  test('devrait afficher correctement le statut ACTIVE', async () => {
    render(<Order />);

    await waitFor(() => {
      const statusElement = screen.getByText('Active');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('bg-green-50');
      expect(statusElement).toHaveClass('text-green-500');
    });
  });

  test('devrait afficher correctement le statut COMPLETED', async () => {
    mockedOrdersApi.getById.mockResolvedValueOnce(
      createAxiosResponse({ ...mockOrderData, status: 'COMPLETED' })
    );

    render(<Order />);

    await waitFor(() => {
      const statusElement = screen.getByText('Terminée');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('bg-gray-100');
      expect(statusElement).toHaveClass('text-gray-500');
    });
  });

  test('devrait afficher correctement le statut CANCELED', async () => {
    mockedOrdersApi.getById.mockResolvedValueOnce(
      createAxiosResponse({ ...mockOrderData, status: 'CANCELED' })
    );

    render(<Order />);

    await waitFor(() => {
      const statusElement = screen.getByText('Annulée');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('bg-red-50');
      expect(statusElement).toHaveClass('text-red-500');
    });
  });

  test('devrait calculer correctement le prix total', async () => {
    render(<Order />);

    await waitFor(() => {
      // 2*10 + 1*15 = 35
      expect(screen.getByText('35 €')).toBeInTheDocument();
    });
  });

  test('devrait afficher tous les articles de la commande', async () => {
    render(<Order />);

    await waitFor(() => {
      expect(screen.getByText('Produit 1')).toBeInTheDocument();
      expect(screen.getByText('x2')).toBeInTheDocument();
      expect(screen.getByText('10 €')).toBeInTheDocument();

      expect(screen.getByText('Produit 2')).toBeInTheDocument();
      expect(screen.getByText('x1')).toBeInTheDocument();
      expect(screen.getByText('15 €')).toBeInTheDocument();
    });
  });

  test('devrait afficher tous les tags', async () => {
    render(<Order />);

    await waitFor(() => {
      expect(screen.getByText('Urgent')).toBeInTheDocument();
      expect(screen.getByText('Livraison rapide')).toBeInTheDocument();
    });
  });

  test('devrait naviguer vers la page précédente quand le bouton retour est cliqué', async () => {
    render(<Order />);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: '' }); // Le bouton retour n'a pas de texte
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('devrait marquer la commande comme complétée', async () => {
    mockedOrdersApi.updateStatus.mockResolvedValueOnce(createAxiosResponse({}));

    render(<Order />);

    await waitFor(() => {
      const completeButton = screen.getByText('Terminer');
      fireEvent.click(completeButton);
    });

    expect(mockedOrdersApi.updateStatus).toHaveBeenCalledWith(mockOrderId, 'COMPLETED');

    // Vérifier que l'état local est mis à jour
    await waitFor(() => {
      expect(screen.getByText('Terminée')).toBeInTheDocument();
    });
  });

  test('devrait marquer la commande comme annulée', async () => {
    mockedOrdersApi.updateStatus.mockResolvedValueOnce(createAxiosResponse({}));

    render(<Order />);

    await waitFor(() => {
      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);
    });

    expect(mockedOrdersApi.updateStatus).toHaveBeenCalledWith(mockOrderId, 'CANCELED');

    // Vérifier que l'état local est mis à jour
    await waitFor(() => {
      expect(screen.getByText('Annulée')).toBeInTheDocument();
    });
  });

  test("ne devrait pas afficher les boutons d'action pour les commandes non actives", async () => {
    mockedOrdersApi.getById.mockResolvedValueOnce(
      createAxiosResponse({ ...mockOrderData, status: 'COMPLETED' })
    );

    render(<Order />);

    await waitFor(() => {
      expect(screen.queryByText('Terminer')).not.toBeInTheDocument();
      expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
    });
  });
});
