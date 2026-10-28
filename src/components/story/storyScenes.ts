import * as THREE from 'three';
import { buildLut, decode, encodeDensity, loadManifest, loadTile } from '../population/populationData';

// The five "How we think" scenes, drawn on and around the hero Earth as the
// page scrolls. Everything that sits on the surface lives in the globe's spin
// frame (it turns with the Earth); the brain and the scan lens live in the
// root frame (screen-aligned, centred on the globe). Each scene is driven by
// its own weight (presence) and progress (scroll position within the scene).

export const SCENES = ['data', 'intelligence', 'understanding', 'strategy', 'impact'] as const;

export interface StoryFrame {
  time: number;
  weight: number[]; // per scene, 0..1
  progress: number[]; // per scene, 0..1 (0.5 = its text is centred)
  presence: number; // 0 at the hero, 1 once the story has begun
  pixel: number; // device pixels per CSS pixel × view scale
}

const ACCENT = new THREE.Color('#8CC8D8');
const EMBER = new THREE.Color('#F0C88C');
const ICE = new THREE.Color('#E9EDF3');

// Major hubs (lat, lon)
const HUBS: [string, number, number][] = [
  ['Tokyo', 35.68, 139.69], ['Delhi', 28.61, 77.21], ['Shanghai', 31.23, 121.47], ['Dhaka', 23.81, 90.41],
  ['São Paulo', -23.55, -46.63], ['Mexico City', 19.43, -99.13], ['Cairo', 30.04, 31.24], ['Mumbai', 19.08, 72.88],
  ['Beijing', 39.9, 116.41], ['Lagos', 6.52, 3.38], ['Istanbul', 41.01, 28.98], ['Kolkata', 22.57, 88.36],
  ['Jakarta', -6.21, 106.85], ['Paris', 48.86, 2.35], ['London', 51.51, -0.13], ['Singapore', 1.35, 103.82],
  ['Dubai', 25.2, 55.27], ['Nairobi', -1.29, 36.82], ['New York', 40.71, -74.01], ['Washington', 38.9, -77.04],
  ['Moscow', 55.76, 37.62], ['Johannesburg', -26.2, 28.05], ['Seoul', 37.57, 126.98], ['Sydney', -33.87, 151.21],
  ['Riyadh', 24.71, 46.68], ['Bengaluru', 12.97, 77.59], ['Berlin', 52.52, 13.4], ['Karachi', 24.86, 67.01],
];
const hub = (name: string) => HUBS.findIndex((h) => h[0] === name);

// Data: who talks to whom
const DATA_LINKS: [string, string][] = [
  ['London', 'New York'], ['London', 'Mumbai'], ['London', 'Dubai'], ['Paris', 'Lagos'], ['Paris', 'Cairo'],
  ['Berlin', 'Moscow'], ['Istanbul', 'Delhi'], ['Dubai', 'Mumbai'], ['Dubai', 'Nairobi'], ['Dubai', 'Singapore'],
  ['Delhi', 'Dhaka'], ['Mumbai', 'Singapore'], ['Mumbai', 'Nairobi'], ['Bengaluru', 'Singapore'], ['Kolkata', 'Shanghai'],
  ['Singapore', 'Jakarta'], ['Singapore', 'Tokyo'], ['Shanghai', 'Tokyo'], ['Beijing', 'Seoul'], ['Beijing', 'Moscow'],
  ['Cairo', 'Riyadh'], ['Riyadh', 'Karachi'], ['Lagos', 'Johannesburg'], ['Nairobi', 'Johannesburg'], ['New York', 'São Paulo'],
  ['Washington', 'London'], ['Mexico City', 'New York'], ['Jakarta', 'Sydney'], ['Karachi', 'Delhi'], ['Moscow', 'Delhi'],
];

// Strategy: candidate routes, of which a few are kept, converging on the target
const TARGET = 'Delhi';
const KEPT: [string, string][] = [
  ['London', 'Dubai'], ['Dubai', 'Delhi'], ['Nairobi', 'Dubai'], ['Singapore', 'Delhi'], ['Tokyo', 'Singapore'],
  ['Moscow', 'Delhi'], ['Washington', 'London'],
];

const GLSL_SLERP = `
vec3 slerp3(vec3 a, vec3 b, float t){
  float o = acos(clamp(dot(a, b), -1.0, 1.0));
  float s = sin(o);
  if (s < 1e-4) return a;
  return (sin((1.0 - t) * o) * a + sin(t * o) * b) / s;
}`;

const SOFT_POINT_FS = `
varying vec3 vCol; varying float vA; varying float vShape;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = vShape < 0.5 ? length(c) : (vShape < 1.5 ? max(abs(c.x), abs(c.y)) : abs(c.x) + abs(c.y));
  if (d > 0.5) discard;
  float s = vShape < 0.5 ? smoothstep(0.5, 0.0, d) : smoothstep(0.5, 0.36, d);
  gl_FragColor = vec4(vCol, vA * s);
}`;

