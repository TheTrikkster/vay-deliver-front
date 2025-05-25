import { useOrdersList } from './useOrdersList';
import { useOrderSelection } from './useOrderSelection';
import { useOrderTags } from './useOrderTags';
import { useNetworkStatus } from './useNetworkStatus';

export function useOrders({ limit = 30 } = {}) {
  const ordersList = useOrdersList({ limit });
  const orderSelection = useOrderSelection();
  const orderTags = useOrderTags();
  const { isOnline } = useNetworkStatus();

  return {
    ...ordersList,
    ...orderSelection,
    ...orderTags,
    isOnline,
  };
}
