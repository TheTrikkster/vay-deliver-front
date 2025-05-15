import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientCardProps } from '../../types/client';
import { fromCents, toCents } from '../../utils/orderCalcul';

const ClientCard: React.FC<ClientCardProps> = memo(({ product, quantity, cartActions }) => {
  const { t } = useTranslation('clientCard');

  if (!product) return <div className="bg-gray-100 rounded-3xl p-6">{t('productUnavailable')}</div>;

  const { _id, name, description, minOrder, price, unitExpression } = product;
  const { onAdd, onRemove } = cartActions;

  return (
    <article aria-label={t('ariaLabel', { name })} className="bg-white rounded-3xl p-6 shadow-sm">
      <h2 className="text-base font-semibold mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-6">{description}</p>

      <div className="flex flex-col gap-2">
        <div className="flex items-center text-gray-600">
          <span className="text-sm font-semibold">{t('minOrder')}</span>
          <span className="ml-1 text-sm font-semibold">
            {minOrder} {unitExpression}
          </span>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-gray-600 font-semibold">{t('price')}</span>
          <span className="ml-1 text-sm text-[#4F46E5] font-semibold">
            {fromCents(toCents(price))}/{unitExpression}
          </span>
        </div>
      </div>

      {!quantity ? (
        <button
          aria-label={t('ariaAddToCart', { name })}
          onClick={() => onAdd(_id)}
          className="w-full text-[#4355DA] font-bold border border-[#4355DA] py-3 rounded-full text-base mt-6 hover:bg-gray-100 transition-colors"
        >
          {t('add')}
        </button>
      ) : (
        <div className="flex items-center justify-between mt-6 bg-white border border-gray-200 rounded-full overflow-hidden">
          <button
            onClick={() => onRemove(_id)}
            className={`p-4 text-[#4F46E5] font-medium hover:bg-gray-50 flex items-center justify-center`}
          >
            {quantity === minOrder ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
              >
                <g clipPath="url(#clip0_767_1201)">
                  <path
                    d="M3.18188 3.65971L4.76663 13.232C4.83911 13.6702 5.06482 14.0684 5.40353 14.3558C5.74224 14.6431 6.17195 14.8009 6.61613 14.801H9.12713M14.1506 3.65971L12.5666 13.232C12.4941 13.6702 12.2684 14.0684 11.9297 14.3558C11.591 14.6431 11.1613 14.8009 10.7171 14.801H8.20613M7.18313 7.33696V11.1237M10.1501 7.33696V11.1237M1.72913 3.65971H15.6041M10.7494 3.65971V2.32471C10.7494 2.02634 10.6308 1.74019 10.4199 1.52921C10.2089 1.31823 9.92274 1.19971 9.62438 1.19971H7.70888C7.41051 1.19971 7.12436 1.31823 6.91338 1.52921C6.7024 1.74019 6.58388 2.02634 6.58388 2.32471V3.65971H10.7494Z"
                    stroke="#4355DA"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_767_1201">
                    <rect width="16" height="16" fill="white" transform="translate(0.833313)" />
                  </clipPath>
                </defs>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
              >
                <path
                  d="M4.16663 8H13.5"
                  stroke="#4355DA"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <span className="font-medium text-lg">{quantity}</span>
          <button
            onClick={() => onAdd(_id)}
            className="p-[18px] pl-10 text-[#4F46E5] font-medium hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="12"
              viewBox="0 0 13 12"
              fill="none"
            >
              <path
                d="M1.83331 5.99992H6.49998M6.49998 5.99992H11.1666M6.49998 5.99992V1.33325M6.49998 5.99992V10.6666"
                stroke="#4355DA"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>{' '}
          </button>
        </div>
      )}
    </article>
  );
});

export default ClientCard;
