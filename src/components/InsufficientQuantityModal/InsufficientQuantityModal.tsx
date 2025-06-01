import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('insufficientQuantityModal');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">{t('modalTitle')}</h2>

        <div className="space-y-4 mb-6">
          {products.map(product => (
            <div key={product.details.productName} className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{product.details.productName}</h3>

              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-600">{t('tableHeaderRequested')}: </span>
                  <span className="font-medium text-red-600">
                    {product.details.requestedQuantity} {product.details.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">{t('tableHeaderAvailable')}: </span>
                  <span className="font-medium text-green-600">
                    {product.details.availableQuantity} {product.details.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-center mb-6">{t('orderPrompt')}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
