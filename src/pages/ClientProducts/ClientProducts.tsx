import React, { useEffect, useState, useMemo } from 'react';
import ClientCard from '../../components/ClientCard/ClientCard';
import { ProductType } from '../../types/client';
import { productsApi } from '../../api/services/productsApi';
import Pagination from '../../components/PaginationComp/PaginationComp';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/userStore';
import {
  addToClientOrder,
  clearClientOrder,
  // checkoutClientOrder,
  removeFromClientOrder,
  selectClientItems,
} from '../../store/slices/clientSlice';
import { toCents, fromCents, calculatePrice } from '../../utils/orderCalcul';
import Loading from '../../components/Loading';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { settingsApi } from '../../api/services/settingsApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

function ClientProducts() {
  const { t } = useTranslation('clientProducts');
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [siteStatus, setSiteStatus] = useState<string | null>(null);
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
  const cart = useAppSelector(selectClientItems);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const commandDesable = Object.keys(cart).length === 0;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productsApi.getClientProducts(currentPage);
        setTotalPages(response.data.totalPages);
        setProducts(response.data.products || []);
        setError(null);
      } catch (error) {
        console.log('Error fetching products:', error);
        setError(t('errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };

    const handleConnection = async () => {
      const settings = await settingsApi.getSettings();
      if (settings.data.siteStatus === 'ONLINE') {
        fetchProducts();
      } else {
        setSiteStatus('OFFLINE');
        setOfflineMessage(settings.data.offlineMessage);
        dispatch(clearClientOrder());
      }
    };

    handleConnection();
  }, [currentPage]);

  const cartActions = useMemo(
    () => ({
      onAdd: (_id: string) => {
        const product = products.find(p => p._id === _id);
        if (!product) return;

        const currentQuantity = cart[_id] || 0;
        const addQuantity = currentQuantity === 0 ? product.minOrder : 1;

        dispatch(
          addToClientOrder({
            productId: _id,
            quantity: addQuantity,
            product,
          })
        );
      },

      onRemove: (_id: string) => {
        const product = products.find(p => p._id === _id);
        if (!product) return;

        const currentQuantity = cart[_id] || 0;

        if (currentQuantity > product.minOrder) {
          dispatch(removeFromClientOrder({ productId: _id, quantity: 1 }));
        } else if (currentQuantity > 0) {
          dispatch(removeFromClientOrder({ productId: _id, quantity: currentQuantity }));
        }
      },
    }),
    [cart, products, dispatch]
  );

  const total = (Array.isArray(products) ? products : []).reduce((sum, product) => {
    const quantity = cart[product._id] || 0;
    return sum + calculatePrice(product.price, quantity);
  }, 0);

  const handleCheckout = () => {
    // dispatch(checkoutClientOrder());
    navigate('/order');
  };

  if (siteStatus === 'OFFLINE') {
    return (
      <div className="absolute top-60 left-1/2 transform -translate-x-1/2 bg-red-100 px-6 py-3 rounded-lg shadow-md">
        <p className="text-red-500">{offlineMessage}</p>
      </div>
    );
  }

  if (isLoading) return <Loading />;

  if (error)
    return (
      <div
        data-testid="error-message"
        className="absolute top-60 left-1/2 transform -translate-x-1/2 bg-red-100 px-6 py-3 rounded-lg shadow-md"
      >
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white p-4 shadow-md z-10 flex justify-between items-center">
        <div className="flex items-center">
          <LanguageSwitcher />{' '}
        </div>
        <button
          onClick={handleCheckout}
          disabled={commandDesable}
          data-testid="checkout-button"
          className={`${commandDesable ? 'bg-gray-300 text-gray-600 border-gray-300' : 'text-[#4355DA] border-[#4355DA] cursor-pointer'} flex items-center gap-2 font-semibold border px-6 py-2 rounded-full`}
        >
          <svg className="w-6 h-6 text-[#4F46E5]" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>{' '}
          <span className="font-medium">{fromCents(toCents(total))}</span>
        </button>
      </header>

      <section className="p-4">
        <ul className="flex flex-col justify-center items-center gap-4 pb-5">
          {(Array.isArray(products) ? products : []).map(product => (
            <li key={product._id} className="min-w-[343px] w-11/12 md:w-2/4">
              <ClientCard
                product={product}
                quantity={cart[product._id] || 0}
                cartActions={cartActions}
                data-testid={`product-${product._id}`}
              />
            </li>
          ))}
        </ul>
      </section>

      {Array.isArray(products) && products.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </main>
  );
}

export default ClientProducts;
