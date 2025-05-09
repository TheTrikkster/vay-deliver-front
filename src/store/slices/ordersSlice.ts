import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus, Position } from '../../types/order';
import { ordersApi } from '../../api/services/ordersApi';
import { RootState } from '../userStore';
import { buildFilterString } from '../../utils/filterUtils';

// Définir le type d'opération en attente pour les commandes
interface OrderPendingOperation<T = unknown> {
  type: 'addTag';
  timestamp: number;
  data: T;
  endpoint: string;
  method: string;
  tempId?: string;
}

// Et définir des interfaces spécifiques pour chaque type d'opération
export interface AddTagOperationData {
  tagName: string;
  orderIds: string[];
}

// Types
interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  isSelectionMode: boolean;
  selectedOrderIds: string[];
  currentFilters: string;
  isOnline: boolean; // État de connexion
  pendingOperations: OrderPendingOperation[]; // Opérations en attente
  filtersObject: {
    status: OrderStatus | '';
    tagNames: string[];
    position: Position;
  };
}

// État initial
const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  isSelectionMode: false,
  selectedOrderIds: [],
  currentFilters: 'status=ACTIVE',
  isOnline: navigator.onLine,
  pendingOperations: [],
  filtersObject: {
    status: 'ACTIVE',
    tagNames: [],
    position: { lat: '', lng: '', address: '' },
  },
};

// Thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (
    { page, filters, limit = 30 }: { page: number; filters?: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await ordersApi.getAll(page, filters, limit);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return rejectWithValue('Невозможно загрузить заказы');
    }
  }
);

export const addTagToOrders = createAsyncThunk(
  'orders/addTagToOrders',
  async (
    { tagName, orderIds }: { tagName: string; orderIds: string[] },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      // Récupérer l'état pour vérifier la connexion
      const state = getState() as { orders: OrdersState }; // Type any pour faciliter l'accès
      const isOnline = state.orders.isOnline;

      // Optimistic update géré dans les extraReducers

      if (isOnline) {
        // Si en ligne, appel API normal
        await ordersApi.addTagToOrders([tagName], orderIds);
        return { tagName, orderIds };
      } else {
        // Si hors ligne, stocker l'opération pour synchronisation ultérieure
        dispatch(
          addPendingOperation({
            type: 'addTag',
            timestamp: Date.now(),
            data: { tagName, orderIds },
            endpoint: 'orders/tags', // URL relative
            method: 'POST',
          })
        );
        return { tagName, orderIds };
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du tag:", error);
      return rejectWithValue('Ошибка добавления тега');
    }
  }
);

// Slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    toggleSelectionMode: (state, action: PayloadAction<boolean>) => {
      state.isSelectionMode = action.payload;
      if (!action.payload) {
        state.selectedOrderIds = [];
      }
    },
    toggleOrderSelection: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      const index = state.selectedOrderIds.indexOf(orderId);

      if (index >= 0) {
        state.selectedOrderIds.splice(index, 1);
      } else {
        state.selectedOrderIds.push(orderId);
      }
    },
    selectAllOrders: state => {
      if (state.selectedOrderIds.length === state.orders.length) {
        state.selectedOrderIds = [];
      } else {
        state.selectedOrderIds = state.orders.map(order => order._id);
      }
    },
    clearSelection: state => {
      state.isSelectionMode = false;
      state.selectedOrderIds = [];
    },
    setCurrentFilters: (state, action: PayloadAction<string>) => {
      state.currentFilters = action.payload;
    },
    // Nouveaux reducers pour la gestion hors ligne
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addPendingOperation: (state, action: PayloadAction<OrderPendingOperation>) => {
      state.pendingOperations.push(action.payload);
    },
    removePendingOperation: (state, action: PayloadAction<number>) => {
      state.pendingOperations = state.pendingOperations.filter(
        (_, index) => index !== action.payload
      );
    },
    clearPendingOperations: state => {
      state.pendingOperations = [];
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filtersObject>) => {
      state.filtersObject = action.payload;
      state.currentFilters = buildFilterString(action.payload);
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Gérer fetchOrders
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload.orders;
        state.totalPages = action.payload.totalPages;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload as string;
        } else {
          state.error = action.error.message || 'Произошла неизвестная ошибка';
        }
      })
      // Gérer addTagToOrders (mise à jour optimiste)
      .addCase(addTagToOrders.fulfilled, (state, action) => {
        const { tagName, orderIds } = action.payload;
        state.orders = state.orders.map(order =>
          orderIds.includes(order._id)
            ? { ...order, tagNames: [...(order.tagNames || []), tagName] }
            : order
        );
        state.isSelectionMode = false;
        state.selectedOrderIds = [];
      })
      .addCase(addTagToOrders.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  setCurrentPage,
  toggleSelectionMode,
  toggleOrderSelection,
  selectAllOrders,
  clearSelection,
  setCurrentFilters,
  setOnlineStatus,
  addPendingOperation,
  removePendingOperation,
  clearPendingOperations,
  setFilters,
  setError,
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrdersLoading = (state: { orders: OrdersState }) => state.orders.loading;
export const selectOrdersError = (state: { orders: OrdersState }) => state.orders.error;
export const selectCurrentPage = (state: { orders: OrdersState }) => state.orders.currentPage;
export const selectTotalPages = (state: { orders: OrdersState }) => state.orders.totalPages;
export const selectIsSelectionMode = (state: { orders: OrdersState }) =>
  state.orders.isSelectionMode;
export const selectSelectedOrderIds = (state: { orders: OrdersState }) =>
  state.orders.selectedOrderIds;
export const selectCurrentFilters = (state: { orders: OrdersState }) => state.orders.currentFilters;
export const selectOrdersIsOnline = (state: { orders: OrdersState }) => state.orders.isOnline;
export const selectOrdersPendingOperations = (state: { orders: OrdersState }) =>
  state.orders.pendingOperations;
export const selectFiltersObject = (state: RootState) => state.orders.filtersObject;

export default ordersSlice.reducer;
