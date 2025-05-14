import api from '../config';
import { ENDPOINTS } from '../endpoints';
import { ProductApiData } from '../../types/product';

export const productsApi = {
  getAll: (page = 1, limit = 30) =>
    api.get(`${ENDPOINTS.PRODUCTS.BASE}`, { params: { page, limit } }),

  getClientProducts: (page = 1, limit = 30) =>
    api.get(`${ENDPOINTS.PRODUCTS.CLIENT}`, { params: { page, limit } }),

  getById: (id: string | number) => api.get(`${ENDPOINTS.PRODUCTS.BASE}/${id}`),

  create: (productData: ProductApiData) => api.post(ENDPOINTS.PRODUCTS.BASE, productData),

  updateQuantity: (id: number, quantity: number) =>
    api.patch(`${ENDPOINTS.PRODUCTS.QUANTITY}?id=${id}&quantity=${quantity}`),

  updateStatus: (id: number, status: string) =>
    api.patch(`${ENDPOINTS.PRODUCTS.STATUS}?id=${id}&status=${status}`),

  delete: (id: number) => api.delete(`${ENDPOINTS.PRODUCTS.BASE}/${id}`),

  update: (id: string | number, productData: ProductApiData) =>
    api.put(`${ENDPOINTS.PRODUCTS.BASE}/${id}`, productData),
};
