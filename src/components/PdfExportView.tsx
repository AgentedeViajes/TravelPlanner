/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from 'react';
import { TravelItinerary } from '../types';
import { TresorLogo } from './TresorLogo';
import { RouteSvgMap } from './RouteSvgMap';
import { TravelMap2D } from './TravelMap2D';
import { TRANSPORT_LABELS, MEAL_PLAN_LABELS, ACCOMMODATION_LABELS } from '../utils/itineraryGenerator';
import { Download, Printer, X, Check, Calendar, User, DollarSign, MapPin, Plane, Car, Sparkles, Layers, Compass } from 'lucide-react';
import { ImagePlus, Trash2 } from 'lucide-react';

interface PdfExportViewProps {
  itinerary: TravelItinerary;
  onClose?: () => void;
  isInlinePreview?: boolean;
  onUpdateItinerary?: Dispatch<SetStateAction<TravelItinerary>>;
}

async function compressLocalPhoto(file: File, maxWidth: number, maxHeight: number): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Seleccione un archivo de imagen.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo procesar la imagen.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.82);
}

async function normalizeLogoForPdf(logoUrl?: string): Promise<string | undefined> {
  if (!logoUrl) {
    const response = await fetch('/logo.svg');
    if (!response.ok) return undefined;
    const svg = await response.text();
    logoUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
  if (/^data:image\/(png|jpe?g);/i.test(logoUrl)) return logoUrl;
  if (!logoUrl.startsWith('data:image/')) return undefined;
  const image = new Image();
  image.src = logoUrl;
  await image.decode();
  const scale = Math.min(3, 1800 / Math.max(1, image.naturalWidth));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo preparar el logotipo para el PDF.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

export const PdfExportView: React.FC<PdfExportViewProps> = ({
  itinerary,
  onClose,
  isInlinePreview = false,
  onUpdateItinerary,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [pdfMapStyle, setPdfMapStyle] = useState<'geographic' | 'editorial'>('editorial');
  const [imageError, setImageError] = useState('');

  const totalNights = itinerary.stops.reduce((acc, s) => acc + (s.nights || 0), 0);
  const totalDays = itinerary.days.length;
  const featuredPhotoCount = itinerary.days.filter(day => day.imageUrl).length;
  const routeText = itinerary.stops.map(stop => stop.cityName).join('  →  ');
  const dateRange = itinerary.days.length
    ? `${itinerary.days[0].dateStr || 'Fecha a definir'} — ${itinerary.days[itinerary.days.length - 1].dateStr || 'Fecha a definir'}`
    : 'Fechas a definir';

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>, update: (photoUrl: string) => void, bounds: [number, number]) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onUpdateItinerary) return;
    setImageError('');
    try {
      const photoUrl = await compressLocalPhoto(file, bounds[0], bounds[1]);
      update(photoUrl);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'No se pudo cargar la imagen.');
    }
  };

  const setCoverPhoto = (photoUrl: string) => onUpdateItinerary?.(current => ({ ...current, coverImageUrl: photoUrl }));
  const setCityPhoto = (stopId: string, photoUrl?: string) => onUpdateItinerary?.(current => ({
    ...current,
    stops: current.stops.map(stop => stop.id === stopId ? { ...stop, imageUrl: photoUrl } : stop),
  }));
  const setDayPhoto = (dayId: string, photoUrl?: string) => onUpdateItinerary?.(current => ({
    ...current,
    days: current.days.map(day => day.id === dayId ? { ...day, imageUrl: photoUrl } : day),
  }));

  const handleBrowserPrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);
    setImageError('');

    try {
      const [{ pdf }, { TravelPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./TravelPdfDocument'),
      ]);
      const pdfItinerary = { ...itinerary, logoUrl: await normalizeLogoForPdf(itinerary.logoUrl) };
      const blob = await pdf(<TravelPdfDocument itinerary={pdfItinerary} />).toBlob();
      const fileName = `Itinerario_${itinerary.title.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase() || 'travel_planner'}.pdf`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setDownloadSuccess(true);
      window.setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (error) {
      console.error('Error generating PDF with React PDF:', error);
      setImageError(error instanceof Error ? `No se pudo generar el PDF: ${error.message}` : 'No se pudo generar el PDF. Verifique las fotografías locales e intente nuevamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className={isInlinePreview ? 'w-full print:p-0' : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto print:static print:inset-auto print:p-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible'}>
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden w-full print:shadow-none print:border-none print:rounded-none print:overflow-visible ${isInlinePreview ? '' : 'max-w-5xl max-h-[95vh] print:max-w-none print:max-h-none'}`}>
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <TresorLogo className="h-7" />
            <div className="border-l border-slate-200 pl-3">
              <h2 className="text-sm font-bold text-slate-800">
                Documento de Itinerario Oficial (PDF)
              </h2>
              <p className="text-xs text-slate-500">
                Diseñado para presentación al cliente y entrega impresa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBrowserPrint}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Abrir diálogo de impresión para guardar en PDF vectorial"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-[#b91c3e] hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Generando...
                </span>
              ) : downloadSuccess ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-100 font-bold">
                  <Check className="w-4 h-4" /> ¡Descargado!
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {imageError && <p role="alert" className="pdf-export-controls print:hidden border-b border-rose-200 bg-rose-50 px-6 py-2 text-xs font-semibold text-rose-800">{imageError}</p>}

        {/* Printable Document Sheet Container */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-200/60 print:bg-white print:p-0 print:overflow-visible">
          <div
            id="itinerary-pdf-printable-area"
            ref={printAreaRef}
            className="max-w-[850px] mx-auto bg-white p-8 sm:p-12 shadow-xl print:shadow-none print:p-0 print:max-w-none text-slate-800 rounded-xl print:rounded-none border border-slate-100 print:border-none"
          >
            {/* Header: Brand Logo & Agency Details */}
            <div className="flex items-center justify-between border-b-2 border-[#b91c3e] pb-4 sm:pb-6 mb-5 sm:mb-8 gap-4 print:pb-4 print:mb-4">
              <div className="space-y-1">
                <TresorLogo className="h-9 sm:h-12" customLogoUrl={itinerary.logoUrl} />
                <p className="text-[11px] font-semibold text-slate-500 tracking-wide">
                  AGENCIA DE VIAJES & TURISMO • TRAVEL PLANNER
                </p>
              </div>

              <div className="text-right space-y-0.5">
                <span className="inline-block px-3 py-1 bg-rose-50 text-[#b91c3e] border border-rose-100 text-xs font-extrabold rounded-full tracking-wide">
                  PROPUESTA DE ITINERARIO
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  Fecha de emisión: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Portada panorámica: acepta una imagen local y conserva un estado elegante sin foto. */}
            <section className="pdf-cover pdf-keep-together relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-[#172d3b]">
              {itinerary.coverImageUrl ? (
                <img src={itinerary.coverImageUrl} alt={`Destino del viaje ${itinerary.title}`} className="pdf-cover-image block w-full object-cover" />
              ) : (
                <div className="pdf-cover-image pdf-cover-placeholder flex w-full items-end bg-[radial-gradient(ellipse_at_80%_20%,rgba(224,173,119,.55),transparent_35%),linear-gradient(125deg,#183744_0%,#385b61_48%,#b57659_100%)]">
                  <div className="p-7 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">Una experiencia a medida</span>
                    <div className="mt-3 h-px w-14 bg-white/70" />
                    <p className="mt-2 text-sm font-medium tracking-wide text-white/90">{routeText || 'Descubrí tu próximo destino'}</p>
                  </div>
                  <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/20" />
                  <div className="pointer-events-none absolute -right-4 -top-16 h-56 w-56 rounded-full border border-white/15" />
                </div>
              )}
              {onUpdateItinerary && (
                <div className="pdf-export-controls absolute right-3 top-3 flex gap-2 print:hidden">
                  <label className="cursor-pointer rounded-lg border border-white/40 bg-slate-950/60 px-3 py-2 text-[11px] font-bold text-white shadow backdrop-blur-sm hover:bg-slate-950/80">
                    <span className="inline-flex items-center gap-1.5"><ImagePlus className="h-3.5 w-3.5" />{itinerary.coverImageUrl ? 'Cambiar portada' : 'Cargar portada'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={event => handlePhotoUpload(event, setCoverPhoto, [1600, 720])} />
                  </label>
                  {itinerary.coverImageUrl && (
                    <button type="button" onClick={() => onUpdateItinerary(current => ({ ...current, coverImageUrl: undefined }))} className="rounded-lg border border-white/40 bg-slate-950/60 p-2 text-white hover:bg-slate-950/80" aria-label="Quitar fotografía de portada">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Itinerary Title & Client Hero */}
            <div className="pdf-keep-together bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 mb-5 sm:mb-8 relative overflow-hidden print:p-4 print:mb-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#b91c3e]/5 rounded-bl-full pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div className="md:col-span-8 space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight print:text-xl">
                    {itinerary.title || 'Itinerario Turístico'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#b91c3e]" />
                      <span>Pasajero / Cliente:</span>
                      <strong className="text-slate-900">{itinerary.clientName || 'A definir'}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#b91c3e]" />
                      <span>Fechas:</span>
                      <strong className="text-slate-900">{dateRange}</strong>
                    </div>
                    {itinerary.startDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#b91c3e]" />
                        <span>Salida:</span>
                        <strong className="text-slate-900">
                          {new Date(itinerary.startDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </strong>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#b91c3e]" />
                      <span>Duración:</span>
                      <strong className="text-slate-900">{totalDays} Días / {totalNights} Noches</strong>
                    </div>
                  </div>
                </div>

                {/* Valor del Itinerario Banner */}
                <div className="md:col-span-4 bg-white border-2 border-[#b91c3e] rounded-xl p-3 sm:p-4 text-center shadow-sm print:p-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">
                    Valor del Itinerario
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#b91c3e] print:text-xl">
                    {itinerary.currency} {itinerary.price || '0'}
                  </div>
                  {itinerary.priceConditions && (
                    <p className="text-[10.5px] text-slate-500 mt-1 font-medium leading-tight">
                      {itinerary.priceConditions}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <section className="pdf-keep-together mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Duración', value: `${totalDays} días` },
                { label: 'Estadía', value: `${totalNights} noches` },
                { label: 'Destinos', value: `${itinerary.stops.length} ciudades` },
                { label: 'Recorrido', value: routeText || 'A definir' },
              ].map(metric => (
                <div key={metric.label} className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                  <span className="block text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{metric.label}</span>
                  <span className="mt-1 block text-xs font-bold text-slate-800">{metric.value}</span>
                </div>
              ))}
            </section>

            {/* Start and return flights, which may be international or domestic. */}
            {(itinerary.flightStart.hasFlight || itinerary.flightEnd.hasFlight) && (
              <div className="mb-5 sm:mb-8 p-3 sm:p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 print:p-2.5 print:mb-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                  <Plane className="w-4 h-4 text-amber-700" />
                  <span>Vuelos de Inicio y Regreso</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {itinerary.flightStart.hasFlight && (
                    <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200/60">
                      <div className="font-bold text-slate-800">✈️ Vuelo de Inicio:</div>
                      <div className="text-slate-700 font-medium">{itinerary.flightStart.route}</div>
                      {itinerary.flightStart.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{itinerary.flightStart.notes}</div>
                      )}
                    </div>
                  )}
                  {itinerary.flightEnd.hasFlight && (
                    <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200/60">
                      <div className="font-bold text-slate-800">✈️ Vuelo de Retorno:</div>
                      <div className="text-slate-700 font-medium">{itinerary.flightEnd.route}</div>
                      {itinerary.flightEnd.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{itinerary.flightEnd.notes}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2D Route Map Visualizer (With nights badge and geographic context) */}
            <div className="pdf-map-section mb-6 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#b91c3e]" />
                    <span>Mapa 2D del Recorrido (Ciudades y Noches)</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    • {itinerary.stops.length} ciudades visitadas
                  </span>
                </div>

                {/* Switch style control (hidden when printing) */}
                <div className="print:hidden flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPdfMapStyle('geographic')}
                    className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                      pdfMapStyle === 'geographic'
                        ? 'bg-white text-[#b91c3e] shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Mapa geográfico real con calles, costas y relieve (Leaflet)"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Mapa Geográfico</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfMapStyle('editorial')}
                    className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                      pdfMapStyle === 'editorial'
                        ? 'bg-white text-[#b91c3e] shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Mapa editorial ilustrado claro de alta resolución (SVG)"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Mapa Editorial</span>
                  </button>
                </div>
              </div>

              {/* Render Selected Map - Optimized height for A4 page harmony */}
              <div className="pdf-screen-map">
              {pdfMapStyle === 'geographic' ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm print:h-[260px]">
                  <TravelMap2D
                    stops={itinerary.stops}
                    className="w-full h-64 sm:h-72 print:h-[260px]"
                    isPrintMode={true}
                  />
                </div>
              ) : (
                <RouteSvgMap
                  stops={itinerary.stops}
                  className="w-full h-64 sm:h-72 print:h-[260px] rounded-xl"
                />
              )}
              </div>
              <div className="pdf-export-map hidden">
                <RouteSvgMap
                  stops={itinerary.stops}
                  className="w-full h-64 rounded-xl"
                />
              </div>
            </div>

            {/* Resumen de Ciudades, Alojamientos y Transportes */}
            <div className="pdf-summary-table-section mb-6 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Resumen de Estancias y Conexiones
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Ciudad</th>
                      <th className="p-2.5">Noches</th>
                      <th className="p-2.5">Categoría Hotel</th>
                      <th className="p-2.5">Régimen</th>
                      <th className="p-2.5">Traslados</th>
                      <th className="p-2.5">Próx. Transporte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itinerary.stops.map((stop, idx) => {
                      const isLast = idx === itinerary.stops.length - 1;
                      const transport = TRANSPORT_LABELS[stop.transportToNext] || { label: 'Fin' };
                      return (
                        <tr key={stop.id} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">
                            {stop.cityName} <span className="text-[10px] text-slate-500 font-normal">({stop.country})</span>
                          </td>
                          <td className="p-2.5">
                            <span className="inline-block bg-rose-100 text-[#b91c3e] font-extrabold px-2 py-0.5 rounded-full text-[11px]">
                              🌙 {stop.nights} {stop.nights === 1 ? 'noche' : 'noches'}
                            </span>
                          </td>
                          <td className="p-2.5 font-medium text-slate-700">
                            {ACCOMMODATION_LABELS[stop.accommodationCategory] || stop.accommodationCategory}
                            {stop.hotelName && <div className="text-[10.5px] text-slate-500 italic">{stop.hotelName}</div>}
                          </td>
                          <td className="p-2.5 font-medium text-slate-700">
                            {MEAL_PLAN_LABELS[stop.mealPlan] || stop.mealPlan}
                          </td>
                          <td className="p-2.5 text-[11px]">
                            {stop.transferIn && <span className="text-emerald-700 font-semibold block">✓ In</span>}
                            {stop.transferOut && <span className="text-emerald-700 font-semibold block">✓ Out</span>}
                            {!stop.transferIn && !stop.transferOut && <span className="text-slate-400">Por cuenta propia</span>}
                          </td>
                          <td className="p-2.5 font-medium text-slate-700">
                            {isLast ? (
                              <span className="text-slate-400 italic">Vuelo regreso / Fin</span>
                            ) : (
                              <span>{transport.label}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fichas de destino con servicios y aclaraciones completas */}
            <section className="pdf-city-section mb-8 space-y-4">
              <div className="flex items-end justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#b91c3e]">Tu recorrido</span>
                  <h3 className="mt-1 text-sm font-extrabold text-slate-900">Destinos y servicios</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">{itinerary.stops.length} paradas</span>
              </div>
              {itinerary.stops.map((stop, idx) => {
                const isLast = idx === itinerary.stops.length - 1;
                const transport = TRANSPORT_LABELS[stop.transportToNext] || { label: 'Conexión' };
                return (
                  <article key={stop.id} className="pdf-city-card pdf-keep-together overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[1fr_245px] sm:p-5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#b91c3e] text-xs font-extrabold text-white">{idx + 1}</span>
                          <h4 className="text-base font-extrabold text-slate-900">{stop.cityName}</h4>
                          <span className="text-xs font-medium text-slate-500">{stop.country}</span>
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-extrabold text-[#b91c3e]">{stop.nights} {stop.nights === 1 ? 'noche' : 'noches'}</span>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-slate-600">{stop.cityDescription || `Estadía en ${stop.cityName}.`}</p>
                        <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-2 text-[11px] sm:grid-cols-2">
                          <p><strong className="text-slate-800">Alojamiento:</strong> <span className="text-slate-600">{stop.hotelName || 'A definir'} · {ACCOMMODATION_LABELS[stop.accommodationCategory] || stop.accommodationCategory}</span></p>
                          <p><strong className="text-slate-800">Régimen:</strong> <span className="text-slate-600">{MEAL_PLAN_LABELS[stop.mealPlan] || stop.mealPlan}</span></p>
                          <div>
                            <strong className="text-slate-800">Traslado IN:</strong>{' '}
                            <span className="text-slate-600">{stop.transferIn ? stop.transferInNotes || 'Incluido' : 'No incluido'}</span>
                          </div>
                          <div>
                            <strong className="text-slate-800">Traslado OUT:</strong>{' '}
                            <span className="text-slate-600">{stop.transferOut ? stop.transferOutNotes || 'Incluido' : 'No incluido'}</span>
                          </div>
                        </div>
                        {stop.excursions.length > 0 && (
                          <div className="mt-3">
                            <strong className="text-[11px] text-slate-800">Excursiones seleccionadas</strong>
                            <ul className="mt-1 space-y-1 text-[11px] text-slate-600">
                              {stop.excursions.map((excursion, excursionIndex) => <li key={`${stop.id}-exc-${excursionIndex}`}>• {excursion}</li>)}
                            </ul>
                          </div>
                        )}
                        {!isLast && (
                          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                            <strong>Conexión a {itinerary.stops[idx + 1].cityName}:</strong> {transport.label}{stop.transportNotes ? ` · ${stop.transportNotes}` : ''}
                          </div>
                        )}
                        {isLast && itinerary.flightEnd.hasFlight && (
                          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                            <strong>Regreso:</strong> {itinerary.flightEnd.route}{itinerary.flightEnd.notes ? ` · ${itinerary.flightEnd.notes}` : ''}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        {stop.imageUrl ? (
                          <img src={stop.imageUrl} alt={`${stop.cityName}`} className="pdf-city-photo block w-full rounded-xl object-cover" />
                        ) : (
                          <div className="pdf-city-photo flex w-full items-end rounded-xl border border-slate-200 bg-[linear-gradient(145deg,#e8eef0,#cedadd_55%,#f5eee5)] p-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stop.cityName} · {stop.country}</span>
                          </div>
                        )}
                        {onUpdateItinerary && (
                          <div className="pdf-export-controls mt-2 flex items-center justify-between print:hidden">
                            <label className="cursor-pointer text-[10px] font-bold text-[#b91c3e] hover:underline">
                              {stop.imageUrl ? 'Cambiar fotografía' : 'Añadir fotografía local'}
                              <input type="file" accept="image/*" className="hidden" onChange={event => handlePhotoUpload(event, photoUrl => setCityPhoto(stop.id, photoUrl), [520, 336])} />
                            </label>
                            {stop.imageUrl && <button type="button" onClick={() => setCityPhoto(stop.id)} className="text-[10px] font-bold text-slate-400 hover:text-rose-700">Quitar</button>}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Itinerario Detallado Día por Día */}
            <div className="mb-8 space-y-4">
              <div className="pdf-keep-with-next border-b border-slate-200 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#b91c3e] uppercase tracking-wider">
                  Itinerario Detallado Día a Día
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  Total {itinerary.days.length} jornadas
                </span>
              </div>

              <div className="space-y-4">
                {itinerary.days.map((day) => (
                  <div
                    key={day.id}
                    className="pdf-day-card p-4 rounded-xl border border-slate-200 bg-white hover:border-rose-200 transition-colors space-y-2 relative"
                  >
                    {/* Day Header */}
                    <div className="pdf-day-card-header flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#b91c3e] text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                          {day.dayNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {day.title}
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {day.dateStr} • {day.cityName}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                        {day.mealPlan && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                            🍽️ {day.mealPlan.replace('_', ' ')}
                          </span>
                        )}
                        {day.hotelName && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                            🏨 {day.hotelName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Day Narrative Description */}
                    <div className={day.imageUrl ? 'grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_144px]' : ''}>
                      <p className="text-xs text-slate-700 leading-relaxed text-justify">
                        {day.description}
                      </p>
                      {day.imageUrl && (
                        <img src={day.imageUrl} alt={`Jornada ${day.dayNumber} en ${day.cityName}`} className="pdf-day-photo w-full rounded-lg object-cover" />
                      )}
                    </div>
                    {onUpdateItinerary && (
                      <div className="pdf-export-controls flex justify-end print:hidden">
                        {day.imageUrl ? (
                          <button type="button" onClick={() => setDayPhoto(day.id)} className="text-[10px] font-bold text-slate-400 hover:text-rose-700">Quitar foto destacada</button>
                        ) : (
                          <label className={`cursor-pointer text-[10px] font-bold ${featuredPhotoCount >= 3 ? 'text-slate-300' : 'text-[#b91c3e] hover:underline'}`} title={featuredPhotoCount >= 3 ? 'Se permiten hasta 3 fotos destacadas por itinerario' : 'Añadir una foto local a esta jornada'}>
                            {featuredPhotoCount >= 3 ? 'Límite de 3 fotos destacadas' : '＋ Foto destacada (opcional)'}
                            <input type="file" accept="image/*" disabled={featuredPhotoCount >= 3} className="hidden" onChange={event => handlePhotoUpload(event, photoUrl => setDayPhoto(day.id, photoUrl), [380, 280])} />
                          </label>
                        )}
                      </div>
                    )}

                    {/* Excursions / Badges */}
                    {day.excursions && day.excursions.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-rose-900">Excursiones incluidas:</span>
                        {day.excursions.map((exc, idx) => (
                          <span
                            key={idx}
                            className="bg-rose-50 text-[#b91c3e] border border-rose-200 px-2 py-0.5 rounded text-[10.5px] font-bold"
                          >
                            ✓ {exc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Free Day Indicator */}
                    {day.isFreeDay && (!day.excursions || day.excursions.length === 0) && (
                      <div className="text-[11px] font-medium text-slate-500 italic">
                        🏖️ Jornada libre para actividades personales o excursiones opcionales.
                      </div>
                    )}

                    {/* Transport to next city banner if applicable */}
                    {day.transportToNext && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                        <Car className="w-4 h-4 text-[#b91c3e]" />
                        <span>
                          <strong>Conexión:</strong> Salida en {TRANSPORT_LABELS[day.transportToNext.type]?.label || 'transporte'} hacia <strong>{day.transportToNext.targetCityName}</strong>. {day.transportToNext.notes}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Free Text Notes / Observaciones / Términos */}
            {itinerary.freeTextNotes && (
              <div className="pdf-notes-section mb-8 p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                  Observaciones, Inclusiones y Condiciones Generales
                </h4>
                <div className="whitespace-pre-line leading-relaxed font-medium">
                  {itinerary.freeTextNotes}
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="pdf-notes-section border-t border-slate-200 pt-6 text-center text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-800">
                Tresor Travel • Especialistas en Experiencias Turísticas a Medida
              </p>
              <p className="text-[11px]">
                Itinerario sujeto a disponibilidad al momento de confirmar la reserva • Documento emitido con Travel Planner
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
