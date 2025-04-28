import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm/ProductForm';
import axios from 'axios';
import { Product, ProductApiData, ProductStatus, InventoryProduct } from '../types/product';
import { useDispatch, useSelector } from 'react-redux';
import {
  addInventoryItem,
  addPendingOperation,
  selectIsOnline,
  deleteInventoryItem,
} from '../store/slices/createInventorySlice';

function CreateProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOnline = useSelector(selectIsOnline);

  const handleCreateProduct = async (productData: Product) => {
    console.log('Creating product:', productData);

    // Préparer les données pour l'API
    const formattedData: ProductApiData = {
      name: productData.name,
      description: productData.description,
      unitExpression: productData.unitExpression,
      price: parseFloat(productData.price.replace('€', '')),
      availableQuantity: parseInt(productData.availableQuantity),
      minOrder: parseInt(productData.minOrder),
      status: ProductStatus.ACTIVE,
    };

    // Créer un objet temporaire avec un ID provisoire pour l'optimistic update
    const tempProduct: InventoryProduct = {
      id: Date.now(), // ID temporaire
      name: productData.name,
      price: `${formattedData.price}₽`,
      quantity: String(formattedData.availableQuantity),
      unitExpression: formattedData.unitExpression,
      description: formattedData.description || '',
      minOrder: formattedData.minOrder,
    };

    // Optimistic update: ajouter immédiatement à l'interface
    dispatch(addInventoryItem(tempProduct));

    try {
      if (isOnline) {
        // Si en ligne, envoyer au serveur
        const response = await axios.post('http://localhost:3300/products', formattedData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status !== 200 && response.status !== 201) {
          throw new Error('Failed to create product');
        }

        // Créer le produit avec l'ID réel du serveur
        const newProduct: InventoryProduct = {
          id: response.data._id || tempProduct.id,
          name: response.data.name,
          price: response.data.price,
          quantity: String(response.data.availableQuantity),
          unitExpression: response.data.unitExpression,
          description: response.data.description || '',
          minOrder: response.data.minOrder,
        };

        // Supprimer le produit temporaire et ajouter le produit réel
        dispatch(deleteInventoryItem(tempProduct.id));
        dispatch(addInventoryItem(newProduct));
      } else {
        // Si hors ligne, ajouter aux opérations en attente
        dispatch(
          addPendingOperation({
            type: 'create',
            timestamp: Date.now(),
            data: formattedData,
            endpoint: 'http://localhost:3300/products',
            method: 'POST',
          })
        );
      }

      navigate('/deliveries');
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      // Note: nous conservons l'élément dans l'interface même en cas d'erreur
      // car l'optimistic update est déjà fait, et ce sera corrigé lors de la prochaine synchro
    }
  };

  return <ProductForm onSubmit={handleCreateProduct} isEditing={false} />;
}

export default CreateProduct;
