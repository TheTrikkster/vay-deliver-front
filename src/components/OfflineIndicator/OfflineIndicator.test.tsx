// OfflineIndicator.test.tsx
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';

// On mocke react-redux *avant* d’importer le composant
jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return {
    ...actual,
    useSelector: jest.fn(),
  };
});

import * as reactRedux from 'react-redux';
import * as productsSlice from '../../store/slices/productsSlice';
import * as ordersSlice from '../../store/slices/ordersSlice';
import { OfflineIndicator } from './OfflineIndicator';

// Mock de react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, any>) => {
      if (key === 'offlineMessage') return 'Vous êtes hors ligne';
      if (key === 'syncInProgress') {
        return `Synchronisation en cours : ${opts!.total} opérations (produits : ${opts!.products}, commandes : ${opts!.orders})`;
      }
      return key;
    },
  }),
}));

describe('OfflineIndicator', () => {
  const useSelectorMock = reactRedux.useSelector as unknown as jest.Mock;

  afterEach(() => {
    jest.resetAllMocks();
    cleanup();
  });

  function mockSelectors({
    productsOnline,
    ordersOnline,
    productsPending = [],
    ordersPending = [],
  }: {
    productsOnline: boolean;
    ordersOnline: boolean;
    productsPending?: any[];
    ordersPending?: any[];
  }) {
    useSelectorMock.mockImplementation(selector => {
      if (selector === productsSlice.selectIsOnline) return productsOnline;
      if (selector === productsSlice.selectPendingOperations) return productsPending;
      if (selector === ordersSlice.selectOrdersIsOnline) return ordersOnline;
      if (selector === ordersSlice.selectOrdersPendingOperations) return ordersPending;
      return undefined;
    });
  }

  it('ne rend rien quand tout est en ligne et pas d’opérations en attente', () => {
    mockSelectors({ productsOnline: true, ordersOnline: true });
    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('affiche le message « hors ligne » si productsOffline', () => {
    mockSelectors({ productsOnline: false, ordersOnline: true });
    render(<OfflineIndicator />);
    expect(screen.getByText('Vous êtes hors ligne')).toBeInTheDocument();
  });

  it('affiche le message « hors ligne » si ordersOffline', () => {
    mockSelectors({ productsOnline: true, ordersOnline: false });
    render(<OfflineIndicator />);
    expect(screen.getByText('Vous êtes hors ligne')).toBeInTheDocument();
  });

  it('priorise le message « hors ligne » même s’il y a des opérations pendantes', () => {
    mockSelectors({
      productsOnline: false,
      ordersOnline: false,
      productsPending: [1],
      ordersPending: [2, 3],
    });
    render(<OfflineIndicator />);
    expect(screen.getByText('Vous êtes hors ligne')).toBeInTheDocument();
  });

  it('affiche « syncInProgress » quand tout est en ligne mais opérations en attente', () => {
    mockSelectors({
      productsOnline: true,
      ordersOnline: true,
      productsPending: ['op1', 'op2'],
      ordersPending: ['opA'],
    });
    render(<OfflineIndicator />);
    expect(
      screen.getByText('Synchronisation en cours : 3 opérations (produits : 2, commandes : 1)')
    ).toBeInTheDocument();
  });
});
