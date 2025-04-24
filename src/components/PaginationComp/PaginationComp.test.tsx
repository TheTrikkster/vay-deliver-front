// import { renderHook, act } from '@testing-library/react-hooks';
import { render, fireEvent, screen } from '@testing-library/react';
import Pagination from './PaginationComp';
// import { usePagination } from '../../utils/deliveries';

// describe('Hook usePagination', () => {
//   const mockItems = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

//   test('initialise avec la page 1 par défaut', () => {
//     const { result } = renderHook(() => usePagination(mockItems, 5));

//     expect(result.current.currentPage).toBe(1);
//     expect(result.current.totalPages).toBe(5);
//     expect(result.current.currentItems.length).toBe(5);
//     expect(result.current.currentItems[0].id).toBe(1);
//     expect(result.current.currentItems[4].id).toBe(5);
//   });

//   test('calcule correctement le nombre total de pages', () => {
//     const { result } = renderHook(() => usePagination(mockItems, 10));
//     expect(result.current.totalPages).toBe(3);

//     const { result: result2 } = renderHook(() => usePagination(mockItems, 7));
//     expect(result2.current.totalPages).toBe(4);

//     const { result: result3 } = renderHook(() => usePagination([], 5));
//     expect(result3.current.totalPages).toBe(0);
//   });

//   test('permet de naviguer vers une page spécifique', () => {
//     const { result } = renderHook(() => usePagination(mockItems, 5));

//     act(() => {
//       result.current.goToPage(3);
//     });

//     expect(result.current.currentPage).toBe(3);
//     expect(result.current.currentItems.length).toBe(5);
//     expect(result.current.currentItems[0].id).toBe(11);
//     expect(result.current.currentItems[4].id).toBe(15);
//   });

//   test('limite la navigation aux pages valides', () => {
//     const { result } = renderHook(() => usePagination(mockItems, 5));

//     act(() => {
//       result.current.goToPage(0);
//     });
//     expect(result.current.currentPage).toBe(1); // Ne descend pas en dessous de 1

//     act(() => {
//       result.current.goToPage(10);
//     });
//     expect(result.current.currentPage).toBe(5); // Ne dépasse pas totalPages
//   });

//   test('permet de modifier directement la page courante', () => {
//     const { result } = renderHook(() => usePagination(mockItems, 5));

//     act(() => {
//       result.current.setCurrentPage(4);
//     });

//     expect(result.current.currentPage).toBe(4);
//     expect(result.current.currentItems[0].id).toBe(16);
//   });

//   test('gère correctement la dernière page partiellement remplie', () => {
//     const { result } = renderHook(() => usePagination(mockItems, 10));

//     act(() => {
//       result.current.goToPage(3);
//     });

//     expect(result.current.currentItems.length).toBe(5); // Dernière page avec 5 éléments sur 10
//   });

//   test('retourne les indices corrects des premiers et derniers éléments', () => {
//     const { result } = renderHook(() => usePagination(mockItems, 5));

//     expect(result.current.indexOfFirstItem).toBe(0);
//     expect(result.current.indexOfLastItem).toBe(5);

//     act(() => {
//       result.current.goToPage(3);
//     });

//     expect(result.current.indexOfFirstItem).toBe(10);
//     expect(result.current.indexOfLastItem).toBe(15);
//   });

//   test('gère correctement un tableau vide', () => {
//     const { result } = renderHook(() => usePagination([], 5));

//     expect(result.current.currentPage).toBe(1);
//     expect(result.current.totalPages).toBe(0);
//     expect(result.current.currentItems.length).toBe(0);
//   });
// });

describe('Composant Pagination', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  test('affiche correctement les boutons de pagination', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    expect(screen.getByText('Précédent')).toBeInTheDocument();
    expect(screen.getByText('Suivant')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(7); // 5 pages + Précédent/Suivant
  });

  test('désactive le bouton Précédent sur la première page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

    expect(screen.getByText('Précédent')).toBeDisabled();
    expect(screen.getByText('Suivant')).not.toBeDisabled();
  });

  test('désactive le bouton Suivant sur la dernière page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);

    expect(screen.getByText('Précédent')).not.toBeDisabled();
    expect(screen.getByText('Suivant')).toBeDisabled();
  });

  test('appelle onPageChange avec la bonne page lors du clic', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    fireEvent.click(screen.getByText('4'));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);

    fireEvent.click(screen.getByText('Précédent'));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByText('Suivant'));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  test('met en surbrillance la page courante', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('bg-blue-500');
    expect(currentPageButton).toHaveClass('text-white');
  });
});
