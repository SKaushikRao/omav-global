// Shared state between the logo intro overlay and the 3D Earth, so the logo's
// blue dot and the globe move as one object during the zoom.

export interface GlobeTarget {
  // Silhouette ellipse of the globe in viewport pixels
  x: number;
  y: number;
  a: number; // semi-axis along `angle`
  b: number; // semi-axis perpendicular to `angle`
  angle: number; // radians
}

// Globe placement in world units (on the z = 0 plane)
export interface GlobePose {
  x: number;
  y: number;
  s: number;
}

export interface GlobeView {
  left: number;
  top: number;
  W: number;
  H: number;
  camZ: number;
  tanHalf: number; // tan(vertical fov / 2)
}

export interface IntroPose {
  pose: GlobePose;
  mix: number; // 0 = flat logo dot, 1 = fully lit Earth
}

type Listener = () => void;
type PoseFn = (now: number) => IntroPose | null;

const listeners = new Set<Listener>();
const state = {
  active: true,
  view: null as GlobeView | null,
  home: null as GlobePose | null,
  ready: false,
  revealed: false,
  poseFn: null as PoseFn | null,
};

const emit = () => listeners.forEach((fn) => fn());

// Exact projection of a sphere: off-axis it becomes an ellipse stretched
// along its offset from the view axis.
function project(v: GlobeView, p: GlobePose): GlobeTarget {
  const pxPerTan = v.H / 2 / v.tanHalf;
  const off = Math.hypot(p.x, p.y);
  const d = Math.hypot(off, v.camZ);
  const th = Math.atan(off / v.camZ);
  const sa = Math.min(0.99, p.s / d);
  const ca = Math.sqrt(1 - sa * sa);
  const den = Math.cos(th) * Math.cos(th) - sa * sa;
  const ang = Math.atan2(-p.y, p.x);
  const c = ((Math.sin(th) * Math.cos(th)) / den) * pxPerTan;
  return {
    x: v.left + v.W / 2 + Math.cos(ang) * c,
    y: v.top + v.H / 2 + Math.sin(ang) * c,
    a: ((sa * ca) / den) * pxPerTan,
    b: (sa / Math.sqrt(den)) * pxPerTan,
    angle: ang,
  };
}

// Inverse of `project` for a small circle on screen (used for the logo dot
// at rest, where the off-axis stretch is sub-pixel)
function unproject(v: GlobeView, x: number, y: number, r: number): GlobePose {
  const pxPerTan = v.H / 2 / v.tanHalf;
  const wx = ((x - v.left - v.W / 2) / pxPerTan) * v.camZ;
  const wy = (-(y - v.top - v.H / 2) / pxPerTan) * v.camZ;
  const d = Math.hypot(wx, wy, v.camZ);
  return { x: wx, y: wy, s: d * Math.sin(Math.atan(r / pxPerTan)) };
}

export const introBridge = {
  get active() {
    return state.active;
  },
  get target() {
    return state.view && state.home ? project(state.view, state.home) : null;
  },
  get home() {
    return state.home;
  },
  get ready() {
    return state.ready;
  },
  get revealed() {
    return state.revealed;
  },
  project(p: GlobePose) {
    return state.view ? project(state.view, p) : null;
  },
  unproject(x: number, y: number, r: number) {
    return state.view ? unproject(state.view, x, y, r) : null;
  },
  setGlobe(view: GlobeView, home: GlobePose) {
    state.view = view;
    state.home = home;
  },
  setReady() {
    if (state.ready) return;
    state.ready = true;
    emit();
  },
  clearGlobe() {
    state.view = null;
    state.home = null;
    state.ready = false;
  },
  setPoseFn(fn: PoseFn | null) {
    state.poseFn = fn;
  },
  poseAt(now: number) {
    return state.active && state.poseFn ? state.poseFn(now) : null;
  },
  reveal() {
    if (state.revealed) return;
    state.revealed = true;
    emit();
  },
  finish() {
    state.active = false;
    state.revealed = true;
    state.poseFn = null;
    emit();
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
