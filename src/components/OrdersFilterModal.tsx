import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { OrderStatus, Tag } from '../types/order';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: string) => void;
}

interface StockedParams {
  status: OrderStatus;
  tagNames: string[];
  position: string;
}

const OrdersFilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const [status, setStatus] = useState<OrderStatus>('ACTIVE');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [position, setPosition] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
  const INITIAL_STATE: StockedParams = {
    status: 'ACTIVE',
    tagNames: [],
    position: '',
  };
  const [stockedParams, setStockedParams] = useState<StockedParams>(INITIAL_STATE);

  const buildFilterString = useCallback(() => {
    const filters = new URLSearchParams();
    if (status) filters.append('status', status);
    if (selectedTags.length) filters.append('tagNames', selectedTags.join(','));
    if (position) filters.append('address', position);
    if (searchValue) filters.append('searchValue', searchValue);
    return filters.toString();
  }, [status, selectedTags, position, searchValue]);

  const searchTag = useCallback(async (value: string) => {
    if (!value) return;
    try {
      const response = await axios.get(`http://localhost:3300/tags/suggest?q=${value}`);
      setSuggestedTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setSuggestedTags([]);
    }
  }, []);

  useEffect(() => {
    setSelectedTags(stockedParams.tagNames);
    setPosition(stockedParams.position);
    setSearchValue('');
    setStatus(stockedParams.status);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    setStockedParams({
      status: status,
      tagNames: selectedTags,
      position: position,
    });
    const filters = buildFilterString();
    onApply(filters);
  };

  const initValues = () => {
    setStatus('ACTIVE');
    setSelectedTags([]);
    setPosition('');
    setSearchValue('');
    setStockedParams(INITIAL_STATE);
  };

  const handleAddTag = () => {
    if (searchValue.trim()) {
      setSelectedTags(prev => [...prev, searchValue.trim()]);
      setSearchValue('');
      setSuggestedTags([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSuggestedTagClick = (tag: Tag) => {
    if (!selectedTags.includes(tag.name)) setSelectedTags(prev => [...prev, tag.name]);
    setSearchValue('');
    setSuggestedTags([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center">
      <div className="bg-white rounded-3xl mt-16 w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-normal">Заказы</h2>
          <button onClick={initValues} className="text-gray-500">
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
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            className={`px-4 py-2 rounded-lg ${
              status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
            }`}
            onClick={() => setStatus('ACTIVE')}
          >
            Активные
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              status === 'COMPLETED' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
            }`}
            onClick={() => setStatus('COMPLETED')}
          >
            Завершенные
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              status === 'CANCELED' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
            }`}
            onClick={() => setStatus('CANCELED')}
          >
            Все
          </button>
        </div>

        {/* Address Search */}
        <div className="mb-8">
          <h3 className="text-lg mb-3">Сортировка по адресу</h3>
          <div className="relative">
            <input
              value={position}
              onChange={e => setPosition(e.target.value)}
              type="text"
              placeholder="Введите адрес или название города"
              className="w-full p-3 border rounded-lg pr-12"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="20"
                viewBox="0 0 21 20"
                fill="none"
              >
                <path
                  d="M15.5 6.66666C15.5 9.67749 12.2758 12.8575 11.0058 13.9958C10.8606 14.1068 10.6828 14.1669 10.5 14.1669C10.3172 14.1669 10.1394 14.1068 9.99417 13.9958C8.725 12.8575 5.5 9.67749 5.5 6.66666C5.5 5.34057 6.02678 4.0688 6.96447 3.13112C7.90215 2.19344 9.17392 1.66666 10.5 1.66666C11.8261 1.66666 13.0979 2.19344 14.0355 3.13112C14.9732 4.0688 15.5 5.34057 15.5 6.66666Z"
                  stroke="#22C55D"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.4999 8.33333C11.4204 8.33333 12.1666 7.58714 12.1666 6.66667C12.1666 5.74619 11.4204 5 10.4999 5C9.57944 5 8.83325 5.74619 8.83325 6.66667C8.83325 7.58714 9.57944 8.33333 10.4999 8.33333Z"
                  stroke="#22C55D"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.76164 11.6667H4.66997C4.49525 11.6667 4.32496 11.7217 4.1832 11.8239C4.04143 11.926 3.93536 12.0701 3.87997 12.2358L2.20997 17.2358C2.1681 17.3611 2.15661 17.4945 2.17643 17.6251C2.19626 17.7556 2.24683 17.8796 2.32399 17.9868C2.40115 18.094 2.50267 18.1813 2.6202 18.2416C2.73773 18.3018 2.8679 18.3333 2.99997 18.3333H18C18.1319 18.3332 18.262 18.3018 18.3795 18.2416C18.4969 18.1814 18.5984 18.0942 18.6755 17.9871C18.7526 17.88 18.8032 17.7561 18.8231 17.6257C18.843 17.4952 18.8317 17.3619 18.79 17.2367L17.1233 12.2367C17.068 12.0707 16.9619 11.9263 16.8199 11.824C16.678 11.7216 16.5074 11.6666 16.3325 11.6667H13.2391"
                  stroke="#22C55D"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Note Search */}
        <div className="mb-8">
          <h3 className="text-lg mb-3">Сортировка заметок</h3>
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              placeholder="Введите название заметки"
              className="w-full p-3 border rounded-lg pr-12"
              onChange={e => {
                setSearchValue(e.target.value);
                searchTag(e.target.value);
              }}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleAddTag}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
              >
                <path d="M10 4V16M4 10H16" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Suggestions dropdown */}
            {suggestedTags.length > 0 && searchValue && (
              <div className="absolute w-full bg-white mt-1 border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {suggestedTags.map(tag => (
                  <div
                    key={tag._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestedTagClick(tag)}
                  >
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
                <div
                  key={index}
                  className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => setSelectedTags(tags => tags.filter(theTag => theTag !== tag))}
                    className="text-gray-500"
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
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-lg text-gray-700">
            Отменить
          </button>
          <button onClick={handleApply} className="flex-1 py-3 bg-green-500 text-white rounded-lg">
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersFilterModal;
