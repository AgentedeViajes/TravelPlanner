/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TravelItinerary } from '../types';
import { Plane, DollarSign, User, FileText, Calendar, ShieldCheck, Tag } from 'lucide-react';

interface GeneralInfoCardProps {
  itinerary: TravelItinerary;
  onChange: (updated: Partial<TravelItinerary>) => void;
}

export const GeneralInfoCard: React.FC<GeneralInfoCardProps> = ({
  itinerary,
  onChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Datos Generales del Itinerario
          </h2>
          <p className="text-xs text-slate-500">
            Configure el cliente, título, valor comercial, notas y vuelos internacionales.
          </p>
        </div>
        <span className="px-3 py-1 bg-rose-50 text-[#b91c3e] border border-rose-200/70 text-xs font-bold rounded-full">
          Travel Planner
        </span>
      </div>

      {/* Row 1: Nombre del Pasajero/Cliente, Título del Itinerario, Fecha de Inicio */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Campo para colocar el nombre */}
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#b91c3e]" />
            <span>Nombre del Pasajero / Cliente *</span>
          </label>
          <input
            id="field-client-name"
            type="text"
            required
            value={itinerary.clientName}
            onChange={e => onChange({ clientName: e.target.value })}
            placeholder="Ej. Juan Pérez / Familia Gómez"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b91c3e]"
          />
        </div>

        {/* Título del Itinerario */}
        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#b91c3e]" />
            <span>Título del Viaje / Destino *</span>
          </label>
          <input
            id="field-itinerary-title"
            type="text"
            required
            value={itinerary.title}
            onChange={e => onChange({ title: e.target.value })}
            placeholder="Ej. Gran Tour Europeo: España, Francia e Italia"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b91c3e]"
          />
        </div>

        {/* Fecha de Inicio */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#b91c3e]" />
            <span>Fecha de Inicio</span>
          </label>
          <input
            id="field-start-date"
            type="date"
            value={itinerary.startDate}
            onChange={e => onChange({ startDate: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b91c3e]"
          />
        </div>
      </div>

      {/* Row 2: Campo para colocar el valor & Condiciones */}
      <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-100/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#b91c3e] uppercase tracking-wide">
          <DollarSign className="w-4 h-4" />
          <span>Cotización y Valor del Itinerario</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Moneda */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Moneda
            </label>
            <select
              value={itinerary.currency}
              onChange={e => onChange({ currency: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-[#b91c3e]"
            >
              <option value="USD">USD (Dólares)</option>
              <option value="EUR">EUR (Euros)</option>
              <option value="ARS">ARS (Pesos Arg)</option>
              <option value="GBP">GBP (Libras)</option>
              <option value="MXN">MXN (Pesos Mex)</option>
              <option value="CLP">CLP (Pesos Ch)</option>
            </select>
          </div>

          {/* Campo para colocar el valor */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Valor / Tarifa *
            </label>
            <input
              id="field-price-value"
              type="text"
              value={itinerary.price}
              onChange={e => onChange({ price: e.target.value })}
              placeholder="Ej. 2.450 / 3.800"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-extrabold text-[#b91c3e] focus:outline-none focus:ring-2 focus:ring-[#b91c3e]"
            />
          </div>

          {/* Términos o condiciones del precio */}
          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detalle del Precio (Base, impuestos, etc.)
            </label>
            <input
              type="text"
              value={itinerary.priceConditions}
              onChange={e => onChange({ priceConditions: e.target.value })}
              placeholder="Ej. Por persona en base doble. Incluye tasas e IVA."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-medium text-slate-700 focus:ring-2 focus:ring-[#b91c3e]"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Aéreos Internacionales (Inicio y Fin del Tour) */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wide">
          <Plane className="w-4 h-4 text-[#b91c3e]" />
          <span>Vuelos Internacionales de Inicio y Finalización del Tour</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Aéreo Internacional de Inicio */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={itinerary.flightStart.hasFlight}
                onChange={e => onChange({
                  flightStart: { ...itinerary.flightStart, hasFlight: e.target.checked }
                })}
                className="w-4 h-4 rounded text-[#b91c3e] focus:ring-[#b91c3e]"
              />
              <span className="text-xs font-bold text-slate-900">
                Aéreo internacional para comenzar el tour
              </span>
            </label>

            {itinerary.flightStart.hasFlight && (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={itinerary.flightStart.route}
                  onChange={e => onChange({
                    flightStart: { ...itinerary.flightStart, route: e.target.value }
                  })}
                  placeholder="Ruta: Ej. Buenos Aires (EZE) -> Madrid (MAD)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
                />
                <input
                  type="text"
                  value={itinerary.flightStart.notes || ''}
                  onChange={e => onChange({
                    flightStart: { ...itinerary.flightStart, notes: e.target.value }
                  })}
                  placeholder="Aerolínea, vuelo u horario: Ej. Iberia IB6844 / 21:30 hs"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
            )}
          </div>

          {/* Aéreo Internacional de Fin */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={itinerary.flightEnd.hasFlight}
                onChange={e => onChange({
                  flightEnd: { ...itinerary.flightEnd, hasFlight: e.target.checked }
                })}
                className="w-4 h-4 rounded text-[#b91c3e] focus:ring-[#b91c3e]"
              />
              <span className="text-xs font-bold text-slate-900">
                Aéreo internacional para finalizar el tour
              </span>
            </label>

            {itinerary.flightEnd.hasFlight && (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={itinerary.flightEnd.route}
                  onChange={e => onChange({
                    flightEnd: { ...itinerary.flightEnd, route: e.target.value }
                  })}
                  placeholder="Ruta: Ej. Roma (FCO) -> Buenos Aires (EZE)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium"
                />
                <input
                  type="text"
                  value={itinerary.flightEnd.notes || ''}
                  onChange={e => onChange({
                    flightEnd: { ...itinerary.flightEnd, notes: e.target.value }
                  })}
                  placeholder="Aerolínea, vuelo u horario: Ej. ITA Airways AZ680"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Campo para colocar texto libre (observaciones, condiciones, términos) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#b91c3e]" />
          <span>Campo para colocar Texto Libre (Observaciones, Inclusiones, Políticas y Términos)</span>
        </label>
        <textarea
          id="field-free-text-notes"
          rows={4}
          value={itinerary.freeTextNotes}
          onChange={e => onChange({ freeTextNotes: e.target.value })}
          placeholder="Ingrese aquí cualquier texto libre, detalles del paquete, qué incluye, qué no incluye, políticas de pago, validez de la oferta, etc."
          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#b91c3e] leading-relaxed font-sans"
        />
      </div>
    </div>
  );
};
