import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';
import { InventoryProduct, ProductStatus } from '../../types/product';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        options: 'Опции',
        minOrder: 'мин',
        quantity: 'Количество',
        enable: 'Включить',
        disable: 'Отключить',
        modify: 'Изменять',
        delete: 'Удалить',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ru',
    },
  }),
}));

describe('Composant ProductCard', () => {
  const mockFood: InventoryProduct = {
    id: 1,
    name: 'Pommes',
    price: 2.5,
    availableQuantity: 3,
    unitExpression: 'kg',
    minOrder: 1,
    status: ProductStatus.ACTIVE,
  };

  const mockProps = {
    product: mockFood,
    toggleItem: jest.fn(),
    toggleCardMenu: jest.fn(),
    handleDelete: jest.fn(),
    isCardMenuOpen: false,
    menuRef: React.createRef<HTMLDivElement>(),
    openQuantityPopup: jest.fn(),
    updateItemStatus: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("affiche correctement les informations de l'aliment", () => {
    render(<ProductCard {...mockProps} />);

    expect(screen.getByText('Pommes')).toBeInTheDocument();

    // Modifier la façon de vérifier le texte
    const priceElement = screen.getByText(/2.5€\/kg/);
    expect(priceElement).toBeInTheDocument();
    expect(priceElement.textContent).toContain('1');
    expect(priceElement.textContent).toContain('мин');

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('appelle toggleCardMenu lorsque le bouton de menu est cliqué', () => {
    render(<ProductCard {...mockProps} />);

    const menuButton = screen.getByLabelText('Опции');
    fireEvent.click(menuButton);

    expect(mockProps.toggleCardMenu).toHaveBeenCalledWith(mockFood.id, expect.any(Object));
  });

  test('affiche le menu contextuel lorsque isCardMenuOpen est true', () => {
    render(<ProductCard {...mockProps} isCardMenuOpen={true} />);

    expect(screen.getByText('Изменять')).toBeInTheDocument();
    expect(screen.getByText('Удалить')).toBeInTheDocument();
  });

  test("n'affiche pas le menu contextuel lorsque isCardMenuOpen est false", () => {
    render(<ProductCard {...mockProps} isCardMenuOpen={false} />);

    expect(screen.queryByText('Изменять')).not.toBeInTheDocument();
    expect(screen.queryByText('Удалить')).not.toBeInTheDocument();
  });

  test('appelle handleDelete lorsque le bouton Supprimer est cliqué', () => {
    render(<ProductCard {...mockProps} isCardMenuOpen={true} />);

    const deleteButton = screen.getByText('Удалить');
    fireEvent.click(deleteButton);

    expect(mockProps.handleDelete).toHaveBeenCalledWith(mockFood.id, expect.any(Object));
  });

  test('appelle openQuantityPopup lorsque la zone de quantité est cliquée', () => {
    render(<ProductCard {...mockProps} />);

    const quantityField = screen.getByLabelText('Количество');
    fireEvent.click(quantityField.parentElement!);

    expect(mockProps.openQuantityPopup).toHaveBeenCalledWith(
      mockFood.id,
      mockFood.availableQuantity
    );
  });

  test("a les classes CSS appropriées pour l'apparence", () => {
    const { container } = render(<ProductCard {...mockProps} />);

    const cardContainer = container.firstChild as HTMLElement;
    expect(cardContainer).toHaveClass('w-11/12');
    expect(cardContainer).toHaveClass('md:w-2/4');
    expect(cardContainer).toHaveClass('bg-white');
    expect(cardContainer).toHaveClass('rounded-3xl');
  });
});
