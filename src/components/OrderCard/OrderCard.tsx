import React from 'react';
import { OrderStatus } from '../../types/order';
import OrderStatusComponent from '../OrderDetails/OrderStatus';

interface OrderCardProps {
  firstName: string;
  lastName: string;
  address: string;
  tagNames: string[];
  status: OrderStatus;
  description?: string;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  distance?: string;
}

const OrderCard: React.FC<OrderCardProps> = ({
  firstName,
  lastName,
  address,
  tagNames,
  status,
  description,
  isSelectionMode = false,
  isSelected = false,
  distance,
}) => {
  return (
    <div className="min-w-[343px] w-11/12 md:w-2/4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer relative hover:shadow-md hover:border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500">
      {/* Checkbox en mode sélection */}
      {isSelectionMode && (
        <div className="absolute top-5 right-5">
          <div
            className="w-6 h-6 rounded-md border-2 flex items-center justify-center border-green-500 bg-white"
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={isSelectionMode ? 0 : -1}
          >
            {isSelected && (
              <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* En-tête avec nom et statut */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900 leading-tight">
          {firstName} {lastName}
        </h2>
        {!isSelectionMode && <OrderStatusComponent status={status} className="" />}
      </div>

      {/* Section adresse et distance */}
      <div className="flex items-start gap-3 mb-4">
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
        <div className="flex-1 min-w-0">
          <p className="text-base text-gray-700 leading-relaxed">{address}</p>
          {distance && (
            <div className="flex items-center gap-2 mt-2">
              <svg
                className="w-4 h-4 text-green-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-sm text-green-700 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                {distance}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Séparateur */}
      <div className="border-t border-gray-100 my-4"></div>

      {/* Description des produits */}
      {description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{description}</p>
        </div>
      )}

      {/* Tags */}
      {tagNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tagNames.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
