import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useFoodInventory } from '../useFoodInventory';
import axios from 'axios';
import { Store, UnknownAction } from 'redux';

jest.mock('axios', () => {
  // Créer des fonctions mock pour toutes les méthodes HTTP
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockPut = jest.fn();
  const mockPatch = jest.fn();
  const mockDelete = jest.fn();

  // Mock pour cancelToken
  const mockCancel = jest.fn();
  const mockSource = jest.fn(() => ({
    token: 'mock-token',
    cancel: mockCancel,
  }));

  return {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    delete: mockDelete,
    CancelToken: {
      source: mockSource,
    },
    isCancel: jest.fn(error => error?.constructor?.name === 'CanceledError'),
    // Ces getters permettent d'accéder aux mocks dans les tests
    __getMockCancel: () => mockCancel,
    __getMockGet: () => mockGet,
    __getMockPost: () => mockPost,
    __getMockPatch: () => mockPatch,
    __getMockDelete: () => mockDelete,
  };
});

// Type pour le mock d'axios
type MockedAxios = typeof axios & {
  __getMockCancel: () => jest.Mock;
  __getMockGet: () => jest.Mock;
  __getMockPost: () => jest.Mock;
  __getMockPatch: () => jest.Mock;
  __getMockDelete: () => jest.Mock;
};

// Préparation du mock store
const mockStore = configureStore();

