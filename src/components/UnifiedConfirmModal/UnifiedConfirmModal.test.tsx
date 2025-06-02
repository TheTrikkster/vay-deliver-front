import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import UnifiedConfirmModal from './UnifiedConfirmModal';

// Mock des traductions
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        cancel: 'Annuler',
        confirm: 'Confirmer',
        loading: 'Chargement...',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  title: 'Test Title',
  message: 'Test Message',
};

describe('UnifiedConfirmModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ne doit pas s'afficher quand isOpen est false", () => {
    render(<UnifiedConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('doit afficher le titre et le message', () => {
    render(<UnifiedConfirmModal {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('doit appeler onClose quand on clique sur Annuler', () => {
    const onClose = jest.fn();
    render(<UnifiedConfirmModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('doit appeler onConfirm quand on clique sur Confirmer', () => {
    const onConfirm = jest.fn();
    render(<UnifiedConfirmModal {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText('Confirmer'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('doit afficher le variant danger avec les bonnes couleurs', () => {
    render(<UnifiedConfirmModal {...defaultProps} variant="danger" />);

    const confirmButton = screen.getByText('Confirmer');
    expect(confirmButton).toHaveClass('bg-red-500');
  });

  it('doit afficher le spinner et désactiver les boutons pendant le loading', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    render(
      <UnifiedConfirmModal
        {...defaultProps}
        isLoading={true}
        loadingText="Suppression..."
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    // Vérifier la présence du texte de loading
    expect(screen.getByText('Suppression...')).toBeInTheDocument();

    // Vérifier que les boutons sont désactivés
    const cancelButton = screen.getByText('Annuler');
    const confirmButton = screen.getByText('Suppression...').closest('button');

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();

    // Tenter de cliquer ne doit rien faire
    fireEvent.click(cancelButton);
    fireEvent.click(confirmButton!);

    expect(onClose).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('doit utiliser les textes personnalisés quand fournis', () => {
    render(
      <UnifiedConfirmModal
        {...defaultProps}
        cancelText="Custom Cancel"
        confirmText="Custom Confirm"
      />
    );

    expect(screen.getByText('Custom Cancel')).toBeInTheDocument();
    expect(screen.getByText('Custom Confirm')).toBeInTheDocument();
  });
});
