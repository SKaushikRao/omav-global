import React, { useEffect, useRef, useState } from 'react';
import { introBridge, K, TL } from '../lib/introBridge';
import { EMBLEM_SVG } from './introEmblem';

// The OMAV emblem constructs itself on the dark stage, then its blue centre
// becomes the Earth (rendered by EarthCanvas on top of this layer) while one
// shared camera pushes in and the emblem resolves out behind it.
// Rendered inside the EarthCanvas stage, beneath the WebGL canvas.

const DOT_CY = 3.425;
const DOT_R = 18.87;

export const LogoIntro: React.FC = () => {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const skipRef = useRef<HTMLButtonElement | null>(null);
  const [gone, setGone] = useState(introBridge.mode !== 'play');

  useEffect(() => {
    if (gone) return;
    const layer = layerRef.current;
    const svg = svgRef.current;
    const skipBtn = skipRef.current;
    if (!layer || !svg) return;

    const A: Record<string, Element> = {};
    layer.querySelectorAll('[data-a]').forEach((el) => {
      A[el.getAttribute('data-a')!] = el;
    });

    let blurOK = false;
    try {
      blurOK = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    } catch {
      blurOK = false;
    }

    let fitW = 0;
    let fitH = 0;
    let fitS = 1;
    const fit = () => {
      const W = layer.clientWidth;
      const H = layer.clientHeight;
      if (!W || !H || (W === fitW && H === fitH)) return;
      fitW = W;
      fitH = H;
      const vw = window.innerWidth || W;
      const vh = window.innerHeight || H;
      const mw = Math.max(240, Math.min(390, Math.min(vw * 0.28, vh * 0.46)));
      fitS = mw / 300;
      svg.setAttribute(
        'viewBox',
        [-W / (2 * fitS), 36 - H / (2 * fitS), W / fitS, H / fitS].map((v) => v.toFixed(3)).join(' ')
      );
      introBridge.setDot({ x: W / 2, y: H / 2 + (DOT_CY - 36) * fitS, r: DOT_R * fitS });
    };

    const n = (v: number) => String(Math.round(v * 1000) / 1000);
    const tr = (el: Element | undefined, v: string) => el && el.setAttribute('transform', v);
    const op = (el: Element | undefined, v: number) =>
      el && el.setAttribute('opacity', v < 0.001 ? '0' : v > 0.999 ? '1' : v.toFixed(3));

    let skipVis = false;
    const apply = (t: number) => {
      const C = introBridge.cam;
      const { seg, outExpo: oe, outQuint: oq, outCubic: oc, inOutCubic: ioc, inOutSine: ios } = K;
      // The emblem resolves out only once the globe is recognisable, keyed to the camera
      const gA = 1 - K.smoother(TL.GA0, TL.GA1, C.lnz || 0);
      const opA = (el: Element | undefined, v: number) => op(el, v * gA);

      // Focus stays on the Earth as it comes forward, so the receding emblem
      // softens slightly (fine pointers only, to protect frame rate on touch)
      const bpx = blurOK ? K.smooth(TL.GA0 - 0.15, TL.GA1, C.lnz || 0) * 0.0065 * (fitW || 1440) : 0;
      if (bpx > 0.05) svg.style.filter = `blur(${bpx.toFixed(2)}px)`;
      else if (svg.style.filter) svg.style.filter = '';

      let i: number;
      let s: number;

      const hz = oe(seg(t, TL.HZ0, TL.HZ1));
      tr(A.hz, `scale(${n(Math.max(hz, 0.0001))} 1)`);
      op(A.hz, Math.min(1, hz * 2.5) * (1 - ios(seg(t, TL.HZF0, TL.HZF1))) * 0.9);

      const halo = 0.55 * ios(seg(t, 0.9, 3.2)) + 0.4 * Math.sin(Math.PI * seg(t, TL.T0 - 0.2, TL.T0 + 0.9));
      op(A.halo, halo * (1 - 0.45 * seg(t, TL.T0 + 0.35, TL.T0 + 1.0)) * gA);

      for (i = 0; i < 8; i++) {
        const b = TL.BANDS[i];
        s = TL.B[i];
        const sx = oe(seg(t, s, s + TL.BDUR));
        const h0 = Math.min(1, 0.7 / (b[1] - b[0]));
        const sy = h0 + (1 - h0) * ioc(seg(t, s + TL.THK0, s + TL.THK1));
        const c = (b[0] + b[1]) / 2;
        tr(A['b' + i], `translate(0 ${n(c)}) scale(${n(Math.max(sx, 0.0001))} ${n(sy)}) translate(0 ${n(-c)})`);
        op(A['b' + i], seg(t, s, s + 0.2));
      }
      op(A.bands, gA);

      const rg = ioc(seg(t, TL.RING0, TL.RING1));
      if (A.ring) (A.ring as SVGElement).style.strokeDashoffset = n(128.62 * (1 - rg));
      opA(A.ring, seg(t, TL.RING0, TL.RING0 + 0.15) * (1 - ios(seg(t, TL.RINGF0, TL.RINGF1))) * 0.95);

      const ds = 0.35 + 0.65 * oq(seg(t, TL.DOT0, TL.DOT1));
      tr(A.dot, `translate(0 ${DOT_CY}) scale(${n(ds)}) translate(0 ${-DOT_CY})`);
      opA(A.dot, seg(t, TL.DOT0, TL.DOT0 + 0.28));
      // The blue centre's own glow swells as the sphere awakens, then hands over to the atmosphere
      let dg = 0.85 * Math.sin(Math.PI * seg(t, TL.DOT0, TL.DOT0 + 0.9));
      const atm = K.smoother(TL.ATMO0, TL.ATMO1, t);
      dg = Math.max(dg, 0.2 * seg(t, TL.DOT0 + 0.45, TL.DOT0 + 0.9) * (1 - atm));
      dg = Math.max(dg, 0.55 * Math.sin(Math.PI * seg(t, TL.T0 - 0.1, TL.T0 + 1.0)) * (1 - 0.6 * atm));
      opA(A.dglow, dg);

      const wp = oq(seg(t, TL.W0, TL.W1));
      const ep = oq(seg(t, TL.W0 + TL.LAG, TL.W1 + TL.LAG));
      const wdx = 46 * (1 - wp);
      const wdy = 9 * (1 - wp);
      const wa = 8 * (1 - wp);
      const edx = 54 * (1 - ep);
      const edy = 13 * (1 - ep);
      const ea = 9.5 * (1 - ep);
      tr(A.wl, `translate(${n(-wdx)} ${n(wdy)}) rotate(${n(-wa)} 0 86)`);
      tr(A.wr, `translate(${n(wdx)} ${n(wdy)}) rotate(${n(wa)} 0 86)`);
      tr(A.el, `translate(${n(-edx)} ${n(edy)}) rotate(${n(-ea)} 0 86)`);
      tr(A.er, `translate(${n(edx)} ${n(edy)}) rotate(${n(ea)} 0 86)`);
      const wo = seg(t, TL.W0, TL.W0 + 0.35);
      const eo = seg(t, TL.W0 + TL.LAG, TL.W0 + TL.LAG + 0.35);
      if (t >= TL.W1 + TL.LAG + 0.02) {
        op(A.wl, 0);
        op(A.wr, 0);
        opA(A.wc, 1);
      } else {
        opA(A.wl, wo);
        opA(A.wr, wo);
        op(A.wc, 0);
      }
      opA(A.el, eo);
      opA(A.er, eo);

      const lp = oc(seg(t, TL.LENS0, TL.LENS1));
      const lo = seg(t, TL.LENS0, TL.LENS0 + 0.5);
      tr(A.ll, `translate(0 ${n(12 * (1 - lp))})`);
      tr(A.lr, `translate(0 ${n(12 * (1 - lp))})`);
      opA(A.ll, lo);
      opA(A.lr, lo);

      const np = oq(seg(t, TL.NIB0, TL.NIB1));
      tr(A.nib, `translate(0 ${n(-11 * (1 - np))})`);
      opA(A.nib, seg(t, TL.NIB0, TL.NIB0 + 0.25));

      const f1 = seg(t, TL.DROP0, TL.DROP0 + 0.3);
      const f2 = seg(t, TL.DROP0 + 0.3, TL.DROP0 + 0.52);
      const dsy = f2 > 0 ? 1 - 0.1 * Math.sin(Math.PI * f2) : 1 + 0.12 * f1;
      tr(A.drop, `translate(0 ${n(-6 * (1 - f1 * f1))}) translate(0 113.8) scale(1 ${n(dsy)}) translate(0 -113.8)`);
      opA(A.drop, seg(t, TL.DROP0, TL.DROP0 + 0.12));

      const off = [-7, -2.4, 2.4, 7];
      for (i = 0; i < 4; i++) {
        s = TL.LET0 + TL.LETS * i;
        const lq = oq(seg(t, s, s + TL.LETD));
        tr(A['l' + i], `translate(${n(off[i] * (1 - lq))} ${n(7 * (1 - lq))})`);
        opA(A['l' + i], seg(t, s, s + 0.45));
      }
      const mp = oc(seg(t, TL.MOT0, TL.MOT1));
      tr(A.motto, `translate(0 ${n(4 * (1 - mp))})`);
      opA(A.motto, seg(t, TL.MOT0, TL.MOT0 + 0.6));

      const shx = -260 + 520 * ios(seg(t, TL.SH0, TL.SH1));
      A.shL?.setAttribute('gradientTransform', `translate(${n(shx)} 0) rotate(20)`);
      A.shR?.setAttribute('gradientTransform', `translate(${n(-shx)} 0) rotate(-20)`);

      // Camera: the emblem shares the globe's pan exactly and is anchored on the
      // blue centre, but takes only part of the push-in (scale ^ BETA), so the
      // Earth comes forward and the emblem recedes without filling the frame.
      const d = introBridge.dot;
      if (d && (C.z > 1.0005 || Math.abs(C.x - d.x) > 0.01 || Math.abs(C.y - d.y) > 0.01)) {
        const ux = (C.x - d.x) / fitS;
        const uy = DOT_CY + (C.y - d.y) / fitS;
        const camT = `translate(${n(ux)} ${n(uy)}) scale(${n(C.ze)}) translate(0 ${-DOT_CY})`;
        tr(A.all, camT);
        tr(A.halo, camT);
      } else {
        tr(A.all, 'translate(0 0)');
        A.halo?.removeAttribute('transform');
      }

      if (skipBtn) {
        let so = seg(t, TL.SKIP0, TL.SKIP0 + 0.6) * (1 - seg(t, TL.SKIP1 - 0.4, TL.SKIP1));
        if (introBridge.speed !== 1) so = 0;
        skipBtn.style.opacity = so.toFixed(3);
        const vis = so > 0.02;
        if (vis !== skipVis) {
          skipVis = vis;
          skipBtn.style.visibility = vis ? 'visible' : 'hidden';
          skipBtn.style.pointerEvents = vis ? 'auto' : 'none';
        }
      }
    };

    // Scrolling or paging during the intro fast-forwards it
    const onInput = (e: Event) => {
      if (e.type === 'keydown') {
        const k = (e as KeyboardEvent).key;
        if (!['Escape', ' ', 'Spacebar', 'ArrowDown', 'PageDown', 'End'].includes(k)) return;
      }
      introBridge.skip();
    };
    window.addEventListener('wheel', onInput, { passive: true });
    window.addEventListener('touchmove', onInput, { passive: true });
    window.addEventListener('keydown', onInput);
    window.addEventListener('resize', fit);

    fit();
    apply(0);

    let alive = true;
    let raf = 0;
    let lastFrame = performance.now();
    const loop = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      lastFrame = now;
      introBridge.frame(now);
      if (introBridge.mode !== 'play') {
        alive = false;
        setGone(true);
        return;
      }
      const t = introBridge.t;
      if (t < TL.CAM1) fit();
      apply(t);
    };
    raf = requestAnimationFrame(loop);

    // If frames stop arriving (e.g. a background tab), don't strand the page
    const watchdog = window.setInterval(() => {
      if (introBridge.mode === 'play' && performance.now() - lastFrame > 4000) introBridge.end();
    }, 4000);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearInterval(watchdog);
      window.removeEventListener('wheel', onInput);
      window.removeEventListener('touchmove', onInput);
      window.removeEventListener('keydown', onInput);
      window.removeEventListener('resize', fit);
      introBridge.end();
    };
  }, [gone]);

  if (gone) return null;

  return (
    <>
      <div
        ref={layerRef}
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <svg
          ref={svgRef}
          viewBox="-640 -364 1280 800"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full block"
          dangerouslySetInnerHTML={{ __html: EMBLEM_SVG }}
        />
      </div>
      <button
        ref={skipRef}
        type="button"
        onClick={() => introBridge.skip()}
        className="omav-skip absolute right-[clamp(20px,4vw,56px)] bottom-[26px] z-[3] inline-flex items-center gap-2.5 min-h-11 px-[18px] rounded-full border border-[#DCE4EE]/20 bg-[#05070B]/40 text-[#AEB7C3] text-[11px] font-medium tracking-[0.24em] uppercase cursor-pointer transition-colors duration-[250ms] hover:text-white hover:border-[#DCE4EE]/55 focus-visible:outline-2 focus-visible:outline-[#8CC8D8] focus-visible:outline-offset-[3px]"
        style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }}
      >
        Skip intro
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M2 6h7M6.5 3l3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
};
