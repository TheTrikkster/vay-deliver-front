import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage par défaut
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import clientReducer from './slices/clientSlice';

// Configuration pour persister sélectivement orders
const ordersPersistConfig = {
  key: 'orders',
  storage,
  whitelist: ['orders', 'currentFilters', 'filtersObject'],
};

// Configuration pour persister les produits (si besoin de sélectivité)
const productsPersistConfig = {
  key: 'products',
  storage,
  // Si vous voulez tout persister, pas besoin de whitelist
};

const clientPersistConfig = {
  key: 'client',
  storage,
  // Si vous voulez tout persister, pas besoin de whitelistf
};

// Combinaison des reducers avec persistance
const rootReducer = combineReducers({
  products: persistReducer(productsPersistConfig, productsReducer),
  orders: persistReducer(ordersPersistConfig, ordersReducer),
  client: persistReducer(clientPersistConfig, clientReducer),
});

// Créer directement le store sans persistance globale supplémentaire
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Actions de redux-persist à ignorer pour la vérification de sérialisation
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
