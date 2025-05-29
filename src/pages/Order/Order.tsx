import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import Menu from '../../components/Menu/Menu';
import ConfirmModal from '../../components/ConfirmModal';
import CustomerInfo from '../../components/OrderDetails/CustomerInfo';
import OrderStatus from '../../components/OrderDetails/OrderStatus';
import OrderItems from '../../components/OrderDetails/OrderItems';
import OrderTagsSection from '../../components/OrderTagsSection/OrderTagsSection';
import OrderActions from '../../components/OrderActions/OrderActions';
import { useOrder } from '../../hooks/useOrder/useOrder';
import { OrderStatus as OrderStatusType } from '../../types/order';

const Order: React.FC = () => {
  const { t } = useTranslation('order');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    orderDetails,
    loading,
    error,
    total,
    handleActionClick,
    handleConfirmAction,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    getConfirmationInfo,
    refreshOrderDetails,
  } = useOrder({ id: id || '' });

  if (loading) {
    return <Loading />;
  }

  return orderDetails ? (
    <div className="w-full min-h-screen flex flex-col md:bg-[#F5F5F5] md:pt-0">
      <Menu />
      <button
        onClick={() => navigate(-1)}
        className="absolute top-3 left-4 p-2 rounded-full transition-colors z-10 md:bg-transparent"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="#666666" />
        </svg>
      </button>

      <div className="flex justify-center mt-8 pb-24">
        <div className="min-w-[343px] w-full md:w-5/12 bg-white rounded-2xl p-5 md:shadow-md max-w-[500px] md:mx-0 mx-4">
          <OrderStatus status={orderDetails.status as OrderStatusType} />

          <CustomerInfo
            firstName={orderDetails.firstName}
            lastName={orderDetails.lastName}
            address={orderDetails.address}
            phoneNumber={orderDetails.phoneNumber}
            orderStatus={orderDetails.status as OrderStatusType}
          />

          <OrderItems items={orderDetails.items} total={total} />

          <OrderTagsSection
            orderId={orderDetails._id}
            tagNames={orderDetails.tagNames}
            onTagsUpdated={refreshOrderDetails}
          />
        </div>
      </div>
      {/* Bouton d'action flottant - disponible pour tous les statuts de commande */}
      <OrderActions
        orderStatus={orderDetails.status as OrderStatusType}
        onActionClick={handleActionClick}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={t(getConfirmationInfo().title)}
        message={t(getConfirmationInfo().message)}
      />
    </div>
  ) : (
    <div
      data-testid="error-message"
      className="absolute top-60 left-1/2 transform -translate-x-1/2 bg-red-100 px-6 py-3 rounded-lg shadow-md"
    >
      <p className="text-red-500">{error}</p>
    </div>
  );
};

export default Order;
