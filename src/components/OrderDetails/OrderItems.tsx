import { useTranslation } from 'react-i18next';

interface OrderItem {
  product: {
    name: string;
    price: number;
  };
  quantity: number;
}

interface OrderItemsProps {
  items: OrderItem[];
  total: number;
}

const OrderItems = ({ items, total }: OrderItemsProps) => {
  const { t } = useTranslation('order');

  return (
    <div className="mb-5 py-3 border-t border-dashed border-gray-300">
      <h3 className="text-lg font-semibold mb-4">{t('products')}</h3>
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center gap-4">
            <span className="text-gray-800">{item.product.name}</span>
            <span className="text-gray-600">x{item.quantity}</span>
            <span className="font-bold">{item.product.price} €</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-5 py-3 border-y border-dashed border-gray-300">
        <span className="text-lg font-semibold">{t('total')}</span>
        <span className="text-lg font-semibold">{total}</span>
      </div>
    </div>
  );
};

export default OrderItems;
