import React, { useState } from 'react';
import { AvailableProduct } from '../types/product';

function ProductsAvailable() {
  // État pour suivre les produits sélectionnés
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  // État pour suivre les quantités de chaque produit
  const [productQuantities, setProductQuantities] = useState<{ [key: number]: number }>({});

  // Fonction pour gérer la sélection/désélection des produits
  const toggleProductSelection = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
      // Réinitialiser la quantité à 0 quand un produit est désélectionné
      const newQuantities = { ...productQuantities };
      delete newQuantities[productId];
      setProductQuantities(newQuantities);
    } else {
      setSelectedProducts([...selectedProducts, productId]);
      // Initialiser la quantité à 1 quand un produit est sélectionné
      setProductQuantities({ ...productQuantities, [productId]: 1 });
    }
  };

  // Fonction pour modifier la quantité d'un produit
  const updateQuantity = (productId: number, newQuantity: number, event?: React.MouseEvent) => {
    // Empêcher le clic de propager au parent (pour éviter de désélectionner)
    if (event) {
      event.stopPropagation();
    }

    if (newQuantity <= 0) {
      console.log({ selectedProducts });
      // Si la quantité atteint 0, désélectionner le produit
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
      const newQuantities = { ...productQuantities };
      delete newQuantities[productId];
      setProductQuantities(newQuantities);
    } else {
      console.log({ selectedProducts });
      // Mettre à jour la quantité
      setProductQuantities({ ...productQuantities, [productId]: newQuantity });
      // S'assurer que le produit est sélectionné
      if (!selectedProducts.includes(productId)) {
        setSelectedProducts([...selectedProducts, productId]);
      }
    }
  };

  // Calculer le nombre total d'unités commandées
  const totalUnits = Object.values(productQuantities).reduce((sum, quantity) => sum + quantity, 0);

  const produitsDisponibles: AvailableProduct[] = [
    {
      id: 1,
      name: 'Pommes Bio',
      description: 'Pommes fraîches de culture biologique locale',
      price: 2.99,
      unitExpression: 'kg',
      stock: 50,
      categorie: 'Fruits',
    },
    {
      id: 2,
      name: 'Pain Complet',
      description: 'Pain artisanal aux céréales complètes',
      price: 3.5,
      unitExpression: 'pièce',
      stock: 15,
      categorie: 'Boulangerie',
    },
    {
      id: 3,
      name: 'Fromage de Chèvre',
      description: 'Fromage de chèvre affiné de production locale',
      price: 5.75,
      unitExpression: '200g',
      stock: 8,
      categorie: 'Produits Laitiers',
    },
    {
      id: 4,
      name: 'Tomates Cerises',
      description: 'Tomates cerises cultivées en serre sans pesticides',
      price: 2.25,
      unitExpression: 'barquette',
      stock: 30,
      categorie: 'Légumes',
    },
    {
      id: 5,
      name: 'Miel de Fleurs',
      description: 'Miel artisanal récolté dans les montagnes',
      price: 7.8,
      unitExpression: 'pot de 500g',
      stock: 12,
      categorie: 'Épicerie',
    },
  ];

  return (
    <div className="p-4 max-w-full">
      <h1 className="text-center mb-6 text-2xl font-bold text-gray-800">Produits Disponibles</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {produitsDisponibles.map(produit => (
          <div
            key={produit.id}
            className={`bg-white rounded-xl p-4 shadow-md relative transition-all duration-300 cursor-pointer 
              ${
                selectedProducts.includes(produit.id)
                  ? 'border-2 border-green-500 transform -translate-y-1 shadow-lg'
                  : 'border border-gray-200'
              }`}
            onClick={() => toggleProductSelection(produit.id)}
          >
            <h3 className="mt-0 mb-2 text-lg font-semibold text-gray-800">{produit.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{produit.description}</p>

            <div className="flex justify-between mb-3">
              <p className="font-bold text-red-600 m-0">
                {produit.price.toFixed(2)} € / {produit.unitExpression}
              </p>
              <p className="text-blue-500 m-0">En stock: {produit.stock}</p>
            </div>

            <span className="inline-block bg-yellow-300 text-gray-800 px-2 py-1 rounded-full text-xs">
              {produit.categorie}
            </span>

            {selectedProducts.includes(produit.id) && (
              <>
                <div className="absolute top-3 right-3 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                  ✓
                </div>

                {/* Champ de saisie numérique pour la quantité */}
                <div
                  className="mt-4"
                  onClick={e => e.stopPropagation()} // Empêcher la désélection lors du clic sur le sélecteur
                >
                  <label className="block text-sm text-gray-600 mb-1">Quantité:</label>
                  <input
                    type="number"
                    min="1"
                    value={productQuantities[produit.id] || 1}
                    onChange={e => {
                      const newValue = parseInt(e.target.value) || 0;
                      console.log({ newValue });
                      updateQuantity(
                        produit.id,
                        newValue,
                        e.nativeEvent as unknown as React.MouseEvent
                      );
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {selectedProducts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white bg-opacity-90 shadow-md">
          <button className="mx-auto block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
            Commander ({selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''},{' '}
            {totalUnits} unité{totalUnits > 1 ? 's' : ''})
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductsAvailable;
