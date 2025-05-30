import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { InventoryProduct, ProductStatus } from '../../types/product';
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
  selectIsOnline,
} from '../../store/slices/productsSlice';
import { productsApi } from '../../api/services/productsApi';

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
  const { t } = useTranslation('productsInventory');

  // États Redux
  const inventoryItems = useSelector(selectProductsItems);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const isOnline = useSelector(selectIsOnline);

  // États locaux pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

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
        dispatch(setError(t('fetchError')));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, itemsPerPage]
  );

  // Chargement initial
  useEffect(() => {
    if (isOnline) {
      fetchInventory(currentPage);
    }
  }, [isOnline, currentPage, fetchInventory]);

  // Fonction pour supprimer un élément avec optimistic update
  const deleteItem = useCallback(
    async (id: number) => {
      try {
        if (isOnline) {
          // Appel API pour persistance si en ligne
          await productsApi.delete(id);

          // Optimistic update via Redux
          dispatch(deleteProductsItem(id));
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
      } catch (err: any) {
        console.log('Error deleting item:', err);
        console.log('israil', err.response.data.message);
        if (err.response.data.message === 'Product is currently in an active order') {
          dispatch(setError(t('activeOrder')));

          throw new Error(t('activeOrder'));
        } else {
          dispatch(setError(t('deleteError')));

          // Recharger les données depuis l'API en cas d'échec
          fetchInventory(currentPage);
        }
      }
    },
    [dispatch, isOnline, currentPage, fetchInventory]
  );

  const forceDeleteItem = useCallback(
    async (id: number) => {
      // Optimistic update via Redux
      dispatch(deleteProductsItem(id));

      try {
        await productsApi.forceDelete(id);
      } catch (err: any) {
        dispatch(setError(t('deleteError')));
        fetchInventory(currentPage);
      }
    },
    [dispatch, currentPage, fetchInventory, t]
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
          t('updateError')
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
          t('statusUpdateError')
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
    forceDeleteItem,
    updateItemQuantity,
    updateItemStatus,
    currentItems: inventoryItems,
    totalPages: totalPages,
    currentPage,
    setCurrentPage: handlePageChange,
  };
}
