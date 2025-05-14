import { store, persistor } from '../userStore';
import { setProductsItems } from '../slices/productsSlice';
import { setCurrentPage, toggleSelectionMode } from '../slices/ordersSlice';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { ProductStatus } from '../../types/product';

// Mock pour redux toolkit
jest.mock('@reduxjs/toolkit', () => {
  const actual = jest.requireActual('@reduxjs/toolkit');
  return {
    ...actual,
    configureStore: jest.fn(actual.configureStore),
  };
});

describe('Store Configuration', () => {
  // Structure générale du store
  test('le store devrait avoir tous les reducers nécessaires', () => {
    const state = store.getState();

    // Vérifier la structure du state products
    expect(state).toHaveProperty('products');
    expect(state.products).toEqual(
      expect.objectContaining({
        error: null,
        isLoading: false,
        isOnline: true,
        items: [],
        lastFetched: null,
        pendingOperations: [],
      })
    );

    // Vérifier la structure du state orders
    expect(state).toHaveProperty('orders');
    expect(state.orders).toEqual(
      expect.objectContaining({
        _persist: {
          rehydrated: true,
          version: -1,
        },
        currentFilters: 'status=ACTIVE',
        currentPage: 1,
        error: null,
        filtersObject: {
          position: {
            address: '',
            lat: '',
            lng: '',
          },
          status: 'ACTIVE',
          tagNames: [],
        },
        isOnline: true,
        isSelectionMode: false,
        loading: false,
        orders: [],
        pendingOperations: [],
        selectedOrderIds: [],
        totalPages: 1,
      })
    );
  });

  // Test d'intégration - actions fonctionnent sur tous les reducers
  test('les actions de différents slices devraient modifier le state correctement', () => {
    // Action sur products
    store.dispatch(
      setProductsItems([
        {
          id: 1,
          name: 'Test',
          price: 10,
          availableQuantity: 5,
          unitExpression: 'pcs',
          description: 'Test',
          minOrder: 1,
          status: ProductStatus.ACTIVE,
        },
      ])
    );

    // Action sur orders
    store.dispatch(setCurrentPage(3));
    store.dispatch(toggleSelectionMode(true));

    const state = store.getState();

    // Vérifier effets sur products
    expect(state.products.items).toHaveLength(1);
    expect(state.products.items[0].name).toBe('Test');

    // Vérifier effets sur orders
    expect(state.orders.currentPage).toBe(3);
    expect(state.orders.isSelectionMode).toBe(true);
  });

  // Test de la configuration du middleware
  test('le store devrait être configuré avec les middlewares corrects pour redux-persist', () => {
    // Mock configureStore avant le test
    jest.mock('@reduxjs/toolkit', () => ({
      ...jest.requireActual('@reduxjs/toolkit'),
      configureStore: jest.fn().mockReturnValue({
        getState: jest.fn(),
        dispatch: jest.fn(),
      }),
    }));

    // Importer à nouveau le store pour déclencher l'appel à configureStore
    jest.resetModules();
    require('../userStore');
    // Importer configureStore pour le test
    const { configureStore } = require('@reduxjs/toolkit');

    // Vérifier que configureStore a été appelé avec les bons paramètres
    expect(configureStore).toHaveBeenCalled();

    // Récupérer les arguments passés à configureStore
    const configureStoreArgs = (configureStore as jest.Mock).mock.calls[0][0];

    // Vérifier que middleware est une fonction
    expect(typeof configureStoreArgs.middleware).toBe('function');

    // Simuler un getDefaultMiddleware
    const mockGetDefaultMiddleware = jest.fn(() => []);
    configureStoreArgs.middleware(mockGetDefaultMiddleware);

    // Vérifier que getDefaultMiddleware a été appelé avec les bonnes options
    expect(mockGetDefaultMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        serializableCheck: expect.objectContaining({
          ignoredActions: expect.arrayContaining([
            FLUSH,
            REHYDRATE,
            PAUSE,
            PERSIST,
            PURGE,
            REGISTER,
          ]),
        }),
      })
    );
  });

  // Test basique du persistor
  test('le persistor devrait être correctement configuré', () => {
    expect(persistor).toBeDefined();
    expect(typeof persistor.persist).toBe('function');
  });
});
