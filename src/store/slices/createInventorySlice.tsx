import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { InventoryProduct } from '../../types/product';
import { RootState } from '../userStore';

interface InventoryState {
  items: InventoryProduct[];
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  pendingOperations: PendingOperation[];
}

// Pour les opérations en attente quand hors ligne
interface PendingOperation<T = any> {
  type: 'create' | 'update' | 'delete';
  timestamp: number;
  data: T;
  endpoint: string;
  method: string;
}

const initialState: InventoryState = {
  items: [],
  lastFetched: null,
  isLoading: false,
  error: null,
  isOnline: navigator.onLine,
  pendingOperations: [],
};

export const createInventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryItems: (state, action: PayloadAction<InventoryProduct[]>) => {
      state.items = action.payload;
      state.lastFetched = Date.now();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addInventoryItem: (state, action: PayloadAction<InventoryProduct>) => {
      state.items.push(action.payload);
      state.lastFetched = Date.now();
    },
    updateInventoryItem: (state, action: PayloadAction<InventoryProduct>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        state.lastFetched = Date.now();
      }
    },
    deleteInventoryItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.lastFetched = Date.now();
    },
    addPendingOperation: (state, action: PayloadAction<PendingOperation>) => {
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
  },
});

// Export des actions
export const {
  setInventoryItems,
  setLoading,
  setError,
  setOnlineStatus,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addPendingOperation,
  removePendingOperation,
  clearPendingOperations,
} = createInventorySlice.actions;

// Sélecteurs de base
export const selectInventoryState = (state: RootState) => state.inventory;
export const selectInventoryItems = (state: RootState) => state.inventory.items;
export const selectInventoryLoading = (state: RootState) => state.inventory.isLoading;
export const selectInventoryError = (state: RootState) => state.inventory.error;
export const selectInventoryLastFetched = (state: RootState) => state.inventory.lastFetched;
export const selectIsOnline = (state: RootState) => state.inventory.isOnline;
export const selectPendingOperations = (state: RootState) => state.inventory.pendingOperations;

// Sélecteurs mémoïsés utile pour le futur mais pour l'instant sont inutiles
export const selectInventoryItemById = createSelector(
  [selectInventoryItems, (_, id: number) => id],
  (items, id) => items.find(item => item.id === id)
);

export const selectFilteredInventoryItems = createSelector(
  [selectInventoryItems, (_, filterText: string) => filterText],
  (items, filterText) =>
    items.filter(item => item.name.toLowerCase().includes(filterText.toLowerCase()))
);

export default createInventorySlice.reducer;
