import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductForm from './ProductForm';

// Mock pour la fonction roundToDecimal
jest.mock('../ProductCard/ProductCard', () => ({
  roundToDecimal: jest.fn(value => value),
}));

// Au début du fichier, avant les tests
jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockImplementation(selector => {
    // Simuler le comportement de useSelector
    if (selector.name === 'selectProductsError') {
      return null; // Pas d'erreur par défaut
    }
    return null;
  }),
}));

const mockSubmit = jest.fn();

describe('ProductForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation(() => null);
  });

  test('rend le formulaire en mode création', () => {
    render(<ProductForm onSubmit={mockSubmit} isEditing={false} />);

    expect(screen.getByText('Добавить новый продукт')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Название продукта *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Описание')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Единица измерения ( Штука, Грамм, Кг) *')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Доступное колличество в цифрах *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Минимальный объем заказа в цифрах *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Цена : 18 *')).toBeInTheDocument();
    expect(screen.getByText('Подтвердить')).toBeInTheDocument();
    expect(screen.getByText('Отменить')).toBeInTheDocument();
  });

  test('rend le formulaire en mode édition', () => {
    render(<ProductForm onSubmit={mockSubmit} isEditing={true} />);

    expect(screen.getByText('Изменить продукт')).toBeInTheDocument();
  });

  test('initialise le formulaire avec les valeurs fournies', () => {
    const initialValues = {
      name: 'Test Product',
      description: 'Test Description',
      unitExpression: 'Kg',
      availableQuantity: 100,
      minOrder: '10',
      price: 15,
    };

    render(<ProductForm onSubmit={mockSubmit} isEditing={true} initialValues={initialValues} />);

    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kg')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
  });

  test('met à jour les valeurs lors de la saisie', async () => {
    render(<ProductForm onSubmit={mockSubmit} isEditing={false} />);

    const nameInput = screen.getByPlaceholderText('Название продукта *');
    const descriptionInput = screen.getByPlaceholderText('Описание');
    const unitExpressionInput = screen.getByPlaceholderText(
      'Единица измерения ( Штука, Грамм, Кг) *'
    );
    const availableQuantityInput = screen.getByPlaceholderText('Доступное колличество в цифрах *');
    const minOrderInput = screen.getByPlaceholderText('Минимальный объем заказа в цифрах *');
    const priceInput = screen.getByPlaceholderText('Цена : 18 *');

    await userEvent.type(nameInput, 'New Product');
    await userEvent.type(descriptionInput, 'New Description');
    await userEvent.type(unitExpressionInput, 'шт');
    await userEvent.type(availableQuantityInput, '50');
    await userEvent.type(minOrderInput, '5');
    await userEvent.type(priceInput, '25');

    expect(nameInput).toHaveValue('New Product');
    expect(descriptionInput).toHaveValue('New Description');
    expect(unitExpressionInput).toHaveValue('шт');
    expect(availableQuantityInput).toHaveValue(50);
    expect(minOrderInput).toHaveValue(5);
    expect(priceInput).toHaveValue(25);
  });

  test('appelle onSubmit avec les données du formulaire lors de la soumission', async () => {
    render(<ProductForm onSubmit={mockSubmit} isEditing={false} />);

    const nameInput = screen.getByPlaceholderText('Название продукта *');
    const descriptionInput = screen.getByPlaceholderText('Описание');
    const unitExpressionInput = screen.getByPlaceholderText(
      'Единица измерения ( Штука, Грамм, Кг) *'
    );
    const availableQuantityInput = screen.getByPlaceholderText('Доступное колличество в цифрах *');
    const minOrderInput = screen.getByPlaceholderText('Минимальный объем заказа в цифрах *');
    const priceInput = screen.getByPlaceholderText('Цена : 18 *');
    const submitButton = screen.getByText('Подтвердить');

    await userEvent.type(nameInput, 'New Product');
    await userEvent.type(descriptionInput, 'New Description');
    await userEvent.type(unitExpressionInput, 'шт');
    await userEvent.type(availableQuantityInput, '50');
    await userEvent.type(minOrderInput, '5');
    await userEvent.type(priceInput, '25€');

    fireEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'New Product',
      description: 'New Description',
      unitExpression: 'шт',
      availableQuantity: 50,
      minOrder: '5',
      price: 25,
    });
  });

  test('prévient le comportement par défaut lors de la soumission du formulaire', () => {
    render(<ProductForm onSubmit={mockSubmit} isEditing={false} />);

    const form = screen.getByRole('form');
    const preventDefaultMock = jest.fn();

    fireEvent.submit(form, { preventDefault: preventDefaultMock });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  test("affiche un message d'erreur", () => {
    // Configurer le mock pour retourner une erreur
    const { useSelector } = require('react-redux');
    useSelector.mockImplementationOnce(() => "Message d'erreur de test");

    render(<ProductForm onSubmit={mockSubmit} isEditing={false} />);

    expect(screen.getByText("Message d'erreur de test")).toBeInTheDocument();
  });
});
