// Client side of the GPW v4 2020 population density data built by
// scripts/build-population-data.mjs. Tiles are 8-bit greyscale with log-encoded
// density, so the globe can recolour them live and read exact cell values.

export const DATA_URL = '/data/population';

export interface PopulationManifest {
  source: string;
  tileSize: number;
  maxLevel: number;
  encoding: { logMin: number; logMax: number };
  worldPopulation: number;
  maxDensity: number;
  tiles: Record<string, string[]>;
}

export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  center: number; // people/km² in the 1 km cell at the city centre
  peak: number; // densest 1 km cell within ~10 km
  pop50km: number; // people within 50 km
}

// Density classes for the legend and the colour ramp (people per km²)
export const CLASSES: { min: number; label: string; color: [number, number, number]; alpha: number }[] = [
  // A light ramp in the brand accent: sparse land barely tints the Earth,
  // dense settlement burns warm-white like city lights
  { min: 0.1, label: '< 1', color: [70, 110, 150], alpha: 0 },
  { min: 1, label: '1', color: [70, 120, 160], alpha: 0.12 },
  { min: 10, label: '10', color: [96, 160, 190], alpha: 0.3 },
  { min: 50, label: '50', color: [140, 200, 216], alpha: 0.52 },
  { min: 250, label: '250', color: [196, 226, 234], alpha: 0.7 },
  { min: 1000, label: '1k', color: [240, 214, 160], alpha: 0.86 },
  { min: 5000, label: '5k', color: [255, 186, 112], alpha: 0.95 },
  { min: 20000, label: '20k+', color: [255, 244, 226], alpha: 1 },
];

export function describeDensity(d: number) {
  if (d <= 0) return 'Uninhabited or no data';
  if (d < 1) return 'Wilderness — under 1 person per km²';
  if (d < 10) return 'Very sparse rural';
  if (d < 50) return 'Rural';
  if (d < 250) return 'Dense rural / small towns';
  if (d < 1000) return 'Peri-urban';
  if (d < 5000) return 'Urban';
  if (d < 20000) return 'Dense urban core';
  return 'Extreme urban density';
}

let manifest: Promise<PopulationManifest> | null = null;
export function loadManifest() {
  manifest ||= fetch(`${DATA_URL}/manifest.json`).then((r) => {
    if (!r.ok) throw new Error(`manifest ${r.status}`);
    return r.json();
  });
  return manifest;
}

export async function loadCities(): Promise<City[]> {
  const r = await fetch(`${DATA_URL}/cities.json`);
  if (!r.ok) throw new Error(`cities ${r.status}`);
  return r.json();
}

export function decode(m: PopulationManifest, v: number) {
  if (!v) return 0;
  const { logMin, logMax } = m.encoding;
  return Math.pow(10, logMin + ((v - 1) / 254) * (logMax - logMin));
}

// Decoded greyscale tiles, shared by the imagery layer and click queries
const tileCache = new Map<string, Promise<Uint8Array | null>>();

export function hasTile(m: PopulationManifest, z: number, x: number, y: number) {
  return !!m.tiles[z]?.includes(`${x}/${y}`);
}

export function loadTile(m: PopulationManifest, z: number, x: number, y: number) {
  const key = `${z}/${x}/${y}`;
  let p = tileCache.get(key);
  if (!p) {
    p = hasTile(m, z, x, y)
      ? fetch(`${DATA_URL}/tiles/${key}.png`)
          .then((r) => {
            if (!r.ok) throw new Error(`tile ${key} ${r.status}`);
            return r.blob();
          })
          .then((b) => createImageBitmap(b, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' }))
          .then((bmp) => {
            const c = document.createElement('canvas');
            c.width = bmp.width;
            c.height = bmp.height;
            const ctx = c.getContext('2d', { willReadFrequently: true })!;
            ctx.drawImage(bmp, 0, 0);
            const rgba = ctx.getImageData(0, 0, c.width, c.height).data;
            const out = new Uint8Array(c.width * c.height);
            for (let i = 0; i < out.length; i++) out[i] = rgba[i * 4];
            bmp.close();
            return out;
          })
          .catch((err) => {
            tileCache.delete(key);
            throw err;
          })
      : Promise.resolve(null);
    tileCache.set(key, p);
  }
  return p;
}

export function encodeDensity(m: PopulationManifest, d: number) {
  if (!(d > 0)) return 0;
  const { logMin, logMax } = m.encoding;
  const t = (Math.log10(d) - logMin) / (logMax - logMin);
  return 1 + Math.round(Math.min(1, Math.max(0, t)) * 254);
}

// 256-entry RGBA lookup from encoded value to colour, hiding values below `minDensity`
export function buildLut(m: PopulationManifest, minDensity: number) {
  const lut = new Uint8ClampedArray(256 * 4);
  for (let v = 1; v < 256; v++) {
    const d = decode(m, v);
    if (d < minDensity) continue;
    let k = 0;
    while (k < CLASSES.length - 1 && d >= CLASSES[k + 1].min) k++;
    // Blend towards the next class in log space for a continuous ramp
    const a = CLASSES[k];
    const b = CLASSES[Math.min(k + 1, CLASSES.length - 1)];
    const la = Math.log10(a.min);
    const lb = Math.log10(b.min);
    const t = b === a ? 0 : Math.min(1, Math.max(0, (Math.log10(d) - la) / (lb - la)));
    for (let c = 0; c < 3; c++) lut[v * 4 + c] = a.color[c] + (b.color[c] - a.color[c]) * t;
    lut[v * 4 + 3] = 255 * (a.alpha + (b.alpha - a.alpha) * t);
  }
  return lut;
}

export function colorize(bytes: Uint8Array, size: number, lut: Uint8ClampedArray) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const px = img.data;
  for (let i = 0; i < bytes.length; i++) {
    const o = bytes[i] * 4;
    if (!lut[o + 3]) continue;
    px[i * 4] = lut[o];
    px[i * 4 + 1] = lut[o + 1];
    px[i * 4 + 2] = lut[o + 2];
    px[i * 4 + 3] = lut[o + 3];
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// Density (people/km²) at a point, from the finest level (1 arc-minute cell)
export async function densityAt(m: PopulationManifest, lat: number, lon: number) {
  const z = m.maxLevel;
  const nx = 2 * 2 ** z;
  const ny = 2 ** z;
  const fx = ((lon + 180) / 360) * nx;
  const fy = ((90 - lat) / 180) * ny;
  const x = Math.min(nx - 1, Math.floor(fx));
  const y = Math.min(ny - 1, Math.floor(fy));
  const bytes = await loadTile(m, z, x, y);
  if (!bytes) return 0;
  const S = m.tileSize;
  const px = Math.min(S - 1, Math.floor((fx - x) * S));
  const py = Math.min(S - 1, Math.floor((fy - y) * S));
  return decode(m, bytes[py * S + px]);
}

// Area of the 1 arc-minute cell containing `lat`, in km²
export function cellAreaKm2(m: PopulationManifest, lat: number) {
  const deg = 360 / (2 * 2 ** m.maxLevel * m.tileSize);
  const r = Math.PI / 180;
  const top = 90 - Math.floor((90 - lat) / deg) * deg;
  return 6371.0088 ** 2 * deg * r * Math.abs(Math.sin(top * r) - Math.sin((top - deg) * r));
}

export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');
export const fmtCompact = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)} k` : fmtInt(n);
export const fmtDensity = (d: number) => (d >= 100 ? fmtInt(d) : d >= 1 ? d.toFixed(1) : d > 0 ? d.toFixed(2) : '0');
