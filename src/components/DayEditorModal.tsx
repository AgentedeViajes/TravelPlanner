/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ItineraryDay, MealPlan, AccommodationCategory } from '../types';
import { MEAL_PLAN_LABELS, ACCOMMODATION_LABELS } from '../utils/itineraryGenerator';
import { X, Calendar, Edit3, Plus, Trash2, Utensils, Check } from 'lucide-react';

interface DayEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: ItineraryDay | null;
  onSaveDay: (updatedDay: ItineraryDay) => void;
}

export const DayEditorModal: React.FC<DayEditorModalProps> = ({
  isOpen,
  onClose,
  day,
  onSaveDay,
}) => {
  const [formData, setFormData] = useState<ItineraryDay | null>(null);
  const [newExcursion, setNewExcursion] = useState('');

  useEffect(() => {
    if (day) {
      setFormData({ ...day, excursions: [...(day.excursions || [])] });
    }
  }, [day, isOpen]);

  if (!isOpen || !formData) return null;

  const handleAddExc = () => {
    if (!newExcursion.trim()) return;
    setFormData(p => p ? ({ ...p, excursions: [...p.excursions, newExcursion.trim()], isFreeDay: false }) : null);
    setNewExcursion('');
  };

  const handleRemoveExc = (idx: number) => {
    setFormData(p => {
      if (!p) return null;
      const filtered = p.excursions.filter((_, i) => i !== idx);
      return {
        ...p,
        excursions: filtered,
        isFreeDay: filtered.length === 0,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSaveDay(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#b91c3e] flex items-center justify-center font-extrabold text-sm">
              {formData.dayNumber}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Editar Día {formData.dayNumber}: {formData.cityName}
              </h3>
              <p className="text-xs text-slate-500">
                Personalice el texto descriptivo, actividades o régimen para esta jornada.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Título del Día */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título del Día *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData(p => p ? ({ ...p, title: e.target.value, titleEditedManually: true }) : null)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-[#b91c3e]"
            />
          </div>

          {/* Fecha del Día */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha / Indicador
              </label>
              <input
                type="text"
                value={formData.dateStr || ''}
                onChange={e => setFormData(p => p ? ({ ...p, dateStr: e.target.value }) : null)}
                placeholder="Ej. Jue, 15 oct 2026"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Régimen de comidas
              </label>
              <select
                value={formData.mealPlan}
                onChange={e => setFormData(p => p ? ({ ...p, mealPlan: e.target.value as MealPlan }) : null)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                {Object.entries(MEAL_PLAN_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción del Día (editable libremente) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción y Detalle del Día *
            </label>
            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={e => setFormData(p => p ? ({ ...p, description: e.target.value, descriptionEditedManually: true }) : null)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#b91c3e] leading-relaxed"
            />
          </div>

          {/* Excursiones o Día Libre */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Excursiones del Día
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.isFreeDay}
                  onChange={e => setFormData(p => p ? ({ ...p, isFreeDay: e.target.checked }) : null)}
                  className="rounded text-[#b91c3e]"
                />
                <span className="font-semibold">Marcar como Día Libre</span>
              </label>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newExcursion}
                onChange={e => setNewExcursion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddExc(); } }}
                placeholder="Añadir excursión para este día..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
              <button
                type="button"
                onClick={handleAddExc}
                className="px-3 py-1.5 bg-[#b91c3e] hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                +
              </button>
            </div>

            {formData.excursions.map((exc, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-1">
                <span>{exc}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExc(i)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Hotel asignado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hotel asignado
              </label>
              <input
                type="text"
                value={formData.hotelName || ''}
                onChange={e => setFormData(p => p ? ({ ...p, hotelName: e.target.value }) : null)}
                placeholder="Ej. Hotel Gran Vía 4*"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notas de vuelo / traslados
              </label>
              <input
                type="text"
                value={formData.internationalFlightNote || formData.transferInNotes || ''}
                onChange={e => setFormData(p => p ? ({ ...p, internationalFlightNote: e.target.value }) : null)}
                placeholder="Ej. Vuelo Iberia IB6844"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-[#b91c3e] hover:bg-rose-800 rounded-xl shadow-md transition-colors"
            >
              Guardar Día
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
