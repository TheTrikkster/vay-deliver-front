import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OrderStatus, Position, Tag } from '../../types/order';
import { tagsApi } from '../../api/services/tagsApi';
import { useDispatch, useSelector } from 'react-redux';
import { selectFiltersObject, setFilters } from '../../store/slices/ordersSlice';
import { buildFilterString } from '../../utils/filterUtils';
import { debounce } from 'lodash';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { AddressInput } from '../AddressInput';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: string) => void;
}

const OrdersFilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const { t } = useTranslation('ordersFilterModal');
  const dispatch = useDispatch();
  const filtersFromRedux = useSelector(selectFiltersObject);
  const [status, setStatus] = useState<OrderStatus | ''>('ACTIVE');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [position, setPosition] = useState<Position>({ lat: '', lng: '', address: '' });
  const [searchValue, setSearchValue] = useState<string>('');
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (status !== filtersFromRedux.status) {
        setStatus(filtersFromRedux.status);
      }
      if (JSON.stringify(selectedTags) !== JSON.stringify(filtersFromRedux.tagNames)) {
        setSelectedTags(filtersFromRedux.tagNames);
      }
      if (JSON.stringify(position) !== JSON.stringify(filtersFromRedux.position)) {
        setPosition(filtersFromRedux.position);
      }
      setSearchValue('');
    }
  }, [isOpen, filtersFromRedux]);

  const debouncedSearchTag = useCallback(
    debounce((value: string) => {
      if (!value || value.trim() === '') {
        setSuggestedTags([]);
        return;
      }
      searchTag(value);
    }, 300),
    []
  );

  const searchTag = useCallback(async (value: string) => {
    if (!value) return;
    try {
      const response = await tagsApi.suggest(value);
      setSuggestedTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setSuggestedTags([]);
    }
  }, []);

  const handleApply = () => {
    const newFilters = {
      status,
      tagNames: selectedTags,
      position,
    };

    // 1. Dispatch l'action pour mettre à jour l'état Redux (pour les prochaines fois)
    dispatch(
      setFilters({
        ...newFilters,
        position: {
          address: position.address,
          lat: position.address ? '' : position.lat,
          lng: position.address ? '' : position.lng,
        },
      })
    );

    onApply(buildFilterString(newFilters));
  };

  const initValues = () => {
    setStatus('ACTIVE');
    setSelectedTags([]);
    setPosition({ lat: '', lng: '', address: '' });
    setSearchValue('');
  };

  const handleSuggestedTagClick = useCallback(
    (tag: Tag) => {
      if (!selectedTags.includes(tag.name)) {
        setSelectedTags(prev => [...prev, tag.name]);
        setSearchValue('');
        setSuggestedTags([]);
      }
    },
    [selectedTags]
  );

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('geoNotSupported'));
      return;
    }
    if (position.lat && position.lng) {
      setPosition(prev => ({ ...prev, lat: '', lng: '' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setPosition(prev => ({ ...prev, lat: latitude.toString(), lng: longitude.toString() }));
      },
      error => {
        console.error('Erreur de géolocalisation :', error);
        alert(t('geoError'));
      }
    );
  };

  const handleSelectAddress = async (address: string) => {
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);

      setPosition({
        lat: latLng.lat.toString(),
        lng: latLng.lng.toString(),
        address,
      });
    } catch (error) {
      console.error('Error selecting address:', error);
    }
  };

  if (!isOpen) return null;

  console.log({ position });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center md:px-0 px-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-4 pb-8">
        <div className="w-full flex justify-end items-center mb-1.5">
          <button
            onClick={initValues}
            className="text-gray-500 flex items-center gap-1"
            title="Reset filters"
          >
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
            </svg>
            <span className="text-xs">{t('reset')}</span>
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
                setPosition({ lat: '', lng: '', address: '' });
              }
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
            <option value="">{t('all')}</option>
          </select>
        </div>

        {/* Address Search */}
        {status == 'ACTIVE' && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">{t('addressSort')}</h3>
            <div className="relative">
              <AddressInput
                onSelect={address => setPosition(position => ({ ...position, address }))}
                disabled={position.lat && position.lng ? true : false}
                inputProps={{
                  onChange: e => {
                    setPosition(position => ({ ...position, address: e.target.value }));
                  },
                  className:
                    'w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder-gray-400 focus:placeholder-transparent',
                  placeholder: t('enterAddress'),
                }}
              />
              <div className="absolute right-0 inset-y-0 flex items-center border-l border-gray-200">
                <button
                  onClick={getCurrentLocation}
                  className="w-full text-green-500 h-full px-2 transition-colors"
                  data-testid="geolocation-button"
                >
                  {position.lat && position.lng ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M19.2801 2.13799C20.8961 1.51599 22.4861 3.10599 21.8641 4.72199L15.7121 20.716C15.0141 22.528 12.4041 22.386 11.9121 20.508L10.3061 14.408C10.2608 14.2367 10.1709 14.0805 10.0454 13.9554C9.91996 13.8303 9.76352 13.7408 9.5921 13.696L3.4921 12.09C1.6161 11.596 1.4721 8.98599 3.2841 8.28999L19.2801 2.13799Z"
                        fill="#22C55D"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 21 24"
                      fill="none"
                    >
                      <path
                        d="M15.5 7.16663C15.5 10.1775 12.2758 13.3575 11.0058 14.4958C10.8606 14.6068 10.6828 14.6669 10.5 14.6669C10.3172 14.6669 10.1394 14.6068 9.99417 14.4958C8.725 13.3575 5.5 10.1775 5.5 7.16663C5.5 5.84054 6.02678 4.56877 6.96447 3.63109C7.90215 2.69341 9.17392 2.16663 10.5 2.16663C11.8261 2.16663 13.0979 2.69341 14.0355 3.63109C14.9732 4.56877 15.5 5.84054 15.5 7.16663Z"
                        stroke="#22C55D"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.5 8.83333C11.4205 8.83333 12.1667 8.08714 12.1667 7.16667C12.1667 6.24619 11.4205 5.5 10.5 5.5C9.57954 5.5 8.83334 6.24619 8.83334 7.16667C8.83334 8.08714 9.57954 8.83333 10.5 8.83333Z"
                        stroke="#22C55D"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.76167 12.1666H4.67C4.49528 12.1667 4.32499 12.2217 4.18323 12.3238C4.04146 12.426 3.93539 12.5701 3.88 12.7358L2.21 17.7358C2.16814 17.8611 2.15664 17.9945 2.17646 18.125C2.19629 18.2556 2.24686 18.3796 2.32402 18.4868C2.40118 18.594 2.5027 18.6813 2.62023 18.7415C2.73776 18.8018 2.86793 18.8332 3 18.8333H18C18.132 18.8332 18.262 18.8017 18.3795 18.7416C18.4969 18.6814 18.5984 18.5941 18.6755 18.487C18.7527 18.38 18.8033 18.2561 18.8232 18.1256C18.8431 17.9952 18.8317 17.8618 18.79 17.7366L17.1233 12.7366C17.068 12.5706 16.9619 12.4262 16.82 12.3239C16.678 12.2216 16.5075 12.1666 16.3325 12.1666H13.2392"
                        stroke="#22C55D"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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
                    onClick={() => handleSuggestedTagClick(tag)}
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
