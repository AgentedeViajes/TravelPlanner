import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Svg,
  Path,
  Circle,
  Line,
  Rect,
  Polygon,
  StyleSheet,
} from '@react-pdf/renderer';
import {
  ACCOMMODATION_LABELS,
  MEAL_PLAN_LABELS,
  TRANSPORT_LABELS,
} from '../utils/itineraryGenerator';
import { CityStop, TravelItinerary } from '../types';

const C = {
  navy: '#173447',
  ink: '#243541',
  muted: '#667783',
  line: '#d8e0e5',
  pale: '#f3f6f8',
  red: '#b91c3e',
  rose: '#fbf0f2',
  gold: '#bd9562',
  white: '#ffffff',
  green: '#33765e',
};

const SvgText = Text as React.ComponentType<React.PropsWithChildren<Record<string, string | number>>>;

const styles = StyleSheet.create({
  page: { paddingTop: 30, paddingHorizontal: 28, paddingBottom: 42, fontFamily: 'Helvetica', fontSize: 9.5, color: C.ink, lineHeight: 1.35, backgroundColor: C.white },
  header: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 5, marginBottom: 8 },
  headerName: { fontSize: 8, color: C.muted, letterSpacing: 0.7, maxWidth: '72%', textAlign: 'right', flexShrink: 0 },
  pageLogo: { width: 94, height: 23, objectFit: 'contain', marginBottom: 8 },
  footer: { position: 'absolute', bottom: 15, left: 28, right: 28, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between', color: C.muted, fontSize: 7.5 },
  coverPhoto: { width: '100%', height: 241, objectFit: 'cover', borderRadius: 8 },
  coverPlaceholder: { width: '100%', height: 241, borderRadius: 8, backgroundColor: C.navy, padding: 22, justifyContent: 'flex-end', overflow: 'hidden' },
  coverEyebrow: { color: '#d9c4a5', fontSize: 8, textTransform: 'uppercase', letterSpacing: 2 },
  coverRoute: { color: C.white, fontSize: 13, marginTop: 8, maxWidth: '85%' },
  titleBlock: { marginTop: 13, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  title: { fontSize: 23, lineHeight: 1.15, color: C.navy, fontFamily: 'Helvetica-Bold' },
  kicker: { fontSize: 8, color: C.red, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 4 },
  identityRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 9 },
  identityItem: { marginRight: 16, marginBottom: 4, fontSize: 9, color: C.muted },
  identityStrong: { fontFamily: 'Helvetica-Bold', color: C.ink },
  priceRow: { marginTop: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.pale, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 5 },
  price: { color: C.red, fontSize: 16, fontFamily: 'Helvetica-Bold' },
  priceNote: { color: C.muted, fontSize: 8, maxWidth: '65%' },
  metricRow: { flexDirection: 'row', gap: 6, marginTop: 11 },
  metric: { flexGrow: 1, flexBasis: 0, paddingVertical: 7, paddingHorizontal: 8, backgroundColor: C.pale, borderRadius: 4, minHeight: 34 },
  metricLabel: { color: C.muted, fontSize: 7, textTransform: 'uppercase', letterSpacing: 0.7 },
  metricValue: { color: C.navy, fontSize: 9, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  section: { marginTop: 15 },
  sectionTitleWrap: { borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 5, marginBottom: 8 },
  sectionEyebrow: { color: C.red, fontSize: 7, letterSpacing: 1, textTransform: 'uppercase' },
  sectionTitle: { color: C.navy, fontSize: 13, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  flightPanel: { padding: 9, backgroundColor: '#fbf7f0', borderWidth: 1, borderColor: '#eadcc7', borderRadius: 5, marginTop: 10 },
  flightTitle: { fontSize: 8, color: C.navy, textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'Helvetica-Bold', marginBottom: 5 },
  flightRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  flightCard: { flexGrow: 1, flexBasis: 0, backgroundColor: C.white, borderRadius: 3, padding: 7 },
  flightLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.navy, marginBottom: 2 },
  flightText: { fontSize: 8.5, color: C.ink },
  smallText: { fontSize: 8, color: C.muted, marginTop: 2 },
  mapFrame: { borderWidth: 1, borderColor: C.line, borderRadius: 5, overflow: 'hidden', backgroundColor: '#f7fafc', padding: 5 },
  tableHead: { flexDirection: 'row', backgroundColor: C.navy, paddingVertical: 6, paddingHorizontal: 7, borderRadius: 3 },
  tableHeaderText: { fontSize: 7, color: C.white, fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 7, borderBottomWidth: 1, borderBottomColor: C.line, alignItems: 'flex-start' },
  tableCell: { fontSize: 7.5, color: C.ink },
  cityCard: { flexDirection: 'row', gap: 10, paddingVertical: 9, borderTopWidth: 1, borderTopColor: C.line },
  cityBody: { flexGrow: 1, flexBasis: 0 },
  cityHeading: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  cityNumber: { color: C.white, backgroundColor: C.red, fontSize: 8, fontFamily: 'Helvetica-Bold', paddingVertical: 3, paddingHorizontal: 5, borderRadius: 3 },
  cityName: { color: C.navy, fontSize: 11, fontFamily: 'Helvetica-Bold' },
  cityCountry: { color: C.muted, fontSize: 8 },
  nightsBadge: { color: C.red, backgroundColor: C.rose, fontSize: 7.5, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 3 },
  cityDescription: { color: C.ink, fontSize: 9, marginTop: 2 },
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  detail: { width: '50%', paddingRight: 5, marginTop: 2, fontSize: 8 },
  detailLabel: { fontFamily: 'Helvetica-Bold', color: C.navy },
  detailValue: { color: C.muted },
  bullet: { fontSize: 8, color: C.ink, marginTop: 2, paddingLeft: 5 },
  connection: { backgroundColor: C.pale, borderLeftWidth: 2, borderLeftColor: C.gold, padding: 6, marginTop: 5, fontSize: 8, color: C.ink },
  cityPhoto: { width: 184, height: 119, objectFit: 'cover', borderRadius: 4 },
  cityPhotoPlaceholder: { width: 184, height: 119, borderRadius: 4, borderWidth: 1, borderColor: C.line, backgroundColor: C.pale, alignItems: 'center', justifyContent: 'center', padding: 8 },
  placeholderText: { color: C.muted, fontSize: 8, textAlign: 'center' },
  day: { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, marginTop: 5 },
  dayHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  dayHeading: { flexGrow: 1, flexBasis: 0 },
  dayNumber: { color: C.white, backgroundColor: C.red, width: 21, height: 21, borderRadius: 4, textAlign: 'center', paddingTop: 4, fontSize: 9, fontFamily: 'Helvetica-Bold', marginRight: 6 },
  dayTitleLine: { flexDirection: 'row', alignItems: 'flex-start' },
  dayTitle: { color: C.navy, fontSize: 10.5, fontFamily: 'Helvetica-Bold' },
  dayMeta: { fontSize: 8, color: C.muted, marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 3, marginBottom: 2 },
  tag: { backgroundColor: C.pale, borderRadius: 3, paddingVertical: 2, paddingHorizontal: 4, color: C.muted, fontSize: 7.5 },
  dayDescription: { width: '100%', color: C.ink, fontSize: 9.5, lineHeight: 1.38 },
  dayPhotoRow: { alignSelf: 'flex-end', marginBottom: 6 },
  dayPhoto: { width: 108, height: 79, objectFit: 'cover', borderRadius: 4 },
  dayService: { fontSize: 8.5, color: C.ink, marginTop: 4 },
  notes: { backgroundColor: C.pale, padding: 10, borderRadius: 4, marginTop: 13 },
  noteTitle: { fontSize: 8.5, color: C.navy, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  noteText: { color: C.ink, fontSize: 9, lineHeight: 1.4 },
  endline: { marginTop: 13, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.line, color: C.muted, fontSize: 8, textAlign: 'center' },
});

function formatDate(value?: string): string {
  if (!value) return 'Fecha a definir';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Header({ itinerary, pageNumber }: { itinerary: TravelItinerary; pageNumber: number }) {
  return (
    <View key={`header-${pageNumber}`} style={styles.header}>
      {itinerary.logoUrl && /^data:image\/(png|jpe?g|webp);/i.test(itinerary.logoUrl)
        ? <Image key={`logo-${pageNumber}`} src={itinerary.logoUrl} style={{ width: 112, height: 27, objectFit: 'contain', flexShrink: 0 }} />
        : <Text key={`brand-${pageNumber}`} style={{ color: C.red, fontSize: 13, fontFamily: 'Helvetica-Bold' }}>tresor <Text style={{ color: '#888d95', fontFamily: 'Helvetica' }}>travel</Text></Text>}
      <Text key={`title-${pageNumber}`} style={styles.headerName}>{itinerary.title || 'TRAVEL PLANNER'}</Text>
    </View>
  );
}

function InlineBrand({ itinerary }: { itinerary: TravelItinerary }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: C.line }}>
      {itinerary.logoUrl && /^data:image\/(png|jpe?g|webp);/i.test(itinerary.logoUrl)
        ? <Image src={itinerary.logoUrl} style={{ width: 112, height: 27, objectFit: 'contain', flexShrink: 0 }} />
        : <Text style={{ color: C.red, fontSize: 13, fontFamily: 'Helvetica-Bold' }}>tresor <Text style={{ color: '#888d95', fontFamily: 'Helvetica' }}>travel</Text></Text>}
      <Text style={styles.headerName}>{itinerary.title || 'TRAVEL PLANNER'}</Text>
    </View>
  );
}

