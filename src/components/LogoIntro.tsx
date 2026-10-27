import React, { useEffect, useRef, useState } from 'react';
import { introBridge, GlobePose, IntroPose } from '../lib/introBridge';

interface LogoIntroProps {
  onComplete: () => void;
}

// Geometry of /logo.png (844 x 799), measured from the artwork
const LOGO_SRC = '/logo.png';
const IMG_W = 844;
const IMG_H = 799;
const DOT_X = 423;
const DOT_Y = 304.5;
const DOT_R = 51.7;
const RING_W = 8.3;
const DOT_RGB = '45, 48, 125';
// The ring starts as the logo's white and deepens to navy during the zoom
const RING_REST = [255, 255, 255];
const RING_ZOOM = [30, 32, 88];

// Timeline (seconds)
const FADE_IN = 1.0;
const HOLD_UNTIL = 2.1;
const WAIT_MAX = 4.8;
const ZOOM = 2.6;
const RELEASE_AT = 0.86; // zoom progress at which the page chrome fades in
const HANDOFF = 1.2;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface Frame {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
  scale: number; // logo px per artwork px
  logoA: number;
  layerA: number;
  hole: number;
  feather: number;
  cut: boolean; // open the dot so the real globe shows through
  navyA: number;
  ringA: number;
  ringMix: number;
  earth: IntroPose | null;
  zoomP: number;
  done: boolean;
}

