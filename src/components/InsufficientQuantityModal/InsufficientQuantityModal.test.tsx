import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import InsufficientQuantityModal from './InsufficientQuantityModal';

// Mock useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        modalTitle: 'Quantité insuffisante',
        tableHeaderProduct: 'Produit',
        tableHeaderRequested: 'Demandé',
        tableHeaderAvailable: 'Disponible',
        orderPrompt: 'Que souhaitez-vous faire ?',
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
    expect(screen.getByText('Quantité insuffisante')).toBeInTheDocument();
  });

  it('affiche les en-têtes de la table', () => {
    render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );
    expect(screen.getByText('Produit')).toBeInTheDocument();
    expect(screen.getByText('Demandé')).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('rend correctement chaque produit avec quantités et unités', () => {
    render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );
    mockProducts.forEach(p => {
      const { productName, requestedQuantity, availableQuantity, unit } = p.details;
      const nameCell = screen.getByText(productName);
      const requestedCell = screen.getByText(new RegExp(`${requestedQuantity} ${unit}`));
      const availableCell = screen.getByText(new RegExp(`${availableQuantity} ${unit}`));
      expect(nameCell).toBeInTheDocument();
      expect(requestedCell).toBeInTheDocument();
      expect(availableCell).toBeInTheDocument();
    });
  });

  it('affiche le prompt de commande', () => {
    render(
      <InsufficientQuantityModal products={mockProducts} onClose={onClose} onConfirm={onConfirm} />
    );
    expect(screen.getByText('Que souhaitez-vous faire ?')).toBeInTheDocument();
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
    expect(container.firstChild).toHaveClass('fixed inset-0 bg-black bg-opacity-40');
  });
});
