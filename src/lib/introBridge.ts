// Shared clock and virtual camera for the logo intro. The emblem (SVG, in
// LogoIntro) and the Earth (WebGL, in EarthCanvas) both read this state, so the
// emblem's blue centre and the globe move as one object through the camera push.

export type IntroMode = 'play' | 'done' | 'off';

export interface IntroDot {
  // Blue centre at rest, in stage pixels
  x: number;
  y: number;
  r: number;
}

export interface IntroLayout {
  // Resting globe placement from EarthCanvas (world units) + view
  gs: number;
  gx: number;
  gy: number;
  hh: number; // half view height in world units at z = 0
  W: number;
  H: number;
}

export interface IntroCam {
  u: number; // eased camera progress 0..1
  x: number;
  y: number;
  z: number; // Earth zoom factor
  ze: number; // emblem zoom factor (z ^ BETA)
  lnz: number;
  r: number; // globe silhouette radius in stage pixels
}

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    let i;
    for (i = 0; i < 8; i++) {
      const e = sx(t) - x;
      const d = dx(t);
      if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    if (t < 0 || t > 1 || Math.abs(sx(t) - x) > 1e-4) {
      let lo = 0;
      let hi = 1;
      t = x;
      for (i = 0; i < 40; i++) {
        const v = sx(t);
        if (Math.abs(v - x) < 1e-6) break;
        if (v < x) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
    }
    return sy(t);
  };
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

export const K = {
  seg: (t: number, a: number, b: number) => clamp01((t - a) / (b - a)),
  smooth: (a: number, b: number, t: number) => {
    const x = clamp01((t - a) / (b - a));
    return x * x * (3 - 2 * x);
  },
  smoother: (a: number, b: number, t: number) => {
    const x = clamp01((t - a) / (b - a));
    return x * x * x * (x * (x * 6 - 15) + 10);
  },
  outExpo: (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  outQuint: (x: number) => 1 - Math.pow(1 - x, 5),
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutSine: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
  // One master progress curve for the whole camera move (gentle in, long settle)
  camEase: bezier(0.3, 0.0, 0.5, 1.0),
};

// Logo construction (0 to 4.0 s), then the blue centre becomes the Earth in one
// continuous shot timed from T0.
const T0 = 4.3;
export const TL = {
  BANDS: [
    [-100, -73.854],
    [-71.515, -42.994],
    [-40.557, -16.514],
    [-14.039, 5.725],
    [7.858, 23.404],
    [25.556, 36.515],
    [38.841, 45.385],
    [47.761, 60],
  ],
  HZ0: 0.1, HZ1: 1.05, HZF0: 1.3, HZF1: 2.35,
  B: [0.3, 0.38, 0.46, 0.54, 1.62, 1.68, 1.74, 1.8], BDUR: 1.0, THK0: 0.42, THK1: 1.02,
  RING0: 0.95, RING1: 1.6, RINGF0: 1.75, RINGF1: 2.4,
  DOT0: 1.12, DOT1: 1.75,
  W0: 1.38, W1: 2.42, LAG: 0.07,
  LENS0: 1.78, LENS1: 2.62,
  NIB0: 2.08, NIB1: 2.7,
  DROP0: 2.45,
  LET0: 2.52, LETS: 0.07, LETD: 0.95,
  MOT0: 2.95, MOT1: 3.75,
  SH0: 3.1, SH1: 4.0,
  SKIP0: 0.8,
  T0,
  HOLD: T0,
  FADE1: T0 + 0.12,
  DEPTH0: T0 + 0.05, DEPTH1: T0 + 0.55,
  EARTH0: T0 + 0.2, EARTH1: T0 + 1.2,
  LAND0: T0 + 0.35, LAND1: T0 + 1.2,
  CLOUD0: T0 + 0.5, CLOUD1: T0 + 1.35,
  NIGHT0: T0 + 0.9, NIGHT1: T0 + 1.9,
  ATMO0: T0 + 0.15, ATMO1: T0 + 1.2,
  CAM0: T0 + 0.35, CAM1: T0 + 2.65,
  GO: T0 + 1.95, NET0: T0 + 2.3, NET1: T0 + 3.6,
  SKIP1: T0 + 1.5, END: T0 + 2.75,
  // Emblem share of the camera push (Earth scale ^ BETA): the Earth travels
  // towards the viewer, the emblem stays behind it and resolves out between
  // these Earth zoom factors.
  BETA: 0.3, GA0: Math.log(1.9), GA1: Math.log(6.0),
};

const SKIP_SPEED = 6.5;
const MAX_HOLD = 6; // seconds to wait at T0 for the Earth textures

type Listener = () => void;
const listeners = new Set<Listener>();

const state = {
  mode: 'off' as IntroMode,
  t: 0,
  speed: 1,
  held: 0,
  went: false,
  lastNow: -1,
  endNow: -1,
  dot: null as IntroDot | null,
  lay: null as IntroLayout | null,
  earthReady: false,
  cam: { u: 0, x: 0, y: 0, z: 1, ze: 1, lnz: 0, r: 0 } as IntroCam,
};

const emit = () => listeners.forEach((fn) => fn());

// One shared virtual camera for the emblem and the globe: a cubic Bezier path in
// (screen x, screen y, log zoom), driven by a single eased progress value.
function updateCam(t: number) {
  const C = state.cam;
  const d = state.dot;
  if (!d) return;
  let tx: number;
  let ty: number;
  let R: number;
  const L = state.lay;
  if (L) {
    const wpp = (2 * L.hh) / L.H;
    tx = L.W / 2 + L.gx / wpp;
    ty = L.H / 2 - L.gy / wpp;
    R = L.gs / wpp;
  } else {
    const W = window.innerWidth || 1280;
    const H = window.innerHeight || 800;
    tx = W * 0.75;
    ty = H * 0.5;
    R = H * 0.42;
  }
  const lz = Math.log(Math.max(1.5, R / d.r));
  const u = K.camEase(K.seg(t, TL.CAM0, TL.CAM1));
  // Zoom runs in log space; the pan follows a cubic Bezier (P0 = P1 = centre,
  // P2 near the target) so it trails the push-in and arcs into the hero spot.
  const lnz = u * lz;
  const pw = 3 * (1 - u) * u * u * 0.88 + u * u * u;
  C.u = u;
  C.x = d.x + (tx - d.x) * pw;
  C.y = d.y + (ty - d.y) * pw;
  C.z = Math.exp(lnz);
  C.ze = Math.exp(lnz * TL.BETA);
  C.lnz = lnz;
  C.r = d.r * C.z;
}

function end(now?: number) {
  if (state.mode !== 'play') return;
  if (state.t < TL.END) state.t = TL.END;
  state.mode = 'done';
  state.endNow = now ?? performance.now();
  updateCam(state.t);
  if (!state.went) state.went = true;
  emit();
}

export const introBridge = {
  get mode() {
    return state.mode;
  },
  get t() {
    return state.t;
  },
  get speed() {
    return state.speed;
  },
  get went() {
    return state.went;
  },
  get dot() {
    return state.dot;
  },
  get cam() {
    return state.cam;
  },
  // Intro time that keeps running after the intro ends, for the network fade-in
  clock(now: number) {
    return state.mode === 'done' ? state.t + Math.max(0, now - state.endNow) / 1000 : state.t;
  },
  start() {
    state.mode = 'play';
    state.t = 0;
    state.speed = 1;
    state.held = 0;
    state.went = false;
    state.lastNow = -1;
    emit();
  },
  disable() {
    state.mode = 'off';
    state.went = true;
    emit();
  },
  // Advance the clock once per animation frame, whichever loop gets there first
  frame(now: number) {
    if (state.mode !== 'play' || now === state.lastNow) return;
    const dt = state.lastNow < 0 ? 0 : Math.min(0.1, Math.max(0, (now - state.lastNow) / 1000));
    state.lastNow = now;
    let nt = state.t + dt * state.speed;
    if (nt > TL.HOLD && state.t <= TL.HOLD && !state.earthReady && state.held < MAX_HOLD) {
      state.held += dt;
      nt = TL.HOLD;
    }
    state.t = nt;
    updateCam(state.t);
    if (!state.went && state.t >= TL.GO) {
      state.went = true;
      emit();
    }
    if (state.t >= TL.END) end(now);
  },
  skip() {
    if (state.mode === 'play') state.speed = SKIP_SPEED;
  },
  end,
  setDot(dot: IntroDot) {
    state.dot = dot;
    updateCam(state.t);
  },
  setLayout(lay: IntroLayout | null) {
    state.lay = lay;
    if (state.mode === 'play') updateCam(state.t);
  },
  // Earth textures are loaded (or WebGL is unavailable), so the dive may begin
  setEarthReady() {
    state.earthReady = true;
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
