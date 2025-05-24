import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchOrders,
  addTagToOrders,
  removeTagFromOrders,
  setOnlineStatus,
  setCurrentPage,
  setFiltersObject,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectCurrentPage,
  selectTotalPages,
  selectCurrentFilters,
  selectFiltersObject,
  selectOrdersIsOnline,
  selectOrdersPendingOperations,
  selectSelectedOrderIds,
  selectIsSelectionMode,
  toggleSelectionMode,
  toggleOrderSelection,
  selectAllOrders,
  clearSelection,
} from '../store/slices/ordersSlice';
import { OrderStatus, Position } from '../types/order';
import { useAppDispatch } from '../store/hooks';

export function useOrders({ limit = 30 } = {}) {
  const dispatch = useAppDispatch();

  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const currentPage = useSelector(selectCurrentPage);
  const totalPages = useSelector(selectTotalPages);
  const currentFilters = useSelector(selectCurrentFilters);
  const filtersObject = useSelector(selectFiltersObject);
  const isOnline = useSelector(selectOrdersIsOnline);
  const pendingOperations = useSelector(selectOrdersPendingOperations);
  const selectedOrderIds = useSelector(selectSelectedOrderIds);
  const isSelectionMode = useSelector(selectIsSelectionMode);

  useEffect(() => {
    if (isOnline) {
      dispatch(fetchOrders({ page: currentPage, filters: currentFilters, limit }));
    }
  }, [dispatch, isOnline, currentPage, currentFilters, limit]);

  useEffect(() => {
    const goOnline = () => dispatch(setOnlineStatus(true));
    const goOffline = () => dispatch(setOnlineStatus(false));
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [dispatch]);

  const addTag = (tagName: string, orderIds: string[] | string) =>
    dispatch(addTagToOrders({ tagName, orderIds }));

  const removeTag = (tagName: string, orderId: string) =>
    dispatch(removeTagFromOrders({ tagName, orderId }));

  return {
    orders,
    loading,
    error,
    currentPage,
    totalPages,
    currentFilters,
    filtersObject,
    isOnline,
    pendingOperations,
    selectedOrderIds,
    isSelectionMode,
    setPage: (page: number) => dispatch(setCurrentPage(page)),
    applyFilters: (status: OrderStatus | '', tagNames: string[], position: Position) =>
      dispatch(setFiltersObject({ status, tagNames, position })),
    addTag,
    removeTag,
    toggleSelectionMode: (on: boolean) => dispatch(toggleSelectionMode(on)),
    toggleOrderSelection: (id: string) => dispatch(toggleOrderSelection(id)),
    selectAllOrders: () => dispatch(selectAllOrders()),
    clearSelection: () => dispatch(clearSelection()),
  };
}
