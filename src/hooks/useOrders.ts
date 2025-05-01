import { useEffect, useState } from 'react';
import { Order } from '../types/order';
import axios from 'axios';

// Extraction de la logique API dans un custom hook
export const useOrders = (currentPage: number, filters: string = '') => {
  const [state, setState] = useState({
    orders: [] as Order[],
    totalPages: 1,
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const url = `http://localhost:3300/orders?page=${currentPage}${filters ? `&${filters}` : ''}`;
        const response = await axios.get<{ orders: Order[]; totalPages: number }>(url);
        setState({
          orders: response.data.orders,
          totalPages: response.data.totalPages,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Impossible de charger les commandes',
        }));
      }
    };
    fetchOrders();
  }, [currentPage, filters]);

  return state;
};
