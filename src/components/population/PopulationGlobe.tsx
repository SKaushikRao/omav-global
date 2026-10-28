import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BlendOption,
  buildModuleUrl,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Color,
  Credit,
  DirectionalLight,
  DistanceDisplayCondition,
  Entity,
  GeographicTilingScheme,
  ImageryLayer,
  Ion,
  LabelStyle,
  Math as CMath,
  NearFarScalar,
  PerspectiveFrustum,
  PointPrimitiveCollection,
  ScreenSpaceEventHandler,
  SceneTransforms,
  ScreenSpaceEventType,
  SingleTileImageryProvider,
  TextureMagnificationFilter,
  TileMapServiceImageryProvider,
  UrlTemplateImageryProvider,
  VerticalOrigin,
  Viewer,
  WebMapTileServiceImageryProvider,
  WebMercatorTilingScheme,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { Crosshair, Expand, Minus, Moon, Plus, Shrink, SlidersHorizontal, Sun, X } from 'lucide-react';
import RubberSegment from '../ui/RubberSegment';
import {
  buildLut,
  cellAreaKm2,
  City,
  CLASSES,
  colorize,
  DATA_URL,
  decode,
  encodeDensity,
  densityAt,
  describeDensity,
  fmtCompact,
  fmtDensity,
  fmtInt,
  loadCities,
  loadManifest,
  loadTile,
  PopulationManifest,
} from './populationData';

// The real Earth for the hero, styled to continue the intro Earth: the same day
// and night textures, lens and key light, with real lighting and city lights on
// the night side. Zooming in hands over to Bing imagery (via Cesium ion, or the
// bundled Natural Earth II without a token), NASA Black Marble (VIIRS, via NASA
// GIBS) and the full 1 km GPW v4 2020 population tiles. Zoomed out, the
// population grid is drawn as an unlit dot matrix so it reads on the night side.

const ION_TOKEN = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;
const DAY_TEX = '/assets/aistudio/2419145b1a56f93908364cdba80a4980_af3c5cdd.jpg';
const NIGHT_LIGHTS_URL =
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{TileMatrix}/{TileRow}/{TileCol}.png';
const ACCENT = Color.fromCssColorString('#8CC8D8');
const WGS84_A = 6378137;
const HOME = { lon: 62, lat: 22 };
const FOVY = (32 * Math.PI) / 180; // the intro Earth's lens
// Key light in camera space (x right, y up, z towards the viewer), as the intro's
const SUN_REST: [number, number, number] = [-0.95, 0.25, 0.18];

// Camera heights for the overview → detail hand-over
const DETAIL_START = 4.2e6; // detail imagery begins to fade in
const DETAIL_FULL = 1.6e6;
const DOTS_OFF = 2.2e6; // dot matrix hides below this

const REGIONS: { id: string; label: string; lon: number; lat: number; h: number }[] = [
  { id: 'sasia', label: 'South Asia', lon: 79, lat: 22, h: 5.2e6 },
  { id: 'easia', label: 'East Asia', lon: 115, lat: 31, h: 6.2e6 },
  { id: 'mideast', label: 'Middle East', lon: 46, lat: 27, h: 5.5e6 },
  { id: 'europe', label: 'Europe', lon: 12, lat: 50, h: 5e6 },
  { id: 'africa', label: 'Africa', lon: 20, lat: 3, h: 9e6 },
  { id: 'americas', label: 'Americas', lon: -78, lat: 12, h: 1.4e7 },
];

// Minimum-density filter steps (people/km²)
const MIN_STEPS = [0, 1, 10, 50, 250, 1000, 5000];

type Basemap = 'styled' | 'satellite';

type Readout =
  | { kind: 'point'; lat: number; lon: number; density: number | null; error?: boolean }
  | { kind: 'city'; city: City; rank: number };

export interface GlobeHome {
  dx: number; // globe centre offset from the stage centre, px
  dy: number;
  r: number; // silhouette radius, px
}

// Orientation of the intro Earth, so this globe can take over without a seam
export interface GlobeView {
  lat: number; // surface point facing the viewer
  lon: number;
  roll: number; // screen angle of the north axis from "up", radians (clockwise)
  sun: [number, number, number]; // key light, camera space
  // Where the story Earth sits on screen (centre offset and radius, px); the
  // Cesium Earth tracks it while the two cross-fade
  dx?: number;
  dy?: number;
  r?: number;
}

export interface GlobeApi {
  // Match the intro Earth; ignored once the user has taken the camera
  follow: (v: GlobeView) => void;
}

interface PopulationGlobeProps {
  home: GlobeHome | null;
  explore: boolean;
  suspended: boolean; // scrolled into the story; inputs off, panels closed
  onExploreChange: (v: boolean) => void;
  onReady: () => void;
  apiRef: React.MutableRefObject<GlobeApi | null>;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Camera height that makes the globe's silhouette `r` px tall in a view `H` px high
function heightForRadius(r: number, H: number) {
  const a = Math.atan((r * Math.tan(FOVY / 2)) / (H / 2));
  return WGS84_A / Math.sin(a) - WGS84_A;
}

// Look straight down at lat/lon from `height`, with the north axis rolled by `roll`
function viewAt(lat: number, lon: number, roll: number, height: number) {
  const destination = Cartesian3.fromDegrees(lon, lat, height);
  const direction = Cartesian3.normalize(Cartesian3.negate(destination, new Cartesian3()), new Cartesian3());
  const north = Cartesian3.subtract(
    Cartesian3.UNIT_Z,
    Cartesian3.multiplyByScalar(direction, Cartesian3.dot(Cartesian3.UNIT_Z, direction), new Cartesian3()),
    new Cartesian3()
  );
  Cartesian3.normalize(north, north);
  const right = Cartesian3.cross(direction, north, new Cartesian3());
  const up = Cartesian3.add(
    Cartesian3.multiplyByScalar(north, Math.cos(roll), new Cartesian3()),
    Cartesian3.multiplyByScalar(right, -Math.sin(roll), new Cartesian3()),
    new Cartesian3()
  );
  return { destination, orientation: { direction, up } };
}

// Soft glowing dot for city markers, echoing the intro Earth's site markers
function glowSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.16, 'rgba(232,240,246,0.95)');
  g.addColorStop(0.3, 'rgba(140,200,216,0.55)');
  g.addColorStop(1, 'rgba(140,200,216,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return c;
}

