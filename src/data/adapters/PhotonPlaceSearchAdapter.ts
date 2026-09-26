/**
 * data/adapters/PhotonPlaceSearchAdapter.ts
 *
 * Implements PlaceSearchService using the Komoot Photon API (OpenStreetMap data).
 * Requires NO API keys. Supports forward geocoding, typeahead search,
 * and proximity bias based on device coordinates.
 */
import type { PlaceSearchService } from '../../domain/services/PlaceSearchService';
import type { PlaceSuggestion } from '../../domain/entities/PlaceSuggestion';

interface PhotonFeature {
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    osm_id?: number;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    district?: string;
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

export class PhotonPlaceSearchAdapter implements PlaceSearchService {
  private static instance: PhotonPlaceSearchAdapter;

  static getInstance(): PhotonPlaceSearchAdapter {
    if (!PhotonPlaceSearchAdapter.instance) {
      PhotonPlaceSearchAdapter.instance = new PhotonPlaceSearchAdapter();
    }
    return PhotonPlaceSearchAdapter.instance;
  }

  async search(
    query: string,
    proximity?: { latitude: number; longitude: number },
  ): Promise<PlaceSuggestion[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        q: trimmed,
        lang: 'en',
        limit: '6',
      });

      if (proximity) {
        params.append('lat', proximity.latitude.toString());
        params.append('lon', proximity.longitude.toString());
      }

      const url = `https://photon.komoot.io/api/?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LocusApp/1.0',
        },
      });

      if (!response.ok) {
        return [];
      }

      const data: PhotonResponse = await response.json();
      if (!data.features) {
        return [];
      }

      return data.features.map((feature, index) => {
        const props = feature.properties;
        const [lon, lat] = feature.geometry.coordinates;

        const name =
          props.name ||
          (props.street ? `${props.housenumber ?? ''} ${props.street}`.trim() : props.city) ||
          'Unnamed Location';

        const addressParts = [
          props.district,
          props.city,
          props.state,
          props.country,
        ].filter(Boolean);

        const formattedAddress = addressParts.length > 0
          ? addressParts.join(', ')
          : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

        return {
          id: props.osm_id ? String(props.osm_id) : `place_${Date.now()}_${index}`,
          name,
          formattedAddress,
          latitude: lat,
          longitude: lon,
        };
      });
    } catch (err) {
      console.warn('[PhotonPlaceSearchAdapter] search error:', err);
      return [];
    }
  }
}
