import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useOrder } from './useOrder';
import { ordersApi } from '../../api/services/ordersApi';
import type { AxiosResponse } from 'axios';

// Mock react-router navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useAddressFilter complètement
const mockSetFilterAddress = jest.fn();
jest.mock('../useAddressFilter', () => ({
  useAddressFilter: () => ({
    setFilterAddress: mockSetFilterAddress,
  }),
}));

jest.mock('../../api/services/ordersApi');
const mockedOrdersApi = ordersApi as jest.Mocked<typeof ordersApi>;

describe('useOrder hook', () => {
  const orderId = 'order123';

  const extendedOrder = {
    _id: orderId,
    status: 'PENDING',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '0123456789',
    address: '123 Rue Exemple, Paris',
    createdAt: '2025-05-01T12:00:00Z',
    updatedAt: '2025-05-02T08:00:00Z',
    items: [
      { product: { name: 'Prod1', price: 10 }, quantity: 2 },
      { product: { name: 'Prod2', price: 5 }, quantity: 1 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading=true and fetch order', async () => {
    const resp = { data: extendedOrder } as AxiosResponse;
    mockedOrdersApi.getById.mockResolvedValueOnce(resp);

    const { result } = renderHook(() => useOrder({ id: orderId }));

    // initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // after fetch
    expect(mockedOrdersApi.getById).toHaveBeenCalledWith(orderId);
    expect(result.current.orderDetails).toEqual(extendedOrder);
    expect(result.current.error).toBeNull();
  });

  it('should set error on fetch failure', async () => {
    // Mocker console.error pour éviter l'affichage de l'erreur pendant le test
    const originalError = console.error;
    console.error = jest.fn();

    mockedOrdersApi.getById.mockRejectedValueOnce(new Error('Fetch error'));

    const { result } = renderHook(() => useOrder({ id: orderId }));

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error loading order');

    // Vérifier que console.error a été appelé
    expect(console.error).toHaveBeenCalledWith(expect.any(Error));

    // Restaurer console.error
    console.error = originalError;
  });

  describe('calculateTotal', () => {
    it('should return zero when no items', async () => {
      mockedOrdersApi.getById.mockResolvedValueOnce({
        data: { ...extendedOrder, items: [] },
      } as any);

      const { result } = renderHook(() => useOrder({ id: orderId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.total).toBe('0,00 €');
    });

    it('should sum item prices * quantities', async () => {
      mockedOrdersApi.getById.mockResolvedValueOnce({ data: extendedOrder } as any);

      const { result } = renderHook(() => useOrder({ id: orderId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 2*10 + 1*5 = 25
      expect(result.current.total).toBe('25,00 €');
    });
  });

  describe('handleUpdateStatus', () => {
    beforeEach(() => {
      mockedOrdersApi.getById.mockResolvedValue({ data: extendedOrder } as any);
    });

    it('updates status on success', async () => {
      mockedOrdersApi.updateStatus.mockResolvedValue({} as AxiosResponse);

      const { result } = renderHook(() => useOrder({ id: orderId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleActionClick('COMPLETE');
      });

      await act(async () => {
        const success = await result.current.handleConfirmAction();
        expect(success).toBe(true);
      });

      expect(mockedOrdersApi.updateStatus).toHaveBeenCalledWith(orderId, 'COMPLETED');
      expect(result.current.orderDetails?.status).toBe('COMPLETED');
    });

    it('returns false on error', async () => {
      // Mocker console.error pour éviter l'affichage de l'erreur pendant le test
      const originalError = console.error;
      console.error = jest.fn();

      mockedOrdersApi.updateStatus.mockRejectedValue(new Error('Update error'));

      const { result } = renderHook(() => useOrder({ id: orderId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleActionClick('CANCEL');
      });

      await act(async () => {
        const success = await result.current.handleConfirmAction();
        expect(success).toBe(false);
      });

      // Vérifier que console.error a été appelé avec le bon message
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error updating order to CANCELED'),
        expect.any(Error)
      );

      // Restaurer console.error
      console.error = originalError;
    });
  });

  describe('handleDeleteOrder', () => {
    beforeEach(() => {
      mockedOrdersApi.getById.mockResolvedValue({ data: extendedOrder } as any);
    });

    it('deletes order and navigates back on success', async () => {
      mockedOrdersApi.deleteOrder.mockResolvedValue({} as AxiosResponse);

      const { result } = renderHook(() => useOrder({ id: orderId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleActionClick('DELETE');
      });

      expect(result.current.isConfirmModalOpen).toBe(true);

      await act(async () => {
        const success = await result.current.handleConfirmAction();
        expect(success).toBe(true);
      });

      expect(mockedOrdersApi.deleteOrder).toHaveBeenCalledWith(orderId);
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('returns false on delete error', async () => {
      // Mocker console.error pour éviter l'affichage de l'erreur pendant le test
      const originalError = console.error;
      console.error = jest.fn();

      mockedOrdersApi.deleteOrder.mockRejectedValue(new Error('Delete error'));

      const { result } = renderHook(() => useOrder({ id: orderId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleActionClick('DELETE');
      });

      await act(async () => {
        const success = await result.current.handleConfirmAction();
        expect(success).toBe(false);
      });

      // Vérifier que console.error a été appelé avec le bon message
      expect(console.error).toHaveBeenCalledWith('Error deleting order:', expect.any(Error));

      // Restaurer console.error
      console.error = originalError;
    });
  });

  describe('action flow', () => {
    beforeEach(() => {
      mockedOrdersApi.getById.mockResolvedValue({ data: extendedOrder } as any);
    });

    it('should open and confirm COMPLETE action', async () => {
      mockedOrdersApi.updateStatus.mockResolvedValue({} as any);

      const { result } = renderHook(() => useOrder({ id: orderId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleActionClick('COMPLETE');
      });
      expect(result.current.currentAction).toBe('COMPLETE');
      expect(result.current.isConfirmModalOpen).toBe(true);

      await act(async () => {
        const success = await result.current.handleConfirmAction();
        expect(success).toBe(true);
      });

      expect(result.current.isConfirmModalOpen).toBe(false);
      expect(result.current.currentAction).toBeNull();
    });

    it('getConfirmationInfo returns correct texts', async () => {
      const { result } = renderHook(() => useOrder({ id: orderId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleActionClick('CANCEL');
      });

      const info = result.current.getConfirmationInfo();
      expect(info).toEqual({ title: 'cancelAction', message: 'confirmCancel' });
    });
  });

  describe('refreshOrderDetails', () => {
    it('refreshes details on success', async () => {
      mockedOrdersApi.getById.mockResolvedValueOnce({ data: extendedOrder } as any);

      const { result } = renderHook(() => useOrder({ id: orderId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newOrder = { ...extendedOrder, status: 'COMPLETED' };
      mockedOrdersApi.getById.mockResolvedValueOnce({ data: newOrder } as any);

      await act(async () => {
        const success = await result.current.refreshOrderDetails();
        expect(success).toBe(true);
      });

      expect(result.current.orderDetails?.status).toBe('COMPLETED');
    });

    it('returns false on error', async () => {
      // Mocker console.error pour éviter l'affichage de l'erreur pendant le test
      const originalError = console.error;
      console.error = jest.fn();

      mockedOrdersApi.getById.mockResolvedValueOnce({ data: extendedOrder } as any);

      const { result } = renderHook(() => useOrder({ id: orderId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockedOrdersApi.getById.mockRejectedValueOnce(new Error('Refresh error'));

      await act(async () => {
        const success = await result.current.refreshOrderDetails();
        expect(success).toBe(false);
      });

      // Vérifier que console.error a été appelé avec le bon message
      expect(console.error).toHaveBeenCalledWith(
        'Error refreshing order details:',
        expect.any(Error)
      );

      // Restaurer console.error
      console.error = originalError;
    });
  });
});
