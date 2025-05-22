import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

type Prediction = google.maps.places.PlacePrediction;

interface UseAutocompleteOptions {
  /** Restriction géographique facultative */
  bias?: google.maps.places.LocationRestriction;
  /** Seuil minimal de caractères pour lancer la recherche */
  minLength?: number;
  /** Instance du loader Google Maps (pour injection/doubleur) */
  loaderInstance?: Loader;
}

// Loader par défaut ; on peut le surcharger via loaderInstance
const defaultLoader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY!,
  libraries: ['places'],
});

/**
 * Hook de suggestions d'adresses avec Google Places
 * @param input Texte saisi
 * @param options Options de configuration (biais, seuil, loader)
 * @returns { predictions, isLoading, error }
 */
export function useAutocomplete(
  input: string,
  { bias, minLength = 5, loaderInstance = defaultLoader }: UseAutocompleteOptions = {}
): {
  predictions: Prediction[];
  isLoading: boolean;
  error: Error | null;
} {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const session = useRef<google.maps.places.AutocompleteSessionToken>();

  useEffect(() => {
    let active = true;

    // Si en-dessous du seuil, on réinitialise et on quitte
    if (input.length < minLength) {
      setPredictions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    loaderInstance
      .load()
      .then(() => {
        if (!session.current) {
          session.current = new google.maps.places.AutocompleteSessionToken();
        }

        const req: google.maps.places.AutocompleteRequest = {
          input,
          sessionToken: session.current,
          locationRestriction: bias,
        };

        return google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(req);
      })
      .then(({ suggestions }) => {
        if (active) {
          setPredictions(suggestions.map(s => s.placePrediction as Prediction));
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        if (active) {
          setError(err);
          setPredictions([]);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [input, bias, minLength, loaderInstance]);

  return { predictions, isLoading, error };
}
