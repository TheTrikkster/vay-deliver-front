import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTagModal from './AddTagModal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        title: 'Новая заметка',
        placeholder: 'Введите текст заметки',
        cancel: 'Отменить',
        confirm: 'Подтвердить',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ru',
    },
  }),
}));

describe('AddTagModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ne devrait pas rendre le modal quand isOpen est false', () => {
    render(<AddTagModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Новая заметка')).not.toBeInTheDocument();
  });

  test('devrait rendre le modal quand isOpen est true', () => {
    render(<AddTagModal {...defaultProps} />);
    expect(screen.getByText('Новая заметка')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите текст заметки')).toBeInTheDocument();
    expect(screen.getByText('Отменить')).toBeInTheDocument();
    expect(screen.getByText('Подтвердить')).toBeInTheDocument();
  });

  test("devrait mettre à jour le texte de la note quand l'utilisateur tape", async () => {
    render(<AddTagModal {...defaultProps} />);
    const textareaElement = screen.getByPlaceholderText('Введите текст заметки');
    await userEvent.type(textareaElement, 'Test note');
    expect(textareaElement).toHaveValue('Test note');
  });

  test('devrait appeler onClose quand le bouton Отменить est cliqué', () => {
    render(<AddTagModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Отменить'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('devrait appeler onConfirm avec le texte de la note quand le bouton Подтвердить est cliqué', async () => {
    render(<AddTagModal {...defaultProps} />);
    const textareaElement = screen.getByPlaceholderText('Введите текст заметки');
    await userEvent.type(textareaElement, 'Test note');

    fireEvent.click(screen.getByText('Подтвердить'));
    expect(mockOnConfirm).toHaveBeenCalledWith('Test note');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('devrait réinitialiser le texte de la note après confirmation', async () => {
    const { rerender } = render(<AddTagModal {...defaultProps} />);

    // Saisir du texte et confirmer
    const textareaElement = screen.getByPlaceholderText('Введите текст заметки');
    await userEvent.type(textareaElement, 'Test note');
    fireEvent.click(screen.getByText('Подтвердить'));

    // Simuler la réouverture du modal
    rerender(<AddTagModal {...defaultProps} isOpen={false} />);
    rerender(<AddTagModal {...defaultProps} isOpen={true} />);

    // Vérifier que le textarea est vide
    const newTextareaElement = screen.getByPlaceholderText('Введите текст заметки');
    expect(newTextareaElement).toHaveValue('');
  });

  test('devrait avoir les classes de style appropriées', () => {
    const { container } = render(<AddTagModal {...defaultProps} />);
    const modalElement = container.firstChild;
    expect(modalElement).toHaveClass('fixed');
    expect(modalElement).toHaveClass('inset-0');
    expect(modalElement).toHaveClass('bg-black');
    expect(modalElement).toHaveClass('bg-opacity-50');
  });
});
