import productsReducer, {
  setProductsItems,
  updateProductsItem,
  deleteProductsItem,
  setLoading,
  setError,
  setOnlineStatus,
  addPendingOperation,
  removePendingOperation,
  addProductsItem,
  clearPendingOperations,
  selectProductsState,
  selectProductsLoading,
  selectProductsItems,
  selectProductsError,
  selectIsOnline,
  selectPendingOperations,
} from '../productsSlice';
import { InventoryProduct, ProductStatus } from '../../../types/product';
import { RootState } from '../../userStore';

describe('products reducer', () => {
  const initialState = {
    items: [],
    isLoading: false,
    error: null,
    isOnline: true,
    pendingOperations: [],
  };

  const sampleItem: InventoryProduct = {
    id: 1,
    name: 'Pomme',
    price: 5,
    availableQuantity: 10,
    unitExpression: 'kg',
    description: 'Pommes rouges',
    minOrder: 1,
    status: ProductStatus.ACTIVE,
  };
  test("devrait retourner l'état initial", () => {
    expect(productsReducer(undefined, { type: '' })).toEqual(initialState);
  });

  test('devrait gérer setProductsItems', () => {
    const items = [sampleItem];
    const actualState = productsReducer(initialState, setProductsItems(items));

    expect(actualState.items).toEqual(items);
  });

  test('devrait gérer updateProductsItem', () => {
    const startState = {
      ...initialState,
      items: [sampleItem],
    };

    const updatedItem = { ...sampleItem, availableQuantity: 20 };
    const actualState = productsReducer(startState, updateProductsItem(updatedItem));

    expect(actualState.items[0].availableQuantity).toBe(20);
  });

  test('devrait gérer deleteProductsItem', () => {
    const startState = {
      ...initialState,
      items: [sampleItem],
    };

    const actualState = productsReducer(startState, deleteProductsItem(1));

    expect(actualState.items).toHaveLength(0);
  });

  test('devrait gérer setOnlineStatus', () => {
    const actualState = productsReducer(initialState, setOnlineStatus(false));

    expect(actualState.isOnline).toBe(false);
  });

  test('devrait gérer addPendingOperation', () => {
    const operation = {
      type: 'update' as const,
      timestamp: Date.now(),
      data: { id: 1, quantity: '15' },
      endpoint: 'http://localhost:3300/products/quantity?id=1&quantity=15',
      method: 'PATCH',
    };

    const actualState = productsReducer(initialState, addPendingOperation(operation));

    expect(actualState.pendingOperations).toHaveLength(1);
    expect(actualState.pendingOperations[0]).toEqual(operation);
  });

  test('devrait gérer addProductsItem', () => {
    const newItem: InventoryProduct = {
      id: 2,
      name: 'Orange',
      price: 7,
      availableQuantity: 15,
      unitExpression: 'kg',
      description: 'Oranges juteuses',
      minOrder: 1,
      status: ProductStatus.ACTIVE,
    };

    const actualState = productsReducer(initialState, addProductsItem(newItem));

    expect(actualState.items).toHaveLength(1);
    expect(actualState.items[0]).toEqual(newItem);
  });

  test('devrait gérer clearPendingOperations', () => {
    const operation = {
      type: 'update' as const,
      timestamp: Date.now(),
      data: { id: 1, quantity: '15' },
      endpoint: 'http://localhost:3300/products/quantity?id=1&quantity=15',
      method: 'PATCH',
    };

    const stateWithOperations = productsReducer(initialState, addPendingOperation(operation));

    expect(stateWithOperations.pendingOperations).toHaveLength(1);

    const clearedState = productsReducer(stateWithOperations, clearPendingOperations());

    expect(clearedState.pendingOperations).toHaveLength(0);
  });

  test('devrait gérer removePendingOperation', () => {
    const operation1 = {
      type: 'update' as const,
      timestamp: Date.now(),
      data: { id: 1, quantity: '15' },
      endpoint: 'http://localhost:3300/products/quantity?id=1&quantity=15',
      method: 'PATCH',
    };

    const operation2 = {
      type: 'delete' as const,
      timestamp: Date.now(),
      data: { id: 2 },
      endpoint: 'http://localhost:3300/products/2',
      method: 'DELETE',
    };

    let state = productsReducer(initialState, addPendingOperation(operation1));
    state = productsReducer(state, addPendingOperation(operation2));

    expect(state.pendingOperations).toHaveLength(2);

    state = productsReducer(state, removePendingOperation(0));

    expect(state.pendingOperations).toHaveLength(1);
    expect(state.pendingOperations[0]).toEqual(operation2);
  });

  test("devrait correctement initialiser l'état", () => {
    // Vérifier que l'état initial est conforme à ce qui est défini
    const state = productsReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      items: [],
      isLoading: false,
      error: null,
      isOnline: navigator.onLine,
      pendingOperations: [],
    });
  });

  test('devrait gérer setOnlineStatus', () => {
    // État en ligne
    let state = productsReducer(initialState, setOnlineStatus(true));
    expect(state.isOnline).toBe(true);

    // État hors ligne
    state = productsReducer(state, setOnlineStatus(false));
    expect(state.isOnline).toBe(false);
  });

  test('devrait ignorer une mise à jour pour un élément inexistant', () => {
    const nonExistentItem: InventoryProduct = {
      id: 999,
      name: 'Produit inexistant',
      price: 10,
      availableQuantity: 5,
      unitExpression: 'pc',
      description: "Cet item n'existe pas",
      minOrder: 1,
      status: ProductStatus.ACTIVE,
    };

    // Ajouter un item initial pour avoir un état non vide
    const initialItemState = productsReducer(
      initialState,
      addProductsItem({
        id: 1,
        name: 'Test',
        price: 5,
        availableQuantity: 10,
        unitExpression: 'kg',
        description: '',
        minOrder: 1,
        status: ProductStatus.ACTIVE,
      })
    );

    // Tenter de mettre à jour un item qui n'existe pas
    const newState = productsReducer(initialItemState, updateProductsItem(nonExistentItem));

    expect(newState.items).toEqual(initialItemState.items);
    expect(newState.items.length).toBe(1);
    expect(newState.items[0].id).toBe(1);
  });

  test('devrait gérer plusieurs actions en séquence', () => {
    // Définir quelques items de test
    const item1: InventoryProduct = {
      id: 1,
      name: 'Pomme',
      price: 5,
      availableQuantity: 10,
      unitExpression: 'kg',
      description: 'Pommes rouges',
      minOrder: 1,
      status: ProductStatus.ACTIVE,
    };

    const item2: InventoryProduct = {
      id: 2,
      name: 'Banane',
      price: 3,
      availableQuantity: 8,
      unitExpression: 'kg',
      description: 'Bananes jaunes',
      minOrder: 1,
      status: ProductStatus.ACTIVE,
    };

    // Séquence d'actions
    let state = productsReducer(initialState, setProductsItems([item1, item2]));
    expect(state.items).toHaveLength(2);

    // Mise à jour d'un item
    state = productsReducer(state, updateProductsItem({ ...item1, availableQuantity: 5 }));
    expect(state.items[0].availableQuantity).toBe(5);

    // Suppression d'un item
    state = productsReducer(state, deleteProductsItem(2));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(1);

    // Ajout d'un nouvel item
    const item3: InventoryProduct = {
      id: 3,
      name: 'Orange',
      price: 7,
      availableQuantity: 12,
      unitExpression: 'kg',
      description: 'Oranges sucrées',
      minOrder: 1,
      status: ProductStatus.ACTIVE,
    };

    state = productsReducer(state, addProductsItem(item3));
    expect(state.items).toHaveLength(2);
    expect(state.items[1].id).toBe(3);

    // Changement d'état de chargement
    state = productsReducer(state, setLoading(true));
    expect(state.isLoading).toBe(true);

    // Erreur
    state = productsReducer(state, setError('Erreur de test'));
    expect(state.error).toBe('Erreur de test');

    // Ajout d'opération en attente
    const operation = {
      type: 'update' as const,
      timestamp: Date.now(),
      data: { id: 1, quantity: '3' },
      endpoint: 'test',
      method: 'PATCH',
    };

    state = productsReducer(state, addPendingOperation(operation));
    expect(state.pendingOperations).toHaveLength(1);

    // Effacement des opérations en attente
    state = productsReducer(state, clearPendingOperations());
    expect(state.pendingOperations).toHaveLength(0);
  });
});

