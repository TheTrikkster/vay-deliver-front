import { act } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import Toast from './Toast';

jest.useFakeTimers();

describe('Toast component', () => {
  afterEach(() => {
    jest.clearAllTimers();
    cleanup();
  });

  it('affiche le message fourni', () => {
    render(<Toast message="Test message" onClose={jest.fn()} duration={5000} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('appelle onClose après la durée par défaut (3000ms)', () => {
    const onClose = jest.fn();
    render(<Toast message="Hello" onClose={onClose} />);

    // Avant 3000ms, onClose ne doit pas avoir été appelé
    act(() => {
      jest.advanceTimersByTime(2999);
    });
    expect(onClose).not.toHaveBeenCalled();

    // Après 3000ms, onClose doit être appelé une fois
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('appelle onClose après la durée personnalisée', () => {
    const onClose = jest.fn();
    render(<Toast message="Custom" onClose={onClose} duration={1000} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('n’appelle pas onClose si le composant est démonté avant la fin du timer', () => {
    const onClose = jest.fn();
    const { unmount } = render(<Toast message="Bye" onClose={onClose} duration={2000} />);

    // démonter avant l’expiration
    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
