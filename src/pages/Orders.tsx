import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useNavigate } from 'react-router-dom';
import OrderCard from '../components/OrderCard/OrderCard';
import OrdersFilterModal from '../components/OrdersFilterModal';
import AddTagModal from '../components/AddTagModal';

import {
  fetchOrders,
  addTagToOrders,
  setCurrentPage,
  toggleSelectionMode,
  toggleOrderSelection,
  selectAllOrders,
  clearSelection,
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

function Orders() {
  // Hooks
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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);

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

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      dispatch(setCurrentPage(currentPage - 1));
    }
  }, [dispatch, currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  }, [dispatch, currentPage, totalPages]);

  // Header conditionnel
  const renderHeader = () => {
    if (isSelectionMode) {
      return (
        <>
          <button onClick={() => dispatch(toggleSelectionMode(false))} className="text-gray-700">
            Отменить
          </button>
          <span className="text-xl">{selectedOrderIds.length}</span>
          <button onClick={handleSelectAll} className="text-gray-700">
            Выделить все
          </button>
        </>
      );
    }

    return (
      <>
        <button className="text-xl m-0" onClick={() => setIsFilterModalOpen(true)}>
          Фильтры
        </button>
        <button
          className="bg-transparent border-none text-base text-gray-700 cursor-pointer flex items-center"
          onClick={() => dispatch(toggleSelectionMode(true))}
        >
          Заметка +
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {renderHeader()}
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-4 px-0 md:px-5">
        {loading ? (
          <div className="text-center py-10">Chargement...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            {error}
            <button
              onClick={() => dispatch(fetchOrders({ page: currentPage, filters: currentFilters }))}
              className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map(order => (
              <div
                key={order._id}
                className={`transition-all duration-200 ${
                  selectedOrderIds.includes(order._id)
                    ? 'border-2 border-green-500 rounded-xl'
                    : 'border-2 border-transparent rounded-xl'
                }`}
                onClick={() => handleCardClick(order._id)}
              >
                <OrderCard
                  firstName={order.firstName}
                  lastName={order.lastName}
                  address={order.address}
                  distance={`${order.address} €/${order.unitExpression}`}
                  tagNames={order.tagNames}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {isSelectionMode && selectedOrderIds.length > 0 && (
        <button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-3xl shadow-lg"
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
  );
}

export default Orders;
