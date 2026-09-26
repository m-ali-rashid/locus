/**
 * src/services/photonService.ts
 *
 * Implements PlaceSearchService using the Komoot Photon API (OpenStreetMap data).
 * Requires NO API keys. Supports forward geocoding, typeahead search,
 * and proximity bias based on device coordinates.
 */
import type { PlaceSuggestion } from '../domain/entities/PlaceSuggestion';

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

export async function searchPlaces(
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

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
        'Selected Location';

      const addressParts = [
        props.district,
        props.city,
        props.state,
        props.country,
      ].filter(Boolean);

      const formattedAddress =
        addressParts.length > 0
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
    console.warn('[PhotonPlaceSearch] search error:', err);
    return [];
  }
}
