import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useProductsInventory } from '../useProductsInventory';
import { Store, UnknownAction } from 'redux';
import { productsApi } from '../../api/services/productsApi';

// Préparation du mock store
const mockStore = configureStore();

describe('useProductsInventory hook', () => {
  let store: Store<unknown, UnknownAction>;
  let wrapper: ({ children }: { children: React.ReactNode }) => JSX.Element;

  beforeEach(() => {
    jest.useFakeTimers();

    // Configurer directement les méthodes de l'API
    productsApi.getAll = jest.fn().mockResolvedValue({
      data: { products: [], totalPages: 1 },
    });
    productsApi.delete = jest.fn().mockResolvedValue({});
    productsApi.updateQuantity = jest.fn().mockResolvedValue({});
    productsApi.updateStatus = jest.fn().mockResolvedValue({});

    // Configurer le store
    store = mockStore({
      products: {
        items: [{ id: 1, name: 'Pomme', price: '5₽', quantity: '10', unitExpression: 'kg' }],
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
        isOnline: true,
        pendingOperations: [],
      },
    });

    store.dispatch = jest.fn();

    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("devrait retourner les données d'inventaire", () => {
    const { result } = renderHook(() => useProductsInventory(), { wrapper });

    expect(result.current.currentItems).toHaveLength(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('deleteItem devrait dispatcher les actions correctes', async () => {
    // Configurer la réponse mockée pour productsApi.delete
    (productsApi.delete as jest.Mock).mockResolvedValueOnce({ status: 200 });

    const { result } = renderHook(() => useProductsInventory(), { wrapper });

    await act(async () => {
      await result.current.deleteItem(1);
    });

    // Vérifie que deleteInventoryItem a été dispatché
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'products/deleteProductsItem',
        payload: 1,
      })
    );

    // Vérifie que la méthode delete de productsApi a été appelée
    expect(productsApi.delete).toHaveBeenCalledWith(1);
  });

  test('updateItemQuantity devrait dispatcher les actions correctes', async () => {
    // Configurer la réponse mockée pour productsApi.updateQuantity
    (productsApi.updateQuantity as jest.Mock).mockResolvedValueOnce({ status: 200 });

    const { result } = renderHook(() => useProductsInventory(), { wrapper });

    await act(async () => {
      await result.current.updateItemQuantity(1, 20);
    });

    // Vérifie que updateInventoryItem a été dispatché avec l'objet mis à jour
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'products/updateProductsItem',
        payload: expect.objectContaining({
          id: 1,
          availableQuantity: 20,
        }),
      })
    );

    // Vérifie que la méthode updateQuantity de productsApi a été appelée
    expect(productsApi.updateQuantity).toHaveBeenCalledWith(1, 20);
  });

  test('devrait paginer correctement les éléments', async () => {
    // Données pour la première page
    (productsApi.getAll as jest.Mock).mockResolvedValueOnce({
      data: {
        products: Array.from({ length: 10 }, (_, i) => ({
          _id: i + 1,
          name: `Item ${i + 1}`,
          price: 5,
          availableQuantity: 10,
          unitExpression: 'kg',
          status: 'ACTIVE',
        })),
        total: 40,
        totalPages: 4,
        page: 1,
      },
    });

    // Mock du store avec un état initial vide pour forcer l'appel API
    const paginationStore = mockStore({
      products: {
        items: [],
        isLoading: false,
        error: null,
        lastFetched: null,
        isOnline: true,
        pendingOperations: [],
      },
    });

    paginationStore.dispatch = jest.fn();
    const paginationWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={paginationStore}>{children}</Provider>
    );

    // Render le hook avec une taille de page de 10
    const { result } = renderHook(() => useProductsInventory(10), {
      wrapper: paginationWrapper,
    });

    // Attendre que la requête initiale soit traitée sans bloquer
    await act(async () => {
      await Promise.resolve(); // Laisser les microtâches se terminer
    });

    // Vérifier que l'API a été appelée pour la page 1
    expect(productsApi.getAll).toHaveBeenCalledWith(1, 10);

    // Préparer la réponse pour la page 2
    (productsApi.getAll as jest.Mock).mockResolvedValueOnce({
      data: {
        products: Array.from({ length: 10 }, (_, i) => ({
          _id: i + 11,
          name: `Item ${i + 11}`,
          price: 5,
          availableQuantity: 10,
          unitExpression: 'kg',
          status: 'ACTIVE',
        })),
        total: 40,
        totalPages: 4,
        page: 2,
      },
    });

    // Changer de page
    await act(async () => {
      result.current.setCurrentPage(2);
      await Promise.resolve(); // Laisser les microtâches se terminer
    });

    // Vérifier que l'API a été appelée pour la page 2
    expect(productsApi.getAll).toHaveBeenLastCalledWith(2, 10);
  });

  test('en mode hors ligne, devrait ajouter les opérations aux pendingOperations', async () => {
    // Configurer un état hors ligne
    const offlineStore = mockStore({
      products: {
        items: [{ id: 1, name: 'Pomme', price: '5₽', quantity: '10', unitExpression: 'kg' }],
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

    const { result } = renderHook(() => useProductsInventory(), { wrapper: offlineWrapper });

    await act(async () => {
      await result.current.updateItemQuantity(1, 20);
    });

    // Vérifie que l'action optimiste a été dispatché
    expect(offlineStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'products/updateProductsItem',
        payload: expect.objectContaining({
          id: 1,
          availableQuantity: 20,
        }),
      })
    );

    // Vérifie que l'opération a été ajoutée aux pendingOperations
    expect(offlineStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'products/addPendingOperation',
        payload: expect.objectContaining({
          type: 'update',
          method: 'PATCH',
        }),
      })
    );
  });

  test('devrait gérer les erreurs API correctement', async () => {
    // Configurer la réponse mockée pour productsApi.updateQuantity pour simuler une erreur
    (productsApi.updateQuantity as jest.Mock).mockRejectedValueOnce(new Error('Erreur de serveur'));

    const { result } = renderHook(() => useProductsInventory(), { wrapper });
    await act(async () => {
      await result.current.updateItemQuantity(1, 20);
    });

    // Vérifie que setError a été dispatché avec le message d'erreur russe
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'products/setError',
        payload: 'Ошибка при обновлении',
      })
    );
  });

  test('devrait rafraîchir les données selon shouldRefresh', async () => {
    const getMock = (productsApi.getAll as jest.Mock).mockResolvedValue({
      data: {
        products: [],
        total: 0,
        totalPages: 0,
      },
      status: 200,
    });

    const oldStore = mockStore({
      products: {
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

    renderHook(() => useProductsInventory(), { wrapper: oldWrapper });

    // Avancer les timers et résoudre les promesses
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    // Vérifier que l'API a été appelée avec la page et la limite (nouvelle signature)
    expect(getMock).toHaveBeenCalledWith(1, 30);
  });
});
