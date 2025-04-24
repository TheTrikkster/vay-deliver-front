import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  setOnlineStatus,
  selectPendingOperations,
  removePendingOperation,
  setError,
  selectIsOnline,
} from '../store/slices/createInventorySlice';

export const SyncManager: React.FC = () => {
  const dispatch = useDispatch();
  const pendingOperations = useSelector(selectPendingOperations) || [];
  const isOnline = useSelector(selectIsOnline);

  // Mettre à jour le statut en ligne/hors ligne
  useEffect(() => {
    const handleOnline = () => dispatch(setOnlineStatus(true));
    const handleOffline = () => dispatch(setOnlineStatus(false));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  // Synchroniser les opérations en attente lorsque la connexion est rétablie
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || pendingOperations.length === 0) return;

    for (let i = 0; i < pendingOperations.length; i++) {
      const operation = pendingOperations[i];

      try {
        switch (operation.method) {
          case 'POST':
            await axios.post(operation.endpoint, operation.data, {
              headers: { 'Content-Type': 'application/json' },
            });
            break;
          case 'PATCH':
            await axios.patch(operation.endpoint, operation.data, {
              headers: { 'Content-Type': 'application/json' },
            });
            break;
          case 'DELETE':
            await axios.delete(operation.endpoint);
            break;
          default:
            console.warn(`Opération non supportée: ${operation.method}`);
        }

        // Supprimer l'opération après réussite
        dispatch(removePendingOperation(i));
      } catch (error) {
        console.error(`Erreur lors de la synchronisation: ${error}`);
        // Ajouter une logique de réessai avec backoff exponentiel serait préférable
        dispatch(setError(`Erreur de synchronisation: ${error}`));
      }
    }
  }, [dispatch, isOnline, pendingOperations]);

  // Effectuer la synchronisation lorsque la connexion est rétablie
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      syncPendingOperations();
    }
  }, [isOnline, pendingOperations, syncPendingOperations]);

  // Aucun rendu visuel
  return null;
};
