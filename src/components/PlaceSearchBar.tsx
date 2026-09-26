/**
 * src/components/PlaceSearchBar.tsx
 *
 * Floating search bar matching the Waynest clean minimalist design:
 * - Rounded white floating container with subtle drop shadow
 * - Photon autocomplete typeahead dropdown
 * - Direct GPS center button
 */
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Crosshair, MapPin, Loader2 } from 'lucide-react';
import type { PlaceSuggestion } from '../domain/entities/PlaceSuggestion';
import { searchPlaces } from '../services/photonService';

interface Props {
  onSelectPlace: (place: PlaceSuggestion) => void;
  onCenterUser: () => void;
  userLocation: { latitude: number; longitude: number } | null;
}

export const PlaceSearchBar: React.FC<Props> = ({
  onSelectPlace,
  onCenterUser,
  userLocation,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const results = await searchPlaces(query, userLocation || undefined);
      setSuggestions(results);
      setIsLoading(false);
      setIsOpen(true);
    }, 280);

    return () => clearTimeout(timer);
  }, [query, userLocation]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (place: PlaceSuggestion) => {
    setQuery(place.name);
    setIsOpen(false);
    onSelectPlace(place);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[420px] z-[1000]"
    >
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2.5 shadow-lg border border-gray-100 transition-all hover:shadow-xl">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Search place or address…"
          className="flex-1 bg-transparent text-sm font-medium text-[#1C1B1F] placeholder-gray-400 focus:outline-none"
        />

        {isLoading ? (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}

        <div className="h-5 w-[1px] bg-gray-200 mx-0.5" />

        <button
          onClick={onCenterUser}
          className="p-2 text-gray-700 hover:text-[#1C1B1F] hover:bg-gray-100 rounded-xl transition-colors shrink-0"
          title="Center on my location"
        >
          <Crosshair className="w-4 h-4 text-gray-800" />
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50 max-h-[320px] overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-100 transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1C1B1F] truncate group-hover:text-purple-900 transition-colors">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {item.formattedAddress}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
