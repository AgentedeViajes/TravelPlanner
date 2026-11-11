import type { PhotoAttribution } from '../types';

export interface DestinationPhoto {
  imageUrl: string;
  attribution: PhotoAttribution;
}

interface CommonsExtValue { value?: string }
interface CommonsCandidate {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    thumburl?: string;
    mime?: string;
    extmetadata?: Record<string, CommonsExtValue>;
  }>;
}
interface CommonsSearchResponse { query?: { pages?: CommonsCandidate[] } }

const searchCache = new Map<string, Promise<CommonsCandidate[]>>();

function normalizeText(value: string): string {
  return cleanMetadata(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

function cleanMetadata(value?: string): string {
  return (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

export function isReusableCommonsLicense(license?: string): boolean {
  const normalized = cleanMetadata(license).toLowerCase();
  if (!normalized || /\b(nc|nd)\b|non.?commercial|no.?derivatives|fair use/.test(normalized)) return false;
  return /^(cc0|cc by(?:-sa)?(?:\s|$)|public domain|public domain mark|pdm\b)/i.test(normalized);
}

function hasDestinationMatch(candidate: CommonsCandidate, terms: string[]): boolean {
  const metadata = candidate.imageinfo?.[0]?.extmetadata;
  const searchableText = normalizeText([
    candidate.title,
    metadata?.ImageDescription?.value,
    metadata?.ObjectName?.value,
  ].filter(Boolean).join(' ')).toLocaleLowerCase();
  return terms.some(term => normalizeText(term).length > 2 && searchableText.includes(normalizeText(term)));
}

async function searchCandidates(query: string, width: number): Promise<CommonsCandidate[]> {
  const cacheKey = `${query.toLocaleLowerCase()}|${width}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '15',
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: String(width),
    format: 'json',
    formatversion: '2',
    origin: '*',
    maxlag: '5',
  });
  const promise = fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  }).then(async response => {
    if (!response.ok) throw new Error(`Wikimedia Commons respondió ${response.status}`);
    const data = await response.json() as CommonsSearchResponse;
    return data.query?.pages || [];
  }).catch(error => {
    searchCache.delete(cacheKey);
    throw error;
  });
  searchCache.set(cacheKey, promise);
  return promise;
}

async function compressRemoteImage(url: string, width: number, height: number): Promise<string> {
  const response = await fetch(url, { mode: 'cors', signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error('No se pudo descargar la fotografía.');
  const bitmap = await createImageBitmap(await response.blob());
  try {
    const scale = Math.min(1, width / bitmap.width, height / bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo preparar la fotografía.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  } finally {
    bitmap.close();
  }
}

function attributionFor(candidate: CommonsCandidate): PhotoAttribution | undefined {
  const metadata = candidate.imageinfo?.[0]?.extmetadata;
  const license = cleanMetadata(metadata?.LicenseShortName?.value);
  if (!isReusableCommonsLicense(license)) return undefined;
  const pageUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(candidate.title.replace(/ /g, '_'))}`;
  const author = cleanMetadata(metadata?.Artist?.value || metadata?.Credit?.value) || 'Autor no indicado';
  const licenseUrl = cleanMetadata(metadata?.LicenseUrl?.value) || 'https://commons.wikimedia.org/wiki/Commons:Licensing';
  return {
    provider: 'Wikimedia Commons',
    pageId: candidate.pageid,
    title: candidate.title.replace(/^File:/i, ''),
    author,
    license,
    licenseUrl,
    filePageUrl: pageUrl,
  };
}

export async function findDestinationPhoto(
  query: string,
  destinationTerms: string[],
  usedPageIds: Set<number>,
  dimensions: { width: number; height: number; apiWidth: number },
): Promise<DestinationPhoto | null> {
  try {
    const candidates = await searchCandidates(query, dimensions.apiWidth);
    for (const candidate of candidates) {
      if (usedPageIds.has(candidate.pageid) || !hasDestinationMatch(candidate, destinationTerms)) continue;
      const image = candidate.imageinfo?.[0];
      const attribution = attributionFor(candidate);
      if (!image?.thumburl || !/^image\/(jpeg|png|webp)$/i.test(image.mime || '') || !attribution) continue;
      usedPageIds.add(candidate.pageid);
      try {
        const imageUrl = await compressRemoteImage(image.thumburl, dimensions.width, dimensions.height);
        return { imageUrl, attribution };
      } catch {
        usedPageIds.delete(candidate.pageid);
      }
    }
  } catch (error) {
    console.warn('No se pudieron buscar fotografías en Wikimedia Commons:', error);
  }
  return null;
}
