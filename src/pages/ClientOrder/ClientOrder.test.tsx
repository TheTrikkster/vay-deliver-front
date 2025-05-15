import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import ClientOrder from './ClientOrder';
import { clearClientOrder } from '../../store/slices/clientSlice';
import { ordersApi } from '../../api/services/ordersApi';

// Mock des dépendances
jest.mock('../../api/services/ordersApi');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        orderSuccess: 'Ваш заказ успешно оформлен!',
        redirecting: 'Перенаправление на главную страницу...',
        emptyCart: 'Ваша корзина пуста',
        addProducts: 'Пожалуйста, добавьте товары перед оформлением заказа.',
        backToHome: 'Вернуться на главную страницу',
        yourOrder: 'Ваш заказ',
        total: 'Итого',
        shippingInfo: 'Информация для отправки',
        firstName: 'Имя',
        lastName: 'Фамилия',
        phoneNumber: 'Номер телефона',
        address: 'Напишите полный и правильный адрес для быстрой доставки',
        requiredField: 'Обязательное поле',
        invalidPhoneFormat: 'Неверный формат номера',
        cancel: 'Аннулировать',
        order: 'Заказать',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ru',
    },
  }),
}));

const mockStore = configureStore([]);

describe('ClientOrder', () => {
  let store: any;
  const mockNavigate = jest.fn();

  const mockProducts = [
    {
      _id: '1',
      name: 'Produit Test',
      description: 'Description du produit',
      minOrder: 1,
      price: 1000,
      unitExpression: 'kg',
    },
  ];

  const mockItems = {
    '1': 2,
  };

  beforeEach(() => {
    store = mockStore({
      client: {
        items: mockItems,
        products: mockProducts,
      },
    });

    // Mock de useNavigate
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("devrait afficher le message de panier vide quand il n'y a pas de produits", () => {
    store = mockStore({
      client: {
        items: {},
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientOrder />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Ваша корзина пуста')).toBeInTheDocument();
    expect(
      screen.getByText('Пожалуйста, добавьте товары перед оформлением заказа.')
    ).toBeInTheDocument();
  });

  it('devrait afficher la liste des produits et le formulaire quand il y a des produits', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientOrder />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Ваш заказ')).toBeInTheDocument();
    expect(screen.getByText('Produit Test')).toBeInTheDocument();
    expect(screen.getByText('x 2 kg')).toBeInTheDocument();
  });

  it('devrait valider le formulaire correctement', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientOrder />
        </BrowserRouter>
      </Provider>
    );

    const submitButton = screen.getByText('Заказать');
    expect(submitButton).toBeDisabled();

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Фамилия'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Номер телефона'), {
      target: { value: '+33612345678' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Напишите полный и правильный адрес для быстрой доставки'),
      {
        target: { value: '123 Rue Test' },
      }
    );

    expect(submitButton).not.toBeDisabled();
  });

  it('devrait afficher les erreurs de validation', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientOrder />
        </BrowserRouter>
      </Provider>
    );

    // Remplir le formulaire avec des valeurs invalides
    const firstNameInput = screen.getByPlaceholderText('Имя');
    const phoneInput = screen.getByPlaceholderText('Номер телефона');
    const addressInput = screen.getByPlaceholderText(
      'Напишите полный и правильный адрес для быстрой доставки'
    );

    // Vider les champs requis
    fireEvent.change(firstNameInput, { target: { value: '' } });
    fireEvent.change(phoneInput, { target: { value: '' } });
    fireEvent.change(addressInput, { target: { value: '' } });

    // Soumettre le formulaire
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // Attendre que les erreurs s'affichent
    await waitFor(() => {
      // Vérifier les messages d'erreur
      const errorMessages = screen.getAllByText('Обязательное поле');
      expect(errorMessages.length).toBe(3);
    });
  });

  it('devrait soumettre la commande avec succès', async () => {
    (ordersApi.createOrder as jest.Mock).mockResolvedValueOnce({});

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientOrder />
        </BrowserRouter>
      </Provider>
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Фамилия'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Номер телефона'), {
      target: { value: '+33612345678' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Напишите полный и правильный адрес для быстрой доставки'),
      {
        target: { value: '123 Rue Test' },
      }
    );

    // Soumettre le formulaire
    fireEvent.click(screen.getByText('Заказать'));

    // Vérifier l'appel à l'API
    await waitFor(() => {
      expect(ordersApi.createOrder).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+33612345678',
        address: '123 Rue Test',
        items: [
          {
            productId: '1',
            quantity: 2,
          },
        ],
      });
    });

    // Attendre que le message de succès s'affiche
    await waitFor(
      () => {
        const successMessage = screen.getByText(/Ваш заказ успешно оформлен!/i);
        expect(successMessage).toBeInTheDocument();
      },
      { timeout: 3000 }
    ); // Augmenter le timeout car il y a un délai de 3 secondes
  });

  it('devrait gérer les erreurs de soumission', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (ordersApi.createOrder as jest.Mock).mockRejectedValueOnce(new Error('Erreur API'));

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientOrder />
        </BrowserRouter>
      </Provider>
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Фамилия'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Номер телефона'), {
      target: { value: '+33612345678' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Напишите полный и правильный адрес для быстрой доставки'),
      {
        target: { value: '123 Rue Test' },
      }
    );

    // Soumettre le formulaire
    fireEvent.click(screen.getByText('Заказать'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('devrait annuler la commande et rediriger', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientOrder />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByText('Аннулировать'));

    expect(store.getActions()).toContainEqual(clearClientOrder());
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
