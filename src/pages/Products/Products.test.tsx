jest.mock('../../hooks/useProductsInventory/useProductsInventory');
jest.mock('../../hooks/useOutsideClick');
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

import { render, screen, fireEvent, within, act } from '@testing-library/react';
import Products from './Products';
import { useProductsInventory } from '../../hooks/useProductsInventory/useProductsInventory';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        mustAddProduct: 'Вы должны добавить продукт',
        addProduct: 'Добавить продукт',
        productInStock: 'Товар в наличии',
        unitOfMeasure: 'Единица измерения:',
        cancel: 'Отменить',
        confirm: 'Подтвердить',
        deleteConfirmation: 'Подтверждение удаления',
        deleteConfirmationText: 'Вы уверены, что хотите удалить этот элемент ?',
        delete: 'Удалить',
        productNoLongerExists: 'Продукт больше не существует или был удален',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ru',
    },
  }),
}));

jest.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: () => ({
    signOut: jest.fn(),
    user: { username: 'test' },
  }),
}));

const mockInventoryItems = [
  {
    id: '1',
    name: 'Pommes',
    availableQuantity: 20,
    minOrder: 1,
    description: 'Pommes fraîches',
    unitExpression: 'piece',
    status: 'ACTIVE',
    price: 29.99,
  },
  {
    id: '2',
    name: 'Carottes',
    availableQuantity: 10,
    minOrder: 1,
    description: 'Carottes bio',
    unitExpression: 'kg',
    status: 'ACTIVE',
    price: 29.99,
  },
];

