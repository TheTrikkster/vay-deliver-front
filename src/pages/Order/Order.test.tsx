import React from 'react';
import { render, screen } from '@testing-library/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Order from './Order';
import { ordersApi } from '../../api/services/ordersApi';
import { AxiosResponse } from 'axios';
import productsReducer from '../../store/slices/productsSlice';
import ordersReducer from '../../store/slices/ordersSlice';
import clientReducer from '../../store/slices/clientSlice';

// -------------- Mocks -------------- //
jest.mock('../../api/services/ordersApi');
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('../../api/config');
jest.mock('../../components/Menu/Menu', () => () => <div data-testid="mock-menu">Menu</div>);
jest.mock('../../components/Loading', () => () => <div data-testid="spinner" />);
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        errorLoadingOrder: 'Erreur de chargement de la commande',
        active: 'Active',
        completed: 'Terminée',
        canceled: 'Annulée',
        products: 'Produits',
        total: 'Total',
        notes: 'Notes',
        cancel: 'Annuler',
        complete: 'Terminer',
        whatsapp: 'WhatsApp',
        deleteTag: 'Supprimer le tag',
        deleteTagConfirmation: 'Voulez-vous vraiment supprimer ce tag ?',
      })[key] || key,
    i18n: { changeLanguage: () => Promise.resolve() },
  }),
}));

const mockedOrdersApi = ordersApi as jest.Mocked<typeof ordersApi>;
const mockedUseParams = useParams as jest.Mock;
const mockedUseNavigate = useNavigate as jest.Mock;
const mockedUseLocation = useLocation as jest.Mock;

// -------- Utility / Store -------- //
const createTestStore = () =>
  configureStore({
    reducer: {
      products: productsReducer,
      orders: ordersReducer,
      client: clientReducer,
    },
  });

const renderWithRedux = (ui: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

// --------- Tests ---------- //
describe('Order page', () => {
  const orderId = '123';
  const baseOrder = {
    _id: orderId,
    firstName: 'Jean',
    lastName: 'Dupont',
    status: 'ACTIVE' as const,
    address: '123 Rue de Paris',
    phoneNumber: 1234567890,
    tagNames: ['Urgent', 'Livraison rapide'],
    items: [
      { product: { name: 'Produit 1', price: 10 }, quantity: 2 },
      { product: { name: 'Produit 2', price: 15 }, quantity: 1 },
    ],
  };

  const mkResp = (data: any): AxiosResponse => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ id: orderId });
    mockedUseNavigate.mockReturnValue(jest.fn());
    mockedUseLocation.mockReturnValue({ pathname: `/order/${orderId}` });
    mockedOrdersApi.getById.mockResolvedValue(mkResp(baseOrder));
  });

  it('montre le spinner pendant le chargement', () => {
    mockedOrdersApi.getById.mockImplementationOnce(() => new Promise(() => {}));
    renderWithRedux(<Order />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('affiche les détails après chargement', async () => {
    renderWithRedux(<Order />);
    expect(await screen.findByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('123 Rue de Paris')).toBeInTheDocument();
    const status = screen.getByTestId('order-status');
    expect(status).toHaveTextContent('Active');
  });

  it('affiche le statut COMPLETED quand l’API renvoie COMPLETED', async () => {
    mockedOrdersApi.getById.mockResolvedValue(mkResp({ ...baseOrder, status: 'COMPLETED' }));

    renderWithRedux(<Order />);

    const status = await screen.findByTestId('order-status');
    expect(status).toHaveTextContent('Terminée');
  });

  it('affiche le statut CANCELED quand l’API renvoie CANCELED', async () => {
    mockedOrdersApi.getById.mockResolvedValue(mkResp({ ...baseOrder, status: 'CANCELED' }));

    renderWithRedux(<Order />);

    const status = await screen.findByTestId('order-status');
    expect(status).toHaveTextContent('Annulée');
  });

  it('calcule et affiche le total', async () => {
    renderWithRedux(<Order />);
    expect(await screen.findByText('35,00 €')).toBeInTheDocument();
  });
});
