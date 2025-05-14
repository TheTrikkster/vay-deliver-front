import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import ClientProducts from './ClientProducts';
import { productsApi } from '../../api/services/productsApi';

// Mock des dépendances
jest.mock('../../api/services/productsApi');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mockStore = configureStore([]);

describe('ClientProducts Component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      client: {
        items: {},
        products: [],
      },
    });

    // Mock de la réponse de l'API avec toutes les propriétés nécessaires
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

    // Configuration du mock pour qu'il retourne notre promesse contrôlée
    (productsApi.getClientProducts as jest.Mock).mockReturnValueOnce(loadingPromise);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientProducts />
        </BrowserRouter>
      </Provider>
    );

    // Vérifier la présence du spinner pendant le chargement
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Résoudre la promesse pour éviter des fuites de mémoire dans les tests
    resolvePromise({
      data: {
        products: [],
        totalPages: 0,
      },
    });
  });

  it('devrait afficher les produits après le chargement', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientProducts />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  it('devrait gérer les erreurs de chargement', async () => {
    // Corriger la façon dont on mock l'erreur
    (productsApi.getClientProducts as jest.Mock).mockRejectedValueOnce(
      new Error('Erreur de chargement')
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientProducts />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });

  it('devrait ajouter un produit au panier', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientProducts />
        </BrowserRouter>
      </Provider>
    );

    // Attendre que les produits soient chargés
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Trouver le bouton par son texte au lieu de utiliser data-testid
    const addButton = screen.getByText('Добавить');
    fireEvent.click(addButton);

    // Vérifier que l'action a été dispatché au store
    const actions = store.getActions();
    expect(actions[0].type).toBe('clientOrder/addToClientOrder');
  });
});
