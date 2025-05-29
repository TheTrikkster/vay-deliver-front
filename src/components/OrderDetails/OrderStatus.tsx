import { useTranslation } from 'react-i18next';
import { OrderStatus as OrderStatusType } from '../../types/order';

interface OrderStatusProps {
  status: OrderStatusType;
  className?: string;
}

const OrderStatus = ({ status, className = 'flex justify-end mb-6' }: OrderStatusProps) => {
  const { t } = useTranslation('order');

  return (
    <div className={className}>
      <span
        data-testid="order-status"
        className={`px-4 py-2 rounded-lg text-sm font-medium ${
          status === 'ACTIVE'
            ? 'bg-green-50 text-green-600 border border-green-200'
            : status === 'COMPLETED'
              ? 'bg-gray-100 text-gray-600 border border-gray-200'
              : 'bg-red-50 text-red-600 border border-red-200'
        }`}
      >
        {status === 'ACTIVE'
          ? t('active')
          : status === 'COMPLETED'
            ? t('completed')
            : t('canceled')}
      </span>
    </div>
  );
};

export default OrderStatus;
