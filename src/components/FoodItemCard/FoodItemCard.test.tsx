import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FoodItemCard, { roundToDecimal } from './FoodItemCard';
import { InventoryProduct } from '../../types/product';

describe('Fonction roundToDecimal', () => {
  test('arrondit correctement à une décimale par défaut', () => {
    expect(roundToDecimal(1.23)).toBe(1.2);
    expect(roundToDecimal(1.25)).toBe(1.3);
    expect(roundToDecimal(1.249)).toBe(1.2);
  });

  test('arrondit correctement avec un nombre spécifique de décimales', () => {
    expect(roundToDecimal(1.234, 2)).toBe(1.23);
    expect(roundToDecimal(1.235, 2)).toBe(1.24);
    expect(roundToDecimal(1.5678, 3)).toBe(1.568);
  });
});

describe('Composant FoodItemCard', () => {
  const mockFood: InventoryProduct = {
    id: 1,
    name: 'Pommes',
    prix: '2.50€',
    quantity: '3',
    unit: 'kg',
  };

  const mockProps = {
    food: mockFood,
    toggleItem: jest.fn(),
    toggleMenu: jest.fn(),
    handleDelete: jest.fn(),
    isMenuOpen: false,
    menuRef: React.createRef<HTMLDivElement>(),
    openQuantityPopup: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("affiche correctement les informations de l'aliment", () => {
    render(<FoodItemCard {...mockProps} />);

    expect(screen.getByText('Pommes')).toBeInTheDocument();
    expect(screen.getByText('2.50€/kg | 5 шт мин')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('appelle toggleMenu lorsque le bouton de menu est cliqué', () => {
    render(<FoodItemCard {...mockProps} />);

    const menuButton = screen.getByLabelText('Options');
    fireEvent.click(menuButton);

    expect(mockProps.toggleMenu).toHaveBeenCalledWith(mockFood.id, expect.any(Object));
  });

  test('affiche le menu contextuel lorsque isMenuOpen est true', () => {
    render(<FoodItemCard {...mockProps} isMenuOpen={true} />);

    expect(screen.getByText('Modifier')).toBeInTheDocument();
    expect(screen.getByText('Supprimer')).toBeInTheDocument();
  });

  test("n'affiche pas le menu contextuel lorsque isMenuOpen est false", () => {
    render(<FoodItemCard {...mockProps} isMenuOpen={false} />);

    expect(screen.queryByText('Modifier')).not.toBeInTheDocument();
    expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
  });

  test('appelle handleDelete lorsque le bouton Supprimer est cliqué', () => {
    render(<FoodItemCard {...mockProps} isMenuOpen={true} />);

    const deleteButton = screen.getByText('Supprimer');
    fireEvent.click(deleteButton);

    expect(mockProps.handleDelete).toHaveBeenCalledWith(mockFood.id, expect.any(Object));
  });

  test('appelle openQuantityPopup lorsque la zone de quantité est cliquée', () => {
    render(<FoodItemCard {...mockProps} />);

    const quantityField = screen.getByLabelText('Quantité');
    fireEvent.click(quantityField.parentElement!);

    expect(mockProps.openQuantityPopup).toHaveBeenCalledWith(
      mockFood.id,
      parseInt(mockFood.quantity)
    );
  });

  test("a les classes CSS appropriées pour l'apparence", () => {
    const { container } = render(<FoodItemCard {...mockProps} />);

    const cardContainer = container.firstChild as HTMLElement;
    expect(cardContainer).toHaveClass('w-11/12');
    expect(cardContainer).toHaveClass('md:w-3/4');
    expect(cardContainer).toHaveClass('bg-white');
    expect(cardContainer).toHaveClass('rounded-3xl');
  });
});
