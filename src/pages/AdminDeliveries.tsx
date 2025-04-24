import React, { useState, useRef, useCallback } from 'react';
import { InventoryProduct } from '../types/product';
import FoodItemCard from '../components/FoodItemCard/FoodItemCard';
import { useOutsideClick } from '../hooks/useOutsideClick';
import { useFoodInventory } from '../hooks/useFoodInventory';
import Pagination from '../components/PaginationComp/PaginationComp';
import { Link } from 'react-router-dom';
import Menu from '../components/Menu/Menu';

function AdminDeliveries() {
  const [isQuantityPopupOpen, setIsQuantityPopupOpen] = useState(false);
  const [quantityToEdit, setQuantityToEdit] = useState({ id: 0, quantity: '0' });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Référence pour le menu contextuel
  const menuRef = useRef(null);

  // Hook personnalisé qui combine récupération API + état local + pagination
  const {
    inventoryItems,
    loading,
    error,
    deleteItem,
    updateItemQuantity,
    currentItems,
    totalPages,
    currentPage,
    setCurrentPage,
  } = useFoodInventory();

  // Hook personnalisé pour détecter les clics en dehors
  useOutsideClick(menuRef, () => {
    if (openMenuId !== null) {
      setOpenMenuId(null);
    }
  });

  // Gestionnaires d'événements
  const handleDelete = useCallback(
    (id: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (window.confirm('Êtes-vous sûr de vouloir supprimer cet aliment ?')) {
        deleteItem(id);
        setOpenMenuId(null);
      }
    },
    [deleteItem]
  );

  const toggleMenu = useCallback((id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuId(prev => (prev === id ? null : id));
  }, []);

  const openQuantityPopup = useCallback((id: number, currentQuantity: number) => {
    setQuantityToEdit({
      id,
      quantity: String(currentQuantity),
    });
    setIsQuantityPopupOpen(true);
  }, []);

  const updateQuantity = useCallback(() => {
    updateItemQuantity(quantityToEdit.id, quantityToEdit.quantity);
    setIsQuantityPopupOpen(false);
  }, [quantityToEdit, updateItemQuantity]);

  const handleQuantityChange = useCallback((value: string) => {
    setQuantityToEdit(prev => ({ ...prev, quantity: value }));
  }, []);

  return (
    <div className="bg-gray-100 pb-6">
      <Menu />

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}

      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {!loading && !error && (
        <div className="flex flex-col items-center gap-3">
          {currentItems.length === 0 ? (
            <div className="text-center py-8">
              <p>Aucun produit trouvé.</p>
              <Link to="/create-product" className="text-green-500 hover:underline mt-2 block">
                Ajouter un produit
              </Link>
            </div>
          ) : (
            currentItems.map((food: InventoryProduct) => (
              <FoodItemCard
                key={food.id}
                food={food}
                toggleMenu={toggleMenu}
                handleDelete={handleDelete}
                isMenuOpen={openMenuId === food.id}
                menuRef={openMenuId === food.id ? menuRef : null}
                openQuantityPopup={openQuantityPopup}
              />
            ))
          )}
        </div>
      )}

      {!loading && !error && inventoryItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Popup de quantité - pourrait être extrait dans un composant */}
      {isQuantityPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Modifier la quantité</h3>
            <input
              type="number"
              className="w-full border border-gray-300 rounded p-2 mb-4"
              value={quantityToEdit.quantity}
              onChange={e => handleQuantityChange(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setIsQuantityPopupOpen(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={updateQuantity}
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDeliveries;
