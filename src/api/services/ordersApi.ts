import { OrderDetails } from '../../types/order';
import api from '../config';
import { ENDPOINTS } from '../endpoints';

export const ordersApi = {
  getAll: (page = 1, filters?: string, limit = 1, distanceMatrix?: any) => {
    const url = `${ENDPOINTS.ORDERS.BASE}/search?page=${page}&limit=${limit}${filters ? `&${filters}` : ''}`;
    const data = distanceMatrix ? { distanceMatrix } : {};
    return api.post(url, data);
  },

  getById: (id: string) => api.get(`${ENDPOINTS.ORDERS.BASE}/${id}`),

  createOrder: (orderDetails: OrderDetails) => api.post(`${ENDPOINTS.ORDERS.BASE}`, orderDetails),

  updateStatus: (id: string, status: string) =>
    api.patch(`${ENDPOINTS.ORDERS.BASE}/${id}/status`, { status }),

  addTagToOrders: (tagNames: string[], orderIds: string | string[]) =>
    api.post(`${ENDPOINTS.ORDERS.BASE}/tags`, { tagNames, orderIds }),

  removeTagFromOrders: (orderId: string, tagName: string) =>
    api.delete(`${ENDPOINTS.ORDERS.BASE}/${orderId}/tags/${tagName}`),
};
