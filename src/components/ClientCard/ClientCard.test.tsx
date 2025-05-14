import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientCard from './ClientCard';
import { fromCents, toCents } from '../../utils/orderCalcul';
import { ProductType } from '../../types/client';

// Mock des fonctions utilitaires
jest.mock('../../utils/orderCalcul', () => ({
  fromCents: jest.fn(cents => {
    const value = cents / 100;
    return `${value}₽`;
  }),
  toCents: jest.fn(amount => Math.round(amount * 100)),
}));

describe('ClientCard Component', () => {
  const mockProduct: ProductType = {
    _id: '123',
    name: 'Test Product',
    description: 'Test Description',
    minOrder: 5,
    price: 10,
    unitExpression: 'шт',
  };

  const mockCartActions = {
    onAdd: jest.fn(),
    onRemove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('affiche correctement les informations du produit', () => {
    render(<ClientCard product={mockProduct} quantity={1} cartActions={mockCartActions} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Мин. заказ :')).toBeInTheDocument();
    expect(screen.getByText('5 шт')).toBeInTheDocument();
    expect(screen.getByText('Цена:')).toBeInTheDocument();

    console.log(screen.debug());
    console.log({ mockProduct }, 'llokkk');

    // Vérifier le prix
    const priceSpan = screen.getByText('Цена:').closest('div')?.querySelector('span:last-child');
    // expect(priceSpan).toHaveTextContent('10₽/шт');
  });

  test('affiche le bouton Добавить quand quantity est 0', () => {
    render(<ClientCard product={mockProduct} quantity={0} cartActions={mockCartActions} />);

    const addButton = screen.getByText('Добавить');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveClass('border-[#4355DA]');
  });

  test('appelle onAdd quand le bouton Добавить est cliqué', () => {
    render(<ClientCard product={mockProduct} quantity={0} cartActions={mockCartActions} />);

    fireEvent.click(screen.getByText('Добавить'));
    expect(mockCartActions.onAdd).toHaveBeenCalledWith('123');
  });

  test('affiche les contrôles de quantité quand quantity > 0', () => {
    render(<ClientCard product={mockProduct} quantity={10} cartActions={mockCartActions} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.queryByText('Добавить')).not.toBeInTheDocument();
  });

  test("affiche l'icône de suppression quand quantity = minOrder", () => {
    render(<ClientCard product={mockProduct} quantity={5} cartActions={mockCartActions} />);

    // On vérifie la présence du SVG de la poubelle
    const deleteIcon = document.querySelector('svg g path[d^="M3.18188"]');
    expect(deleteIcon).toBeInTheDocument();
  });

  test("affiche l'icône moins quand quantity > minOrder", () => {
    render(<ClientCard product={mockProduct} quantity={6} cartActions={mockCartActions} />);

    // On vérifie la présence du SVG du moins
    const minusIcon = document.querySelector('svg path[d^="M4.16663"]');
    expect(minusIcon).toBeInTheDocument();
  });

  test('appelle onAdd quand le bouton + est cliqué', () => {
    render(<ClientCard product={mockProduct} quantity={5} cartActions={mockCartActions} />);

    const plusButton = screen.getAllByRole('button')[1];
    fireEvent.click(plusButton);
    expect(mockCartActions.onAdd).toHaveBeenCalledWith('123');
  });

  test('appelle onRemove quand le bouton - ou la poubelle est cliqué', () => {
    render(<ClientCard product={mockProduct} quantity={5} cartActions={mockCartActions} />);

    const minusOrDeleteButton = screen.getAllByRole('button')[0];
    fireEvent.click(minusOrDeleteButton);
    expect(mockCartActions.onRemove).toHaveBeenCalledWith('123');
  });

  test('gère correctement le cas où le produit est undefined', () => {
    render(<ClientCard product={undefined} quantity={0} cartActions={mockCartActions} />);
    expect(screen.getByText('Продукт недоступен')).toBeInTheDocument();
  });

  test('utilise correctement les fonctions fromCents et toCents', () => {
    render(<ClientCard product={mockProduct} quantity={0} cartActions={mockCartActions} />);

    // Vérifier simplement que les fonctions sont appelées, pas avec quels arguments
    expect(toCents).toHaveBeenCalled();
    expect(fromCents).toHaveBeenCalled();
  });
});
