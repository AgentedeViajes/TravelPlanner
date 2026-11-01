/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CityStop } from '../types';
import { TRANSPORT_LABELS, ACCOMMODATION_LABELS, MEAL_PLAN_LABELS } from '../utils/itineraryGenerator';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, MapPin, Building, Utensils, Car, Compass, Navigation } from 'lucide-react';

interface CityStopsListProps {
  stops: CityStop[];
  onAddStop: () => void;
  onEditStop: (stop: CityStop) => void;
  onDeleteStop: (stopId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onSelectCityOnMap?: (cityId: string) => void;
}

export const CityStopsList: React.FC<CityStopsListProps> = ({
  stops,
  onAddStop,
  onEditStop,
  onDeleteStop,
  onMoveUp,
  onMoveDown,
  onSelectCityOnMap,
}) => {
  const totalNights = stops.reduce((sum, s) => sum + (s.nights || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Ciudades y Noches del Recorrido
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-[#b91c3e] text-xs font-extrabold">
              {stops.length} {stops.length === 1 ? 'ciudad' : 'ciudades'} • {totalNights} noches
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Agregue, edite, reordene o elimine destinos. Defina transportes, alojamiento y excursiones para cada parada.
          </p>
        </div>

        <button
          id="btn-add-city-stop"
          type="button"
          onClick={onAddStop}
          className="px-4 py-2 bg-[#b91c3e] hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Ciudad</span>
        </button>
      </div>

      {/* List of stops */}
      {stops.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 space-y-3">
          <MapPin className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">
            Aún no hay ciudades ingresadas en el itinerario.
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Haga clic en &quot;Agregar Ciudad&quot; para comenzar a diseñar el recorrido indicando las noches, alojamiento, transportes y excursiones.
          </p>
          <button
            type="button"
            onClick={onAddStop}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Agregar Primera Ciudad
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {stops.map((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === stops.length - 1;
            const transport = TRANSPORT_LABELS[stop.transportToNext] || { label: 'Transporte', icon: 'Plane' };

            return (
              <div
                key={stop.id}
                className="group p-4 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-rose-200 hover:shadow-md transition-all space-y-3"
              >
                {/* Main Stop Header */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#b91c3e] text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectCityOnMap && onSelectCityOnMap(stop.id)}
                          className="font-bold text-sm text-slate-900 hover:text-[#b91c3e] transition-colors flex items-center gap-1 text-left"
                          title="Ver en el mapa 2D"
                        >
                          <span>{stop.cityName}</span>
                          <Navigation className="w-3 h-3 text-[#b91c3e] opacity-70" />
                        </button>
                        {stop.country && (
                          <span className="text-xs font-medium text-slate-500">
                            ({stop.country})
                          </span>
                        )}
                      </div>

                      {/* Nights Pill */}
                      <span className="inline-block mt-0.5 bg-rose-100/80 text-[#b91c3e] font-extrabold text-[11px] px-2 py-0.5 rounded-full">
                        🌙 {stop.nights} {stop.nights === 1 ? 'noche' : 'noches'}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => onMoveUp(index)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg disabled:opacity-20 transition-colors"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => onMoveDown(index)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg disabled:opacity-20 transition-colors"
                      title="Mover abajo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditStop(stop)}
                      className="p-1.5 text-slate-600 hover:text-[#b91c3e] hover:bg-rose-50 rounded-lg transition-colors"
                      title="Editar ciudad y servicios"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteStop(stop.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar ciudad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Badges: Accommodation, Meal, Transfers, Excursions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs pt-1">
                  {/* Alojamiento & Régimen */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Building className="w-3 h-3 text-[#b91c3e]" /> Alojamiento
                    </span>
                    <p className="font-semibold text-slate-800 truncate">
                      {ACCOMMODATION_LABELS[stop.accommodationCategory] || stop.accommodationCategory}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {MEAL_PLAN_LABELS[stop.mealPlan]} {stop.hotelName ? `• ${stop.hotelName}` : ''}
                    </p>
                  </div>

                  {/* Traslados In/Out */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Car className="w-3 h-3 text-[#b91c3e]" /> Traslados
                    </span>
                    <div className="text-[11px] space-y-0.5 font-medium">
                      {stop.transferIn ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold">
                          ✓ Traslado IN incluido
                        </span>
                      ) : (
                        <span className="text-slate-400">Sin Traslado IN</span>
                      )}
                      {stop.transferOut ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold">
                          ✓ Traslado OUT incluido
                        </span>
                      ) : (
                        <span className="text-slate-400">Sin Traslado OUT</span>
                      )}
                    </div>
                  </div>

                  {/* Excursiones programadas */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 space-y-0.5 sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Compass className="w-3 h-3 text-[#b91c3e]" /> Excursiones
                    </span>
                    {stop.excursions && stop.excursions.length > 0 ? (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {stop.excursions.map((exc, i) => (
                          <span
                            key={i}
                            className="bg-rose-50 text-[#b91c3e] border border-rose-200/80 px-2 py-0.5 rounded text-[10.5px] font-semibold truncate max-w-[200px]"
                          >
                            {exc}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Días libres para realizar excursiones opcionales
                      </p>
                    )}
                  </div>
                </div>

                {/* Connecting Transport Banner to Next City */}
                {!isLast ? (
                  <div className="bg-slate-100/80 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">Próxima conexión:</span>
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-extrabold text-[#b91c3e] text-[11px]">
                        {transport.label}
                      </span>
                      <span className="text-slate-600 font-medium">
                        hacia <strong>{stops[index + 1]?.cityName}</strong>
                      </span>
                    </div>
                    {stop.transportNotes && (
                      <span className="text-[11px] text-slate-500 italic">
                        {stop.transportNotes}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                    <span>🏁 <strong>Última parada del itinerario</strong> — Finalización del tour y retorno.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
