import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { productsApi } from '../../api/services/productsApi';
import { ordersApi } from '../../api/services/ordersApi';
import {
  setOnlineStatus as setProductsOnlineStatus,
  selectPendingOperations as selectProductsPendingOperations,
  removePendingOperation as removeProductPendingOperation,
  selectIsOnline as selectProductsIsOnline,
  addProductsItem,
  deleteProductsItem,
  updateProductsItem,
} from '../../store/slices/productsSlice';

import {
  setOnlineStatus as setOrdersOnlineStatus,
  selectOrdersPendingOperations,
  removePendingOperation as removeOrderPendingOperation,
  selectOrdersIsOnline,
} from '../../store/slices/ordersSlice';

import { ProductApiData, ProductStatus } from '../../types/product';
import { AddTagOperationData } from '../../types/order';

interface UpdateOperationData {
  id: number;
  name?: string;
  description?: string;
  unitExpression?: string;
  price?: number;
  availableQuantity?: number;
  minOrder?: number;
  status?: ProductStatus;
}

export const SyncManager: React.FC = () => {
  const dispatch = useDispatch();
  const productsPendingOperations = useSelector(selectProductsPendingOperations) || [];
  const ordersPendingOperations = useSelector(selectOrdersPendingOperations) || [];
  const isProductsOnline = useSelector(selectProductsIsOnline);
  const isOrdersOnline = useSelector(selectOrdersIsOnline);

  // Mettre à jour le statut en ligne/hors ligne pour les deux slices
  useEffect(() => {
    const handleOnline = () => {
      dispatch(setProductsOnlineStatus(true));
      dispatch(setOrdersOnlineStatus(true));
    };
    const handleOffline = () => {
      dispatch(setProductsOnlineStatus(false));
      dispatch(setOrdersOnlineStatus(false));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  // Synchroniser les opérations produits en attente
  const syncProductsPendingOperations = useCallback(async () => {
    if (!isProductsOnline || productsPendingOperations.length === 0) return;

    for (let i = 0; i < productsPendingOperations.length; i++) {
      const operation = productsPendingOperations[i];

      try {
        let response;

        switch (operation.method) {
          case 'POST': {
            const createData = operation.data as ProductApiData;
            response = await productsApi.create(createData);

            // Gérer les données temporaires pour les créations
            if (response?.data && operation.tempId) {
              // Supprimer l'élément temporaire
              dispatch(deleteProductsItem(operation.tempId));

              // Ajouter l'élément avec l'ID réel si nous avons des données valides
              if (response.data._id) {
                const newProduct = {
                  id: response.data._id,
                  name: response.data.name || '',
                  price: response.data.price || 0,
                  availableQuantity: response.data.availableQuantity || 0,
                  unitExpression: response.data.unitExpression || '',
                  description: response.data.description || '',
                  minOrder: response.data.minOrder || 0,
                  status: response.data.status || 'ACTIVE',
                };

                dispatch(addProductsItem(newProduct));
              }
            }
            break;
          }

          case 'PATCH': {
            const updateData = operation.data as UpdateOperationData;
            // Extraire uniquement les données compatibles avec ProductApiData
            const { id, ...apiUpdateData } = updateData;

            // Maintenant, apiUpdateData sera de type Partial<ProductApiData>
            response = await productsApi.update(id, apiUpdateData as ProductApiData);

            // Pour les mises à jour, vérifier si nous avons besoin de mettre à jour
            // les données dans le store avec les données du serveur
            if (response?.data && updateData && updateData.id) {
              // Construire un objet complet avec des valeurs par défaut pour éviter les undefined
              const updatedProduct = {
                id: updateData.id,
                name: response.data.name || '',
                price: response.data.price || 0,
                availableQuantity: response.data.availableQuantity || 0,
                unitExpression: response.data.unitExpression || '',
                description: response.data.description || '',
                minOrder: response.data.minOrder || 0,
                status: response.data.status || 'ACTIVE',
              };

              dispatch(updateProductsItem(updatedProduct));
            }
            break;
          }

          case 'DELETE': {
            const deleteData = operation.data as {
              id: number;
            };
            await productsApi.delete(deleteData.id);

            // Vérifier que l'opération a un ID dans les données
            if (deleteData && deleteData.id) {
              // Une vérification supplémentaire pour s'assurer que l'élément est bien supprimé
              // du store Redux (pour le cas où l'optimistic update n'aurait pas fonctionné)
              dispatch(deleteProductsItem(deleteData.id));
            }
            break;
          }

          default:
            console.warn(`Opération produit non supportée: ${operation.method}`);
        }

        // Supprimer l'opération après réussite
        dispatch(removeProductPendingOperation(i));
      } catch (error) {
        console.error(`Erreur lors de la synchronisation des produits: ${error}`);
      }
    }
  }, [dispatch, isProductsOnline, productsPendingOperations]);

  // Synchroniser les opérations commandes en attente - Version simplifiée
  const syncOrdersPendingOperations = useCallback(async () => {
    if (!isOrdersOnline || ordersPendingOperations.length === 0) return;

    for (let i = 0; i < ordersPendingOperations.length; i++) {
      const operation = ordersPendingOperations[i];

      try {
        // Actuellement, seules les opérations POST de type addTag sont utilisées
        if (operation.method === 'POST' && operation.type === 'addTag') {
          // Assertion de type pour les données d'opération
          const tagData = operation.data as AddTagOperationData;

          await ordersApi.addTagToOrders([tagData.tagName], tagData.orderIds);

          // Supprimer l'opération après réussite
          dispatch(removeOrderPendingOperation(i));
        } else {
          console.warn(`Opération non implémentée: ${operation.method}, type: ${operation.type}`);
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation des commandes: ${error}`);
      }
    }
  }, [dispatch, isOrdersOnline, ordersPendingOperations]);

  // Effectuer la synchronisation lorsque la connexion est rétablie
  useEffect(() => {
    if (isProductsOnline && productsPendingOperations.length > 0) {
      syncProductsPendingOperations();
    }

    if (isOrdersOnline && ordersPendingOperations.length > 0) {
      syncOrdersPendingOperations();
    }
  }, [
    isProductsOnline,
    productsPendingOperations,
    syncProductsPendingOperations,
    isOrdersOnline,
    ordersPendingOperations,
    syncOrdersPendingOperations,
  ]);

  // Aucun rendu visuel
  return null;
};
