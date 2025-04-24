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
import inventoryReducer from './slices/createInventorySlice';

// Configuration de la persistance
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['inventory'], // Seul inventory sera persisté
  // Optionnel: ajoutez un stateReconciler pour gérer les conflits de fusion
  // stateReconciler: autoMergeLevel2
};

const rootReducer = combineReducers({
  inventory: inventoryReducer,
  // autres reducers...
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
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
