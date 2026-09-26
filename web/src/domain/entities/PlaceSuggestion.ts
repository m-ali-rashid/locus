/**
 * domain/entities/PlaceSuggestion.ts
 *
 * Represents an autocomplete / geocoding search result.
 */
export interface PlaceSuggestion {
  id: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}
