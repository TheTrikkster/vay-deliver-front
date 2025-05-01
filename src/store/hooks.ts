import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { RootState } from './userStore';
import { store } from './userStore';

// Définir le type AppDispatch basé sur le store actuel
export type AppDispatch = typeof store.dispatch;

// Créer des hooks personnalisés typés
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
