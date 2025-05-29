import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AddressQuickSet } from '../shared/AddressQuickSet';
import { useAddressFilter } from '../../hooks/useAddressFilter';
import { OrderStatus } from '../../types/order';

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
  const { t } = useTranslation('order');
  const { t: tCustomer } = useTranslation('customerInfo');
  const { filtersObject, setFilterAddress, currentAddress } = useAddressFilter();
  const navigate = useNavigate();

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
      {/* En-tête avec le nom du client */}
      <div className="flex flex-col mb-6 gap-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-gray-900 m-0">
            {firstName} {lastName}
          </h2>
        </div>
      </div>

      {/* Informations de contact */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-start text-gray-600 gap-3">
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22C55D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div className="flex-1">
            <span className="text-base block leading-relaxed">{address}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 gap-3">
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
          </svg>
          <span className="text-base font-medium">{phoneNumber}</span>
        </div>
      </div>

      {/* Boutons d'action pour le livreur */}
      <div className="space-y-3 mb-6">
        {/* Naviguer vers l'adresse */}
        <button
          onClick={() => {
            const encodedAddress = encodeURIComponent(address);
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
              '_blank'
            );
          }}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 text-gray-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-gray-900">{tCustomer('navigateTo')}</div>
            <div className="text-xs text-gray-500 truncate mt-0.5">{address}</div>
          </div>
        </button>

        {/* Appeler le client */}
        <button
          onClick={() => window.open(`tel:${phoneNumber}`, '_self')}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 text-gray-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-gray-900">
              {tCustomer('call')} {firstName}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{phoneNumber}</div>
          </div>
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => {
            const cleanPhone = phoneNumber.toString().replace(/\D/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
          }}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 text-gray-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106" />
          </svg>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-gray-900">
              {tCustomer('whatsappMessage')}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{phoneNumber}</div>
          </div>
        </button>

        {/* Continuer la livraison d'ici */}
        {shouldShowAddressFilter && (
          <button
            onClick={handleContinueFromHere}
            className={`w-full p-5 border-2 rounded-xl transition-all duration-200 mt-4 ${
              isCurrentAddress
                ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-full flex items-center gap-4 pr-2">
              <svg
                className={`w-6 h-6 flex-shrink-0 ${
                  isCurrentAddress ? 'text-blue-900' : 'text-gray-600'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="flex-1 text-left min-w-0">
                <div
                  className={`text-base font-semibold leading-tight ${
                    isCurrentAddress ? 'text-blue-900' : 'text-gray-900'
                  }`}
                >
                  {isCurrentAddress
                    ? tCustomer('currentPositionSelected')
                    : tCustomer('continueDeliveries')}
                </div>
                <div
                  className={`text-sm truncate mt-1 ${
                    isCurrentAddress ? 'text-blue-700' : 'text-gray-500'
                  }`}
                >
                  {address}
                </div>
              </div>
            </div>
          </button>
        )}
      </div>
    </>
  );
};

export default CustomerInfo;
