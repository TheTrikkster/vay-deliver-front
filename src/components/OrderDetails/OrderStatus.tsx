import { useTranslation } from 'react-i18next';
import { OrderStatus as OrderStatusType } from '../../types/order';

interface OrderStatusProps {
  status: OrderStatusType;
  className?: string;
}

const OrderStatus = ({ status, className = 'flex justify-end mb-5' }: OrderStatusProps) => {
  const { t } = useTranslation('order');

  return (
    <div className={className}>
      <span
        data-testid="order-status"
        className={`px-3 py-1.5 rounded text-sm ${
          status === 'ACTIVE'
            ? 'bg-green-50 text-green-500'
            : status === 'COMPLETED'
              ? 'bg-gray-100 text-gray-500'
              : 'bg-red-50 text-red-500'
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
