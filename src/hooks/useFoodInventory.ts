import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { InventoryProduct } from '../types/product';
import { mockInventoryItems } from '../utils/inventoryData';
import { handleApiError } from '../utils/errorHandling';
import {
  setInventoryItems,
  setLoading,
  setError,
  updateInventoryItem,
  deleteInventoryItem,
  addPendingOperation,
  selectInventoryItems,
  selectInventoryLoading,
  selectInventoryError,
  selectInventoryLastFetched,
  selectIsOnline,
} from '../store/slices/createInventorySlice';

interface Item {
  _id: number;
  name: string;
  price: number;
  availableQuantity: number;
  unitExpression: number;
  description: string;
}

export function useFoodInventory(itemsPerPage = 30) {
  const dispatch = useDispatch();

  // États Redux
  const inventoryItems = useSelector(selectInventoryItems);
  const loading = useSelector(selectInventoryLoading);
  const error = useSelector(selectInventoryError);
  const lastFetched = useSelector(selectInventoryLastFetched);
  const isOnline = useSelector(selectIsOnline);

  // États locaux (pour la pagination uniquement)
  const [currentPage, setCurrentPage] = useState(1);

  // Déterminer si les données ont besoin d'être rafraîchies
  const shouldRefresh = useCallback(() => {
    if (!lastFetched) return true;

    // Rafraîchir si les données datent de plus de 5 minutes
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
    return Date.now() - lastFetched > REFRESH_INTERVAL;
  }, [lastFetched]);

  // Fonction helper pour charger l'inventaire
  const fetchInventory = useCallback(
    async (source: ReturnType<typeof axios.CancelToken.source>) => {
      try {
        dispatch(setLoading(true));

        const response = await axios.get('http://localhost:3300/products', {
          cancelToken: source.token,
        });

        const transformedItems: InventoryProduct[] = response.data.products.map((item: Item) => ({
          id: item._id || Math.random(),
          name: item.name,
          prix: `${item.price}₽`,
          quantity: String(item.availableQuantity),
          unit: item.unitExpression,
          description: item.description || '',
        }));

        dispatch(setInventoryItems(transformedItems));
        dispatch(setError(null));
      } catch (err) {
        const errorMessage = handleApiError(err);

        // Ne pas écraser les données persistées avec une erreur
        if (inventoryItems.length === 0) {
          dispatch(setError(errorMessage));

          if (process.env.NODE_ENV !== 'production') {
            dispatch(setInventoryItems(mockInventoryItems));
          }
        }
      } finally {
        dispatch(setLoading(false));
      }

      return source;
    },
    [dispatch, inventoryItems.length]
  );

  // Chargement des données
  useEffect(() => {
    let source: ReturnType<typeof axios.CancelToken.source>;

    async function loadInventory() {
      if (inventoryItems.length > 0 && (!isOnline || !shouldRefresh())) {
        return;
      }

      source = axios.CancelToken.source();
      try {
        const result = await fetchInventory(source);
        // Utiliser directement le résultat si nécessaire
      } catch (error) {
        // Gérer l'erreur spécifiquement ici
      }
    }

    loadInventory();

    return () => {
      if (source && source.cancel) {
        source.cancel('Component unmounted');
      }
    };
  }, [dispatch, inventoryItems.length, isOnline, shouldRefresh, fetchInventory]);

  // Calcul de la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventoryItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(inventoryItems.length / itemsPerPage);

  // Fonction pour supprimer un élément avec optimistic update
  const deleteItem = useCallback(
    async (id: number) => {
      // Optimistic update via Redux
      dispatch(deleteInventoryItem(id));

      try {
        if (isOnline) {
          // Appel API pour persistance si en ligne
          await axios.delete(`http://localhost:3300/products/${id}`);
        } else {
          // Stocker l'opération pour exécution ultérieure si hors ligne
          dispatch(
            addPendingOperation({
              type: 'delete',
              timestamp: Date.now(),
              data: { id },
              endpoint: `http://localhost:3300/products/${id}`,
              method: 'DELETE',
            })
          );
        }
      } catch (err) {
        const errorMessage = handleApiError(err);
        dispatch(setError(`Erreur lors de la suppression: ${errorMessage}`));

        // Recharger les données depuis l'API en cas d'échec
        fetchInventory(axios.CancelToken.source());
      }
    },
    [dispatch, isOnline]
  );

  // Fonction pour mettre à jour la quantité d'un élément
  const updateItemQuantity = useCallback(
    async (id: number, quantity: string) => {
      // Validation de la quantité
      if (!quantity || isNaN(Number(quantity))) {
        dispatch(setError('Quantité invalide'));
        return;
      }

      // Trouver l'élément à mettre à jour
      const itemToUpdate = inventoryItems.find(item => item.id === id);

      if (itemToUpdate) {
        // Optimistic update via Redux
        dispatch(
          updateInventoryItem({
            ...itemToUpdate,
            quantity,
          })
        );

        try {
          if (isOnline) {
            // Correction de l'appel API
            await axios.patch(
              `http://localhost:3300/products/quantity?id=${id}&quantity=${quantity}`,
              {}, // Corps vide car les params sont dans l'URL
              { headers: { 'Content-Type': 'application/json' } }
            );
          } else {
            // Stocker l'opération pour exécution ultérieure si hors ligne
            dispatch(
              addPendingOperation({
                type: 'update',
                timestamp: Date.now(),
                data: { id, quantity }, // Simplifier pour correspondre à l'API
                endpoint: `http://localhost:3300/products/quantity?id=${id}&quantity=${quantity}`,
                method: 'PATCH',
              })
            );
          }
        } catch (err) {
          const errorMessage = handleApiError(err);
          dispatch(setError(`Erreur lors de la mise à jour: ${errorMessage}`));

          // Recharger les données depuis l'API en cas d'échec
          fetchInventory(axios.CancelToken.source());
        }
      }
    },
    [dispatch, inventoryItems, isOnline]
  );

  return {
    inventoryItems,
    loading,
    error,
    deleteItem,
    updateItemQuantity,
    currentItems,
    totalPages,
    currentPage,
    setCurrentPage,
  };
}
