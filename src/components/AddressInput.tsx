import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { useDebounce } from '../hooks/useDebounce';
import { geocodeByPlaceId } from 'react-places-autocomplete';
import { useTranslation } from 'react-i18next';

interface Props {
  /** Callback when une adresse est sélectionnée */
  onSelect: (address: string) => void;
  /** Désactive l'input */
  disabled?: boolean;
  /** Props additionnels pour l'élément <input> */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** Icône ou n'importe quel composant à afficher à l'intérieur de l'input */
  icon?: React.ReactNode;
}

export const AddressInput: React.FC<Props> = ({
  onSelect,
  disabled = false,
  inputProps = {},
  icon,
}) => {
  const { t } = useTranslation('addressInput');
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce pour limiter les appels API
  const debounced = useDebounce(inputValue, 1000);
  const { predictions, isLoading, error } = useAutocomplete(debounced);

  // Réf pour le container complet
  const containerRef = useRef<HTMLDivElement>(null);

  // Ferme les suggestions au clic hors composant
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = useCallback(
    async (prediction: google.maps.places.PlacePrediction) => {
      const results = await geocodeByPlaceId(prediction.placeId!);
      const place = results[0];
      const address = place.formatted_address!;

      setInputValue(address);
      console.log('hellazeazeazeazea');
      console.log({ address });
      onSelect(address);
      setShowSuggestions(false);
    },
    [onSelect]
  );

  // Combinaison des props de style

  const paddingLeft = icon ? 'pl-10' : '';
  const combinedClassName = `${paddingLeft} ${inputProps.className ?? ''}`;

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
          setInputValue(e.target.value);
          setShowSuggestions(true);
          inputProps.onChange?.(e);
        }}
        onFocus={e => {
          // callback parent
          inputProps.onFocus?.(e);
          // ton comportement interne
          if (debounced.length >= 5) setShowSuggestions(true);
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