function hash(x: number, y: number, k: number) {
  const h = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453;
  return h - Math.floor(h);
}

type LL = (lat: number, lon: number, r: number) => THREE.Vector3;

function arcPoints(a: THREE.Vector3, b: THREE.Vector3, lift: number, n: number) {
  const out: THREE.Vector3[] = [];
  const ang = a.angleTo(b);
  const s = Math.sin(ang) || 1e-4;
  for (let j = 0; j <= n; j++) {
    const t = j / n;
    const w1 = Math.sin((1 - t) * ang) / s;
    const w2 = Math.sin(t * ang) / s;
    const r = 1.004 + lift * Math.sin(Math.PI * t);
    out.push(new THREE.Vector3().addScaledVector(a, w1).addScaledVector(b, w2).normalize().multiplyScalar(r));
  }
  return out;
}

// Line material with draw-in, a flowing dash (direction) and per-segment alpha
function flowLineMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uAlpha: { value: 0 },
      uDraw: { value: 0 },
      uTime: { value: 0 },
      uFlow: { value: 0 },
      uPrune: { value: 0 },
    },
    vertexShader: `
      attribute float aT; attribute float aKeep; attribute vec3 aCol; attribute float aOff;
      varying float vT; varying float vKeep; varying vec3 vCol; varying float vOff;
      void main(){ vT = aT; vKeep = aKeep; vCol = aCol; vOff = aOff;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uAlpha; uniform float uDraw; uniform float uTime; uniform float uFlow; uniform float uPrune;
      varying float vT; varying float vKeep; varying vec3 vCol; varying float vOff;
      void main(){
        float draw = clamp(uDraw * 1.6 - vOff * 0.6, 0.0, 1.0);
        if (vT > draw) discard;
        float keep = mix(1.0 - uPrune, 1.0, vKeep);
        float base = mix(0.34, mix(0.34, 0.85, uPrune), vKeep);
        float dash = step(0.45, fract(vT * 26.0 - uTime * 1.4));
        float a = clamp(base + vKeep * uFlow * dash * 0.5, 0.0, 1.0) * keep * uAlpha;
        gl_FragColor = vec4(mix(vCol, vec3(1.0), vKeep * uFlow * dash * 0.35), a);
      }`,
    transparent: true,
    depthWrite: false,
  });
}

// Strength of the brain formation in scene 2 (also dims the Earth behind it)
export function brainAmount(weight: number[], progress: number[]) {
  if (weight[1] <= 0.001) return 0;
  const p = progress[1];
  const sm = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  return sm(0.08, 0.42, p) * (1 - sm(0.62, 0.95, p));
}

