import React, { useCallback, useState } from 'react';
import { InventoryProduct } from '../../types/product';
// Fonction utilitaire pour arrondir correctement à 1 décimale
export const roundToDecimal = (num: number, decimals = 1): number => {
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
};

const FoodItemCard: React.FC<{
  food: InventoryProduct;
  toggleMenu: (id: number, e: React.MouseEvent) => void;
  handleDelete: (id: number, e: React.MouseEvent) => void;
  isMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement> | null;
  openQuantityPopup: (id: number, currentQuantity: number) => void;
}> = ({ food, toggleMenu, handleDelete, isMenuOpen, menuRef, openQuantityPopup }) => {
  const [toggledItems, setToggledItems] = useState<number[]>([]);

  // Fonctions existantes
  const toggleItem = useCallback((id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setToggledItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);
  return (
    <div className="w-11/12 md:w-3/4 bg-white rounded-3xl p-5 relative shadow-md">
      {/* En-tête avec le nom et le menu */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl md:text-2xl font-[600] text-[#333333]">{food.name}</h2>
        <button
          onClick={e => toggleMenu(food.id, e)}
          className="text-gray-400 p-1"
          aria-label="Options"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
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
        <p className="text-[#9DA0A5] mb-1">
          {food.prix}/{food.unit} | 5 шт мин
        </p>
        <p className="text-[#9DA0A5] mb-4">Традиционная колбаса по чечен...</p>
      </div>

      <div className="flex w-full justify-between items-center bg-[#F5F5F5] rounded-xl px-4 py-2 md:px-6 md:py-3">
        {/* Champ de quantité (rendu cliquable) */}
        <div
          className="bg-gray-50 rounded-2xl cursor-pointer"
          onClick={() => openQuantityPopup(food.id, parseInt(food.quantity))}
        >
          <div
            className="min-w-16 w-fin bg-white border border-[#D6D9E2] rounded-lg text-center md:text-xl py-1.5 px-2.5 font-medium"
            aria-label="Quantité"
          >
            {food.quantity}
          </div>
        </div>

        {/* Toggle switch */}
        <div className="flex justify-end">
          <button
            onClick={e => toggleItem(food.id, e)}
            className={`relative inline-flex h-7 md:h-8 w-12 md:w-14 items-center rounded-full transition-colors focus:outline-none ${
              toggledItems.includes(food.id) ? 'bg-[#22C55D]' : 'bg-[#9DA0A5]'
            }`}
            aria-pressed={toggledItems.includes(food.id)}
            aria-label={toggledItems.includes(food.id) ? 'Désactiver' : 'Activer'}
          >
            <span
              className={`inline-block h-5 md:h-6 w-5 md:w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                toggledItems.includes(food.id) ? 'translate-x-6 md:translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Menu contextuel */}
      {isMenuOpen && (
        <div
          className="absolute w-36 right-4 top-12 w-48 bg-neutral-100 rounded shadow-lg z-10 max-h-[calc(100vh-100px)]"
          ref={menuRef}
          style={{ maxWidth: 'calc(100% - 2rem)', overflow: 'auto' }}
        >
          <div>
            <a href={`/modify-product/${food.id}`}>
              <button
                // onClick={e => openEditPopup(food.id, e)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Modifier
              </button>
            </a>
            <button
              onClick={e => handleDelete(food.id, e)}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItemCard;
