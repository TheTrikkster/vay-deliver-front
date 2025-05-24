import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTagModal from './AddTagModal';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn(), language: 'en' },
  }),
}));

describe('AddTagModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn(() => Promise.resolve());
  const defaultProps = {
    isOpen: true as const,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<AddTagModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('title')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<AddTagModal {...defaultProps} />);
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
    expect(screen.getByText('confirm')).toBeInTheDocument();
  });

  it('should update textarea on user input', async () => {
    render(<AddTagModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('placeholder');
    await userEvent.type(textarea, 'Hi');
    expect(textarea).toHaveValue('Hi');
  });

  it('should disable confirm when input less than 2 chars', async () => {
    render(<AddTagModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('placeholder');
    const confirmButton = screen.getByText('confirm');
    expect(confirmButton).toBeDisabled();
    await userEvent.type(textarea, 'A');
    expect(confirmButton).toBeDisabled();
    await userEvent.type(textarea, 'B');
    expect(confirmButton).not.toBeDisabled();
  });

  it('should call onClose when cancel clicked', () => {
    render(<AddTagModal {...defaultProps} />);
    fireEvent.click(screen.getByText('cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm with orderId and then onClose on success', async () => {
    render(<AddTagModal {...defaultProps} orderId="123" />);
    const textarea = screen.getByPlaceholderText('placeholder');
    const confirmButton = screen.getByText('confirm');

    await userEvent.type(textarea, 'TagX');
    await userEvent.click(confirmButton);

    await waitFor(() => expect(mockOnConfirm).toHaveBeenCalledWith('TagX', ['123']));
    await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1));
  });

  it('should call onConfirm with selectedOrderIds and then onClose on success', async () => {
    render(<AddTagModal {...defaultProps} selectedOrderIds={['a', 'b']} />);
    const textarea = screen.getByPlaceholderText('placeholder');
    const confirmButton = screen.getByText('confirm');

    await userEvent.type(textarea, 'TagY');
    await userEvent.click(confirmButton);

    await waitFor(() => expect(mockOnConfirm).toHaveBeenCalledWith('TagY', ['a', 'b']));
    await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1));
  });

  it('should clear textarea and close modal on success', async () => {
    render(<AddTagModal {...defaultProps} orderId="1" />);
    const textarea = screen.getByPlaceholderText('placeholder');
    const confirmButton = screen.getByText('confirm');

    await userEvent.type(textarea, 'OK');
    await userEvent.click(confirmButton);

    await waitFor(() => expect(textarea).toHaveValue(''));
    await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1));
  });

  it('should not close modal and keep textarea on onConfirm error', async () => {
    const errorConfirm = jest.fn(() => Promise.reject(new Error('fail')));
    render(<AddTagModal {...defaultProps} onConfirm={errorConfirm} orderId="1" />);
    const textarea = screen.getByPlaceholderText('placeholder');
    const confirmButton = screen.getByText('confirm');

    await userEvent.type(textarea, 'Err');
    await userEvent.click(confirmButton);

    // wait for handleConfirm to process
    await waitFor(() => expect(errorConfirm).toHaveBeenCalled());
    expect(mockOnClose).toHaveBeenCalledTimes(0);
    expect(textarea).toHaveValue('Err');
  });
});
