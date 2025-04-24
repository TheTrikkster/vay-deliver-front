import React, { useCallback, useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { roundToDecimal } from '../FoodItemCard/FoodItemCard';
import { Product } from '../../types/product';

interface ProductFormProps {
  initialValues?: Product;
  onSubmit: (productData: Product) => void;
  isEditing: boolean;
}

function ProductForm({ initialValues, onSubmit, isEditing }: ProductFormProps) {
  const [product, setProduct] = useState<Product>({
    name: '',
    unit: '',
    availableQuantity: '',
    minOrderQuantity: '',
    price: '',
  });

  useEffect(() => {
    if (initialValues) {
      setProduct(prev => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [initialValues]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'quantity' ? roundToDecimal(parseFloat(value) || 0) : value,
    }));
  }, []);

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(product);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-sm max-w-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">
          {isEditing ? 'Изменить продукт' : 'Добавить новый продукт'}
        </h1>

        <form role="form" onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
            placeholder="Название продукта"
          />

          <textarea
            name="description"
            value={product.description}
            onChange={handleTextAreaChange}
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent min-h-[100px] placeholder-gray-400 focus:placeholder-transparent transition-all"
            placeholder="Описание"
          />

          <input
            type="text"
            name="unit"
            value={product.unit}
            onChange={handleInputChange}
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
            placeholder="Единица измерения ( Штука, Грамм, Кг)"
          />

          <input
            type="number"
            name="availableQuantity"
            value={product.availableQuantity}
            onChange={handleInputChange}
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
            placeholder="Доступное колличество в цифрах"
          />

          <input
            type="number"
            name="minOrderQuantity"
            value={product.minOrderQuantity}
            onChange={handleInputChange}
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
            placeholder="Минимальный объем заказа в цифрах"
          />

          <input
            type="text"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent transition-all"
            placeholder="Цена : 18€"
          />

          <div className="flex gap-4 mt-6">
            <a
              href="/deliveries"
              className="flex-1 text-center p-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отменить
            </a>
            <button
              type="submit"
              className="flex-1 p-4 bg-[#22C55D] text-white rounded-lg hover:bg-[#1FAA4F] transition-colors"
            >
              Подтвердить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
