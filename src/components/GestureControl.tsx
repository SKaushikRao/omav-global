import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Hand, Maximize2, Minimize2, X } from 'lucide-react';
import type { HandLandmarker } from '@mediapipe/tasks-vision';
import { gestureBridge } from '../lib/gestureBridge';
import { BONES, handSpread, palmCentre, readPose, type Pose, type Pt } from '../lib/handGestures';

// Hand-gesture control of the home globe, through the webcam and MediaPipe's
// hand landmarker. Two palms spread or close to zoom; an open palm turns the
// Earth at the hero; 1-4 raised fingers and a thumbs up glide the story to
// scenes 1-5; a fist goes back to the top.

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const SCENE_LABEL = ['Data', 'Intelligence', 'Understanding', 'Strategy', 'Impact'];
// How long a pose must hold before it acts, and the quiet period after two
// hands (a second hand coming or going reads as stray poses)
const HOLD_MS = 450;
const FIST_HOLD_MS = 800;
const AFTER_TWO_MS = 700;

type Status = 'off' | 'starting' | 'on' | 'error';

export const GestureToggle: React.FC = () => {
  const [status, setStatus] = useState<Status>('off');
  const [error, setError] = useState('');
  const on = status !== 'off';

  // Leaving the home page (unmount) turns it off
  useEffect(() => () => gestureBridge.setActive(false), []);

  const toggle = () => {
    if (on) {
      setStatus('off');
      gestureBridge.setActive(false);
    } else {
      setError('');
      setStatus('starting');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? 'Turn off gesture control' : 'Control the globe with hand gestures'}
        title={on ? 'Turn off gesture control' : 'Gesture control'}
        className={`omav-gesture-btn shrink-0 max-md:hidden ${on ? 'is-on' : ''}`}
      >
        <Hand size={17} strokeWidth={1.8} aria-hidden="true" />
        {status === 'on' && <span className="omav-gesture-dot" aria-hidden="true" />}
      </button>
      {on &&
        createPortal(
          <GesturePanel
            onReady={() => {
              setStatus('on');
              gestureBridge.setActive(true);
            }}
            onError={(msg) => {
              setError(msg);
              setStatus('error');
              gestureBridge.setActive(false);
            }}
            status={status}
            error={error}
            onClose={toggle}
          />,
          document.body
        )}
    </>
  );
};

