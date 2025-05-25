import { useSelector } from 'react-redux';
import {
  addTagToOrders,
  removeTagFromOrders,
  selectOrdersPendingOperations,
} from '../store/slices/ordersSlice';
import { useAppDispatch } from '../store/hooks';

export function useOrderTags() {
  const dispatch = useAppDispatch();

  const pendingOperations = useSelector(selectOrdersPendingOperations);

  const addTag = (tagName: string, orderIds: string[] | string) =>
    dispatch(addTagToOrders({ tagName, orderIds }));

  const removeTag = (tagName: string, orderId: string) =>
    dispatch(removeTagFromOrders({ tagName, orderId }));

  return {
    pendingOperations,
    addTag,
    removeTag,
  };
}
