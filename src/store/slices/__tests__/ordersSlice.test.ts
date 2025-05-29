import ordersReducer, {
  setCurrentPage,
  toggleSelectionMode,
  toggleOrderSelection,
  selectAllOrders,
  clearSelection,
  setFiltersObject,
  setOnlineStatus,
  addPendingOperation,
  removePendingOperation,
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
  selectOrdersIsOnline,
  selectOrdersPendingOperations,
  selectFiltersObject,
} from '../ordersSlice';
import { Order, OrderStatus } from '../../../types/order';
import { RootState } from '../../../store/userStore';

jest.mock('../../../api/services/ordersApi');
jest.mock('../../../api/config');

describe('orders reducer', () => {
  const initialState = {
    orders: [],
    loading: false,
    error: null,
    currentPage: 1,
    distanceMatrix: null,
    totalPages: 1,
    isSelectionMode: false,
    selectedOrderIds: [],
    currentFilters: 'status=ACTIVE',
    isOnline: true,
    pendingOperations: [] as any[],
    filtersObject: {
      status: 'ACTIVE' as OrderStatus,
      tagNames: [],
      position: { address: '' },
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

  it('should return the initial state', () => {
    expect(ordersReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle setCurrentPage', () => {
    const state = ordersReducer(initialState, setCurrentPage(2));
    expect(state.currentPage).toBe(2);
  });

  it('should handle toggleSelectionMode true', () => {
    const state = ordersReducer(initialState, toggleSelectionMode(true));
    expect(state.isSelectionMode).toBe(true);
  });

  it('should handle toggleSelectionMode false and clear selection', () => {
    const start = { ...initialState, isSelectionMode: true, selectedOrderIds: ['order1'] };
    const state = ordersReducer(start, toggleSelectionMode(false));
    expect(state.isSelectionMode).toBe(false);
    expect(state.selectedOrderIds).toEqual([]);
  });

  it('should handle toggleOrderSelection add', () => {
    const state = ordersReducer(initialState, toggleOrderSelection('order1'));
    expect(state.selectedOrderIds).toContain('order1');
  });

  it('should handle toggleOrderSelection remove', () => {
    const start = { ...initialState, selectedOrderIds: ['order1', 'order2'] };
    const state = ordersReducer(start, toggleOrderSelection('order1'));
    expect(state.selectedOrderIds).toEqual(['order2']);
  });

  it('should handle selectAllOrders select and deselect', () => {
    const withOrders = {
      ...initialState,
      orders: [sampleOrder, { ...sampleOrder, _id: 'order2' }],
    };
    const selected = ordersReducer(withOrders, selectAllOrders());
    expect(selected.selectedOrderIds).toEqual(['order1', 'order2']);
    const deselected = ordersReducer(
      { ...withOrders, selectedOrderIds: ['order1', 'order2'] },
      selectAllOrders()
    );
    expect(deselected.selectedOrderIds).toEqual([]);
  });

  it('should handle clearSelection', () => {
    const start = { ...initialState, isSelectionMode: true, selectedOrderIds: ['order1'] };
    const state = ordersReducer(start, clearSelection());
    expect(state.selectedOrderIds).toEqual([]);
  });

  it('should handle setFiltersObject', () => {
    const filters = {
      status: 'COMPLETED' as OrderStatus,
      tagNames: ['a'],
      position: { address: '0' },
    };
    const state = ordersReducer(initialState, setFiltersObject(filters));
    expect(state.filtersObject).toEqual(filters);
    expect(state.currentFilters).toContain('status=COMPLETED');
  });

  it('should handle setOnlineStatus', () => {
    const state = ordersReducer(initialState, setOnlineStatus(false));
    expect(state.isOnline).toBe(false);
  });

  it('should handle addPendingOperation and removePendingOperation', () => {
    const op = {
      type: 'addTag' as const,
      timestamp: 1,
      data: { tagName: 'a', orderIds: ['order1'] },
      endpoint: '',
      method: 'POST',
    };
    const added = ordersReducer(initialState, addPendingOperation(op));
    expect(added.pendingOperations).toContainEqual(op);
    const removed = ordersReducer(added, removePendingOperation(0));
    expect(removed.pendingOperations).toEqual([]);
  });

  // Reducer extra cases
  it('should handle fetchOrders.pending', () => {
    const state = ordersReducer(initialState, { type: fetchOrders.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchOrders.fulfilled', () => {
    const payload = { orders: [sampleOrder], totalPages: 3 };
    const state = ordersReducer(initialState, { type: fetchOrders.fulfilled.type, payload });
    expect(state.orders).toEqual([sampleOrder]);
    expect(state.totalPages).toBe(3);
    expect(state.loading).toBe(false);
  });

  it('should handle fetchOrders.rejected', () => {
    const state = ordersReducer(initialState, { type: fetchOrders.rejected.type, payload: 'err' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('err');
  });

  // Optimistic update: addTagToOrders.pending
  it('should handle addTagToOrders.pending (optimistic update)', () => {
    const start = {
      ...initialState,
      orders: [sampleOrder],
      isSelectionMode: true,
      selectedOrderIds: ['order1'],
    };
    const action = {
      type: addTagToOrders.pending.type,
      meta: { arg: { tagName: 'urgent', orderIds: ['order1'] } },
    } as any;
    const state = ordersReducer(start, action);
    expect(state.orders[0].tagNames).toEqual(expect.arrayContaining(['test', 'urgent']));
    expect(state.isSelectionMode).toBe(false);
    expect(state.selectedOrderIds).toEqual([]);
  });

  // No-op on fulfilled (tag already added)
  it('should handle addTagToOrders.fulfilled (no-op)', () => {
    const start = {
      ...initialState,
      orders: [sampleOrder],
      isSelectionMode: true,
      selectedOrderIds: ['order1'],
    };
    const state = ordersReducer(start, {
      type: addTagToOrders.fulfilled.type,
      payload: { tagName: 'urgent', orderIds: ['order1'] },
    });
    // pending already applied optimistic update; fulfilled should not modify state
    expect(state.orders[0].tagNames).toEqual(['test']);
    expect(state.isSelectionMode).toBe(true);
    expect(state.selectedOrderIds).toEqual(['order1']);
  });

  it('should handle addTagToOrders.rejected', () => {
    const state = ordersReducer(initialState, {
      type: addTagToOrders.rejected.type,
      payload: 'err',
    });
    expect(state.error).toBe('err');
  });

  // Selectors
  describe('selectors', () => {
    const mockState = {
      products: {},
      orders: {
        orders: [sampleOrder],
        loading: true,
        error: 'err',
        currentPage: 4,
        totalPages: 5,
        isSelectionMode: true,
        selectedOrderIds: ['order1'],
        currentFilters: 'status=ACTIVE',
        isOnline: false,
        pendingOperations: [
          {
            type: 'addTag' as const,
            timestamp: 1,
            data: { tagName: 'a', orderIds: ['order1'] },
            endpoint: '',
            method: 'POST',
          },
        ],
        filtersObject: {
          status: 'ACTIVE' as OrderStatus,
          tagNames: ['a'],
          position: { address: '0' },
        },
      },
    } as unknown as RootState;

    it('selectOrders', () => expect(selectOrders(mockState)).toEqual([sampleOrder]));
    it('selectOrdersLoading', () => expect(selectOrdersLoading(mockState)).toBe(true));
    it('selectOrdersError', () => expect(selectOrdersError(mockState)).toBe('err'));
    it('selectCurrentPage', () => expect(selectCurrentPage(mockState)).toBe(4));
    it('selectTotalPages', () => expect(selectTotalPages(mockState)).toBe(5));
    it('selectIsSelectionMode', () => expect(selectIsSelectionMode(mockState)).toBe(true));
    it('selectSelectedOrderIds', () =>
      expect(selectSelectedOrderIds(mockState)).toEqual(['order1']));
    it('selectCurrentFilters', () => expect(selectCurrentFilters(mockState)).toBe('status=ACTIVE'));
    it('selectOrdersIsOnline', () => expect(selectOrdersIsOnline(mockState)).toBe(false));
    it('selectOrdersPendingOperations', () =>
      expect(selectOrdersPendingOperations(mockState)).toHaveLength(1));
    it('selectFiltersObject', () =>
      expect(selectFiltersObject(mockState)).toEqual({
        status: 'ACTIVE',
        tagNames: ['a'],
        position: { address: '0' },
      }));
  });
});
