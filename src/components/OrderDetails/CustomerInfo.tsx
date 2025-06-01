import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAddressFilter } from '../../hooks/useAddressFilter';
import { OrderStatus } from '../../types/order';
import OrderStatusComponent from './OrderStatus';

interface CustomerInfoProps {
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: number | string;
  orderStatus?: OrderStatus;
}

const CustomerInfo = ({
  firstName,
  lastName,
  address,
  phoneNumber,
  orderStatus,
}: CustomerInfoProps) => {
  const { t: tCustomer } = useTranslation('customerInfo');
  const { filtersObject, setFilterAddress, currentAddress } = useAddressFilter();

  const shouldShowAddressFilter =
    orderStatus === 'ACTIVE' &&
    filtersObject.status === 'ACTIVE' &&
    filtersObject.position.address !== '';

  const isCurrentAddress = currentAddress === address;

  const handleContinueFromHere = () => {
    setFilterAddress(address);
    // Suppression de la redirection automatique - l'utilisateur reste sur la page
  };

  return (
    <>
      {/* En-tête avec le nom du client et le statut */}
      <div className="flex flex-col mb-8 gap-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-gray-900 m-0">
            {firstName} {lastName}
          </h2>
          {orderStatus && (
            <OrderStatusComponent status={orderStatus} className="flex justify-end" />
          )}
        </div>
      </div>

      {/* Informations de contact */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="bg-gray-50 rounded-2xl cursor-pointer">
          <div
            className="w-full px-4 py-3 bg-white rounded flex items-center gap-3 shadow-sm"
            style={{
              borderRadius: '4px',
              boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
            }}
            onClick={() => {
              const encodedAddress = encodeURIComponent(address);
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
                '_blank'
              );
            }}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 text-black"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div className="flex-1">
              <span className="text-base block leading-relaxed text-gray-900 font-medium">
                {address}
              </span>
              <span className="text-xs text-gray-500 mt-1 block">
                {tCustomer('clickToNavigate')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl cursor-pointer">
          <div
            className="w-full px-4 py-3 bg-white rounded flex items-center gap-3 shadow-sm"
            style={{
              borderRadius: '4px',
              boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
            }}
            onClick={() => window.open(`tel:${phoneNumber}`, '_self')}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 text-black"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <div className="flex-1">
              <span className="text-base font-medium text-gray-900">{phoneNumber}</span>
              <span className="text-xs text-gray-500 mt-1 block">{tCustomer('clickToCall')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action pour le livreur */}
      <div className="mb-6">
        {/* WhatsApp */}
        <div className="bg-gray-50 rounded-2xl cursor-pointer">
          <div
            className="w-full px-4 py-3 bg-white rounded flex items-center gap-3 shadow-sm"
            style={{
              borderRadius: '4px',
              boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
            }}
            onClick={() => {
              const cleanPhone = phoneNumber.toString().replace(/\D/g, '');
              window.open(`https://wa.me/${cleanPhone}`, '_blank');
            }}
          >
            <svg
              className="w-5 h-5 text-black flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106" />
            </svg>
            <div className="flex-1">
              <span className="text-base font-medium text-gray-900">
                {tCustomer('sendMessage')}
              </span>
              <span className="text-xs text-gray-500 mt-1 block">
                {tCustomer('clickForWhatsApp')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Continuer la livraison d'ici */}
      {shouldShowAddressFilter && (
        <div
          className={`bg-gray-50 rounded-2xl cursor-pointer ${isCurrentAddress ? 'bg-blue-50' : ''}`}
        >
          <div
            className={`w-full px-4 py-3 ${isCurrentAddress ? 'bg-blue-100' : 'bg-white'} rounded flex items-center gap-3 shadow-sm`}
            style={{
              borderRadius: '4px',
              boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
            }}
            onClick={handleContinueFromHere}
          >
            <svg
              className="w-5 h-5 text-black flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex-1">
              <span
                className={`text-base font-medium ${
                  isCurrentAddress ? 'text-blue-900' : 'text-gray-900'
                }`}
              >
                {isCurrentAddress ? tCustomer('currentPosition') : tCustomer('continueRoute')}
              </span>
              <span
                className={`text-xs mt-1 block ${
                  isCurrentAddress ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {isCurrentAddress ? tCustomer('deliveryInProgress') : tCustomer('nextDelivery')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerInfo;