describe('useFoodInventory hook', () => {
  let store: Store<unknown, UnknownAction>;
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;
  let mockedAxios: MockedAxios;

  beforeEach(() => {
    jest.useFakeTimers();

    store = mockStore({
      inventory: {
        items: [{ id: 1, name: 'Pomme', prix: '5₽', quantity: '10', unit: 'kg' }],
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
        isOnline: true,
        pendingOperations: [],
      },
    });

    store.dispatch = jest.fn();

    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

    // Réinitialiser les mocks d'axios entre les tests
    mockedAxios = axios as unknown as MockedAxios;
    mockedAxios.__getMockGet().mockReset();
    mockedAxios.__getMockPost().mockReset();
    mockedAxios.__getMockPatch().mockReset();
    mockedAxios.__getMockDelete().mockReset();
    mockedAxios.__getMockCancel().mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("devrait retourner les données d'inventaire", () => {
    const { result } = renderHook(() => useFoodInventory(), { wrapper });

    expect(result.current.inventoryItems).toHaveLength(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('deleteItem devrait dispatcher les actions correctes', async () => {
    // Configurer la réponse mockée pour axios.delete
    mockedAxios.__getMockDelete().mockResolvedValueOnce({ status: 200 });

    const { result } = renderHook(() => useFoodInventory(), { wrapper });

    await act(async () => {
      await result.current.deleteItem(1);
    });

    // Vérifie que deleteInventoryItem a été dispatché
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inventory/deleteInventoryItem',
        payload: 1,
      })
    );

    // Vérifie que la méthode delete d'axios a été appelée
    expect(mockedAxios.__getMockDelete()).toHaveBeenCalled();
  });

  test('updateItemQuantity devrait dispatcher les actions correctes', async () => {
    // Configurer la réponse mockée pour axios.patch
    mockedAxios.__getMockPatch().mockResolvedValueOnce({ status: 200 });

    const { result } = renderHook(() => useFoodInventory(), { wrapper });

    await act(async () => {
      await result.current.updateItemQuantity(1, '20');
    });

    // Vérifie que updateInventoryItem a été dispatché avec l'objet mis à jour
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inventory/updateInventoryItem',
        payload: expect.objectContaining({
          id: 1,
          quantity: '20',
        }),
      })
    );

    // Vérifie que la méthode patch d'axios a été appelée
    expect(mockedAxios.__getMockPatch()).toHaveBeenCalled();
  });

  test('devrait paginer correctement les éléments', () => {
    // Créer un store avec plus d'éléments que la taille de page
    const itemsArray = Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      prix: '5₽',
      quantity: '10',
      unit: 'kg',
    }));

    const paginationStore = mockStore({
      inventory: {
        items: itemsArray,
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
        isOnline: true,
        pendingOperations: [],
      },
    });

    const paginationWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={paginationStore}>{children}</Provider>
    );

    const { result } = renderHook(() => useFoodInventory(10), { wrapper: paginationWrapper });

    // Par défaut on est sur la page 1, donc on devrait avoir les 10 premiers éléments
    expect(result.current.currentItems).toHaveLength(10);
    expect(result.current.currentItems[0].id).toBe(1);
    expect(result.current.totalPages).toBe(4);

    // Changer de page
    act(() => {
      result.current.setCurrentPage(2);
    });

    // On devrait maintenant avoir les éléments 11-20
    expect(result.current.currentItems[0].id).toBe(11);
  });

  test('en mode hors ligne, devrait ajouter les opérations aux pendingOperations', async () => {
    // Configurer un état hors ligne
    const offlineStore = mockStore({
      inventory: {
        items: [{ id: 1, name: 'Pomme', prix: '5₽', quantity: '10', unit: 'kg' }],
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
        isOnline: false, // Mode hors ligne
        pendingOperations: [],
      },
    });

    offlineStore.dispatch = jest.fn();
    const offlineWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={offlineStore}>{children}</Provider>
    );

    const { result } = renderHook(() => useFoodInventory(), { wrapper: offlineWrapper });

    await act(async () => {
      await result.current.updateItemQuantity(1, '20');
    });

    // Vérifie que l'action optimiste a été dispatché
    expect(offlineStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inventory/updateInventoryItem',
        payload: expect.objectContaining({
          id: 1,
          quantity: '20',
        }),
      })
    );

    // Vérifie que l'opération a été ajoutée aux pendingOperations
    expect(offlineStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inventory/addPendingOperation',
        payload: expect.objectContaining({
          type: 'update',
          method: 'PATCH',
        }),
      })
    );
  });

  test('devrait gérer les erreurs API correctement', async () => {
    // Configurer la réponse mockée pour axios.patch pour simuler une erreur
    mockedAxios.__getMockPatch().mockRejectedValueOnce(new Error('Erreur de serveur'));

    const { result } = renderHook(() => useFoodInventory(), { wrapper });
    await act(async () => {
      await result.current.updateItemQuantity(1, '20');
    });

    // Vérifie que setError a été dispatché avec le message d'erreur
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inventory/setError',
        payload: expect.stringContaining('Erreur'),
      })
    );
  });

  test('updateItemQuantity devrait valider les entrées', async () => {
    const { result } = renderHook(() => useFoodInventory(), { wrapper });

    await act(async () => {
      await result.current.updateItemQuantity(1, 'non-numérique');
    });

    // Vérifie que setError a été dispatché pour une quantité invalide
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inventory/setError',
        payload: 'Quantité invalide',
      })
    );

    // Vérifie que updateInventoryItem n'a pas été appelé
    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'inventory/updateInventoryItem',
      })
    );
  });

  test('devrait rafraîchir les données selon shouldRefresh', async () => {
    const getMock = mockedAxios.__getMockGet().mockResolvedValue({
      data: { products: [] },
      status: 200,
    });

    // Configurer le CancelToken correctement
    const mockCancelToken = { token: 'fake-token', cancel: jest.fn() };
    (mockedAxios.CancelToken.source as jest.Mock).mockReturnValue(mockCancelToken);

    const oldStore = mockStore({
      inventory: {
        items: [],
        isLoading: false,
        error: null,
        lastFetched: null,
        isOnline: true,
        pendingOperations: [],
      },
    });

    oldStore.dispatch = jest.fn();

    const oldWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={oldStore}>{children}</Provider>
    );

    renderHook(() => useFoodInventory(), { wrapper: oldWrapper });

    // Avancer les timers et résoudre les promesses
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(getMock).toHaveBeenCalledWith(
      'http://localhost:3300/products',
      expect.objectContaining({
        cancelToken: mockCancelToken.token,
      })
    );
  });

  test('devrait annuler les requêtes au démontage', async () => {
    const mockCancelToken = { token: 'fake-token', cancel: jest.fn() };
    (mockedAxios.CancelToken.source as jest.Mock).mockReturnValue(mockCancelToken);

    const testStore = mockStore({
      inventory: {
        items: [], // Vide pour forcer le fetch
        isLoading: false,
        error: null,
        lastFetched: null, // Null pour forcer le shouldRefresh() à true
        isOnline: true,
        pendingOperations: [],
      },
    });

    testStore.dispatch = jest.fn();

    const testWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={testStore}>{children}</Provider>
    );

    const { unmount } = renderHook(() => useFoodInventory(), { wrapper: testWrapper });

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    unmount();
    expect(mockCancelToken.cancel).toHaveBeenCalled();
  });
});