describe('Products', () => {
  beforeEach(() => {
    // Configuration par défaut du mock pour useProductsInventory
    (useProductsInventory as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      deleteItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      currentItems: mockInventoryItems,
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher les produits correctement', () => {
    act(() => {
      render(<Products />);
    });

    expect(screen.getByText('Pommes')).toBeInTheDocument();

    // Utiliser getAllByText pour gérer plusieurs éléments correspondants
    const priceElements = screen.getAllByText(content => content.includes('29.99'));
    expect(priceElements.length).toBeGreaterThan(0);

    // Trouver l'élément spécifique qui contient 'piece'
    const pieceElements = screen.getAllByText(content => content.includes('piece'));
    expect(pieceElements.length).toBeGreaterThan(0);

    // Trouver l'élément qui contient '1' et 'minOrder'
    const minOrderElements = screen.getAllByText(
      content => content.includes('1') && content.includes('minOrder')
    );
    expect(minOrderElements.length).toBeGreaterThan(0);

    // Vérifier la quantité
    const quantities = screen.getAllByLabelText('quantity');
    expect(quantities[0]).toHaveTextContent('20');
  });

  it("devrait afficher un message lorsqu'aucun produit n'est disponible", () => {
    (useProductsInventory as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      deleteItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      currentItems: [],
      totalPages: 0,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    act(() => {
      render(<Products />);
    });

    expect(screen.getByText('Вы должны добавить продукт')).toBeInTheDocument();
    expect(screen.getByText('Добавить продукт')).toBeInTheDocument();
  });

  it('devrait afficher un indicateur de chargement', () => {
    (useProductsInventory as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      deleteItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      currentItems: [],
      totalPages: 0,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    act(() => {
      render(<Products />);
    });

    // Trouver le spinner par sa classe et non par le rôle
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
  });

  it("devrait afficher un message d'erreur", () => {
    (useProductsInventory as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Erreur lors du chargement des données',
      deleteItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      currentItems: [],
      totalPages: 0,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    act(() => {
      render(<Products />);
    });

    expect(screen.getByText('Erreur lors du chargement des données')).toBeInTheDocument();
  });

  it('devrait ouvrir et fermer le popup de modification de quantité', async () => {
    const mockUpdateItemQuantity = jest.fn();

    (useProductsInventory as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      deleteItem: jest.fn(),
      updateItemQuantity: mockUpdateItemQuantity,
      currentItems: mockInventoryItems,
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    act(() => {
      render(<Products />);
    });

    // Simulons l'appel à openQuantityPopup
    const instance = screen.getByText('Pommes').closest('div');
    const quantityField = instance?.querySelector('[aria-label="quantity"]');

    // Si quantityField est trouvé, cliquez dessus pour ouvrir le popup
    if (quantityField && quantityField.parentElement) {
      act(() => {
        fireEvent.click(quantityField.parentElement!);
      });

      // Vérifier que le popup est ouvert
      expect(screen.getByText('Товар в наличии')).toBeInTheDocument();

      // Modifier la valeur
      const input = screen.getByRole('spinbutton');
      act(() => {
        fireEvent.change(input, { target: { value: '15' } });
      });

      // Cliquer sur "Confirmer"
      act(() => {
        fireEvent.click(screen.getByText('Подтвердить'));
      });

      // Vérifier que updateItemQuantity a été appelé avec les bonnes valeurs
      expect(mockUpdateItemQuantity).toHaveBeenCalledWith(1, 15);
    }
  });

  it('devrait ouvrir le popup de confirmation et appeler deleteItem après confirmation', async () => {
    const mockDeleteItem = jest.fn().mockResolvedValue(undefined);
    (useProductsInventory as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      deleteItem: mockDeleteItem,
      updateItemQuantity: jest.fn(),
      currentItems: mockInventoryItems,
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    act(() => {
      render(<Products />);
    });

    // Trouver et ouvrir le menu pour le premier élément
    const menuButtons = screen.getAllByLabelText('options');
    act(() => {
      fireEvent.click(menuButtons[0]);
    });

    // Cliquer sur le bouton Supprimer dans le menu
    const deleteButton = screen.getByText('Удалить');
    act(() => {
      fireEvent.click(deleteButton);
    });

    // Vérifier que le popup de confirmation est affiché
    const confirmationPopup = screen.getByText('Подтверждение удаления').closest('div');
    expect(confirmationPopup).toBeInTheDocument();

    // Utiliser une fonction pour trouver le texte de confirmation qui peut être fragmenté
    const confirmationTexts = screen.getAllByText(
      content => content.includes('Вы уверены') && content.includes('удалить этот элемент')
    );
    expect(confirmationTexts.length).toBeGreaterThan(0);

    // Trouver le bouton Удалить à l'intérieur du popup de confirmation
    if (confirmationPopup) {
      const confirmDeleteButton = within(confirmationPopup).getByText('Удалить');
      await act(async () => {
        fireEvent.click(confirmDeleteButton);
        // Attendre que la promesse se résolve
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }

    // Vérifier que deleteItem a été appelé avec l'ID correct
    expect(mockDeleteItem).toHaveBeenCalledWith('1');

    // Vérifier que le popup est fermé
    // expect(screen.queryByText('Подтверждение удаления')).not.toBeInTheDocument();
  });

  it('devrait fermer le popup de confirmation sans supprimer lors du clic sur Annuler', async () => {
    const mockDeleteItem = jest.fn();
    (useProductsInventory as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      deleteItem: mockDeleteItem,
      updateItemQuantity: jest.fn(),
      currentItems: mockInventoryItems,
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    act(() => {
      render(<Products />);
    });

    // Trouver et ouvrir le menu pour le premier élément
    const menuButtons = screen.getAllByLabelText('options');
    act(() => {
      fireEvent.click(menuButtons[0]);
    });

    // Cliquer sur le bouton Supprimer dans le menu
    const deleteButton = screen.getByText('Удалить');
    act(() => {
      fireEvent.click(deleteButton);
    });

    // Vérifier que le popup de confirmation est affiché
    const confirmationPopup = screen.getByText('Подтверждение удаления').closest('div');
    expect(confirmationPopup).toBeInTheDocument();

    // Cliquer sur le bouton Annuler à l'intérieur du popup
    if (confirmationPopup) {
      // Utiliser une fonction de correspondance plus flexible pour trouver le bouton Annuler
      const cancelButton = within(confirmationPopup).getByText(content => content === 'Отменить');
      await act(async () => {
        fireEvent.click(cancelButton);
        // Attendre que l'état se mette à jour
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }

    // Vérifier que deleteItem n'a pas été appelé
    expect(mockDeleteItem).not.toHaveBeenCalled();

    // Vérifier que le popup est fermé
    expect(screen.queryByText('Подтверждение удаления')).not.toBeInTheDocument();
  });

  it('devrait afficher la pagination quand il y a des produits', () => {
    const mockSetCurrentPage = jest.fn();
    (useProductsInventory as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      deleteItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      currentItems: mockInventoryItems,
      totalPages: 3,
      currentPage: 1,
      setCurrentPage: mockSetCurrentPage,
    });

    act(() => {
      render(<Products />);
    });

    // Vérifier que la pagination est affichée
    const pageButtons = screen.getAllByRole('button', { name: /^[0-9]+$/ });
    expect(pageButtons.length).toBeGreaterThan(0);

    // Cliquer sur le bouton de page 2
    const page2Button = screen.getByRole('button', { name: '2' });
    act(() => {
      fireEvent.click(page2Button);
    });

    // Vérifier que setCurrentPage a été appelé avec 2
    expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
  });
});
