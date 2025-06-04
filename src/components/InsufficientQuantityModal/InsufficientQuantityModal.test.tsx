import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import InsufficientQuantityModal from './InsufficientQuantityModal';

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        modalTitle: 'Stock insuffisant',
        tableHeaderProduct: 'Produit',
        tableHeaderRequested: 'Demandé',
        tableHeaderAvailable: 'Disponible',
        orderPrompt: 'Commander la quantité disponible ?',
        cancel: 'Annuler',
        confirm: 'Confirmer',
      };
      return translations[key] || key;
    },
  }),
}));

describe('InsufficientQuantityModal', () => {
  const mockProducts = [
    {
      details: {
        productName: 'Produit A',
        requestedQuantity: 5,
        availableQuantity: 3,
        unit: 'kg',
      },
    },
    {
      details: {
        productName: 'Produit B',
        requestedQuantity: 2,
        availableQuantity: 0,
        unit: 'pcs',
      },
    },
  ];
  let onClose: jest.Mock;
  let onConfirm: jest.Mock;

  beforeEach(() => {
    onClose = jest.fn();
    onConfirm = jest.fn();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('affiche le titre du modal', () => {
    render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );
    expect(screen.getByText('Stock insuffisant')).toBeInTheDocument();
  });

  it('affiche les labels des quantités', () => {
    render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );
    expect(screen.getAllByText(/Demandé:/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Disponible:/).length).toBeGreaterThan(0);
  });

  it('rend correctement chaque produit avec quantités et unités', () => {
    render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );

    // Vérifier que les noms des produits sont affichés
    expect(screen.getByText('Produit A')).toBeInTheDocument();
    expect(screen.getByText('Produit B')).toBeInTheDocument();

    // Vérifier que les quantités sont affichées avec les bonnes unités
    expect(screen.getByText('5 kg')).toBeInTheDocument();
    expect(screen.getByText('3 kg')).toBeInTheDocument();
    expect(screen.getByText('2 pcs')).toBeInTheDocument();
    expect(screen.getByText('0 pcs')).toBeInTheDocument();
  });

  it('affiche le prompt de commande', () => {
    render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );
    expect(screen.getByText('Commander la quantité disponible ?')).toBeInTheDocument();
  });

  it('appelle onClose lorsque le bouton Annuler est cliqué', () => {
    render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );
    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('appelle onConfirm lorsque le bouton Confirmer est cliqué', () => {
    render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );
    fireEvent.click(screen.getByText('Confirmer'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('rend la structure modale en superposition', () => {
    const { container } = render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );
    expect(container.firstChild).toHaveClass('fixed inset-0 bg-black bg-opacity-50');
  });

  it('affiche les produits dans des cartes avec bordure', () => {
    render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );
    const productCards = screen.getAllByText(/Produit [AB]/).map(el => el.closest('.border'));
    expect(productCards).toHaveLength(2);
    productCards.forEach(card => {
      expect(card).toHaveClass('border', 'rounded-lg', 'p-4');
    });
  });
});
