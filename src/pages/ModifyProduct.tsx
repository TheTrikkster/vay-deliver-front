import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { roundToDecimal } from '../components/FoodItemCard/FoodItemCard';
import ProductForm from '../components/ProductForm/ProductForm';
import { Product } from '../types/product';

function CreateProduct() {
  const { id } = useParams();
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    unit: '',
    availableQuantity: '',
    minOrderQuantity: '',
    price: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fonction pour charger les données du produit à partir de l'API
    const fetchProductData = async () => {
      try {
        // Remplacer par votre appel API réel
        // const response = await fetchProduct(id);
        // setProductData(response.data);

        // Exemple de données simulées:
        setProductData({
          name: 'Exemple de produit',
          description: 'Description du produit',
          unit: 'Кг',
          availableQuantity: '100',
          minOrderQuantity: '10',
          price: '15€',
        });
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

  const handleUpdateProduct = (updatedProductData: Product) => {
    // Logique pour mettre à jour le produit
    console.log('Updating product:', updatedProductData);
    // Rediriger vers la liste des produits après modification
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