describe('Inventory selectors', () => {
  const sampleItem: InventoryProduct = {
    id: 1,
    name: 'Pomme',
    price: 5,
    availableQuantity: 10,
    unitExpression: 'kg',
    description: 'Pommes rouges',
    minOrder: 1,
    status: ProductStatus.ACTIVE,
  };

  const sampleItem2: InventoryProduct = {
    id: 2,
    name: 'Banane',
    price: 3,
    availableQuantity: 8,
    unitExpression: 'kg',
    description: 'Bananes jaunes',
    minOrder: 1,
    status: ProductStatus.ACTIVE,
  };

  const operation = {
    type: 'update' as const,
    timestamp: Date.now(),
    data: { id: 1, availableQuantity: 15 },
    endpoint: 'products/quantity?id=1&quantity=15',
    method: 'PATCH',
  };

  const mockState = {
    products: {
      items: [sampleItem, sampleItem2],
      isLoading: true,
      error: 'Test error',
      isOnline: false,
      pendingOperations: [operation],
    },
    orders: {}, // Ajout pour satisfaire le type RootState
  } as unknown as RootState;

  test("selectProductsState devrait retourner tout l'état inventory", () => {
    expect(selectProductsState(mockState)).toEqual(mockState.products);
  });

  test('selectProductsItems devrait retourner les items', () => {
    expect(selectProductsItems(mockState)).toEqual([sampleItem, sampleItem2]);
  });

  test("selectProductsLoading devrait retourner l'état de chargement", () => {
    expect(selectProductsLoading(mockState)).toBe(true);
  });

  test("selectProductsError devrait retourner l'erreur", () => {
    expect(selectProductsError(mockState)).toBe('Test error');
  });

  test("selectIsOnline devrait retourner l'état de connexion", () => {
    expect(selectIsOnline(mockState)).toBe(false);
  });

  test('selectPendingOperations devrait retourner les opérations en attente', () => {
    expect(selectPendingOperations(mockState)).toEqual([operation]);
  });

  test('les sélecteurs devraient fonctionner avec un état vide', () => {
    const emptyState = {
      products: {
        items: [],
        isLoading: false,
        error: null,
        isOnline: true,
        pendingOperations: [],
      },
      orders: {},
    } as unknown as RootState;

    expect(selectProductsItems(emptyState)).toEqual([]);
  });
});