export default function PopulationGlobe({
  home,
  explore,
  suspended,
  onExploreChange,
  onReady,
  apiRef,
}: PopulationGlobeProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const creditRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const layersRef = useRef<{
    dayTex?: ImageryLayer;
    base?: ImageryLayer;
    night?: ImageryLayer;
    pop?: ImageryLayer;
  }>({});
  const dotsRef = useRef<{ points: PointPrimitiveCollection; values: Uint8Array } | null>(null);
  const manifestRef = useRef<PopulationManifest | null>(null);
  const cityEntities = useRef<Map<string, City>>(new Map());
  const pinRef = useRef<Entity | null>(null);
  const queryId = useRef(0);
  const touched = useRef(false); // user has taken the camera
  const flying = useRef(false);
  const sunCam = useRef<[number, number, number]>(SUN_REST);
  const lastView = useRef<GlobeView | null>(null);
  const haloRef = useRef<HTMLDivElement | null>(null);
  const haloOn = useRef(true);
  const homeRef = useRef(home);
  homeRef.current = home;
  const suspendedRef = useRef(suspended);
  suspendedRef.current = suspended;
  const boxRef = useRef<HTMLDivElement | null>(null);
  const boxOffset = useRef({ x: 0, y: 0 });
  const readoutRef = useRef<HTMLDivElement | null>(null);
  const readoutPos = useRef<Cartesian3 | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  // Values the per-frame hand-over reads
  const live = useRef({ opacity: 0.85, showPop: true, nightLights: true, basemap: 'styled' as Basemap });

  const [manifest, setManifest] = useState<PopulationManifest | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPop, setShowPop] = useState(true);
  // Density always shows at full strength, with no threshold
  const opacity = 1;
  const minIdx = 0;
  const [nightLights, setNightLights] = useState(true);
  const [nightAvailable, setNightAvailable] = useState(true);
  const [basemap, setBasemap] = useState<Basemap>('styled');
  const [showCities, setShowCities] = useState(true);
  const [readout, setReadout] = useState<Readout | null>(null);
  const [active, setActive] = useState(false); // wheel/touch go to the globe
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const [coarse] = useState(() => !!window.matchMedia?.('(pointer: coarse)').matches);

  live.current = { opacity, showPop, nightLights, basemap };
  const requestRender = () => viewerRef.current?.scene.requestRender();
  const inputOn = explore || active;

  // ---------------------------------------------------------------- viewer
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (ION_TOKEN) Ion.defaultAccessToken = ION_TOKEN;

    const viewer = new Viewer(host, {
      baseLayer: false,
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      skyBox: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      orderIndependentTranslucency: false,
      contextOptions: { webgl: { alpha: true, powerPreference: 'high-performance' } },
      msaaSamples: 1,
      creditContainer: creditRef.current ?? undefined,
    });
    viewerRef.current = viewer;
    const { scene, camera } = viewer;
    // Transparent space, so the page (and the story particles) show around the Earth
    scene.backgroundColor = Color.TRANSPARENT;
    if (scene.sun) scene.sun.show = false;
    if (scene.moon) scene.moon.show = false;

    const globe = scene.globe;
    globe.baseColor = Color.fromCssColorString('#04070D');
    globe.enableLighting = true;
    globe.dynamicAtmosphereLighting = true;
    globe.dynamicAtmosphereLightingFromSun = false;
    globe.showGroundAtmosphere = true;
    globe.atmosphereLightIntensity = 16;
    globe.atmosphereBrightnessShift = 0.15;
    // Keep lighting and the night side at every distance (Cesium fades them out far away)
    globe.lightingFadeOutDistance = 5e8;
    globe.lightingFadeInDistance = 1e9;
    globe.nightFadeOutDistance = 5e8;
    globe.nightFadeInDistance = 1e9;
    if (scene.skyAtmosphere) {
      // A soft pale-blue limb, like the intro Earth's atmosphere
      scene.skyAtmosphere.hueShift = 0;
      scene.skyAtmosphere.saturationShift = 0.05;
      scene.skyAtmosphere.brightnessShift = -0.2;
    }

    const light = new DirectionalLight({ direction: new Cartesian3(1, 0, 0), intensity: 1.05 });
    scene.light = light;
    const ctl = scene.screenSpaceCameraController;
    ctl.minimumZoomDistance = 15000;
    ctl.maximumZoomDistance = 4.5e7;
    camera.setView(viewAt(HOME.lat, HOME.lon, 0, 2.4e7));

    const markTouched = () => {
      touched.current = true;
      flying.current = false;
    };
    scene.canvas.addEventListener('pointerdown', markTouched);
    scene.canvas.addEventListener('wheel', markTouched);

    // Overview: the intro Earth's own textures
    const dayTex = ImageryLayer.fromProviderAsync(SingleTileImageryProvider.fromUrl(DAY_TEX), {
      saturation: 0.46,
      brightness: 0.44,
      contrast: 1.12,
      gamma: 0.92,
      hue: 0.02,
      nightAlpha: 0.22,
    });

    // Detail: Bing (or Natural Earth II) and Black Marble
    const naturalEarth = () =>
      ImageryLayer.fromProviderAsync(
        TileMapServiceImageryProvider.fromUrl(buildModuleUrl('Assets/Textures/NaturalEarthII'))
      );
    const base = ION_TOKEN ? ImageryLayer.fromWorldImagery({}) : naturalEarth();
    base.alpha = 0;
    base.nightAlpha = 0.22;
    const night = new ImageryLayer(
      new WebMapTileServiceImageryProvider({
        url: NIGHT_LIGHTS_URL,
        layer: 'VIIRS_Black_Marble',
        style: 'default',
        tileMatrixSetID: 'GoogleMapsCompatible_Level8',
        format: 'image/png',
        tilingScheme: new WebMercatorTilingScheme(),
        maximumLevel: 8,
        credit: new Credit('Night lights: NASA Black Marble (VIIRS 2016) via NASA GIBS'),
      }),
      // Night side only, at every zoom. Black Marble's ground is navy: grade it
      // towards black so only warm lights remain, as on the intro Earth
      // (Cesium applies pow(c, 1 / gamma): below 1 darkens)
      { dayAlpha: 0, brightness: 1.25, contrast: 1.3, gamma: 0.5, saturation: 0.6 }
    );
    night.errorEvent.addEventListener(() => setNightAvailable(false));

    viewer.imageryLayers.add(base);
    viewer.imageryLayers.add(dayTex);
    viewer.imageryLayers.add(night);
    layersRef.current = { dayTex, base, night };

    // If ion imagery fails (bad token, offline), fall back to the bundled open imagery
    base.errorEvent.addEventListener(() => {
      if (layersRef.current.base !== base || !viewerRef.current) return;
      const fallback = naturalEarth();
      fallback.alpha = base.alpha;
      fallback.nightAlpha = base.nightAlpha;
      viewer.imageryLayers.remove(base, true);
      viewer.imageryLayers.add(fallback, 0);
      layersRef.current.base = fallback;
    });

    // Per frame: lens, key light and the overview → detail hand-over
    const sunWorld = new Cartesian3();
    const tmp = new Cartesian3();
    const onPreRender = () => {
      const canvas = scene.canvas;
      const aspect = (canvas.clientWidth || 1) / (canvas.clientHeight || 1);
      const fr = camera.frustum as PerspectiveFrustum;
      const fov = aspect > 1 ? 2 * Math.atan(Math.tan(FOVY / 2) * aspect) : FOVY;
      if (Math.abs((fr.fov ?? 0) - fov) > 1e-6) fr.fov = fov;

      const s = sunCam.current;
      Cartesian3.multiplyByScalar(camera.rightWC, s[0], sunWorld);
      Cartesian3.add(sunWorld, Cartesian3.multiplyByScalar(camera.upWC, s[1], tmp), sunWorld);
      Cartesian3.add(sunWorld, Cartesian3.multiplyByScalar(camera.directionWC, -s[2], tmp), sunWorld);
      Cartesian3.normalize(sunWorld, sunWorld);
      Cartesian3.negate(sunWorld, light.direction);

      const L = layersRef.current;
      const v = live.current;
      const h = camera.positionCartographic.height;
      // Far out, the soft halo behind the globe stands in for the thin sky line
      if (scene.skyAtmosphere) scene.skyAtmosphere.show = h < 9e6;
      const holding = !touched.current || flying.current;
      if (holding !== haloOn.current) {
        haloOn.current = holding;
        if (haloRef.current) haloRef.current.style.opacity = holding ? '1' : '0';
      }
      const detail = v.basemap === 'satellite' ? 1 : smoothstep(DETAIL_START, DETAIL_FULL, h);
      if (L.base) {
        L.base.alpha = detail;
        L.base.brightness = v.basemap === 'satellite' ? 1 : 0.46;
        L.base.saturation = v.basemap === 'satellite' ? 1 : 0.32;
        L.base.contrast = v.basemap === 'satellite' ? 1 : 1.1;
      }
      if (L.dayTex) L.dayTex.alpha = 1 - detail;
      if (L.night) L.night.show = v.nightLights;
      const popDetail = smoothstep(DETAIL_START * 0.85, DETAIL_FULL, h);
      if (L.pop) {
        L.pop.alpha = v.opacity * popDetail;
        L.pop.show = v.showPop && popDetail > 0.001;
      }
      const dots = dotsRef.current;
      if (dots) dots.points.show = v.showPop && h > DOTS_OFF;
    };
    scene.preRender.addEventListener(onPreRender);

    // The readout card sits beside its point on the globe and follows it
    const win = new Cartesian2();
    const toEye = new Cartesian3();
    const onPostRender = () => {
      const card = readoutRef.current;
      const pos = readoutPos.current;
      if (!card || !pos) return;
      const p = SceneTransforms.worldToWindowCoordinates(scene, pos, win);
      Cartesian3.subtract(camera.positionWC, pos, toEye);
      const facing = Cartesian3.dot(toEye, pos) > 0;
      if (!p || !facing) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        return;
      }
      const stageW = wrapRef.current?.clientWidth || window.innerWidth;
      const stageH = wrapRef.current?.clientHeight || window.innerHeight;
      const x = p.x + boxOffset.current.x;
      const y = p.y + boxOffset.current.y;
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      let left = x + 22;
      if (left + w > stageW - 16) left = x - 22 - w;
      left = Math.max(16, left);
      const top = Math.min(Math.max(88, y - h / 2), stageH - h - 96);
      card.style.left = `${left.toFixed(0)}px`;
      card.style.top = `${top.toFixed(0)}px`;
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
    };
    scene.postRender.addEventListener(onPostRender);

    // Follow the intro Earth until the user takes over
    apiRef.current = {
      follow: (v) => {
        sunCam.current = v.sun;
        const prev = lastView.current;
        lastView.current = v;
        if (touched.current || flying.current) return;
        const tracking = suspendedRef.current && v.r !== undefined;
        // The idle drift is slow: skip frames where nothing visibly moved
        if (
          prev &&
          Math.abs(prev.lat - v.lat) < 0.04 &&
          Math.abs(prev.lon - v.lon) < 0.04 &&
          Math.abs(prev.roll - v.roll) < 0.0007 &&
          (!tracking || (Math.abs((prev.dx ?? 0) - (v.dx ?? 0)) < 0.5 && Math.abs((prev.dy ?? 0) - (v.dy ?? 0)) < 0.5 && Math.abs((prev.r ?? 0) - (v.r ?? 0)) < 0.5))
        ) {
          lastView.current = prev;
          return;
        }
        const H = scene.canvas.clientHeight || 1;
        let r = homeRef.current?.r ?? H * 0.42;
        if (tracking) {
          // In the story: sit exactly where the story Earth is
          r = v.r!;
          const box = boxRef.current;
          if (box) {
            box.style.transition = 'none';
            box.style.transform = `translate(${v.dx!.toFixed(1)}px, ${v.dy!.toFixed(1)}px)`;
            boxOffset.current = { x: v.dx!, y: v.dy! };
          }
          const home = homeRef.current;
          if (haloRef.current && home) haloRef.current.style.transform = `translate(-50%, -50%) scale(${(r / home.r).toFixed(4)})`;
        }
        camera.setView(viewAt(v.lat, v.lon, v.roll, heightForRadius(r, H)));
        scene.requestRender();
      },
    };

    // Ready once the first view's tiles are in (or after a grace period)
    let readyDone = false;
    const ready = () => {
      if (readyDone) return;
      readyDone = true;
      onReadyRef.current();
    };
    const offProgress = globe.tileLoadProgressEvent.addEventListener((n: number) => {
      if (n === 0 && globe.tilesLoaded) ready();
    });
    const readyTimer = window.setTimeout(ready, 9000);

    let alive = true;
    Promise.all([loadManifest(), loadCities()])
      .then(([m, cs]) => {
        if (!alive) return;
        manifestRef.current = m;
        setManifest(m);
        setCities(cs);
      })
      .catch((err) => {
        console.warn('Population data', err);
        if (alive) setError('Population data could not be loaded.');
      });

    return () => {
      alive = false;
      apiRef.current = null;
      offProgress();
      scene.preRender.removeEventListener(onPreRender);
      scene.postRender.removeEventListener(onPostRender);
      window.clearTimeout(readyTimer);
      viewer.destroy();
      viewerRef.current = null;
      layersRef.current = {};
      dotsRef.current = null;
      cityEntities.current.clear();
      pinRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Without the intro hand-over (e.g. no WebGL there), frame the resting size
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !home || touched.current) return;
    const H = viewer.scene.canvas.clientHeight || 1;
    viewer.camera.setView(viewAt(HOME.lat, HOME.lon, 0, heightForRadius(home.r, H)));
    requestRender();
  }, [home]);

  // ------------------------------------------------ population: detail tiles
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !manifest) return;
    const lut = buildLut(manifest, MIN_STEPS[minIdx]);
    const S = manifest.tileSize;
    const blank = document.createElement('canvas');
    blank.width = blank.height = 1;

    const provider = new UrlTemplateImageryProvider({
      url: `${DATA_URL}/tiles/{z}/{x}/{y}.png`,
      tilingScheme: new GeographicTilingScheme(),
      tileWidth: S,
      tileHeight: S,
      maximumLevel: manifest.maxLevel,
      hasAlphaChannel: true,
      credit: new Credit('Population: CIESIN / NASA SEDAC, GPW v4 (2020)'),
    });
    // Greyscale data tiles are coloured on the client with the current ramp
    provider.requestImage = (x: number, y: number, level: number) =>
      loadTile(manifest, level, x, y).then((bytes) => (bytes ? colorize(bytes, S, lut) : blank));

    // Unaffected by the night side: data stays readable all round the globe
    const layer = new ImageryLayer(provider, { alpha: 0, show: false, nightAlpha: 1, dayAlpha: 1 });
    // Keep source cells crisp when zoomed past the data's resolution
    layer.magnificationFilter = TextureMagnificationFilter.NEAREST;
    const old = layersRef.current.pop;
    if (old) viewer.imageryLayers.remove(old, true);
    viewer.imageryLayers.add(layer);
    layersRef.current.pop = layer;
    requestRender();
  }, [manifest, minIdx]);

  // ------------------------------------------- population: overview dot matrix
  // Level 0 of the pyramid (≈30 km), averaged 2x2 to a ≈60 km lattice of
  // unlit points, coloured with the same ramp as the tiles.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !manifest) return;
    let cancelled = false;
    Promise.all([loadTile(manifest, 0, 0, 0), loadTile(manifest, 0, 1, 0)]).then(([a, b]) => {
      if (cancelled || !viewerRef.current) return;
      const S = manifest.tileSize;
      const W = 2 * S;
      const at = (x: number, y: number) => {
        const t = x < S ? a : b;
        return t ? t[y * S + (x % S)] : 0;
      };
      const points = new PointPrimitiveCollection({ blendOption: BlendOption.TRANSLUCENT });
      const values: number[] = [];
      const step = 360 / W;
      for (let y = 0; y + 1 < S; y += 2) {
        for (let x = 0; x < W; x += 2) {
          let sum = 0;
          let n = 0;
          for (let k = 0; k < 4; k++) {
            const v = at(x + (k & 1), y + (k >> 1));
            if (v) {
              sum += decode(manifest, v);
              n++;
            }
          }
          if (!n) continue;
          const d = sum / 4; // ocean cells count as empty, so coastlines soften
          if (d < 1) continue;
          // Deterministic jitter inside the cell, so the overview reads as
          // settlement rather than a lattice
          const hsh = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
          const j1 = hsh - Math.floor(hsh) - 0.5;
          const h2 = Math.sin(x * 269.5 + y * 183.3) * 43758.5453;
          const j2 = h2 - Math.floor(h2) - 0.5;
          const lon = -180 + (x + 1 + j1 * 1.6) * step;
          const lat = 90 - (y + 1 + j2 * 1.6) * step;
          points.add({ position: Cartesian3.fromDegrees(lon, lat, 4000), pixelSize: 2 });
          values.push(encodeDensity(manifest, d));
        }
      }
      viewer.scene.primitives.add(points);
      dotsRef.current = { points, values: Uint8Array.from(values) };
      styleDots();
    });
    return () => {
      cancelled = true;
      const dots = dotsRef.current;
      if (dots && viewerRef.current) viewerRef.current.scene.primitives.remove(dots.points);
      dotsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest]);

  const styleDots = useCallback(() => {
    const dots = dotsRef.current;
    const m = manifestRef.current;
    if (!dots || !m) return;
    // The overview keeps to settled land (≥ 50 /km²) so it reads as lights, not a grid
    const lut = buildLut(m, Math.max(50, MIN_STEPS[minIdx]));
    const k = live.current.opacity;
    const scale = new NearFarScalar(3e6, 1.6, 2.6e7, 0.85);
    for (let i = 0; i < dots.points.length; i++) {
      const p = dots.points.get(i);
      const o = dots.values[i] * 4;
      const al = lut[o + 3] / 255;
      p.show = al > 0;
      if (!p.show) continue;
      const t = (dots.values[i] - 1) / 254;
      p.color = new Color(lut[o] / 255, lut[o + 1] / 255, lut[o + 2] / 255, al * (0.25 + 0.75 * t) * k);
      p.pixelSize = 1 + 2.4 * Math.pow(t, 2.4);
      p.scaleByDistance = scale;
    }
    requestRender();
  }, [minIdx]);

  useEffect(() => {
    styleDots();
  }, [styleDots, opacity]);

  useEffect(() => {
    requestRender();
  }, [opacity, showPop, nightLights, basemap]);

  // ---------------------------------------------------------- city markers
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !cities.length) return;
    const maxPop = cities[0].pop50km;
    const sprite = glowSprite();
    const added: Entity[] = [];
    cities.forEach((c, i) => {
      const e = viewer.entities.add({
        position: Cartesian3.fromDegrees(c.lon, c.lat, 6000),
        billboard: {
          image: sprite,
          width: 9 + 11 * Math.sqrt(c.pop50km / maxPop),
          height: 9 + 11 * Math.sqrt(c.pop50km / maxPop),
          scaleByDistance: new NearFarScalar(1.5e6, 1.2, 2.5e7, 0.7),
        },
        label: {
          text: c.name,
          font: '500 12px Archivo, system-ui, sans-serif',
          fillColor: Color.fromCssColorString('#E9EDF3'),
          outlineColor: Color.fromCssColorString('#05070B'),
          outlineWidth: 3,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -12),
          distanceDisplayCondition: new DistanceDisplayCondition(0, i < 15 ? 7.5e6 : 3.2e6),
        },
      });
      cityEntities.current.set(e.id, c);
      added.push(e);
    });
    requestRender();
    return () => {
      added.forEach((e) => viewer.entities.remove(e));
      cityEntities.current.clear();
    };
  }, [cities]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.entities.values.forEach((e) => {
      if (cityEntities.current.has(e.id)) e.show = showCities;
    });
    requestRender();
  }, [showCities, cities]);

  // ------------------------------------------------------------- queries
  const placePin = useCallback((lon: number, lat: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (pinRef.current) viewer.entities.remove(pinRef.current);
    readoutPos.current = Cartesian3.fromDegrees(lon, lat);
    pinRef.current = viewer.entities.add({
      position: Cartesian3.fromDegrees(lon, lat),
      point: {
        pixelSize: 9,
        color: Color.WHITE,
        outlineColor: ACCENT,
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    requestRender();
  }, []);

  const clearReadout = useCallback(() => {
    queryId.current++;
    setReadout(null);
    readoutPos.current = null;
    const viewer = viewerRef.current;
    if (viewer && pinRef.current) {
      viewer.entities.remove(pinRef.current);
      pinRef.current = null;
      requestRender();
    }
  }, []);

  const flyTo = useCallback((lon: number, lat: number, h: number) => {
    touched.current = true;
    viewerRef.current?.camera.flyTo({ destination: Cartesian3.fromDegrees(lon, lat, h), duration: 1.6 });
  }, []);

  const selectCity = useCallback(
    (c: City, fly = true) => {
      queryId.current++;
      setReadout({ kind: 'city', city: c, rank: cities.indexOf(c) + 1 });
      placePin(c.lon, c.lat);
      if (fly) flyTo(c.lon, c.lat, 6.5e5);
    },
    [cities, placePin, flyTo]
  );

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((ev: { position: Cartesian2 }) => {
      setActive(true);
      const picked = viewer.scene.pick(ev.position);
      const pickedId = picked?.id as Entity | undefined;
      const city = pickedId ? cityEntities.current.get(pickedId.id) : undefined;
      if (city) {
        selectCity(city, false);
        return;
      }
      const cart = viewer.camera.pickEllipsoid(ev.position, viewer.scene.globe.ellipsoid);
      const m = manifestRef.current;
      if (!cart || !m) return;
      const carto = Cartographic.fromCartesian(cart);
      const lat = CMath.toDegrees(carto.latitude);
      const lon = CMath.toDegrees(carto.longitude);
      const id = ++queryId.current;
      setReadout({ kind: 'point', lat, lon, density: null });
      placePin(lon, lat);
      densityAt(m, lat, lon)
        .then((density) => {
          if (id === queryId.current) setReadout({ kind: 'point', lat, lon, density });
        })
        .catch(() => {
          if (id === queryId.current) setReadout({ kind: 'point', lat, lon, density: null, error: true });
        });
    }, ScreenSpaceEventType.LEFT_CLICK);
    return () => handler.destroy();
  }, [selectCity, placePin]);

  // The hero is a scrolling page: wheel (and touch, on phones) only reach the
  // globe once it has been clicked or explore mode is on.
  useEffect(() => {
    const wrap = wrapRef.current;
    const viewer = viewerRef.current;
    if (!wrap || !viewer) return;
    const on = inputOn && !suspended;
    const canvas = viewer.scene.canvas;
    canvas.style.touchAction = on || !coarse ? 'none' : 'pan-y';
    const block = (e: Event) => {
      if (!on) e.stopPropagation();
    };
    const blockTouch = (e: PointerEvent) => {
      if (!on && e.pointerType !== 'mouse') e.stopPropagation();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !explore) setActive(false);
    };
    wrap.addEventListener('wheel', block, { capture: true });
    wrap.addEventListener('pointerdown', blockTouch, { capture: true });
    wrap.addEventListener('pointermove', blockTouch, { capture: true });
    wrap.addEventListener('pointerleave', onLeave);
    return () => {
      wrap.removeEventListener('wheel', block, { capture: true });
      wrap.removeEventListener('pointerdown', blockTouch, { capture: true });
      wrap.removeEventListener('pointermove', blockTouch, { capture: true });
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [inputOn, suspended, explore, coarse]);

  // Tap-to-activate on touch screens (Cesium sees no touches until then)
  const onWrapClick = () => {
    if (coarse && !active) setActive(true);
  };

  // Scrolling into the story: close everything and re-align with the story Earth
  useEffect(() => {
    if (!suspended) return;
    setActive(false);
    setMoreOpen(false);
    touched.current = false;
    flying.current = false;
  }, [suspended]);

  // "More" closes on Escape or a click outside it
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (moreRef.current?.contains(t) || moreBtnRef.current?.contains(t)) return;
      setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        moreBtnRef.current?.focus();
      }
    };
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  // -------------------------------------------------------------- camera
  const zoom = (dir: 1 | -1) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const h = viewer.camera.positionCartographic.height;
    touched.current = true;
    if (dir > 0) viewer.camera.zoomIn(h * 0.45);
    else viewer.camera.zoomOut(h * 0.8);
    requestRender();
  };

  // Glide back to the hero framing, then resume following the intro Earth's drift
  const resetView = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const H = viewer.scene.canvas.clientHeight || 1;
    const v = lastView.current ?? { lat: HOME.lat, lon: HOME.lon, roll: 0 };
    touched.current = false;
    flying.current = true;
    viewer.camera.flyTo({
      ...viewAt(v.lat, v.lon, v.roll, heightForRadius(home?.r ?? H * 0.42, H)),
      duration: 1.4,
      complete: () => {
        flying.current = false;
      },
      cancel: () => {
        flying.current = false;
      },
    });
  };

  // ---------------------------------------------------------------- view
  const top = cities.slice(0, 8);
  const showChrome = !suspended;

  // Hero framing (or centred, when exploring); in the story, follow() moves the box
  useEffect(() => {
    const box = boxRef.current;
    if (!box || suspended) return;
    const x = home && !explore ? home.dx : 0;
    const y = home && !explore ? home.dy : 0;
    box.style.transition = '';
    box.style.transform = `translate(${x}px, ${y}px)`;
    boxOffset.current = { x, y };
    if (haloRef.current) haloRef.current.style.transform = 'translate(-50%, -50%)';
    viewerRef.current?.scene.requestRender();
  }, [home, explore, suspended]);

  // Place the readout as soon as it opens
  useEffect(() => {
    if (readout) viewerRef.current?.scene.requestRender();
  }, [readout]);

  return (
    <div ref={wrapRef} className="absolute inset-0" onClick={onWrapClick}>
      {/* The viewer is centred on the globe's hero position (or the stage, when exploring) */}
      <div
        ref={boxRef}
        className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.22,.7,.2,1)]"
      >
        {/* Atmospheric halo, as on the intro Earth: brighter on the sunlit limb */}
        {home && (
          <div
            ref={haloRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full transition-opacity duration-700"
            style={{
              width: home.r * 2.24,
              height: home.r * 2.24,
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(circle closest-side, rgba(127,180,214,0) 86%, rgba(127,180,214,0.6) 89.5%, rgba(100,155,210,0.22) 93.5%, rgba(80,130,200,0.06) 97%, rgba(80,130,200,0) 100%)',
              WebkitMaskImage: 'linear-gradient(100deg, #000 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.08) 100%)',
              maskImage: 'linear-gradient(100deg, #000 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.08) 100%)',
            }}
          />
        )}
        <div ref={hostRef} className="omav-cesium absolute inset-0" />
      </div>

      <div
        className={`transition-opacity duration-300 ${showChrome ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Dock: zoom, day/night and more, centred under the globe */}
        <div
          className="absolute z-10 bottom-6 -translate-x-1/2 transition-[left] duration-[900ms] ease-[cubic-bezier(.22,.7,.2,1)]"
          style={{ left: home && !explore ? `calc(50% + ${home.dx}px)` : '50%' }}
        >
          {moreOpen && (
            <div
              ref={moreRef}
              role="dialog"
              aria-label="Globe options"
              className="omav-pop surface reticle absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[320px] max-w-[calc(100vw-32px)] max-h-[min(62vh,560px)] overflow-y-auto rounded-xl p-4 text-[13px] text-ice"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[13px] tracking-[0.04em]">Population density, 2020</span>
                <span className="font-mono text-[10.5px] text-slate">people / km²</span>
              </div>
              <Scale minDensity={0} />

              <div className="mt-4 space-y-2.5">
                <Toggle label="Major cities" checked={showCities} onChange={setShowCities} />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate">Imagery</span>
                  <RubberSegment
                    size="sm"
                    items={[
                      { value: 'styled', label: 'Styled' },
                      { value: 'satellite', label: 'Satellite' },
                    ]}
                    value={basemap}
                    onChange={(v) => setBasemap(v as Basemap)}
                    aria-label="Imagery"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-hairline">
                <div className="font-mono text-[10.5px] text-slate">Go to</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={resetView}
                    className="h-7 px-2.5 rounded-[7px] text-[12px] text-abyss bg-ice/90 hover:bg-ice transition-colors duration-150 cursor-pointer"
                  >
                    Home view
                  </button>
                  {REGIONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => flyTo(r.lon, r.lat, r.h)}
                      className="h-7 px-2.5 rounded-[7px] text-[12px] text-ice/80 bg-ice/[0.05] hover:bg-ice/[0.1] hover:text-ice transition-colors duration-150 cursor-pointer"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {top.length > 0 && (
                <div className="mt-4 pt-4 border-t border-hairline">
                  <div className="font-mono text-[10.5px] text-slate">Most people within 50 km</div>
                  <ol className="mt-2">
                    {top.map((c, i) => (
                      <li key={c.name}>
                        <button
                          type="button"
                          onClick={() => selectCity(c)}
                          className="w-full flex items-center gap-3 h-8 px-2 -mx-2 rounded-[7px] text-left hover:bg-ice/[0.05] transition-colors duration-150 cursor-pointer"
                        >
                          <span className="w-4 font-mono text-[11px] text-slate">{i + 1}</span>
                          <span className="flex-1 truncate">{c.name}</span>
                          <span className="font-mono text-[12px] text-signal">{fmtCompact(c.pop50km)}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onExploreChange(!explore);
                }}
                className="btn btn-ghost btn-sm mt-4 w-full justify-center"
              >
                {explore ? <Shrink size={14} /> : <Expand size={14} />}
                {explore ? 'Close full screen' : 'Explore full screen'}
              </button>
              <p className="mt-3 text-[11px] leading-relaxed text-slate">
                CIESIN / NASA SEDAC, Gridded Population of the World v4 (2020), native 1 km grid. Night lights: NASA
                Black Marble. Imagery: Bing Maps via Cesium ion.
              </p>
            </div>
          )}

          <div className="surface flex items-center gap-1.5 rounded-[14px] p-1.5">
            <div className="flex rounded-[10px] bg-ice/[0.06] p-[3px]">
              <DockButton label="Zoom out" onClick={() => zoom(-1)}>
                <Minus size={15} />
              </DockButton>
              <DockButton label="Zoom in" onClick={() => zoom(1)}>
                <Plus size={15} />
              </DockButton>
            </div>
            <RubberSegment
              size="md"
              items={[
                { value: 'day', label: 'Day', icon: <Sun size={13} /> },
                { value: 'night', label: 'Night', icon: <Moon size={13} /> },
              ]}
              value={nightLights ? 'night' : 'day'}
              onChange={(v) => setNightLights(v === 'night')}
              aria-label="Night lights"
              disabled={!nightAvailable}
            />
            <button
              ref={moreBtnRef}
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
              onClick={() => setMoreOpen((o) => !o)}
              className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-[10px] text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                moreOpen ? 'bg-ice text-abyss' : 'bg-ice/[0.06] text-ice/80 hover:text-ice hover:bg-ice/[0.1]'
              }`}
            >
              <SlidersHorizontal size={13} />
              More
            </button>
          </div>
        </div>

        {/* Readout */}
        {readout && (
          <div
            ref={readoutRef}
            role="dialog"
            aria-label="Location details"
            className="omav-pop surface reticle absolute z-10 left-0 top-0 w-[280px] max-w-[calc(100%-32px)] rounded-xl p-4 text-ice transition-opacity duration-150"
            style={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={clearReadout}
              className="absolute right-3 top-3 grid place-items-center w-7 h-7 rounded-[7px] text-slate hover:text-ice hover:bg-ice/[0.06] cursor-pointer"
              aria-label="Close"
            >
              <X size={14} />
            </button>
            {readout.kind === 'city' ? (
              <CityCard city={readout.city} rank={readout.rank} total={cities.length} />
            ) : (
              <PointCard r={readout} manifest={manifest} />
            )}
          </div>
        )}

        {coarse && !inputOn && (
          <div className="pointer-events-none absolute z-10 left-1/2 -translate-x-1/2 bottom-[84px] px-3 py-1.5 rounded-full surface text-[11px] text-slate">
            Tap the globe to explore
          </div>
        )}

        {error && (
          <div className="absolute z-10 left-1/2 -translate-x-1/2 top-24 px-3 py-2 rounded-[7px] bg-[#3a1414]/90 text-[12px] text-[#FFD9D0]">
            {error}
          </div>
        )}
      </div>

      {/* Data and imagery credits (required by the providers) */}
      <div ref={creditRef} className="omav-cesium-credits absolute z-10 left-1/2 -translate-x-1/2 bottom-1.5" />
    </div>
  );
}

