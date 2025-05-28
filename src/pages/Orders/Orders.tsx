import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Menu from '../../components/Menu/Menu';
import Loading from '../../components/Loading';
import Pagination from '../../components/PaginationComp/PaginationComp';
import OrderCard from '../../components/OrderCard/OrderCard';
import OrdersFilterModal from '../../components/OrdersFilterModal/OrdersFilterModal';
import AddTagModal from '../../components/AddTagModal/AddTagModal';
import { useOrders } from '../../hooks/useOrdersInventory';
import { OrderStatus } from '../../types/order';

function Orders() {
  const { t } = useTranslation('orders');
  const navigate = useNavigate();

  // 1) États locaux pour les modals & filtres
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);

  // 2) On récupère tout depuis useOrders
  const {
    orders,
    loading,
    error,
    currentPage,
    totalPages,
    isSelectionMode,
    selectedOrderIds,
    tagError,

    // actions
    toggleSelectionMode,
    toggleOrderSelection,
    selectAllOrders,
    clearSelection,
    addTag,
    setPage,
  } = useOrders({ limit: 30 });

  // 3) Gestion du clic sur une carte
  const handleCardClick = useCallback(
    (id: string) => {
      if (isSelectionMode) {
        toggleOrderSelection(id);
      } else {
        navigate(`/admin-order/${id}`);
      }
    },
    [isSelectionMode, toggleOrderSelection, navigate]
  );

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-100 relative pb-6">
      <Menu />

      {error || tagError ? (
        <div className="absolute top-60 left-1/2 transform -translate-x-1/2 bg-red-100 px-6 py-3 rounded-lg shadow-md">
          <p className="text-red-500">
            {error === 'fetchOrdersError'
              ? t('getOrdersError')
              : tagError
                ? t('addTagError')
                : error}
          </p>
        </div>
      ) : (
        <>
          <header className="bg-white border-b border-gray-200 mb-5">
            <hr className="border-gray-200" />
            <div className="px-4 py-4 flex justify-between items-center">
              {isSelectionMode ? (
                <>
                  <button
                    onClick={() => toggleSelectionMode(false)}
                    className="text-base font-medium"
                  >
                    {t('cancel')}
                  </button>
                  <span className="text-base">{selectedOrderIds.length}</span>
                  <button
                    onClick={
                      selectedOrderIds.length !== orders.length ? selectAllOrders : clearSelection
                    }
                    className="text-base font-medium"
                  >
                    {selectedOrderIds.length !== orders.length ? t('selectAll') : t('deselectAll')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="flex items-center gap-2 text-base font-medium"
                    onClick={() => setIsFilterModalOpen(true)}
                  >
                    {/* icône filtre */}
                    {t('filters')}
                  </button>
                  <button
                    className="text-base font-medium"
                    onClick={() => toggleSelectionMode(true)}
                  >
                    {t('addNote')} +
                  </button>
                </>
              )}
            </div>
          </header>

          <div className="flex flex-col gap-4">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t('noOrders')}</div>
            ) : (
              orders.map(order => (
                <div
                  key={order._id}
                  className="flex justify-center"
                  onClick={() => handleCardClick(order._id)}
                >
                  <OrderCard
                    firstName={order.firstName}
                    lastName={order.lastName}
                    description={order.items.map((item: any) => item.product?.name).join(', ')}
                    address={order.address}
                    tagNames={order.tagNames}
                    status={order.status as OrderStatus}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedOrderIds.includes(order._id)}
                  />
                </div>
              ))
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />

            {isSelectionMode && selectedOrderIds.length > 0 && (
              <button
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-4xl shadow-lg"
                onClick={() => setIsAddTagModalOpen(true)}
              >
                +
              </button>
            )}

            <OrdersFilterModal
              isOpen={isFilterModalOpen}
              onClose={() => setIsFilterModalOpen(false)}
              // onApply={handleFilterApply}
            />

            <AddTagModal
              isOpen={isAddTagModalOpen}
              onClose={() => setIsAddTagModalOpen(false)}
              onConfirm={(tag, ids) => addTag(tag, ids)}
              selectedOrderIds={selectedOrderIds}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Orders;
