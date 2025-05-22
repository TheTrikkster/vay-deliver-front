import React from 'react';
import { render, screen } from '@testing-library/react';
import OrderCard from './OrderCard';
import { OrderStatus } from '../../types/order';

describe('OrderCard', () => {
  const defaultProps = {
    firstName: 'Jean',
    lastName: 'Dupont',
    status: 'ACTIVE' as OrderStatus,
    address: '123 Rue de Paris',
    distance: '5 km',
    tagNames: ['Urgent', 'Livraison'],
    products: [],
  };

  test('devrait rendre le composant correctement', () => {
    render(<OrderCard {...defaultProps} />);
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  test('devrait afficher le nom complet', () => {
    render(<OrderCard {...defaultProps} />);
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  test("devrait afficher l'adresse correctement", () => {
    render(<OrderCard {...defaultProps} />);
    expect(screen.getByText('123 Rue de Paris')).toBeInTheDocument();
  });

  test('devrait afficher tous les tags fournis', () => {
    render(<OrderCard {...defaultProps} />);
    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('Livraison')).toBeInTheDocument();
  });

  test('devrait fonctionner avec un tableau de tags vide', () => {
    render(<OrderCard {...defaultProps} tagNames={[]} />);
    // Vérifie qu'aucune exception n'est levée et que le composant se rend
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  test('devrait avoir la classe de style appropriée pour la carte', () => {
    const { container } = render(<OrderCard {...defaultProps} />);
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('bg-white');
    expect(cardElement).toHaveClass('rounded-xl');
    expect(cardElement).toHaveClass('shadow-md');
  });

  test("devrait rendre l'icône de localisation", () => {
    const { container } = render(<OrderCard {...defaultProps} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });
});
