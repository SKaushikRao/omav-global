// Builds the web data for the population globe from the GPW v4 2020
// population density GeoTIFF (30 arc-second, people per km²).
//
//   node scripts/build-population-data.mjs [path/to/file.tif]
//
// Output (public/data/population/):
//   tiles/{z}/{x}/{y}.png  geographic (EPSG:4326) tile pyramid, 675 px tiles,
//                          levels 0-5. Level 5 is the source grid itself
//                          (30 arc-second ≈ 0.93 km); each coarser level is the
//                          mean of the four cells below it. 8-bit greyscale,
//                          log-encoded density so the client can recolour and
//                          query exact cell values; 0 = no data / unpopulated.
//   manifest.json          tile availability, encoding and global totals
//   cities.json            major cities with density and population-in-radius

import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { fromFile } from 'geotiff';

const SRC = process.argv[2] || 'ciesen_nasa_gpw_v4_population_density_2020.tif';
const OUT = 'public/data/population';
const TILE = 675;
const MAX_LEVEL = 5; // level 5 width = 2 * 2^5 * 675 = 43200 = the source grid
const LOG_MIN = -1; // 0.1 people/km²
const LOG_MAX = 5; // 100,000 people/km²
const R_KM = 6371.0088;

const isValid = (v) => Number.isFinite(v) && v > -1e30;
const encode = (d) => {
  if (!(d > 0)) return 0;
  const t = (Math.log10(d) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  return 1 + Math.round(Math.min(1, Math.max(0, t)) * 254);
};

// Area of a lat/lon cell in km²
const cellArea = (latTop, deg) => {
  const r = Math.PI / 180;
  return R_KM * R_KM * deg * r * Math.abs(Math.sin(latTop * r) - Math.sin((latTop - deg) * r));
};

function writeTile(z, x, y, bytes) {
  const png = new PNG({ width: TILE, height: TILE, colorType: 0, inputColorType: 0, bitDepth: 8 });
  png.data = Buffer.from(bytes);
  const dir = path.join(OUT, 'tiles', String(z), String(x));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${y}.png`), PNG.sync.write(png, { colorType: 0, inputColorType: 0 }));
}

const tiff = await fromFile(SRC);
const full = await tiff.getImage(0);
const ov1 = await tiff.getImage(1);
const W5 = full.getWidth();
const H5 = full.getHeight();
if (W5 !== 2 * TILE * 2 ** MAX_LEVEL || H5 !== W5 / 2) throw new Error(`Unexpected raster size ${W5}x${H5}`);
const W4 = W5 / 2;
const H4 = H5 / 2;

fs.rmSync(path.join(OUT, 'tiles'), { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// Mean accumulators for levels 0-3, fed from level-4 cell means
const acc = [];
for (let z = 0; z < MAX_LEVEL - 1; z++) {
  const w = 2 * TILE * 2 ** z;
  acc[z] = { w, h: w / 2, sum: new Float32Array(w * (w / 2)), cnt: new Uint16Array(w * (w / 2)) };
}

const available = {};
const mark = (z, x, y) => (available[z] ||= []).push(`${x}/${y}`);
let worldPop = 0;
let maxDensity = 0;
const deg5 = 360 / W5;
const STRIP = 2 * TILE; // two level-5 tile rows = one level-4 tile row
const NT5 = W5 / TILE;
const NT4 = W4 / TILE;

console.log(`Reading ${W5}x${H5} in ${H5 / STRIP} strips…`);
for (let sy = 0; sy < H5 / STRIP; sy++) {
  const y0 = sy * STRIP;
  const [strip] = await full.readRasters({ window: [0, y0, W5, y0 + STRIP], samples: [0] });

  // Level 5: the source cells
  for (let half = 0; half < 2; half++) {
    const tiles = Array.from({ length: NT5 }, () => new Uint8Array(TILE * TILE));
    const used = new Uint8Array(NT5);
    for (let r = 0; r < TILE; r++) {
      const row = half * TILE + r;
      const area = cellArea(90 - (y0 + row) * deg5, deg5);
      for (let gx = 0; gx < W5; gx++) {
        const v = strip[row * W5 + gx];
        if (!isValid(v) || !(v > 0)) continue;
        worldPop += v * area;
        if (v > maxDensity) maxDensity = v;
        const tx = (gx / TILE) | 0;
        const e = encode(v);
        if (e) {
          tiles[tx][r * TILE + (gx - tx * TILE)] = e;
          used[tx] = 1;
        }
      }
    }
    const ty = sy * 2 + half;
    for (let tx = 0; tx < NT5; tx++) {
      if (!used[tx]) continue;
      writeTile(MAX_LEVEL, tx, ty, tiles[tx]);
      mark(MAX_LEVEL, tx, ty);
    }
  }

  // Level 4: 2x2 means of valid source cells, then feed the coarser levels
  const tiles4 = Array.from({ length: NT4 }, () => new Uint8Array(TILE * TILE));
  const used4 = new Uint8Array(NT4);
  for (let r = 0; r < TILE; r++) {
    const gy4 = sy * TILE + r;
    for (let gx4 = 0; gx4 < W4; gx4++) {
      let sum = 0;
      let n = 0;
      for (let k = 0; k < 4; k++) {
        const v = strip[(2 * r + (k >> 1)) * W5 + 2 * gx4 + (k & 1)];
        if (isValid(v)) {
          sum += v;
          n++;
        }
      }
      if (!n) continue;
      const m = sum / n;
      const tx = (gx4 / TILE) | 0;
      const e = encode(m);
      if (e) {
        tiles4[tx][r * TILE + (gx4 - tx * TILE)] = e;
        used4[tx] = 1;
      }
      for (let z = 0; z < MAX_LEVEL - 1; z++) {
        const s = MAX_LEVEL - 1 - z;
        const a = acc[z];
        const i = (gy4 >> s) * a.w + (gx4 >> s);
        a.sum[i] += m;
        a.cnt[i]++;
      }
    }
  }
  for (let tx = 0; tx < NT4; tx++) {
    if (!used4[tx]) continue;
    writeTile(MAX_LEVEL - 1, tx, sy, tiles4[tx]);
    mark(MAX_LEVEL - 1, tx, sy);
  }
  process.stdout.write(`  strip ${sy + 1}/${H5 / STRIP}\r`);
}
console.log();

for (let z = 0; z < MAX_LEVEL - 1; z++) {
  const a = acc[z];
  for (let ty = 0; ty < a.h / TILE; ty++) {
    for (let tx = 0; tx < a.w / TILE; tx++) {
      const bytes = new Uint8Array(TILE * TILE);
      let any = false;
      for (let r = 0; r < TILE; r++) {
        for (let c = 0; c < TILE; c++) {
          const i = (ty * TILE + r) * a.w + tx * TILE + c;
          if (!a.cnt[i]) continue;
          const e = encode(a.sum[i] / a.cnt[i]);
          if (e) {
            bytes[r * TILE + c] = e;
            any = true;
          }
        }
      }
      if (!any) continue;
      writeTile(z, tx, ty, bytes);
      mark(z, tx, ty);
    }
  }
  acc[z] = null;
}
for (let z = 0; z <= MAX_LEVEL; z++) console.log(`  level ${z}: ${(available[z] || []).length} tiles`);

// Major cities: peak 1 km density nearby and population within 50 km
const CITIES = [
  ['Tokyo', 'Japan', 35.68, 139.69], ['Delhi', 'India', 28.61, 77.21], ['Shanghai', 'China', 31.23, 121.47],
  ['Dhaka', 'Bangladesh', 23.81, 90.41], ['São Paulo', 'Brazil', -23.55, -46.63], ['Mexico City', 'Mexico', 19.43, -99.13],
  ['Cairo', 'Egypt', 30.04, 31.24], ['Beijing', 'China', 39.9, 116.41], ['Mumbai', 'India', 19.08, 72.88],
  ['Osaka', 'Japan', 34.69, 135.5], ['Chongqing', 'China', 29.56, 106.55], ['Karachi', 'Pakistan', 24.86, 67.01],
  ['Kinshasa', 'DR Congo', -4.44, 15.27], ['Lagos', 'Nigeria', 6.52, 3.38], ['Istanbul', 'Türkiye', 41.01, 28.98],
  ['Buenos Aires', 'Argentina', -34.6, -58.38], ['Kolkata', 'India', 22.57, 88.36], ['Manila', 'Philippines', 14.6, 120.98],
  ['Guangzhou', 'China', 23.13, 113.26], ['Tianjin', 'China', 39.34, 117.36], ['Lahore', 'Pakistan', 31.55, 74.34],
  ['Bengaluru', 'India', 12.97, 77.59], ['Rio de Janeiro', 'Brazil', -22.91, -43.17], ['Shenzhen', 'China', 22.54, 114.06],
  ['Moscow', 'Russia', 55.76, 37.62], ['Chennai', 'India', 13.08, 80.27], ['Bogotá', 'Colombia', 4.71, -74.07],
  ['Jakarta', 'Indonesia', -6.21, 106.85], ['Lima', 'Peru', -12.05, -77.04], ['Paris', 'France', 48.86, 2.35],
  ['Bangkok', 'Thailand', 13.76, 100.5], ['Hyderabad', 'India', 17.39, 78.49], ['Seoul', 'South Korea', 37.57, 126.98],
  ['Nagoya', 'Japan', 35.18, 136.91], ['London', 'United Kingdom', 51.51, -0.13], ['Tehran', 'Iran', 35.69, 51.39],
  ['Chicago', 'United States', 41.88, -87.63], ['Chengdu', 'China', 30.57, 104.07], ['Nanjing', 'China', 32.06, 118.8],
  ['Wuhan', 'China', 30.59, 114.31], ['Ho Chi Minh City', 'Vietnam', 10.82, 106.63], ['Luanda', 'Angola', -8.84, 13.23],
  ['Ahmedabad', 'India', 23.02, 72.57], ['Kuala Lumpur', 'Malaysia', 3.14, 101.69], ['Xi’an', 'China', 34.34, 108.94],
  ['Hong Kong', 'China', 22.32, 114.17], ['Dongguan', 'China', 23.02, 113.75], ['Hangzhou', 'China', 30.27, 120.16],
  ['Riyadh', 'Saudi Arabia', 24.71, 46.68], ['Baghdad', 'Iraq', 33.31, 44.36], ['Santiago', 'Chile', -33.45, -70.67],
  ['Surat', 'India', 21.17, 72.83], ['Madrid', 'Spain', 40.42, -3.7], ['Pune', 'India', 18.52, 73.86],
  ['Dar es Salaam', 'Tanzania', -6.79, 39.21], ['Toronto', 'Canada', 43.65, -79.38], ['Khartoum', 'Sudan', 15.5, 32.56],
  ['Johannesburg', 'South Africa', -26.2, 28.05], ['Singapore', 'Singapore', 1.35, 103.82], ['Abidjan', 'Côte d’Ivoire', 5.36, -4.01],
  ['Yangon', 'Myanmar', 16.87, 96.2], ['Alexandria', 'Egypt', 31.2, 29.92], ['Barcelona', 'Spain', 41.39, 2.17],
  ['Saint Petersburg', 'Russia', 59.93, 30.36], ['Ankara', 'Türkiye', 39.93, 32.86], ['Addis Ababa', 'Ethiopia', 9.03, 38.74],
  ['Nairobi', 'Kenya', -1.29, 36.82], ['Los Angeles', 'United States', 34.05, -118.24], ['New York', 'United States', 40.71, -74.01],
  ['Kabul', 'Afghanistan', 34.53, 69.17], ['Accra', 'Ghana', 5.6, -0.19], ['Casablanca', 'Morocco', 33.57, -7.59],
  ['Jeddah', 'Saudi Arabia', 21.49, 39.19], ['Algiers', 'Algeria', 36.75, 3.06], ['Kano', 'Nigeria', 12.0, 8.52],
  ['Berlin', 'Germany', 52.52, 13.4], ['Rome', 'Italy', 41.9, 12.5], ['Sydney', 'Australia', -33.87, 151.21],
  ['Melbourne', 'Australia', -37.81, 144.96], ['Dubai', 'United Arab Emirates', 25.2, 55.27], ['Hanoi', 'Vietnam', 21.03, 105.85],
  ['Taipei', 'Taiwan', 25.03, 121.57], ['Lucknow', 'India', 26.85, 80.95], ['Jaipur', 'India', 26.91, 75.79],
  ['Patna', 'India', 25.59, 85.14], ['Kathmandu', 'Nepal', 27.72, 85.32], ['Colombo', 'Sri Lanka', 6.93, 79.86],
  ['Brussels', 'Belgium', 50.85, 4.35], ['Washington, D.C.', 'United States', 38.9, -77.04], ['Houston', 'United States', 29.76, -95.37],
  ['Guadalajara', 'Mexico', 20.67, -103.35], ['Belo Horizonte', 'Brazil', -19.92, -43.94], ['Caracas', 'Venezuela', 10.48, -66.9],
  ['Pyongyang', 'North Korea', 39.04, 125.76], ['Tashkent', 'Uzbekistan', 41.3, 69.24], ['Dakar', 'Senegal', 14.72, -17.47],
  ['Cape Town', 'South Africa', -33.92, 18.42], ['Athens', 'Greece', 37.98, 23.73], ['Kyiv', 'Ukraine', 50.45, 30.52],
  ['Warsaw', 'Poland', 52.23, 21.01], ['Vienna', 'Austria', 48.21, 16.37], ['Auckland', 'New Zealand', -36.85, 174.76],
];

async function cityStats([name, country, lat, lon]) {
  // Population within 50 km, from the 1' overview
  const pxDeg = 360 / W4;
  const cx = (lon + 180) / pxDeg;
  const cy = (90 - lat) / pxDeg;
  const span = Math.ceil(0.6 / pxDeg / Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  const x0 = Math.max(0, Math.floor(cx - span));
  const x1 = Math.min(W4, Math.ceil(cx + span));
  const y0 = Math.max(0, Math.floor(cy - span));
  const y1 = Math.min(H4, Math.ceil(cy + span));
  const [win] = await ov1.readRasters({ window: [x0, y0, x1, y1], samples: [0] });
  let pop50 = 0;
  const w = x1 - x0;
  const r = Math.PI / 180;
  for (let yy = y0; yy < y1; yy++) {
    const plat = 90 - (yy + 0.5) * pxDeg;
    const area = cellArea(90 - yy * pxDeg, pxDeg);
    for (let xx = x0; xx < x1; xx++) {
      const plon = -180 + (xx + 0.5) * pxDeg;
      const dLat = (plat - lat) * r;
      const dLon = (plon - lon) * r;
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat * r) * Math.cos(plat * r) * Math.sin(dLon / 2) ** 2;
      if (2 * R_KM * Math.asin(Math.sqrt(h)) > 50) continue;
      const v = win[(yy - y0) * w + (xx - x0)];
      if (isValid(v) && v > 0) pop50 += v * area;
    }
  }
  // Peak 1 km cell within ~10 km, from the full-resolution raster
  const fDeg = 360 / full.getWidth();
  const fx = Math.round((lon + 180) / fDeg);
  const fy = Math.round((90 - lat) / fDeg);
  const k = 10;
  const [fw] = await full.readRasters({ window: [fx - k, fy - k, fx + k + 1, fy + k + 1], samples: [0] });
  let peak = 0;
  let center = 0;
  for (let i = 0; i < fw.length; i++) if (isValid(fw[i]) && fw[i] > peak) peak = fw[i];
  const c = fw[k * (2 * k + 1) + k];
  if (isValid(c) && c > 0) center = c;
  return {
    name,
    country,
    lat,
    lon,
    center: Math.round(center),
    peak: Math.round(peak),
    pop50km: Math.round(pop50),
  };
}

const cities = [];
for (const c of CITIES) cities.push(await cityStats(c));
cities.sort((a, b) => b.pop50km - a.pop50km);

fs.writeFileSync(path.join(OUT, 'cities.json'), JSON.stringify(cities));
fs.writeFileSync(
  path.join(OUT, 'manifest.json'),
  JSON.stringify({
    source: 'CIESIN / NASA SEDAC, Gridded Population of the World v4, population density 2020',
    tileSize: TILE,
    maxLevel: MAX_LEVEL,
    encoding: { logMin: LOG_MIN, logMax: LOG_MAX },
    worldPopulation: Math.round(worldPop),
    maxDensity: Math.round(maxDensity),
    tiles: available,
  })
);
console.log(`World population (sum of density × area): ${(worldPop / 1e9).toFixed(3)} B`);
console.log(`Max density (30" cell): ${Math.round(maxDensity)} /km²`);
console.log(cities.slice(0, 5));
