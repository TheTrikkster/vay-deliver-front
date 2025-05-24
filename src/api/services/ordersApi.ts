import { OrderDetails } from '../../types/order';
import api from '../config';
import { ENDPOINTS } from '../endpoints';

export const ordersApi = {
  getAll: (page = 1, filters?: string, limit = 1) =>
    api.get(`${ENDPOINTS.ORDERS.BASE}?page=${page}&limit=${limit}${filters ? `&${filters}` : ''}`),

  getById: (id: string) => api.get(`${ENDPOINTS.ORDERS.BASE}/${id}`),

  createOrder: (orderDetails: OrderDetails) => api.post(`${ENDPOINTS.ORDERS.BASE}`, orderDetails),

  updateStatus: (id: string, status: string) =>
    api.patch(`${ENDPOINTS.ORDERS.BASE}/${id}/status`, { status }),

  addTagToOrders: (tagNames: string[], orderIds: string | string[]) =>
    api.post(`${ENDPOINTS.ORDERS.BASE}/tags`, { tagNames, orderIds }),

  removeTagFromOrders: (orderId: string, tagName: string) =>
    api.delete(`${ENDPOINTS.ORDERS.BASE}/${orderId}/tags/${tagName}`),
};
