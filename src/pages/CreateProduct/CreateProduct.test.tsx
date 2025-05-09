jest.mock('axios');
jest.mock('react-redux');
jest.mock('../../components/ProductForm/ProductForm', () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: (data: any) => void }) => (
    <div data-testid="product-form">
      <button
        data-testid="submit-form"
        onClick={() =>
          onSubmit({
            name: 'Test Product',
            description: 'Test Description',
            unitExpression: 'kg',
            price: '10€',
            availableQuantity: '20',
            minOrder: '5',
          })
        }
      >
        Submit
      </button>
    </div>
  ),
}));

// Définir le mock pour react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a data-testid="mock-link" href={to}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
}));

// Imports
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateProduct from './CreateProduct';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsOnline } from '../../store/slices/productsSlice';
import { productsApi } from '../../api/services/productsApi';

// Types pour les mocks
type MockType = jest.Mock & { mockClear: () => void };

// Mocker api/config.ts
jest.mock('../../api/config');
jest.mock('../../api/services/productsApi');

describe('CreateProduct', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Configuration des mocks
    (useDispatch as unknown as MockType).mockReturnValue(mockDispatch);
    (useSelector as unknown as MockType).mockImplementation((selector: any) => {
      if (selector === selectIsOnline) {
        return true; // isOnline par défaut
      }
      return null;
    });

    // Mock productsApi.create
    productsApi.create = jest.fn();
  });

  it('devrait rendre le formulaire de produit', () => {
    render(<CreateProduct />);
    expect(screen.getByTestId('product-form')).toBeInTheDocument();
  });

  it('devrait créer un produit quand le formulaire est soumis et en ligne', async () => {
    // Mock la réponse de l'API
    (productsApi.create as jest.Mock).mockResolvedValue({
      status: 201,
      data: {
        _id: '123',
        name: 'Test Product',
        price: '10₽',
        availableQuantity: 20,
        unitExpression: 'kg',
        description: 'Test Description',
        minOrder: 5,
      },
    });

    render(<CreateProduct />);

    // Simuler la soumission du formulaire
    fireEvent.click(screen.getByTestId('submit-form'));

    // Vérifier que le dispatch a été appelé
    expect(mockDispatch).toHaveBeenCalled();

    await waitFor(() => {
      // Vérifier que productsApi.create a été appelé
      expect(productsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Product',
          description: 'Test Description',
        })
      );

      // Vérifier la navigation
      expect(mockNavigate).toHaveBeenCalledWith('/admin-products');
    });
  });

  it('devrait créer un produit en mode hors ligne', async () => {
    // Mock isOnline = false
    (useSelector as unknown as MockType).mockImplementation((selector: any) => {
      if (selector === selectIsOnline) {
        return false;
      }
      return null;
    });

    render(<CreateProduct />);

    // Simuler la soumission du formulaire
    fireEvent.click(screen.getByTestId('submit-form'));

    // Vérifier que le dispatch a été appelé
    expect(mockDispatch).toHaveBeenCalled();

    await waitFor(() => {
      // Vérifier que productsApi.create n'a pas été appelé
      expect(productsApi.create).not.toHaveBeenCalled();

      // Vérifier la navigation
      expect(mockNavigate).toHaveBeenCalledWith('/admin-products');
    });
  });

  it('devrait gérer les erreurs lors de la création du produit', async () => {
    // Mock une erreur de l'API
    (productsApi.create as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<CreateProduct />);

    // Simuler la soumission du formulaire
    fireEvent.click(screen.getByTestId('submit-form'));

    await waitFor(() => {
      // Vérifier que setError est dispatché avec le bon message
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('setError'),
          payload: 'Продукт больше не существует или был удален',
        })
      );

      // Vérifier que le produit temporaire est supprimé
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('deleteProductsItem'),
        })
      );
    });
  });
});
