/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TravelItinerary } from '../types';
import { generateItineraryDays } from '../utils/itineraryGenerator';

export const INITIAL_ITINERARY: TravelItinerary = (() => {
  const base: TravelItinerary = {
    id: 'itinerary-europe-classic-1',
    title: 'Europa Soñada: Madrid, Barcelona, París & Roma',
    clientName: 'Javier Martín y Acompañante',
    clientEmail: 'contacto@tresortravel.com',
    clientPhone: '+54 9 11 4567-8900',
    startDate: '2026-10-15',
    price: '2.890',
    currency: 'USD',
    priceConditions: 'Tarifa por pasajero en base doble estándar. Incluye tasas, cargos hoteleros e IVA.',
    freeTextNotes: `• Incluye: Alojamiento en hoteles 4 estrellas céntricos con régimen de desayuno diario.
• Traslados de llegada y salida según detalle en vehículos privados de alta gama con chofer de habla hispana.
• Billetes de tren de alta velocidad y tramos aéreos interciudades con equipaje despachado de 23kg incluido.
• Guías locales oficiales en español en todas las excursiones especificadas y entradas prioritarias sin fila.
• Asistencia al viajero internacional con cobertura médica integral 24/7.
• No incluye: Tasa turística municipal (pago directo en recepción del hotel) ni propinas a guías o maleteros.`,
    flightStart: {
      hasFlight: true,
      route: 'EZE (Buenos Aires) -> MAD (Madrid Barajas)',
      airline: 'Iberia',
      flightNumber: 'IB 6844',
      notes: 'Salida 21:30 hs. Llegada al día siguiente 14:15 hs. Clase turista con equipaje.'
    },
    flightEnd: {
      hasFlight: true,
      route: 'FCO (Roma Fiumicino) -> EZE (Buenos Aires)',
      airline: 'ITA Airways',
      flightNumber: 'AZ 680',
      notes: 'Presentación en mostrador 3 horas antes del vuelo. Salida 22:30 hs.'
    },
    stops: [
      {
        id: 'stop-madrid',
        cityName: 'Madrid',
        country: 'España',
        lat: 40.4168,
        lng: -3.7038,
        nights: 3,
        accommodationCategory: '4_stars',
        hotelName: 'Hotel Mayorazgo / Gran Vía 4*',
        mealPlan: 'desayuno',
        transferIn: true,
        transferInNotes: 'Recepción personalizada con cartel identificador y traslado en van privada.',
        transferOut: true,
        transferOutNotes: 'Traslado privado desde hotel hacia estación de tren Atocha.',
        excursions: [
          'Visita panorámica de Madrid y Palacio Real',
          'Excursión de medio día a Toledo con guía oficial'
        ],
        cityDescription: 'Capital vibrante de España, renombrada por sus bulevares elegantes, amplios parques como El Retiro y ricos repositorios de arte europeo.',
        transportToNext: 'train',
        transportNotes: 'Tren de Alta Velocidad AVE Madrid Atocha -> Barcelona Sants (2h 45m en clase turista confort)'
      },
      {
        id: 'stop-barcelona',
        cityName: 'Barcelona',
        country: 'España',
        lat: 41.3851,
        lng: 2.1734,
        nights: 2,
        accommodationCategory: '4_stars',
        hotelName: 'Hotel Catalonia Ramblas 4*',
        mealPlan: 'desayuno',
        transferIn: true,
        transferInNotes: 'Recepción en estación Sants y traslado privado al hotel.',
        transferOut: true,
        transferOutNotes: 'Traslado privado al aeropuerto El Prat.',
        excursions: [
          'Visita guiada a la Basílica de la Sagrada Familia y Park Güell con entradas'
        ],
        cityDescription: 'Ciudad mediterránea famosa por la deslumbrante arquitectura modernista de Gaudí, su gastronomía marina y su animado Barrio Gótico.',
        transportToNext: 'flight',
        transportNotes: 'Vuelo regular Barcelona (BCN) -> París Charles de Gaulle (CDG) con valija despachada'
      },
      {
        id: 'stop-paris',
        cityName: 'París',
        country: 'Francia',
        lat: 48.8566,
        lng: 2.3522,
        nights: 3,
        accommodationCategory: '4_stars',
        hotelName: 'Hotel Mercure Paris Centre Tour Eiffel 4*',
        mealPlan: 'desayuno',
        transferIn: true,
        transferInNotes: 'Traslado privado desde aeropuerto CDG al hotel.',
        transferOut: true,
        transferOutNotes: 'Traslado privado al aeropuerto de Orly / CDG.',
        excursions: [
          'Ascenso a la Torre Eiffel y crucero panorámico por el Río Sena',
          'Visita guiada a pie por Montmartre y Museo del Louvre'
        ],
        cityDescription: 'La Ciudad de la Luz, epicentro mundial del arte, la moda y el romanticismo, con sus célebres cafés, museos y el Sena.',
        transportToNext: 'flight',
        transportNotes: 'Vuelo directo París (CDG) -> Roma (FCO)'
      },
      {
        id: 'stop-roma',
        cityName: 'Roma',
        country: 'Italia',
        lat: 41.9028,
        lng: 12.4964,
        nights: 2,
        accommodationCategory: '4_stars',
        hotelName: 'Hotel Artemide / Quirinale 4*',
        mealPlan: 'desayuno',
        transferIn: true,
        transferInNotes: 'Traslado privado desde aeropuerto FCO al hotel céntrico.',
        transferOut: true,
        transferOutNotes: 'Traslado privado desde el hotel hacia el aeropuerto FCO para el vuelo de regreso.',
        excursions: [
          'Coliseo, Foro Romano y Palatino con acceso preferencial sin colas'
        ],
        cityDescription: 'La Ciudad Eterna, una combinación inigualable de historia clásica, fuentes barrocas, plazas iluminadas y cocina italiana.',
        transportToNext: 'flight',
        transportNotes: 'Vuelo internacional de regreso'
      }
    ],
    days: []
  };

  base.days = generateItineraryDays(base);
  return base;
})();

