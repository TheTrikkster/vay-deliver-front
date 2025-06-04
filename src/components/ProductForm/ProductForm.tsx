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
  isSubmitting?: boolean;
}

type ProductType = {
  description: string;
  name: string;
  unitExpression: string;
  availableQuantity: string;
  minOrder: string;
  maxOrder: string;
  price: string;
};

function ProductForm({
  initialValues,
  onSubmit,
  isEditing,
  isLoading = false,
  isSubmitting = false,
}: ProductFormProps) {
  const { t } = useTranslation('productForm');
  const error = useSelector(selectProductsError);
  const [product, setProduct] = useState<ProductType>({
    name: '',
    availableQuantity: '',
    minOrder: '',
    maxOrder: '',
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
        maxOrder: initialValues.maxOrder || '',
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
    <div className="w-full min-h-screen flex justify-center md:items-center md:bg-gray-50 md:pt-0 pt-4">
      <div className="h-fit md:bg-white md:rounded-xl md:shadow-sm max-w-lg p-6">
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('labels.productName')} <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
                placeholder={t('placeholders.productName')}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('labels.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent min-h-[100px] placeholder-gray-400 focus:placeholder-transparent transition-all"
                placeholder={t('placeholders.description')}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="unitExpression"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('labels.unitMeasure')} <span className="text-red-500">*</span>
              </label>
              <input
                id="unitExpression"
                type="text"
                name="unitExpression"
                value={product.unitExpression}
                onChange={handleChange}
                className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
                placeholder={t('placeholders.unitMeasure')}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="availableQuantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('labels.availableQuantity')} <span className="text-red-500">*</span>
              </label>
              <input
                id="availableQuantity"
                type="number"
                name="availableQuantity"
                value={product.availableQuantity}
                onChange={handleChange}
                className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
                placeholder={t('placeholders.availableQuantity')}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="minOrder" className="block text-sm font-medium text-gray-700 mb-1">
                {t('labels.minOrderVolume')} <span className="text-red-500">*</span>
              </label>
              <input
                id="minOrder"
                type="number"
                name="minOrder"
                value={product.minOrder}
                onChange={handleChange}
                className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
                placeholder={t('placeholders.minOrderVolume')}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="maxOrder" className="block text-sm font-medium text-gray-700 mb-1">
                {t('labels.maxOrderVolume')}
              </label>
              <input
                id="maxOrder"
                type="number"
                name="maxOrder"
                value={product.maxOrder}
                onChange={handleChange}
                className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
                placeholder={t('placeholders.maxOrderVolume')}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                {t('labels.price')} <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="w-full p-3 border border-[#9DA0A5] rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
                placeholder={t('placeholders.price')}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-3">{t('requiredFields')}</p>

          <div className="flex gap-4 mt-5">
            <Link
              to="/admin-products"
              className={`flex-1 text-center p-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
            >
              {t('cancel')}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 p-4 bg-[#22C55D] text-white rounded-lg hover:bg-[#1FAA4F] transition-colors disabled:opacity-50 disabled:bg-[#22C55D] disabled:hover:bg-[#22C55D] disabled:cursor-not-allowed relative"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>{isEditing ? t('updating') : t('creating')}</span>
                </div>
              ) : (
                t('confirm')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
