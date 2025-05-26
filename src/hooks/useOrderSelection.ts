import { useSelector } from 'react-redux';
import {
  toggleSelectionMode,
  toggleOrderSelection,
  selectAllOrders,
  clearSelection,
  selectSelectedOrderIds,
  selectIsSelectionMode,
} from '../store/slices/ordersSlice';
import { useAppDispatch } from '../store/hooks';

export function useOrderSelection() {
  const dispatch = useAppDispatch();

  const selectedOrderIds = useSelector(selectSelectedOrderIds);
  const isSelectionMode = useSelector(selectIsSelectionMode);

  return {
    selectedOrderIds,
    isSelectionMode,
    toggleSelectionMode: (on: boolean) => dispatch(toggleSelectionMode(on)),
    toggleOrderSelection: (id: string) => dispatch(toggleOrderSelection(id)),
    selectAllOrders: () => dispatch(selectAllOrders()),
    clearSelection: () => dispatch(clearSelection()),
  };
}