export const PATAGONIA_ITINERARY: TravelItinerary = (() => {
  const base: TravelItinerary = {
    id: 'itinerary-patagonia-2',
    title: 'Patagonia Austral: Glaciares y Fin del Mundo',
    clientName: 'Pasajeros Tresor Travel',
    clientEmail: 'info@tresortravel.com',
    startDate: '2026-11-10',
    price: '1.950',
    currency: 'USD',
    priceConditions: 'Precio por persona en base doble. No incluye entradas a Parques Nacionales.',
    freeTextNotes: `• Incluye vuelos de cabotaje Buenos Aires - El Calafate - Ushuaia - Buenos Aires con equipaje en bodega.
• Alojamiento en hoteles 4 estrellas con desayuno buffet patagónico diario.
• Guías certificados en idioma español y traslados privados in/out.`,
    flightStart: {
      hasFlight: true,
      route: 'Origen -> Buenos Aires (AEP)',
      notes: 'Llegada y conexión a El Calafate'
    },
    flightEnd: {
      hasFlight: true,
      route: 'Ushuaia (USH) -> Buenos Aires (AEP/EZE) -> Retorno',
      notes: 'Vuelo de regreso con equipaje despachado'
    },
    stops: [
      {
        id: 'pat-1',
        cityName: 'El Calafate',
        country: 'Argentina',
        lat: -50.3379,
        lng: -72.2648,
        nights: 3,
        accommodationCategory: '4_stars',
        hotelName: 'Hotel Mirador del Lago 4*',
        mealPlan: 'desayuno',
        transferIn: true,
        transferInNotes: 'Traslado privado Aeropuerto Calafate -> Hotel.',
        transferOut: true,
        transferOutNotes: 'Traslado privado Hotel -> Aeropuerto Calafate.',
        excursions: [
          'Excursión de día completo al Glaciar Perito Moreno con Safari Náutico',
          'Navegación Todo Glaciares (Upsala y Spegazzini)'
        ],
        cityDescription: 'Tierra de imponentes hielos milenarios y estepa patagónica al pie de la Cordillera de los Andes.',
        transportToNext: 'flight',
        transportNotes: 'Vuelo directo Aerolíneas Argentinas Calafate (FTE) -> Ushuaia (USH) (1h 20m)'
      },
      {
        id: 'pat-2',
        cityName: 'Ushuaia',
        country: 'Argentina',
        lat: -54.8019,
        lng: -68.3030,
        nights: 3,
        accommodationCategory: '4_stars',
        hotelName: 'Hotel Fueguino / Los Acebos 4*',
        mealPlan: 'desayuno',
        transferIn: true,
        transferInNotes: 'Traslado privado Aeropuerto Ushuaia -> Hotel.',
        transferOut: true,
        transferOutNotes: 'Traslado privado Hotel -> Aeropuerto Ushuaia para vuelo de retorno.',
        excursions: [
          'Parque Nacional Tierra del Fuego con Tren del Fin del Mundo',
          'Navegación Canal Beagle hasta el Faro Les Eclaireurs e Isla de Lobos'
        ],
        cityDescription: 'La ciudad más austral del planeta, rodeada por el Canal Beagle y la cordillera fueguina.',
        transportToNext: 'flight',
        transportNotes: 'Vuelo de regreso a Buenos Aires'
      }
    ],
    days: []
  };

  base.days = generateItineraryDays(base);
  return base;
})();
