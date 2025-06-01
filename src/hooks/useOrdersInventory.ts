import { useOrdersList } from './useOrdersList';
import { useOrderSelection } from './useOrderSelection';
import { useOrderTags } from './useOrderTags/useOrderTags';
import { useNetworkStatus } from './useNetworkStatus';
import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { updateOrderTags, removeOrderTag } from '../store/slices/ordersSlice';

export function useOrders({ limit = 30 } = {}) {
  const dispatch = useAppDispatch();
  const ordersList = useOrdersList({ limit });
  const orderSelection = useOrderSelection();
  const { isOnline } = useNetworkStatus();

  // Callback pour gérer le succès d'ajout de tag
  const handleAddTagSuccess = useCallback(
    (tagName: string, orderIds: string[]) => {
      // Mettre à jour les commandes localement
      dispatch(updateOrderTags({ tagName, orderIds }));

      // Sortir du mode sélection
      orderSelection.toggleSelectionMode(false);
    },
    [dispatch, orderSelection]
  );

  // Callback pour gérer le succès de suppression de tag
  const handleRemoveTagSuccess = useCallback(
    (tagName: string, orderId: string) => {
      // Mettre à jour les commandes localement
      dispatch(removeOrderTag({ tagName, orderId }));
    },
    [dispatch]
  );

  const orderTags = useOrderTags({
    onAddTagSuccess: handleAddTagSuccess,
    onRemoveTagSuccess: handleRemoveTagSuccess,
  });

  return {
    // Données et états de la liste des commandes
    orders: ordersList.orders,
    loading: ordersList.loading,
    error: ordersList.error, // Erreur principale (chargement des commandes)
    currentPage: ordersList.currentPage,
    totalPages: ordersList.totalPages,
    currentFilters: ordersList.currentFilters,
    filtersObject: ordersList.filtersObject,
    distanceMatrix: ordersList.distanceMatrix,
    setPage: ordersList.setPage,

    // États de sélection
    selectedOrderIds: orderSelection.selectedOrderIds,
    isSelectionMode: orderSelection.isSelectionMode,
    toggleSelectionMode: orderSelection.toggleSelectionMode,
    toggleOrderSelection: orderSelection.toggleOrderSelection,
    selectAllOrders: orderSelection.selectAllOrders,
    clearSelection: orderSelection.clearSelection,

    // Gestion des tags
    addTag: orderTags.addTag,
    removeTag: orderTags.removeTag,
    tagError: orderTags.error, // Erreur spécifique aux tags
    tagLoading: orderTags.loading,

    // Statut réseau
    isOnline,
  };
}
