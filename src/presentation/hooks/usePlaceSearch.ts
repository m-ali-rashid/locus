/**
 * presentation/hooks/usePlaceSearch.ts
 *
 * Provides place suggestions with debounced search queries and location bias.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { PlaceSuggestion } from '../../domain/entities/PlaceSuggestion';
import { services } from '../../core/di/ServiceLocator';

interface UsePlaceSearchParams {
  proximity?: { latitude: number; longitude: number } | null;
  debounceMs?: number;
}

export function usePlaceSearch({ proximity, debounceMs = 350 }: UsePlaceSearchParams = {}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const results = await services.placeSearchService.search(
          trimmed,
          proximity ? { latitude: proximity.latitude, longitude: proximity.longitude } : undefined,
        );
        setSuggestions(results);
      } catch (err) {
        console.warn('Place search failed:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, proximity, debounceMs]);

  return {
    query,
    setQuery,
    suggestions,
    isSearching,
    clear,
  };
}
