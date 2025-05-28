import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchOrders,
  setCurrentPage,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectCurrentPage,
  selectTotalPages,
  selectCurrentFilters,
  selectFiltersObject,
  selectDistanceMatrix,
} from '../store/slices/ordersSlice';
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
  const distanceMatrix = useSelector(selectDistanceMatrix);

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
    distanceMatrix,
    setPage: (page: number) => dispatch(setCurrentPage(page)),
  };
}
