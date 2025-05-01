import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Order } from '../../types/order';

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
  currentFilters: '',
};

// Thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page, filters }: { page: number; filters?: string }, { rejectWithValue }) => {
    try {
      const url = `http://localhost:3300/orders?page=${page}${filters ? `&${filters}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return rejectWithValue('Impossible de charger les commandes');
    }
  }
);

export const addTagToOrders = createAsyncThunk(
  'orders/addTagToOrders',
  async ({ tagName, orderIds }: { tagName: string; orderIds: string[] }, { rejectWithValue }) => {
    try {
      await axios.post(
        `http://localhost:3300/orders/tags`,
        {
          tagNames: [tagName],
          orderIds,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return { tagName, orderIds };
    } catch (error) {
      console.error("Erreur lors de l'ajout du tag:", error);
      return rejectWithValue("Erreur lors de l'ajout du tag");
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
        state.error = action.payload as string;
      })
      // Gérer addTagToOrders (mise à jour optimiste)
      .addCase(addTagToOrders.fulfilled, (state, action) => {
        const { tagName, orderIds } = action.payload;
        state.orders = state.orders.map(order =>
          orderIds.includes(order._id)
            ? { ...order, tagNames: [...order.tagNames, tagName] }
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
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state: { orders: OrdersState }) => state.orders.orders;
export const selectOrdersLoading = (state: { orders: OrdersState }) => state.orders.loading;
export const selectOrdersError = (state: { orders: OrdersState }) => state.orders.error;
export const selectCurrentPage = (state: { orders: OrdersState }) => state.orders.currentPage;
export const selectTotalPages = (state: { orders: OrdersState }) => state.orders.totalPages;
export const selectIsSelectionMode = (state: { orders: OrdersState }) =>
  state.orders.isSelectionMode;
export const selectSelectedOrderIds = (state: { orders: OrdersState }) =>
  state.orders.selectedOrderIds;
export const selectCurrentFilters = (state: { orders: OrdersState }) => state.orders.currentFilters;

export default ordersSlice.reducer;
