import clientOrderReducer, {
  addToClientOrder,
  removeFromClientOrder,
  clearClientOrder,
} from '../clientSlice';

describe('clientOrderSlice', () => {
  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    description: 'Description du produit test',
    minOrder: 1,
    price: 1000,
    unitExpression: 'kg',
  };

  const initialState = {
    items: {},
    products: [],
  };

  describe('addToClientOrder', () => {
    it('devrait ajouter un nouveau produit au panier', () => {
      const action = addToClientOrder({
        productId: '1',
        quantity: 2,
        product: mockProduct,
      });

      const newState = clientOrderReducer(initialState, action);

      expect(newState.items['1']).toBe(2);
      expect(newState.products).toHaveLength(1);
      expect(newState.products[0]).toEqual(mockProduct);
    });

    it("devrait augmenter la quantité d'un produit existant", () => {
      const stateWithProduct = {
        items: { '1': 2 },
        products: [mockProduct],
      };

      const action = addToClientOrder({
        productId: '1',
        quantity: 3,
        product: mockProduct,
      });

      const newState = clientOrderReducer(stateWithProduct, action);

      expect(newState.items['1']).toBe(5);
      expect(newState.products).toHaveLength(1);
    });

    it('devrait ajouter un nouveau produit sans affecter les produits existants', () => {
      const existingProduct = {
        _id: '2',
        name: 'Existing Product',
        description: 'Description du produit existant',
        minOrder: 1,
        price: 2000,
        unitExpression: 'kg',
      };

      const stateWithProduct = {
        items: { '2': 1 },
        products: [existingProduct],
      };

      const action = addToClientOrder({
        productId: '1',
        quantity: 1,
        product: mockProduct,
      });

      const newState = clientOrderReducer(stateWithProduct, action);

      expect(newState.items['1']).toBe(1);
      expect(newState.items['2']).toBe(1);
      expect(newState.products).toHaveLength(2);
    });
  });

  describe('removeFromClientOrder', () => {
    it("devrait diminuer la quantité d'un produit", () => {
      const stateWithProduct = {
        items: { '1': 5 },
        products: [mockProduct],
      };

      const action = removeFromClientOrder({
        productId: '1',
        quantity: 2,
      });

      const newState = clientOrderReducer(stateWithProduct, action);

      expect(newState.items['1']).toBe(3);
      expect(newState.products).toHaveLength(1);
    });

    it('devrait supprimer un produit quand sa quantité atteint 0', () => {
      const stateWithProduct = {
        items: { '1': 2 },
        products: [mockProduct],
      };

      const action = removeFromClientOrder({
        productId: '1',
        quantity: 2,
      });

      const newState = clientOrderReducer(stateWithProduct, action);

      expect(newState.items['1']).toBeUndefined();
      expect(newState.products).toHaveLength(0);
    });

    it("ne devrait rien faire si le produit n'existe pas", () => {
      const action = removeFromClientOrder({
        productId: '999',
        quantity: 1,
      });

      const newState = clientOrderReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('clearClientOrder', () => {
    it('devrait vider complètement le panier', () => {
      const stateWithProducts = {
        items: { '1': 2, '2': 3 },
        products: [mockProduct, { ...mockProduct, _id: '2' }],
      };

      const action = clearClientOrder();
      const newState = clientOrderReducer(stateWithProducts, action);

      expect(newState.items).toEqual({});
      expect(newState.products).toHaveLength(0);
    });

    it("devrait retourner l'état initial si le panier est déjà vide", () => {
      const action = clearClientOrder();
      const newState = clientOrderReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });
});
