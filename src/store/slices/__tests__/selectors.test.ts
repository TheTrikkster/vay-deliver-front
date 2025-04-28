import {
  selectInventoryState,
  selectInventoryItems,
  selectInventoryLoading,
  selectInventoryError,
  selectInventoryLastFetched,
  selectIsOnline,
  selectPendingOperations,
  selectInventoryItemById,
  selectFilteredInventoryItems,
} from '../createInventorySlice';
import { RootState } from '../../userStore';

describe('Inventory selectors', () => {
  const sampleItem = {
    id: 1,
    name: 'Pomme',
    price: '5₽',
    quantity: '10',
    unitExpression: 'kg',
    description: 'Pommes rouges',
  };

  const sampleItem2 = {
    id: 2,
    name: 'Banane',
    price: '3₽',
    quantity: '8',
    unitExpression: 'kg',
    description: 'Bananes jaunes',
  };

  const operation = {
    type: 'update' as const,
    timestamp: Date.now(),
    data: { id: 1, quantity: '15' },
    endpoint: 'http://localhost:3300/products/quantity?id=1&quantity=15',
    method: 'PATCH',
  };

  const mockState = {
    inventory: {
      items: [sampleItem, sampleItem2],
      isLoading: true,
      error: 'Test error',
      lastFetched: 12345,
      isOnline: false,
      pendingOperations: [operation],
    },
  } as unknown as RootState;

  test("selectInventoryState devrait retourner tout l'état inventory", () => {
    expect(selectInventoryState(mockState)).toEqual(mockState.inventory);
  });

  test('selectInventoryItems devrait retourner les items', () => {
    expect(selectInventoryItems(mockState)).toEqual([sampleItem, sampleItem2]);
  });

  test("selectInventoryLoading devrait retourner l'état de chargement", () => {
    expect(selectInventoryLoading(mockState)).toBe(true);
  });

  test("selectInventoryError devrait retourner l'erreur", () => {
    expect(selectInventoryError(mockState)).toBe('Test error');
  });

  test('selectInventoryLastFetched devrait retourner lastFetched', () => {
    expect(selectInventoryLastFetched(mockState)).toBe(12345);
  });

  test("selectIsOnline devrait retourner l'état de connexion", () => {
    expect(selectIsOnline(mockState)).toBe(false);
  });

  test('selectPendingOperations devrait retourner les opérations en attente', () => {
    expect(selectPendingOperations(mockState)).toEqual([operation]);
  });

  test("selectInventoryItemById devrait retourner l'item avec l'ID spécifié", () => {
    expect(selectInventoryItemById(mockState, 1)).toEqual(sampleItem);
    expect(selectInventoryItemById(mockState, 999)).toBeUndefined();
  });

  test('selectFilteredInventoryItems devrait filtrer les éléments', () => {
    expect(selectFilteredInventoryItems(mockState, 'Pom')).toEqual([sampleItem]);
    expect(selectFilteredInventoryItems(mockState, 'Ban')).toEqual([sampleItem2]);
    expect(selectFilteredInventoryItems(mockState, '')).toEqual([sampleItem, sampleItem2]);
    expect(selectFilteredInventoryItems(mockState, 'xyz')).toEqual([]);
  });

  test('les sélecteurs devraient fonctionner avec un état vide', () => {
    const emptyState = {
      inventory: {
        items: [],
        isLoading: false,
        error: null,
        lastFetched: null,
        isOnline: true,
        pendingOperations: [],
      },
    } as unknown as RootState;

    expect(selectInventoryItems(emptyState)).toEqual([]);
    expect(selectInventoryItemById(emptyState, 1)).toBeUndefined();
    expect(selectFilteredInventoryItems(emptyState, 'test')).toEqual([]);
  });
});
