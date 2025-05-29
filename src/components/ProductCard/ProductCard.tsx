import React from 'react';
import { useTranslation } from 'react-i18next';
import { InventoryProduct, ProductStatus } from '../../types/product';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: InventoryProduct;
  toggleCardMenu: (id: number, e: React.MouseEvent) => void;
  handleDelete: (id: number, e: React.MouseEvent) => void;
  isCardMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement> | null;
  openQuantityPopup: (id: number, currentQuantity: number) => void;
  updateItemStatus: (id: number, status: ProductStatus) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  toggleCardMenu,
  handleDelete,
  isCardMenuOpen,
  menuRef,
  openQuantityPopup,
  updateItemStatus,
}) => {
  const { t } = useTranslation('productCard');

  return (
    <div className="min-w-[343px] w-11/12 md:w-2/4 bg-white rounded-3xl p-5 relative shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg md:text-2xl font-semibold text-[#333333]">{product.name}</h3>
        <button
          onClick={e => toggleCardMenu(product.id, e)}
          className="text-gray-400 p-1"
          aria-label={t('options')}
        >
          <svg
            className="w-5 md:w-6 h-5 md:h-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5C12.5523 5 13 4.55228 13 4C13 3.44772 12.5523 3 12 3C11.4477 3 11 3.44772 11 4C11 4.55228 11.4477 5 12 5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 21C12.5523 21 13 20.5523 13 20C13 19.4477 12.5523 19 12 19C11.4477 19 11 19.4477 11 20C11 20.5523 11.4477 21 12 21Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Prix/Unité */}
      <div className=" text-sm md:text-base">
        <p className="text-[#9DA0A5] mb-1 text-sm">
          {product.price}€/{product.unitExpression} | {product.minOrder} {t('minOrder')}
        </p>
        <p className="text-[#9DA0A5] mb-4 text-sm">{product.description}</p>
      </div>

      <div className="flex w-full justify-between items-center bg-[#F5F5F5] rounded-xl p-[12px] md:px-6 md:py-3">
        {/* Champ de quantité (rendu cliquable) */}
        <div
          className="bg-gray-50 rounded-2xl cursor-pointer"
          onClick={() => openQuantityPopup(product.id, product.availableQuantity)}
        >
          <div
            className="min-w-16 w-fit bg-white border border-[#D6D9E2] rounded-lg text-base text-center md:text-xl py-1.5 px-2.5 font-medium"
            aria-label={t('quantity')}
          >
            {product.availableQuantity}
          </div>
        </div>

        {/* Toggle switch */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              const newStatus =
                product.status === ProductStatus.ACTIVE
                  ? ProductStatus.INACTIVE
                  : ProductStatus.ACTIVE;

              updateItemStatus(product.id, newStatus);
            }}
            className={`relative inline-flex h-7 md:h-8 w-12 md:w-14 items-center rounded-full transition-colors focus:outline-none ${
              product.status == ProductStatus.ACTIVE ? 'bg-[#22C55D]' : 'bg-[#9DA0A5]'
            }`}
            aria-pressed={product.status === ProductStatus.ACTIVE}
            aria-label={product.status === ProductStatus.ACTIVE ? t('disable') : t('enable')}
          >
            <span
              className={`inline-block h-5 md:h-6 w-5 md:w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                product.status == ProductStatus.ACTIVE
                  ? 'translate-x-6 md:translate-x-7'
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Menu contextuel */}
      {isCardMenuOpen && (
        <div
          className="absolute right-4 top-12 bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-hidden z-10"
          ref={menuRef}
        >
          <div>
            <Link
              to={`/modify-product/${product.id}`}
              className="w-full text-left py-3 px-4 hover:bg-blue-50 flex items-center gap-3 border-b border-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span className="font-medium">{t('modify')}</span>
            </Link>
            <button
              onClick={e => handleDelete(product.id, e)}
              className="w-full text-left py-3 px-4 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              <span className="font-medium text-red-600">{t('delete')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
