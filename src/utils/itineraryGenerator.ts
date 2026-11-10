/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TravelItinerary, CityStop, ItineraryDay, TransportType, MealPlan, AccommodationCategory } from '../types';

export const TRANSPORT_LABELS: Record<TransportType, { label: string; icon: string }> = {
  flight: { label: 'Aéreo', icon: 'Plane' },
  train: { label: 'Tren', icon: 'Train' },
  bus: { label: 'Bus', icon: 'Bus' },
  transfer: { label: 'Traslado privado', icon: 'Car' },
  ferry: { label: 'Ferry / Barco', icon: 'Ship' },
};

export const MEAL_PLAN_LABELS: Record<MealPlan, string> = {
  desayuno: 'Alojamiento y Desayuno',
  media_pension: 'Media Pensión (Desayuno y Cena)',
  pension_completa: 'Pensión Completa (Desayuno, Almuerzo y Cena)',
  all_inclusive: 'Todo Incluido (All Inclusive)',
  sin_regimen: 'Sin Régimen de comidas (Solo Alojamiento)',
};

export const ACCOMMODATION_LABELS: Record<AccommodationCategory, string> = {
  '3_stars': 'Hotel Categoría 3 Estrellas',
  '4_stars': 'Hotel Categoría 4 Estrellas',
  '5_stars': 'Hotel Categoría 5 Estrellas / Lujo',
  'boutique': 'Hotel Boutique con Encanto',
  'resort': 'Resort & Spa',
  'apart_hotel': 'Apart Hotel / Departamento',
  'estancia_lodge': 'Lodge de Naturaleza / Estancia',
  'special': 'Alojamiento Seleccionado Especial',
};

/**
 * Synchronizes city-derived fields without rebuilding or replacing day narratives.
 * Structural changes (night count/order) are intentionally handled by explicit regeneration.
 */
export function syncExistingDaysWithStops(itinerary: TravelItinerary, previousStops: CityStop[] = []): ItineraryDay[] {
  const stopById = new Map(itinerary.stops.map(stop => [stop.id, stop]));
  const previousStopById = new Map(previousStops.map(stop => [stop.id, stop]));
  const stopIndexById = new Map(itinerary.stops.map((stop, index) => [stop.id, index]));
  const hasStructuralChanges = hasStructuralStopChanges(previousStops, itinerary.stops);
  const previousGenerated = previousStops.length > 0 && !hasStructuralChanges
    ? new Map(generateItineraryDays({ ...itinerary, stops: previousStops }).map(day => [day.id, day]))
    : new Map<string, ItineraryDay>();
  const updatedGenerated = !hasStructuralChanges
    ? new Map(generateItineraryDays(itinerary).map(day => [day.id, day]))
    : new Map<string, ItineraryDay>();
  const syncedDays = itinerary.days.map(day => {
    const stop = stopById.get(day.cityId);
    if (!stop) return day;

    const stopIndex = stopIndexById.get(stop.id) ?? -1;
    const nextStop = stopIndex >= 0 ? itinerary.stops[stopIndex + 1] : undefined;
    // Update generated copy only when it still exactly matches the previous generated version.
    const oldGeneratedDay = previousGenerated.get(day.id);
    const newGeneratedDay = updatedGenerated.get(day.id);
    const isGeneratedTitle = Boolean(oldGeneratedDay && oldGeneratedDay.title === day.title);
    const isGeneratedDescription = Boolean(oldGeneratedDay && oldGeneratedDay.description === day.description);
    const title = isGeneratedTitle && newGeneratedDay ? newGeneratedDay.title : day.title;
    const description = isGeneratedDescription && newGeneratedDay ? newGeneratedDay.description : day.description;

    const isDepartureDay = day.id.endsWith('-final');
    const transportToNext = !isDepartureDay && day.isCityLastDay && nextStop
      ? { type: stop.transportToNext, notes: stop.transportNotes || undefined, targetCityName: nextStop.cityName }
      : undefined;

    const previousStopData = previousStopById.get(stop.id);
    const keptExcursions = previousStopData
      ? day.excursions.filter(exc => stop.excursions.includes(exc) || !previousStopData.excursions.includes(exc))
      : day.excursions;
    const hadSelectedExcursionRemoved = previousStopData
      ? day.excursions.some(exc => previousStopData.excursions.includes(exc) && !stop.excursions.includes(exc))
      : false;

    return {
      ...day,
      cityName: stop.cityName,
      country: stop.country,
      title,
      description,
      accommodationCategory: stop.accommodationCategory,
      hotelName: stop.hotelName || '',
      mealPlan: stop.mealPlan,
      hasTransferIn: day.isCityFirstDay && stop.transferIn,
      transferInNotes: stop.transferInNotes || undefined,
      hasTransferOut: day.isCityLastDay && stop.transferOut,
      transferOutNotes: stop.transferOutNotes || undefined,
      transportToNext,
      excursions: keptExcursions,
      isFreeDay: keptExcursions.length === 0 && (day.isFreeDay || hadSelectedExcursionRemoved),
    };
  });

  // Add newly selected excursions to available days without replacing any narrative text.
  for (const stop of itinerary.stops) {
    const previousStop = previousStopById.get(stop.id);
    if (!previousStop) continue;
    const addedExcursions = stop.excursions.filter(exc => !previousStop.excursions.includes(exc));
    const stopDays = syncedDays.filter(day => day.cityId === stop.id && !day.id.endsWith('-final'));
    const availableDays = stopDays.filter(day => !day.isCityFirstDay || stop.nights === 1);
    addedExcursions.forEach((excursion, index) => {
      if (availableDays.length === 0) return;
      const targetDay = availableDays[index % availableDays.length];
      if (!targetDay.excursions.includes(excursion)) targetDay.excursions.push(excursion);
      targetDay.isFreeDay = false;
    });
  }

  return syncedDays;
}

