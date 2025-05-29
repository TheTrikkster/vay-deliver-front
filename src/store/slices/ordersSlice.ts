import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus, Position, AddTagOperationData } from '../../types/order';
import { buildFilterString } from '../../utils/filterUtils';
import { RootState } from '../userStore';
import { ordersApi } from '../../api/services/ordersApi';

export interface OrderPendingOperation {
  type: 'addTag' | 'removeTag';
  timestamp: number;
  data: AddTagOperationData;
  endpoint: string;
  method: string;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  isSelectionMode: boolean;
  selectedOrderIds: string[];
  currentFilters: string;
  filtersObject: { status: OrderStatus | ''; tagNames: string[]; position: Position };
  isOnline: boolean;
  pendingOperations: OrderPendingOperation[];
  distanceMatrix: any;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  isSelectionMode: false,
  selectedOrderIds: [],
  currentFilters: buildFilterString({
    status: 'ACTIVE',
    tagNames: [],
    position: { address: '' },
  }),
  filtersObject: { status: 'ACTIVE', tagNames: [], position: { address: '' } },
  isOnline: navigator.onLine,
  pendingOperations: [],
  distanceMatrix: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (
    { page, filters, limit = 30 }: { page: number; filters?: string; limit?: number },
    { rejectWithValue, getState }
  ) => {
    const state = getState() as { orders: OrdersState };
    const distanceMatrix = state.orders.distanceMatrix;
    try {
      const response = await ordersApi.getAll(page, filters, limit, distanceMatrix);
      return response.data;
    } catch (err) {
      return rejectWithValue('fetchOrdersError');
    }
  }
);

export const addTagToOrders = createAsyncThunk(
  'orders/addTagToOrders',
  async (
    { tagName, orderIds }: { tagName: string; orderIds: string[] | string },
    { getState, dispatch, rejectWithValue }
  ) => {
    const state = getState() as { orders: OrdersState };
    const isOnline = state.orders.isOnline;
    if (!isOnline) {
      dispatch(
        addPendingOperation({
          type: 'addTag',
          timestamp: Date.now(),
          data: { tagName, orderIds },
          endpoint: 'orders/tags',
          method: 'POST',
        })
      );
      return { tagName, orderIds };
    }
    try {
      await ordersApi.addTagToOrders([tagName], orderIds);
      return { tagName, orderIds };
    } catch {
      return rejectWithValue('addTagToOrdersError');
    }
  }
);

export const removeTagFromOrders = createAsyncThunk(
  'orders/removeTagFromOrders',
  async (
    { tagName, orderId }: { tagName: string; orderId: string },
    { getState, dispatch, rejectWithValue }
  ) => {
    const state = getState() as { orders: OrdersState };
    const isOnline = state.orders.isOnline;
    if (!isOnline) {
      dispatch(
        addPendingOperation({
          type: 'removeTag',
          timestamp: Date.now(),
          data: { tagName, orderIds: orderId },
          endpoint: 'orders/tags',
          method: 'DELETE',
        })
      );
      return { tagName, orderId };
    }
    try {
      await ordersApi.removeTagFromOrders(orderId, tagName);
      return { tagName, orderId };
    } catch {
      return rejectWithValue('removeTagFromOrdersError');
    }
  }
);

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentPage: (state, { payload }: PayloadAction<number>) => {
      state.currentPage = payload;
    },
    setFiltersObject: (state, { payload }: PayloadAction<OrdersState['filtersObject']>) => {
      state.filtersObject = payload;
      state.currentFilters = buildFilterString(payload);
      state.currentPage = 1;
    },
    setOnlineStatus: (state, { payload }: PayloadAction<boolean>) => {
      state.isOnline = payload;
    },
    addPendingOperation: (state, { payload }: PayloadAction<OrderPendingOperation>) => {
      state.pendingOperations.push(payload);
    },
    removePendingOperation: (state, { payload }: PayloadAction<number>) => {
      state.pendingOperations.splice(payload, 1);
    },
    clearSelection: state => {
      state.selectedOrderIds = [];
    },
    toggleSelectionMode: (state, { payload }: PayloadAction<boolean>) => {
      state.isSelectionMode = payload;
      if (!payload) state.selectedOrderIds = [];
    },
    toggleOrderSelection: (state, { payload }: PayloadAction<string>) => {
      const idx = state.selectedOrderIds.indexOf(payload);
      if (idx >= 0) state.selectedOrderIds.splice(idx, 1);
      else state.selectedOrderIds.push(payload);
    },
    selectAllOrders: state => {
      state.selectedOrderIds =
        state.selectedOrderIds.length === state.orders.length ? [] : state.orders.map(o => o._id);
    },
    resetError: state => {
      state.error = null;
    },
    setAddress: (state, { payload }: PayloadAction<string>) => {
      state.filtersObject.position.address = payload;
      state.currentFilters = buildFilterString(state.filtersObject);
      state.currentPage = 1;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => {
        state.orders = payload.orders;
        state.totalPages = payload.totalPages;
        state.loading = false;
        state.distanceMatrix = payload.distanceMatrix || null;
      })
      .addCase(fetchOrders.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = (payload as string) || error.message || null;
      })

      // optimistic: apply on pending for add
      .addCase(addTagToOrders.pending, (state, { meta }) => {
        state.error = null;
        const { tagName, orderIds } = meta.arg;
        state.orders = state.orders.map(o =>
          orderIds.includes(o._id)
            ? { ...o, tagNames: Array.from(new Set([...(o.tagNames || []), tagName])) }
            : o
        );
        state.isSelectionMode = false;
        state.selectedOrderIds = [];
      })
      .addCase(addTagToOrders.rejected, (state, { payload }) => {
        state.error = payload as string;
      })

      // optimistic: apply on pending for remove
      .addCase(removeTagFromOrders.pending, (state, { meta }) => {
        state.error = null;
        const { tagName, orderId } = meta.arg;
        state.orders = state.orders.map(o =>
          o._id === orderId ? { ...o, tagNames: (o.tagNames || []).filter(t => t !== tagName) } : o
        );
      })
      .addCase(removeTagFromOrders.rejected, (state, { payload }) => {
        state.error = payload as string;
      });
  },
});

export const {
  setCurrentPage,
  setFiltersObject,
  setOnlineStatus,
  addPendingOperation,
  removePendingOperation,
  clearSelection,
  toggleSelectionMode,
  toggleOrderSelection,
  selectAllOrders,
  resetError,
  setAddress,
} = ordersSlice.actions;

// Selectors
export const selectOrders = (s: RootState) => s.orders.orders;
export const selectOrdersLoading = (s: RootState) => s.orders.loading;
export const selectOrdersError = (s: RootState) => s.orders.error;
export const selectCurrentPage = (s: RootState) => s.orders.currentPage;
export const selectTotalPages = (s: RootState) => s.orders.totalPages;
export const selectCurrentFilters = (s: RootState) => s.orders.currentFilters;
export const selectFiltersObject = (s: RootState) => s.orders.filtersObject;
export const selectOrdersIsOnline = (s: RootState) => s.orders.isOnline;
export const selectOrdersPendingOperations = (s: RootState) => s.orders.pendingOperations;
export const selectSelectedOrderIds = (s: RootState) => s.orders.selectedOrderIds;
export const selectIsSelectionMode = (s: RootState) => s.orders.isSelectionMode;
export const selectDistanceMatrix = (s: RootState) => s.orders.distanceMatrix;

export default ordersSlice.reducer;
