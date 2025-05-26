import React from 'react';

type InsufficientQuantityModalProps = {
  products: {
    details: {
      productName: string;
      requestedQuantity: number;
      availableQuantity: number;
      unit: string;
    };
  }[];
  onClose: () => void;
  onConfirm: () => void;
};

export default function InsufficientQuantityModal({
  products,
  onClose,
  onConfirm,
}: InsufficientQuantityModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl px-4 py-8 w-full max-w-lg mx-4">
        <h1 className="text-lg md:text-2xl font-semibold text-gray-800 mb-6 text-center">
          Недостаточно товара
        </h1>

        <table className="table-auto w-full mb-6 border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="w-[50%] py-2 text-sm md:text-lg font-medium text-gray-800 text-left">
                Товар
              </th>
              <th className="w-[25%] px-4 py-2 text-sm md:text-lg font-medium text-gray-800 text-center">
                Добавлено
              </th>
              <th className="w-[25%] py-2 text-sm md:text-lg font-medium text-gray-800 text-center">
                В наличии
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.details.productName}>
                <td className="py-1 text-gray-800 text-sm md:text-base text-left">
                  {product.details.productName}
                </td>
                <td className="px-4 py-1 text-sm md:text-base font-semibold text-red-600 text-center">
                  {product.details.requestedQuantity} {product.details.unit}
                </td>
                <td className="py-1 text-sm md:text-base text-gray-800 text-center">
                  {product.details.availableQuantity} {product.details.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-gray-800 text-base text-center mb-6">Заказать в доступном объёме?</p>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-lg bg-gray-100 text-gray-800 text-lg font-medium hover:bg-gray-200"
          >
            Отменить
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 rounded-lg bg-green-500 text-white text-lg font-medium hover:bg-green-600"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}
