import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import Menu from '../../components/Menu/Menu';
import UnifiedConfirmModal from '../../components/UnifiedConfirmModal';
import CustomerInfo from '../../components/OrderDetails/CustomerInfo';
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
    isActionLoading,
    getLoadingText,
    getVariant,
  } = useOrder({ id: id || '' });

  if (loading) {
    return <Loading />;
  }

  return orderDetails ? (
    <div className="w-full min-h-screen flex flex-col md:bg-[#F5F5F5] md:pt-0">
      <Menu />
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-3 rounded-full transition-all duration-200 z-10 md:bg-white md:shadow-sm md:border md:border-gray-200 hover:bg-gray-50 hover:shadow-md active:scale-95"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="#374151" />
        </svg>
      </button>

      <div className="flex justify-center mt-6 md:mt-8 pb-32 md:pb-28 px-4 md:px-0">
        <div className="min-w-[343px] w-full md:w-5/12 bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 md:shadow-lg max-w-[500px] space-y-6">
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

      {isConfirmModalOpen && (
        <UnifiedConfirmModal
          isOpen={isConfirmModalOpen}
          title={t(getConfirmationInfo().title)}
          message={t(getConfirmationInfo().message)}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmAction}
          variant={getVariant()}
          isLoading={isActionLoading}
          cancelText={t('cancel')}
          confirmText={t('confirm')}
          loadingText={t(getLoadingText())}
          translationNamespace="order"
        />
      )}
    </div>
  ) : (
    <div
      data-testid="error-message"
      className="absolute top-60 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 px-6 py-4 rounded-xl shadow-sm"
    >
      <p className="text-red-600 font-medium">{error}</p>
    </div>
  );
};

export default Order;
