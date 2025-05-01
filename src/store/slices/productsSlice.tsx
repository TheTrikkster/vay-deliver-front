import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { InventoryProduct } from '../../types/product';
import { RootState } from '../userStore';

interface ProductsState {
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

const initialState: ProductsState = {
  items: [],
  lastFetched: null,
  isLoading: false,
  error: null,
  isOnline: navigator.onLine,
  pendingOperations: [],
};

export const createProductsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductsItems: (state, action: PayloadAction<InventoryProduct[]>) => {
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
    addProductsItem: (state, action: PayloadAction<InventoryProduct>) => {
      // Vérifier si un produit avec le même nom existe déjà
      const existingIndex = state.items.findIndex(
        item =>
          item.name === action.payload.name &&
          item.price === action.payload.price &&
          item.unitExpression === action.payload.unitExpression
      );

      if (existingIndex !== -1) {
        // Remplacer le produit existant
        state.items[existingIndex] = action.payload;
      } else {
        // Ajouter un nouveau produit
        state.items.push(action.payload);
      }

      state.lastFetched = Date.now();
    },
    updateProductsItem: (state, action: PayloadAction<InventoryProduct>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        state.lastFetched = Date.now();
      }
    },
    deleteProductsItem: (state, action: PayloadAction<number>) => {
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
  setProductsItems,
  setLoading,
  setError,
  setOnlineStatus,
  addProductsItem,
  updateProductsItem,
  deleteProductsItem,
  addPendingOperation,
  removePendingOperation,
  clearPendingOperations,
} = createProductsSlice.actions;

// Sélecteurs de base
export const selectProductsState = (state: RootState) => state.products;
export const selectProductsItems = (state: RootState) => state.products.items;
export const selectProductsLoading = (state: RootState) => state.products.isLoading;
export const selectProductsError = (state: RootState) => state.products.error;
export const selectProductsLastFetched = (state: RootState) => state.products.lastFetched;
export const selectIsOnline = (state: RootState) => state.products.isOnline;
export const selectPendingOperations = (state: RootState) => state.products.pendingOperations;

// Sélecteurs mémoïsés utile pour le futur mais pour l'instant sont inutiles
export const selectProductsItemById = createSelector(
  [selectProductsItems, (_, id: number) => id],
  (items, id) => items.find(item => item.id === id)
);

export const selectFilteredProductsItems = createSelector(
  [selectProductsItems, (_, filterText: string) => filterText],
  (items, filterText) =>
    items.filter(item => item.name.toLowerCase().includes(filterText.toLowerCase()))
);

export default createProductsSlice.reducer;
