import ordersReducer, {
  setCurrentPage,
  toggleSelectionMode,
  toggleOrderSelection,
  selectAllOrders,
  clearSelection,
  setCurrentFilters,
  fetchOrders,
  addTagToOrders,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectCurrentPage,
  selectTotalPages,
  selectIsSelectionMode,
  selectSelectedOrderIds,
  selectCurrentFilters,
  setOnlineStatus,
  addPendingOperation,
  removePendingOperation,
  clearPendingOperations,
  selectOrdersIsOnline,
  selectOrdersPendingOperations,
  setFilters,
  selectFiltersObject,
} from '../ordersSlice';
import { Order, OrderStatus } from '../../../types/order';
import { ordersApi } from '../../../api/services/ordersApi';
import { AxiosResponse } from 'axios';
import { RootState } from '../../../store/userStore';

// Mock ordersApi
jest.mock('../../../api/services/ordersApi');
jest.mock('../../../api/config');

const mockedOrdersApi = ordersApi as jest.Mocked<typeof ordersApi>;

describe('orders reducer', () => {
  const initialState = {
    orders: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    isSelectionMode: false,
    selectedOrderIds: [],
    currentFilters: 'status=ACTIVE',
    isOnline: true,
    pendingOperations: [],
    filtersObject: {
      status: 'ACTIVE' as OrderStatus,
      tagNames: [],
      position: { lat: '', lng: '', address: '' },
    },
  };

  const sampleOrder: Order = {
    _id: 'order1',
    address: '123 Rue de la Paix',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '0123456789',
    status: 'ACTIVE',
    tagNames: ['test'],
    items: [{ productId: 'prod1', quantity: 5 }],
    unitExpression: 'kg',
    geoLocation: { lat: 1, lng: 1 },
  };

  // Créer une réponse Axios complète
  const createAxiosResponse = (data: any): AxiosResponse => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });

  test("devrait retourner l'état initial", () => {
    expect(ordersReducer(undefined, { type: '' })).toEqual(initialState);
  });

  test('devrait gérer setCurrentPage', () => {
    const actualState = ordersReducer(initialState, setCurrentPage(2));
    expect(actualState.currentPage).toBe(2);
  });

  test('devrait gérer toggleSelectionMode activation', () => {
    const actualState = ordersReducer(initialState, toggleSelectionMode(true));
    expect(actualState.isSelectionMode).toBe(true);
  });

  test('devrait gérer toggleSelectionMode désactivation et effacer les sélections', () => {
    const stateWithSelection = {
      ...initialState,
      isSelectionMode: true,
      selectedOrderIds: ['order1', 'order2'],
    };

    const actualState = ordersReducer(stateWithSelection, toggleSelectionMode(false));

    expect(actualState.isSelectionMode).toBe(false);
    expect(actualState.selectedOrderIds).toEqual([]);
  });

  test('devrait gérer toggleOrderSelection pour ajouter un ID', () => {
    const actualState = ordersReducer(initialState, toggleOrderSelection('order1'));
    expect(actualState.selectedOrderIds).toContain('order1');
  });

  test('devrait gérer toggleOrderSelection pour supprimer un ID existant', () => {
    const stateWithSelection = {
      ...initialState,
      selectedOrderIds: ['order1', 'order2'],
    };

    const actualState = ordersReducer(stateWithSelection, toggleOrderSelection('order1'));

    expect(actualState.selectedOrderIds).toEqual(['order2']);
  });

  test('devrait gérer selectAllOrders pour sélectionner tous les ordres', () => {
    const stateWithOrders = {
      ...initialState,
      orders: [
        { ...sampleOrder, _id: 'order1' },
        { ...sampleOrder, _id: 'order2' },
      ],
    };

    const actualState = ordersReducer(stateWithOrders, selectAllOrders());

    expect(actualState.selectedOrderIds).toEqual(['order1', 'order2']);
  });

  test('devrait gérer selectAllOrders pour désélectionner tous les ordres quand tous sont déjà sélectionnés', () => {
    const stateWithAllSelected = {
      ...initialState,
      orders: [
        { ...sampleOrder, _id: 'order1' },
        { ...sampleOrder, _id: 'order2' },
      ],
      selectedOrderIds: ['order1', 'order2'],
    };

    const actualState = ordersReducer(stateWithAllSelected, selectAllOrders());

    expect(actualState.selectedOrderIds).toEqual([]);
  });

  test('devrait gérer clearSelection', () => {
    const stateWithSelection = {
      ...initialState,
      isSelectionMode: true,
      selectedOrderIds: ['order1', 'order2'],
    };

    const actualState = ordersReducer(stateWithSelection, clearSelection());

    expect(actualState.isSelectionMode).toBe(false);
    expect(actualState.selectedOrderIds).toEqual([]);
  });

  test('devrait gérer setCurrentFilters', () => {
    const filters = 'status=pending';
    const actualState = ordersReducer(initialState, setCurrentFilters(filters));

    expect(actualState.currentFilters).toBe(filters);
  });

  // Tests des extraReducers et thunks
  test('devrait gérer fetchOrders.pending', () => {
    const actualState = ordersReducer(initialState, {
      type: fetchOrders.pending.type,
      payload: undefined,
    });

    expect(actualState.loading).toBe(true);
    expect(actualState.error).toBeNull();
  });

  test('devrait gérer fetchOrders.fulfilled', () => {
    const payload = {
      orders: [sampleOrder],
      totalPages: 2,
    };

    const actualState = ordersReducer(initialState, {
      type: fetchOrders.fulfilled.type,
      payload,
    });

    expect(actualState.orders).toEqual([sampleOrder]);
    expect(actualState.totalPages).toBe(2);
    expect(actualState.loading).toBe(false);
  });

  test('devrait gérer fetchOrders.rejected', () => {
    const actualState = ordersReducer(initialState, {
      type: fetchOrders.rejected.type,
      payload: 'Erreur test',
    });

    expect(actualState.loading).toBe(false);
    expect(actualState.error).toBe('Erreur test');
  });

  test('devrait gérer addTagToOrders.fulfilled', () => {
    const stateWithOrders = {
      ...initialState,
      orders: [sampleOrder],
      isSelectionMode: true,
      selectedOrderIds: [sampleOrder._id],
    };

    const payload = {
      tagName: 'urgent',
      orderIds: [sampleOrder._id],
    };

    const actualState = ordersReducer(stateWithOrders, {
      type: addTagToOrders.fulfilled.type,
      payload,
    });

    expect(actualState.orders[0].tagNames).toContain('test');
    expect(actualState.orders[0].tagNames).toContain('urgent');
    expect(actualState.isSelectionMode).toBe(false);
    expect(actualState.selectedOrderIds).toEqual([]);
  });

  test('devrait gérer addTagToOrders.rejected', () => {
    const actualState = ordersReducer(initialState, {
      type: addTagToOrders.rejected.type,
      payload: 'Erreur test',
    });

    expect(actualState.error).toBe('Erreur test');
  });

  // Tests des sélecteurs
  describe('selectors', () => {
    const mockState = {
      products: {},
      orders: {
        orders: [sampleOrder],
        loading: true,
        error: 'Erreur test',
        currentPage: 2,
        totalPages: 5,
        isSelectionMode: true,
        selectedOrderIds: ['order1'],
        currentFilters: 'status=ACTIVE',
        isOnline: false,
        pendingOperations: [
          {
            type: 'addTag' as 'addTag',
            timestamp: 123456789,
            data: { tagName: 'urgent', orderIds: ['order1'] },
            endpoint: 'http://localhost:3300/orders/tags',
            method: 'POST',
          },
        ],
        filtersObject: {
          status: 'ACTIVE' as OrderStatus,
          tagNames: ['urgent'],
          position: { lat: '48.8566', lng: '2.3522', address: '' },
        },
      },
    } as unknown as RootState;

    test('selectOrders devrait retourner les commandes', () => {
      expect(selectOrders(mockState)).toEqual([sampleOrder]);
    });

    test('selectOrdersLoading devrait retourner le statut de chargement', () => {
      expect(selectOrdersLoading(mockState)).toBe(true);
    });

    test('selectOrdersError devrait retourner les erreurs', () => {
      expect(selectOrdersError(mockState)).toBe('Erreur test');
    });

    test('selectCurrentPage devrait retourner la page actuelle', () => {
      expect(selectCurrentPage(mockState)).toBe(2);
    });

    test('selectTotalPages devrait retourner le nombre total de pages', () => {
      expect(selectTotalPages(mockState)).toBe(5);
    });

    test('selectIsSelectionMode devrait retourner le mode de sélection', () => {
      expect(selectIsSelectionMode(mockState)).toBe(true);
    });

    test('selectSelectedOrderIds devrait retourner les IDs sélectionnés', () => {
      expect(selectSelectedOrderIds(mockState)).toEqual(['order1']);
    });

    test('selectCurrentFilters devrait retourner les filtres actuels', () => {
      expect(selectCurrentFilters(mockState)).toBe('status=ACTIVE');
    });

    test('selectOrdersIsOnline devrait retourner le statut de connexion', () => {
      expect(selectOrdersIsOnline(mockState)).toBe(false);
    });

    test('selectOrdersPendingOperations devrait retourner les opérations en attente', () => {
      expect(selectOrdersPendingOperations(mockState)).toHaveLength(1);
      expect(selectOrdersPendingOperations(mockState)[0].type).toBe('addTag');
    });

    test('selectFiltersObject devrait retourner les filtres structurés', () => {
      expect(selectFiltersObject(mockState)).toEqual({
        status: 'ACTIVE',
        tagNames: ['urgent'],
        position: { lat: '48.8566', lng: '2.3522', address: '' },
      });
    });
  });

  // Tests d'intégration des thunks
  describe('thunks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("fetchOrders devrait appeler l'API et retourner les données", async () => {
      const mockResponse = {
        orders: [sampleOrder],
        totalPages: 3,
      };

      mockedOrdersApi.getAll.mockResolvedValueOnce(createAxiosResponse(mockResponse));

      const dispatch = jest.fn();
      const thunk = fetchOrders({ page: 1, filters: 'status=pending' });

      await thunk(dispatch, () => ({}), undefined);

      const { calls } = dispatch.mock;
      const [start, end] = calls;

      expect(start[0].type).toBe(fetchOrders.pending.type);
      expect(end[0].type).toBe(fetchOrders.fulfilled.type);
      expect(end[0].payload).toEqual(mockResponse);
      expect(mockedOrdersApi.getAll).toHaveBeenCalledWith(1, 'status=pending', 30);
    });

    test("addTagToOrders devrait appeler l'API et mettre à jour les commandes", async () => {
      mockedOrdersApi.addTagToOrders.mockResolvedValueOnce(createAxiosResponse({ status: 200 }));

      const mockState = {
        orders: {
          isOnline: true,
        },
      };

      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(mockState);

      const thunk = addTagToOrders({ tagName: 'urgent', orderIds: ['order1'] });
      await thunk(dispatch, getState, undefined);

      const pendingAction = dispatch.mock.calls[0][0];
      const fulfilledAction = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(addTagToOrders.pending.type);
      expect(fulfilledAction.type).toBe(addTagToOrders.fulfilled.type);
      expect(fulfilledAction.payload).toEqual({ tagName: 'urgent', orderIds: ['order1'] });

      expect(mockedOrdersApi.addTagToOrders).toHaveBeenCalledWith(['urgent'], ['order1']);
    });

    test("addTagToOrders devrait stocker l'opération localement quand hors ligne", async () => {
      const mockState = {
        orders: {
          isOnline: false,
        },
      };

      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(mockState);

      const thunk = addTagToOrders({ tagName: 'urgent', orderIds: ['order1'] });
      await thunk(dispatch, getState, undefined);

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'orders/addPendingOperation',
          payload: expect.objectContaining({
            type: 'addTag',
            method: 'POST',
            data: { tagName: 'urgent', orderIds: ['order1'] },
          }),
        })
      );

      expect(mockedOrdersApi.addTagToOrders).not.toHaveBeenCalled();
    });
  });

  // Test de gestion des erreurs
  test('fetchOrders devrait gérer les erreurs', async () => {
    mockedOrdersApi.getAll.mockRejectedValueOnce(new Error('Erreur réseau'));

    const dispatch = jest.fn();
    const thunk = fetchOrders({ page: 1 });

    await thunk(dispatch, () => ({}), undefined);

    const { calls } = dispatch.mock;

    // Vérifier l'appel pending
    expect(calls[0][0].type).toBe(fetchOrders.pending.type);

    // Vérifier l'appel à setCurrentFilters
    expect(calls[1][0].type).toBe('orders/setCurrentFilters');
    expect(calls[1][0].payload).toBe('status=ACTIVE');

    // Vérifier l'appel rejected
    expect(calls[2][0].type).toBe(fetchOrders.rejected.type);
    expect(calls[2][0].payload).toBe('fetchOrdersError');
  });

  // Nouveaux tests pour les fonctionnalités hors ligne
  test('devrait gérer setOnlineStatus', () => {
    const actualState = ordersReducer(initialState, setOnlineStatus(false));
    expect(actualState.isOnline).toBe(false);
  });

  test('devrait gérer addPendingOperation', () => {
    const operation = {
      type: 'addTag' as const,
      timestamp: 123456789,
      data: { tagName: 'urgent', orderIds: ['order1'] },
      endpoint: 'http://localhost:3300/orders/tags',
      method: 'POST',
    };

    const actualState = ordersReducer(initialState, addPendingOperation(operation));
    expect(actualState.pendingOperations).toHaveLength(1);
    expect(actualState.pendingOperations[0]).toEqual(operation);
  });

  test('devrait gérer removePendingOperation', () => {
    const stateWithOperations = {
      ...initialState,
      pendingOperations: [
        {
          type: 'addTag' as const,
          timestamp: 123456789,
          data: { tagName: 'urgent', orderIds: ['order1'] },
          endpoint: 'http://localhost:3300/orders/tags',
          method: 'POST',
        },
      ],
    };

    const actualState = ordersReducer(stateWithOperations, removePendingOperation(0));
    expect(actualState.pendingOperations).toHaveLength(0);
  });

  test('devrait gérer clearPendingOperations', () => {
    const stateWithOperations = {
      ...initialState,
      pendingOperations: [
        {
          type: 'addTag' as const,
          timestamp: 123456789,
          data: { tagName: 'urgent', orderIds: ['order1'] },
          endpoint: 'http://localhost:3300/orders/tags',
          method: 'POST',
        },
      ],
    };

    const actualState = ordersReducer(stateWithOperations, clearPendingOperations());
    expect(actualState.pendingOperations).toHaveLength(0);
  });

  // Ajouter un test pour le nouveau reducer setFilters
  test('devrait gérer setFilters', () => {
    const filters = {
      status: 'COMPLETED' as OrderStatus,
      tagNames: ['urgent', 'delivery'],
      position: { lat: '48.8566', lng: '2.3522', address: '' },
    };

    const actualState = ordersReducer(initialState, setFilters(filters));

    expect(actualState.filtersObject).toEqual(filters);
    expect(actualState.currentFilters).toEqual(expect.any(String));
  });
});
