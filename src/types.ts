/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransportType = 'flight' | 'train' | 'bus' | 'transfer' | 'ferry';

export type AccommodationCategory = 
  | '3_stars'
  | '4_stars'
  | '5_stars'
  | 'boutique'
  | 'resort'
  | 'apart_hotel'
  | 'estancia_lodge'
  | 'special';

export type MealPlan = 
  | 'desayuno'
  | 'media_pension'
  | 'pension_completa'
  | 'all_inclusive'
  | 'sin_regimen';

export interface CityStop {
  id: string;
  cityName: string;
  country: string;
  lat: number;
  lng: number;
  nights: number;
  // Alojamiento
  accommodationCategory: AccommodationCategory;
  hotelName: string;
  mealPlan: MealPlan;
  // Traslados
  transferIn: boolean;
  transferInNotes: string;
  transferOut: boolean;
  transferOutNotes: string;
  // Excursiones (campo libre o lista)
  excursions: string[];
  // Sugerencias no confirmadas; no se incluyen en las jornadas hasta seleccionarlas.
  excursionSuggestions?: string[];
  // Descripción de la ciudad para el primer día
  cityDescription: string;
  imageUrl?: string;
  // Conexión hacia la siguiente ciudad (aplica si no es la última)
  transportToNext: TransportType;
  transportNotes: string;
}

export interface InternationalFlightInfo {
  hasFlight: boolean;
  route: string; // e.g. "Buenos Aires (EZE) - Madrid (MAD)"
  flightNumber?: string;
  airline?: string;
  departureTime?: string;
  arrivalTime?: string;
  notes?: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  dateStr?: string;
  cityId: string;
  cityName: string;
  country: string;
  title: string;
  description: string;
  isCityFirstDay: boolean;
  isCityLastDay: boolean;
  hasTransferIn: boolean;
  transferInNotes?: string;
  hasTransferOut: boolean;
  transferOutNotes?: string;
  excursions: string[];
  isFreeDay: boolean;
  accommodationCategory: AccommodationCategory;
  hotelName: string;
  mealPlan: MealPlan;
  transportToNext?: {
    type: TransportType;
    notes?: string;
    targetCityName?: string;
  };
  internationalFlightNote?: string;
  // Marca descripciones modificadas desde el editor manual.
  descriptionEditedManually?: boolean;
  titleEditedManually?: boolean;
  imageUrl?: string;
}

export interface TravelItinerary {
  id: string;
  title: string; // Título del viaje / destino
  clientName: string; // Campo para colocar el nombre (cliente/pasajero)
  clientEmail?: string;
  clientPhone?: string;
  startDate: string; // Fecha de inicio (YYYY-MM-DD)
  price: string; // Campo para colocar el valor (e.g. "2.450" o "USD 3.200")
  currency: string; // USD, EUR, ARS, etc.
  priceConditions: string; // e.g. "Por persona en base doble. Incluye impuestos."
  freeTextNotes: string; // Campo para colocar texto libre (observaciones, detalles, políticas)
  // Aéreo internacional inicial y final
  flightStart: InternationalFlightInfo;
  flightEnd: InternationalFlightInfo;
  // Ciudades y noches
  stops: CityStop[];
  // Días generados y editables por el usuario
  days: ItineraryDay[];
  // Logo personalizado (opcional, por defecto Tresor Travel)
  logoUrl?: string;
  coverImageUrl?: string;
}