export function hasStructuralStopChanges(previous: CityStop[], next: CityStop[]): boolean {
  if (previous.length !== next.length) return true;
  return previous.some((stop, index) => stop.id !== next[index]?.id || stop.nights !== next[index]?.nights);
}

export function hasDayStructureDrift(itinerary: TravelItinerary): boolean {
  const expectedIds = generateItineraryDays(itinerary).map(day => day.id);
  return expectedIds.length !== itinerary.days.length || expectedIds.some((id, index) => itinerary.days[index]?.id !== id);
}

/** Marks legacy stored day edits so the explicit regeneration prompt can protect them. */
export function inferManualDayEdits(itinerary: TravelItinerary): TravelItinerary {
  const generatedById = new Map(generateItineraryDays(itinerary).map(day => [day.id, day]));
  return {
    ...itinerary,
    days: itinerary.days.map(day => {
      const generated = generatedById.get(day.id);
      return {
        ...day,
        descriptionEditedManually: day.descriptionEditedManually ?? Boolean(generated && day.description !== generated.description),
        titleEditedManually: day.titleEditedManually ?? Boolean(generated && day.title !== generated.title),
      };
    }),
  };
}

function formatDateOffset(startDateStr: string, dayOffset: number): string {
  try {
    if (!startDateStr) return `Día ${dayOffset + 1}`;
    const base = new Date(startDateStr + 'T00:00:00');
    if (isNaN(base.getTime())) return `Día ${dayOffset + 1}`;
    base.setDate(base.getDate() + dayOffset);
    return base.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return `Día ${dayOffset + 1}`;
  }
}

/**
 * Automatically synthesizes the day-by-day itinerary based on cities, nights,
 * accommodations, transfers, excursions, and international flights.
 */
