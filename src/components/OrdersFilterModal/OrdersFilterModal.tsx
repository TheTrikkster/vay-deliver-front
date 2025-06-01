import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OrderStatus, Position, Tag } from '../../types/order';
import { tagsApi } from '../../api/services/tagsApi';
import { debounce } from 'lodash';
import { AddressInput } from '../AddressInput/AddressInput';
import { selectFiltersObject, setFiltersObject } from '../../store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useReverseGeocode } from '../../hooks/useReverseGeocode';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrdersFilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('ordersFilterModal');
  const filtersObject = useAppSelector(selectFiltersObject);
  const dispatch = useAppDispatch();
  const { reverseGeocode, isLoading: isReverseGeocoding } = useReverseGeocode();

  // 2) États locaux pour manipuler temporairement les filtres dans le modal
  const [status, setStatus] = useState<OrderStatus | ''>(filtersObject.status);
  const [selectedTags, setSelectedTags] = useState<string[]>(filtersObject.tagNames);
  const [position, setPosition] = useState<Position>(filtersObject.position);

  // Pour la recherche de tags suggérés
  const [searchValue, setSearchValue] = useState<string>('');
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);

  // 3) À chaque ouverture, on remet à jour les valeurs locales
  useEffect(() => {
    if (isOpen) {
      setStatus(filtersObject.status);
      setSelectedTags(filtersObject.tagNames);
      setPosition(filtersObject.position);
      setSearchValue('');
      setSuggestedTags([]);
    }
  }, [isOpen, filtersObject]);

  // 4) Recherche de tags avec debounce
  const searchTag = useCallback(async (value: string) => {
    if (!value.trim()) {
      setSuggestedTags([]);
      return;
    }
    try {
      const response = await tagsApi.suggest(value);
      setSuggestedTags(response.data);
    } catch {
      setSuggestedTags([]);
    }
  }, []);

  const debouncedSearchTag = useCallback(debounce(searchTag, 300), [searchTag]);

  // 5) Géolocalisation avec reverse geocoding
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert(t('geoNotSupported'));
      return;
    }

    // Si l'adresse est déjà remplie, on vide le champ (toggle)
    if (position.address) {
      setPosition({ address: '' });
      return;
    }

    try {
      const coords = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const address = await reverseGeocode(coords.coords.latitude, coords.coords.longitude);
      setPosition({ address });
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
      alert(t('geoError'));
    }
  };

  // 7) Appliquer les filtres et fermer
  const handleApply = () => {
    dispatch(setFiltersObject({ status, tagNames: selectedTags, position }));
    onClose();
  };

  // 8) Réinitialiser à l'ouverture
  const handleReset = () => {
    setStatus('ACTIVE');
    setSelectedTags([]);
    setPosition({ address: '' });
    setSearchValue('');
    setSuggestedTags([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center md:px-0 px-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-4 pb-8">
        <div className="w-full flex justify-end items-center mb-1.5">
          <button onClick={handleReset} title={t('reset')} className="text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 17 16"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.4999 4V5.33334L12.3541 5.33325C13.4815 6.32256 14.1725 7.77044 14.1711 9.34803C14.1691 11.7912 12.5074 13.9205 10.138 14.516C7.76858 15.1116 5.29745 14.0211 4.14045 11.8693C3.70989 11.0686 3.50229 10.197 3.50429 9.33331H4.83361C4.83334 9.35331 4.83321 9.37331 4.83323 9.39331C4.86605 11.579 6.64729 13.3336 8.83323 13.3333C10.8355 13.3663 12.5429 11.8898 12.799 9.90369C12.9904 8.41984 12.3261 7.00556 11.1666 6.18656L11.1666 8.66666H9.83323V4H14.4999ZM6.08886 2L6.08889 2.71363C6.41073 2.82755 6.70878 2.99988 6.96808 3.22197L7.58673 2.86478L8.51267 4.46853L7.89442 4.82553C7.9253 4.99304 7.94081 5.16302 7.94073 5.33334C7.94073 5.50678 7.92483 5.6765 7.89442 5.84116L8.51267 6.19813L7.58673 7.80188L6.96808 7.44469C6.70878 7.66678 6.41073 7.83911 6.08889 7.95303V8.66666H4.23701V7.95303C3.91518 7.83912 3.61713 7.6668 3.35783 7.44472L2.73917 7.80188L1.81323 6.19813L2.43148 5.84116C2.4006 5.67365 2.3851 5.50367 2.38517 5.33334C2.38517 5.15991 2.40108 4.99013 2.43148 4.8255L1.81323 4.46853L2.73917 2.86478L3.3578 3.22197C3.6171 2.99988 3.91516 2.82754 4.23701 2.71363V2H6.08886ZM5.16292 4.22222C4.54929 4.22222 4.05183 4.71969 4.05183 5.33334C4.05183 5.947 4.54933 6.44444 5.16295 6.44444C5.77661 6.44444 6.27404 5.94697 6.27404 5.33334C6.27404 4.71969 5.77661 4.22222 5.16295 4.22222"
                fill="#8C8F94"
              />
            </svg>{' '}
          </button>
        </div>

        {/* Status Tabs */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">{t('orders')}</h2>
          <select
            value={status}
            onChange={e => {
              setStatus(e.target.value as OrderStatus | '');
              if (e.target.value !== 'ACTIVE') {
                setPosition({ address: '' });
              }
              setSelectedTags([]);
            }}
            className="w-1/2 p-2 border-2 border-[#22C55D] text-[#22C55D] rounded-lg focus:outline-none appearance-none bg-white relative pr-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2322C55D' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            <option value="ACTIVE">{t('active')}</option>
            <option value="COMPLETED">{t('completed')}</option>
            <option value="CANCELED">{t('canceled')}</option>
            <option value="">{t('all')}</option>
          </select>
        </div>

        {/* Address Search */}
        {status == 'ACTIVE' && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">{t('addressSort')}</h3>
            <div className="relative">
              <AddressInput
                onSelect={address => setPosition({ address })}
                disabled={false}
                inputProps={{
                  value: position.address,
                  onChange: e => {
                    setPosition({ address: e.target.value });
                  },
                  className:
                    'w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent',
                  placeholder: t('enterAddress'),
                }}
              />
              <div className="absolute right-0 inset-y-0 flex items-center border-l border-gray-200">
                <button
                  onClick={getCurrentLocation}
                  disabled={isReverseGeocoding}
                  className="w-full text-green-500 h-full px-2 transition-colors disabled:opacity-50"
                  data-testid="geolocation-button"
                >
                  {isReverseGeocoding ? (
                    <svg
                      className="w-6 h-6 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : position.address ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22C55D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="8" />
                      <circle cx="12" cy="12" r="3" />
                      <circle cx="12" cy="12" r="1" fill="#22C55D" />
                      <path d="M12 2v4" />
                      <path d="M12 18v4" />
                      <path d="M2 12h4" />
                      <path d="M18 12h4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note Search */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">{t('notesSort')}</h3>
          <div className="relative">
            <input
              // focus:outline-none focus:ring-2 focus:ring-gray-400 text-base
              type="text"
              value={searchValue}
              placeholder={t('enterNote')}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent"
              onChange={e => {
                setSearchValue(e.target.value);
                debouncedSearchTag(e.target.value);
              }}
            />

            {/* Suggestions dropdown */}
            {suggestedTags.length > 0 && searchValue && searchValue.trim() !== '' && (
              <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-sm z-10 max-h-48 overflow-y-auto mt-1">
                {suggestedTags.map(tag => (
                  <div
                    key={tag._id}
                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm"
                    onClick={() => {
                      if (!selectedTags.includes(tag.name)) {
                        setSelectedTags(prev => [...prev, tag.name]);
                      }
                      setSearchValue('');
                      setSuggestedTags([]);
                    }}
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {tag.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedTags && (
          <div className="flex flex-wrap gap-2 mb-8">
            {selectedTags.map((tag, index) => {
              return (
                <div key={index} className="font-light bg-gray-100 rounded-lg p-2 text-sm">
                  {tag}
                  <button
                    onClick={() => setSelectedTags(tags => tags.filter(theTag => theTag !== tag))}
                    className="text-gray-500 ml-2"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersFilterModal;
