import { store, persistor } from '../userStore';
import {
  setInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  addPendingOperation,
} from '../slices/createInventorySlice';

describe('Store Configuration', () => {
  test('le store devrait avoir le reducer inventory', () => {
    const state = store.getState();

    expect(state).toHaveProperty('inventory');
    expect(state.inventory).toHaveProperty('items');
    expect(state.inventory).toHaveProperty('isOnline');
    expect(state.inventory).toHaveProperty('pendingOperations');
  });

  test('les actions devraient modifier le state correctement', () => {
    const sampleItem = {
      id: 1,
      name: 'Test',
      price: '10₽',
      quantity: '5',
      unitExpression: 'pcs',
      description: 'Test item',
      minOrder: 1,
    };

    store.dispatch(setInventoryItems([sampleItem]));
    let state = store.getState();

    expect(state.inventory.items).toEqual([sampleItem]);

    const updatedItem = { ...sampleItem, quantity: '10' };
    store.dispatch(updateInventoryItem(updatedItem));
    state = store.getState();

    expect(state.inventory.items[0].quantity).toBe('10');
  });

  test('deleteInventoryItem devrait supprimer un élément du state', () => {
    const sampleItems = [
      {
        id: 1,
        name: 'Test 1',
        price: '10₽',
        quantity: '5',
        unitExpression: 'pcs',
        description: 'Test item 1',
        minOrder: 1,
      },
      {
        id: 2,
        name: 'Test 2',
        price: '20₽',
        quantity: '10',
        unitExpression: 'kg',
        description: 'Test item 2',
        minOrder: 1,
      },
    ];

    store.dispatch(setInventoryItems(sampleItems));
    store.dispatch(deleteInventoryItem(1));

    const state = store.getState();
    expect(state.inventory.items.length).toBe(1);
    expect(state.inventory.items[0].id).toBe(2);
  });

  test('addPendingOperation devrait ajouter une opération en attente', () => {
    const pendingOperation = {
      type: 'update' as const,
      timestamp: Date.now(),
      data: { id: 1, quantity: '15' },
      endpoint: 'http://localhost:3300/products/quantity?id=1&quantity=15',
      method: 'PATCH',
    };

    store.dispatch(addPendingOperation(pendingOperation));

    const state = store.getState();
    expect(state.inventory.pendingOperations.length).toBeGreaterThan(0);
    expect(state.inventory.pendingOperations).toContainEqual(pendingOperation);
  });

  test('le persistor devrait être correctement configuré', () => {
    expect(persistor).toBeDefined();
    expect(typeof persistor.persist).toBe('function');
  });
});
