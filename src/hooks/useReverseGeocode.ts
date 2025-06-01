import { useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface UseReverseGeocodeOptions {
  /** Instance du loader Google Maps (pour injection/doubleur) */
  loaderInstance?: Loader;
}

// Loader par défaut ; on peut le surcharger via loaderInstance
const defaultLoader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY!,
  libraries: ['places'],
});

/**
 * Hook pour le reverse geocoding (coordonnées vers adresse)
 * @param options Options de configuration (loader)
 * @returns { reverseGeocode, isLoading, error }
 */
export function useReverseGeocode({
  loaderInstance = defaultLoader,
}: UseReverseGeocodeOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        await loaderInstance.load();

        const geocoder = new google.maps.Geocoder();
        const latlng = { lat, lng };

        // Utilisation de l'API callback avec promisification
        const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results) {
              resolve({ results } as google.maps.GeocoderResponse);
            } else {
              reject(new Error(`Geocoding failed with status: ${status}`));
            }
          });
        });

        if (response.results && response.results.length > 0) {
          const address = response.results[0].formatted_address;
          setIsLoading(false);
          return address;
        } else {
          throw new Error('Aucune adresse trouvée pour ces coordonnées');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors du reverse geocoding');
        setError(error);
        setIsLoading(false);
        throw error;
      }
    },
    [loaderInstance]
  );

  return { reverseGeocode, isLoading, error };
}
