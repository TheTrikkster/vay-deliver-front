import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectIsOnline as selectProductsIsOnline,
  selectPendingOperations as selectProductsPendingOperations,
} from '../store/slices/productsSlice';
import { selectOrdersIsOnline, selectOrdersPendingOperations } from '../store/slices/ordersSlice';

export const OfflineIndicator: React.FC = () => {
  // États de connexion des deux slices
  const isProductsOnline = useSelector(selectProductsIsOnline);
  const isOrdersOnline = useSelector(selectOrdersIsOnline);

  // Opérations en attente des deux slices
  const productsPendingOperations = useSelector(selectProductsPendingOperations) || [];
  const ordersPendingOperations = useSelector(selectOrdersPendingOperations) || [];

  // Calculer le nombre total d'opérations en attente
  const totalPendingOperations = productsPendingOperations.length + ordersPendingOperations.length;

  // L'application est considérée en ligne si les deux slices sont en ligne
  const isFullyOnline = isProductsOnline && isOrdersOnline;

  // N'afficher l'indicateur que si l'app est hors ligne ou s'il y a des opérations en attente
  if (isFullyOnline && totalPendingOperations === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center z-50">
      {!isFullyOnline ? (
        <p>
          В данный момент вы не в сети. Ваши изменения будут синхронизированы, когда соединение
          будет восстановлено.
        </p>
      ) : totalPendingOperations > 0 ? (
        <p>
          Синхронизация в процессе... {totalPendingOperations} ожидающие операции (
          {productsPendingOperations.length} продукты, {ordersPendingOperations.length} заказы).
        </p>
      ) : null}
    </div>
  );
};
