import { useOrdersList } from './useOrdersList';
import { useOrderSelection } from './useOrderSelection';
import { useOrderTags } from './useOrderTags/useOrderTags';
import { useNetworkStatus } from './useNetworkStatus';

export function useOrders({ limit = 30 } = {}) {
  const ordersList = useOrdersList({ limit });
  const orderSelection = useOrderSelection();
  const orderTags = useOrderTags();
  const { isOnline } = useNetworkStatus();

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
