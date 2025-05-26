import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderStatus from './OrderStatus';
import { OrderStatus as OrderStatusType } from '../../types/order';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        active: 'Actif',
        completed: 'Terminé',
        canceled: 'Annulé',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'fr',
    },
  }),
}));

describe('OrderStatus Component', () => {
  describe('Rendu avec différents statuts', () => {
    test('affiche le statut ACTIVE avec le bon texte et les bonnes classes', () => {
      render(<OrderStatus status="ACTIVE" />);

      const statusElement = screen.getByTestId('order-status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveTextContent('Actif');
      expect(statusElement).toHaveClass('bg-green-50', 'text-green-500');
    });

    test('affiche le statut COMPLETED avec le bon texte et les bonnes classes', () => {
      render(<OrderStatus status="COMPLETED" />);

      const statusElement = screen.getByTestId('order-status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveTextContent('Terminé');
      expect(statusElement).toHaveClass('bg-gray-100', 'text-gray-500');
    });

    test('affiche le statut CANCELED avec le bon texte et les bonnes classes', () => {
      render(<OrderStatus status="CANCELED" />);

      const statusElement = screen.getByTestId('order-status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveTextContent('Annulé');
      expect(statusElement).toHaveClass('bg-red-50', 'text-red-500');
    });
  });

  describe('Classes CSS par défaut', () => {
    test('applique les classes CSS de base communes à tous les statuts', () => {
      render(<OrderStatus status="ACTIVE" />);

      const statusElement = screen.getByTestId('order-status');
      expect(statusElement).toHaveClass('px-3', 'py-1.5', 'rounded', 'text-sm');
    });

    test('applique la classe par défaut au conteneur', () => {
      const { container } = render(<OrderStatus status="ACTIVE" />);

      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv).toHaveClass('flex', 'justify-end', 'mb-5');
    });
  });

  describe('Prop className personnalisée', () => {
    test('utilise la className personnalisée fournie', () => {
      const customClassName = 'custom-class flex-start';
      const { container } = render(<OrderStatus status="ACTIVE" className={customClassName} />);

      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv).toHaveClass('custom-class', 'flex-start');
      expect(containerDiv).not.toHaveClass('flex', 'justify-end', 'mb-5');
    });

    test('fonctionne avec une className vide', () => {
      const { container } = render(<OrderStatus status="ACTIVE" className="" />);

      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv).toHaveAttribute('class', '');
    });
  });

  describe('Traductions i18n', () => {
    test('utilise les traductions pour chaque statut', () => {
      // Test ACTIVE
      const { rerender } = render(<OrderStatus status="ACTIVE" />);
      expect(screen.getByTestId('order-status')).toHaveTextContent('Actif');

      // Test COMPLETED
      rerender(<OrderStatus status="COMPLETED" />);
      expect(screen.getByTestId('order-status')).toHaveTextContent('Terminé');

      // Test CANCELED
      rerender(<OrderStatus status="CANCELED" />);
      expect(screen.getByTestId('order-status')).toHaveTextContent('Annulé');
    });
  });

  describe('Props optionnelles', () => {
    test('fonctionne sans prop className (utilise la valeur par défaut)', () => {
      const { container } = render(<OrderStatus status="ACTIVE" />);

      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv).toHaveClass('flex', 'justify-end', 'mb-5');
    });

    test('la prop status est obligatoire et fonctionne correctement', () => {
      // Ce test vérifie que le composant fonctionne avec chaque statut requis
      const statuses: OrderStatusType[] = ['ACTIVE', 'COMPLETED', 'CANCELED'];

      statuses.forEach(status => {
        const { unmount } = render(<OrderStatus status={status} />);
        const statusElement = screen.getByTestId('order-status');
        expect(statusElement).toBeInTheDocument();
        unmount();
      });
    });
  });
});
