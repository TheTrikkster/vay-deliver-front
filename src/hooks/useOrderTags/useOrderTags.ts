import { useState } from 'react';
import { ordersApi } from '../../api/services/ordersApi';

interface UseOrderTagsProps {
  onAddTagSuccess?: (tagName: string, orderIds: string[]) => void;
  onRemoveTagSuccess?: (tagName: string, orderId: string) => void;
  onError?: (error: any) => void;
}

export const useOrderTags = (props?: UseOrderTagsProps) => {
  const { onAddTagSuccess, onRemoveTagSuccess, onError } = props || {};
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addTag = async (tagName: string, orderIds: string | string[]) => {
    setLoading(true);
    setError(null);

    try {
      const normalizedOrderIds = Array.isArray(orderIds) ? orderIds : [orderIds];

      const response = await ordersApi.addTagToOrders([tagName], normalizedOrderIds);
      setLoading(false);

      // Appeler le callback de succès spécifique à addTag
      onAddTagSuccess?.(tagName, normalizedOrderIds);

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

      // Appeler le callback de succès spécifique à removeTag
      onRemoveTagSuccess?.(tagName, orderId);

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
