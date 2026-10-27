// Shared state between the logo intro overlay and the 3D Earth, so the logo's
// blue dot can land exactly on the globe's on-screen silhouette.

export interface GlobeTarget {
  // Silhouette ellipse of the globe in viewport pixels
  x: number;
  y: number;
  a: number; // semi-axis along `angle`
  b: number; // semi-axis perpendicular to `angle`
  angle: number; // radians
}

type Listener = () => void;

const listeners = new Set<Listener>();
const state = {
  active: true,
  target: null as GlobeTarget | null,
  ready: false,
  revealed: false,
};

const emit = () => listeners.forEach((fn) => fn());

export const introBridge = {
  get active() {
    return state.active;
  },
  get target() {
    return state.target;
  },
  get ready() {
    return state.ready;
  },
  get revealed() {
    return state.revealed;
  },
  setTarget(t: GlobeTarget) {
    state.target = t;
  },
  setReady() {
    if (state.ready) return;
    state.ready = true;
    emit();
  },
  clearGlobe() {
    state.target = null;
    state.ready = false;
  },
  reveal() {
    if (state.revealed) return;
    state.revealed = true;
    emit();
  },
  finish() {
    state.active = false;
    state.revealed = true;
    emit();
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
