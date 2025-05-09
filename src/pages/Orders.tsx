import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useNavigate } from 'react-router-dom';
import OrderCard from '../components/OrderCard/OrderCard';
import OrdersFilterModal from '../components/OrdersFilterModal/OrdersFilterModal';
import AddTagModal from '../components/AddTagModal/AddTagModal';

import {
  fetchOrders,
  addTagToOrders,
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
} from '../store/slices/ordersSlice';
import Pagination from '../components/PaginationComp/PaginationComp';
import Loading from '../components/Loading';
import Menu from '../components/Menu/Menu';

function Orders() {
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
    console.log({ currentFilters });
    dispatch(fetchOrders({ page: currentPage, filters: currentFilters, limit: 30 }));
  }, [dispatch, currentPage, currentFilters]);

  // Handlers mémorisés
  const handleCardClick = useCallback(
    (id: string) => {
      if (isSelectionMode) {
        dispatch(toggleOrderSelection(id));
      } else {
        navigate(`/order/${id}`);
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

  const handleAddNote = useCallback(
    (note: string) => {
      return dispatch(addTagToOrders({ tagName: note, orderIds: selectedOrderIds }))
        .unwrap()
        .then(() => {
          setIsAddTagModalOpen(false);
        })
        .catch(error => {
          console.error('Erreur:', error);
        });
    },
    [dispatch, selectedOrderIds]
  );

  const renderHeader = () => {
    if (isSelectionMode) {
      return (
        <>
          <button
            onClick={() => dispatch(toggleSelectionMode(false))}
            className="text-base font-medium"
          >
            Отменить
          </button>
          <span className="text-base">{selectedOrderIds.length}</span>
          <button onClick={handleSelectAll} className="text-base font-medium">
            {selectedOrderIds.length !== orders.length ? 'Выделить все' : 'Убрать все'}
          </button>
        </>
      );
    }

    return (
      <>
        <button className="text-base font-medium" onClick={() => setIsFilterModalOpen(true)}>
          Фильтры
        </button>
        <button
          className="text-base font-medium"
          onClick={() => dispatch(toggleSelectionMode(true))}
        >
          Заметка +
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
        <div className="text-center py-10 text-red-500">
          {error}
          <button
            onClick={() =>
              dispatch(fetchOrders({ page: currentPage, filters: currentFilters, limit: 30 }))
            }
            className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Попробуйте еще раз
          </button>
        </div>
      ) : (
        <>
          <header className="bg-white border-b border-gray-200 mb-5">
            <hr className="border-gray-200" />
            <div className="px-4 py-4 flex justify-between items-center">{renderHeader()}</div>
          </header>
          <div className="flex flex-col gap-5">
            {orders.map(order => (
              <div
                className="md:px-5 px-4"
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
                  products={order.items}
                  address={order.address}
                  tagNames={order.tagNames}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedOrderIds.includes(order._id)}
                />
              </div>
            ))}
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
              onConfirm={handleAddNote}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Orders;
