jest.mock('react-redux', () => {
  const mockDispatch = jest.fn();
  return {
    useDispatch: () => mockDispatch,
    useSelector: jest.fn(),
  };
});
jest.mock('../../api/services/productsApi');
jest.mock('../../api/config');

// Définir explicitement les mocks pour react-router-dom
const mockNavigate = jest.fn();
const mockParams = { id: '123' };
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

// Mock du composant ProductForm
jest.mock('../../components/ProductForm/ProductForm', () => ({
  __esModule: true,
  default: ({
    initialValues,
    onSubmit,
    isEditing,
    isLoading,
  }: {
    initialValues?: any;
    onSubmit: (data: any) => void;
    isEditing: boolean;
    isLoading?: boolean;
  }) => (
    <div data-testid="product-form" data-is-editing={isEditing} data-loading={isLoading}>
      {initialValues && <div data-testid="initial-values">{initialValues.name}</div>}
      <button
        data-testid="submit-form"
        onClick={() =>
          onSubmit({
            name: 'Updated Product',
            description: 'Updated Description',
            unitExpression: 'kg',
            price: '15',
            availableQuantity: '25',
            minOrder: '8',
          })
        }
      >
        Mettre à jour
      </button>
    </div>
  ),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModifyProduct from './ModifyProduct';
import { productsApi } from '../../api/services/productsApi';

// Accéder au mockDispatch depuis le mock pour les assertions
const mockUseDispatch = jest.requireMock('react-redux').useDispatch;
const mockDispatch = mockUseDispatch();

describe('ModifyProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Configurer directement les méthodes de l'API
    productsApi.getById = jest.fn();
    productsApi.update = jest.fn();
  });

  it('devrait charger et afficher les données du produit', async () => {
    // Mock la réponse de l'API
    (productsApi.getById as jest.Mock).mockResolvedValue({
      data: {
        _id: '123',
        name: 'Existing Product',
        description: 'Product Description',
        unitExpression: 'g',
        availableQuantity: 10,
        minOrder: 2,
        price: 5,
      },
    });

    render(<ModifyProduct />);

    // Attendre que les données soient chargées
    await waitFor(() => {
      expect(screen.getByTestId('initial-values')).toBeInTheDocument();
    });

    // Vérifier que le composant ProductForm est rendu avec les bonnes données
    expect(screen.getByTestId('initial-values')).toHaveTextContent('Existing Product');
    expect(screen.getByTestId('product-form')).toHaveAttribute('data-is-editing', 'true');
  });

  it('devrait mettre à jour le produit quand le formulaire est soumis', async () => {
    // Mock la réponse de l'API pour le GET initial
    (productsApi.getById as jest.Mock).mockResolvedValue({
      data: {
        _id: '123',
        name: 'Existing Product',
        description: 'Product Description',
        unitExpression: 'g',
        availableQuantity: 10,
        minOrder: 2,
        price: 5,
      },
    });

    // Mock la réponse de l'API pour le PUT
    (productsApi.update as jest.Mock).mockResolvedValue({
      data: {
        _id: '123',
        name: 'Updated Product',
        description: 'Updated Description',
        unitExpression: 'kg',
        availableQuantity: 25,
        minOrder: 8,
        price: 15,
      },
    });

    render(<ModifyProduct />);

    // Attendre que les données soient chargées
    await waitFor(() => {
      expect(screen.getByTestId('product-form')).toBeInTheDocument();
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByTestId('submit-form'));

    // Vérifier que productsApi.update a été appelé avec les bons paramètres
    await waitFor(() => {
      expect(productsApi.update).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          name: 'Updated Product',
          description: 'Updated Description',
          unitExpression: 'kg',
          availableQuantity: 25,
          minOrder: 8,
          price: 15,
        })
      );
    });

    // Vérifier que le dispatch a été appelé avec les bonnes données
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('updateProductsItem'),
      })
    );

    // Vérifier la navigation
    expect(mockNavigate).toHaveBeenCalledWith('/admin-products');
  });

  it('devrait gérer les erreurs de chargement du produit', async () => {
    // Espionner console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock une erreur pour le GET
    (productsApi.getById as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ModifyProduct />);

    // Attendre que le chargement soit terminé
    await waitFor(() => {
      expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
    });

    // Vérifier que l'erreur a été loggée
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors du chargement du produit:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('devrait gérer les erreurs lors de la mise à jour du produit', async () => {
    // Espionner console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock la réponse de l'API pour le GET initial
    (productsApi.getById as jest.Mock).mockResolvedValue({
      data: {
        _id: '123',
        name: 'Existing Product',
        description: 'Product Description',
        unitExpression: 'g',
        availableQuantity: 10,
        minOrder: 2,
        price: 5,
      },
    });

    // Mock une erreur pour le PUT
    (productsApi.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

    render(<ModifyProduct />);

    // Attendre que les données soient chargées
    await waitFor(() => {
      expect(screen.getByTestId('product-form')).toBeInTheDocument();
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByTestId('submit-form'));

    await waitFor(() => {
      // Vérifier que l'erreur a été loggée
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur lors de la mise à jour du produit:',
        expect.any(Error)
      );

      // Vérifier que l'action setError a été dispatchée
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('setError'),
        })
      );
    });

    // Vérifier que la navigation n'a pas été appelée
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('devrait passer isLoading=true au ProductForm', () => {
    // Mock une réponse en attente
    (productsApi.getById as jest.Mock).mockImplementation(() => new Promise(() => {}));

    // Simuler le loading à true
    const { useSelector } = require('react-redux');
    (useSelector as jest.Mock).mockReturnValue(true);

    render(<ModifyProduct />);

    // Vérifier que ProductForm reçoit isLoading=true
    expect(screen.getByTestId('product-form')).toHaveAttribute('data-loading', 'true');
  });
});
