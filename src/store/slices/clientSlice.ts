import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductType } from '../../types/client';
import { RootState } from '../userStore';

interface ClientState {
  items: Record<string, number>; // id du produit -> quantité
  products: ProductType[]; // liste des produits dans le panier
  siteStatus: string;
  offlineMessage: string;
}

const initialState: ClientState = {
  items: {},
  products: [],
  siteStatus: 'ONLINE',
  offlineMessage: '',
};

const clientOrderSlice = createSlice({
  name: 'clientOrder',
  initialState,
  reducers: {
    addToClientOrder: (
      state,
      action: PayloadAction<{ productId: string; quantity: number; product: ProductType }>
    ) => {
      const { productId, quantity, product } = action.payload;

      // Mettre à jour les quantités
      state.items[productId] = (state.items[productId] || 0) + quantity;

      // Ajouter le produit s'il n'existe pas déjà
      if (!state.products.some(p => p._id === productId)) {
        state.products.push(product);
      }
    },

    removeFromClientOrder: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;

      if (state.items[productId]) {
        state.items[productId] -= quantity;

        // Supprimer le produit si la quantité est à 0
        if (state.items[productId] <= 0) {
          delete state.items[productId];
          state.products = state.products.filter(p => p._id !== productId);
        }
      }
    },

    clearClientOrder: state => {
      state.items = {};
      state.products = [];
    },

    setSiteStatus: (state, action: PayloadAction<string>) => {
      state.siteStatus = action.payload;
    },

    setOfflineMessage: (state, action: PayloadAction<string>) => {
      state.offlineMessage = action.payload;
    },

    // checkoutClientOrder: state => {
    //   // On garde les données intactes mais on pourrait les traiter ici
    //   // par exemple, marquer le panier comme "en cours de commande"
    //   return state;
    // },
  },
});

export const {
  addToClientOrder,
  removeFromClientOrder,
  clearClientOrder,
  setSiteStatus,
  setOfflineMessage,
} = clientOrderSlice.actions;

export const selectClientState = (state: RootState) => state.client;
export const selectClientItems = (state: RootState) => state.client.items;
export const selectClientProducts = (state: RootState) => state.client.products;
export const selectClientSiteStatus = (state: RootState) => state.client.siteStatus;
export const selectClientOfflineMessage = (state: RootState) => state.client.offlineMessage;

export default clientOrderSlice.reducer;
