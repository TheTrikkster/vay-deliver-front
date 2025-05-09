import api from '../config';
import { ENDPOINTS } from '../endpoints';

export const ordersApi = {
  getAll: (page = 1, filters?: string, limit = 30) =>
    api.get(`${ENDPOINTS.ORDERS.BASE}?page=${page}&limit=${limit}${filters ? `&${filters}` : ''}`),

  getById: (id: string) => api.get(`${ENDPOINTS.ORDERS.BASE}/${id}`),

  updateStatus: (id: string, status: string) =>
    api.patch(`${ENDPOINTS.ORDERS.BASE}/${id}`, { status }),

  addTagToOrders: (tagNames: string[], orderIds: string[]) =>
    api.post(`${ENDPOINTS.ORDERS.BASE}/tags`, { tagNames, orderIds }),
};
