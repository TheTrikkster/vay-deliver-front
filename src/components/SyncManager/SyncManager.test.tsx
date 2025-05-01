import React from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { SyncManager } from './SyncManager';
import axios from 'axios';
import { removePendingOperation, setError } from '../../store/slices/productsSlice';

const mockStore = configureStore([]);

jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ status: 200 }),
  patch: jest.fn().mockResolvedValue({ status: 200 }),
  delete: jest.fn().mockResolvedValue({ status: 200 }),
}));

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
    // Créer un nouveau store pour chaque test
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [],
      },
    });

    // Remplacer la méthode dispatch par un mock
    store.dispatch = jest.fn();

    // Réinitialiser les compteurs d'appels
    (window.addEventListener as jest.Mock).mockClear();
    (window.removeEventListener as jest.Mock).mockClear();
    (axios.post as jest.Mock).mockClear();
    (axios.patch as jest.Mock).mockClear();
    (axios.delete as jest.Mock).mockClear();
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

  test('devrait synchroniser les opérations en attente lorsque isOnline devient true', async () => {
    // Configurer le store avec des opérations en attente et isOnline=true
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

    // Vérifier que axios.post a été appelé avec les bons arguments
    expect(axios.post).toHaveBeenCalledWith(
      '/api/test',
      { name: 'Test' },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Vérifier que removePendingOperation a été appelé après la réussite
    expect(store.dispatch).toHaveBeenCalledWith(removePendingOperation(0));
  });

  test('devrait appeler axios.post pour les opérations POST', async () => {
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

    // Vérifier que axios.post a été appelé avec les bons arguments
    expect(axios.post).toHaveBeenCalledWith(
      '/api/test',
      { name: 'Test' },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Vérifier que removePendingOperation a été appelé après la réussite
    expect(store.dispatch).toHaveBeenCalledWith(removePendingOperation(0));
  });

  test('devrait appeler axios.patch pour les opérations PATCH', async () => {
    // Configurer le store avec une opération PATCH en attente
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [
          {
            method: 'PATCH',
            endpoint: '/api/test/1',
            data: { name: 'Updated' },
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

    // Vérifier que axios.patch a été appelé avec les bons arguments
    expect(axios.patch).toHaveBeenCalledWith(
      '/api/test/1',
      { name: 'Updated' },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Vérifier que removePendingOperation a été appelé après la réussite
    expect(store.dispatch).toHaveBeenCalledWith(removePendingOperation(0));
  });

  test('devrait appeler axios.delete pour les opérations DELETE', async () => {
    // Configurer le store avec une opération DELETE en attente
    store = mockStore({
      products: {
        isOnline: true,
        pendingOperations: [
          {
            method: 'DELETE',
            endpoint: '/api/test/1',
            data: {},
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

    // Vérifier que axios.delete a été appelé avec les bons arguments
    expect(axios.delete).toHaveBeenCalledWith('/api/test/1');

    // Vérifier que removePendingOperation a été appelé après la réussite
    expect(store.dispatch).toHaveBeenCalledWith(removePendingOperation(0));
  });

  test('devrait gérer les erreurs lors de la synchronisation', async () => {
    // Configurer axios.post pour qu'il rejette la promesse
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Erreur de connexion'));

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

    // Vérifier que axios.post a été appelé
    expect(axios.post).toHaveBeenCalled();

    // Vérifier que setError a été appelé avec le message d'erreur
    expect(store.dispatch).toHaveBeenCalledWith(
      setError(expect.stringContaining('Erreur de synchronisation'))
    );

    // Vérifier que l'opération n'a pas été supprimée
    expect(store.dispatch).not.toHaveBeenCalledWith(removePendingOperation(0));
  });

  test('devrait ignorer les méthodes non supportées', async () => {
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
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Opération non supportée'));

    // Restaurer console.warn
    console.warn = originalWarn;

    // Vérifier que l'opération a été supprimée malgré tout
    expect(store.dispatch).toHaveBeenCalledWith(removePendingOperation(0));
  });
});
