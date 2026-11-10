/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TravelItinerary, CityStop, ItineraryDay } from './types';
import { INITIAL_ITINERARY, PATAGONIA_ITINERARY } from './data/defaultItineraries';
import { generateItineraryDays, hasDayStructureDrift, hasStructuralStopChanges, inferManualDayEdits, syncExistingDaysWithStops } from './utils/itineraryGenerator';
import { TresorLogo } from './components/TresorLogo';
import { GeneralInfoCard } from './components/GeneralInfoCard';
import { CityStopsList } from './components/CityStopsList';
import { TravelMap2D } from './components/TravelMap2D';
import { DailyItineraryTimeline } from './components/DailyItineraryTimeline';
import { CityStopEditorModal } from './components/CityStopEditorModal';
import { DayEditorModal } from './components/DayEditorModal';
import { PdfExportView } from './components/PdfExportView';
import {
  FileText,
  MapPin,
  Calendar,
  Download,
  Plus,
  RefreshCw,
  FolderOpen,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Navigation,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

export default function App() {
  // Main Itinerary State initialized with full Europe Classic tour demo
  const [itinerary, setItinerary] = useState<TravelItinerary>(() => {
    const saved = localStorage.getItem('travel_planner_active_itinerary');
    if (saved) {
      try {
        const restored = JSON.parse(saved) as TravelItinerary;
        return inferManualDayEdits(restored);
      } catch (e) {
        console.error('Error parsing saved itinerary', e);
      }
    }
    return INITIAL_ITINERARY;
  });

  // Active View Tab: 'editor' | 'map' | 'timeline' | 'pdf'
  const [activeTab, setActiveTab] = useState<'editor' | 'map' | 'timeline' | 'pdf'>('editor');

  // Modals state
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<CityStop | null>(null);

  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<ItineraryDay | null>(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedCityIdOnMap, setSelectedCityIdOnMap] = useState<string | null>(null);
  const [hasPendingStructuralChanges, setHasPendingStructuralChanges] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('travel_planner_active_itinerary', JSON.stringify(itinerary));
  }, [itinerary]);

  useEffect(() => {
    if (hasDayStructureDrift(itinerary)) setHasPendingStructuralChanges(true);
  }, []);

  // Partial update of general itinerary info
  const handleUpdateGeneral = (updatedFields: Partial<TravelItinerary>) => {
    setItinerary(prev => {
      const next = { ...prev, ...updatedFields };
      // Only update dates in place; preserve manual narratives and edits.
      if (updatedFields.startDate !== undefined) {
        const dateOnlyDays = generateItineraryDays(next);
        const datesById = new Map(dateOnlyDays.map(day => [day.id, day.dateStr]));
        next.days = prev.days.map(day => ({ ...day, dateStr: datesById.get(day.id) || day.dateStr }));
      }
      return next;
    });
  };

  // Add / Save a City Stop
  const handleSaveStop = (savedStop: CityStop) => {
    const currentIndex = itinerary.stops.findIndex(stop => stop.id === savedStop.id);
    const prospectiveStops = [...itinerary.stops];
    if (currentIndex >= 0) prospectiveStops[currentIndex] = savedStop;
    else prospectiveStops.push(savedStop);
    if (currentIndex < 0 || hasStructuralStopChanges(itinerary.stops, prospectiveStops)) {
      setHasPendingStructuralChanges(true);
    }
    setItinerary(prev => {
      const existingIndex = prev.stops.findIndex(s => s.id === savedStop.id);
      let nextStops = [...prev.stops];

      if (existingIndex >= 0) {
        nextStops[existingIndex] = savedStop;
      } else {
        nextStops.push(savedStop);
      }

      const updated = { ...prev, stops: nextStops };
      updated.days = existingIndex < 0 ? prev.days : syncExistingDaysWithStops(updated, prev.stops);
      return updated;
    });
  };

  // Delete a City Stop
  const handleDeleteStop = (stopId: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta ciudad del itinerario?')) return;
    setHasPendingStructuralChanges(true);
    setItinerary(prev => {
      const nextStops = prev.stops.filter(s => s.id !== stopId);
      const updated = { ...prev, stops: nextStops };
      updated.days = syncExistingDaysWithStops(updated, prev.stops);
      return updated;
    });
  };

  // Move stops up/down
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const prospectiveIndex = direction === 'up' ? index - 1 : index + 1;
    if (prospectiveIndex < 0 || prospectiveIndex >= itinerary.stops.length) return;
    setHasPendingStructuralChanges(true);
    setItinerary(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.stops.length) return prev;

      const nextStops = [...prev.stops];
      const temp = nextStops[index];
      nextStops[index] = nextStops[targetIndex];
      nextStops[targetIndex] = temp;

      const updated = { ...prev, stops: nextStops };
      updated.days = syncExistingDaysWithStops(updated, prev.stops);
      return updated;
    });
  };

  // Save an edited day
  const handleSaveDay = (updatedDay: ItineraryDay) => {
    setItinerary(prev => {
      const nextDays = prev.days.map(d => (d.id === updatedDay.id ? updatedDay : d));
      return { ...prev, days: nextDays };
    });
  };

  // Regenerate days automatically from stops
  const handleRegenerateDays = () => {
    const hasManualEdits = itinerary.days.some(day => day.descriptionEditedManually || day.titleEditedManually);
    const message = hasManualEdits
      ? 'La regeneración reemplazará las jornadas actuales, incluidos los títulos y textos editados manualmente. ¿Desea continuar?'
      : '¿Desea regenerar el cronograma día por día en base a las ciudades y noches actuales? Se reemplazarán las jornadas actuales.';
    if (window.confirm(message)) {
      setItinerary(prev => ({
        ...prev,
        days: generateItineraryDays(prev),
      }));
      setHasPendingStructuralChanges(false);
    }
  };

  // Preset loaders
  const handleLoadEuropeDemo = () => {
    if (window.confirm('¿Cargar plantilla de demostración "Europa Soñada (11 Días)"?')) {
      setItinerary(INITIAL_ITINERARY);
      setHasPendingStructuralChanges(false);
    }
  };

  const handleLoadPatagoniaDemo = () => {
    if (window.confirm('¿Cargar plantilla de demostración "Patagonia Austral (7 Días)"?')) {
      setItinerary(PATAGONIA_ITINERARY);
      setHasPendingStructuralChanges(false);
    }
  };

  const handleCreateBlank = () => {
    if (window.confirm('¿Desea crear un nuevo itinerario en blanco?')) {
      const blank: TravelItinerary = {
        id: `itinerary-${Date.now()}`,
        title: 'Nuevo Itinerario Turístico',
        clientName: 'Nombre del Pasajero',
        clientEmail: '',
        startDate: new Date().toISOString().split('T')[0],
        price: '0',
        currency: 'USD',
        priceConditions: 'Por pasajero en base doble.',
        freeTextNotes: '• Incluye: Alojamiento con desayuno, traslados in/out y excursiones detalladas.\n• No incluye: Vuelos no especificados ni gastos personales.',
        flightStart: { hasFlight: false, route: '' },
        flightEnd: { hasFlight: false, route: '' },
        stops: [],
        days: [],
      };
      setItinerary(blank);
      setHasPendingStructuralChanges(false);
    }
  };

  // Custom Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleUpdateGeneral({ logoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const totalNights = itinerary.stops.reduce((sum, s) => sum + (s.nights || 0), 0);
  const totalDays = itinerary.days.length;

  return (
    <div id="travel-planner-app" className="min-h-screen bg-slate-100/60 text-slate-800 font-sans pb-16">
      {/* Top Professional Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-4">
            <TresorLogo className="h-9" customLogoUrl={itinerary.logoUrl} showSubtitle />
            <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                Travel Planner
              </span>
              <span className="text-[10px] font-bold bg-rose-50 text-[#b91c3e] px-2 py-0.5 rounded-full border border-rose-200">
                v2.0
              </span>
            </div>
          </div>

          {/* Quick Demo Loaders & Export CTA */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={handleLoadEuropeDemo}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-[#b91c3e] transition-colors"
                title="Cargar demo Europa Clásica"
              >
                Demo Europa
              </button>
              <button
                type="button"
                onClick={handleLoadPatagoniaDemo}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-[#b91c3e] transition-colors"
                title="Cargar demo Patagonia"
              >
                Demo Patagonia
              </button>
              <button
                type="button"
                onClick={handleCreateBlank}
                className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-slate-900 transition-colors"
                title="Comenzar itinerario en blanco"
              >
                En Blanco
              </button>
            </div>

            {/* Custom Logo upload button */}
            <label
              className="cursor-pointer p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
              title="Cambiar logotipo (subir imagen)"
            >
              <ImageIcon className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            {itinerary.logoUrl && (
              <button
                type="button"
                onClick={() => handleUpdateGeneral({ logoUrl: undefined })}
                className="text-[10px] text-slate-400 hover:text-rose-600 underline"
                title="Restablecer logo oficial Tresor Travel"
              >
                Logo Original
              </button>
            )}

            {/* Export PDF Button */}
            <button
              id="btn-open-pdf-modal"
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#b91c3e] hover:bg-rose-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-md hover:shadow-rose-900/20 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto border-t border-slate-100 py-1.5 text-xs font-bold">
          <button
            id="tab-btn-editor"
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>1. Planificador & Ciudades</span>
            <span className="text-[10.5px] px-1.5 py-0.2 rounded-full bg-white/20">
              {itinerary.stops.length}
            </span>
          </button>

          <button
            id="tab-btn-map"
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#b91c3e]" />
            <span>2. Mapa 2D del Recorrido</span>
            <span className="text-[10.5px] px-1.5 py-0.2 rounded-full bg-rose-100 text-[#b91c3e]">
              🌙 {totalNights} noches
            </span>
          </button>

          <button
            id="tab-btn-timeline"
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>3. Itinerario Día por Día</span>
            <span className="text-[10.5px] px-1.5 py-0.2 rounded-full bg-white/20">
              {totalDays} días
            </span>
          </button>

          <button
            id="tab-btn-pdf-preview"
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'pdf'
                ? 'bg-[#b91c3e] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#b91c3e] hover:bg-rose-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. Vista Previa PDF</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Banner with Trip Header & Fast Stats */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-rose-100 text-[#b91c3e] rounded-full text-xs font-extrabold">
                Itinerario Activo
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {itinerary.title || 'Sin Título'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Pasajero / Titular: <strong className="text-slate-800">{itinerary.clientName || 'A definir'}</strong> • Inicio:{' '}
              <strong className="text-slate-800">
                {itinerary.startDate ? new Date(itinerary.startDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'A definir'}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Nights & Cities Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ciudades / Noches
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                {itinerary.stops.length} ciudades • 🌙 {totalNights} noches
              </span>
            </div>

            {/* Price Badge */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-center">
              <span className="text-[10px] font-bold text-[#b91c3e] uppercase tracking-wider block">
                Valor del Paquete
              </span>
              <span className="text-base font-extrabold text-[#b91c3e]">
                {itinerary.currency} {itinerary.price || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: Editor de Itinerario & Ciudades */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* General Info Card: Name, Title, Price, Free Text, Flights */}
            <GeneralInfoCard
              itinerary={itinerary}
              onChange={handleUpdateGeneral}
            />

            {/* City Stops Management */}
            <CityStopsList
              stops={itinerary.stops}
              onAddStop={() => {
                setEditingStop(null);
                setIsStopModalOpen(true);
              }}
              onEditStop={(stop) => {
                setEditingStop(stop);
                setIsStopModalOpen(true);
              }}
              onDeleteStop={handleDeleteStop}
              onMoveUp={(idx) => handleMoveStop(idx, 'up')}
              onMoveDown={(idx) => handleMoveStop(idx, 'down')}
              onSelectCityOnMap={(cityId) => {
                setSelectedCityIdOnMap(cityId);
                setActiveTab('map');
              }}
            />

            {/* Quick Map Preview below stops */}
            {itinerary.stops.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#b91c3e]" />
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      Vista Rápida del Mapa 2D
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('map')}
                    className="text-xs font-bold text-[#b91c3e] hover:underline flex items-center gap-1"
                  >
                    Abrir en pantalla completa &rarr;
                  </button>
                </div>
                <TravelMap2D
                  stops={itinerary.stops}
                  selectedCityId={selectedCityIdOnMap}
                  className="h-[360px]"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Mapa 2D del Recorrido */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#b91c3e]" />
                    <span>Mapa 2D Interactivo del Recorrido</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ciudades ordenadas secuencialmente, marcando la cantidad de noches que se duerme en cada destino y las vías de conexión.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStop(null);
                      setIsStopModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#b91c3e] hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Ciudad
                  </button>
                </div>
              </div>

              {/* Main Map Component */}
              <TravelMap2D
                stops={itinerary.stops}
                selectedCityId={selectedCityIdOnMap}
                onSelectCity={(id) => setSelectedCityIdOnMap(id)}
                className="h-[560px] w-full"
              />

              {/* City night stops summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {itinerary.stops.map((stop, i) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => setSelectedCityIdOnMap(stop.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedCityIdOnMap === stop.id
                        ? 'border-[#b91c3e] bg-rose-50/70 shadow-sm ring-2 ring-rose-200'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="w-5 h-5 rounded-full bg-[#b91c3e] text-white font-bold flex items-center justify-center text-[10px]">
                        {i + 1}
                      </span>
                      <span className="text-[11px] font-extrabold text-[#b91c3e]">
                        🌙 {stop.nights} {stop.nights === 1 ? 'noche' : 'noches'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {stop.cityName}
                    </div>
                    <div className="text-[10.5px] text-slate-500 truncate">
                      {stop.country}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Itinerario Día por Día */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {hasPendingStructuralChanges && (
              <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
                Cambió la cantidad de noches o el orden de las ciudades. Las jornadas actuales se conservaron; revise fechas y conexiones, y use «Regenerar desde Ciudades» si desea reconstruir su estructura.
              </div>
            )}
            <DailyItineraryTimeline
              days={itinerary.days}
              onEditDay={(day) => {
                setEditingDay(day);
                setIsDayModalOpen(true);
              }}
              onRegenerateDays={handleRegenerateDays}
            />
          </div>
        )}

        {/* TAB 4: Vista Previa PDF Directa */}
        {activeTab === 'pdf' && (
          <div className="space-y-6">
            <PdfExportView
              itinerary={itinerary}
              isInlinePreview
            />
          </div>
        )}
      </main>

      {/* Modal: City Stop Editor */}
      <CityStopEditorModal
        isOpen={isStopModalOpen}
        onClose={() => {
          setIsStopModalOpen(false);
          setEditingStop(null);
        }}
        onSave={handleSaveStop}
        initialStop={editingStop}
        isLastInItinerary={
          editingStop ? itinerary.stops.findIndex(s => s.id === editingStop.id) === itinerary.stops.length - 1 : false
        }
      />

      {/* Modal: Day Editor */}
      <DayEditorModal
        isOpen={isDayModalOpen}
        onClose={() => {
          setIsDayModalOpen(false);
          setEditingDay(null);
        }}
        day={editingDay}
        onSaveDay={handleSaveDay}
      />

      {/* Modal: PDF Export Overlay */}
      {isPdfModalOpen && (
        <PdfExportView
          itinerary={itinerary}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}
    </div>
  );
}
