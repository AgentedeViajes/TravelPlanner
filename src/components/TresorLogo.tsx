/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface TresorLogoProps {
  className?: string;
  variant?: 'color' | 'white';
  showSubtitle?: boolean;
  customLogoUrl?: string;
}

export const TresorLogo: React.FC<TresorLogoProps> = ({
  className = 'h-10',
  variant = 'color',
  showSubtitle = false,
  customLogoUrl,
}) => {
  if (customLogoUrl) {
    return (
      <img
        id="app-agency-custom-logo"
        src={customLogoUrl}
        alt="Tresor Travel Logo"
        className={`${className} object-contain`}
      />
    );
  }

  const primaryColor = variant === 'white' ? '#ffffff' : '#b91c3e'; // Brand deep crimson/red
  const secondaryColor = variant === 'white' ? '#e2e8f0' : '#888d95'; // Brand metallic grey

  return (
    <div id="app-tresor-logo-container" className="flex items-center gap-2">
      <svg
        id="app-tresor-logo-svg"
        viewBox="0 0 460 110"
        className={`${className} w-auto transition-transform`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Tresor Travel"
      >
        {/* Grey crescent swoop / arc */}
        <path
          d="M 54 94 C 28 94 8 74 8 48 C 8 28 21 11 40 4 C 37 9 35 15 35 21 C 25 28 19 39 19 50 C 19 69 35 84 54 84 C 66 84 76 77 82 67 C 88 67 94 68 100 70 C 91 85 74 94 54 94 Z"
          fill={secondaryColor}
        />

        {/* Airplane icon in crimson red angled ~25 degrees */}
        <g transform="translate(14, 8) rotate(-12 40 40)">
          <path
            d="M 72 20 C 74 18 78 18 80 20 C 82 22 82 26 79 29 L 62 45 L 63 65 C 63 67 61 68 59 68 C 57 68 56 67 55 65 L 46 51 L 28 57 L 27 67 C 27 69 25 70 23 70 C 22 70 21 69 21 67 L 19 55 L 9 56 C 7 56 5 54 5 52 C 5 50 7 49 9 48 L 20 42 L 27 18 C 28 16 30 15 31 15 C 33 15 34 16 34 18 L 39 37 L 57 27 Z"
            fill={primaryColor}
          />
        </g>

        {/* Brand Text Typography */}
        <text
          x="116"
          y="72"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="54"
          fontWeight="800"
          fill={primaryColor}
          letterSpacing="-1.2px"
        >
          tresor
          <tspan fontWeight="600" fill={secondaryColor}>
            travel
          </tspan>
        </text>
      </svg>
      {showSubtitle && (
        <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wider text-slate-500 uppercase border-l border-slate-300 pl-2">
          Itinerary Studio
        </span>
      )}
    </div>
  );
};
