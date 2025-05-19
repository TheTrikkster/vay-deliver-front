declare module 'react-places-autocomplete' {
  import * as React from 'react';

  export interface Suggestion {
    active: boolean;
    description: string;
    placeId: string;
    formattedSuggestion?: {
      mainText: string;
      secondaryText: string;
    };
    types?: string[];
    matchedSubstrings?: Array<{
      length: number;
      offset: number;
    }>;
    terms?: Array<{
      offset: number;
      value: string;
    }>;
  }

  export interface LatLng {
    lat: number;
    lng: number;
  }

  export interface Places {
    getInputProps: (props?: any) => any;
    suggestions: Suggestion[];
    getSuggestionItemProps: (suggestion: Suggestion, options?: any) => any;
    loading: boolean;
  }

  export interface PlacesProps {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (value: string, placeId?: string) => void;
    searchOptions?: {
      location?: { lat: () => number; lng: () => number } | LatLng;
      radius?: number;
      types?: string[];
      bounds?: {
        east: number;
        north: number;
        south: number;
        west: number;
      };
      componentRestrictions?: { country: string | string[] };
    };
    debounce?: number;
    highlightFirstSuggestion?: boolean;
    shouldFetchSuggestions?: boolean;
    googleCallbackName?: string;
    children: (options: Places) => React.ReactNode;
  }

  const PlacesAutocomplete: React.FC<PlacesProps>;

  export function geocodeByAddress(address: string): Promise<google.maps.GeocoderResult[]>;

  export function geocodeByPlaceId(placeId: string): Promise<google.maps.GeocoderResult[]>;

  export function getLatLng(result: google.maps.GeocoderResult): Promise<LatLng>;

  export default PlacesAutocomplete;
}
