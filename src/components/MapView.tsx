/**
 * src/components/MapView.tsx
 *
 * Full-screen map matching the Waynest design:
 * - High-key minimalist light styling with ArcGIS Light Gray Canvas tiles
 * - Custom concentric ring target pins with dark pill labels
 * - Interactive radius circles with lavender fill
 * - Dashed route line between user and selected pin
 * - Floating navigation and zoom controls
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Layers, Plus, Minus, Navigation, Info } from 'lucide-react';
import type { Geofence } from '../domain/entities/Geofence';

interface Props {
  userLocation: { latitude: number; longitude: number } | null;
  selectedPin: { latitude: number; longitude: number } | null;
  radius: number;
  geofences: Geofence[];
  onMapClick: (coord: { latitude: number; longitude: number }) => void;
  onSelectGeofence?: (geofence: Geofence) => void;
  selectedPlaceName?: string;
  onCenterUser: () => void;
}

export const MapView: React.FC<Props> = ({
  userLocation,
  selectedPin,
  radius,
  geofences,
  onMapClick,
  onSelectGeofence,
  selectedPlaceName,
  onCenterUser,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const selectedPinMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const geofenceLayersRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<'canvas' | 'osm'>('canvas');
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelTileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = userLocation?.latitude ?? 37.7749;
    const initialLng = userLocation?.longitude ?? -122.4194;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
    });

    // ArcGIS Light Gray Canvas tiles matching the React Native code
    const baseTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: '© Esri, HERE, Garmin, OpenStreetMap contributors',
      },
    ).addTo(map);

    const labelTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
      },
    ).addTo(map);

    baseTileLayerRef.current = baseTiles;
    labelTileLayerRef.current = labelTiles;

    const geofenceGroup = L.layerGroup().addTo(map);
    geofenceLayersRef.current = geofenceGroup;

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Toggle map tiles (ArcGIS canvas / OpenStreetMap)
  const toggleMapStyle = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (mapStyle === 'canvas') {
      if (baseTileLayerRef.current) map.removeLayer(baseTileLayerRef.current);
      if (labelTileLayerRef.current) map.removeLayer(labelTileLayerRef.current);

      baseTileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        },
      ).addTo(map);

      setMapStyle('osm');
    } else {
      if (baseTileLayerRef.current) map.removeLayer(baseTileLayerRef.current);

      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 },
      ).addTo(map);

      labelTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 },
      ).addTo(map);

      setMapStyle('canvas');
    }
  }, [mapStyle]);

  // Update User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    const map = mapInstanceRef.current;

    const userIconHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 w-10 h-10">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/25 user-pulse-ring"></div>
        <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: userIconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
    } else {
      userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }
  }, [userLocation]);

  // Update Selected Pin Marker, Radius Circle & Polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!selectedPin) {
      if (selectedPinMarkerRef.current) {
        map.removeLayer(selectedPinMarkerRef.current);
        selectedPinMarkerRef.current = null;
      }
      if (radiusCircleRef.current) {
        map.removeLayer(radiusCircleRef.current);
        radiusCircleRef.current = null;
      }
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      return;
    }

    const pinLabel = selectedPlaceName || 'Selected Location';

    // Custom concentric ring target pin with dark pill label
    const pinHtml = `
      <div class="flex flex-col items-center -translate-x-1/2 -translate-y-[85%] select-none">
        <div class="flex items-center gap-1.5 bg-[#1C1B1F] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap max-w-[200px] truncate">
          <span class="truncate">${pinLabel}</span>
          <span class="text-[9px] opacity-75">▼</span>
        </div>
        <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#1C1B1F] -mt-[1px]"></div>
        <div class="w-7 h-7 rounded-full bg-[#B3A2E8]/45 flex items-center justify-center mt-0.5">
          <div class="w-4.5 h-4.5 rounded-full bg-[#1C1B1F] border-2 border-white flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      </div>
    `;

    const pinIcon = L.divIcon({
      className: 'custom-locus-pin',
      html: pinHtml,
      iconSize: [200, 60],
      iconAnchor: [100, 52],
    });

    if (selectedPinMarkerRef.current) {
      selectedPinMarkerRef.current.setLatLng([selectedPin.latitude, selectedPin.longitude]);
      selectedPinMarkerRef.current.setIcon(pinIcon);
    } else {
      selectedPinMarkerRef.current = L.marker(
        [selectedPin.latitude, selectedPin.longitude],
        { icon: pinIcon, zIndexOffset: 900 },
      ).addTo(map);
    }

    // Radius circle preview
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng([selectedPin.latitude, selectedPin.longitude]);
      radiusCircleRef.current.setRadius(radius);
    } else {
      radiusCircleRef.current = L.circle([selectedPin.latitude, selectedPin.longitude], {
        radius: radius,
        color: '#8B5CF6',
        weight: 2,
        fillColor: '#B3A2E8',
        fillOpacity: 0.22,
        dashArray: '6, 6',
      }).addTo(map);
    }

    // Polyline connecting user to pin
    if (userLocation) {
      const latlngs: [number, number][] = [
        [userLocation.latitude, userLocation.longitude],
        [selectedPin.latitude, selectedPin.longitude],
      ];
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latlngs);
      } else {
        polylineRef.current = L.polyline(latlngs, {
          color: '#8B5CF6',
          weight: 3,
          dashArray: '8, 8',
          opacity: 0.8,
        }).addTo(map);
      }
    }
  }, [selectedPin, radius, selectedPlaceName, userLocation]);

  // Render Saved Geofences
  useEffect(() => {
    if (!geofenceLayersRef.current) return;
    const group = geofenceLayersRef.current;
    group.clearLayers();

    geofences.forEach((geo) => {
      // Circle boundary
      const circle = L.circle([geo.latitude, geo.longitude], {
        radius: geo.radius,
        color: geo.isActive ? '#10B981' : '#9CA3AF',
        weight: 1.5,
        fillColor: geo.isActive ? '#10B981' : '#9CA3AF',
        fillOpacity: geo.isActive ? 0.12 : 0.05,
      });

      // Marker badge with place icon
      const badgeHtml = `
        <div class="flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div class="flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full border border-gray-200 shadow-md text-xs font-bold text-[#1C1B1F] group-hover:scale-105 transition-transform">
            <span class="w-2 h-2 rounded-full ${geo.isActive ? 'bg-emerald-500' : 'bg-gray-400'}"></span>
            <span class="max-w-[120px] truncate">${geo.name}</span>
          </div>
        </div>
      `;

      const badgeIcon = L.divIcon({
        className: 'custom-saved-geofence',
        html: badgeHtml,
        iconSize: [140, 30],
        iconAnchor: [70, 15],
      });

      const marker = L.marker([geo.latitude, geo.longitude], { icon: badgeIcon });
      marker.on('click', () => {
        onSelectGeofence?.(geo);
      });
      circle.on('click', () => {
        onSelectGeofence?.(geo);
      });

      group.addLayer(circle);
      group.addLayer(marker);
    });
  }, [geofences, onSelectGeofence]);

  // Center on user location action
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (userLocation) {
      mapInstanceRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, {
        duration: 0.8,
      });
    }
    onCenterUser();
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full flex-1">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls on Right Side (Layers, Zoom, Navigation) */}
      <div className="absolute top-20 right-4 sm:top-6 sm:right-6 z-[1000] flex flex-col gap-2.5 items-center">
        <button
          onClick={toggleMapStyle}
          className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-gray-100 flex items-center justify-center text-[#1C1B1F] hover:bg-gray-50 active:scale-95 transition-all"
          title={`Switch map layer (currently ${mapStyle === 'canvas' ? 'Minimal Gray' : 'OpenStreetMap'})`}
        >
          <Layers className="w-4 h-4 text-gray-700" />
        </button>

        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 overflow-hidden divide-y divide-gray-100">
          <button
            onClick={handleZoomIn}
            className="w-11 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-11 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleRecenter}
          className="w-11 h-11 rounded-2xl bg-[#1C1B1F] shadow-lg flex items-center justify-center text-white hover:bg-black active:scale-95 transition-all"
          title="Center on my location"
        >
          <Navigation className="w-4 h-4 -rotate-45" />
        </button>
      </div>

      {/* Subtle Bottom Instruction Hint */}
      {!selectedPin && (
        <div className="absolute bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[990] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-gray-200/60 pointer-events-none text-xs font-semibold text-gray-700 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Click anywhere on the map or search to place a reminder</span>
        </div>
      )}
    </div>
  );
};
