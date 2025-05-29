import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { useDebounce } from '../../hooks/useDebounce';
import { geocodeByPlaceId } from 'react-places-autocomplete';
import { useTranslation } from 'react-i18next';

interface Props {
  /** Callback when an address is selected */
  onSelect: (address: string) => void;
  /** Disable the input */
  disabled?: boolean;
  /** Additional props for the <input> element */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** Icon or any component to display inside the input */
  icon?: React.ReactNode;
}

export const AddressInput: React.FC<Props> = ({
  onSelect,
  disabled = false,
  inputProps = {},
  icon,
}) => {
  const { t } = useTranslation('addressInput');
  const [inputValue, setInputValue] = useState(String(inputProps.value || ''));
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (inputProps.value !== undefined) {
      setInputValue(String(inputProps.value));
    }
  }, [inputProps.value]);

  const debounced = useDebounce(inputValue, 1000);
  const { predictions, isLoading, error } = useAutocomplete(debounced);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    async (prediction: google.maps.places.PlacePrediction) => {
      try {
        const results = await geocodeByPlaceId(prediction.placeId!);
        const place = results[0];
        const address = place.formatted_address!;

        setInputValue(address);
        onSelect(address);
        setShowSuggestions(false);
      } catch (err) {
        console.error('Error fetching address:', err);
      }
    },
    [onSelect]
  );

  const paddingLeft = icon ? 'pl-10' : '';
  const paddingRight = 'pr-12';
  const combinedClassName = `${paddingLeft} ${paddingRight} ${inputProps.className ?? ''}`;

  return (
    <div ref={containerRef} className="relative w-full">
      {icon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        {...inputProps}
        type={inputProps.type ?? 'text'}
        value={inputValue}
        onChange={e => {
          const newValue = e.target.value;
          setInputValue(newValue);
          setShowSuggestions(true);
          inputProps.onChange?.(e);
        }}
        onFocus={e => {
          inputProps.onFocus?.(e);
          if (inputValue.length >= 5) setShowSuggestions(true);
        }}
        onBlur={inputProps.onBlur}
        className={combinedClassName}
        disabled={disabled}
      />

      {showSuggestions && !isLoading && predictions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {predictions.map(pred => (
            <li
              key={pred.placeId}
              role="option"
              onMouseDown={e => {
                e.preventDefault();
                handleSelect(pred);
              }}
              onClick={() => handleSelect(pred)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <span className="truncate">{pred.text.toString()}</span>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && isLoading && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-gray-500">
          {t('loading')}
        </div>
      )}

      {showSuggestions && error && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-red-200 rounded-lg shadow-lg p-3 text-red-500">
          {t('error')}
        </div>
      )}
    </div>
  );
};
