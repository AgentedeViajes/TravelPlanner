/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ItineraryDay } from '../types';
import { TRANSPORT_LABELS, MEAL_PLAN_LABELS, ACCOMMODATION_LABELS } from '../utils/itineraryGenerator';
import { Edit3, RefreshCw, Calendar, MapPin, Building, Utensils, Compass, Car, Plane, Sparkles, CheckCircle } from 'lucide-react';

interface DailyItineraryTimelineProps {
  days: ItineraryDay[];
  onEditDay: (day: ItineraryDay) => void;
  onRegenerateDays: () => void;
}

export const DailyItineraryTimeline: React.FC<DailyItineraryTimelineProps> = ({
  days,
  onEditDay,
  onRegenerateDays,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Itinerario Detallado Día por Día
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-[#b91c3e] text-xs font-extrabold">
              {days.length} Jornadas programadas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generado automáticamente en base a las ciudades, noches, excursiones y transportes. Cada día es 100% editable.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegenerateDays}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300/60"
          title="Vuelve a calcular los días en base a los cambios de ciudades manteniendo la estructura"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          <span>Regenerar desde Ciudades</span>
        </button>
      </div>

      {/* Timeline of Days */}
      {days.length === 0 ? (
        <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
          Agregue ciudades para que el sistema construya el cronograma diario.
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
          {days.map((day) => {
            const hasExcursions = day.excursions && day.excursions.length > 0;
            const transport = day.transportToNext ? TRANSPORT_LABELS[day.transportToNext.type] : null;

            return (
              <div key={day.id} className="relative group">
                {/* Timeline Circle Marker */}
                <div className="absolute -left-[35px] top-1.5 w-7 h-7 rounded-full bg-[#b91c3e] text-white flex items-center justify-center font-extrabold text-xs shadow-md border-2 border-white">
                  {day.dayNumber}
                </div>

                {/* Day Card */}
                <div className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-rose-200 hover:shadow-md transition-all space-y-3">
                  {/* Title & Actions */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-slate-900">
                          {day.title}
                        </h3>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-md">
                          📍 {day.cityName}
                        </span>
                        {day.isCityFirstDay && (
                          <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-[#b91c3e] text-[10.5px] font-extrabold rounded-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Llegada a {day.cityName}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-400 mt-0.5">
                        {day.dateStr}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditDay(day)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-rose-50 hover:text-[#b91c3e] border border-slate-200 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                      title="Editar contenido y actividades de este día"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Día</span>
                    </button>
                  </div>

                  {/* Day Description */}
                  <div className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200/60 font-medium">
                    {day.description}
                  </div>

                  {/* Badges / Features: Excursions, Transfers, Meals, Transport */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {/* Excursions */}
                    {hasExcursions ? (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[11px] font-bold text-rose-900">Excursiones:</span>
                        {day.excursions.map((exc, idx) => (
                          <span
                            key={idx}
                            className="bg-rose-100/90 text-[#b91c3e] px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> {exc}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="bg-amber-100/80 text-amber-900 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        🏖️ Día libre para realizar excursiones
                      </span>
                    )}

                    {/* Meal Plan */}
                    <span className="bg-slate-200/70 text-slate-800 px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-slate-600" />
                      {MEAL_PLAN_LABELS[day.mealPlan] || day.mealPlan}
                    </span>

                    {/* Hotel */}
                    {day.hotelName && (
                      <span className="bg-slate-200/70 text-slate-800 px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-600" />
                        {day.hotelName}
                      </span>
                    )}

                    {/* Traslado IN badge */}
                    {day.hasTransferIn && (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
                        <Car className="w-3 h-3" /> Traslado IN incluido
                      </span>
                    )}

                    {/* Traslado OUT badge */}
                    {day.hasTransferOut && (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
                        <Car className="w-3 h-3" /> Traslado OUT incluido
                      </span>
                    )}
                  </div>

                  {/* Connecting Transport Banner */}
                  {day.transportToNext && (
                    <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#b91c3e]" />
                      <span>
                        <strong>Próxima Conexión:</strong> {transport?.label} hacia{' '}
                        <strong className="text-slate-900">{day.transportToNext.targetCityName}</strong>
                        {day.transportToNext.notes ? ` (${day.transportToNext.notes})` : ''}
                      </span>
                    </div>
                  )}

                  {/* Vuelo Internacional Note */}
                  {day.internationalFlightNote && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <Plane className="w-4 h-4 text-amber-700" />
                      <span>
                        <strong>Vuelo Internacional:</strong> {day.internationalFlightNote}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
