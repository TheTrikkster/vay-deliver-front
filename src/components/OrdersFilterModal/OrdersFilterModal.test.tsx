import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrdersFilterModal from './OrdersFilterModal';
import { tagsApi } from '../../api/services/tagsApi';
import * as filterUtils from '../../utils/filterUtils';
import { setFiltersObject, selectFiltersObject } from '../../store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { OrderStatus, Position } from '../../types/order';

jest.mock('../../api/services/tagsApi');
jest.mock('../../utils/filterUtils');

// Mock debounce from lodash
jest.mock('lodash', () => ({
  debounce: (fn: any) => fn,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

// Mock store hooks
const mockDispatch = jest.fn();
const defaultFilters: {
  status: OrderStatus | '';
  tagNames: string[];
  position: Position;
} = {
  status: 'ACTIVE',
  tagNames: [],
  position: { lat: '', lng: '', address: '' },
};
jest.mock('../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector({ orders: { filtersObject: defaultFilters } }),
}));

// Mock AddressInput
jest.mock('../../components/AddressInput', () => ({
  AddressInput: ({ inputProps }: any) => <input data-testid="address-input" {...inputProps} />,
}));

// Mock react-places-autocomplete
jest.mock('react-places-autocomplete', () => ({
  __esModule: true,
  default: ({ children, onChange, value }: any) =>
    children({
      getInputProps: () => ({ value, onChange: (e: any) => onChange(e.target.value) }),
      suggestions: [],
      getSuggestionItemProps: () => ({}),
      loading: false,
    }),
  geocodeByAddress: jest
    .fn()
    .mockResolvedValue([{ geometry: { location: { lat: () => '0', lng: () => '0' } } }]),
  getLatLng: jest.fn().mockResolvedValue({ lat: '0', lng: '0' }),
}));

describe('OrdersFilterModal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (tagsApi.suggest as jest.Mock).mockResolvedValue({ data: [{ _id: '1', name: 'urgent' }] });
    (filterUtils.buildFilterString as jest.Mock).mockReturnValue('status=ACTIVE');
  });

  it('does not render when isOpen is false', () => {
    render(<OrdersFilterModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByText('orders')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(<OrdersFilterModal isOpen onClose={onClose} />);
    expect(screen.getByText('orders')).toBeInTheDocument();
  });

  it('closes on cancel', () => {
    render(<OrdersFilterModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('applies filters on confirm', () => {
    render(<OrdersFilterModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('confirm'));
    expect(mockDispatch).toHaveBeenCalledWith(setFiltersObject(defaultFilters));
    expect(onClose).toHaveBeenCalled();
  });

  it('updates status select', () => {
    render(<OrdersFilterModal isOpen onClose={onClose} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'COMPLETED' } });
    expect((select as HTMLSelectElement).value).toBe('COMPLETED');
  });

  it('handles address input', () => {
    render(<OrdersFilterModal isOpen onClose={onClose} />);
    const input = screen.getByTestId('address-input');
    fireEvent.change(input, { target: { value: 'Paris' } });
    expect((input as HTMLInputElement).value).toBe('Paris');
  });

  it('suggests tags and selects one', async () => {
    render(<OrdersFilterModal isOpen onClose={onClose} />);
    const noteInput = screen.getByPlaceholderText('enterNote');
    fireEvent.change(noteInput, { target: { value: 'urg' } });
    await waitFor(() => expect(tagsApi.suggest).toHaveBeenCalledWith('urg'));
  });

  it('resets filters on reset button', () => {
    render(<OrdersFilterModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByTitle('reset'));
    expect(screen.getByRole('combobox')).toHaveValue('ACTIVE');
    expect(screen.getByTestId('address-input')).toHaveValue('');
  });
});
