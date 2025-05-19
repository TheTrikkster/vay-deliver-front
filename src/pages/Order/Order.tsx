import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersApi } from '../../api/services/ordersApi';
import Loading from '../../components/Loading';
import Menu from '../../components/Menu/Menu';
import { useTranslation } from 'react-i18next';
import AddTagModal from '../../components/AddTagModal/AddTagModal';
import ConfirmModal from '../../components/ConfirmModal';

interface OrderProps {
  _id: string;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  address: string;
  phoneNumber: number;
  tagNames: string[];
  items: Array<{
    product: { name: string; price: number };
    quantity: number;
  }>;
}
interface OrderItem {
  product: { price: number };
  quantity: number;
}

const Order: React.FC = () => {
  const { t } = useTranslation('order');
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderProps | null>(null);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [tagToDelete, setTagToDelete] = useState<{ orderId: string; tagName: string } | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersApi.getById(id!);
        setOrderDetails(response.data);
      } catch (err) {
        setError(t('errorLoadingOrder'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, t]);

  // Calcul du total
  const finalPrice =
    orderDetails?.items.reduce((total: number, item: OrderItem) => {
      return total + item.product.price * item.quantity;
    }, 0) || 0;

  const handleCompleteOrder = async () => {
    try {
      await ordersApi.updateStatus(id!, 'COMPLETED');

      // Mettre à jour l'état local après la réponse API réussie
      setOrderDetails(prevDetails => {
        if (prevDetails) {
          return { ...prevDetails, status: 'COMPLETED' };
        }
        return prevDetails;
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleCancelOrder = async () => {
    try {
      await ordersApi.updateStatus(id!, 'CANCELED');

      // Mettre à jour l'état local après la réponse API réussie
      setOrderDetails(prevDetails => {
        if (prevDetails) {
          return { ...prevDetails, status: 'CANCELED' };
        }
        return prevDetails;
      });
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
    }
  };

  const removeTag = async (orderId: string, tagName: string) => {
    try {
      // Mise à jour optimiste: on met à jour l'UI avant la réponse du serveur
      setOrderDetails(prevDetails => {
        if (prevDetails) {
          return {
            ...prevDetails,
            tagNames: prevDetails.tagNames.filter(tag => tag !== tagName),
          };
        }
        return prevDetails;
      });

      // Appel API pour persister le changement
      await ordersApi.removeTagFromOrders(orderId, tagName);
    } catch (error) {
      console.error('Erreur lors de la suppression du tag:', error);

      // En cas d'erreur, on restaure l'état précédent
      const response = await ordersApi.getById(id!);
      setOrderDetails(response.data);
    }
  };

  const handleTagSuccess = async () => {
    try {
      const response = await ordersApi.getById(id!);
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeleteTagClick = (orderId: string, tagName: string) => {
    setTagToDelete({ orderId, tagName });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (tagToDelete) {
      await removeTag(tagToDelete.orderId, tagToDelete.tagName);
      setIsConfirmModalOpen(false);
      setTagToDelete(null);
    }
  };

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
      <div className="flex justify-center mt-8">
        <div className="min-w-[343px] w-full md:w-5/12 bg-white rounded-2xl p-5 md:shadow-md max-w-[500px] md:mx-0 mx-4">
          {/* En-tête avec l'avatar et le statut */}
          <div className="flex flex-col mb-5 gap-5">
            <div className="flex justify-end">
              <span
                className={`px-3 py-1.5 rounded text-sm ${
                  orderDetails.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-500'
                    : orderDetails.status === 'COMPLETED'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-red-50 text-red-500'
                }`}
              >
                {orderDetails.status === 'ACTIVE'
                  ? t('active')
                  : orderDetails.status === 'COMPLETED'
                    ? t('completed')
                    : t('canceled')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-medium m-0">
                {orderDetails.firstName} {orderDetails.lastName}
              </h2>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center text-gray-600 gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="18"
                viewBox="0 0 13 18"
                fill="none"
              >
                <path
                  d="M11.9415 3.6C12.8177 5.553 12.6182 7.857 11.6553 9.729C10.8398 11.25 9.66875 12.537 8.67114 13.95C8.2374 14.58 7.80366 15.255 7.48269 15.984C7.36992 16.227 7.29185 16.479 7.2051 16.731C7.11835 16.983 7.04028 17.235 6.9622 17.487C6.88413 17.721 6.78871 18 6.50244 18C6.16412 18 6.0687 17.604 5.9993 17.334C5.7911 16.677 5.58291 16.047 5.26194 15.444C4.8976 14.733 4.43783 14.076 3.96939 13.437L11.9415 3.6ZM4.00409 5.778L1.14141 9.306C1.67057 10.467 2.45998 11.457 3.21469 12.447C3.39686 12.672 3.57903 12.906 3.75252 13.149L7.36992 8.703L7.33522 8.712C6.0687 9.162 4.66338 8.496 4.16024 7.2C4.09084 7.047 4.03879 6.867 4.00409 6.687C3.95556 6.38911 3.95556 6.08489 4.00409 5.787V5.778ZM1.80069 2.358L1.79202 2.367C0.386699 4.212 0.143804 6.777 0.98526 8.946L4.44651 4.68L4.40314 4.635L1.80069 2.358ZM8.42825 0.324L5.63496 3.753L5.66966 3.744C6.83208 3.33 8.1333 3.852 8.72319 4.95C8.85331 5.202 8.95741 5.472 8.99211 5.742C9.04416 6.084 9.06151 6.327 9.00078 6.66V6.669L11.7767 3.249C11.0503 1.88112 9.86008 0.841918 8.43692 0.333L8.42825 0.324ZM4.67205 4.401L8.06391 0.216L8.02921 0.207C7.52607 0.072 7.01425 0 6.50244 0C4.7935 0 3.17999 0.765 2.03491 2.079L2.01756 2.088L4.67205 4.401Z"
                  fill="#22C55D"
                />
              </svg>{' '}
              <span className="text-sm">{orderDetails.address}</span>
            </div>
            <div className="flex items-center text-gray-600 gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="15"
                viewBox="0 0 16 15"
                fill="none"
              >
                <path
                  d="M13.9625 14.25C12.4 14.25 10.8562 13.9095 9.33125 13.2285C7.80625 12.5475 6.41875 11.5817 5.16875 10.3312C3.91875 9.08075 2.95325 7.69325 2.27225 6.16875C1.59125 4.64425 1.2505 3.1005 1.25 1.5375C1.25 1.3125 1.325 1.125 1.475 0.975C1.625 0.825 1.8125 0.75 2.0375 0.75H5.075C5.25 0.75 5.40625 0.8095 5.54375 0.9285C5.68125 1.0475 5.7625 1.188 5.7875 1.35L6.275 3.975C6.3 4.175 6.29375 4.34375 6.25625 4.48125C6.21875 4.61875 6.15 4.7375 6.05 4.8375L4.23125 6.675C4.48125 7.1375 4.778 7.58425 5.1215 8.01525C5.465 8.44625 5.84325 8.862 6.25625 9.2625C6.64375 9.65 7.05 10.0095 7.475 10.341C7.9 10.6725 8.35 10.9755 8.825 11.25L10.5875 9.4875C10.7 9.375 10.847 9.29075 11.0285 9.23475C11.21 9.17875 11.388 9.163 11.5625 9.1875L14.15 9.7125C14.325 9.7625 14.4688 9.85325 14.5812 9.98475C14.6937 10.1163 14.75 10.263 14.75 10.425V13.4625C14.75 13.6875 14.675 13.875 14.525 14.025C14.375 14.175 14.1875 14.25 13.9625 14.25Z"
                  fill="#333333"
                />
              </svg>{' '}
              <a
                href={`tel:${orderDetails.phoneNumber}`}
                className="text-gray-600 hover:text-green-500"
              >
                {orderDetails.phoneNumber}
              </a>
            </div>
            <div className="flex items-center text-gray-600 gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
              >
                <g clipPath="url(#clip0_493_292)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.00001 2.5C6.94226 2.49976 5.90324 2.77916 4.98827 3.30987C4.07329 3.84058 3.31487 4.60374 2.78987 5.522C2.26488 6.44027 1.99196 7.48101 1.99879 8.53873C2.00562 9.59646 2.29195 10.6336 2.82876 11.545L3.25551 12.0835L2.73276 13.8527L4.47276 13.3668L4.75701 13.549C5.54146 14.0526 6.43247 14.3666 7.35938 14.4659C8.28628 14.5652 9.22358 14.4471 10.0969 14.1211C10.9703 13.7951 11.7556 13.2701 12.3907 12.5877C13.0258 11.9053 13.4931 11.0843 13.7557 10.1898C14.0182 9.29531 14.0687 8.35196 13.9032 7.43457C13.7377 6.51717 13.3606 5.65097 12.802 4.90466C12.2434 4.15835 11.5186 3.55247 10.6851 3.13507C9.85155 2.71766 8.93222 2.50023 8.00001 2.5ZM0.500007 8.5C0.500007 4.35775 3.85776 1 8.00001 1C12.1423 1 15.5 4.35775 15.5 8.5C15.5 12.6423 12.1423 16 8.00001 16C6.67873 16.0019 5.38059 15.6533 4.23801 14.9897L0.527007 16.0262L1.59651 12.4045L1.59201 12.3993L1.56726 12.358C0.867155 11.193 0.498156 9.85914 0.500007 8.5Z"
                    fill="#333333"
                  />
                  <path
                    d="M11.5513 9.61903C11.5228 9.60553 10.4286 9.06703 10.2343 8.99653C10.1533 8.96301 10.067 8.94397 9.97933 8.94028C9.83233 8.94028 9.70783 9.01378 9.61183 9.15853C9.50233 9.32128 9.17158 9.70753 9.06958 9.82303C9.05608 9.83803 9.03808 9.85678 9.02683 9.85678C9.01708 9.85678 8.84758 9.78703 8.79658 9.76453C7.62358 9.25453 6.73333 8.02978 6.61108 7.82278C6.59383 7.79278 6.59308 7.78003 6.59308 7.78003C6.59683 7.76428 6.63658 7.72453 6.65683 7.70428C6.71683 7.64503 6.78133 7.56778 6.84358 7.49203L6.93133 7.38703C7.02208 7.28203 7.06258 7.19953 7.10908 7.10578L7.13383 7.05628C7.17094 6.98119 7.18898 6.89812 7.18636 6.8144C7.18374 6.73069 7.16055 6.6489 7.11883 6.57628C7.09333 6.52453 6.63133 5.41003 6.58258 5.29303C6.46408 5.01028 6.30808 4.87903 6.09133 4.87903C6.07108 4.87903 6.09133 4.87903 6.00733 4.88278C5.90458 4.88653 5.34508 4.96078 5.09758 5.11603C4.83508 5.28103 4.39258 5.80903 4.39258 6.73603C4.39258 7.57003 4.92133 8.35753 5.14858 8.65678L5.17933 8.70178C6.05008 9.97303 7.13533 10.915 8.23483 11.3545C9.29383 11.7775 9.79558 11.827 10.0806 11.827C10.2006 11.827 10.2966 11.8173 10.3806 11.809L10.4346 11.8038C10.8006 11.7715 11.6046 11.3545 11.7876 10.8468C11.9316 10.4463 11.9698 10.009 11.8738 9.85003C11.8078 9.74203 11.6946 9.68803 11.5513 9.61903Z"
                    fill="#333333"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_493_292">
                    <rect width="15" height="16" fill="white" transform="translate(0.5 0.5)" />
                  </clipPath>
                </defs>
              </svg>{' '}
              <a
                href={`https://wa.me/${orderDetails.phoneNumber.toString().replace(/\D/g, '')}`}
                className="text-gray-600 hover:text-green-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('whatsapp')}
              </a>
            </div>
          </div>

          {/* Liste des articles */}
          <div className="mb-5">
            <h3 className="text-lg font-normal text-gray-800 mb-4">{t('products')}</h3>
            <div className="flex flex-col gap-3">
              {orderDetails.items.map((item: any, index: number) => {
                return (
                  <div key={index} className="flex justify-between items-center gap-4 items-center">
                    <span className="text-gray-800">{item.product.name}</span>
                    <span className="text-gray-600">x{item.quantity}</span>
                    <span className="font-bold">{item.product.price} €</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-5 pt-5 border-t border-dashed border-gray-300">
              <span className="text-lg font-bold">{t('total')}</span>
              <span className="text-lg font-bold">{finalPrice} €</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-normal text-gray-800">{t('notes')}</h3>
              <button
                className="text-lg font-normal text-gray-800"
                onClick={() => setIsAddTagModalOpen(true)}
              >
                Добавить +
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {orderDetails.tagNames.map((tag: string, index: number) => (
                <div key={index} className="font-light bg-gray-100 rounded-lg p-2 text-sm">
                  {tag}
                  <button
                    onClick={() => handleDeleteTagClick(orderDetails._id, tag)}
                    className="text-gray-500 ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons d'action */}
          {orderDetails.status === 'ACTIVE' && (
            <div className="flex gap-4">
              <button
                onClick={handleCancelOrder}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCompleteOrder}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                {t('complete')}
              </button>
            </div>
          )}
        </div>
      </div>
      <AddTagModal
        isOpen={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        orderId={orderDetails._id}
        onSuccess={handleTagSuccess}
      />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setTagToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('deleteTag')}
        message={t('deleteTagConfirmation')}
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
