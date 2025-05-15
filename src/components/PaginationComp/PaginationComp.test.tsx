import { render, fireEvent, screen } from '@testing-library/react';
import Pagination from './PaginationComp';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        previous: 'Предыдущий',
        next: 'Следующий',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ru',
    },
  }),
}));

describe('Composant Pagination', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  test('affiche correctement les boutons de pagination', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    expect(screen.getByText('Предыдущий')).toBeInTheDocument();
    expect(screen.getByText('Следующий')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(7); // 5 pages + Предыдущий/Следующий
  });

  test('désactive le bouton Предыдущий sur la première page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    expect(screen.getByText('Предыдущий')).toBeDisabled();
    expect(screen.getByText('Следующий')).not.toBeDisabled();
  });

  test('désactive le bouton Следующий sur la dernière page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);

    expect(screen.getByText('Предыдущий')).not.toBeDisabled();
    expect(screen.getByText('Следующий')).toBeDisabled();
  });

  test('appelle onPageChange avec la bonne page lors du clic', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    fireEvent.click(screen.getByText('4'));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByText('Предыдущий'));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByText('Следующий'));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  test('met en surbrillance la page courante', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('bg-blue-500');
    expect(currentPageButton).toHaveClass('text-white');
  });
});
