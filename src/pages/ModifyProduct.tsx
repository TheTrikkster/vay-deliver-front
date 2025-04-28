import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm/ProductForm';
import { Product } from '../types/product';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setError, updateInventoryItem } from '../store/slices/createInventorySlice';

function CreateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    unitExpression: '',
    availableQuantity: '',
    minOrder: '',
    price: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const product = await axios.get(`http://localhost:3300/products/${id}`);

        setProductData(product.data);
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const handleUpdateProduct = async (updatedProductData: Product) => {
    try {
      const formattedData = {
        name: updatedProductData.name,
        description: updatedProductData.description || '',
        unitExpression: updatedProductData.unitExpression,
        availableQuantity: Number(updatedProductData.availableQuantity),
        minOrder: Number(updatedProductData.minOrder),
        price: Number(updatedProductData.price),
      };

      const response = await axios.put(`http://localhost:3300/products/${id}`, formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Produit mis à jour avec succès:', response.data);

      // Utiliser l'ID tel qu'il est stocké dans MongoDB sans conversion
      dispatch(
        updateInventoryItem({
          id: response.data._id,
          name: response.data.name,
          price: `${response.data.price}₽`,
          quantity: String(response.data.availableQuantity),
          unitExpression: response.data.unitExpression,
          description: response.data.description || '',
          minOrder: response.data.minOrder,
        })
      );

      navigate('/deliveries');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      dispatch(setError(`Impossible de mettre à jour le produit: ${error}`));
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }
  return (
    <ProductForm
      initialValues={productData || undefined}
      onSubmit={handleUpdateProduct}
      isEditing={true}
    />
  );
}

export default CreateProduct;
