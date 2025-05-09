jest.mock('../../hooks/useProductsInventory');
jest.mock('../../hooks/useOutsideClick');
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

import { render, screen, fireEvent, within } from '@testing-library/react';
import AdminProducts from './AdminProducts';
import { useProductsInventory } from '../../hooks/useProductsInventory';

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

describe('AdminProducts', () => {
  beforeEach(() => {
    // Configuration par défaut du mock pour useProductsInventory
    (useProductsInventory as jest.Mock).mockReturnValue({
      inventoryItems: mockInventoryItems,
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
    render(<AdminProducts />);

    expect(screen.getByText('Pommes')).toBeInTheDocument();
    expect(screen.getByText('29.99₽/piece | 1 шт мин')).toBeInTheDocument();
    expect(screen.getByText(20)).toBeInTheDocument();
  });

  it("devrait afficher un message lorsqu'aucun produit n'est disponible", () => {
    (useProductsInventory as jest.Mock).mockReturnValue({
      inventoryItems: [],
      loading: false,
      error: null,
      deleteItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      currentItems: [],
      totalPages: 0,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    render(<AdminProducts />);

    expect(screen.getByText('Вы должны добавить продукт')).toBeInTheDocument();
    expect(screen.getByText('Добавить продукт')).toBeInTheDocument();
  });

  it('devrait afficher un indicateur de chargement', () => {
    (useProductsInventory as jest.Mock).mockReturnValue({
      inventoryItems: [],
      loading: true,
      error: null,
      deleteItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      currentItems: [],
      totalPages: 0,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    render(<AdminProducts />);

    // Trouver le spinner par sa classe et non par le rôle
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
  });

  it("devrait afficher un message d'erreur", () => {
    (useProductsInventory as jest.Mock).mockReturnValue({
      inventoryItems: [],
      loading: false,
      error: 'Erreur lors du chargement des données',
      deleteItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      currentItems: [],
      totalPages: 0,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    render(<AdminProducts />);

    expect(screen.getByText('Erreur lors du chargement des données')).toBeInTheDocument();
  });

  it('devrait ouvrir et fermer le popup de modification de quantité', async () => {
    const mockUpdateItemQuantity = jest.fn();

    (useProductsInventory as jest.Mock).mockReturnValue({
      inventoryItems: mockInventoryItems,
      loading: false,
      error: null,
      deleteItem: jest.fn(),
      updateItemQuantity: mockUpdateItemQuantity,
      currentItems: mockInventoryItems,
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    render(<AdminProducts />);

    // Simulons l'appel à openQuantityPopup
    const instance = screen.getByText('Pommes').closest('div');
    const quantityField = instance?.querySelector('[aria-label="Quantité"]');

    // Si quantityField est trouvé, cliquez dessus pour ouvrir le popup
    if (quantityField && quantityField.parentElement) {
      fireEvent.click(quantityField.parentElement);

      // Vérifier que le popup est ouvert
      expect(screen.getByText('Modifier la quantité')).toBeInTheDocument();

      // Modifier la valeur
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '15' } });

      // Cliquer sur "Mettre à jour"
      fireEvent.click(screen.getByText('Mettre à jour'));

      // Vérifier que updateItemQuantity a été appelé avec les bonnes valeurs
      expect(mockUpdateItemQuantity).toHaveBeenCalledWith(1, '15');

      // Vérifier que le popup est fermé
      expect(screen.queryByText('Modifier la quantité')).not.toBeInTheDocument();
    }
  });

  it('devrait ouvrir le popup de confirmation et appeler deleteItem après confirmation', () => {
    const mockDeleteItem = jest.fn();
    (useProductsInventory as jest.Mock).mockReturnValue({
      inventoryItems: mockInventoryItems,
      loading: false,
      error: null,
      deleteItem: mockDeleteItem,
      updateItemQuantity: jest.fn(),
      currentItems: mockInventoryItems,
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    render(<AdminProducts />);

    // Trouver et ouvrir le menu pour le premier élément
    const menuButtons = screen.getAllByLabelText('Options');
    fireEvent.click(menuButtons[0]);

    // Cliquer sur le bouton Supprimer dans le menu
    const deleteButton = screen.getByText('Удалить');
    fireEvent.click(deleteButton);

    // Vérifier que le popup de confirmation est affiché
    const confirmationPopup = screen.getByText('Подтверждение удаления').closest('div');
    expect(confirmationPopup).toBeInTheDocument();
    expect(screen.getByText('Вы уверены, что хотите удалить этот элемент ?')).toBeInTheDocument();

    // Trouver le bouton Удалить à l'intérieur du popup de confirmation
    if (confirmationPopup) {
      const confirmDeleteButton = within(confirmationPopup).getByText('Удалить');
      fireEvent.click(confirmDeleteButton);
    }

    // Vérifier que deleteItem a été appelé avec l'ID correct
    expect(mockDeleteItem).toHaveBeenCalledWith('1');

    // Vérifier que le popup est fermé
    expect(screen.queryByText('Confirmation de suppression')).not.toBeInTheDocument();
  });

  it('devrait fermer le popup de confirmation sans supprimer lors du clic sur Annuler', () => {
    const mockDeleteItem = jest.fn();
    (useProductsInventory as jest.Mock).mockReturnValue({
      inventoryItems: mockInventoryItems,
      loading: false,
      error: null,
      deleteItem: mockDeleteItem,
      updateItemQuantity: jest.fn(),
      currentItems: mockInventoryItems,
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: jest.fn(),
    });

    render(<AdminProducts />);

    // Trouver et ouvrir le menu pour le premier élément
    const menuButtons = screen.getAllByLabelText('Options');
    fireEvent.click(menuButtons[0]);

    // Cliquer sur le bouton Supprimer dans le menu
    const deleteButton = screen.getByText('Удалить');
    fireEvent.click(deleteButton);

    // Vérifier que le popup de confirmation est affiché
    const confirmationPopup = screen.getByText('Подтверждение удаления').closest('div');
    expect(confirmationPopup).toBeInTheDocument();

    // Cliquer sur le bouton Annuler à l'intérieur du popup
    if (confirmationPopup) {
      const cancelButton = within(confirmationPopup).getByText('Отмена');
      fireEvent.click(cancelButton);
    }

    // Vérifier que deleteItem n'a pas été appelé
    expect(mockDeleteItem).not.toHaveBeenCalled();

    // Vérifier que le popup est fermé
    expect(screen.queryByText('Подтверждение удаления')).not.toBeInTheDocument();
  });

  it('devrait afficher la pagination quand il y a des produits', () => {
    const mockSetCurrentPage = jest.fn();
    (useProductsInventory as jest.Mock).mockReturnValue({
      inventoryItems: mockInventoryItems,
      loading: false,
      error: null,
      deleteItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      currentItems: mockInventoryItems,
      totalPages: 3,
      currentPage: 1,
      setCurrentPage: mockSetCurrentPage,
    });

    render(<AdminProducts />);

    // Vérifier que la pagination est affichée
    const pageButtons = screen.getAllByRole('button', { name: /^[0-9]+$/ });
    expect(pageButtons.length).toBeGreaterThan(0);

    // Cliquer sur le bouton de page 2
    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);

    // Vérifier que setCurrentPage a été appelé avec 2
    expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
  });
});
