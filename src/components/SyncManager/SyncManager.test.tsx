import React from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { SyncManager } from './SyncManager';
import {
  removePendingOperation as removeProductPendingOperation,
  setError,
} from '../../store/slices/productsSlice';
import { removePendingOperation as removeOrderPendingOperation } from '../../store/slices/ordersSlice';
import { productsApi } from '../../api/services/productsApi';
import { ordersApi } from '../../api/services/ordersApi';

const mockStore = configureStore([]);

jest.mock('../../api/services/productsApi');
jest.mock('../../api/services/ordersApi');

describe('SyncManager', () => {
  let store: any;
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;

  // Sauvegarder les méthodes originales avant les tests
  beforeAll(() => {
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;

    // Remplacer par des mocks
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  // Restaurer les méthodes originales après les tests
  afterAll(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  beforeEach(() => {
    // Créer et configurer le store
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [],
      },
      orders: {
        isOnline: true,
        pendingOperations: [],
      },
    });

    store.dispatch = jest.fn();

    // Remplacer directement les méthodes API
    productsApi.create = jest.fn().mockResolvedValue({
      data: {
        _id: 123,
        name: 'Test Product',
        price: 10,
        availableQuantity: 5,
        unitExpression: 'kg',
        description: 'Test description',
        minOrder: 1,
        status: 'ACTIVE',
      },
    });

    productsApi.update = jest.fn().mockResolvedValue({
      data: {
        _id: 123,
        name: 'Updated Product',
        price: 15,
        availableQuantity: 10,
        unitExpression: 'kg',
        description: 'Updated description',
        minOrder: 2,
        status: 'ACTIVE',
      },
    });

    productsApi.delete = jest.fn().mockResolvedValue({});
    ordersApi.addTagToOrders = jest.fn().mockResolvedValue({});

    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test("devrait ajouter des écouteurs d'événements online/offline", () => {
    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Vérifier que les écouteurs ont été ajoutés
    expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  test("devrait supprimer les écouteurs d'événements lors du démontage", () => {
    const { unmount } = render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    unmount();

    // Vérifier que les écouteurs ont été supprimés
    expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  test('devrait synchroniser les opérations produits en attente lorsque isOnline devient true', async () => {
    // Configurer le store avec des opérations en attente et isOnline=true
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [
          {
            method: 'POST',
            endpoint: '/api/test',
            data: { name: 'Test' },
            tempId: 999,
          },
        ],
      },
      orders: {
        isOnline: true,
        pendingOperations: [],
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Attendre que les opérations asynchrones soient terminées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Vérifier que productsApi.create a été appelé au lieu de axios.post
    expect(productsApi.create).toHaveBeenCalledWith({ name: 'Test' });

    // Vérifier que removePendingOperation a été appelé après la réussite
    expect(store.dispatch).toHaveBeenCalledWith(removeProductPendingOperation(0));
  });

  test('devrait synchroniser les opérations commandes en attente', async () => {
    // Configurer le store avec des opérations de commandes en attente
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [],
      },
      orders: {
        isOnline: true,
        pendingOperations: [
          {
            type: 'addTag',
            method: 'POST',
            endpoint: '/api/orders/tags',
            data: { tagName: 'urgent', orderIds: ['123', '456'] },
            timestamp: Date.now(),
          },
        ],
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Attendre que les opérations asynchrones soient terminées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Vérifier que ordersApi.addTagToOrders a été appelé avec les bons arguments
    expect(ordersApi.addTagToOrders).toHaveBeenCalledWith(['urgent'], ['123', '456']);

    // Vérifier que removePendingOperation a été appelé après la réussite
    expect(store.dispatch).toHaveBeenCalledWith(removeOrderPendingOperation(0));
  });

  test('devrait appeler productsApi.create pour les opérations produits POST', async () => {
    // Configurer le store avec une opération POST en attente
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [
          {
            method: 'POST',
            endpoint: '/api/test',
            data: { name: 'Test' },
            tempId: 999,
          },
        ],
      },
      orders: {
        isOnline: true,
        pendingOperations: [],
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Attendre que les opérations asynchrones soient terminées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Vérifier que productsApi.create a été appelé avec les bons arguments
    expect(productsApi.create).toHaveBeenCalledWith({ name: 'Test' });

    // Vérifier que removePendingOperation a été appelé après la réussite
    expect(store.dispatch).toHaveBeenCalledWith(removeProductPendingOperation(0));
  });

  test('devrait appeler productsApi.update pour les opérations produits PATCH', async () => {
    // Configurer le store avec une opération PATCH en attente
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [
          {
            method: 'PATCH',
            endpoint: '/api/test/1',
            data: { id: 1, name: 'Updated' },
          },
        ],
      },
      orders: {
        isOnline: true,
        pendingOperations: [],
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Attendre que les opérations asynchrones soient terminées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Vérifier que productsApi.update a été appelé avec les bons arguments
    expect(productsApi.update).toHaveBeenCalledWith(1, { name: 'Updated' });

    // Vérifier que removePendingOperation a été appelé après la réussite
    expect(store.dispatch).toHaveBeenCalledWith(removeProductPendingOperation(0));
  });

  test('devrait appeler productsApi.delete pour les opérations produits DELETE', async () => {
    // Configurer le store avec une opération DELETE en attente
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [
          {
            method: 'DELETE',
            endpoint: '/api/test/1',
            data: { id: 1 },
          },
        ],
      },
      orders: {
        isOnline: true,
        pendingOperations: [],
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Attendre que les opérations asynchrones soient terminées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Vérifier que productsApi.delete a été appelé avec les bons arguments
    expect(productsApi.delete).toHaveBeenCalledWith(1);

    // Vérifier que removePendingOperation a été appelé après la réussite
    expect(store.dispatch).toHaveBeenCalledWith(removeProductPendingOperation(0));
  });

  test('devrait gérer les erreurs lors de la synchronisation des produits', async () => {
    // Configurer productsApi.create pour qu'il rejette la promesse
    (productsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Erreur de connexion'));

    // Configurer le store avec une opération POST en attente
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [
          {
            method: 'POST',
            endpoint: '/api/test',
            data: { name: 'Test' },
          },
        ],
      },
      orders: {
        isOnline: true,
        pendingOperations: [],
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Attendre que les opérations asynchrones soient terminées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Vérifier que productsApi.create a été appelé
    expect(productsApi.create).toHaveBeenCalled();

    // Vérifier que l'opération n'a pas été supprimée
    expect(store.dispatch).not.toHaveBeenCalledWith(removeProductPendingOperation(0));
  });

  test('devrait gérer les erreurs lors de la synchronisation des commandes', async () => {
    // Configurer ordersApi.addTagToOrders pour qu'il rejette la promesse
    (ordersApi.addTagToOrders as jest.Mock).mockRejectedValueOnce(new Error('Erreur de connexion'));

    // Configurer le store avec une opération POST de commande en attente
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [],
      },
      orders: {
        isOnline: true,
        pendingOperations: [
          {
            type: 'addTag',
            method: 'POST',
            endpoint: '/api/orders/tags',
            data: { tagName: 'urgent', orderIds: ['123'] },
            timestamp: Date.now(),
          },
        ],
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Attendre que les opérations asynchrones soient terminées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Vérifier que ordersApi.addTagToOrders a été appelé
    expect(ordersApi.addTagToOrders).toHaveBeenCalled();

    // Vérifier que l'opération n'a pas été supprimée
    expect(store.dispatch).not.toHaveBeenCalledWith(removeOrderPendingOperation(0));
  });

  test('devrait ignorer les méthodes non supportées pour les produits', async () => {
    // Configurer le store avec une opération de méthode non supportée
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [
          {
            method: 'PUT', // Méthode non supportée dans le composant
            endpoint: '/api/test',
            data: { name: 'Test' },
          },
        ],
      },
      orders: {
        isOnline: true,
        pendingOperations: [],
      },
    });
    store.dispatch = jest.fn();

    // Espionner console.warn
    const originalWarn = console.warn;
    console.warn = jest.fn();

    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Attendre que les opérations asynchrones soient terminées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Vérifier que console.warn a été appelé
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Opération produit non supportée')
    );

    // Restaurer console.warn
    console.warn = originalWarn;

    // Vérifier que l'opération a été supprimée malgré tout
    expect(store.dispatch).toHaveBeenCalledWith(removeProductPendingOperation(0));
  });

  test('devrait ignorer les opérations non supportées pour les commandes', async () => {
    // Configurer le store avec une opération de commande non supportée
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [],
      },
      orders: {
        isOnline: true,
        pendingOperations: [
          {
            type: 'unknown',
            method: 'POST',
            endpoint: '/api/orders/unknown',
            data: {},
            timestamp: Date.now(),
          },
        ],
      },
    });
    store.dispatch = jest.fn();

    // Espionner console.warn
    const originalWarn = console.warn;
    console.warn = jest.fn();

    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Attendre que les opérations asynchrones soient terminées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Vérifier que console.warn a été appelé
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Opération non implémentée'));

    // Restaurer console.warn
    console.warn = originalWarn;
  });

  test('devrait appeler ordersApi.addTagToOrders pour les opérations commandes', async () => {
    // Configurer le store avec une opération de commande en attente
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [],
      },
      orders: {
        isOnline: true,
        pendingOperations: [
          {
            type: 'addTag',
            method: 'POST',
            endpoint: '/api/orders/tags',
            data: { tagName: 'urgent', orderIds: ['123', '456'] },
            timestamp: Date.now(),
          },
        ],
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <SyncManager />
      </Provider>
    );

    // Attendre que les opérations asynchrones soient terminées
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Vérifier que ordersApi.addTagToOrders a été appelé avec les bons arguments
    expect(ordersApi.addTagToOrders).toHaveBeenCalledWith(['urgent'], ['123', '456']);

    // Vérifier que removePendingOperation a été appelé après la réussite
    expect(store.dispatch).toHaveBeenCalledWith(removeOrderPendingOperation(0));
  });
});
