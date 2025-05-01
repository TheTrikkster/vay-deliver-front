import { store, persistor } from '../userStore';
import {
  setProductsItems,
  updateProductsItem,
  deleteProductsItem,
  addPendingOperation,
} from '../slices/productsSlice';

describe('Store Configuration', () => {
  test('le store devrait avoir le reducer products', () => {
    const state = store.getState();

    expect(state).toHaveProperty('products');
    expect(state.products).toHaveProperty('items');
    expect(state.products).toHaveProperty('isOnline');
    expect(state.products).toHaveProperty('pendingOperations');
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

    store.dispatch(setProductsItems([sampleItem]));
    let state = store.getState();

    expect(state.products.items).toEqual([sampleItem]);

    const updatedItem = { ...sampleItem, quantity: '10' };
    store.dispatch(updateProductsItem(updatedItem));
    state = store.getState();

    expect(state.products.items[0].quantity).toBe('10');
  });

  test('deleteProductsItem devrait supprimer un élément du state', () => {
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

    store.dispatch(setProductsItems(sampleItems));
    store.dispatch(deleteProductsItem(1));

    const state = store.getState();
    expect(state.products.items.length).toBe(1);
    expect(state.products.items[0].id).toBe(2);
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
    expect(state.products.pendingOperations.length).toBeGreaterThan(0);
    expect(state.products.pendingOperations).toContainEqual(pendingOperation);
  });

  test('le persistor devrait être correctement configuré', () => {
    expect(persistor).toBeDefined();
    expect(typeof persistor.persist).toBe('function');
  });
});
