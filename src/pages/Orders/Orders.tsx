import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import OrderCard from '../../components/OrderCard/OrderCard';
import OrdersFilterModal from '../../components/OrdersFilterModal/OrdersFilterModal';
import AddTagModal from '../../components/AddTagModal/AddTagModal';
import { useTranslation } from 'react-i18next';

import {
  fetchOrders,
  setCurrentPage,
  toggleSelectionMode,
  toggleOrderSelection,
  selectAllOrders,
  setCurrentFilters,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectCurrentPage,
  selectTotalPages,
  selectIsSelectionMode,
  selectSelectedOrderIds,
  selectCurrentFilters,
} from '../../store/slices/ordersSlice';
import Pagination from '../../components/PaginationComp/PaginationComp';
import Loading from '../../components/Loading';
import Menu from '../../components/Menu/Menu';

function Orders() {
  const { t } = useTranslation('orders');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Sélecteurs Redux
  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);
  const currentPage = useAppSelector(selectCurrentPage);
  const totalPages = useAppSelector(selectTotalPages);
  const isSelectionMode = useAppSelector(selectIsSelectionMode);
  const selectedOrderIds = useAppSelector(selectSelectedOrderIds);
  const currentFilters = useAppSelector(selectCurrentFilters);

  // États locaux pour les modals
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState<boolean>(false);

  // Chargement initial des données
  useEffect(() => {
    dispatch(fetchOrders({ page: currentPage, filters: currentFilters }));
  }, [dispatch, currentPage, currentFilters]);

  // Handlers mémorisés
  const handleCardClick = useCallback(
    (id: string) => {
      if (isSelectionMode) {
        dispatch(toggleOrderSelection(id));
      } else {
        navigate(`/admin-order/${id}`);
      }
    },
    [dispatch, isSelectionMode, navigate]
  );

  const handleSelectAll = useCallback(() => {
    dispatch(selectAllOrders());
  }, [dispatch]);

  const handleFilterApply = useCallback(
    (filters: string) => {
      console.log({ filters });
      dispatch(setCurrentFilters(filters));
      dispatch(setCurrentPage(1));
      setIsFilterModalOpen(false);
    },
    [dispatch]
  );

  const renderHeader = () => {
    if (isSelectionMode) {
      return (
        <>
          <button
            onClick={() => dispatch(toggleSelectionMode(false))}
            className="text-base font-medium"
          >
            {t('cancel')}
          </button>
          <span className="text-base">{selectedOrderIds.length}</span>
          <button onClick={handleSelectAll} className="text-base font-medium">
            {selectedOrderIds.length !== orders.length ? t('selectAll') : t('deselectAll')}
          </button>
        </>
      );
    }

    return (
      <>
        <button
          className="flex items-center gap-2 text-base font-medium"
          onClick={() => setIsFilterModalOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
          >
            <g clipPath="url(#clip0_603_1203)">
              <path
                d="M6.06672 1.95L11.2667 1.95M0.866724 11.05L2.81672 11.05M0.866724 1.95L3.46672 1.95M5.41672 11.05L11.2667 11.05M9.31672 6.5L11.2667 6.5M0.866724 6.5L6.71672 6.5"
                stroke="#333333"
                strokeWidth="0.75"
                strokeLinecap="round"
              />
              <path
                d="M3.46671 1.95C3.46671 2.66797 4.04874 3.25 4.76671 3.25C5.48468 3.25 6.06671 2.66797 6.06671 1.95C6.06671 1.23203 5.48468 0.650002 4.76671 0.650001C4.04874 0.650001 3.46671 1.23203 3.46671 1.95Z"
                stroke="#333333"
                strokeWidth="0.75"
                strokeLinecap="round"
              />
              <path
                d="M6.71671 6.5C6.71671 7.21797 7.29874 7.8 8.01671 7.8C8.73468 7.8 9.31671 7.21797 9.31671 6.5C9.31671 5.78203 8.73468 5.2 8.01671 5.2C7.29874 5.2 6.71671 5.78203 6.71671 6.5Z"
                stroke="#333333"
                strokeWidth="0.75"
                strokeLinecap="round"
              />
              <path
                d="M2.81672 11.05C2.81672 11.768 3.39875 12.35 4.11672 12.35C4.83469 12.35 5.41672 11.768 5.41672 11.05C5.41672 10.332 4.83469 9.75 4.11672 9.75C3.39875 9.75 2.81672 10.332 2.81672 11.05Z"
                stroke="#333333"
                strokeWidth="0.75"
                strokeLinecap="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_603_1203">
                <rect
                  width="13"
                  height="12.1333"
                  fill="white"
                  transform="translate(12.1334) rotate(90)"
                />
              </clipPath>
            </defs>
          </svg>
          {t('filters')}
        </button>
        <button
          className="text-base font-medium"
          onClick={() => dispatch(toggleSelectionMode(true))}
        >
          {t('addNote')} +
        </button>
      </>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100 relative pb-6">
      <Menu />
      {error ? (
        <div
          data-testid="error-message"
          className="absolute top-60 left-1/2 transform -translate-x-1/2 bg-red-100 px-6 py-3 rounded-lg shadow-md"
        >
          <p className="text-red-500">
            {error === 'fetchOrdersError' ? t('getOrdersError') : t('addTagError')}
          </p>
        </div>
      ) : (
        <>
          <header className="bg-white border-b border-gray-200 mb-5">
            <hr className="border-gray-200" />
            <div className="px-4 py-4 flex justify-between items-center">{renderHeader()}</div>
          </header>
          <div className="flex flex-col gap-5">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t('noOrders')}</div>
            ) : (
              orders.map(order => (
                <div
                  className="flex justify-center md:px-5 px-4"
                  key={order._id}
                  onClick={() => handleCardClick(order._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCardClick(order._id);
                    }
                  }}
                >
                  <OrderCard
                    firstName={order.firstName}
                    lastName={order.lastName}
                    description={order.items.map((item: any) => item.product?.name).join(', ')}
                    address={order.address}
                    tagNames={order.tagNames}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedOrderIds.includes(order._id)}
                  />
                </div>
              ))
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={page => dispatch(setCurrentPage(page))}
            />

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
              onApply={handleFilterApply}
            />

            <AddTagModal
              isOpen={isAddTagModalOpen}
              onClose={() => setIsAddTagModalOpen(false)}
              selectedOrderIds={selectedOrderIds}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Orders;
