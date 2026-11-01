/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CityStop } from '../types';
import { TRANSPORT_LABELS } from '../utils/itineraryGenerator';

interface RouteSvgMapProps {
  stops: CityStop[];
  className?: string;
  theme?: 'light' | 'editorial';
}

export const RouteSvgMap: React.FC<RouteSvgMapProps> = ({
  stops,
  className = 'w-full h-72',
}) => {
  if (!stops || stops.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-slate-50 text-slate-400 text-sm italic rounded-xl border border-dashed border-slate-200">
        No hay ciudades ingresadas en el recorrido.
      </div>
    );
  }

  // Calculate coordinates bounds
  const lats = stops.map(s => Number(s.lat) || 0);
  const lngs = stops.map(s => Number(s.lng) || 0);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // SVG dimensions
  const width = 850;
  const height = 340;
  const paddingX = 95;
  const paddingY = 70;

  const avgLat = (minLat + maxLat) / 2;
  // Aspect ratio correction by cosine of average latitude (Mercator-like factor)
  const cosFactor = Math.cos((avgLat * Math.PI) / 180) || 1;

  const rawLatSpan = Math.max(0.8, maxLat - minLat);
  const rawLngSpan = Math.max(0.8, (maxLng - minLng) * cosFactor);

  // Buffer to give geographical context and ensure labels never hit boundaries
  const latBuffer = rawLatSpan * 0.35;
  const lngBuffer = (rawLngSpan / cosFactor) * 0.35;

  const effectiveMinLat = minLat - latBuffer;
  const effectiveMaxLat = maxLat + latBuffer;
  const effectiveMinLng = minLng - lngBuffer;
  const effectiveMaxLng = maxLng + lngBuffer;

  const latSpan = Math.max(0.5, effectiveMaxLat - effectiveMinLat);
  const lngSpan = Math.max(0.5, effectiveMaxLng - effectiveMinLng);

  // Project points
  const points = stops.map((stop, idx) => {
    let x = paddingX + ((stop.lng - effectiveMinLng) / lngSpan) * (width - 2 * paddingX);
    let y = height - paddingY - ((stop.lat - effectiveMinLat) / latSpan) * (height - 2 * paddingY);

    // Bounds safety - ensure badges (65px half-width, 35px height) never touch SVG borders
    x = Math.max(70, Math.min(width - 70, x));
    y = Math.max(45, Math.min(height - 45, y));

    return {
      ...stop,
      x,
      y,
      index: idx + 1,
      labelPlacement: 'top' as 'top' | 'bottom' | 'top-right' | 'bottom-right' | 'left',
    };
  });

  // Anti-collision label positioning algorithm
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // If two points are very close on screen (< 110px) like Florence & Rome
      if (dist < 110) {
        if (Math.abs(dx) > Math.abs(dy)) {
          // One left, one right
          points[i].labelPlacement = 'top';
          points[j].labelPlacement = 'bottom';
        } else {
          // One top, one bottom
          if (points[i].y < points[j].y) {
            points[i].labelPlacement = 'top';
            points[j].labelPlacement = 'bottom';
          } else {
            points[i].labelPlacement = 'bottom';
            points[j].labelPlacement = 'top';
          }
        }
      }
    }
  }

  return (
    <div
      id="route-svg-map-wrapper"
      className={`relative bg-[#f8fafc] rounded-2xl overflow-hidden border border-slate-200 ${className}`}
      style={{
        backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
      }}
    >
      <svg
        id="route-svg-map"
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full object-contain"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="routeGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b91c3e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* Stylized Geographical Landmass / Coastlines (Editorial representation) */}
        <g id="geographic-context" opacity="0.65">
          {/* Subtle continent silhouette base */}
          <path
            d={`M 0,${height * 0.9} Q ${width * 0.25},${height * 0.7} ${width * 0.5},${height * 0.85} T ${width},${height * 0.75} L ${width},${height} L 0,${height} Z`}
            fill="#eaf2f8"
          />
          <path
            d={`M 0,0 L ${width * 0.7},0 Q ${width * 0.6},${height * 0.4} ${width * 0.3},${height * 0.35} T 0,${height * 0.5} Z`}
            fill="#eef4f9"
          />
          {/* Latitude / Longitude soft grid marks */}
          <line x1={paddingX} y1={height * 0.25} x2={width - paddingX} y2={height * 0.25} stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.6" />
          <line x1={paddingX} y1={height * 0.5} x2={width - paddingX} y2={height * 0.5} stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.6" />
          <line x1={paddingX} y1={height * 0.75} x2={width - paddingX} y2={height * 0.75} stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.6" />

          <line x1={width * 0.25} y1={paddingY} x2={width * 0.25} y2={height - paddingY} stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.6" />
          <line x1={width * 0.5} y1={paddingY} x2={width * 0.5} y2={height - paddingY} stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.6" />
          <line x1={width * 0.75} y1={paddingY} x2={width * 0.75} y2={height - paddingY} stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.6" />
        </g>

        {/* Connecting Curved Lines & Transport icons */}
        {points.map((p, i) => {
          if (i === points.length - 1) return null;
          const next = points[i + 1];

          // Compute smooth curve midpoint
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const archOffset = Math.min(45, Math.max(15, dist * 0.15));

          // Perpendicular offset for curved arch
          const midX = (p.x + next.x) / 2;
          const midY = (p.y + next.y) / 2 - archOffset;
          const pathD = `M ${p.x} ${p.y} Q ${midX} ${midY} ${next.x} ${next.y}`;

          let iconEmoji = '✈️';
          if (p.transportToNext === 'train') iconEmoji = '🚆';
          else if (p.transportToNext === 'bus') iconEmoji = '🚌';
          else if (p.transportToNext === 'ferry') iconEmoji = '🚢';
          else if (p.transportToNext === 'transfer') iconEmoji = '🚗';

          return (
            <g key={`path-${i}`}>
              {/* Outer soft shadow for line */}
              <path
                d={pathD}
                fill="none"
                stroke="#b91c3e"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.15"
              />
              {/* Main route dash line */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#routeGradLight)"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
              {/* Transport midway badge */}
              <g transform={`translate(${midX}, ${midY})`}>
                <circle r="13" fill="#ffffff" stroke="#b91c3e" strokeWidth="1.5" filter="url(#cardShadow)" />
                <text
                  y="4.5"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#0f172a"
                >
                  {iconEmoji}
                </text>
              </g>
            </g>
          );
        })}

        {/* City Markers and Anti-Collision Badges */}
        {points.map((p) => {
          const nights = p.nights || 1;
          const isBottomPlacement = p.labelPlacement === 'bottom';
          const badgeOffsetY = isBottomPlacement ? 30 : -32;
          const pointerY = isBottomPlacement ? 10 : -10;

          return (
            <g key={`marker-${p.id}`} transform={`translate(${p.x}, ${p.y})`}>
              {/* Connector line if displaced */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={badgeOffsetY + (isBottomPlacement ? -12 : 12)}
                stroke="#b91c3e"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />

              {/* Outer pulsing ring */}
              <circle r="14" fill="#b91c3e" opacity="0.18" />
              {/* GPS Pin */}
              <circle r="9" fill="#b91c3e" stroke="#ffffff" strokeWidth="2" />
              {/* Number */}
              <text
                y="3.5"
                textAnchor="middle"
                fontSize="9.5"
                fill="#ffffff"
                fontWeight="800"
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {p.index}
              </text>

              {/* City Name & Nights Badge Box (Clean Editorial Design) */}
              <g transform={`translate(0, ${badgeOffsetY})`}>
                {/* Pointer indicator */}
                <polygon
                  points={isBottomPlacement ? "-5,-12 5,-12 0,-17" : "-5,12 5,12 0,17"}
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />

                {/* Main Badge Background */}
                <rect
                  x="-62"
                  y="-12"
                  width="124"
                  height="25"
                  rx="12.5"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />

                {/* City name text */}
                <text
                  x="-8"
                  y="4.5"
                  textAnchor="middle"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontSize="11"
                  fontWeight="800"
                  fill="#0f172a"
                >
                  {p.cityName}
                </text>

                {/* Nights pill on right side */}
                <g transform="translate(36, 0)">
                  <rect
                    x="-18"
                    y="-8.5"
                    width="36"
                    height="17"
                    rx="8.5"
                    fill="#ffe4e6"
                    stroke="#fda4af"
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    fontSize="9.5"
                    fontWeight="800"
                    fill="#b91c3e"
                  >
                    🌙{nights}
                  </text>
                </g>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Map Legend on bottom right */}
      <div className="absolute bottom-2.5 right-3.5 bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-lg px-2.5 py-1 text-[10.5px] text-slate-600 font-semibold flex items-center gap-3 shadow-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#b91c3e] border border-white"></span>
          <span>Ciudad de estadía</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[#b91c3e] border-dashed"></span>
          <span>Trayecto</span>
        </span>
        <span className="flex items-center gap-1 bg-rose-50 text-[#b91c3e] px-1.5 py-0.5 rounded font-bold">
          🌙 Noches a dormir
        </span>
      </div>

      {/* Compass rose on top left */}
      <div className="absolute top-2.5 left-3 text-[10px] font-bold text-slate-400 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200/60 pointer-events-none">
        Norte ↑
      </div>
    </div>
  );
};
