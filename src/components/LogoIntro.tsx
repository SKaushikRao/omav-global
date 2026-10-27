import React, { useEffect, useRef, useState } from 'react';
import { introBridge, GlobeTarget } from '../lib/introBridge';

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
const ZOOM = 2.4;
const REVEAL_AT = 0.86; // zoom progress at which the Earth starts lighting up
const HANDOFF = 1.4;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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
    let revealed = false;

    const releasePage = () => {
      if (revealed) return;
      revealed = true;
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

    let W = 0;
    let H = 0;
    let dpr = 1;
    const fit = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const d = Math.min(window.devicePixelRatio || 1, 2);
      if (w === W && h === H && d === dpr) return;
      W = w;
      H = h;
      dpr = d;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };

    let t0 = 0;
    let tZoom = -1;
    let target: GlobeTarget | null = null;

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      fit();

      const t = (now - t0) / 1000;

      // Logo at rest: centered, sized to the viewport
      const restW = Math.min((H * 0.5 * IMG_W) / IMG_H, W * 0.74);
      const k0 = restW / IMG_W;
      const r0 = DOT_R * k0;
      const sx = W / 2 + (DOT_X - IMG_W / 2) * k0;
      const sy = H / 2 + (DOT_Y - IMG_H / 2) * k0 - H * 0.02;

      const fadeIn = easeOutCubic(clamp01(t / (reduced ? 0.6 : FADE_IN)));

      if (tZoom < 0) {
        const globeKnown = !!introBridge.target;
        if (
          t >= (reduced ? 1.4 : HOLD_UNTIL) &&
          (introBridge.ready || !globeKnown || t >= WAIT_MAX)
        ) {
          tZoom = t;
        }
      }

      let cx = sx;
      let cy = sy;
      let rx = r0 * lerp(0.965, 1, fadeIn);
      let ry = rx;
      let rot = 0;
      let scale = rx / DOT_R;
      let hole = Infinity;
      let feather = 0;
      let layerA = 1;
      let dotA = fadeIn;
      let ringA = fadeIn;
      let ringMix = 0;

      if (tZoom >= 0 && reduced) {
        releasePage();
        const h = clamp01((t - tZoom) / 0.8);
        layerA = 1 - h;
        dotA = 1 - h;
        ringA = 1 - h;
        if (h >= 1) {
          finish();
          return;
        }
      } else if (tZoom >= 0) {
        const p = clamp01((t - tZoom) / ZOOM);
        const e = easeInOutCubic(p);
        const ePos = easeInOutCubic(clamp01((p - 0.1) / 0.9));

        // Track the globe live so a resize mid-zoom still lands exactly
        target = introBridge.target || target;
        const T: GlobeTarget = target || {
          x: W / 2,
          y: H / 2,
          a: Math.hypot(W, H) * 0.52,
          b: Math.hypot(W, H) * 0.52,
          angle: 0,
        };
        const rT = Math.sqrt(T.a * T.b);

        // Exponential zoom reads as constant camera speed
        const r = r0 * Math.pow(rT / r0, e);
        scale = r / DOT_R;
        cx = lerp(sx, T.x, ePos);
        cy = lerp(sy, T.y, ePos);
        rx = r * lerp(1, T.a / rT, e);
        ry = r * lerp(1, T.b / rT, e);
        rot = T.angle;

        // Space closes in around the dot as we dive into it
        const kh = Math.exp(lerp(Math.log(22), Math.log(1.0), smooth(0.04, 0.84, p)));
        hole = r * kh;
        feather = hole * lerp(0.75, 0.12, smooth(0.04, 0.9, p));
        ringMix = smooth(0.02, 0.35, p);

        if (p >= REVEAL_AT) releasePage();

        if (p >= 1) {
          const h = (t - tZoom - ZOOM) / HANDOFF;
          dotA = 1 - smooth(0, 1, h);
          ringA = 1 - smooth(0, 0.45, h);
          layerA = 1 - smooth(0, 0.35, h);
          if (h >= 1) {
            finish();
            return;
          }
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // White ground + logo, cut by the closing iris
      if (layerA > 0.001) {
        ctx.globalAlpha = layerA;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = layerA * fadeIn;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, cx - DOT_X * scale, cy - DOT_Y * scale, IMG_W * scale, IMG_H * scale);
        ctx.globalAlpha = 1;

        if (hole + feather < Math.hypot(W, H) * 1.5) {
          const outer = hole + feather;
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, outer);
          g.addColorStop(0, '#000');
          g.addColorStop(hole / outer, '#000');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalCompositeOperation = 'destination-in';
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
          ctx.globalCompositeOperation = 'source-over';
        }
      }

      // Crisp vector dot + white ring drawn over the artwork's own dot
      const ringW = (RING_W / DOT_R) * Math.min(rx, ry);
      if (ringA > 0.001) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx + ringW / 2 - 0.5, ry + ringW / 2 - 0.5, rot, 0, Math.PI * 2);
        ctx.lineWidth = ringW + 1;
        const rc = RING_REST.map((c, i) => Math.round(lerp(c, RING_ZOOM[i], ringMix)));
        ctx.strokeStyle = `rgba(${rc[0]}, ${rc[1]}, ${rc[2]}, ${ringA})`;
        ctx.stroke();
      }
      if (dotA > 0.001) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DOT_RGB}, ${dotA})`;
        ctx.fill();
      }

      if (splash && t > 0) splash.style.display = 'none';
    };

    const start = () => {
      if (!alive) return;
      fit();
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    };

    img
      .decode()
      .then(start)
      .catch(() => (img.complete && img.naturalWidth ? start() : finish()));

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
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