const GesturePanel: React.FC<{
  status: Status;
  error: string;
  onReady: () => void;
  onError: (msg: string) => void;
  onClose: () => void;
}> = ({ status, error, onReady, onError, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [label, setLabel] = useState('Show your hand');
  const [min, setMin] = useState(false);
  const cb = useRef({ onReady, onError });
  cb.current = { onReady, onError };

  useEffect(() => {
    let alive = true;
    let raf = 0;
    let stream: MediaStream | null = null;
    let landmarker: HandLandmarker | null = null;

    // Gesture reading state
    let lastVideoTime = -1;
    let pinch: { d0: number; z0: number } | null = null;
    let lastTwo = 0;
    let cand = '';
    let candSince = 0;
    let fired = '';
    let palmAt: Pt | null = null; // eased palm centre, for rotation
    let shown = '';
    const say = (s: string) => {
      if (s !== shown) {
        shown = s;
        setLabel(s);
      }
    };

    const draw = (hands: Pt[][], poses: Pose[]) => {
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (!c || !ctx) return;
      const W = c.width;
      const H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      hands.forEach((lm, h) => {
        ctx.strokeStyle = 'rgba(140, 200, 216, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (const [a, b] of BONES) {
          ctx.moveTo(lm[a].x * W, lm[a].y * H);
          ctx.lineTo(lm[b].x * W, lm[b].y * H);
        }
        ctx.stroke();
        ctx.fillStyle = '#E9EDF3';
        for (const p of lm) {
          ctx.beginPath();
          ctx.arc(p.x * W, p.y * H, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Raised fingertips glow while a pose is being read
        if (hands.length === 1 && poses[h].kind !== 'fist') {
          ctx.fillStyle = '#F0C88C';
          for (const t of [4, 8, 12, 16, 20]) {
            ctx.beginPath();
            ctx.arc(lm[t].x * W, lm[t].y * H, 3.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      // The spread being measured between two palms
      if (hands.length >= 2) {
        const a = palmCentre(hands[0]);
        const b = palmCentre(hands[1]);
        ctx.strokeStyle = 'rgba(240, 200, 140, 0.9)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(a.x * W, a.y * H);
        ctx.lineTo(b.x * W, b.y * H);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const read = (hands: Pt[][], now: number) => {
      const poses = hands.map(readPose);
      draw(hands, poses);

      if (hands.length >= 2) {
        lastTwo = now;
        cand = '';
        palmAt = null;
        const d = handSpread(hands[0], hands[1]);
        if (!pinch) pinch = { d0: Math.max(0.05, d), z0: gestureBridge.zoom };
        else gestureBridge.setZoom(pinch.z0 * Math.pow(d / pinch.d0, 1.3));
        say(`Zoom · ${gestureBridge.zoom.toFixed(2)}×`);
        return;
      }
      pinch = null;

      if (hands.length === 0) {
        cand = '';
        fired = '';
        palmAt = null;
        say('Show your hand');
        return;
      }
      if (now - lastTwo < AFTER_TWO_MS) return;

      const p = poses[0];
      if (p.kind === 'palm') {
        // Open palm: the Earth turns with the hand (the preview is mirrored, so
        // the hand moving right is x falling in the camera image)
        const c = palmCentre(hands[0]);
        if (palmAt) {
          const ex = palmAt.x + (c.x - palmAt.x) * 0.5;
          const ey = palmAt.y + (c.y - palmAt.y) * 0.5;
          const dx = palmAt.x - ex;
          const dy = ey - palmAt.y;
          gestureBridge.rotateBy(Math.abs(dx) > 0.0015 ? dx * 5 : 0, Math.abs(dy) > 0.0015 ? dy * 3 : 0);
          palmAt = { x: ex, y: ey };
        } else palmAt = c;
        cand = '';
        fired = '';
        say(gestureBridge.atHero ? 'Palm · turning the Earth' : 'Palm · turns the Earth at the top');
        return;
      }
      palmAt = null;

      const key = p.kind === 'count' ? `n${p.n}` : p.kind;
      const scene = p.kind === 'count' ? p.n - 1 : p.kind === 'thumbsUp' ? 4 : -1;
      const target =
        p.kind === 'fist'
          ? 'Fist · back to the top'
          : `${p.kind === 'thumbsUp' ? 'Thumbs up' : p.n} · ${SCENE_LABEL[scene]}`;
      if (key !== cand) {
        cand = key;
        candSince = now;
      }
      const held = now - candSince >= (p.kind === 'fist' ? FIST_HOLD_MS : HOLD_MS);
      if (held && key !== fired) {
        fired = key;
        gestureBridge.goTo(scene);
      }
      say(key === fired ? `→ ${target}` : target);
    };

    const loop = () => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      const v = videoRef.current;
      if (!v || !landmarker || v.readyState < 2 || v.currentTime === lastVideoTime) return;
      lastVideoTime = v.currentTime;
      const now = performance.now();
      const res = landmarker.detectForVideo(v, now);
      read((res.landmarks ?? []) as Pt[][], now);
    };

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser has no camera access.');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        if (!alive) return;
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();

        const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
        const files = await FilesetResolver.forVisionTasks('/mediapipe');
        const opts = (delegate: 'GPU' | 'CPU') => ({
          baseOptions: { modelAssetPath: MODEL_URL, delegate },
          runningMode: 'VIDEO' as const,
          numHands: 2,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        try {
          landmarker = await HandLandmarker.createFromOptions(files, opts('GPU'));
        } catch {
          landmarker = await HandLandmarker.createFromOptions(files, opts('CPU'));
        }
        if (!alive) {
          landmarker.close();
          return;
        }
        cb.current.onReady();
        loop();
      } catch (err) {
        if (!alive) return;
        const name = (err as { name?: string })?.name;
        cb.current.onError(
          name === 'NotAllowedError'
            ? 'Camera access was blocked. Allow it in the address bar to use gestures.'
            : name === 'NotFoundError'
              ? 'No camera was found.'
              : 'Gesture tracking could not start.'
        );
        console.warn('Gesture control', err);
      }
    })();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      try {
        landmarker?.close();
      } catch {}
    };
  }, []);

  return (
    <aside className={`omav-gesture-panel ${min ? 'is-min' : ''}`} aria-label="Gesture control" aria-live="polite">
      <div className="flex items-center justify-between gap-2 pl-3.5 pr-2 py-2.5">
        <span className="flex min-w-0 items-center gap-2 font-mono text-[11px] text-slate">
          <span
            className={`w-1.5 h-1.5 shrink-0 rounded-full ${status === 'on' ? 'bg-signal' : status === 'error' ? 'bg-ember' : 'bg-slate'}`}
          />
          <span className="truncate">
            {status === 'error'
              ? 'Unavailable'
              : status !== 'on'
                ? 'Starting camera…'
                : min
                  ? label
                  : 'Gesture control'}
          </span>
        </span>
        <span className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => setMin((m) => !m)}
            aria-expanded={!min}
            aria-label={min ? 'Expand gesture panel' : 'Minimize gesture panel'}
            className="omav-gesture-x"
          >
            {min ? <Maximize2 size={13} aria-hidden="true" /> : <Minimize2 size={13} aria-hidden="true" />}
          </button>
          <button type="button" onClick={onClose} aria-label="Turn off gesture control" className="omav-gesture-x">
            <X size={14} aria-hidden="true" />
          </button>
        </span>
      </div>

      <div className="omav-gesture-body">
        <div>
          <div className="relative mx-3.5 aspect-[4/3] overflow-hidden rounded-[8px] bg-black/60">
            <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-70" />
            <canvas ref={canvasRef} width={320} height={240} className="absolute inset-0 w-full h-full -scale-x-100" />
            {status === 'error' && (
              <p className="absolute inset-0 grid place-items-center p-4 text-center text-[12.5px] leading-[1.5] text-ice/80">{error}</p>
            )}
          </div>

          {status === 'on' ? (
            <>
              <div className="px-3.5 pt-3 font-display text-[14px] text-ice">{label}</div>
              <ul className="px-3.5 pt-2.5 pb-3.5 grid gap-1.5 font-mono text-[10.5px] text-slate">
                <li>
                  <span className="text-ice/80">Open palm</span> · turn the Earth (at the top)
                </li>
                <li>
                  <span className="text-ice/80">Two palms apart / together</span> · zoom
                </li>
                <li>
                  <span className="text-ice/80">1–4 fingers, thumbs up</span> · scenes 1–5
                </li>
                <li>
                  <span className="text-ice/80">Fist</span> · back to the top
                </li>
              </ul>
            </>
          ) : (
            <div className="h-3.5" />
          )}
        </div>
      </div>
    </aside>
  );
};
