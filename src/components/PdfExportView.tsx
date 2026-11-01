/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { TravelItinerary } from '../types';
import { TresorLogo } from './TresorLogo';
import { RouteSvgMap } from './RouteSvgMap';
import { TravelMap2D } from './TravelMap2D';
import { TRANSPORT_LABELS, MEAL_PLAN_LABELS, ACCOMMODATION_LABELS } from '../utils/itineraryGenerator';
import { Download, Printer, X, Check, Calendar, User, DollarSign, MapPin, Plane, Car, Sparkles, Layers, Compass } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfExportViewProps {
  itinerary: TravelItinerary;
  onClose?: () => void;
  isInlinePreview?: boolean;
}

export const PdfExportView: React.FC<PdfExportViewProps> = ({
  itinerary,
  onClose,
  isInlinePreview = false,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [pdfMapStyle, setPdfMapStyle] = useState<'geographic' | 'editorial'>('editorial');

  const totalNights = itinerary.stops.reduce((acc, s) => acc + (s.nights || 0), 0);
  const totalDays = itinerary.days.length;

  const handleBrowserPrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      // Temporarily ensure high quality canvas rendering without dark artifacts or cutoffs
      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth || 850,
        onclone: (clonedDoc) => {
          // Remove any stray box-shadows or dark overlays that html2canvas might render as black squares
          const clonedArea = clonedDoc.getElementById('itinerary-pdf-printable-area');
          if (clonedArea) {
            clonedArea.style.boxShadow = 'none';
            clonedArea.style.backgroundColor = '#ffffff';
          }
          const darkPill = clonedDoc.getElementById('map-route-summary-pill');
          if (darkPill) {
            darkPill.style.display = 'none';
          }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Printable area margins (match @page 10mm margins)
      const marginX = 8;
      const marginY = 8;
      const printableWidth = pdfWidth - marginX * 2;
      const printableHeight = pdfHeight - marginY * 2;

      // Calculate total rendered height in mm based on printable width
      const imgHeight = (canvas.height * printableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let sY = 0; // Source canvas Y pixel pointer

      // Slice the canvas into exact A4 pages so elements never stretch or cross borders abruptly
      const pageCanvasHeight = (printableHeight * canvas.width) / printableWidth;

      while (heightLeft > 0) {
        // Create an individual page canvas
        const currentSliceHeight = Math.min(pageCanvasHeight, canvas.height - sY);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = currentSliceHeight;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sY,
            canvas.width,
            currentSliceHeight,
            0,
            0,
            canvas.width,
            currentSliceHeight
          );
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const sliceMmHeight = (currentSliceHeight * printableWidth) / canvas.width;

        pdf.addImage(pageImgData, 'JPEG', marginX, marginY, printableWidth, sliceMmHeight);

        sY += currentSliceHeight;
        heightLeft -= printableHeight;

        if (heightLeft > 0 && sY < canvas.height) {
          pdf.addPage();
        }
      }

      const cleanFileName = `Itinerario_${itinerary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'travel_planner'}.pdf`;
      pdf.save(cleanFileName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to browser print dialog
      window.print();
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

            {/* Itinerary Title & Client Hero */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 mb-5 sm:mb-8 relative overflow-hidden print:p-4 print:mb-4">
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

            {/* International Flights Banner (If enabled) */}
            {(itinerary.flightStart.hasFlight || itinerary.flightEnd.hasFlight) && (
              <div className="mb-5 sm:mb-8 p-3 sm:p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 print:p-2.5 print:mb-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                  <Plane className="w-4 h-4 text-amber-700" />
                  <span>Vuelos Internacionales Incluidos / Programados</span>
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

            {/* Itinerario Detallado Día por Día */}
            <div className="mb-8 space-y-4">
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
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
                    <div className="flex items-start justify-between gap-3 flex-wrap">
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
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">
                      {day.description}
                    </p>

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
