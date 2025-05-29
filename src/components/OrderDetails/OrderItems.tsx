import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

interface OrderItem {
  product: {
    name: string;
    price: number;
    unitExpression?: string;
  };
  quantity: number;
}

interface OrderItemsProps {
  items: OrderItem[];
  total: ReactNode;
}

const OrderItems = ({ items, total }: OrderItemsProps) => {
  const { t } = useTranslation('order');

  return (
    <div className="mb-6 py-4 border-t border-dashed border-gray-300">
      <h3 className="text-xl font-semibold text-gray-900 mb-5">{t('products')}</h3>
      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-start gap-4 py-2">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-700">
                  {item.quantity}
                  {item.product.unitExpression ? `${item.product.unitExpression}` : ''}
                </span>
                <span className="text-gray-900 font-medium">{item.product.name}</span>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900">{item.product.price} €</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-dashed border-gray-300">
        <span className="text-xl font-bold text-gray-900">{t('total')}</span>
        <span className="text-xl font-bold text-green-600">{total}</span>
      </div>
    </div>
  );
};

export default OrderItems;
