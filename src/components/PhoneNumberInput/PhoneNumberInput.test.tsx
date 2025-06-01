import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneNumberInput } from './PhoneNumberInput';
import { CountryCode } from 'libphonenumber-js';

describe('PhoneNumberInput', () => {
  const defaultCountry: CountryCode = 'FR';

  it('affiche la valeur initiale', () => {
    render(
      <PhoneNumberInput
        value="+33123456789"
        defaultCountry={defaultCountry}
        onChange={jest.fn()}
        fillIcone="#000"
      />
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('+33123456789');
  });

  it('appelle onChange avec e164, raw et isValid lors de la saisie valide', () => {
    const onChange = jest.fn();
    render(
      <PhoneNumberInput
        value=""
        defaultCountry={defaultCountry}
        onChange={onChange}
        fillIcone="#000"
      />
    );
    const input = screen.getByRole('textbox');

    act(() => {
      fireEvent.change(input, { target: { value: '0612345678' } });
    });

    // Le rawValue formaté devrait inclure espaces
    expect(onChange).toHaveBeenLastCalledWith(
      '+33612345678', // e164
      expect.stringContaining('06'), // raw formaté
      true // isValid
    );
  });

  it('appelle onChange avec isValid=false pour une saisie invalide', () => {
    const onChange = jest.fn();
    render(
      <PhoneNumberInput
        value=""
        defaultCountry={defaultCountry}
        onChange={onChange}
        fillIcone="#000"
      />
    );
    const input = screen.getByRole('textbox');

    act(() => {
      fireEvent.change(input, { target: { value: '123' } });
    });

    expect(onChange).toHaveBeenLastCalledWith(
      '123', // e164 fallback = raw
      expect.stringContaining('123'),
      false // isValid false
    );
  });

  it('reformatte en international et rappelle onChange au blur si valide', () => {
    const onChange = jest.fn();
    render(
      <PhoneNumberInput
        value="0612345678"
        defaultCountry={defaultCountry}
        onChange={onChange}
        fillIcone="#000"
      />
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Simuler le blur
    act(() => {
      fireEvent.blur(input);
    });

    // Doit avoir format international (ex. "+33 6 12 34 56 78")
    expect(onChange).toHaveBeenLastCalledWith(
      '+33612345678',
      expect.stringMatching(/^\+33.*6.*12.*34.*56.*78$/),
      true
    );
  });

  it("affiche le message d'erreur quand la prop error est définie", () => {
    render(
      <PhoneNumberInput
        value=""
        defaultCountry={defaultCountry}
        onChange={jest.fn()}
        fillIcone="#000"
        error="Numéro invalide"
      />
    );
    expect(screen.getByTestId('phone-error').textContent).toBe('Numéro invalide');
  });
});
