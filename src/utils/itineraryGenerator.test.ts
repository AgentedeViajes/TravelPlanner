import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_ITINERARY } from '../data/defaultItineraries';
import { CityStop, TravelItinerary } from '../types';
import { generateItineraryDays, hasDayStructureDrift, hasStructuralStopChanges, inferManualDayEdits, syncExistingDaysWithStops } from './itineraryGenerator';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function editStop(base: TravelItinerary, update: (stop: CityStop) => void): TravelItinerary {
  const itinerary = clone(base);
  const stop = itinerary.stops[0];
  const previousStops = clone(itinerary.stops);
  update(stop);
  itinerary.days = syncExistingDaysWithStops(itinerary, previousStops);
  return itinerary;
}

describe('protección de ediciones manuales', () => {
  it('corrige Madrdi por Madrid en referencias de ciudad sin reescribir narrativas', () => {
    const base = clone(INITIAL_ITINERARY);
    const stop = base.stops[0];
    stop.cityName = 'Madrdi';
    base.days = generateItineraryDays(base);
    const previousStops = clone(base.stops);
    const days = base.days.filter(day => day.cityId === stop.id);
    days.forEach(day => {
      day.description = 'Texto libre del agente que menciona Madrid y Madrdi.';
    });
    stop.cityName = 'Madrid';
    base.days = syncExistingDaysWithStops(base, previousStops);
    const updatedDays = base.days.filter(day => day.cityId === stop.id);
    assert.ok(updatedDays.every(day => day.cityName === 'Madrid'));
    assert.ok(updatedDays.every(day => !day.title.includes('Madrdi')));
    assert.ok(updatedDays.every(day => day.description === 'Texto libre del agente que menciona Madrid y Madrdi.'));
  });

  it('actualiza solamente hotel y régimen preservando descripciones', () => {
    const base = clone(INITIAL_ITINERARY);
    const day = base.days[1];
    day.description = 'Descripción manual preservada.';
    const hotel = editStop(base, stop => { stop.hotelName = 'Hotel Nuevo'; stop.mealPlan = 'media_pension'; });
    const cityDays = hotel.days.filter(item => item.cityId === hotel.stops[0].id);
    assert.ok(cityDays.every(item => item.hotelName === 'Hotel Nuevo' && item.mealPlan === 'media_pension'));
    assert.equal(hotel.days.find(item => item.id === day.id)?.description, 'Descripción manual preservada.');
  });

  it('propaga altas y bajas de traslados IN/OUT', () => {
    const base = clone(INITIAL_ITINERARY);
    const previous = clone(base.stops);
    base.stops[0].transferIn = false;
    base.stops[0].transferOut = false;
    base.days = syncExistingDaysWithStops(base, previous);
    assert.ok(base.days.filter(day => day.cityId === base.stops[0].id).every(day => !day.hasTransferIn && !day.hasTransferOut));
    const next = clone(base.stops);
    base.stops[0].transferIn = true;
    base.stops[0].transferOut = true;
    base.days = syncExistingDaysWithStops(base, next);
    assert.equal(base.days.find(day => day.cityId === base.stops[0].id && day.isCityFirstDay)?.hasTransferIn, true);
    assert.equal(base.days.find(day => day.cityId === base.stops[0].id && day.isCityLastDay)?.hasTransferOut, true);
  });

  it('agrega y quita excursiones seleccionadas sin tocar descripciones', () => {
    const base = clone(INITIAL_ITINERARY);
    const previous = clone(base.stops);
    const firstCityDays = base.days.filter(day => day.cityId === base.stops[0].id);
    firstCityDays.forEach(day => { day.description = 'Narrativa manual'; });
    base.stops[0].excursions = [...base.stops[0].excursions, 'Excursión nueva'];
    base.days = syncExistingDaysWithStops(base, previous);
    assert.ok(base.days.some(day => day.excursions.includes('Excursión nueva')));
    assert.ok(base.days.filter(day => day.cityId === base.stops[0].id).every(day => day.description === 'Narrativa manual'));

    const beforeRemoval = clone(base.stops);
    base.stops[0].excursions = base.stops[0].excursions.filter(exc => exc !== 'Excursión nueva');
    base.days = syncExistingDaysWithStops(base, beforeRemoval);
    assert.ok(base.days.every(day => !day.excursions.includes('Excursión nueva')));
  });

  it('detecta cambios de noches u orden para advertir sin reconstruir jornadas', () => {
    const base = clone(INITIAL_ITINERARY);
    const previousStops = clone(base.stops);
    base.stops[0].nights += 1;
    assert.equal(hasStructuralStopChanges(previousStops, base.stops), true);
    assert.equal(syncExistingDaysWithStops(base, previousStops).length, base.days.length);
    assert.equal(hasDayStructureDrift(base), true);
    const reordered = clone(previousStops).reverse();
    assert.equal(hasStructuralStopChanges(previousStops, reordered), true);
  });

  it('mantiene una edición manual al modificar datos de ciudad', () => {
    const base = clone(INITIAL_ITINERARY);
    const target = base.days[1];
    target.description = 'Texto editado en jornada';
    target.descriptionEditedManually = true;
    const updated = editStop(base, stop => { stop.hotelName = 'Nuevo Hotel'; });
    assert.equal(updated.days.find(day => day.id === target.id)?.description, 'Texto editado en jornada');
  });

  it('regenera explícitamente todas las jornadas desde las ciudades', () => {
    const base = clone(INITIAL_ITINERARY);
    base.days[0].description = 'Manual';
    base.days[0].descriptionEditedManually = true;
    const regenerated = generateItineraryDays(base);
    assert.notEqual(regenerated[0].description, 'Manual');
    assert.equal(regenerated.length, base.stops.reduce((sum, stop) => sum + Math.max(1, stop.nights), 0) + 1);
  });

  it('detecta ediciones manuales guardadas antes de agregar los marcadores', () => {
    const legacy = clone(INITIAL_ITINERARY);
    legacy.days[0].description = 'Texto editado en una versión anterior.';
    const restored = inferManualDayEdits(legacy);
    assert.equal(restored.days[0].descriptionEditedManually, true);
  });

  it('deja conectados los endpoints Gemini y la exportación PDF', async () => {
    const fs = await import('node:fs/promises');
    const [server, cityEditor, pdfView] = await Promise.all([
      fs.readFile(new URL('../../server.ts', import.meta.url), 'utf8'),
      fs.readFile(new URL('../components/CityStopEditorModal.tsx', import.meta.url), 'utf8'),
      fs.readFile(new URL('../components/PdfExportView.tsx', import.meta.url), 'utf8'),
    ]);
    assert.match(server, /\/api\/ai\/describe-city/);
    assert.match(server, /\/api\/ai\/suggest-excursions/);
    assert.match(cityEditor, /fetch\('\/api\/ai\/describe-city'/);
    assert.match(cityEditor, /fetch\('\/api\/ai\/suggest-excursions'/);
    assert.match(pdfView, /@react-pdf\/renderer/);
    assert.match(pdfView, /\.toBlob\(\)/);
    assert.doesNotMatch(pdfView, /html2canvas|jspdf/);
  });
});
