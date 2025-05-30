import { act } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useOrderTags } from './useOrderTags';
import { ordersApi } from '../../api/services/ordersApi';
import type { AxiosResponse } from 'axios';

jest.mock('../../api/services/ordersApi');
const mockedOrdersApi = ordersApi as jest.Mocked<typeof ordersApi>;

describe('useOrderTags hook', () => {
  const mockSuccessData = { success: true } as unknown as AxiosResponse;
  const tagName = 'urgent';
  const singleOrderId = 'order1';
  const multipleOrderIds = ['order1', 'order2'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading=false and error=null', () => {
    const { result } = renderHook(() => useOrderTags());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('addTag', () => {
    it('should call addTagToOrders with single id string and update states on success', async () => {
      mockedOrdersApi.addTagToOrders.mockResolvedValueOnce(mockSuccessData);
      const onSuccess = jest.fn();
      const { result, waitForNextUpdate } = renderHook(() => useOrderTags({ onSuccess }));

      let response;
      act(() => {
        response = result.current.addTag(tagName, singleOrderId);
      });

      // loading set to true
      expect(result.current.loading).toBe(true);
      await waitForNextUpdate();

      // should call API with array of ids
      expect(mockedOrdersApi.addTagToOrders).toHaveBeenCalledWith([tagName], [singleOrderId]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(onSuccess).toHaveBeenCalled();
      await expect(response).resolves.toBe(mockSuccessData.data);
    });

    it('should call addTagToOrders with array of ids and handle error', async () => {
      const apiError = new Error('API error');
      mockedOrdersApi.addTagToOrders.mockRejectedValueOnce(apiError);
      const onError = jest.fn();
      const { result, waitForNextUpdate } = renderHook(() => useOrderTags({ onError }));

      let response;
      act(() => {
        response = result.current.addTag(tagName, multipleOrderIds);
      });

      expect(result.current.loading).toBe(true);
      await waitForNextUpdate();

      expect(mockedOrdersApi.addTagToOrders).toHaveBeenCalledWith([tagName], multipleOrderIds);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to add tag');
      expect(onError).toHaveBeenCalledWith(apiError);
      await expect(response).resolves.toBeNull();
    });
  });

  describe('removeTag', () => {
    it('should call removeTagFromOrders and update states on success', async () => {
      mockedOrdersApi.removeTagFromOrders.mockResolvedValueOnce(mockSuccessData);
      const onSuccess = jest.fn();
      const { result, waitForNextUpdate } = renderHook(() => useOrderTags({ onSuccess }));

      let response;
      act(() => {
        response = result.current.removeTag(singleOrderId, tagName);
      });

      expect(result.current.loading).toBe(true);
      await waitForNextUpdate();

      expect(mockedOrdersApi.removeTagFromOrders).toHaveBeenCalledWith(singleOrderId, tagName);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(onSuccess).toHaveBeenCalled();
      await expect(response).resolves.toBe(mockSuccessData.data);
    });

    it('should handle error from removeTagFromOrders', async () => {
      const apiError = new Error('Remove API error');
      mockedOrdersApi.removeTagFromOrders.mockRejectedValueOnce(apiError);
      const onError = jest.fn();
      const { result, waitForNextUpdate } = renderHook(() => useOrderTags({ onError }));

      let response;
      act(() => {
        response = result.current.removeTag(singleOrderId, tagName);
      });

      expect(result.current.loading).toBe(true);
      await waitForNextUpdate();

      expect(mockedOrdersApi.removeTagFromOrders).toHaveBeenCalledWith(singleOrderId, tagName);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to remove tag');
      expect(onError).toHaveBeenCalledWith(apiError);
      await expect(response).resolves.toBeNull();
    });
  });
});
