import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { InventoryProduct } from '../../types/product';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useProductsInventory } from '../../hooks/useProductsInventory';
import Pagination from '../../components/PaginationComp/PaginationComp';
import { Link } from 'react-router-dom';
import Menu from '../../components/Menu/Menu';
import { useDispatch } from 'react-redux';
import { setError } from '../../store/slices/productsSlice';
import Loading from '../../components/Loading';
import DeleteProductModal from '../../components/DeleteProductModal';

function AdminProducts() {
  const { t } = useTranslation('adminProducts');
  const [isQuantityPopupOpen, setIsQuantityPopupOpen] = useState<boolean>(false);
  const [quantityToEdit, setQuantityToEdit] = useState<{ id: number; availableQuantity: number }>({
    id: 0,
    availableQuantity: 0,
  });
  const [inputValue, setInputValue] = useState<string>('0');
  const [openCardMenuId, setOpenCardMenuId] = useState<number | null>(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [forceOpen, setForceOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const {
    loading,
    error,
    deleteItem,
    forceDeleteItem,
    updateItemQuantity,
    updateItemStatus,
    currentItems,
    totalPages,
    currentPage,
    setCurrentPage,
  } = useProductsInventory();
  const dispatch = useDispatch();

  useOutsideClick(menuRef, () => {
    if (openCardMenuId !== null) {
      setOpenCardMenuId(null);
    }
  });

  const handleDelete = useCallback((id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setItemToDelete(id);
    setIsDeletePopupOpen(true);
    setOpenCardMenuId(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (itemToDelete !== null) {
      try {
        await deleteItem(itemToDelete);
        setItemToDelete(null);
      } catch (error: any) {
        if (error.message === 'activeOrder') {
          setForceOpen(true);
        }
        console.error('Error deleting product:', error);
      } finally {
        setIsDeletePopupOpen(false);
      }
    }
  }, [deleteItem, itemToDelete]);

  const forceDelete = useCallback(async () => {
    if (itemToDelete !== null) {
      try {
        await forceDeleteItem(itemToDelete);
        setItemToDelete(null);
        setForceOpen(false);
        dispatch(setError(null));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  }, [deleteItem, itemToDelete]);

  const toggleCardMenu = useCallback((id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenCardMenuId(prev => (prev === id ? null : id));
  }, []);

  const openQuantityPopup = useCallback(
    (id: number, currentQuantity: number) => {
      const productExists = currentItems.some(item => item.id === id);
      if (!productExists) {
        dispatch(setError(t('productNoLongerExists')));
        return;
      }

      setQuantityToEdit({
        id,
        availableQuantity: currentQuantity,
      });
      setInputValue(currentQuantity.toString());
      setIsQuantityPopupOpen(true);
    },
    [currentItems, dispatch]
  );

  const updateQuantity = useCallback(() => {
    if (!currentItems.some(item => item.id === quantityToEdit.id)) {
      setIsQuantityPopupOpen(false);
      dispatch(setError(t('productNoLongerExists')));
      return;
    }

    updateItemQuantity(quantityToEdit.id, quantityToEdit.availableQuantity);
    setIsQuantityPopupOpen(false);
  }, [quantityToEdit, updateItemQuantity, currentItems, dispatch]);

  const handleQuantityChange = useCallback((value: string) => {
    setQuantityToEdit(prev => ({ ...prev, availableQuantity: Number(value) }));
  }, []);

  const currentProduct = currentItems.find(item => item.id === quantityToEdit.id);

  console.log({ error });

  if (error && error !== 'activeOrder') {
    return (
      <div className="w-full min-h-screen bg-gray-100 pb-6">
        <Menu showAddProd={true} />
        <div className="absolute top-60 left-1/2 transform -translate-x-1/2 bg-red-100 px-6 py-3 rounded-lg shadow-md">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 pb-6">
      <Menu showAddProd={true} />

      {!loading && (
        <div className="flex flex-col items-center gap-4 mt-5">
          {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] w-full">
              <p className="text-xl text-gray-600 mb-4">{t('mustAddProduct')}</p>
              <Link
                to="/create-product"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {t('addProduct')}
              </Link>
            </div>
          ) : (
            currentItems.map((product: InventoryProduct) => (
              <ProductCard
                key={product.id}
                product={product}
                toggleCardMenu={toggleCardMenu}
                handleDelete={handleDelete}
                isCardMenuOpen={openCardMenuId === product.id}
                menuRef={openCardMenuId === product.id ? menuRef : null}
                openQuantityPopup={openQuantityPopup}
                updateItemStatus={updateItemStatus}
              />
            ))
          )}
        </div>
      )}

      {currentItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {isQuantityPopupOpen && (
        <div className="px-4 md:px-0 fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">{t('productInStock')}</h3>
            <p className="text-[#9DA0A5] mb-5">
              {t('unitOfMeasure')} {currentProduct?.unitExpression}
            </p>
            <input
              type="number"
              min={0}
              className="w-full border border-[#9DA0A5] rounded-md p-3 mb-5"
              value={inputValue}
              onChange={e => {
                const val = e.target.value;
                // autoriser uniquement les chiffres (évitant le signe négatif)
                if (/^\d*$/.test(val)) {
                  setInputValue(val);
                  // on met à jour la quantité métier, ou 0 si champ vide
                  setQuantityToEdit(prev => ({
                    ...prev,
                    availableQuantity: val === '' ? 0 : Number(val),
                  }));
                }
              }}
              onBlur={() => {
                // dès qu'on sort du champ, on replace un "0" si vide
                if (inputValue === '') {
                  setInputValue('0');
                  setQuantityToEdit(prev => ({
                    ...prev,
                    availableQuantity: 0,
                  }));
                }
              }}
            />
            <div className="flex justify-center gap-2">
              <button
                className="flex-1 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setIsQuantityPopupOpen(false)}
              >
                {t('cancel')}
              </button>
              <button
                className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={updateQuantity}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeletePopupOpen && (
        <DeleteProductModal
          title={t('deleteConfirmation')}
          message={t('deleteConfirmationText')}
          cancelText={t('cancel')}
          confirmText={t('delete')}
          onClose={() => setIsDeletePopupOpen(false)}
          onConfirm={confirmDelete}
          variant="normal"
        />
      )}
      {forceOpen && (
        <DeleteProductModal
          title={t('forceDeleteConfirmation')}
          message={t('forceDeleteConfirmationText')}
          cancelText={t('cancel')}
          confirmText={t('delete')}
          onClose={() => setForceOpen(false)}
          onConfirm={forceDelete}
          variant="danger"
        />
      )}
    </div>
  );
}

export default AdminProducts;
