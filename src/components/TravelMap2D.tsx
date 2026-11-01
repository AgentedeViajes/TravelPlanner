/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { CityStop } from '../types';
import { TRANSPORT_LABELS } from '../utils/itineraryGenerator';
import { ZoomIn, ZoomOut, Maximize2, MapPin, Compass, Navigation } from 'lucide-react';

interface TravelMap2DProps {
  stops: CityStop[];
  selectedCityId?: string | null;
  onSelectCity?: (cityId: string) => void;
  className?: string;
  isPrintMode?: boolean;
}

export const TravelMap2D: React.FC<TravelMap2DProps> = ({
  stops,
  selectedCityId,
  onSelectCity,
  className = 'h-[440px]',
  isPrintMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<'positron' | 'voyager' | 'osm'>(isPrintMode ? 'voyager' : 'positron');

  // Initialize Leaflet map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      // Import Leaflet dynamically to avoid SSR/window issues
      const L = (await import('leaflet')).default;

      if (!isMounted) return;

      // If map already exists, remove it before reinitializing
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center Europe / South America
      const defaultLat = stops[0]?.lat || 40.4168;
      const defaultLng = stops[0]?.lng || -3.7038;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 5,
        zoomControl: false,
        attributionControl: !isPrintMode,
        scrollWheelZoom: !isPrintMode,
        dragging: !isPrintMode,
      });

      // Layer providers
      let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      if (mapStyle === 'positron') {
        tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      } else if (mapStyle === 'osm') {
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      }

      L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapStyle]);

  // Periodic size invalidation to guarantee full tile loading in modals or PDF tabs
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const t1 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    const t2 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mapReady, stops.length]);

  // Update markers, lines, and fitBounds whenever stops or mapReady changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    let isMounted = true;

    const drawRoute = async () => {
      const L = (await import('leaflet')).default;
      if (!isMounted || !mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      // Remove existing route layers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      if (!stops || stops.length === 0) return;

      const latLngs: [number, number][] = [];
      const markers: any[] = [];

      // Add markers for each city stop
      stops.forEach((stop, index) => {
        const lat = Number(stop.lat);
        const lng = Number(stop.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        latLngs.push([lat, lng]);

        const isSelected = selectedCityId === stop.id;
        const nights = stop.nights || 1;

        // Calculate if nearby stop exists to stagger vertical offset
        let isStaggered = false;
        if (index > 0) {
          const prevStop = stops[index - 1];
          const dLat = Math.abs((Number(prevStop.lat) || 0) - lat);
          const dLng = Math.abs((Number(prevStop.lng) || 0) - lng);
          if (dLat < 2.5 && dLng < 2.5) {
            isStaggered = index % 2 === 1;
          }
        }

        const stemHeight = isStaggered ? 'h-6' : 'h-2';
        const anchorY = isStaggered ? 48 : 36;

        // Custom HTML marker with nights badge
        const markerHtml = `
          <div class="travel-map-marker group relative cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 z-20">
            <div class="flex items-center gap-1.5 bg-white border-2 ${isSelected ? 'border-amber-500 ring-4 ring-amber-200' : 'border-[#b91c3e]'} rounded-full shadow-md px-2.5 py-1 text-slate-800 font-sans font-bold whitespace-nowrap">
              <span class="w-5 h-5 rounded-full bg-[#b91c3e] text-white flex items-center justify-center text-[11px] font-extrabold shadow-xs">
                ${index + 1}
              </span>
              <span class="text-xs font-bold text-slate-900">${stop.cityName}</span>
              <span class="inline-flex items-center bg-rose-50 text-[#b91c3e] border border-rose-200 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full">
                🌙 ${nights} ${nights === 1 ? 'noche' : 'noches'}
              </span>
            </div>
            ${isStaggered ? '<div class="w-0.5 h-3 bg-[#b91c3e] mx-auto"></div>' : ''}
            <div class="w-2.5 h-2.5 bg-[#b91c3e] transform rotate-45 mx-auto ${isStaggered ? '-mt-1' : '-mt-1'} shadow-sm"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-city-marker',
          iconSize: [140, anchorY],
          iconAnchor: [70, anchorY],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Popup with rich stop details
        const excursionsHtml = stop.excursions?.length
          ? `<div class="mt-1 text-xs text-slate-600"><strong>Excursiones:</strong> ${stop.excursions.join(', ')}</div>`
          : '<div class="mt-1 text-xs text-slate-500 italic">Día libre para actividades</div>';

        const popupContent = `
          <div class="p-1 font-sans text-slate-800 min-w-[200px]">
            <div class="flex items-center justify-between border-b pb-1 mb-1.5">
              <span class="font-extrabold text-sm text-[#b91c3e]">${index + 1}. ${stop.cityName}</span>
              <span class="text-[11px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">${stop.country}</span>
            </div>
            <div class="text-xs text-slate-700 space-y-0.5">
              <div><strong>Estancia:</strong> ${nights} ${nights === 1 ? 'noche' : 'noches'}</div>
              <div><strong>Régimen:</strong> ${stop.mealPlan.replace('_', ' ')}</div>
              ${stop.hotelName ? `<div><strong>Hotel:</strong> ${stop.hotelName}</div>` : ''}
              ${excursionsHtml}
              ${stop.transferIn ? '<div class="text-[11px] text-emerald-700">✓ Incluye Traslado IN</div>' : ''}
              ${stop.transferOut ? '<div class="text-[11px] text-emerald-700">✓ Incluye Traslado OUT</div>' : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onSelectCity) {
          marker.on('click', () => {
            onSelectCity(stop.id);
          });
        }

        markers.push(marker);
      });

      // Draw route connecting paths
      if (latLngs.length > 1) {
        // Main connecting polyline
        const polyline = L.polyline(latLngs, {
          color: '#b91c3e',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '6, 8',
          lineCap: 'round',
        }).addTo(map);

        // Add midway transport icons
        for (let i = 0; i < latLngs.length - 1; i++) {
          const start = latLngs[i];
          const end = latLngs[i + 1];
          const midLat = (start[0] + end[0]) / 2;
          const midLng = (start[1] + end[1]) / 2;
          const stop = stops[i];
          const transportInfo = TRANSPORT_LABELS[stop.transportToNext] || { label: 'Conexión', icon: 'Plane' };

          // Transport icon bubble
          let iconSvg = '✈️';
          if (stop.transportToNext === 'train') iconSvg = '🚆';
          else if (stop.transportToNext === 'bus') iconSvg = '🚌';
          else if (stop.transportToNext === 'transfer') iconSvg = '🚗';
          else if (stop.transportToNext === 'ferry') iconSvg = '🚢';

          const transportHtml = `
            <div class="flex items-center justify-center w-7 h-7 bg-white border border-[#b91c3e] rounded-full shadow-md text-xs font-bold text-slate-800 -translate-x-1/2 -translate-y-1/2" title="${transportInfo.label}">
              <span>${iconSvg}</span>
            </div>
          `;

          const transportIcon = L.divIcon({
            html: transportHtml,
            className: 'transport-mid-marker',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          L.marker([midLat, midLng], { icon: transportIcon }).addTo(map);
        }

        // Fit map bounds to show all markers with comfortable padding
        try {
          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
        } catch (e) {
          console.error('Error fitting bounds:', e);
        }
      } else if (latLngs.length === 1) {
        map.setView(latLngs[0], 7);
      }
    };

    drawRoute();

    return () => {
      isMounted = false;
    };
  }, [stops, selectedCityId, mapReady]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleFitBounds = async () => {
    if (!mapInstanceRef.current || stops.length === 0) return;
    const L = (await import('leaflet')).default;
    const coords = stops.map(s => [s.lat, s.lng] as [number, number]).filter(c => !isNaN(c[0]) && !isNaN(c[1]));
    if (coords.length > 0) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
    }
  };

  return (
    <div id="app-travel-map-container" className={`relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm ${className}`}>
      {/* Map Target Div */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px] z-0" />

      {/* Floating Map Controls (Top-Right) */}
      {!isPrintMode && (
        <div id="map-controls-panel" className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-1.5 shadow-md">
          <button
            id="map-btn-fit-bounds"
            type="button"
            onClick={handleFitBounds}
            title="Encuadrar todo el viaje"
            className="p-1.5 text-slate-700 hover:text-[#b91c3e] hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 my-0.5" />
          <button
            id="map-btn-zoom-in"
            type="button"
            onClick={handleZoomIn}
            title="Acercar mapa"
            className="p-1.5 text-slate-700 hover:text-[#b91c3e] hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="map-btn-zoom-out"
            type="button"
            onClick={handleZoomOut}
            title="Alejar mapa"
            className="p-1.5 text-slate-700 hover:text-[#b91c3e] hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Map Style Selector (Bottom-Left) */}
      {!isPrintMode && (
        <div id="map-style-selector" className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-1 shadow-sm text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setMapStyle('positron')}
            className={`px-2 py-0.5 rounded transition-colors ${mapStyle === 'positron' ? 'bg-[#b91c3e] text-white font-bold' : 'hover:bg-slate-100'}`}
          >
            Claro
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('voyager')}
            className={`px-2 py-0.5 rounded transition-colors ${mapStyle === 'voyager' ? 'bg-[#b91c3e] text-white font-bold' : 'hover:bg-slate-100'}`}
          >
            Detallado
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('osm')}
            className={`px-2 py-0.5 rounded transition-colors ${mapStyle === 'osm' ? 'bg-[#b91c3e] text-white font-bold' : 'hover:bg-slate-100'}`}
          >
            Topográfico
          </button>
        </div>
      )}

      {/* Header Badge: Total Stops & Nights - Hidden in print mode to avoid dark spot */}
      {!isPrintMode && (
        <div id="map-route-summary-pill" className="absolute top-3 left-3 z-10 pointer-events-none bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700/50">
          <Navigation className="w-3.5 h-3.5 text-[#b91c3e]" />
          <span className="text-xs font-bold">
            Recorrido: {stops.length} {stops.length === 1 ? 'ciudad' : 'ciudades'} • {stops.reduce((sum, s) => sum + (s.nights || 0), 0)} noches
          </span>
        </div>
      )}
    </div>
  );
};