export const LogoIntro: React.FC<LogoIntroProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const ctx = canvas?.getContext('2d');
    const html = document.documentElement;
    const splash = document.getElementById('omav-splash');

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    let alive = true;
    let raf = 0;
    let released = false;

    const releasePage = () => {
      if (released) return;
      released = true;
      introBridge.reveal();
      html.classList.add('omav-intro-out');
      html.classList.remove('omav-intro');
      if (overlay) overlay.style.pointerEvents = 'none';
      window.setTimeout(() => html.classList.remove('omav-intro-out'), 3000);
    };

    const finish = () => {
      if (!alive) return;
      alive = false;
      releasePage();
      html.classList.remove('omav-intro-lock');
      splash?.remove();
      introBridge.finish();
      setDone(true);
      onCompleteRef.current();
    };

    if (!canvas || !ctx) {
      finish();
      return;
    }

    const reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const img = new Image();
    img.decoding = 'async';
    img.src = LOGO_SRC;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = 1;
    const fit = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const d = Math.min(window.devicePixelRatio || 1, 2);
      if (w === W && h === H && d === dpr && canvas.width) return;
      W = w;
      H = h;
      dpr = d;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };

    let t0 = -1;
    let tZoom = -1;
    let startPose: GlobePose | null = null;

    // Logo at rest: centered, sized to the viewport
    const rest = () => {
      const restW = Math.min((H * 0.5 * IMG_W) / IMG_H, W * 0.74);
      const k0 = restW / IMG_W;
      return {
        r0: DOT_R * k0,
        sx: W / 2 + (DOT_X - IMG_W / 2) * k0,
        sy: H / 2 + (DOT_Y - IMG_H / 2) * k0 - H * 0.02,
      };
    };

    // Pure function of the frame timestamp, so the globe (which renders in its
    // own rAF callback with the same timestamp) lands exactly inside the dot.
    const compute = (now: number): Frame => {
      const t = t0 < 0 ? 0 : (now - t0) / 1000;
      const { r0, sx, sy } = rest();
      const fadeIn = easeOutCubic(clamp01(t / (reduced ? 0.6 : FADE_IN)));
      const rr = r0 * lerp(0.965, 1, fadeIn);

      const f: Frame = {
        cx: sx,
        cy: sy,
        rx: rr,
        ry: rr,
        rot: 0,
        scale: rr / DOT_R,
        logoA: fadeIn,
        layerA: 1,
        hole: Infinity,
        feather: 0,
        cut: false,
        navyA: fadeIn,
        ringA: fadeIn,
        ringMix: 0,
        earth: null,
        zoomP: 0,
        done: false,
      };

      if (tZoom < 0) return f;

      if (reduced) {
        const h = clamp01((t - tZoom) / 0.8);
        f.layerA = f.navyA = f.ringA = 1 - h;
        f.zoomP = 1;
        f.done = h >= 1;
        return f;
      }

      const p = clamp01((t - tZoom) / ZOOM);
      const e = easeInOutCubic(p);
      const ePos = easeInOutCubic(clamp01((p - 0.1) / 0.9));
      const h = p >= 1 ? (t - tZoom - ZOOM) / HANDOFF : 0;
      const home = introBridge.home;
      f.zoomP = p;

      if (startPose && home) {
        // Fly the globe itself: exponential scale reads as constant camera speed
        const pose = {
          x: lerp(startPose.x, home.x, ePos),
          y: lerp(startPose.y, home.y, ePos),
          s: startPose.s * Math.pow(home.s / startPose.s, e),
        };
        const sil = introBridge.project(pose)!;
        f.cx = sil.x;
        f.cy = sil.y;
        f.rx = sil.a;
        f.ry = sil.b;
        f.rot = sil.angle;
        f.scale = sil.b / DOT_R;
        f.cut = true;

        // The Earth surfaces through the dot over the whole dive. It is drawn a
        // touch oversized so its rim always sits under the ring, never a gap.
        const mix = smooth(0.03, 1, p);
        f.earth = { pose: { ...pose, s: pose.s * lerp(1.035, 1, e) }, mix };
        f.navyA = (1 - 0.85 * mix) * (1 - smooth(0, 1, h));
      } else {
        // No globe on this page: dive into the dot until it fills the screen
        const rT = Math.hypot(W, H) * 0.52;
        const r = r0 * Math.pow(rT / r0, e);
        f.cx = lerp(sx, W / 2, ePos);
        f.cy = lerp(sy, H / 2, ePos);
        f.rx = f.ry = r;
        f.scale = r / DOT_R;
        f.navyA = 1 - smooth(0, 1, h);
      }

      // Space closes in around the dot as we dive into it
      const r = Math.sqrt(f.rx * f.ry);
      const kh = Math.exp(lerp(Math.log(22), Math.log(1.0), smooth(0.04, 0.84, p)));
      f.hole = r * kh;
      f.feather = f.hole * lerp(0.75, 0.12, smooth(0.04, 0.9, p));
      f.ringMix = smooth(0.02, 0.35, p);
      f.ringA = 1 - smooth(0, 0.45, h);
      f.layerA = 1 - smooth(0, 0.35, h);
      f.done = h >= 1;
      return f;
    };

    introBridge.setPoseFn((now) => (alive ? compute(now).earth : null));

    const draw = (f: Frame) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // White ground + logo, cut by the closing iris
      if (f.layerA > 0.001) {
        ctx.globalAlpha = f.layerA;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = f.layerA * f.logoA;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          f.cx - DOT_X * f.scale,
          f.cy - DOT_Y * f.scale,
          IMG_W * f.scale,
          IMG_H * f.scale
        );
        ctx.globalAlpha = 1;

        if (f.hole + f.feather < Math.hypot(W, H) * 1.5) {
          const outer = f.hole + f.feather;
          const g = ctx.createRadialGradient(f.cx, f.cy, 0, f.cx, f.cy, outer);
          g.addColorStop(0, '#000');
          g.addColorStop(f.hole / outer, '#000');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalCompositeOperation = 'destination-in';
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        }
      }

      if (f.cut) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.ellipse(f.cx, f.cy, f.rx, f.ry, f.rot, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // Crisp vector ring + dot drawn over the artwork's own dot
      const ringW = (RING_W / DOT_R) * Math.min(f.rx, f.ry);
      if (f.ringA > 0.001) {
        const rc = RING_REST.map((c, i) => Math.round(lerp(c, RING_ZOOM[i], f.ringMix)));
        ctx.beginPath();
        ctx.ellipse(f.cx, f.cy, f.rx + ringW / 2 - 0.5, f.ry + ringW / 2 - 0.5, f.rot, 0, Math.PI * 2);
        ctx.lineWidth = ringW + 1;
        ctx.strokeStyle = `rgba(${rc[0]}, ${rc[1]}, ${rc[2]}, ${f.ringA})`;
        ctx.stroke();
      }
      if (f.navyA > 0.001) {
        ctx.beginPath();
        ctx.ellipse(f.cx, f.cy, f.rx, f.ry, f.rot, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DOT_RGB}, ${f.navyA})`;
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      fit();
      if (t0 < 0) t0 = now;
      const t = (now - t0) / 1000;

      if (tZoom < 0) {
        const hasGlobe = !!introBridge.home;
        if (
          t >= (reduced ? 1.4 : HOLD_UNTIL) &&
          (introBridge.ready || !hasGlobe || t >= WAIT_MAX)
        ) {
          tZoom = t;
          if (hasGlobe && !reduced) {
            const { r0, sx, sy } = rest();
            startPose = introBridge.unproject(sx, sy, r0);
            introBridge.reveal();
          }
        }
      }

      const f = compute(now);
      if (f.zoomP >= RELEASE_AT) releasePage();
      if (f.done) {
        finish();
        return;
      }
      draw(f);
      if (splash && t > 0) splash.style.display = 'none';
    };

    img
      .decode()
      .then(() => {
        if (alive) raf = requestAnimationFrame(frame);
      })
      .catch(() => (img.complete && img.naturalWidth ? (raf = requestAnimationFrame(frame)) : finish()));

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      introBridge.setPoseFn(null);
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[200]"
      style={{ pointerEvents: 'auto' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};