function Scale({ minDensity }: { minDensity: number }) {
  return (
    <div className="mt-2.5">
      <div className="flex h-2.5 rounded-sm overflow-hidden">
        {CLASSES.map((c) => (
          <span
            key={c.label}
            className="flex-1"
            style={{ background: `rgb(${c.color.join(',')})`, opacity: c.min < minDensity ? 0.15 : c.alpha }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-mono text-[#8C96A6]">
        {CLASSES.map((c) => (
          <span key={c.label}>{c.label}</span>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10.5px] font-mono tracking-[0.2em] text-[#8C96A6] uppercase">{children}</div>;
}

function PointCard({
  r,
  manifest,
}: {
  r: Extract<Readout, { kind: 'point' }>;
  manifest: PopulationManifest | null;
}) {
  const coords = `${Math.abs(r.lat).toFixed(3)}° ${r.lat >= 0 ? 'N' : 'S'}, ${Math.abs(r.lon).toFixed(3)}° ${
    r.lon >= 0 ? 'E' : 'W'
  }`;
  const area = manifest ? cellAreaKm2(manifest, r.lat) : 0;
  return (
    <>
      <div className="flex items-center gap-2 text-[10.5px] font-mono tracking-[0.18em] text-[#8C96A6] uppercase">
        <Crosshair size={12} /> Selected location
      </div>
      <div className="mt-1 text-[12px] font-mono text-[#AEB7C3]">{coords}</div>
      {r.error ? (
        <div className="mt-3 text-sm text-[#FFD9D0]">Couldn’t read the data here. Try again.</div>
      ) : r.density === null ? (
        <div className="mt-3 text-sm text-[#AEB7C3]">Reading grid…</div>
      ) : (
        <>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-[28px] leading-none font-medium tracking-tight">{fmtDensity(r.density)}</span>
            <span className="text-[12px] text-[#8C96A6]">people / km²</span>
          </div>
          <div className="mt-1.5 text-[13px] text-[#8CC8D8]">{describeDensity(r.density)}</div>
          {r.density > 0 && (
            <div className="mt-3 pt-3 border-t border-[#DCE4EE]/10 text-[12px] text-[#AEB7C3]">
              ≈ {fmtInt(r.density * area)} people in this {area.toFixed(2)} km² cell
            </div>
          )}
        </>
      )}
    </>
  );
}

function CityCard({ city, rank, total }: { city: City; rank: number; total: number }) {
  return (
    <>
      <div className="text-[10.5px] font-mono tracking-[0.18em] text-[#8C96A6] uppercase">
        #{rank} of {total} cities · {city.country}
      </div>
      <div className="mt-1 text-xl font-medium tracking-tight">{city.name}</div>
      <dl className="mt-3 space-y-2 text-[13px]">
        <Stat label="People within 50 km" value={fmtInt(city.pop50km)} />
        <Stat label="Peak density (1 km cell)" value={`${fmtInt(city.peak)} /km²`} />
        <Stat label="Density at centre" value={`${fmtInt(city.center)} /km²`} />
      </dl>
      <div className="mt-3 pt-3 border-t border-[#DCE4EE]/10 text-[12px] text-[#8CC8D8]">
        {describeDensity(city.peak)}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[#AEB7C3]">{label}</dt>
      <dd className="font-mono text-[#E9EDF3]">{value}</dd>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${disabled ? 'opacity-40' : ''}`}>
      <span className="text-[#AEB7C3]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-[18px] rounded-full transition-colors shrink-0 ${
          checked ? 'bg-[#8CC8D8]' : 'bg-[#DCE4EE]/15'
        } ${disabled ? '' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-[#05070B] transition-transform ${
            checked ? 'translate-x-[14px]' : ''
          }`}
        />
      </button>
    </div>
  );
}

function DockButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid place-items-center w-[30px] h-[30px] rounded-[7px] text-ice/75 hover:text-ice hover:bg-ice/[0.08] active:scale-95 transition-[color,background-color,transform] duration-150 cursor-pointer"
    >
      {children}
    </button>
  );
}
