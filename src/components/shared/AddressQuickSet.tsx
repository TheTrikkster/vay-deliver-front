import React from 'react';
import { useAddressFilter } from '../../hooks/useAddressFilter';

interface AddressQuickSetProps {
  /** Adresse prédéfinie à injecter */
  address: string;
  /** Texte du bouton (optionnel) */
  buttonText?: string;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Composant exemple pour injecter rapidement une adresse dans les filtres
 * Peut être utilisé n'importe où dans l'application
 */
export const AddressQuickSet: React.FC<AddressQuickSetProps> = ({
  address,
  buttonText,
  className = '',
}) => {
  const { setFilterAddress, currentAddress } = useAddressFilter();

  const handleSetAddress = () => {
    setFilterAddress(address);
  };

  const isCurrentAddress = currentAddress === address;

  return (
    <button
      onClick={handleSetAddress}
      disabled={isCurrentAddress}
      className={`
        px-3 py-1 text-sm rounded-lg transition-colors
        ${
          isCurrentAddress
            ? 'bg-green-100 text-green-700 cursor-not-allowed'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }
        ${className}
      `}
      title={isCurrentAddress ? 'Adresse déjà sélectionnée' : `Filtrer par: ${address}`}
    >
      {buttonText || address}
    </button>
  );
};

/**
 * Exemple d'utilisation dans n'importe quel composant :
 *
 * ```tsx
 * import { AddressQuickSet } from '../shared/AddressQuickSet';
 *
 * // Dans votre composant
 * <AddressQuickSet
 *   address="Paris, France"
 *   buttonText="📍 Paris"
 * />
 * ```
 *
 * Ou directement avec le hook :
 *
 * ```tsx
 * import { useAddressFilter } from '../../hooks/useAddressFilter';
 *
 * const MyComponent = () => {
 *   const { setFilterAddress } = useAddressFilter();
 *
 *   const handleClick = () => {
 *     setFilterAddress("123 Rue de la Paix, Paris");
 *   };
 *
 *   return <button onClick={handleClick}>Filtrer Paris</button>;
 * };
 * ```
 */
