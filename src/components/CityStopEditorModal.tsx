/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CityStop, AccommodationCategory, MealPlan, TransportType } from '../types';
import { POPULAR_CITIES, findCityPreset } from '../data/citiesDatabase';
import { TRANSPORT_LABELS, ACCOMMODATION_LABELS, MEAL_PLAN_LABELS } from '../utils/itineraryGenerator';
import { X, Plus, Trash2, MapPin, Building2, Utensils, Compass, Car, Sparkles } from 'lucide-react';

interface CityStopEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stop: CityStop) => void;
  initialStop?: CityStop | null;
  isLastInItinerary?: boolean;
}

export const CityStopEditorModal: React.FC<CityStopEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStop,
  isLastInItinerary = false,
}) => {
  const [formData, setFormData] = useState<CityStop>({
    id: `stop-${Date.now()}`,
    cityName: '',
    country: '',
    lat: 40.4168,
    lng: -3.7038,
    nights: 2,
    accommodationCategory: '4_stars',
    hotelName: '',
    mealPlan: 'desayuno',
    transferIn: true,
    transferInNotes: 'Recepción y traslado de llegada al hotel.',
    transferOut: true,
    transferOutNotes: 'Traslado desde el hotel hacia la terminal/aeropuerto.',
    excursions: [],
    cityDescription: '',
    transportToNext: 'train',
    transportNotes: '',
  });

  const [newExcursionInput, setNewExcursionInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingExcursions, setIsGeneratingExcursions] = useState(false);

  useEffect(() => {
    if (initialStop) {
      setFormData({ ...initialStop });
    } else {
      setFormData({
        id: `stop-${Date.now()}`,
        cityName: '',
        country: '',
        lat: 40.4168,
        lng: -3.7038,
        nights: 2,
        accommodationCategory: '4_stars',
        hotelName: '',
        mealPlan: 'desayuno',
        transferIn: true,
        transferInNotes: 'Recepción y traslado de llegada al hotel.',
        transferOut: true,
        transferOutNotes: 'Traslado desde el hotel hacia la terminal/aeropuerto.',
        excursions: [],
        cityDescription: '',
        transportToNext: 'flight',
        transportNotes: '',
      });
    }
  }, [initialStop, isOpen]);

  if (!isOpen) return null;

  // City autocomplete & presets
  const handleCityNameChange = (val: string) => {
    setFormData(prev => ({ ...prev, cityName: val }));
    if (val.length >= 2) {
      const filtered = POPULAR_CITIES
        .filter(c => c.cityName.toLowerCase().includes(val.toLowerCase()))
        .map(c => c.cityName);
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const applyCityPreset = (cityName: string) => {
    const preset = findCityPreset(cityName);
    if (preset) {
      setFormData(prev => ({
        ...prev,
        cityName: preset.cityName,
        country: preset.country,
        lat: preset.lat,
        lng: preset.lng,
        cityDescription: preset.description,
        excursions: prev.excursions,
        excursionSuggestions: preset.popularExcursions.filter(exc => !prev.excursions.includes(exc)),
      }));
    } else {
      setFormData(prev => ({ ...prev, cityName }));
    }
    setSuggestions([]);
  };

  const handleAddExcursion = () => {
    if (!newExcursionInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      excursions: [...prev.excursions, newExcursionInput.trim()],
    }));
    setNewExcursionInput('');
  };

  const handleRemoveExcursion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      excursions: prev.excursions.filter((_, i) => i !== index),
    }));
  };

  const handleAiGenerateDescription = async () => {
    if (!formData.cityName.trim()) {
      alert('Primero ingrese el nombre de la ciudad.');
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const res = await fetch('/api/ai/describe-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityName: formData.cityName, country: formData.country }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) {
          setFormData(prev => ({ ...prev, cityDescription: data.description }));
        }
      } else {
        const preset = findCityPreset(formData.cityName);
        if (preset) {
          setFormData(prev => ({ ...prev, cityDescription: preset.description }));
        }
      }
    } catch (e) {
      const preset = findCityPreset(formData.cityName);
      if (preset) {
        setFormData(prev => ({ ...prev, cityDescription: preset.description }));
      }
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAiSuggestExcursions = async () => {
    if (!formData.cityName.trim()) {
      alert('Primero ingrese el nombre de la ciudad.');
      return;
    }
    setIsGeneratingExcursions(true);
    try {
      const res = await fetch('/api/ai/suggest-excursions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityName: formData.cityName, country: formData.country }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.excursions) && data.excursions.length > 0) {
          // Merge unique excursions
          setFormData(prev => {
            const combined = [...(prev.excursionSuggestions || [])];
            data.excursions.forEach((item: string) => {
              if (!combined.includes(item)) combined.push(item);
            });
            return { ...prev, excursionSuggestions: combined };
          });
        }
      } else {
        const preset = findCityPreset(formData.cityName);
        if (preset && preset.popularExcursions) {
          setFormData(prev => ({ ...prev, excursionSuggestions: [...new Set([...(prev.excursionSuggestions || []), ...preset.popularExcursions])].filter(exc => !prev.excursions.includes(exc)) }));
        }
      }
    } catch (e) {
      const preset = findCityPreset(formData.cityName);
      if (preset && preset.popularExcursions) {
        setFormData(prev => ({ ...prev, excursionSuggestions: [...new Set([...(prev.excursionSuggestions || []), ...preset.popularExcursions])].filter(exc => !prev.excursions.includes(exc)) }));
      }
    } finally {
      setIsGeneratingExcursions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cityName.trim()) {
      alert('Por favor ingrese el nombre de la ciudad.');
      return;
    }
    onSave(formData);
    onClose();
  };

  const currentPreset = findCityPreset(formData.cityName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#b91c3e]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialStop ? `Editar Parada: ${formData.cityName || 'Ciudad'}` : 'Agregar Ciudad al Itinerario'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure alojamiento, transportes, traslados y excursiones programadas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Ciudad, País y Noches */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Ciudad *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.cityName}
                  onChange={e => handleCityNameChange(e.target.value)}
                  placeholder="Ej. Madrid, París, Roma, Ushuaia..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#b91c3e] focus:border-transparent font-medium"
                />
              </div>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden text-xs">
                  {suggestions.map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => applyCityPreset(city)}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 hover:text-[#b91c3e] transition-colors flex items-center justify-between"
                    >
                      <span className="font-semibold">{city}</span>
                      <span className="text-[10px] text-slate-400">Sugerencia inteligente</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                País
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                placeholder="Ej. España"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#b91c3e] font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Noches a Dormir *
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, nights: Math.max(1, p.nights - 1) }))}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-l-xl border border-r-0 border-slate-300"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={formData.nights}
                  onChange={e => setFormData(p => ({ ...p, nights: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full text-center py-2 text-sm border-t border-b border-slate-300 font-bold text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, nights: p.nights + 1 }))}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-r-xl border border-l-0 border-slate-300"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Coordenadas para el mapa 2D */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#b91c3e]" /> Coordenadas 2D:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Lat:</span>
              <input
                type="number"
                step="any"
                value={formData.lat}
                onChange={e => setFormData(p => ({ ...p, lat: parseFloat(e.target.value) || 0 }))}
                className="w-20 px-2 py-1 text-xs border rounded-lg bg-white"
              />
              <span className="text-slate-500">Lng:</span>
              <input
                type="number"
                step="any"
                value={formData.lng}
                onChange={e => setFormData(p => ({ ...p, lng: parseFloat(e.target.value) || 0 }))}
                className="w-20 px-2 py-1 text-xs border rounded-lg bg-white"
              />
            </div>
            <span className="text-[11px] text-slate-400">
              (Se asignan automáticamente al seleccionar ciudades populares)
            </span>
          </div>

          {/* Breve descripción de la ciudad (para el primer día) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-700">
                Breve descripción de la ciudad (aparecerá en el Día 1)
              </label>
              <div className="flex items-center gap-2">
                {currentPreset && !formData.cityDescription && (
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, cityDescription: currentPreset.description }))}
                    className="text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold transition-colors"
                  >
                    Usar plantilla
                  </button>
                )}
                <button
                  type="button"
                  disabled={isGeneratingDesc}
                  onClick={handleAiGenerateDescription}
                  className="text-[11px] text-[#b91c3e] hover:bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 font-bold transition-all disabled:opacity-50"
                  title="Generar o redactar una descripción turística atractiva con Gemini AI"
                >
                  <Sparkles className="w-3 h-3 text-[#b91c3e]" />
                  <span>{isGeneratingDesc ? 'Redactando...' : 'Generar con IA'}</span>
                </button>
              </div>
            </div>
            <textarea
              rows={2}
              value={formData.cityDescription}
              onChange={e => setFormData(p => ({ ...p, cityDescription: e.target.value }))}
              placeholder="Ej. Célebre capital europea caracterizada por sus bulevares señoriales, arquitectura y parques..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#b91c3e]"
            />
          </div>

          {/* Sección de Alojamiento y Régimen */}
          <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              <Building2 className="w-4 h-4 text-[#b91c3e]" />
              <span>Alojamiento y Régimen</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.accommodationCategory}
                  onChange={e => setFormData(p => ({ ...p, accommodationCategory: e.target.value as AccommodationCategory }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-[#b91c3e]"
                >
                  {Object.entries(ACCOMMODATION_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Régimen de Comidas *
                </label>
                <select
                  value={formData.mealPlan}
                  onChange={e => setFormData(p => ({ ...p, mealPlan: e.target.value as MealPlan }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-[#b91c3e]"
                >
                  {Object.entries(MEAL_PLAN_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de Hotel (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={e => setFormData(p => ({ ...p, hotelName: e.target.value }))}
                  placeholder="Ej. Hotel Gran Meliá / Mercure"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-[#b91c3e]"
                />
              </div>
            </div>
          </div>

          {/* Sección de Traslados In / Out */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              <Car className="w-4 h-4 text-[#b91c3e]" />
              <span>Traslados en la Ciudad</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Traslado IN */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.transferIn}
                    onChange={e => setFormData(p => ({ ...p, transferIn: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#b91c3e] focus:ring-[#b91c3e]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Tiene Traslado IN (Llegada)
                  </span>
                </label>
                {formData.transferIn && (
                  <input
                    type="text"
                    value={formData.transferInNotes}
                    onChange={e => setFormData(p => ({ ...p, transferInNotes: e.target.value }))}
                    placeholder="Detalles: Recepción en aeropuerto y traslado al hotel..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                  />
                )}
              </div>

              {/* Traslado OUT */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.transferOut}
                    onChange={e => setFormData(p => ({ ...p, transferOut: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#b91c3e] focus:ring-[#b91c3e]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Tiene Traslado OUT (Salida)
                  </span>
                </label>
                {formData.transferOut && (
                  <input
                    type="text"
                    value={formData.transferOutNotes}
                    onChange={e => setFormData(p => ({ ...p, transferOutNotes: e.target.value }))}
                    placeholder="Detalles: Traslado desde hotel al aeropuerto/estación..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sección de Excursiones (Campo libre para indicar cuál excursión) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold text-slate-800">
                Excursiones programadas en {formData.cityName || 'esta ciudad'} (Campo libre)
              </label>
              <button
                type="button"
                disabled={isGeneratingExcursions}
                onClick={handleAiSuggestExcursions}
                className="text-[11px] text-[#b91c3e] hover:bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 font-bold transition-all disabled:opacity-50"
                title="Sugerir excursiones destacadas con IA"
              >
                <Sparkles className="w-3 h-3 text-[#b91c3e]" />
                <span>{isGeneratingExcursions ? 'Buscando...' : 'Sugerir con IA'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Indique qué excursión se realiza. Si en algún día no se especifica excursión, el sistema colocará automáticamente &quot;Día libre para realizar excursiones&quot;.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newExcursionInput}
                onChange={e => setNewExcursionInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddExcursion(); } }}
                placeholder="Ej. Visita guiada al Coliseo y Foros con entradas..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#b91c3e]"
              />
              <button
                type="button"
                onClick={handleAddExcursion}
                className="px-4 py-2 bg-[#b91c3e] hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>

            {/* Quick popular excursions suggestions */}
            {((formData.excursionSuggestions?.length || 0) > 0 || (currentPreset && currentPreset.popularExcursions.length > 0)) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500">Sugerencias:</span>
                {(formData.excursionSuggestions?.length ? formData.excursionSuggestions : currentPreset?.popularExcursions || []).map(exc => (
                  <button
                    key={exc}
                    type="button"
                    onClick={() => {
                      if (!formData.excursions.includes(exc)) {
                        setFormData(p => ({
                          ...p,
                          excursions: [...p.excursions, exc],
                          excursionSuggestions: (p.excursionSuggestions || []).filter(item => item !== exc),
                        }));
                      }
                    }}
                    className="text-[10.5px] bg-slate-100 hover:bg-rose-50 hover:text-[#b91c3e] text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
                  >
                    + {exc}
                  </button>
                ))}
              </div>
            )}

            {/* Excursions list */}
            {formData.excursions.length > 0 ? (
              <div className="space-y-1.5 pt-2">
                {formData.excursions.map((exc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-[#b91c3e] flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{exc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExcursion(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800">
                ℹ️ Sin excursiones especificadas: Se programará automáticamente como &quot;Día libre para realizar excursiones opcionales&quot;.
              </div>
            )}
          </div>

          {/* Conexión con la siguiente ciudad (opción aéreo, tren, bus, traslado, ferry) */}
          {!isLastInItinerary && (
            <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Transporte / Conexión hacia la siguiente ciudad
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medio de Transporte *
                  </label>
                  <select
                    value={formData.transportToNext}
                    onChange={e => setFormData(p => ({ ...p, transportToNext: e.target.value as TransportType }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
                  >
                    {Object.entries(TRANSPORT_LABELS).map(([val, item]) => (
                      <option key={val} value={val}>{item.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detalles del Transporte (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.transportNotes}
                    onChange={e => setFormData(p => ({ ...p, transportNotes: e.target.value }))}
                    placeholder="Ej. Tren de alta velocidad 2h 45m / Vuelo IB3402"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#b91c3e] hover:bg-rose-800 text-white text-xs font-extrabold shadow-md transition-colors"
            >
              {initialStop ? 'Guardar Cambios' : 'Agregar Parada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
