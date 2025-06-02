import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductForm from './ProductForm';

// Mock pour la fonction roundToDecimal
jest.mock('../ProductCard/ProductCard', () => ({
  roundToDecimal: jest.fn(value => value),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, className, ...props }: any) => (
    <a className={className} {...props}>
      {children}
    </a>
  ),
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

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        editProduct: 'Изменить продукт',
        addNewProduct: 'Добавить новый продукт',
        productName: 'Название продукта *',
        description: 'Описание',
        unitMeasure: 'Единица измерения (Штука, Грамм, Кг) *',
        availableQuantity: 'Доступное колличество в цифрах *',
        minOrderVolume: 'Минимальный объем заказа в цифрах *',
        price: 'Цена : 18 *',
        requiredFields: 'Поля, отмеченные *, обязательны для заполнения.',
        cancel: 'Отменить',
        confirm: 'Подтвердить',
        creating: 'Создание...',
        updating: 'Обновление...',
        'labels.productName': 'Название продукта',
        'labels.description': 'Описание',
        'labels.unitMeasure': 'Единица измерения',
        'labels.availableQuantity': 'Доступное количество',
        'labels.minOrderVolume': 'Минимальный объем заказа',
        'labels.maxOrderVolume': 'Максимальный объем заказа',
        'labels.price': 'Цена',
        'placeholders.productName': 'Введите название продукта',
        'placeholders.description': 'Опишите ваш продукт',
        'placeholders.unitMeasure': 'напр: Штука, Грамм, Кг',
        'placeholders.availableQuantity': 'Количество в цифрах',
        'placeholders.minOrderVolume': 'Минимум в цифрах',
        'placeholders.maxOrderVolume': 'Максимум в цифрах (необязательно)',
        'placeholders.price': 'Цена в евро',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ru',
    },
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
    expect(screen.getByPlaceholderText('Введите название продукта')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Опишите ваш продукт')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('напр: Штука, Грамм, Кг')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Количество в цифрах')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Минимум в цифрах')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Цена в евро')).toBeInTheDocument();
    expect(screen.getByText('Подтвердить')).toBeInTheDocument();
    expect(screen.getByText('Отменить')).toBeInTheDocument();

    // Vérifier les labels
    expect(screen.getByText('Название продукта')).toBeInTheDocument();
    expect(screen.getByText('Описание')).toBeInTheDocument();
    expect(screen.getByText('Единица измерения')).toBeInTheDocument();
    expect(screen.getByText('Доступное количество')).toBeInTheDocument();
    expect(screen.getByText('Минимальный объем заказа')).toBeInTheDocument();
    expect(screen.getByText('Максимальный объем заказа')).toBeInTheDocument();
    expect(screen.getByText('Цена')).toBeInTheDocument();
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
      maxOrder: '20',
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

    const nameInput = screen.getByPlaceholderText('Введите название продукта');
    const descriptionInput = screen.getByPlaceholderText('Опишите ваш продукт');
    const unitExpressionInput = screen.getByPlaceholderText('напр: Штука, Грамм, Кг');
    const availableQuantityInput = screen.getByPlaceholderText('Количество в цифрах');
    const minOrderInput = screen.getByPlaceholderText('Минимум в цифрах');
    const priceInput = screen.getByPlaceholderText('Цена в евро');

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

    const nameInput = screen.getByPlaceholderText('Введите название продукта');
    const descriptionInput = screen.getByPlaceholderText('Опишите ваш продукт');
    const unitExpressionInput = screen.getByPlaceholderText('напр: Штука, Грамм, Кг');
    const availableQuantityInput = screen.getByPlaceholderText('Количество в цифрах');
    const minOrderInput = screen.getByPlaceholderText('Минимум в цифрах');
    const priceInput = screen.getByPlaceholderText('Цена в евро');
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
      maxOrder: '',
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

  test('désactive les champs et affiche le spinner lors de la soumission', () => {
    render(<ProductForm onSubmit={mockSubmit} isEditing={false} isSubmitting={true} />);

    const nameInput = screen.getByPlaceholderText('Введите название продукта');
    const descriptionInput = screen.getByPlaceholderText('Опишите ваш продукт');
    const submitButton = screen.getByRole('button', { name: /создание/i });

    expect(nameInput).toBeDisabled();
    expect(descriptionInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Создание...')).toBeInTheDocument();

    // Vérifier que le spinner est présent
    const spinner = screen
      .getByRole('button', { name: /создание/i })
      .querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  test('affiche le texte de mise à jour en mode édition lors de la soumission', () => {
    render(<ProductForm onSubmit={mockSubmit} isEditing={true} isSubmitting={true} />);

    expect(screen.getByText('Обновление...')).toBeInTheDocument();
  });
});
