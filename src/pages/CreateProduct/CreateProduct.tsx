import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/ProductForm/ProductForm';
import { Product, ProductStatus, InventoryProduct } from '../../types/product';
import { useDispatch, useSelector } from 'react-redux';
import {
  addProductsItem,
  addPendingOperation,
  selectIsOnline,
  deleteProductsItem,
  setError,
} from '../../store/slices/productsSlice';
import { productsApi } from '../../api/services/productsApi';
import { useTranslation } from 'react-i18next';

function CreateProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOnline = useSelector(selectIsOnline);
  const { t } = useTranslation('createProduct');

  const handleCreateProduct = async (productData: Product) => {
    dispatch(setError(null));
    // Préparer les données pour l'API
    const formattedData = {
      name: productData.name,
      description: productData.description,
      unitExpression: productData.unitExpression,
      price: productData.price,
      availableQuantity: productData.availableQuantity,
      minOrder: parseInt(productData.minOrder),
      status: ProductStatus.ACTIVE,
    };

    // Créer un objet temporaire avec un ID provisoire pour l'optimistic update
    const tempProduct: InventoryProduct = { ...formattedData, id: Date.now() };

    // Optimistic update: ajouter immédiatement à l'interface
    dispatch(addProductsItem(tempProduct));

    try {
      if (isOnline) {
        // Si en ligne, envoyer au serveur
        const response = await productsApi.create(formattedData);

        if (response.status !== 200 && response.status !== 201) {
          throw new Error('Failed to create product');
        }

        // Créer le produit avec l'ID réel du serveur
        const newProduct: InventoryProduct = {
          id: response.data._id,
          name: response.data.name,
          price: response.data.price,
          availableQuantity: response.data.availableQuantity,
          unitExpression: response.data.unitExpression,
          description: response.data.description || '',
          minOrder: response.data.minOrder,
          status: response.data.status,
        };

        // Supprimer le produit temporaire et ajouter le produit réel
        dispatch(deleteProductsItem(tempProduct.id));
        dispatch(addProductsItem(newProduct));
      } else {
        // Si hors ligne, ajouter aux opérations en attente
        dispatch(
          addPendingOperation({
            type: 'create',
            timestamp: Date.now(),
            data: formattedData,
            endpoint: 'products',
            method: 'POST',
            tempId: tempProduct.id, // Ajouter l'ID temporaire pour le retrouver plus tard
          })
        );
      }

      navigate('/admin-products');
    } catch (error) {
      dispatch(setError(t('productNoLongerExists')));
      dispatch(deleteProductsItem(tempProduct.id));
    }
  };

  return <ProductForm onSubmit={handleCreateProduct} isEditing={false} />;
}

export default CreateProduct;
