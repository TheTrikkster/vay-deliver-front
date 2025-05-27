import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

jest.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

jest.mock('../../hooks/useAutocomplete', () => ({
  useAutocomplete: (input: string) => {
    if (input === 'load') {
      return { predictions: [], isLoading: true, error: false };
    }
    if (input === 'err') {
      return { predictions: [], isLoading: false, error: true };
    }
    return {
      predictions: [
        { placeId: 'id1', text: 'Paris, France' },
        { placeId: 'id2', text: 'Paris, Texas' },
      ],
      isLoading: false,
      error: false,
    };
  },
}));

jest.mock('react-places-autocomplete', () => ({
  __esModule: true,
  geocodeByPlaceId: jest
    .fn()
    .mockResolvedValue([{ formatted_address: 'Paris, Île-de-France, France' }]),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { geocodeByPlaceId } from 'react-places-autocomplete';
import { AddressInput } from './AddressInput';

describe('AddressInput', () => {
  let onSelect: jest.Mock;

  beforeEach(() => {
    onSelect = jest.fn();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it("n'affiche pas de suggestions quand l'input est vide", () => {
    render(<AddressInput onSelect={onSelect} />);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('affiche les suggestions après saisie', async () => {
    render(<AddressInput onSelect={onSelect} inputProps={{ placeholder: 'Search' }} />);
    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'Paris' } });

    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Paris, France');
    expect(options[1]).toHaveTextContent('Paris, Texas');
  });

  //   it('appelle onSelect et met à jour l’input après sélection', async () => {
  //     render(<AddressInput onSelect={onSelect} />);
  //     const input = screen.getByRole('textbox');
  //     fireEvent.change(input, { target: { value: 'Paris' } });

  //     const options = await screen.findAllByRole('option');
  //     expect(options).toHaveLength(2);

  //     // on clique et on attend la résolution de la promesse de geocodeByPlaceId
  //     fireEvent.click(options[0]);
  //     await waitFor(() => {
  //       expect(geocodeByPlaceId).toHaveBeenCalledWith('id1');
  //       expect(onSelect).toHaveBeenCalledWith('Paris, Île-de-France, France');
  //     });

  //     // Vérifie que l’input a bien été mis à jour et que la liste est fermée
  //     expect(input).toHaveValue('Paris, Île-de-France, France');
  //     expect(screen.queryByRole('listbox')).toBeNull();
  //   });

  it("affiche 'loading' quand isLoading est vrai", () => {
    render(<AddressInput onSelect={onSelect} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'load' } });
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it("affiche 'error' quand error est vrai", () => {
    render(<AddressInput onSelect={onSelect} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'err' } });
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('ferme les suggestions au clic en dehors', () => {
    render(<AddressInput onSelect={onSelect} inputProps={{ placeholder: 'Search' }} />);
    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'Paris' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
