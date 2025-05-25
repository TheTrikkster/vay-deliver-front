import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchOrders,
  setCurrentPage,
  setFiltersObject,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectCurrentPage,
  selectTotalPages,
  selectCurrentFilters,
  selectFiltersObject,
} from '../store/slices/ordersSlice';
import { OrderStatus, Position } from '../types/order';
import { useAppDispatch } from '../store/hooks';
import { useNetworkStatus } from './useNetworkStatus';

export function useOrdersList({ limit = 30 } = {}) {
  const dispatch = useAppDispatch();
  const { isOnline } = useNetworkStatus();

  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const currentPage = useSelector(selectCurrentPage);
  const totalPages = useSelector(selectTotalPages);
  const currentFilters = useSelector(selectCurrentFilters);
  const filtersObject = useSelector(selectFiltersObject);

  useEffect(() => {
    if (isOnline) {
      dispatch(fetchOrders({ page: currentPage, filters: currentFilters, limit }));
    }
  }, [dispatch, isOnline, currentPage, currentFilters, limit]);

  return {
    orders,
    loading,
    error,
    currentPage,
    totalPages,
    currentFilters,
    filtersObject,
    setPage: (page: number) => dispatch(setCurrentPage(page)),
    applyFilters: (status: OrderStatus | '', tagNames: string[], position: Position) =>
      dispatch(setFiltersObject({ status, tagNames, position })),
  };
}
