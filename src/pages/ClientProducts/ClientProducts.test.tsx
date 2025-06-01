import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import ClientProducts from './ClientProducts';
import { productsApi } from '../../api/services/productsApi';
import { settingsApi } from '../../api/services/settingsApi';

// Mock des dépendances
jest.mock('../../api/services/productsApi');
jest.mock('../../api/services/settingsApi');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: { [key: string]: string } = {
        // Traductions pour clientCard
        productUnavailable: 'Produit indisponible',
        minOrder: 'Commande min. : ',
        price: 'Prix : ',
        add: 'Ajouter',
        ariaLabel: options?.name ? `Produit: ${options.name}` : 'Produit',
        ariaAddToCart: options?.name ? `Ajouter ${options.name} au panier` : 'Ajouter au panier',

        // Traductions pour clientProducts
        errorLoading: 'Impossible de charger les produits',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'fr',
    },
  }),
}));

const mockStore = configureStore([]);

// Fonction utilitaire pour attendre que toutes les promesses se résolvent
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('ClientProducts Component', () => {
  let store: any;

  beforeEach(() => {
    // Reset store
    store = mockStore({
      client: {
        items: {},
        products: [],
      },
    });

    // Mock settingsApi to allow fetching products
    (settingsApi.getSettings as jest.Mock).mockResolvedValue({
      data: { siteStatus: 'ONLINE', offlineMessage: '' },
    });

    // Mock productsApi response
    (productsApi.getClientProducts as jest.Mock).mockResolvedValue({
      data: {
        products: [
          {
            _id: '1',
            name: 'Test Product',
            price: 1000,
            minOrder: 1,
            description: 'Description du produit test',
            unitExpression: 'шт',
          },
        ],
        totalPages: 1,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher le composant de chargement initialement', async () => {
    // Création d'une promesse qui ne se résout pas immédiatement
    let resolvePromise: (value: any) => void = jest.fn();
    const loadingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    // Mock settingsApi and productsApi for this test
    (settingsApi.getSettings as jest.Mock).mockResolvedValue({
      data: { siteStatus: 'ONLINE', offlineMessage: '' },
    });
    (productsApi.getClientProducts as jest.Mock).mockReturnValueOnce(loadingPromise);

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <ClientProducts />
          </BrowserRouter>
        </Provider>
      );
      await flushPromises();
    });

    // Vérifier la présence du spinner pendant le chargement
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Résoudre la promesse avec des données valides pour que le loading se termine
    await act(async () => {
      resolvePromise({
        data: {
          products: [
            {
              _id: '1',
              name: 'Test Product',
              price: 1000,
              minOrder: 1,
              description: 'Description du produit test',
              unitExpression: 'шт',
            },
          ],
          totalPages: 1,
          siteStatus: 'ONLINE',
        },
      });
      await flushPromises();
    });

    // Attendre que le loading disparaisse
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });
  });

  it('devrait afficher les produits après le chargement', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <ClientProducts />
          </BrowserRouter>
        </Provider>
      );
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  it('devrait gérer les erreurs de chargement', async () => {
    // Mock settingsApi and simulate error on product fetch
    (settingsApi.getSettings as jest.Mock).mockResolvedValue({
      data: { siteStatus: 'ONLINE', offlineMessage: '' },
    });
    (productsApi.getClientProducts as jest.Mock).mockRejectedValueOnce(
      new Error('Erreur de chargement')
    );

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <ClientProducts />
          </BrowserRouter>
        </Provider>
      );
      await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Impossible de charger les produits')).toBeInTheDocument();
    });
  });

  it('devrait ajouter un produit au panier', async () => {
    // Mock du store avec un état initial vide
    store = mockStore({
      client: {
        items: {},
        products: [],
      },
    });

    // Mock du produit avec maxOrder
    (productsApi.getClientProducts as jest.Mock).mockResolvedValue({
      data: {
        products: [
          {
            _id: '1',
            name: 'Test Product',
            price: 1000,
            minOrder: 1,
            maxOrder: 10,
            description: 'Description du produit test',
            unitExpression: 'шт',
          },
        ],
        totalPages: 1,
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <ClientProducts />
          </BrowserRouter>
        </Provider>
      );
      await flushPromises();
    });

    // Attendre que les produits soient chargés
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Trouver le bouton d'ajout par son aria-label
    const addButton = screen.getByLabelText('Ajouter Test Product au panier');
    await act(async () => {
      fireEvent.click(addButton);
      await flushPromises();
    });

    // Vérifier que l'action a été dispatchée
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toHaveLength(1);
      expect(actions[0]).toEqual(
        expect.objectContaining({
          type: 'clientOrder/addToClientOrder',
          payload: expect.objectContaining({
            productId: '1',
            quantity: 1,
            product: expect.any(Object),
          }),
        })
      );
    });
  });

  it('devrait activer le bouton Commander quand le panier contient des articles', async () => {
    // Pré-remplir le panier dans le store
    store = mockStore({
      client: {
        items: { '1': 2 },
        products: [],
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <ClientProducts />
          </BrowserRouter>
        </Provider>
      );
      await flushPromises();
    });

    await waitFor(() => {
      const checkoutButton = screen.getByTestId('checkout-button');
      expect(checkoutButton).not.toBeDisabled();
    });
  });
});
