import inventoryReducer, {
  setInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  setLoading,
  setError,
  setOnlineStatus,
  addPendingOperation,
  removePendingOperation,
  addInventoryItem,
  clearPendingOperations,
} from '../createInventorySlice';
import { InventoryProduct } from '../../../types/product';

describe('inventory reducer', () => {
  const initialState = {
    items: [],
    isLoading: false,
    error: null,
    lastFetched: null,
    isOnline: true,
    pendingOperations: [],
  };

  const sampleItem: InventoryProduct = {
    id: 1,
    name: 'Pomme',
    prix: '5₽',
    quantity: '10',
    unit: 'kg',
    description: 'Pommes rouges',
  };
  test("devrait retourner l'état initial", () => {
    expect(inventoryReducer(undefined, { type: '' })).toEqual(initialState);
  });

  test('devrait gérer setInventoryItems', () => {
    const items = [sampleItem];
    const actualState = inventoryReducer(initialState, setInventoryItems(items));

    expect(actualState.items).toEqual(items);
    expect(actualState.lastFetched).not.toBeNull();
  });

  test('devrait gérer updateInventoryItem', () => {
    const startState = {
      ...initialState,
      items: [sampleItem],
    };

    const updatedItem = { ...sampleItem, quantity: '20' };
    const actualState = inventoryReducer(startState, updateInventoryItem(updatedItem));

    expect(actualState.items[0].quantity).toBe('20');
  });

  test('devrait gérer deleteInventoryItem', () => {
    const startState = {
      ...initialState,
      items: [sampleItem],
    };

    const actualState = inventoryReducer(startState, deleteInventoryItem(1));

    expect(actualState.items).toHaveLength(0);
  });

  test('devrait gérer setOnlineStatus', () => {
    const actualState = inventoryReducer(initialState, setOnlineStatus(false));

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

    const actualState = inventoryReducer(initialState, addPendingOperation(operation));

    expect(actualState.pendingOperations).toHaveLength(1);
    expect(actualState.pendingOperations[0]).toEqual(operation);
  });

  test('devrait gérer addInventoryItem', () => {
    const newItem: InventoryProduct = {
      id: 2,
      name: 'Orange',
      prix: '7₽',
      quantity: '15',
      unit: 'kg',
      description: 'Oranges juteuses',
    };

    const actualState = inventoryReducer(initialState, addInventoryItem(newItem));

    expect(actualState.items).toHaveLength(1);
    expect(actualState.items[0]).toEqual(newItem);
    expect(actualState.lastFetched).not.toBeNull();
  });

  test('devrait gérer clearPendingOperations', () => {
    const operation = {
      type: 'update' as const,
      timestamp: Date.now(),
      data: { id: 1, quantity: '15' },
      endpoint: 'http://localhost:3300/products/quantity?id=1&quantity=15',
      method: 'PATCH',
    };

    const stateWithOperations = inventoryReducer(initialState, addPendingOperation(operation));

    expect(stateWithOperations.pendingOperations).toHaveLength(1);

    const clearedState = inventoryReducer(stateWithOperations, clearPendingOperations());

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

    let state = inventoryReducer(initialState, addPendingOperation(operation1));
    state = inventoryReducer(state, addPendingOperation(operation2));

    expect(state.pendingOperations).toHaveLength(2);

    state = inventoryReducer(state, removePendingOperation(0));

    expect(state.pendingOperations).toHaveLength(1);
    expect(state.pendingOperations[0]).toEqual(operation2);
  });

  test('devrait mettre à jour lastFetched quand les items sont modifiés', () => {
    const startTime = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => startTime);

    const sampleItem: InventoryProduct = {
      id: 1,
      name: 'Pomme',
      prix: '5₽',
      quantity: '10',
      unit: 'kg',
      description: 'Pommes rouges',
    };

    // Vérifier setInventoryItems
    let state = inventoryReducer(initialState, setInventoryItems([sampleItem]));
    expect(state.lastFetched).toBe(startTime);

    // Avancer le temps
    const newTime = startTime + 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => newTime);

    // Vérifier addInventoryItem
    const newItem = { ...sampleItem, id: 2, name: 'Orange' };
    state = inventoryReducer(state, addInventoryItem(newItem));
    expect(state.lastFetched).toBe(newTime);

    // Avancer le temps encore
    const newerTime = newTime + 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => newerTime);

    // Vérifier updateInventoryItem
    const updatedItem = { ...sampleItem, quantity: '15' };
    state = inventoryReducer(state, updateInventoryItem(updatedItem));
    expect(state.lastFetched).toBe(newerTime);

    // Avancer le temps une dernière fois
    const latestTime = newerTime + 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => latestTime);

    // Vérifier deleteInventoryItem
    state = inventoryReducer(state, deleteInventoryItem(1));
    expect(state.lastFetched).toBe(latestTime);

    // Nettoyer le mock
    jest.restoreAllMocks();
  });

  test("devrait correctement initialiser l'état", () => {
    // Vérifier que l'état initial est conforme à ce qui est défini
    const state = inventoryReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      items: [],
      lastFetched: null,
      isLoading: false,
      error: null,
      isOnline: navigator.onLine,
      pendingOperations: [],
    });
  });

  test('devrait gérer setOnlineStatus', () => {
    // État en ligne
    let state = inventoryReducer(initialState, setOnlineStatus(true));
    expect(state.isOnline).toBe(true);

    // État hors ligne
    state = inventoryReducer(state, setOnlineStatus(false));
    expect(state.isOnline).toBe(false);
  });

  test('devrait ignorer une mise à jour pour un élément inexistant', () => {
    const nonExistentItem: InventoryProduct = {
      id: 999,
      name: 'Produit inexistant',
      prix: '10₽',
      quantity: '5',
      unit: 'pc',
      description: "Cet item n'existe pas",
    };

    // Ajouter un item initial pour avoir un état non vide
    const initialItemState = inventoryReducer(
      initialState,
      addInventoryItem({
        id: 1,
        name: 'Test',
        prix: '5₽',
        quantity: '10',
        unit: 'kg',
        description: '',
      })
    );

    // Tenter de mettre à jour un item qui n'existe pas
    const newState = inventoryReducer(initialItemState, updateInventoryItem(nonExistentItem));

    // Vérifier que l'état n'a pas changé (à part lastFetched qui est mis à jour)
    expect(newState.items).toEqual(initialItemState.items);
    expect(newState.items.length).toBe(1);
    expect(newState.items[0].id).toBe(1);
  });

  test('devrait gérer plusieurs actions en séquence', () => {
    // Définir quelques items de test
    const item1: InventoryProduct = {
      id: 1,
      name: 'Pomme',
      prix: '5₽',
      quantity: '10',
      unit: 'kg',
      description: 'Pommes rouges',
    };

    const item2: InventoryProduct = {
      id: 2,
      name: 'Banane',
      prix: '3₽',
      quantity: '8',
      unit: 'kg',
      description: 'Bananes jaunes',
    };

    // Séquence d'actions
    let state = inventoryReducer(initialState, setInventoryItems([item1, item2]));
    expect(state.items).toHaveLength(2);

    // Mise à jour d'un item
    state = inventoryReducer(state, updateInventoryItem({ ...item1, quantity: '5' }));
    expect(state.items[0].quantity).toBe('5');

    // Suppression d'un item
    state = inventoryReducer(state, deleteInventoryItem(2));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(1);

    // Ajout d'un nouvel item
    const item3: InventoryProduct = {
      id: 3,
      name: 'Orange',
      prix: '7₽',
      quantity: '12',
      unit: 'kg',
      description: 'Oranges sucrées',
    };

    state = inventoryReducer(state, addInventoryItem(item3));
    expect(state.items).toHaveLength(2);
    expect(state.items[1].id).toBe(3);

    // Changement d'état de chargement
    state = inventoryReducer(state, setLoading(true));
    expect(state.isLoading).toBe(true);

    // Erreur
    state = inventoryReducer(state, setError('Erreur de test'));
    expect(state.error).toBe('Erreur de test');

    // Ajout d'opération en attente
    const operation = {
      type: 'update' as const,
      timestamp: Date.now(),
      data: { id: 1, quantity: '3' },
      endpoint: 'test',
      method: 'PATCH',
    };

    state = inventoryReducer(state, addPendingOperation(operation));
    expect(state.pendingOperations).toHaveLength(1);

    // Effacement des opérations en attente
    state = inventoryReducer(state, clearPendingOperations());
    expect(state.pendingOperations).toHaveLength(0);
  });
});
