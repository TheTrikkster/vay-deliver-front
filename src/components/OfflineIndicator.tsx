import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsOnline, selectPendingOperations } from '../store/slices/createInventorySlice';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useSelector(selectIsOnline);
  const pendingOperations = useSelector(selectPendingOperations) || [];

  if (isOnline && pendingOperations.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center z-50">
      {!isOnline ? (
        <p>
          Vous êtes actuellement hors ligne. Vos modifications seront synchronisées lorsque la
          connexion sera rétablie.
        </p>
      ) : pendingOperations.length > 0 ? (
        <p>Synchronisation en cours... {pendingOperations.length} opération(s) en attente.</p>
      ) : null}
    </div>
  );
};
