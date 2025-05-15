import React, { useCallback, useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../../types/product';
import { useSelector } from 'react-redux';
import { selectProductsError } from '../../store/slices/productsSlice';
import { Link } from 'react-router-dom';
import Loading from '../Loading';

interface ProductFormProps {
  initialValues?: Product;
  onSubmit: (productData: Product) => void;
  isEditing: boolean;
  isLoading?: boolean;
}

type ProductType = {
  description: string;
  name: string;
  unitExpression: string;
  availableQuantity: string;
  minOrder: string;
  price: string;
};

function ProductForm({ initialValues, onSubmit, isEditing, isLoading = false }: ProductFormProps) {
  const { t } = useTranslation('productForm');
  const error = useSelector(selectProductsError);
  const [product, setProduct] = useState<ProductType>({
    name: '',
    availableQuantity: '',
    minOrder: '',
    price: '',
    unitExpression: '',
    description: '',
  });

  useEffect(() => {
    if (initialValues) {
      setProduct({
        name: initialValues.name || '',
        availableQuantity: initialValues.availableQuantity?.toString() || '',
        minOrder: initialValues.minOrder || '',
        price: initialValues.price?.toString() || '',
        unitExpression: initialValues.unitExpression || '',
        description: initialValues.description || '',
      });
    }
  }, [initialValues]);

  // Fonction utilitaire pour arrondir correctement à 1 décimale
  const roundToDecimal = (num: number, decimals = 1): number => {
    return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
  };

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProduct(prev => ({
        ...prev,
        [name]: name === 'quantity' ? roundToDecimal(parseFloat(value) || 0) : value,
      }));
    },
    []
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const productData: Product = {
      ...product,
      availableQuantity: Number(product.availableQuantity),
      price: Number(product.price),
    };

    onSubmit(productData);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="md:bg-white md:rounded-xl md:shadow-sm max-w-lg p-6">
        <h1 className="text-center text-xl font-bold mb-5">
          {isEditing ? t('editProduct') : t('addNewProduct')}
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <form role="form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
              placeholder={t('productName')}
              required
            />

            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent min-h-[100px] placeholder-gray-400 focus:placeholder-transparent transition-all"
              placeholder={t('description')}
            />

            <input
              type="text"
              name="unitExpression"
              value={product.unitExpression}
              onChange={handleChange}
              className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
              placeholder={t('unitMeasure')}
              required
            />

            <input
              type="number"
              name="availableQuantity"
              value={product.availableQuantity}
              onChange={handleChange}
              className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
              placeholder={t('availableQuantity')}
              required
            />

            <input
              type="number"
              name="minOrder"
              value={product.minOrder}
              onChange={handleChange}
              className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
              placeholder={t('minOrderVolume')}
              required
            />

            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
              placeholder={t('price')}
              required
            />
          </div>

          <p className="text-sm text-gray-500 mt-3">{t('requiredFields')}</p>

          <div className="flex gap-4 mt-5">
            <Link
              to="/admin-products"
              className="flex-1 text-center p-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t('cancel')}
            </Link>
            <button
              type="submit"
              className="flex-1 p-4 bg-[#22C55D] text-white rounded-lg hover:bg-[#1FAA4F] transition-colors"
            >
              {t('confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
