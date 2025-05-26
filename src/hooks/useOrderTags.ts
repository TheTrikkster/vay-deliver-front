import { useState } from 'react';
import { ordersApi } from '../api/services/ordersApi';

interface UseOrderTagsProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useOrderTags = (props?: UseOrderTagsProps) => {
  const { onSuccess, onError } = props || {};
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addTag = async (tagName: string, orderIds: string | string[]) => {
    setLoading(true);
    setError(null);

    try {
      const normalizedOrderIds = Array.isArray(orderIds) ? orderIds : [orderIds];

      const response = await ordersApi.addTagToOrders([tagName], normalizedOrderIds);
      setLoading(false);
      onSuccess?.();
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = 'Failed to add tag';
      setError(errorMessage);
      onError?.(err);
      return null;
    }
  };

  const removeTag = async (orderId: string, tagName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ordersApi.removeTagFromOrders(orderId, tagName);
      setLoading(false);
      onSuccess?.();
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = 'Failed to remove tag';
      setError(errorMessage);
      onError?.(err);
      return null;
    }
  };

  return {
    addTag,
    removeTag,
    loading,
    error,
  };
};