export function createStory(spin: THREE.Group, root: THREE.Group, ll: LL) {
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);
  const spinToRoot = new THREE.Matrix4();
  const tmpM = new THREE.Matrix4();
  const hubPos = HUBS.map(([, lat, lon]) => ll(lat, lon, 1).normalize());

  // ------------------------------------------------------------ population dots
  // The same dot matrix as the Cesium globe (GPW v4 2020, ≈60 km, ≥ 50 /km²),
  // so the hand-over keeps the data. Scenes 3 and 5 act on it.
  const dotMat = track(
    new THREE.ShaderMaterial({
      uniforms: {
        uAlpha: { value: 0 },
        uPix: { value: 1 },
        uTime: { value: 0 },
        uNoise: { value: 0 },
        uScanX: { value: -2 },
        uImpactDir: { value: ll(28.61, 77.21, 1).normalize() },
        uImpactAng: { value: 0 },
        uImpactK: { value: 0 },
        uDim: { value: 0 },
        uSpinToRoot: { value: spinToRoot },
      },
      vertexShader: `
        attribute float aT; attribute vec3 aCol; attribute float aR;
        uniform float uPix; uniform float uAlpha; uniform float uTime; uniform float uNoise; uniform float uScanX;
        uniform vec3 uImpactDir; uniform float uImpactAng; uniform float uImpactK; uniform float uDim;
        uniform mat4 uSpinToRoot;
        varying vec3 vCol; varying float vA; varying float vShape;
        void main(){
          vec3 p = position;
          vec3 n = normalize(p);
          vec3 rp = (uSpinToRoot * vec4(p, 1.0)).xyz;
          // Understanding: the unscanned side is noise, the lens resolves it
          float raw = uNoise * smoothstep(uScanX - 0.03, uScanX + 0.05, rp.x);
          float lens = uNoise * exp(-pow((rp.x - uScanX) * 16.0, 2.0));
          float fl = fract(sin(aR * 91.7 + floor(uTime * 9.0) * 13.1) * 4375.5);
          p += n * raw * (0.015 + 0.07 * aR);
          p += vec3(sin(aR * 40.0 + uTime * 2.7), cos(aR * 33.0 + uTime * 2.3), sin(aR * 27.0 - uTime * 3.1)) * raw * 0.05;
          // Impact: a wave from the target; reached settlement lights up
          float ang = acos(clamp(dot(n, uImpactDir), -1.0, 1.0));
          float reached = uImpactK * (1.0 - smoothstep(uImpactAng - 0.04, uImpactAng + 0.02, ang));
          float front = uImpactK * exp(-pow((ang - uImpactAng) * 12.0, 2.0));
          vec3 col = mix(aCol, vec3(0.55, 0.6, 0.68), raw * 0.85);
          col = mix(col, vec3(1.0, 0.85, 0.6), reached * 0.6);
          col += (front * 0.7 + lens * 0.9) * vec3(0.6, 0.55, 0.42);
          vCol = col;
          float a = uAlpha * (0.25 + 0.75 * aT) * (1.0 - uDim * 0.75);
          a *= mix(1.0, 0.25 + 0.75 * fl, raw);
          a += (front * 0.7 + lens * 0.5 + reached * 0.25) * uAlpha * (0.4 + 0.6 * aT);
          vA = a;
          vShape = 0.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = uPix * (1.1 + 2.6 * pow(aT, 2.4) + front * 2.4 + reached * 0.8 + lens * 1.5);
        }`,
      fragmentShader: SOFT_POINT_FS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  let dots: THREE.Points | null = null;
  // Densest settlements, which become the brain in scene 2
  let brainSources: THREE.Vector3[] = [];

  // ------------------------------------------------------------------ 1. Data
  const data = new THREE.Group();
  spin.add(data);
  const dataLineMat = track(flowLineMaterial());
  {
    const pos: number[] = [];
    const aT: number[] = [];
    const keep: number[] = [];
    const col: number[] = [];
    const off: number[] = [];
    DATA_LINKS.forEach(([a, b], i) => {
      const A = hubPos[hub(a)];
      const B = hubPos[hub(b)];
      const pts = arcPoints(A, B, 0.04 + A.angleTo(B) * 0.13, 64);
      const c = i % 3 === 1 ? EMBER : ACCENT;
      for (let j = 0; j < pts.length - 1; j++) {
        for (const k of [j, j + 1]) {
          pos.push(pts[k].x, pts[k].y, pts[k].z);
          aT.push(k / 64);
          keep.push(1);
          col.push(c.r, c.g, c.b);
          off.push((i % 7) / 7);
        }
      }
    });
    const g = track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1));
    g.setAttribute('aKeep', new THREE.Float32BufferAttribute(keep, 1));
    g.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('aOff', new THREE.Float32BufferAttribute(off, 1));
    const lines = new THREE.LineSegments(g, dataLineMat);
    lines.renderOrder = 4;
    data.add(lines);
  }
  // Packets: three kinds of data (signals, records, media), as round, square and
  // diamond marks moving along the links
  const packetMat = track(
    new THREE.ShaderMaterial({
      uniforms: { uAlpha: { value: 0 }, uTime: { value: 0 }, uPix: { value: 1 } },
      vertexShader: `
        ${GLSL_SLERP}
        attribute vec3 aA; attribute vec3 aB; attribute float aH; attribute float aPh; attribute float aSp; attribute float aType;
        uniform float uAlpha; uniform float uTime; uniform float uPix;
        varying vec3 vCol; varying float vA; varying float vShape;
        void main(){
          float t = fract(aPh + uTime * aSp);
          vec3 p = normalize(slerp3(aA, aB, t)) * (1.004 + aH * sin(3.14159 * t));
          vCol = aType < 0.5 ? vec3(0.62, 0.86, 0.93) : (aType < 1.5 ? vec3(0.98, 0.82, 0.58) : vec3(0.95, 0.97, 1.0));
          vA = uAlpha * smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.92, 1.0, t));
          vShape = aType;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = uPix * (aType < 0.5 ? 7.0 : 6.0);
        }`,
      fragmentShader: SOFT_POINT_FS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  {
    const A: number[] = [];
    const B: number[] = [];
    const H: number[] = [];
    const ph: number[] = [];
    const sp: number[] = [];
    const ty: number[] = [];
    const pos: number[] = [];
    DATA_LINKS.forEach(([a, b], i) => {
      const pa = hubPos[hub(a)];
      const pb = hubPos[hub(b)];
      for (let k = 0; k < 4; k++) {
        const fwd = (i + k) % 2 === 0;
        const s = fwd ? pa : pb;
        const e = fwd ? pb : pa;
        A.push(s.x, s.y, s.z);
        B.push(e.x, e.y, e.z);
        H.push(0.04 + pa.angleTo(pb) * 0.13);
        ph.push(hash(i, k, 1));
        sp.push(0.16 + hash(i, k, 2) * 0.16);
        ty.push((i + k * 2) % 3);
        pos.push(0, 0, 0);
      }
    });
    const g = track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aA', new THREE.Float32BufferAttribute(A, 3));
    g.setAttribute('aB', new THREE.Float32BufferAttribute(B, 3));
    g.setAttribute('aH', new THREE.Float32BufferAttribute(H, 1));
    g.setAttribute('aPh', new THREE.Float32BufferAttribute(ph, 1));
    g.setAttribute('aSp', new THREE.Float32BufferAttribute(sp, 1));
    g.setAttribute('aType', new THREE.Float32BufferAttribute(ty, 1));
    const pts = new THREE.Points(g, packetMat);
    pts.frustumCulled = false;
    pts.renderOrder = 5;
    data.add(pts);
  }
  // Hub nodes, shared by scenes 1 and 4
  const nodeMat = track(
    new THREE.ShaderMaterial({
      uniforms: { uAlpha: { value: 0 }, uTime: { value: 0 }, uPix: { value: 1 } },
      vertexShader: `
        attribute float aR; uniform float uAlpha; uniform float uTime; uniform float uPix;
        varying vec3 vCol; varying float vA; varying float vShape;
        void main(){
          float pulse = 0.5 + 0.5 * sin(uTime * 2.2 + aR * 6.28);
          vCol = vec3(0.92, 0.95, 1.0); vA = uAlpha * (0.6 + 0.4 * pulse); vShape = 0.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uPix * (5.0 + 2.5 * pulse);
        }`,
      fragmentShader: SOFT_POINT_FS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  {
    const g = track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(hubPos.flatMap((p) => [p.x * 1.005, p.y * 1.005, p.z * 1.005]), 3));
    g.setAttribute('aR', new THREE.Float32BufferAttribute(hubPos.map((_, i) => hash(i, 3, 3)), 1));
    const nodes = new THREE.Points(g, nodeMat);
    nodes.renderOrder = 5;
    spin.add(nodes);
  }

  // ---------------------------------------------------------- 2. Intelligence
  // City lights lift off the surface and assemble into a neural form in front of
  // the globe, synapses firing; then they settle back onto the Earth.
  const BRAIN_N = 2200;
  const brainMat = track(
    new THREE.ShaderMaterial({
      uniforms: {
        uK: { value: 0 },
        uAlpha: { value: 0 },
        uTime: { value: 0 },
        uPix: { value: 1 },
        uSpinToRoot: { value: spinToRoot },
        uRot: { value: new THREE.Matrix3() },
        uCenter: { value: new THREE.Vector3(0, 0.04, 0.95) },
        uScale: { value: 0.7 },
      },
      vertexShader: `
        attribute vec3 aSrc; attribute float aDelay; attribute float aR;
        uniform float uK; uniform float uAlpha; uniform float uTime; uniform float uPix;
        uniform mat4 uSpinToRoot; uniform mat3 uRot; uniform vec3 uCenter; uniform float uScale;
        varying vec3 vCol; varying float vA; varying float vShape;
        void main(){
          vec3 s = (uSpinToRoot * vec4(aSrc, 1.0)).xyz;
          vec3 tgt = uCenter + uRot * position * uScale;
          float k = clamp((uK * 1.4 - aDelay * 0.4), 0.0, 1.0);
          k = k * k * (3.0 - 2.0 * k);
          vec3 m = s * 1.55 + vec3(0.0, 0.25, 0.3);
          vec3 p = (1.0 - k) * (1.0 - k) * s + 2.0 * (1.0 - k) * k * m + k * k * tgt;
          float tw = 0.75 + 0.25 * sin(uTime * 3.0 + aR * 20.0);
          vCol = mix(vec3(1.0, 0.84, 0.58), mix(vec3(0.62, 0.85, 0.92), vec3(0.95, 0.97, 1.0), aR), k);
          vA = uAlpha * smoothstep(0.0, 0.08, uK) * tw * (0.55 + 0.45 * k);
          vShape = 0.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = uPix * (2.0 + 1.8 * aR) * (0.8 + 0.4 * k);
        }`,
      fragmentShader: SOFT_POINT_FS,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const synapseMat = track(
    new THREE.ShaderMaterial({
      uniforms: {
        uAlpha: { value: 0 },
        uTime: { value: 0 },
        uRot: brainMat.uniforms.uRot,
        uCenter: brainMat.uniforms.uCenter,
        uScale: brainMat.uniforms.uScale,
      },
      vertexShader: `
        attribute float aT; attribute float aOff;
        uniform mat3 uRot; uniform vec3 uCenter; uniform float uScale;
        varying float vT; varying float vOff;
        void main(){ vT = aT; vOff = aOff;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(uCenter + uRot * position * uScale, 1.0); }`,
      fragmentShader: `
        uniform float uAlpha; uniform float uTime; varying float vT; varying float vOff;
        void main(){
          float head = fract(uTime * 0.55 + vOff);
          float spark = exp(-pow((vT - head) * 9.0, 2.0)) * step(0.72, fract(vOff * 7.13));
          gl_FragColor = vec4(mix(vec3(0.55, 0.78, 0.85), vec3(1.0), spark), uAlpha * (0.24 + spark * 0.9));
        }`,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const brainPts = new THREE.Points(track(new THREE.BufferGeometry()), brainMat);
  brainPts.frustumCulled = false;
  brainPts.renderOrder = 6;
  const synapses = new THREE.LineSegments(track(new THREE.BufferGeometry()), synapseMat);
  synapses.frustumCulled = false;
  synapses.renderOrder = 6;
  root.add(synapses, brainPts);

  // A brain in side profile, shallow in depth so its silhouette reads at a glance:
  // the cerebrum with banded gyri, the cerebellum behind and below, and the stem.
  // x runs front (-) to back (+), y up.
  function brainShape(n: number) {
    const inEll = (x: number, y: number, cx: number, cy: number, a: number, b: number) =>
      ((x - cx) / a) ** 2 + ((y - cy) / b) ** 2;
    const out: THREE.Vector3[] = [];
    let i = 0;
    while (out.length < n && i < n * 40) {
      i++;
      const x = hash(i, 1, 9) * 2.2 - 1.1;
      const y = hash(i, 2, 9) * 1.8 - 0.95;
      // Cerebrum: a wide dome with a lower temporal lobe at the front-middle
      const cer = inEll(x, y, 0, 0.12, 1.0, 0.68);
      const temporal = inEll(x, y, -0.15, -0.3, 0.55, 0.26);
      const cerebellum = inEll(x, y, 0.62, -0.42, 0.34, 0.2);
      const stem = x > 0.18 && x < 0.36 && y < -0.38 && y > -0.86 - (x - 0.18) * 0.4;
      let d = Infinity;
      let part = 0;
      if (cer < 1 && y > -0.28) {
        d = cer;
        part = 1;
      } else if (temporal < 1) {
        d = temporal;
        part = 1;
      } else if (cerebellum < 1) {
        d = cerebellum;
        part = 2;
      } else if (stem) {
        d = 0.5;
        part = 3;
      }
      if (part === 0) continue;
      // Gyri: points gather on curved bands; the rim is emphasised
      const ang = Math.atan2(y - 0.12, x);
      const band = part === 2 ? 0.5 + 0.5 * Math.sin(y * 48) : 0.5 + 0.5 * Math.sin(Math.sqrt(d) * 26 + ang * 3.5 + Math.sin(x * 7) * 1.4);
      const rim = Math.pow(Math.min(1, d), 6);
      if (hash(i, 3, 9) > 0.18 + 0.62 * band + 0.6 * rim) continue;
      const thick = (part === 3 ? 0.08 : 0.26) * Math.sqrt(Math.max(0, 1 - Math.min(1, d)));
      const z = (hash(i, 4, 9) * 2 - 1) * thick;
      out.push(new THREE.Vector3(x, y + 0.1, z));
    }
    return out;
  }

  function buildBrain(sources: THREE.Vector3[]) {
    const shape = brainShape(BRAIN_N);
    const pos: number[] = [];
    const src: number[] = [];
    const delay: number[] = [];
    const rr: number[] = [];
    // Order targets left to right so nearby cities fill nearby regions
    shape.sort((a, b) => a.x - b.x);
    const srcSorted = [...sources].sort((a, b) => a.x - b.x);
    shape.forEach((p, i) => {
      const s = srcSorted[i % srcSorted.length];
      pos.push(p.x, p.y, p.z);
      src.push(s.x * 1.004, s.y * 1.004, s.z * 1.004);
      delay.push(hash(i, 7, 9));
      rr.push(hash(i, 8, 9));
    });
    const g = brainPts.geometry;
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aSrc', new THREE.Float32BufferAttribute(src, 3));
    g.setAttribute('aDelay', new THREE.Float32BufferAttribute(delay, 1));
    g.setAttribute('aR', new THREE.Float32BufferAttribute(rr, 1));
    // Synapses: each neuron to its two nearest neighbours
    const lp: number[] = [];
    const lt: number[] = [];
    const lo: number[] = [];
    for (let i = 0; i < shape.length; i++) {
      let b1 = -1;
      let b2 = -1;
      let d1 = Infinity;
      let d2 = Infinity;
      for (let j = 0; j < shape.length; j++) {
        if (j === i) continue;
        const d = shape[i].distanceToSquared(shape[j]);
        if (d < d1) {
          d2 = d1;
          b2 = b1;
          d1 = d;
          b1 = j;
        } else if (d < d2) {
          d2 = d;
          b2 = j;
        }
      }
      for (const j of [b1, b2]) {
        if (j < i) continue;
        lp.push(shape[i].x, shape[i].y, shape[i].z, shape[j].x, shape[j].y, shape[j].z);
        lt.push(0, 1);
        const o = hash(i, j, 4);
        lo.push(o, o);
      }
    }
    const lg = synapses.geometry;
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    lg.setAttribute('aT', new THREE.Float32BufferAttribute(lt, 1));
    lg.setAttribute('aOff', new THREE.Float32BufferAttribute(lo, 1));
  }
  // Until the population data arrives, the hubs seed the brain
  buildBrain(hubPos);

  // --------------------------------------------------------- 3. Understanding
  // A lens sweeps across the globe; behind it the data resolves from noise
  const lensMat = track(
    new THREE.ShaderMaterial({
      uniforms: { uAlpha: { value: 0 } },
      vertexShader: `attribute float aA; varying float vA; void main(){ vA = aA;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uAlpha; varying float vA;
        void main(){ float f = 0.35 + 0.65 * smoothstep(-0.2, 1.0, sin(vA * 6.28318)) ;
          gl_FragColor = vec4(0.72, 0.9, 0.96, uAlpha * f); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const lens = new THREE.Group();
  root.add(lens);
  // The scanning sheet itself: a soft vertical band of light at the lens
  const sheetMat = track(
    new THREE.ShaderMaterial({
      uniforms: { uAlpha: { value: 0 }, uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uAlpha; uniform float uTime; varying vec2 vUv;
        void main(){
          float x = (vUv.x - 0.5) * 2.0;
          float core = exp(-x * x * 160.0);
          float glow = exp(-x * x * 9.0) * 0.22;
          float y = abs(vUv.y - 0.5) * 2.0;
          float v = 1.0 - smoothstep(0.82, 1.0, y);
          float lines = 0.85 + 0.15 * step(0.5, fract(vUv.y * 60.0 - uTime * 0.6));
          gl_FragColor = vec4(mix(vec3(0.55, 0.82, 0.92), vec3(1.0), core), (core + glow) * v * lines * uAlpha);
        }`,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const sheet = new THREE.Mesh(track(new THREE.PlaneGeometry(0.42, 2.5)), sheetMat);
  sheet.renderOrder = 5;
  root.add(sheet);
  {
    // A ring in the plane x = 0 (scaled to the sphere's section each frame), plus
    // short ticks along it, like a reticle
    const N = 160;
    const ring: number[] = [];
    const ringA: number[] = [];
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2;
      const a1 = ((i + 1) / N) * Math.PI * 2;
      ring.push(0, Math.cos(a0), Math.sin(a0), 0, Math.cos(a1), Math.sin(a1));
      ringA.push(i / N, (i + 1) / N);
      if (i % 8 === 0) {
        ring.push(0, Math.cos(a0) * 1.0, Math.sin(a0) * 1.0, 0, Math.cos(a0) * 1.06, Math.sin(a0) * 1.06);
        ringA.push(0.25, 0.25);
      }
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(ring, 3));
    g.setAttribute('aA', new THREE.Float32BufferAttribute(ringA, 1));
    const lensRing = new THREE.LineSegments(g, lensMat);
    lensRing.renderOrder = 5;
    lens.add(lensRing);
  }

  // -------------------------------------------------------------- 4. Strategy
  const strategy = new THREE.Group();
  spin.add(strategy);
  const routeMat = track(flowLineMaterial());
  {
    const keptSet = new Set(KEPT.map(([a, b]) => `${a}|${b}`));
    const names = HUBS.map((h) => h[0]);
    const pairs: [string, string, number][] = [];
    // Candidates: every nearby pair among the hubs, plus the kept routes
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const ang = hubPos[i].angleTo(hubPos[j]);
        const isKept = keptSet.has(`${names[i]}|${names[j]}`) || keptSet.has(`${names[j]}|${names[i]}`);
        if (isKept) continue;
        if (ang < 0.62 && hash(i, j, 5) < 0.55) pairs.push([names[i], names[j], 0]);
      }
    }
    KEPT.forEach(([a, b]) => pairs.push([a, b, 1]));
    const pos: number[] = [];
    const aT: number[] = [];
    const keep: number[] = [];
    const col: number[] = [];
    const off: number[] = [];
    pairs.forEach(([a, b, k], i) => {
      const A = hubPos[hub(a)];
      const B = hubPos[hub(b)];
      const pts = arcPoints(A, B, 0.03 + A.angleTo(B) * (k ? 0.16 : 0.08), 48);
      const c = k ? EMBER : ICE;
      for (let j = 0; j < pts.length - 1; j++) {
        for (const q of [j, j + 1]) {
          pos.push(pts[q].x, pts[q].y, pts[q].z);
          aT.push(q / 48);
          keep.push(k);
          col.push(c.r, c.g, c.b);
          off.push(k ? 0.2 : hash(i, 1, 6));
        }
      }
    });
    const g = track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1));
    g.setAttribute('aKeep', new THREE.Float32BufferAttribute(keep, 1));
    g.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('aOff', new THREE.Float32BufferAttribute(off, 1));
    const routes = new THREE.LineSegments(g, routeMat);
    routes.renderOrder = 4;
    strategy.add(routes);
  }
  // Target reticle on the surface
  const targetDir = hubPos[hub(TARGET)];
  const reticle = new THREE.Group();
  reticle.renderOrder = 5;
  reticle.position.copy(targetDir).multiplyScalar(1.006);
  reticle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), targetDir);
  spin.add(reticle);
  const reticleMats: THREE.MeshBasicMaterial[] = [];
  [0.05, 0.085, 0.12].forEach((r, i) => {
    const m = track(
      new THREE.MeshBasicMaterial({
        color: i === 0 ? EMBER : ACCENT,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    );
    reticleMats.push(m);
    const ringGeo = track(
      i === 1 ? new THREE.RingGeometry(r * 0.94, r, 64, 1, 0, Math.PI * 1.6) : new THREE.RingGeometry(r * 0.9, r, 64)
    );
    const ring = new THREE.Mesh(ringGeo, m);
    ring.renderOrder = 5;
    reticle.add(ring);
  });

  // ---------------------------------------------------------------- 5. Impact
  // Wavefronts travel out from the target across the globe
  const waveMat = track(
    new THREE.LineBasicMaterial({ color: EMBER, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  const waves: THREE.LineLoop[] = [];
  {
    const N = 180;
    const pts: number[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      pts.push(Math.cos(a), Math.sin(a), 0);
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    for (let k = 0; k < 3; k++) {
      const w = new THREE.LineLoop(g, k === 0 ? waveMat : track(waveMat.clone()));
      w.renderOrder = 4;
      w.quaternion.copy(reticle.quaternion);
      spin.add(w);
      waves.push(w);
    }
  }

  // --------------------------------------------------------- population data
  let cancelled = false;
  loadManifest()
    .then(async (m) => {
      const [a, b] = await Promise.all([loadTile(m, 0, 0, 0), loadTile(m, 0, 1, 0)]);
      if (cancelled) return;
      const S = m.tileSize;
      const W = 2 * S;
      const at = (x: number, y: number) => {
        const t = x < S ? a : b;
        return t ? t[y * S + (x % S)] : 0;
      };
      const lut = buildLut(m, 50);
      const step = 360 / W;
      const pos: number[] = [];
      const aT: number[] = [];
      const col: number[] = [];
      const rr: number[] = [];
      const dense: { v: number; p: THREE.Vector3 }[] = [];
      for (let y = 0; y + 1 < S; y += 2) {
        for (let x = 0; x < W; x += 2) {
          let sum = 0;
          let n = 0;
          for (let k = 0; k < 4; k++) {
            const v = at(x + (k & 1), y + (k >> 1));
            if (v) {
              sum += decode(m, v);
              n++;
            }
          }
          if (!n) continue;
          const d = sum / 4;
          const e = encodeDensity(m, d);
          if (!lut[e * 4 + 3]) continue;
          // Same jitter as the Cesium globe's dot matrix, so the hand-over keeps every dot
          const h1 = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
          const h2 = Math.sin(x * 269.5 + y * 183.3) * 43758.5453;
          const lon = -180 + (x + 1 + (h1 - Math.floor(h1) - 0.5) * 1.6) * step;
          const lat = 90 - (y + 1 + (h2 - Math.floor(h2) - 0.5) * 1.6) * step;
          const p = ll(lat, lon, 1.004);
          pos.push(p.x, p.y, p.z);
          const t = (e - 1) / 254;
          aT.push(t);
          col.push(lut[e * 4] / 255, lut[e * 4 + 1] / 255, lut[e * 4 + 2] / 255);
          rr.push(hash(x, y, 8));
          if (d > 300) dense.push({ v: d, p: p.clone().normalize() });
        }
      }
      const g = track(new THREE.BufferGeometry());
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1));
      g.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
      g.setAttribute('aR', new THREE.Float32BufferAttribute(rr, 1));
      dots = new THREE.Points(g, dotMat);
      dots.frustumCulled = false;
      dots.renderOrder = 3;
      spin.add(dots);
      dense.sort((p, q) => q.v - p.v);
      brainSources = dense.slice(0, BRAIN_N).map((d) => d.p);
      if (brainSources.length > 50) buildBrain(brainSources);
    })
    .catch(() => {});

  const brainRot = new THREE.Matrix4();
  const brainRot3 = new THREE.Matrix3();
  const sm = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  function update(f: StoryFrame) {
    const [wD, wI, wU, wS, wM] = f.weight;
    const [pD, pI, pU, pS, pM] = f.progress;
    const t = f.time;
    spinToRoot.copy(tmpM.copy(root.matrixWorld).invert()).multiply(spin.matrixWorld);

    // Dots: always on with the Earth; dimmed while the brain is formed
    const brainK = brainAmount(f.weight, f.progress);
    const DU = dotMat.uniforms;
    DU.uAlpha.value = 1;
    DU.uPix.value = f.pixel;
    DU.uTime.value = t;
    DU.uDim.value = brainK * 0.85;
    DU.uNoise.value = wU;
    DU.uScanX.value = -1.15 + 2.35 * sm(0.18, 0.82, pU);
    DU.uImpactK.value = wM;
    DU.uImpactAng.value = Math.PI * sm(0.12, 0.9, pM);

    // 1. Data
    data.visible = wD > 0.002;
    dataLineMat.uniforms.uAlpha.value = wD;
    dataLineMat.uniforms.uDraw.value = sm(0.05, 0.45, pD);
    dataLineMat.uniforms.uTime.value = t;
    packetMat.uniforms.uAlpha.value = wD * sm(0.15, 0.4, pD);
    packetMat.uniforms.uTime.value = t;
    packetMat.uniforms.uPix.value = f.pixel;
    const nodesK = Math.max(wD, wS * 0.8);
    nodeMat.uniforms.uAlpha.value = nodesK;
    nodeMat.uniforms.uTime.value = t;
    nodeMat.uniforms.uPix.value = f.pixel;

    // 2. Intelligence
    const showBrain = wI > 0.002 && brainK > 0.001;
    brainPts.visible = synapses.visible = showBrain;
    if (showBrain) {
      brainRot.makeRotationY(Math.sin(t * 0.3) * 0.35);
      brainRot3.setFromMatrix4(brainRot);
      brainMat.uniforms.uRot.value.copy(brainRot3);
      brainMat.uniforms.uK.value = brainK;
      brainMat.uniforms.uAlpha.value = wI;
      brainMat.uniforms.uTime.value = t;
      brainMat.uniforms.uPix.value = f.pixel;
      synapseMat.uniforms.uAlpha.value = wI * sm(0.75, 1, brainK);
      synapseMat.uniforms.uTime.value = t;
    }

    // 3. Understanding
    const x = DU.uScanX.value;
    lens.visible = wU > 0.002 && Math.abs(x) < 1.02;
    if (lens.visible) {
      const r = Math.sqrt(Math.max(0, 1.03 * 1.03 - x * x));
      lens.position.set(x, 0, 0);
      lens.scale.set(1, r, r);
      lensMat.uniforms.uAlpha.value = wU * 0.85;
    }
    sheet.visible = wU > 0.002 && Math.abs(x) < 1.05;
    if (sheet.visible) {
      sheet.position.set(x, 0, 0.4);
      sheetMat.uniforms.uAlpha.value = wU;
      sheetMat.uniforms.uTime.value = t;
    }

    // 4. Strategy
    strategy.visible = wS > 0.002;
    routeMat.uniforms.uAlpha.value = wS;
    routeMat.uniforms.uDraw.value = sm(0.02, 0.35, pS);
    routeMat.uniforms.uPrune.value = sm(0.38, 0.62, pS);
    routeMat.uniforms.uFlow.value = sm(0.5, 0.7, pS);
    routeMat.uniforms.uTime.value = t;
    const retK = Math.max(wS * sm(0.45, 0.7, pS), wM * (1 - sm(0.1, 0.4, pM)));
    reticle.visible = retK > 0.002;
    reticleMats.forEach((m, i) => (m.opacity = retK * (i === 0 ? 0.95 : 0.6)));
    reticle.children[1].rotation.z = t * 0.6;
    const pulse = 1 + 0.08 * Math.sin(t * 3);
    reticle.scale.setScalar(pulse);

    // 5. Impact
    const ang = DU.uImpactAng.value;
    waves.forEach((w, k) => {
      const a = Math.max(0, ang - k * 0.16);
      w.visible = wM > 0.002 && a > 0.01 && a < Math.PI - 0.02;
      if (!w.visible) return;
      const r = Math.sin(a) * 1.006;
      w.position.copy(targetDir).multiplyScalar(Math.cos(a) * 1.006);
      w.scale.set(r, r, r);
      (w.material as THREE.LineBasicMaterial).opacity = wM * (k === 0 ? 0.9 : 0.4 - k * 0.1);
    });

    if (dots) dots.visible = f.presence > 0.001;
  }

  function setVisible(v: boolean) {
    data.visible = strategy.visible = lens.visible = sheet.visible = brainPts.visible = synapses.visible = reticle.visible = v;
    waves.forEach((w) => (w.visible = v));
  }

  function dispose() {
    cancelled = true;
    disposables.forEach((d) => d.dispose());
    [data, strategy, reticle, ...waves].forEach((o) => o.removeFromParent());
    [brainPts, synapses, lens, sheet].forEach((o) => o.removeFromParent());
    if (dots) dots.removeFromParent();
  }

  return { update, setVisible, dispose };
}
