import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/ProductForm/ProductForm';
import { Product } from '../../types/product';
import { productsApi } from '../../api/services/productsApi';
import { useDispatch, useSelector } from 'react-redux';
import {
  setLoading,
  setError,
  updateProductsItem,
  selectProductsLoading,
} from '../../store/slices/productsSlice';
import { useTranslation } from 'react-i18next';

function ModifyProduct() {
  const { t } = useTranslation('modifyProduct');
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectProductsLoading);
  const [productData, setProductData] = useState<Product | null>(null);
  const [getError, setGetError] = useState<string>('');

  useEffect(() => {
    const fetchProductData = async () => {
      dispatch(setLoading(true));
      try {
        const response = await productsApi.getById(id!);
        setProductData(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
        setGetError(t('errorLoadingProduct'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id, dispatch]);

  const handleUpdateProduct = async (updatedProductData: Product) => {
    dispatch(setError(null));
    try {
      const formattedData = {
        name: updatedProductData.name,
        description: updatedProductData.description || '',
        unitExpression: updatedProductData.unitExpression,
        availableQuantity: Number(updatedProductData.availableQuantity),
        minOrder: Number(updatedProductData.minOrder),
        price: Number(updatedProductData.price),
      };

      const response = await productsApi.update(id!, formattedData);

      // Utiliser l'ID tel qu'il est stocké dans MongoDB sans conversion
      dispatch(
        updateProductsItem({
          id: response.data._id,
          name: response.data.name,
          price: response.data.price,
          availableQuantity: response.data.availableQuantity,
          unitExpression: response.data.unitExpression,
          description: response.data.description || '',
          minOrder: response.data.minOrder,
          status: response.data.status,
        })
      );

      navigate('/admin-products');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      dispatch(setError(t('unableToUpdateProduct')));
    }
  };

  return getError ? (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
        <p className="text-red-500 text-center">{getError}</p>
        <button
          onClick={() => navigate('/admin-products')}
          className="mt-4 w-full p-3 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          {t('back')}
        </button>
      </div>
    </div>
  ) : (
    <ProductForm
      initialValues={productData || undefined}
      onSubmit={handleUpdateProduct}
      isEditing={true}
      isLoading={loading}
    />
  );
}

export default ModifyProduct;
