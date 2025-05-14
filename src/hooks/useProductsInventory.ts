import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InventoryProduct, ProductStatus } from '../types/product';
import { handleApiError } from '../utils/errorHandling';
import {
  setProductsItems,
  setLoading,
  setError,
  updateProductsItem,
  deleteProductsItem,
  addPendingOperation,
  selectProductsItems,
  selectProductsLoading,
  selectProductsError,
  selectProductsLastFetched,
  selectIsOnline,
} from '../store/slices/productsSlice';
import { productsApi } from '../api/services/productsApi';

interface Item {
  _id: number;
  name: string;
  price: number;
  availableQuantity: number;
  unitExpression: number;
  description: string;
  minOrder: number;
  status: ProductStatus;
}

export function useProductsInventory(itemsPerPage = 30) {
  const dispatch = useDispatch();

  // États Redux
  const inventoryItems = useSelector(selectProductsItems);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const lastFetched = useSelector(selectProductsLastFetched);
  const isOnline = useSelector(selectIsOnline);

  // États locaux pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Déterminer si les données ont besoin d'être rafraîchies
  const shouldRefresh = useCallback(() => {
    if (!lastFetched) return true;

    // Rafraîchir si les données datent de plus de 5 minutes
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
    return Date.now() - lastFetched > REFRESH_INTERVAL;
  }, [lastFetched]);

  // Fonction modifiée pour charger l'inventaire avec pagination
  const fetchInventory = useCallback(
    async (page = 1) => {
      try {
        dispatch(setError(null));
        dispatch(setLoading(true));

        // Modifier l'URL pour inclure les paramètres de pagination
        const response = await productsApi.getAll(page, itemsPerPage);

        const transformedItems: InventoryProduct[] = response.data.products.map((item: Item) => ({
          id: item._id,
          name: item.name,
          price: item.price,
          availableQuantity: item.availableQuantity,
          unitExpression: item.unitExpression,
          description: item.description,
          minOrder: item.minOrder,
          status: item.status,
        }));

        setTotalPages(response.data.totalPages || Math.ceil(response.data.total / itemsPerPage));

        dispatch(setProductsItems(transformedItems));
        dispatch(setError(null));
      } catch (err) {
        dispatch(setError('Не удалось получить продукты'));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, itemsPerPage]
  );

  // Chargement initial
  useEffect(() => {
    if (shouldRefresh()) {
      fetchInventory(currentPage);
    }
  }, [shouldRefresh, currentPage, fetchInventory]);

  // Fonction pour supprimer un élément avec optimistic update
  const deleteItem = useCallback(
    async (id: number) => {
      // Optimistic update via Redux
      dispatch(deleteProductsItem(id));

      try {
        if (isOnline) {
          // Appel API pour persistance si en ligne
          await productsApi.delete(id);
        } else {
          // Stocker l'opération pour exécution ultérieure si hors ligne
          dispatch(
            addPendingOperation({
              type: 'delete',
              timestamp: Date.now(),
              data: { id },
              endpoint: `products/${id}`,
              method: 'DELETE',
            })
          );
        }
      } catch (err) {
        console.log('Error deleting item:', err);
        dispatch(setError('Ошибка при удалении'));

        // Recharger les données depuis l'API en cas d'échec
        fetchInventory(currentPage);
      }
    },
    [dispatch, isOnline, currentPage, fetchInventory]
  );

  const performOptimisticUpdate = useCallback(
    async (
      item: InventoryProduct,
      updatedData: Partial<InventoryProduct>,
      apiCall: () => Promise<void>,
      errorMessage: string
    ) => {
      const originalItem = { ...item };
      dispatch(updateProductsItem({ ...item, ...updatedData }));

      try {
        await apiCall();
      } catch (err) {
        dispatch(setError(errorMessage));
        dispatch(updateProductsItem(originalItem));
      }
    },
    [dispatch, isOnline]
  );

  // Fonction pour mettre à jour la quantité d'un élément
  const updateItemQuantity = useCallback(
    async (id: number, availableQuantity: number) => {
      const itemToUpdate = inventoryItems.find(item => item.id === id);
      if (itemToUpdate) {
        performOptimisticUpdate(
          itemToUpdate,
          { availableQuantity },
          async () => {
            if (isOnline) {
              // Utilisation du service API
              await productsApi.updateQuantity(id, availableQuantity);
            } else {
              // Stocker l'opération pour exécution ultérieure si hors ligne
              dispatch(
                addPendingOperation({
                  type: 'update',
                  timestamp: Date.now(),
                  data: { id, availableQuantity },
                  endpoint: `products/quantity?id=${id}&quantity=${availableQuantity}`, // URL relative
                  method: 'PATCH',
                })
              );
            }
          },
          'Ошибка при обновлении'
        );
      }
    },
    [dispatch, inventoryItems, isOnline, currentPage, fetchInventory, performOptimisticUpdate]
  );

  const updateItemStatus = useCallback(
    async (id: number, status: ProductStatus) => {
      // Trouver l'élément à mettre à jour
      const itemToUpdate = inventoryItems.find(item => item.id === id);

      if (itemToUpdate) {
        performOptimisticUpdate(
          itemToUpdate,
          { status },
          async () => {
            if (isOnline) {
              // Appel API pour persistance
              await productsApi.updateStatus(id, status);
            } else {
              // Stocker l'opération pour exécution ultérieure si hors ligne
              dispatch(
                addPendingOperation({
                  type: 'update',
                  timestamp: Date.now(),
                  data: { id, status },
                  endpoint: `products/status?id=${id}&status=${status}`,
                  method: 'PATCH',
                })
              );
            }
          },
          'Ошибка обновления статуса'
        );
      }
    },
    [dispatch, inventoryItems, isOnline, currentPage, fetchInventory, performOptimisticUpdate]
  );

  // Fonction pour changer de page
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      fetchInventory(newPage);
    },
    [fetchInventory]
  );

  return {
    loading,
    error,
    deleteItem,
    updateItemQuantity,
    updateItemStatus,
    currentItems: inventoryItems,
    totalPages: totalPages,
    currentPage,
    setCurrentPage: handlePageChange,
  };
}
