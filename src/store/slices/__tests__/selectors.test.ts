import {
  selectProductsState,
  selectProductsItems,
  selectProductsLoading,
  selectProductsError,
  selectProductsLastFetched,
  selectIsOnline,
  selectPendingOperations,
  selectProductsItemById,
  selectFilteredProductsItems,
} from '../productsSlice';
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
    products: {
      items: [sampleItem, sampleItem2],
      isLoading: true,
      error: 'Test error',
      lastFetched: 12345,
      isOnline: false,
      pendingOperations: [operation],
    },
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

  test('selectProductsLastFetched devrait retourner lastFetched', () => {
    expect(selectProductsLastFetched(mockState)).toBe(12345);
  });

  test("selectIsOnline devrait retourner l'état de connexion", () => {
    expect(selectIsOnline(mockState)).toBe(false);
  });

  test('selectPendingOperations devrait retourner les opérations en attente', () => {
    expect(selectPendingOperations(mockState)).toEqual([operation]);
  });

  test("selectProductsItemById devrait retourner l'item avec l'ID spécifié", () => {
    expect(selectProductsItemById(mockState, 1)).toEqual(sampleItem);
    expect(selectProductsItemById(mockState, 999)).toBeUndefined();
  });

  test('selectFilteredProductsItems devrait filtrer les éléments', () => {
    expect(selectFilteredProductsItems(mockState, 'Pom')).toEqual([sampleItem]);
    expect(selectFilteredProductsItems(mockState, 'Ban')).toEqual([sampleItem2]);
    expect(selectFilteredProductsItems(mockState, '')).toEqual([sampleItem, sampleItem2]);
    expect(selectFilteredProductsItems(mockState, 'xyz')).toEqual([]);
  });

  test('les sélecteurs devraient fonctionner avec un état vide', () => {
    const emptyState = {
      products: {
        items: [],
        isLoading: false,
        error: null,
        lastFetched: null,
        isOnline: true,
        pendingOperations: [],
      },
    } as unknown as RootState;

    expect(selectProductsItems(emptyState)).toEqual([]);
    expect(selectProductsItemById(emptyState, 1)).toBeUndefined();
    expect(selectFilteredProductsItems(emptyState, 'test')).toEqual([]);
  });
});
