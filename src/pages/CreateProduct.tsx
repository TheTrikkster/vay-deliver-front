import React, { useCallback, useState, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roundToDecimal } from '../components/FoodItemCard/FoodItemCard';
import ProductForm from '../components/ProductForm/ProductForm';
import axios from 'axios';
import { Product, ProductApiData, ProductStatus, InventoryProduct } from '../types/product';
import { useDispatch, useSelector } from 'react-redux';
import {
  addInventoryItem,
  addPendingOperation,
  selectIsOnline,
} from '../store/slices/createInventorySlice';

function CreateProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOnline = useSelector(selectIsOnline);
  const [newFood, setNewFood] = useState({
    name: '',
    description: '',
    unit: '',
    availableQuantity: '',
    minOrderQuantity: '',
    price: '',
  });

  const handleCreateInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewFood(prev => ({
        ...prev,
        [name]: name === 'quantity' ? roundToDecimal(parseFloat(value) || 0) : value,
      }));
    },
    []
  );

  const handleCreateProduct = async (productData: Product) => {
    console.log('Creating product:', productData);

    // Préparer les données pour l'API
    const formattedData: ProductApiData = {
      name: productData.name,
      description: productData.description,
      unitExpression: productData.unit,
      price: parseFloat(productData.price.replace('€', '')),
      availableQuantity: parseInt(productData.availableQuantity),
      minOrder: parseInt(productData.minOrderQuantity),
      status: ProductStatus.ACTIVE,
    };

    // Créer un objet temporaire avec un ID provisoire pour l'optimistic update
    const tempProduct: InventoryProduct = {
      id: Date.now(), // ID temporaire
      name: productData.name,
      prix: `${formattedData.price}₽`,
      quantity: String(formattedData.availableQuantity),
      unit: formattedData.unitExpression,
      description: formattedData.description || '',
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

        // Mettre à jour avec l'ID réel du serveur
        const newProduct: InventoryProduct = {
          id: response.data._id || tempProduct.id,
          name: response.data.name,
          prix: `${response.data.price}₽`,
          quantity: String(response.data.availableQuantity),
          unit: response.data.unitExpression,
          description: response.data.description || '',
        };

        // Remplacer le produit temporaire par le produit réel
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
