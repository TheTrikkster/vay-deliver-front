import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';
import { clearClientOrder } from '../../store/slices/clientSlice';
import { toCents, fromCents } from '../../utils/orderCalcul';
import { ordersApi } from '../../api/services/ordersApi';
import { useTranslation } from 'react-i18next';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { AddressInput } from '../../components/AddressInput';

// Typage des données de formulaire
interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
}

const FORM_FIELDS: Record<string, keyof FormData> = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  PHONE_NUMBER: 'phoneNumber',
  ADDRESS: 'address',
};

function ClientOrder() {
  const { t } = useTranslation('clientOrder');
  const { items, products } = useSelector((state: RootState) => state.client);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const buttonDisabled =
    !formData[FORM_FIELDS.FIRST_NAME] ||
    !formData[FORM_FIELDS.LAST_NAME] ||
    !formData[FORM_FIELDS.PHONE_NUMBER] ||
    !formData[FORM_FIELDS.ADDRESS];
  const [waitForResponse, setWaitForResponse] = useState(false);
  const [requestError, setRequestError] = useState<string>('');

  const total = useMemo(
    () =>
      products.reduce((sum, product) => {
        const quantity = items[product._id] || 0;
        return sum + (toCents(product.price) * quantity) / 100;
      }, 0),
    [products, items]
  );

  // Fonction générique pour gérer les changements dans les inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur quand l'utilisateur commence à corriger
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData[FORM_FIELDS.FIRST_NAME].trim()) {
      newErrors[FORM_FIELDS.FIRST_NAME] = t('requiredField');
    }

    if (!formData[FORM_FIELDS.PHONE_NUMBER].trim()) {
      newErrors[FORM_FIELDS.PHONE_NUMBER] = t('requiredField');
    } else if (!/^\+?[0-9]{10,12}$/.test(formData[FORM_FIELDS.PHONE_NUMBER].trim())) {
      newErrors[FORM_FIELDS.PHONE_NUMBER] = t('invalidPhoneFormat');
    }

    if (!formData[FORM_FIELDS.ADDRESS].trim()) {
      newErrors[FORM_FIELDS.ADDRESS] = t('requiredField');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour gérer la sélection d'adresse
  const handleSelectAddress = async (address: string) => {
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);

      setFormData(prev => ({
        ...prev,
        address,
      }));

      // Effacer l'erreur
      if (errors[FORM_FIELDS.ADDRESS]) {
        setErrors(prev => ({
          ...prev,
          [FORM_FIELDS.ADDRESS]: undefined,
        }));
      }
    } catch (error) {
      console.error('Error selecting address:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWaitForResponse(true);

    if (validateForm()) {
      try {
        const orderItems = products.map(product => ({
          productId: product._id,
          quantity: items[product._id],
        }));

        const orderData = {
          ...formData,
          items: orderItems,
        };

        await ordersApi.createOrder(orderData);

        dispatch(clearClientOrder());
        navigate('/completed-order');
      } catch (error: unknown) {
        setRequestError(t('requestError'));
        if (error instanceof Error) {
          console.error('Erreur détaillée:', (error as any).response?.data);
        }
      } finally {
        setWaitForResponse(false);
      }
    }
  };

  const handleCancel = () => {
    dispatch(clearClientOrder());
    navigate('/');
  };

  return (
    <div className="min-h-screen md:bg-[#F5F7FA]">
      {products.length === 0 ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-5">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('emptyCart')}</h2>
            <p className="text-gray-600 mb-6">{t('addProducts')}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#4F46E5] text-white py-3 px-6 rounded-full text-lg font-medium hover:bg-[#4338CA] transition-colors"
            >
              {t('backToHome')}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* En-tête violet */}
          <div className="h-16 bg-[#4F46E5] flex items-center">
            {' '}
            <button onClick={() => navigate('/')} className="ml-4 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="8"
                height="15"
                viewBox="0 0 8 15"
                fill="none"
              >
                <path
                  d="M7.56327 14.5174C7.67367 14.4044 7.73547 14.2527 7.73547 14.0947C7.73547 13.9367 7.67367 13.785 7.56327 13.672L1.39588 7.34514L7.56327 1.01955C7.67367 0.906533 7.73547 0.754815 7.73547 0.596827C7.73547 0.43884 7.67367 0.28712 7.56327 0.174108C7.50961 0.118998 7.44546 0.075196 7.37459 0.0452874C7.30373 0.0153789 7.22759 -2.91613e-05 7.15067 -2.9168e-05C7.07376 -2.91747e-05 6.99762 0.0153789 6.92676 0.0452874C6.85589 0.0751959 6.79174 0.118998 6.73808 0.174107L0.179611 6.90344C0.0644212 7.02161 -4.68185e-05 7.18011 -4.6833e-05 7.34514C-4.68474e-05 7.51017 0.0644212 7.66867 0.179611 7.78684L6.73808 14.5162C6.79174 14.5713 6.85589 14.6151 6.92675 14.645C6.99762 14.6749 7.07376 14.6903 7.15067 14.6903C7.22759 14.6903 7.30373 14.6749 7.37459 14.645C7.44545 14.6151 7.50961 14.5713 7.56327 14.5162L7.56327 14.5174Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>

          {/* Contenu principal */}
          <div className="max-w-lg mx-auto px-4 pt-10 pb-4">
            {/* Section Commande */}
            <div className="md:bg-white md:rounded-lg md:shadow-sm md:p-6 md:mb-6">
              <h1 className="text-xl font-semibold text-center mb-6">{t('yourOrder')}</h1>

              {/* Liste des articles avec table */}
              <div className="mb-7 overflow-hidden">
                <table className="w-full">
                  <colgroup>
                    <col className="w-[50%]" />
                    <col className="w-[25%]" />
                    <col className="w-[25%]" />
                  </colgroup>
                  <tbody className="border-y border-dashed border-[#000]">
                    {products.map(item => (
                      <tr key={item._id}>
                        <td className="py-3 text-gray-800">{item.name}</td>
                        <td className="py-3 text-gray-600 whitespace-nowrap">
                          x {items[item._id]} {item.unitExpression}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          {fromCents(toCents(items[item._id] * item.price))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} className="pt-4 text-base font-bold">
                        {t('total')}
                      </td>
                      <td className="pt-4 text-lg font-bold text-right whitespace-nowrap">
                        {fromCents(toCents(total))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Section Informations de livraison */}
            <form
              role="form"
              onSubmit={handleSubmit}
              className="md:bg-white md:rounded-lg md:shadow-sm md:p-6"
            >
              <h2 className="text-xl font-semibold text-center mb-6">{t('shippingInfo')}</h2>

              <div className="space-y-4">
                {/* Champ adresse avec autocomplete */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          d="M9 1.5C6.0975 1.5 3.75 3.8475 3.75 6.75C3.75 10.6875 9 16.5 9 16.5C9 16.5 14.25 10.6875 14.25 6.75C14.25 3.8475 11.9025 1.5 9 1.5ZM9 8.625C8.50555 8.625 8.0222 8.4538 7.66092 8.14016C7.29965 7.82652 7.09865 7.39728 7.1018 6.9029C7.10496 6.40851 7.31207 5.98207 7.67799 5.67322C8.04392 5.36438 8.5291 5.19963 9.02353 5.20403C9.51796 5.20842 9.99932 5.38175 10.3595 5.69831C10.7196 6.01487 10.9186 6.44568 10.9131 6.90014C10.9076 7.35461 10.6983 7.78131 10.332 8.08984C9.96576 8.39837 9.48046 8.56174 8.9856 8.55634L9 8.625Z"
                          fill={focusedField === 'address' ? '#4F46E5' : '#9DA0A5'}
                        />
                      </svg>
                    </div>
                    <AddressInput
                      onSelect={address => setFormData(prev => ({ ...prev, address }))}
                      inputProps={{
                        onChange: e => {
                          setFormData(prev => ({ ...prev, address: e.target.value }));
                        },
                        className: `w-full pl-10 pr-4 py-3 border ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        } ring-0 ring-offset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent focus:placeholder-transparent`,
                        placeholder: t('address'),
                        name: 'address',
                        onFocus: () => setFocusedField('address'),
                        onBlur: () => setFocusedField(null),
                      }}
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M9 1.5C6.0975 1.5 3.75 3.8475 3.75 6.75C3.75 10.6875 9 16.5 9 16.5C9 16.5 14.25 10.6875 14.25 6.75C14.25 3.8475 11.9025 1.5 9 1.5ZM9 8.625C8.50555 8.625 8.0222 8.4538 7.66092 8.14016C7.29965 7.82652 7.09865 7.39728 7.1018 6.9029C7.10496 6.40851 7.31207 5.98207 7.67799 5.67322C8.04392 5.36438 8.5291 5.19963 9.02353 5.20403C9.51796 5.20842 9.99932 5.38175 10.3595 5.69831C10.7196 6.01487 10.9186 6.44568 10.9131 6.90014C10.9076 7.35461 10.6983 7.78131 10.332 8.08984C9.96576 8.39837 9.48046 8.56174 8.9856 8.55634L9 8.625Z"
                            fill={focusedField === 'address' ? '#4F46E5' : '#9DA0A5'}
                          />
                        </svg>
                      }
                    />
                  </div>
                  {errors.address && (
                    <p data-testid="address-error" className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9Z"
                          fill={focusedField === 'firstName' ? '#4F46E5' : '#9DA0A5'}
                        />
                        <path
                          d="M9 10.5C6.75 10.5 2.25 11.625 2.25 13.875V15C2.25 15.4125 2.5875 15.75 3 15.75H15C15.4125 15.75 15.75 15.4125 15.75 15V13.875C15.75 11.625 11.25 10.5 9 10.5Z"
                          fill={focusedField === 'firstName' ? '#4F46E5' : '#9DA0A5'}
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={t('firstName')}
                      className={`w-full pl-10 pr-4 py-3 border ${errors[FORM_FIELDS.FIRST_NAME] ? 'border-red-500' : 'border-gray-300'} ring-0 ring-offset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent focus:placeholder-transparent`}
                      onFocus={() => setFocusedField(FORM_FIELDS.FIRST_NAME)}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  {errors[FORM_FIELDS.FIRST_NAME] && (
                    <p data-testid="firstName-error" className="text-red-500 text-xs mt-1">
                      {errors[FORM_FIELDS.FIRST_NAME]}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9Z"
                          fill={focusedField === 'lastName' ? '#4F46E5' : '#9DA0A5'}
                        />
                        <path
                          d="M9 10.5C6.75 10.5 2.25 11.625 2.25 13.875V15C2.25 15.4125 2.5875 15.75 3 15.75H15C15.4125 15.75 15.75 15.4125 15.75 15V13.875C15.75 11.625 11.25 10.5 9 10.5Z"
                          fill={focusedField === 'lastName' ? '#4F46E5' : '#9DA0A5'}
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={t('lastName')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 ring-0 ring-offset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent focus:placeholder-transparent"
                      onFocus={() => setFocusedField(FORM_FIELDS.LAST_NAME)}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          d="M14.9625 15.75C13.4 15.75 11.8532 15.4125 10.3222 14.7375C8.79125 14.0625 7.4005 13.1 6.15 11.85C4.8995 10.6 3.937 9.2125 3.2625 7.6875C2.588 6.1625 2.2505 4.6125 2.25 3.0375V2.25H6.675L7.36875 6.01875L5.23125 8.175C5.50625 8.6625 5.8125 9.125 6.15 9.5625C6.4875 10 6.85 10.4062 7.2375 10.7812C7.6 11.1438 7.997 11.4907 8.4285 11.8222C8.86 12.1537 9.3255 12.463 9.825 12.75L12 10.575L15.75 11.3438V15.75H14.9625Z"
                          fill={focusedField === 'phoneNumber' ? '#4F46E5' : '#9DA0A5'}
                        />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder={t('phoneNumber')}
                      className={`w-full pl-10 pr-4 py-3 border ${errors[FORM_FIELDS.PHONE_NUMBER] ? 'border-red-500' : 'border-gray-300'} ring-0 ring-offset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent focus:placeholder-transparent`}
                      onFocus={() => setFocusedField(FORM_FIELDS.PHONE_NUMBER)}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p data-testid="phone-error" className="text-red-500 text-xs mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
              {requestError && <p className="text-red-500 text-xs mt-4">{requestError}</p>}
              <div className="flex justify-center gap-4 mt-14 mb-4">
                <button
                  onClick={handleCancel}
                  className="w-full bg-[#4F46E5] text-white py-3 px-6 rounded-full text-lg font-medium hover:bg-[#4338CA] transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  disabled={buttonDisabled || waitForResponse}
                  type="submit"
                  className={`${buttonDisabled || waitForResponse ? 'bg-gray-300 text-gray-600 border-gray-300' : 'text-whiteborder-[#4355DA] hover:bg-[#4338CA]'} w-full bg-[#4F46E5] text-white py-3 px-6 rounded-full text-lg font-medium transition-colors`}
                >
                  {t('order')}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default ClientOrder;
