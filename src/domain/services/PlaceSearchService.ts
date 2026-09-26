/**
 * domain/services/PlaceSearchService.ts
 *
 * Port interface for place search / autocomplete.
 * Independent of specific geocoding providers (OSM, Photon, Google, Apple, etc.).
 */
import type { PlaceSuggestion } from '../entities/PlaceSuggestion';

export interface PlaceSearchService {
  search(
    query: string,
    proximity?: { latitude: number; longitude: number },
  ): Promise<PlaceSuggestion[]>;
}
