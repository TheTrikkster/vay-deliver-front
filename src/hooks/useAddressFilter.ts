import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAddress, selectFiltersObject } from '../store/slices/ordersSlice';

/**
 * Hook pour gérer l'adresse de filtrage des commandes
 * Permet d'injecter une adresse depuis n'importe où dans l'app
 */
export const useAddressFilter = () => {
  const dispatch = useAppDispatch();
  const filtersObject = useAppSelector(selectFiltersObject);

  const setFilterAddress = useCallback(
    (address: string) => {
      dispatch(setAddress(address));
    },
    [dispatch]
  );

  const clearFilterAddress = useCallback(() => {
    dispatch(setAddress(''));
  }, [dispatch]);

  return {
    /** Adresse actuelle dans les filtres */
    currentAddress: filtersObject.position.address,
    /** Définir une nouvelle adresse de filtrage */
    setFilterAddress,
    /** Vider l'adresse de filtrage */
    clearFilterAddress,
    /** Objet complet des filtres */
    filtersObject,
  };
};