export function generateItineraryDays(itinerary: TravelItinerary): ItineraryDay[] {
  const { stops, startDate, flightStart, flightEnd } = itinerary;
  if (!stops || stops.length === 0) return [];

  const days: ItineraryDay[] = [];
  let dayIndex = 1;

  stops.forEach((stop, stopIdx) => {
    const isFirstStop = stopIdx === 0;
    const isLastStop = stopIdx === stops.length - 1;
    const nights = Math.max(1, stop.nights || 1);
    const excursions = stop.excursions && stop.excursions.length > 0 ? [...stop.excursions] : [];

    // Loop through each night spent in this city
    for (let nightIndex = 0; nightIndex < nights; nightIndex++) {
      const isCityFirstDay = nightIndex === 0;
      const isCityLastNight = nightIndex === nights - 1;

      let title = '';
      let description = '';
      let isFreeDay = false;
      const dayExcursions: string[] = [];

      // Day 1 in this city (Arrival Day: check-in, transfer IN, rest from flight/journey)
      if (isCityFirstDay) {
        isFreeDay = true;
        if (isFirstStop) {
          title = `Llegada a ${stop.cityName} - Inicio del Itinerario`;
          let descParts: string[] = [];
          if (flightStart.hasFlight) {
            descParts.push(`Llegada en vuelo internacional con destino a ${stop.cityName}.`);
            if (flightStart.route) descParts.push(`Ruta aérea: ${flightStart.route}.`);
          }
          if (stop.transferIn) {
            descParts.push(`Recepción en el aeropuerto y traslado privado hacia el hotel.`);
          }
          descParts.push(`¡Bienvenidos a ${stop.cityName}! ${stop.cityDescription || 'Una ciudad fascinante llena de historia, cultura y rincones por descubrir.'}`);
          descParts.push(`Check-in en el hotel y resto de la jornada libre para descansar del vuelo internacional, relajarse y comenzar a disfrutar del entorno a su propio ritmo. Las excursiones programadas darán comienzo a partir del segundo día.`);

          // If it's only 1 night and there is an excursion explicitly provided
          if (nights === 1 && excursions.length > 0) {
            const onlyExc = excursions.shift()!;
            dayExcursions.push(onlyExc);
            descParts.push(`Por la tarde, actividad panorámica introductoria: ${onlyExc}.`);
            isFreeDay = false;
          }

          description = descParts.join(' ');
        } else {
          // Transition from previous city into this city
          const prevStop = stops[stopIdx - 1];
          const transportInfo = TRANSPORT_LABELS[prevStop.transportToNext] || { label: 'Transporte', icon: 'Car' };
          title = `Llegada a ${stop.cityName} desde ${prevStop.cityName}`;

          let descParts: string[] = [];
          descParts.push(`Desayuno. Salida en ${transportInfo.label.toLowerCase()} con destino a ${stop.cityName}${prevStop.transportNotes ? ` (${prevStop.transportNotes})` : ''}.`);
          if (stop.transferIn) {
            descParts.push(`Recepción y traslado de llegada al hotel seleccionado.`);
          }
          descParts.push(`¡Bienvenidos a ${stop.cityName}! ${stop.cityDescription || 'Llegada, check-in en el hotel y tiempo para aclimatarse.'}`);
          descParts.push(`Tarde libre para descansar del traslado, instalarse en la habitación y pasear a su propio ritmo.`);

          // If only 1 night and there is an excursion
          if (nights === 1 && excursions.length > 0) {
            const onlyExc = excursions.shift()!;
            dayExcursions.push(onlyExc);
            descParts.push(`Actividad programada: ${onlyExc}.`);
            isFreeDay = false;
          }

          description = descParts.join(' ');
        }
      } else {
        // Subsequent days (Day 2 onwards): Excursions are scheduled here!
        if (excursions.length > 0) {
          const currentExc = excursions.shift()!;
          dayExcursions.push(currentExc);
          title = `${stop.cityName} - ${currentExc}`;
          description = `Desayuno en el hotel. Salida por la mañana para disfrutar de la excursión incluida: ${currentExc}. Resto de la jornada libre para realizar compras, paseos o saborear la gastronomía local.`;
        } else {
          isFreeDay = true;
          title = `${stop.cityName} - Día Libre para Excursiones`;
          description = `Desayuno en el hotel. Día libre para realizar excursiones opcionales, explorar los principales atractivos turísticos, museos o relajarse disfrutando de los encantos de ${stop.cityName}.`;
        }
      }

      // Next transport details if this is the last night in this city and not the final stop
      let nextTransportObj: ItineraryDay['transportToNext'] = undefined;
      if (isCityLastNight && !isLastStop) {
        const nextStop = stops[stopIdx + 1];
        nextTransportObj = {
          type: stop.transportToNext,
          notes: stop.transportNotes || undefined,
          targetCityName: nextStop.cityName,
        };
      }

      days.push({
        id: `day-${dayIndex}-${stop.id}`,
        dayNumber: dayIndex,
        dateStr: formatDateOffset(startDate, dayIndex - 1),
        cityId: stop.id,
        cityName: stop.cityName,
        country: stop.country,
        title,
        description,
        isCityFirstDay,
        isCityLastDay: isCityLastNight,
        hasTransferIn: isCityFirstDay && stop.transferIn,
        transferInNotes: stop.transferInNotes || undefined,
        hasTransferOut: isCityLastNight && stop.transferOut,
        transferOutNotes: stop.transferOutNotes || undefined,
        excursions: dayExcursions,
        isFreeDay,
        accommodationCategory: stop.accommodationCategory,
        hotelName: stop.hotelName || '',
        mealPlan: stop.mealPlan,
        transportToNext: nextTransportObj,
        internationalFlightNote: isFirstStop && isCityFirstDay && flightStart.hasFlight ? flightStart.route : undefined,
      });

      dayIndex++;
    }
  });

  // Final Departure Day (After the last night)
  const lastStop = stops[stops.length - 1];
  let finalDayDesc = `Desayuno en el hotel. A la hora convenida`;
  if (lastStop.transferOut) {
    finalDayDesc += `, traslado desde el hotel hacia el aeropuerto/estación`;
  } else {
    finalDayDesc += `, check-out del hotel`;
  }
  if (flightEnd.hasFlight) {
    finalDayDesc += ` para abordar el vuelo internacional de regreso${flightEnd.route ? ` (${flightEnd.route})` : ''}.`;
  } else {
    finalDayDesc += `. Fin de nuestros servicios y del itinerario programado. ¡Feliz viaje de regreso!`;
  }

  days.push({
    id: `day-${dayIndex}-final`,
    dayNumber: dayIndex,
    dateStr: formatDateOffset(startDate, dayIndex - 1),
    cityId: lastStop.id,
    cityName: lastStop.cityName,
    country: lastStop.country,
    title: `${lastStop.cityName} - Regreso / Fin del Itinerario`,
    description: finalDayDesc,
    isCityFirstDay: false,
    isCityLastDay: true,
    hasTransferIn: false,
    hasTransferOut: lastStop.transferOut,
    transferOutNotes: lastStop.transferOutNotes || undefined,
    excursions: [],
    isFreeDay: false,
    accommodationCategory: lastStop.accommodationCategory,
    hotelName: lastStop.hotelName || '',
    mealPlan: lastStop.mealPlan,
    internationalFlightNote: flightEnd.hasFlight ? (flightEnd.route || 'Vuelo internacional de regreso') : undefined,
  });

  return days;
}
