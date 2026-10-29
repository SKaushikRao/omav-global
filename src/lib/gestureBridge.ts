import { SCENES } from '../components/story/storyScenes';

// Shared state for hand-gesture control of the home globe. The gesture panel
// writes it; the Earth reads it every frame.

type Listener = (active: boolean) => void;

const ZOOM_MIN = 0.55;
const ZOOM_MAX = 2.6;

let tween = 0;
let tweenCancel: (() => void) | null = null;

function stopTween() {
  if (tween) cancelAnimationFrame(tween);
  tween = 0;
  tweenCancel?.();
  tweenCancel = null;
}

// Scroll the page to `top` over `ms`, eased; any wheel, touch or key from the
// user hands the page straight back to them
function glideTo(top: number, ms: number) {
  stopTween();
  const from = window.scrollY;
  const d = top - from;
  if (Math.abs(d) < 2) return;
  const t0 = performance.now();
  const cancel = () => stopTween();
  const opts = { passive: true } as const;
  window.addEventListener('wheel', cancel, opts);
  window.addEventListener('touchstart', cancel, opts);
  window.addEventListener('keydown', cancel);
  tweenCancel = () => {
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
    window.removeEventListener('keydown', cancel);
  };
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    // Sine ease: a gentle start and landing, and no burst of speed in between
    const e = 0.5 - 0.5 * Math.cos(Math.PI * k);
    // Instant per frame: the page's CSS smooth scrolling would fight the glide
    window.scrollTo({ top: from + d * e, behavior: 'instant' });
    if (k < 1) tween = requestAnimationFrame(step);
    else stopTween();
  };
  tween = requestAnimationFrame(step);
}

export const gestureBridge = {
  active: false,
  zoom: 1, // target globe scale, set by the two-hand spread
  // Target turn of the Earth from an open palm (radians): yaw left/right,
  // pitch up/down. Only at the hero; the story keeps its fixed path.
  yaw: 0,
  pitch: 0,
  atHero: true, // set by the Earth: false once the page has scrolled into the story
  listeners: new Set<Listener>(),

  setActive(on: boolean) {
    if (on === this.active) return;
    this.active = on;
    if (!on) {
      this.zoom = 1;
      this.yaw = 0;
      this.pitch = 0;
      stopTween();
    }
    document.documentElement.classList.toggle('omav-gesture', on);
    this.listeners.forEach((l) => l(on));
  },

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  },

  setZoom(z: number) {
    this.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
  },

  rotateBy(dYaw: number, dPitch: number) {
    if (!this.atHero) return;
    this.yaw += dYaw;
    this.pitch = Math.min(0.7, Math.max(-0.7, this.pitch + dPitch));
  },

  // Scroll to a story scene (0-4), or back to the hero (-1). Slow enough that
  // the scene's animation plays out on the way, as it does when scrolling.
  goTo(scene: number) {
    let top = 0;
    if (scene >= 0) {
      const el = document.getElementById(SCENES[scene]);
      if (!el) return;
      const r = el.getBoundingClientRect();
      top = window.scrollY + r.top + r.height / 2 - window.innerHeight / 2;
    }
    const screens = Math.abs(top - window.scrollY) / (window.innerHeight || 1);
    glideTo(Math.max(0, top), Math.min(14000, Math.max(2400, screens * 2600)));
  },
};
