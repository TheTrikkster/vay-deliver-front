import React, { useState, useEffect, FocusEvent } from 'react';
import { AsYouType, parsePhoneNumberFromString, CountryCode, PhoneNumber } from 'libphonenumber-js';

interface PhoneNumberInputProps {
  /** Valeur au format E.164 (ex. "+33123456789") ou chaîne libre en cours de saisie */
  value: string;
  /** Country code par défaut pour le formatage (ex. "FR") */
  defaultCountry?: CountryCode;
  /** Callback renvoyant la valeur E.164 (si valide) ou la saisie brute */
  onChange: (e164: string, raw: string, isValid: boolean) => void;
  /** Texte d’erreur à afficher */
  error?: any;
  fillIcone: string;
  /** Props à passer à l’élément <input> */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  defaultCountry = 'FR',
  onChange,
  error,
  fillIcone,
  inputProps,
}) => {
  const [rawValue, setRawValue] = useState<string>(value);

  // Sync initial value
  useEffect(() => {
    setRawValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Formatage au fur et à mesure
    const formatted = new AsYouType(defaultCountry).input(input);
    setRawValue(formatted);

    // Tenter de parser en E.164
    const phone = parsePhoneNumberFromString(formatted, defaultCountry);
    const isValid = phone?.isValid() ?? false;
    const e164 = isValid ? phone?.format('E.164')! : formatted;

    onChange(e164, formatted, isValid);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    // Optionnel : forcer le format E.164 au blur si valide
    const phone = parsePhoneNumberFromString(rawValue, defaultCountry);
    if (phone && phone.isValid()) {
      const e164 = phone.format('E.164');
      const formattedIntl = phone.formatInternational();
      setRawValue(formattedIntl);
      onChange(e164, formattedIntl, true);
    }
    inputProps?.onBlur?.(e);
  };

  return (
    <div>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <path
              d="M14.9625 15.75C13.4 15.75 11.8532 15.4125 10.3222 14.7375C8.79125 14.0625 7.4005 13.1 6.15 11.85C4.8995 10.6 3.937 9.2125 3.2625 7.6875C2.588 6.1625 2.2505 4.6125 2.25 3.0375V2.25H6.675L7.36875 6.01875L5.23125 8.175C5.50625 8.6625 5.8125 9.125 6.15 9.5625C6.4875 10 6.85 10.4062 7.2375 10.7812C7.6 11.1438 7.997 11.4907 8.4285 11.8222C8.86 12.1537 9.3255 12.463 9.825 12.75L12 10.575L15.75 11.3438V15.75H14.9625Z"
              fill={fillIcone}
            />
          </svg>
        </div>
        <input
          type="tel"
          value={rawValue}
          onChange={handleChange}
          onBlur={handleBlur}
          {...inputProps}
          className={[
            'w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none',
            error ? 'border-red-500' : 'focus:ring-2 focus:ring-[#4F46E5] border-gray-300',
            inputProps?.className,
          ].join(' ')}
        />
      </div>
      {error && (
        <p data-testid="phone-error" className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