function PageFooter({ pageNumber, totalPages, logoUrl }: { pageNumber: number; totalPages: number; logoUrl?: string }) {
  return (
    <>
      <View style={{ position: 'absolute', bottom: 35, left: 28, right: 28, borderTopWidth: 1, borderTopColor: C.line }} />
      {logoUrl && /^data:image\/(png|jpe?g|webp);/i.test(logoUrl)
        ? <Image src={logoUrl} style={{ position: 'absolute', bottom: 9, left: 28, width: 74, height: 18, objectFit: 'contain' }} />
        : <Text style={{ position: 'absolute', bottom: 15, left: 28, color: C.red, fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>tresor travel</Text>}
      <Text style={{ position: 'absolute', bottom: 15, left: 110, color: C.muted, fontSize: 7.5 }}>Itinerario sujeto a disponibilidad</Text>
      <Text style={{ position: 'absolute', bottom: 15, right: 28, width: 42, textAlign: 'right', color: C.muted, fontSize: 7.5 }}>{pageNumber} / {totalPages}</Text>
    </>
  );
}

function SectionTitle({ eyebrow, title, minPresenceAhead = 28 }: { eyebrow?: string; title: string; minPresenceAhead?: number }) {
  return (
    <View style={styles.sectionTitleWrap} minPresenceAhead={minPresenceAhead}>
      {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

interface MapPoint { x: number; y: number; name: string; nights: number; index: number; transport: string }

interface DaySegment { day: TravelItinerary['days'][number]; description: string; continuation: boolean; finalSegment: boolean }

function estimateLines(value: string, charsPerLine: number): number {
  return Math.max(1, Math.ceil((value || '').length / charsPerLine));
}

function packPages<T>(items: T[], capacity: number, estimate: (item: T) => number): T[][] {
  const pages: T[][] = [];
  let current: T[] = [];
  let used = 0;
  for (const item of items) {
    const height = estimate(item);
    if (current.length && used + height > capacity) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(item);
    used += height;
  }
  if (current.length) pages.push(current);
  if (pages.length > 1 && pages.at(-1)?.length === 1 && (pages.at(-2)?.length || 0) > 2) {
    const previous = pages[pages.length - 2];
    pages[pages.length - 1].unshift(previous.pop()!);
  }
  return pages;
}

function splitTextAtWords(value: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let remaining = value.trim();
  while (remaining.length > maxLength) {
    let cut = remaining.lastIndexOf(' ', maxLength);
    if (cut < maxLength * 0.7) cut = remaining.indexOf(' ', maxLength);
    if (cut < 1) cut = maxLength;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks.length ? chunks : [''];
}

function prepareDaySegments(days: TravelItinerary['days']): DaySegment[] {
  return days.flatMap(day => {
    const fullDay: DaySegment = { day, description: day.description, continuation: false, finalSegment: true };
    // Keep ordinary journeys together. Split only when the estimated card would exceed
    // a printable page; 3,600 characters leaves room for a title, optional photo, and services.
    const chunks = estimateDayHeight(fullDay) <= 700
      ? [day.description || '']
      : splitTextAtWords(day.description, day.imageUrl ? 3400 : 4200);
    return chunks.map((description, index) => ({
      day,
      description,
      continuation: index > 0,
      finalSegment: index === chunks.length - 1,
    }));
  });
}

function estimateCityHeight(stop: CityStop): number {
  return 220 + estimateLines(stop.cityDescription || '', 72) * 11 + stop.excursions.reduce((sum, item) => sum + estimateLines(item, 70) * 10, 0)
    + estimateLines(`${stop.transferInNotes} ${stop.transferOutNotes} ${stop.transportNotes}`, 74) * 9;
}

function estimateDayHeight(segment: DaySegment): number {
  const day = segment.day;
  const serviceCount = Number(day.hasTransferIn) + Number(day.hasTransferOut) + day.excursions.length + Number(Boolean(day.transportToNext)) + Number(Boolean(day.internationalFlightNote));
  return 68 + estimateLines(segment.description, 100) * 13.2 + (day.imageUrl && !segment.continuation ? 85 : 0) + (segment.finalSegment ? serviceCount * 16 : 0);
}

function EditorialMap({ stops }: { stops: CityStop[] }) {
  const width = 538;
  const height = 178;
  const points: MapPoint[] = [];
  if (stops.length) {
    const lats = stops.map(stop => Number(stop.lat) || 0);
    const lngs = stops.map(stop => Number(stop.lng) || 0);
    const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs);
    const avgLat = (minLat + maxLat) / 2;
    const cos = Math.cos(avgLat * Math.PI / 180) || 1;
    const latSpan = Math.max(1, maxLat - minLat) * 1.7;
    const lngSpan = Math.max(1, (maxLng - minLng) * cos) * 1.7;
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    stops.forEach((stop, index) => {
      const x = width / 2 + ((Number(stop.lng) - centerLng) * cos / lngSpan) * (width - 120);
      const y = height / 2 - ((Number(stop.lat) - centerLat) / latSpan) * (height - 92);
      points.push({ x, y, name: stop.cityName, nights: stop.nights, index: index + 1, transport: stop.transportToNext });
    });
  }
  return (
    <View style={styles.mapFrame}>
      <Svg width="100%" height={168} viewBox={`0 0 ${width} 168`}>
        <Path d={`M0 137 Q128 112 266 141 T${width} 126 L${width} 168 L0 168 Z`} fill="#eaf1f5" />
        <Path d={`M0 0 L${width * 0.7} 0 Q${width * 0.63} 44 ${width * 0.38} 43 T0 71 Z`} fill="#f0f5f8" />
        {[35, 74, 113].map(y => <Line key={`h${y}`} x1={38} y1={y} x2={width - 38} y2={y} stroke="#d1dce3" strokeWidth={0.6} strokeDasharray="3 5" />)}
        {[120, 269, 418].map(x => <Line key={`v${x}`} x1={x} y1={25} x2={x} y2={145} stroke="#d1dce3" strokeWidth={0.6} strokeDasharray="3 5" />)}
        {points.slice(0, -1).map((point, index) => {
          const next = points[index + 1];
          const middleX = (point.x + next.x) / 2;
          const middleY = Math.max(25, (point.y + next.y) / 2 - 12);
          return <Path key={`route-${index}`} d={`M${point.x} ${point.y} Q${middleX} ${middleY} ${next.x} ${next.y}`} fill="none" stroke={C.red} strokeWidth={2} strokeDasharray="5 4" />;
        })}
        {points.map((point, index) => {
          const placeBelow = index % 2 === 1;
          const labelY = Math.max(16, Math.min(128, point.y + (placeBelow ? 23 : -32)));
          const transportIcon = point.transport === 'train' ? 'TREN' : point.transport === 'bus' ? 'BUS' : point.transport === 'ferry' ? 'BARCO' : point.transport === 'transfer' ? 'AUTO' : 'AVIÓN';
          return (
            <React.Fragment key={`marker-${index}`}>
              <Line x1={point.x} y1={point.y} x2={point.x} y2={labelY + (placeBelow ? -7 : 25)} stroke={C.red} strokeWidth={0.8} />
              <Circle cx={point.x} cy={point.y} r={8} fill={C.red} stroke={C.white} strokeWidth={2} />
              <SvgText x={point.x} y={point.y + 2.6} textAnchor="middle" fontSize={7} fontFamily="Helvetica-Bold" fill={C.white}>{point.index}</SvgText>
              <Rect x={point.x - 47} y={labelY} width={94} height={22} rx={4} fill={C.white} stroke="#cbd7de" strokeWidth={0.8} />
              <SvgText x={point.x} y={labelY + 9} textAnchor="middle" fontSize={7.2} fontFamily="Helvetica-Bold" fill={C.navy}>{point.name.length > 20 ? `${point.name.slice(0, 19)}…` : point.name}</SvgText>
              <SvgText x={point.x} y={labelY + 17} textAnchor="middle" fontSize={6.2} fill={C.red}>{`${point.nights} ${point.nights === 1 ? 'noche' : 'noches'}${index < points.length - 1 ? ` · ${transportIcon}` : ''}`}</SvgText>
            </React.Fragment>
          );
        })}
        <Polygon points="17,21 21,8 25,21 21,18" fill={C.navy} />
        <SvgText x={21} y={31} fontSize={6} textAnchor="middle" fill={C.muted}>N</SvgText>
      </Svg>
    </View>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return <Text style={styles.detail}><Text style={styles.detailLabel}>{label}: </Text><Text style={styles.detailValue}>{value}</Text></Text>;
}

function CitySection({ itinerary, stops, startIndex, showTitle }: { itinerary: TravelItinerary; stops: CityStop[]; startIndex: number; showTitle: boolean }) {
  return (
    <View style={styles.section}>
      {showTitle ? <SectionTitle eyebrow="Tu recorrido" title="Destinos y servicios" /> : null}
      {stops.map((stop, localIndex) => {
        const index = startIndex + localIndex;
        const next = itinerary.stops[index + 1];
        const connection = next ? `${TRANSPORT_LABELS[stop.transportToNext]?.label || 'Conexión'} hacia ${next.cityName}${stop.transportNotes ? ` · ${stop.transportNotes}` : ''}` : '';
        return (
          <View key={stop.id} style={styles.cityCard}>
            <View style={styles.cityBody}>
              {localIndex === 0 ? (itinerary.logoUrl && /^data:image\/(png|jpe?g|webp);/i.test(itinerary.logoUrl)
                ? <Image src={itinerary.logoUrl} style={styles.pageLogo} />
                : <Text style={{ color: C.red, fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>tresor travel</Text>) : null}
              <View style={styles.cityHeading} minPresenceAhead={42}>
                <Text style={styles.cityNumber}>{index + 1}</Text>
                <Text style={styles.cityName}>{stop.cityName}</Text>
                <Text style={styles.cityCountry}>{stop.country}</Text>
                <Text style={styles.nightsBadge}>{stop.nights} {stop.nights === 1 ? 'noche' : 'noches'}</Text>
              </View>
              <Text style={styles.cityDescription}>{stop.cityDescription || `Estadía en ${stop.cityName}.`}</Text>
              <View style={styles.detailRow}>
                <InfoPair label="Alojamiento" value={`${stop.hotelName || 'A definir'} · ${ACCOMMODATION_LABELS[stop.accommodationCategory] || stop.accommodationCategory}`} />
                <InfoPair label="Régimen" value={MEAL_PLAN_LABELS[stop.mealPlan] || stop.mealPlan} />
                <InfoPair label="Traslado IN" value={stop.transferIn ? stop.transferInNotes || 'Incluido' : 'No incluido'} />
                <InfoPair label="Traslado OUT" value={stop.transferOut ? stop.transferOutNotes || 'Incluido' : 'No incluido'} />
              </View>
              {stop.excursions.length ? <View style={{ marginTop: 5 }}>
                <Text style={styles.detailLabel}>Excursiones seleccionadas</Text>
                {stop.excursions.map((excursion, i) => <Text key={`${stop.id}-exc-${i}`} style={styles.bullet}>• {excursion}</Text>)}
              </View> : null}
              {connection ? <Text style={styles.connection}><Text style={styles.detailLabel}>Conexión a {next?.cityName}: </Text>{connection}</Text> : null}
              {!next && itinerary.flightEnd.hasFlight ? <Text style={styles.connection}><Text style={styles.detailLabel}>Regreso: </Text>{itinerary.flightEnd.route}{itinerary.flightEnd.notes ? ` · ${itinerary.flightEnd.notes}` : ''}</Text> : null}
            </View>
            {stop.imageUrl ? <Image src={stop.imageUrl} style={styles.cityPhoto} /> : (
              <View style={styles.cityPhotoPlaceholder}><Text style={styles.placeholderText}>{stop.cityName}{stop.country ? ` · ${stop.country}` : ''}</Text></View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function DaySection({ itinerary, segments, showTitle }: { itinerary: TravelItinerary; segments: DaySegment[]; showTitle: boolean }) {
  return (
    <View style={styles.section}>
      {showTitle ? <SectionTitle eyebrow="Cada etapa, a tu ritmo" title="Itinerario día por día" minPresenceAhead={150} /> : null}
      {segments.map((segment, segmentIndex) => {
        const { day, continuation, finalSegment } = segment;
        return <View key={`${day.id}-${segmentIndex}`} style={styles.day} wrap={false}>
          {segmentIndex === 0 ? (itinerary.logoUrl && /^data:image\/(png|jpe?g|webp);/i.test(itinerary.logoUrl)
            ? <Image src={itinerary.logoUrl} style={styles.pageLogo} />
            : <Text style={{ color: C.red, fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>tresor travel</Text>) : null}
          <View style={styles.dayHeader} minPresenceAhead={45}>
            <View style={styles.dayHeading}>
              {continuation ? (
                <Text style={styles.dayMeta}>Día {day.dayNumber} · continuación de la descripción</Text>
              ) : (
                <>
                  <View style={styles.dayTitleLine}>
                    <Text style={styles.dayNumber}>{day.dayNumber}</Text>
                    <View style={{ flexGrow: 1 }}>
                      <Text style={styles.dayTitle}>{day.title}</Text>
                      <Text style={styles.dayMeta}>{day.dateStr || `Día ${day.dayNumber}`} · {day.cityName}</Text>
                    </View>
                  </View>
                  <View style={styles.tags}>
                    {day.mealPlan ? <Text style={styles.tag}>Régimen: {MEAL_PLAN_LABELS[day.mealPlan] || day.mealPlan}</Text> : null}
                    {day.hotelName ? <Text style={styles.tag}>Hotel: {day.hotelName}</Text> : null}
                  </View>
                </>
              )}
            </View>
          </View>
          {day.imageUrl && !continuation ? <View style={styles.dayPhotoRow} wrap={false}><Image src={day.imageUrl} style={styles.dayPhoto} /></View> : null}
          <Text style={styles.dayDescription} orphans={2} widows={2}>{segment.description}</Text>
          {finalSegment && day.hasTransferIn ? <Text style={styles.dayService}><Text style={styles.detailLabel}>Traslado IN: </Text>{day.transferInNotes || 'Incluido'}</Text> : null}
          {finalSegment && day.hasTransferOut ? <Text style={styles.dayService}><Text style={styles.detailLabel}>Traslado OUT: </Text>{day.transferOutNotes || 'Incluido'}</Text> : null}
          {finalSegment && day.excursions.map((excursion, i) => <Text key={`${day.id}-day-exc-${i}`} style={styles.dayService}><Text style={styles.detailLabel}>Excursión contratada: </Text>{excursion}</Text>)}
          {finalSegment && day.isFreeDay && !day.excursions.length ? <Text style={styles.dayService}>Jornada libre para actividades personales o excursiones opcionales.</Text> : null}
          {finalSegment && day.transportToNext ? <Text style={styles.dayService}><Text style={styles.detailLabel}>Conexión: </Text>{TRANSPORT_LABELS[day.transportToNext.type]?.label || 'Transporte'} hacia {day.transportToNext.targetCityName || 'el siguiente destino'}{day.transportToNext.notes ? ` · ${day.transportToNext.notes}` : ''}</Text> : null}
          {finalSegment && day.internationalFlightNote ? <Text style={styles.dayService}><Text style={styles.detailLabel}>Información de vuelo: </Text>{day.internationalFlightNote}</Text> : null}
        </View>;
      })}
    </View>
  );
}

export function TravelPdfDocument({ itinerary }: { itinerary: TravelItinerary }) {
  const totalNights = itinerary.stops.reduce((sum, stop) => sum + (stop.nights || 0), 0);
  const route = itinerary.stops.map(stop => stop.cityName).join(' → ') || 'Recorrido a definir';
  const firstDay = itinerary.days[0];
  const lastDay = itinerary.days[itinerary.days.length - 1];
  const cityEntries = itinerary.stops.map((stop, index) => ({ stop, index }));
  const cityPages = packPages(cityEntries, 700, item => estimateCityHeight(item.stop));
  const daySegments = prepareDaySegments(itinerary.days);
  const dayPages = packPages(daySegments, 700, estimateDayHeight);
  const noteSegments = itinerary.freeTextNotes ? splitTextAtWords(itinerary.freeTextNotes, 4000) : [];
  const noteHeight = noteSegments.reduce((sum, text) => sum + 38 + estimateLines(text, 100) * 13, 0);
  const summaryHeight = 250 + itinerary.stops.length * 35;
  const appendNotesToSummaryPage = noteSegments.length > 0 && summaryHeight + noteHeight <= 650;
  const lastDayPageHeight = dayPages.at(-1)?.reduce((sum, segment) => sum + estimateDayHeight(segment), 0) || 0;
  const appendNotesToLastDayPage = noteSegments.length > 0 && !appendNotesToSummaryPage && dayPages.length > 0 && lastDayPageHeight + noteHeight + 24 <= 420;
  const separateNotePages = noteSegments.length > 0 && !appendNotesToSummaryPage && !appendNotesToLastDayPage ? packPages(noteSegments, 620, text => 38 + estimateLines(text, 100) * 13) : [];
  const totalPages = 2 + cityPages.length + dayPages.length + separateNotePages.length;
  return (
    <Document title={itinerary.title || 'Itinerario Tresor Travel'} author="Tresor Travel" language="es-AR">
      <Page size="A4" style={styles.page}>
        <Header itinerary={itinerary} pageNumber={1} />
        <PageFooter pageNumber={1} totalPages={totalPages} logoUrl={itinerary.logoUrl} />
        {itinerary.coverImageUrl ? <Image src={itinerary.coverImageUrl} style={styles.coverPhoto} /> : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverEyebrow}>Una experiencia a medida · Tresor Travel</Text>
            <Text style={styles.coverRoute}>{route}</Text>
          </View>
        )}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{itinerary.title || 'Itinerario Turístico'}</Text>
          <Text style={styles.kicker}>Propuesta de viaje · {route}</Text>
          <View style={styles.identityRow}>
            <Text style={styles.identityItem}>Pasajero: <Text style={styles.identityStrong}>{itinerary.clientName || 'A definir'}</Text></Text>
            <Text style={styles.identityItem}>Fechas: <Text style={styles.identityStrong}>{firstDay?.dateStr || formatDate(itinerary.startDate)} – {lastDay?.dateStr || 'A definir'}</Text></Text>
            <Text style={styles.identityItem}>Duración: <Text style={styles.identityStrong}>{itinerary.days.length} días / {totalNights} noches</Text></Text>
          </View>
          {(itinerary.price || itinerary.priceConditions) ? <View style={styles.priceRow}>
            <Text style={styles.price}>{itinerary.currency} {itinerary.price || 'A cotizar'}</Text>
            {itinerary.priceConditions ? <Text style={styles.priceNote}>{itinerary.priceConditions}</Text> : null}
          </View> : null}
        </View>
        <View style={styles.metricRow}>
          <View style={styles.metric}><Text style={styles.metricLabel}>Duración</Text><Text style={styles.metricValue}>{itinerary.days.length} días</Text></View>
          <View style={styles.metric}><Text style={styles.metricLabel}>Estadía</Text><Text style={styles.metricValue}>{totalNights} noches</Text></View>
          <View style={styles.metric}><Text style={styles.metricLabel}>Destinos</Text><Text style={styles.metricValue}>{itinerary.stops.length} ciudades</Text></View>
        </View>
        {(itinerary.flightStart.hasFlight || itinerary.flightEnd.hasFlight) ? <View style={styles.flightPanel}>
          <Text style={styles.flightTitle}>Vuelos informados</Text>
          <View style={styles.flightRow}>
            {itinerary.flightStart.hasFlight ? <View style={styles.flightCard}>
              <Text style={styles.flightLabel}>Vuelo de inicio</Text>
              <Text style={styles.flightText}>{itinerary.flightStart.route || 'Trayecto no especificado'}</Text>
              {[itinerary.flightStart.airline, itinerary.flightStart.flightNumber, itinerary.flightStart.departureTime && `Salida ${itinerary.flightStart.departureTime}`, itinerary.flightStart.arrivalTime && `Llegada ${itinerary.flightStart.arrivalTime}`].filter(Boolean).length ? <Text style={styles.smallText}>{[itinerary.flightStart.airline, itinerary.flightStart.flightNumber, itinerary.flightStart.departureTime && `Salida ${itinerary.flightStart.departureTime}`, itinerary.flightStart.arrivalTime && `Llegada ${itinerary.flightStart.arrivalTime}`].filter(Boolean).join(' · ')}</Text> : null}
              {itinerary.flightStart.notes ? <Text style={styles.smallText}>{itinerary.flightStart.notes}</Text> : null}
            </View> : null}
            {itinerary.flightEnd.hasFlight ? <View style={styles.flightCard}>
              <Text style={styles.flightLabel}>Vuelo de regreso</Text>
              <Text style={styles.flightText}>{itinerary.flightEnd.route || 'Trayecto no especificado'}</Text>
              {[itinerary.flightEnd.airline, itinerary.flightEnd.flightNumber, itinerary.flightEnd.departureTime && `Salida ${itinerary.flightEnd.departureTime}`, itinerary.flightEnd.arrivalTime && `Llegada ${itinerary.flightEnd.arrivalTime}`].filter(Boolean).length ? <Text style={styles.smallText}>{[itinerary.flightEnd.airline, itinerary.flightEnd.flightNumber, itinerary.flightEnd.departureTime && `Salida ${itinerary.flightEnd.departureTime}`, itinerary.flightEnd.arrivalTime && `Llegada ${itinerary.flightEnd.arrivalTime}`].filter(Boolean).join(' · ')}</Text> : null}
              {itinerary.flightEnd.notes ? <Text style={styles.smallText}>{itinerary.flightEnd.notes}</Text> : null}
            </View> : null}
          </View>
        </View> : null}
      </Page>

      <Page size="A4" style={styles.page}>
        <PageFooter pageNumber={2} totalPages={totalPages} logoUrl={itinerary.logoUrl} />
        <View style={styles.section} wrap={false}>
          <InlineBrand itinerary={itinerary} />
          <SectionTitle eyebrow="Orientación general" title="Mapa editorial del recorrido" />
          <EditorialMap stops={itinerary.stops} />
          <Text style={styles.smallText}>Recorrido: {route}</Text>
        </View>

        <View style={styles.section} wrap={false}>
          <SectionTitle eyebrow="Estadías" title="Resumen de alojamientos y conexiones" />
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeaderText, { width: '7%' }]}>#</Text>
            <Text style={[styles.tableHeaderText, { width: '26%' }]}>Ciudad / noches</Text>
            <Text style={[styles.tableHeaderText, { width: '28%' }]}>Hotel</Text>
            <Text style={[styles.tableHeaderText, { width: '22%' }]}>Régimen</Text>
            <Text style={[styles.tableHeaderText, { width: '17%' }]}>Traslados</Text>
          </View>
          {itinerary.stops.map((stop, index) => <View key={`summary-${stop.id}`} style={styles.tableRow} wrap={false}>
            <Text style={[styles.tableCell, { width: '7%' }]}>{index + 1}</Text>
            <Text style={[styles.tableCell, { width: '26%', fontFamily: 'Helvetica-Bold' }]}>{stop.cityName} · {stop.nights} {stop.nights === 1 ? 'noche' : 'noches'}</Text>
            <Text style={[styles.tableCell, { width: '28%' }]}>{stop.hotelName || ACCOMMODATION_LABELS[stop.accommodationCategory] || 'A definir'}</Text>
            <Text style={[styles.tableCell, { width: '22%' }]}>{MEAL_PLAN_LABELS[stop.mealPlan] || stop.mealPlan}</Text>
            <Text style={[styles.tableCell, { width: '17%' }]}>{[stop.transferIn && 'IN', stop.transferOut && 'OUT'].filter(Boolean).join(' / ') || 'No incluidos'}</Text>
          </View>)}
          {appendNotesToSummaryPage ? <View style={styles.notes}>
            <Text style={styles.noteTitle}>Observaciones, inclusiones y condiciones generales</Text>
            <Text style={styles.noteText}>{itinerary.freeTextNotes}</Text>
          </View> : null}
        </View>
      </Page>

      {cityPages.map((pageStops, pageIndex) => (
        <Page key={`cities-${pageIndex}`} size="A4" style={styles.page}>
          <PageFooter pageNumber={pageIndex + 3} totalPages={totalPages} logoUrl={itinerary.logoUrl} />
          <CitySection
            itinerary={itinerary}
            stops={pageStops.map(item => item.stop)}
            startIndex={pageStops[0]?.index || 0}
            showTitle={pageIndex === 0}
          />
        </Page>
      ))}

      {dayPages.map((segments, pageIndex) => (
        <Page key={`days-${pageIndex}`} size="A4" style={styles.page}>
          <PageFooter pageNumber={pageIndex + 3 + cityPages.length} totalPages={totalPages} logoUrl={itinerary.logoUrl} />
          <DaySection itinerary={itinerary} segments={segments} showTitle={pageIndex === 0} />
          {appendNotesToLastDayPage && pageIndex === dayPages.length - 1 ? (
            <View style={styles.notes}>
              <Text style={styles.noteTitle}>Observaciones, inclusiones y condiciones generales</Text>
              <Text style={styles.noteText}>{itinerary.freeTextNotes}</Text>
            </View>
          ) : null}
        </Page>
      ))}

      {separateNotePages.map((notes, pageIndex) => (
        <Page key={`notes-${pageIndex}`} size="A4" style={styles.page}>
          <Header itinerary={itinerary} pageNumber={pageIndex + 3 + cityPages.length + dayPages.length} />
          <PageFooter pageNumber={pageIndex + 3 + cityPages.length + dayPages.length} totalPages={totalPages} logoUrl={itinerary.logoUrl} />
          <View style={styles.notes}>
            <InlineBrand itinerary={itinerary} />
            <Text style={styles.noteTitle}>{pageIndex ? 'Observaciones (continuación)' : 'Observaciones, inclusiones y condiciones generales'}</Text>
            {notes.map((note, index) => <Text key={`note-${index}`} style={styles.noteText}>{note}</Text>)}
          </View>
        </Page>
      ))}
    </Document>
  );
}
