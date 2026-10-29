import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { introBridge, K, TL } from '../lib/introBridge';
import { gestureBridge } from '../lib/gestureBridge';
import { LogoIntro } from './LogoIntro';
import { ErrorBoundary } from './ErrorBoundary';
import { brainAmount, createStory, SCENES } from './story/storyScenes';
import type { GlobeApi, GlobeHome } from './population/PopulationGlobe';

// Cesium resolves its workers and assets from here (copied by Vite); must be
// set before the Cesium chunk evaluates.
(window as unknown as { CESIUM_BASE_URL: string }).CESIUM_BASE_URL = '/cesium';

// The real, data-bearing Earth. The Three.js Earth below carries the logo intro
// and hands over to it once it has settled in the hero position.
const PopulationGlobe = lazy(() => import('./population/PopulationGlobe'));
const HANDOFF_S = 1.6;
// Story path: which side the globe takes for each scene (-1 left, 1 right; the
// text sits opposite) and the longitude it turns to face
const SIDES = [-1, 1, -1, 1, -1];
const SCENE_LON = [45, 84, 40, 66, 77];
// Framing per scene, relative to the side-position size (1 = default)
const SCENE_ZOOM = [1.5, 0.7, 1.1, 1.3, 0.9];
const shortAngle = (d: number) => ((((d + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
const wrap180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

interface EarthCanvasProps {
  accentColor?: string;
  storyRef: React.RefObject<HTMLDivElement | null>;
}

export const EarthCanvas: React.FC<EarthCanvasProps> = ({
  accentColor = '#8CC8D8',
  storyRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrimLRef = useRef<HTMLDivElement | null>(null);
  const scrimRRef = useRef<HTMLDivElement | null>(null);
  const [home, setHome] = useState<GlobeHome | null>(null);
  const [explore, setExplore] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const cesiumLayerRef = useRef<HTMLDivElement | null>(null);
  const cesiumReady = useRef(false);
  const globeApi = useRef<GlobeApi | null>(null);

  // Explore mode: globe centred, hero copy out of the way, page held in place
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('omav-exploring', explore);
    if (!explore) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExplore(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      html.classList.remove('omav-exploring');
    };
  }, [explore]);

  // Gesture control takes the globe to the centre; explore mode steps aside
  useEffect(() => gestureBridge.subscribe((on) => on && setExplore(false)), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const story = storyRef.current;
    if (!canvas || !stage || !story) return;

    let alive = true;
    let raf = 0;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Renderer setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setIsLoaded(true);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    camera.position.set(0, 0, 4.4);

    // One key light. It starts where the emblem's blue centre has its highlight
    // (upper left) and travels with the intro camera to the hero's side light.
    const SUN_H = new THREE.Vector3(-0.95, 0.25, 0.18).normalize();
    const SUN_I = new THREE.Vector3(-0.42, 0.42, 0.8).normalize();
    const SUN = SUN_H.clone();
    const accent = new THREE.Color(accentColor);
    const silver = new THREE.Color('#DCE3EB');
    const TILT = 0.46;
    const NET = new THREE.Vector3();

    const U = {
      uTime: { value: 0 },
      uNet: { value: NET },
      uDisc: { value: 1 },
      uTilt: { value: TILT },
      uRings: { value: 0 },
      uSweep: { value: 0 },
      uImpact: { value: 0 },
      uPaths: { value: 0 },
      uBeam: { value: 0 },
    };

    // Textures loader. The logo intro holds its dive until the Earth is ready.
    let texReady = false;
    let tLoad = 0;

    const markReady = () => {
      if (texReady) return;
      texReady = true;
      tLoad = performance.now();
      setIsLoaded(true);
      introBridge.setEarthReady();
    };

    const mgr = new THREE.LoadingManager();
    mgr.onLoad = markReady;

    const loader = new THREE.TextureLoader(mgr);
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);

    const loadTex = (path: string, wrap = false) => {
      const t = loader.load(
        path,
        () => {},
        undefined,
        // If texture fails to load, mark ready anyway so user isn't stuck
        markReady
      );
      t.anisotropy = aniso;
      if (wrap) t.wrapS = THREE.RepeatWrapping;
      return t;
    };

    const URL_DAY = '/assets/aistudio/2419145b1a56f93908364cdba80a4980_af3c5cdd.jpg';
    const URL_NIGHT = '/assets/aistudio/3b759647416f7940961fc69f639ab848_48c6f763.jpg';
    const URL_SPEC = '/assets/aistudio/616359cbb216d7811129f71760995474_5a027277.jpg';
    const URL_WATER = '/assets/aistudio/a64b4424f88198be764305fdc0d57f25.jpg';
    const URL_CLOUD = '/assets/aistudio/c12e8676a1ae56631d204355369938bc.jpg';

    const dayTex = loadTex(URL_DAY);
    const nightTex = loadTex(URL_NIGHT);
    const waterTex = loadTex(URL_WATER);
    const cloudTex = loadTex(URL_CLOUD, true);

    // Fallback safety timeout for texture readiness
    const safetyTimer = setTimeout(markReady, 6000);

    const root = new THREE.Group();
    scene.add(root);
    const tilt = new THREE.Group();
    tilt.rotation.set(0.36, 0, 0.14);
    root.add(tilt);
    const spin = new THREE.Group();
    tilt.add(spin);

    const BASE = Math.PI / 2 - ((62 + 180) * Math.PI) / 180;

    function ll(lat: number, lon: number, r: number) {
      const p = ((lon + 180) * Math.PI) / 180;
      const t = ((90 - lat) * Math.PI) / 180;
      return new THREE.Vector3(
        -r * Math.cos(p) * Math.sin(t),
        r * Math.cos(t),
        r * Math.sin(p) * Math.sin(t)
      );
    }

    const ROTX =
      'vec3 rx(vec3 p, float a){ float c = cos(a); float s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }\n';
    const UV_VS =
      'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

    // Earth Shader Material. During the intro it starts as the emblem's flat blue
    // centre (the same SVG radial gradient, evaluated in screen space so the
    // hand-over is invisible), gains volume, then resolves into the Earth.
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        dayMap: { value: dayTex },
        nightMap: { value: nightTex },
        waterMap: { value: waterTex },
        cloudMap: { value: cloudTex },
        uSun: { value: SUN },
        uReveal: { value: 0 },
        uFade: { value: 1 },
        uDepth: { value: 1 },
        uEarth: { value: 1 },
        uLand: { value: 1 },
        uCloud: { value: 1 },
        uNight: { value: 1 },
        uExpo: { value: 1 },
        uCloudShift: { value: 0 },
        uDotC: { value: new THREE.Vector2(0, 0) },
        uDotR: { value: 1 },
        uRes: { value: new THREE.Vector4(1, 1, 1, 1) },
        uS0: { value: new THREE.Color('#8090F0') },
        uS1: { value: new THREE.Color('#3A48B6') },
        uS2: { value: new THREE.Color('#171D5E') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vN;
        varying vec3 vW;
        void main(){
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vW = wp.xyz;
          vN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayMap;
        uniform sampler2D nightMap;
        uniform sampler2D waterMap;
        uniform sampler2D cloudMap;
        uniform vec3 uSun;
        uniform float uFade;
        uniform float uReveal;
        uniform float uDepth;
        uniform float uEarth;
        uniform float uLand;
        uniform float uCloud;
        uniform float uNight;
        uniform float uExpo;
        uniform float uCloudShift;
        uniform vec2 uDotC;
        uniform float uDotR;
        uniform vec4 uRes;
        uniform vec3 uS0;
        uniform vec3 uS1;
        uniform vec3 uS2;
        varying vec2 vUv;
        varying vec3 vN;
        varying vec3 vW;

        vec3 grad(float t){
          t = clamp(t, 0.0, 1.0);
          return t < 0.52 ? mix(uS0, uS1, t / 0.52) : mix(uS1, uS2, (t - 0.52) / 0.48);
        }
        // SVG radial gradient (cx .4, cy .34, r .72, focus .36/.30)
        float focalT(vec2 b){
          vec2 d = b - vec2(0.36, 0.30);
          vec2 e = vec2(0.04, 0.04);
          float a = dot(e, e) - 0.5184;
          float de = dot(d, e);
          return (de - sqrt(max(de * de - a * dot(d, d), 0.0))) / a;
        }

        void main(){
          vec3 n = normalize(vN);
          vec3 v = normalize(cameraPosition - vW);
          float ndl = dot(n, uSun);
          float nv = max(dot(n, v), 0.0);

          vec2 css = vec2(gl_FragCoord.x * uRes.x / uRes.z, uRes.y - gl_FragCoord.y * uRes.y / uRes.w);
          vec2 bb = (css - (uDotC - vec2(uDotR))) / (2.0 * uDotR);
          vec3 col = grad(focalT(bb));
          float limb = pow(1.0 - nv, 2.0);
          vec3 hs = normalize(uSun + v);
          vec3 vol = col * (1.0 - 0.5 * limb) + uS0 * 0.22 * pow(max(dot(n, hs), 0.0), 28.0) + vec3(0.10, 0.14, 0.32) * pow(1.0 - nv, 4.0) * 0.6;
          col = mix(col, vol, uDepth);

          float water = texture2D(waterMap, vUv).r;
          vec3 day = texture2D(dayMap, vUv).rgb;
          float l = dot(day, vec3(0.299, 0.587, 0.114));
          vec3 landCol = mix(vec3(l), day, 0.5) * vec3(0.8, 0.9, 1.0);
          landCol = landCol / (1.0 + landCol * 0.9) * 1.35;
          vec3 ocean = vec3(0.030, 0.070, 0.160) + day * vec3(0.03, 0.05, 0.09);
          vec3 landStage = mix(ocean * 1.8 + vec3(0.012, 0.016, 0.022), landCol, uLand);
          vec3 surf = mix(landStage, ocean, water);
          float lit = smoothstep(-0.1, 0.6, ndl);
          vec3 ec = surf * (0.02 + 0.5 * lit) * mix(1.0, 1.55, water) * uExpo;
          float cl = texture2D(cloudMap, vUv + vec2(uCloudShift, 0.0)).r * uCloud;
          ec = mix(ec, vec3(0.80, 0.84, 0.90) * (0.03 + 0.62 * lit) * uExpo, cl * 0.5);

          vec3 night = texture2D(nightMap, vUv).rgb;
          float dark = 1.0 - smoothstep(-0.22, 0.12, ndl);
          ec += pow(night, vec3(1.25)) * vec3(1.0, 0.85, 0.62) * 1.7 * dark * uNight * (1.0 - cl * 0.7);

          vec3 h = normalize(uSun + v);
          ec += water * pow(max(dot(n, h), 0.0), 48.0) * 0.32 * vec3(0.72, 0.86, 1.0) * lit * uNight;

          float fres = pow(1.0 - nv, 2.6);
          ec += vec3(0.42, 0.68, 0.84) * fres * (0.08 + 0.42 * smoothstep(-0.35, 0.6, ndl));

          col = mix(col, ec * uReveal, uEarth);
          gl_FragColor = vec4(col, uFade);
        }
      `,
      transparent: true,
    });

    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), earthMat);
    earth.renderOrder = 2;
    spin.add(earth);

    // Atmosphere Glow Material
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        uA: { value: 0 },
        uSun: { value: SUN },
        uColor: { value: new THREE.Color('#7FB4D6') },
      },
      vertexShader: `
        varying vec3 vNV;
        varying vec3 vNW;
        void main(){
          vNV = normalize(normalMatrix * normal);
          vNW = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uA;
        uniform vec3 uSun;
        uniform vec3 uColor;
        varying vec3 vNV;
        varying vec3 vNW;
        void main(){
          float t = clamp(-vNV.z / 0.42, 0.0, 1.0);
          float i = pow(t, 2.4);
          float lf = 0.22 + 0.78 * smoothstep(-0.5, 0.7, dot(normalize(vNW), uSun));
          gl_FragColor = vec4(uColor, i * lf * uA * 0.85);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.09, 64, 64), atmoMat);
    atmo.renderOrder = 1;
    spin.add(atmo);

    // Global Key Capital Cities & Hubs
    const SITES = [
      [19.07, 72.88],   // Mumbai
      [51.5, -0.12],    // London
      [1.35, 103.82],   // Singapore
      [25.2, 55.27],    // Dubai
      [38.9, -77.04],   // Washington DC
      [-1.29, 36.82],   // Nairobi
      [35.68, 139.69],  // Tokyo
      [50.85, 4.35],    // Brussels
      [-33.87, 151.21], // Sydney
      [28.61, 77.21],   // New Delhi
    ];

    const ringGeo = new THREE.RingGeometry(0.9, 1.0, 64);
    const dotGeo = new THREE.CircleGeometry(1, 24);
    const Z = new THREE.Vector3(0, 0, 1);
    const markers: Array<{
      dot: THREE.Mesh;
      rings: THREE.Mesh[];
      phase: number;
    }> = [];

    SITES.forEach((s, i) => {
      const n = ll(s[0], s[1], 1).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(Z, n);

      const dm = new THREE.MeshBasicMaterial({
        color: silver,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const dot = new THREE.Mesh(dotGeo, dm);
      dot.position.copy(n).multiplyScalar(1.004);
      dot.quaternion.copy(q);
      dot.scale.setScalar(0.0085);
      dot.renderOrder = 3;
      spin.add(dot);

      const rings = [0, 1].map((k) => {
        const m = new THREE.MeshBasicMaterial({
          color: k ? accent : silver,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        });
        const r = new THREE.Mesh(ringGeo, m);
        r.position.copy(n).multiplyScalar(1.005);
        r.quaternion.copy(q);
        r.renderOrder = 3;
        spin.add(r);
        return r;
      });

      markers.push({ dot, rings, phase: i * 0.37 });
    });

    // Flight and Data Arcs
    const PAIRS = [
      [0, 1], [0, 2], [3, 5], [1, 4],
      [7, 3], [2, 6], [6, 8], [9, 7],
    ];

    const arcVS = `
      attribute float aT;
      varying float vT;
      void main(){
        vT = aT;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const arcFS = `
      uniform float uHead;
      uniform float uDraw;
      uniform float uAlpha;
      uniform vec3 uColor;
      varying float vT;
      void main(){
        if (vT > uDraw) discard;
        float tail = smoothstep(uHead - 0.28, uHead, vT) * step(vT, uHead);
        float a = (0.14 + tail * 0.38) * uAlpha;
        gl_FragColor = vec4(uColor, a);
      }
    `;

    // Small eagles from the OMAV mark (wings + blue head) fly the arcs
    function eagleTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const cx = c.getContext('2d');
      if (cx) {
        // Mark coordinates: wings span x ±143, head at the origin, nib to y 99
        cx.translate(256, 64);
        cx.scale(1.62, 1.62);
        const wing = new Path2D(
          'M -143 25 C -128 12 -108 6 -88 6 C -58 6 -22 30 0 57 C 22 30 58 6 88 6 C 108 6 128 12 143 25 C 126 22 108 25 92 27 C 60 31 28 52 7.5 80 L -7.5 80 C -28 52 -60 31 -92 27 C -108 25 -126 22 -143 25 Z'
        );
        cx.save();
        cx.translate(0, 4.5);
        cx.fillStyle = '#5E6674';
        cx.fill(wing);
        cx.restore();
        cx.fillStyle = '#E4E8EE';
        cx.fill(wing);
        cx.fillRect(-7.5, 79, 15, 5);
        cx.beginPath();
        cx.moveTo(-6, 84);
        cx.lineTo(6, 84);
        cx.lineTo(0, 99);
        cx.closePath();
        cx.fill();
        cx.beginPath();
        cx.arc(0, 0, 24, 0, Math.PI * 2);
        cx.fillStyle = '#FFFFFF';
        cx.fill();
        cx.beginPath();
        cx.arc(0, 0, 20, 0, Math.PI * 2);
        cx.fillStyle = '#2D307D';
        cx.fill();
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      return t;
    }

    const eagleTex = eagleTexture();
    const EAGLE_W = 0.075;
    const EAGLE_H = EAGLE_W * 0.5;

    const arcs = PAIRS.map((pr, i) => {
      const a = ll(SITES[pr[0]][0], SITES[pr[0]][1], 1).normalize();
      const b = ll(SITES[pr[1]][0], SITES[pr[1]][1], 1).normalize();
      const ang = a.angleTo(b);
      const h = 0.05 + ang * 0.16;
      const N = 96;
      const sa = Math.sin(ang);
      const pos = new Float32Array((N + 1) * 3);
      const at = new Float32Array(N + 1);

      const pointAt = (t: number, out: THREE.Vector3) => {
        const w1 = Math.sin((1 - t) * ang) / sa;
        const w2 = Math.sin(t * ang) / sa;
        const rr = 1.004 + h * Math.sin(Math.PI * t);
        return out.set((a.x * w1 + b.x * w2) * rr, (a.y * w1 + b.y * w2) * rr, (a.z * w1 + b.z * w2) * rr);
      };

      const tmp = new THREE.Vector3();
      for (let j = 0; j <= N; j++) {
        const t = j / N;
        pointAt(t, tmp);
        pos[j * 3] = tmp.x;
        pos[j * 3 + 1] = tmp.y;
        pos[j * 3 + 2] = tmp.z;
        at[j] = t;
      }

      const eagleMat = new THREE.SpriteMaterial({
        map: eagleTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const eagle = new THREE.Sprite(eagleMat);
      eagle.scale.set(EAGLE_W, EAGLE_H, 1);
      eagle.center.set(0.5, 0.75);
      eagle.renderOrder = 4;
      spin.add(eagle);

      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aT', new THREE.BufferAttribute(at, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uHead: { value: 0 },
          uDraw: { value: 0 },
          uAlpha: { value: 0 },
          uColor: { value: i % 2 ? accent : silver },
        },
        vertexShader: arcVS,
        fragmentShader: arcFS,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(g, mat);
      line.renderOrder = 3;
      spin.add(line);
      return { line, mat, eagle, eagleMat, pointAt, speed: 0.15 + (i % 3) * 0.045, offset: i * 0.29 };
    });

    const eP0 = new THREE.Vector3();
    const eP1 = new THREE.Vector3();

    // Orbit loops
    function circleGeo(r: number, n: number) {
      const pos = new Float32Array(n * 3);
      const aa = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 2] = Math.sin(a) * r;
        aa[i] = i / n;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aA', new THREE.BufferAttribute(aa, 1));
      return g;
    }

    const orbitMat = new THREE.ShaderMaterial({
      uniforms: {
        uA: { value: 0 },
        uTime: U.uTime,
        uColor: { value: silver },
      },
      vertexShader: `
        attribute float aA;
        varying float vA;
        void main(){
          vA = aA;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uA;
        uniform float uTime;
        uniform vec3 uColor;
        varying float vA;
        void main(){
          float dash = step(0.55, fract(vA * 140.0));
          float sw = pow(0.5 + 0.5 * cos(vA * 6.28318 - uTime * 0.22), 6.0);
          gl_FragColor = vec4(uColor, uA * (0.15 + 0.85 * dash) * (0.2 + 0.8 * sw));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const orbit1 = new THREE.LineLoop(circleGeo(1.34, 400), orbitMat);
    orbit1.rotation.set(1.32, 0, 0.32);
    orbit1.renderOrder = 3;
    root.add(orbit1);

    const orbit2 = new THREE.LineLoop(circleGeo(1.52, 460), orbitMat);
    orbit2.rotation.set(1.12, 0.4, -0.5);
    orbit2.renderOrder = 3;
    root.add(orbit2);

    // The five "How we think" scenes, drawn on and around this Earth
    const storyFx = createStory(spin, root, ll);

    // Responsive Camera and Globe layout positioning
    const L = { gx: 1.2, gy: 0, gs: 1, nx: 1, ny: -0.2, disc: 0.8, H: 800 };

    function layout() {
      if (!stage) return;
      const W = stage.clientWidth || 1;
      const H = stage.clientHeight || 1;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();

      const hh = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const hw = hh * camera.aspect;
      L.H = H;

      if (camera.aspect >= 1.05) {
        L.gs = Math.min(1.1, hw * 0.52);
        L.gx = Math.max(hw - L.gs * 0.9, L.gs + hw * 0.08);
        L.gy = -0.02;
        L.disc = Math.min(0.92, hw * 0.36);
        L.nx = hw * 0.46;
        L.ny = -0.2;
      } else {
        L.gs = Math.max(0.6, Math.min(1.0, hw * 1.1));
        L.gx = hw * 0.28;
        L.gy = -hh * 0.7;
        L.disc = Math.min(0.9, hw * 0.6);
        L.nx = 0;
        L.ny = hh * 0.22;
      }

      // Resting globe placement is the intro camera's destination
      introBridge.setLayout({ gs: L.gs, gx: L.gx, gy: L.gy, hh, W, H });

      // Where the real Earth takes over: same centre and silhouette radius
      const wpp = (2 * hh) / H;
      const next = { dx: Math.round(L.gx / wpp), dy: Math.round(-L.gy / wpp), r: Math.round(L.gs / wpp) };
      setHome((prev) => (prev && prev.dx === next.dx && prev.dy === next.dy && prev.r === next.r ? prev : next));
    }

    layout();
    const ro = window.ResizeObserver ? new ResizeObserver(() => layout()) : null;
    if (ro) ro.observe(stage);
    window.addEventListener('resize', layout);

    // Interactive Drag Controls
    let mx = 0;
    let my = 0;
    let pmx = 0;
    let pmy = 0;
    let yaw = 0;
    let vel = 0;
    let pitch = 0;
    let dragging = false;
    let lx = 0;
    let ly = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      vel = 0;
    };

    const onDrag = (e: PointerEvent) => {
      if (dragging) {
        const dx = e.clientX - lx;
        const dy = e.clientY - ly;
        lx = e.clientX;
        ly = e.clientY;
        yaw += dx * 0.005;
        vel = dx * 0.003;
        pitch = Math.max(-0.3, Math.min(0.3, pitch + dy * 0.003));
      }
      if (!e.pointerType || e.pointerType === 'mouse') {
        mx = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
        my = (e.clientY / (window.innerHeight || 1)) * 2 - 1;
      }
    };

    const onUp = () => {
      dragging = false;
    };

    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onDrag);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    function sm(a: number, b: number, x: number) {
      let t = (x - a) / (b - a);
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      return t * t * (3 - 2 * t);
    }

    const t0 = performance.now();
    let last = t0;
    let cleared = true;
    let idleCleared = false;
    let handoff = 0; // 0 = Three.js Earth, 1 = Cesium Earth
    // Scratch for reading the intro Earth's orientation each frame
    const qSpin = new THREE.Quaternion();
    const qInv = new THREE.Quaternion();
    const toCam = new THREE.Vector3();
    const local = new THREE.Vector3();
    const northW = new THREE.Vector3();
    const fwd = new THREE.Vector3();
    const rightV = new THREE.Vector3();
    const upV = new THREE.Vector3();
    const WORLD_UP = new THREE.Vector3(0, 1, 0);
    let wasSuspended = false;
    let autoAngle = 0;
    // Gesture control: how far the hero has moved to its centred framing, and
    // the eased two-hand zoom
    let gk = 0;
    let gz = 1;
    let gYaw = 0;
    let gPitch = 0;

    // Surface point facing the viewer, and the screen roll of the north axis
    function facing() {
      spin.getWorldQuaternion(qSpin);
      toCam.copy(camera.position).sub(root.position).normalize();
      local.copy(toCam).applyQuaternion(qInv.copy(qSpin).invert());
      const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, local.y))) * 180) / Math.PI;
      const lon = wrap180((Math.atan2(local.z, -local.x) * 180) / Math.PI - 180);
      northW.set(0, 1, 0).applyQuaternion(qSpin);
      fwd.copy(toCam).negate();
      rightV.crossVectors(fwd, WORLD_UP).normalize();
      upV.crossVectors(rightV, fwd);
      return { lat, lon, roll: Math.atan2(northW.dot(rightV), northW.dot(upV)) };
    }

    // Spin angle (relative to BASE) that turns a longitude to face the viewer
    let calib: { lon0: number; k: number } | null = null;
    function sceneAngle(i: number) {
      if (!calib) {
        const saved = spin.rotation.y;
        spin.rotation.y = BASE;
        scene.updateMatrixWorld();
        const l0 = facing().lon;
        spin.rotation.y = BASE + 0.2;
        scene.updateMatrixWorld();
        const l1 = facing().lon;
        spin.rotation.y = saved;
        scene.updateMatrixWorld();
        calib = { lon0: l0, k: wrap180(l1 - l0) / 0.2 || -57.3 };
      }
      return (wrap180(SCENE_LON[i] - calib.lon0) * Math.PI) / 180 / ((calib.k * Math.PI) / 180);
    }

    // Scroll positions (in stage heights) where each scene's text is centred
    const anchors = { how: 0.8, scene: [1.6, 2.6, 3.6, 4.6, 5.6], span: [1, 1, 1, 1, 1] };
    let anchorTick = 0;
    function measureAnchors(rect: DOMRect) {
      if (anchorTick-- > 0 || !story || !stage) return;
      anchorTick = 30;
      const SH = stage.clientHeight || 1;
      const centre = (id: string) => {
        const el = story.querySelector<HTMLElement>(`#${id}`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return (r.top - rect.top + r.height / 2 - SH / 2) / SH;
      };
      const h = centre('how');
      if (h !== null) anchors.how = h;
      SCENES.forEach((id, i) => {
        const c = centre(id);
        if (c !== null) anchors.scene[i] = c;
      });
      for (let i = 0; i < 5; i++) {
        anchors.span[i] = i < 4 ? anchors.scene[i + 1] - anchors.scene[i] : anchors.scene[4] - anchors.scene[3];
      }
    }

    function frame(now: number) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;

      if (document.hidden) return;
      if (!story || !stage) return;

      // Advance the shared intro clock (LogoIntro may already have this frame)
      introBridge.frame(now);
      const introOn = introBridge.mode !== 'off';
      const it = introBridge.clock(now);
      if (introOn && it < TL.T0 - 0.05) {
        if (!cleared) {
          renderer.clear();
          cleared = true;
        }
        return;
      }
      cleared = false;

      const rect = story.getBoundingClientRect();
      const vh = window.innerHeight || L.H;
      if (rect.bottom < -40 || rect.top > vh + 40) return;

      const tIntro = texReady ? (prefersReducedMotion ? 10 : (now - tLoad) / 1000) : 0;
      const time = (now - t0) / 1000;
      const SH = stage.clientHeight || L.H;
      const u = Math.max(0, -rect.top / SH);

      // ------------------------------------------------ story: scenes and path
      measureAnchors(rect);
      const A = anchors;
      const weight = [0, 0, 0, 0, 0];
      const progress = [0, 0, 0, 0, 0];
      let lead = -1;
      let leadW = 0;
      for (let i = 0; i < 5; i++) {
        const span = A.span[i];
        const d = u - A.scene[i];
        progress[i] = Math.min(1, Math.max(0, d / span + 0.5));
        weight[i] = 1 - sm(0.34, 0.52, Math.abs(d) / span);
        if (weight[i] > leadW) {
          leadW = weight[i];
          lead = i;
        }
      }

      // The Earth comes back from Cesium as the scroll starts, and stays
      // The hand-over runs across the "How we think" intro, while the globe is
      // already moving; the Cesium Earth tracks it so there is no double image
      const storyK = sm(0.02, Math.max(0.2, anchors.how * 0.8), u);
      const net = 1 - sm(0.04, 0.4, u);

      if (cesiumReady.current && introBridge.mode !== 'play') handoff = Math.min(1, handoff + dt / HANDOFF_S);
      const keepThree = 1 - handoff * (1 - storyK);
      const cl = cesiumLayerRef.current;
      if (cl) {
        const o = handoff * (1 - storyK);
        const os = o.toFixed(3);
        if (cl.style.opacity !== os) cl.style.opacity = os;
        const pe = o > 0.5 ? 'auto' : 'none';
        if (cl.style.pointerEvents !== pe) cl.style.pointerEvents = pe;
      }
      renderer.domElement.style.pointerEvents = handoff > 0.5 ? 'none' : 'auto';
      const susp = u > 0.03;
      if (susp !== wasSuspended) {
        wasSuspended = susp;
        setSuspended(susp);
        if (susp) setExplore(false);
      }

      const rev = introOn ? 1 : sm(0, 2.4, tIntro);
      const netIn = introOn ? sm(TL.NET0, TL.NET1, it) : sm(2.0, 3.6, tIntro);
      const draw = introOn ? sm(TL.NET0 + 0.1, TL.NET1 + 0.7, it) : sm(2.2, 4.4, tIntro);
      const settle = 1 - Math.pow(1 - Math.min(1, tIntro / 5.5), 3);

      if (!dragging) {
        vel *= Math.pow(0.05, dt);
        yaw += vel * dt * 60;
        pitch *= Math.pow(0.2, dt);
      }

      const pk = 1 - Math.exp(-dt * 2.5);
      pmx += (mx - pmx) * pk;
      pmy += (my - pmy) * pk;

      const gOn = gestureBridge.active;
      gk += ((gOn ? 1 : 0) - gk) * (1 - Math.exp(-dt * 1.4));
      if (Math.abs(gk - (gOn ? 1 : 0)) < 1e-4) gk = gOn ? 1 : 0;
      gz += ((gOn ? gestureBridge.zoom : 1) - gz) * (1 - Math.exp(-dt * 5));
      if (!gOn && Math.abs(gz - 1) < 1e-3) gz = 1;
      // Open-palm turn, at the hero only: it eases out as the story takes over
      gestureBridge.atHero = u < 0.03;
      const gr = 1 - Math.exp(-dt * 4);
      gYaw += (gestureBridge.yaw - gYaw) * gr;
      gPitch += (gestureBridge.pitch - gPitch) * gr;

      // Idle spin at the hero; it stops as soon as the scroll begins
      autoAngle += dt * (prefersReducedMotion ? 0.008 : 0.028) * (1 - sm(0, 0.04, u));

      // Path through the scenes: alternate sides, dipping between them
      const hh = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const hw = hh * camera.aspect;
      const wide = camera.aspect >= 1.05;
      const sideScale = wide ? Math.min(L.gs * 0.9, hh * 0.62) : Math.min(L.gs * 0.92, hw * 0.92);
      // Keyframes: hero, the intro transit, then the five scenes. Each scene has
      // its own framing (zoom); every move turns the Earth forward.
      const sideX = (i: number, z: number) => SIDES[i] * hw * (0.5 + (z - 1) * 0.08);
      const keys = [
        // With gestures on, the hero Earth takes the centre, a touch larger
        { u: 0, x: L.gx * (1 - gk), y: L.gy * (1 - gk), s: L.gs * (1 + 0.1 * gk), a: autoAngle },
        {
          u: A.how,
          x: wide ? hw * 0.34 : 0,
          y: wide ? -hh * 0.04 : -hh * 0.28,
          s: wide ? L.gs * 1.04 : L.gs * 0.95,
          a: autoAngle + 0.9,
        },
        ...A.scene.map((su, i) => ({
          u: su,
          x: wide ? sideX(i, SCENE_ZOOM[i]) : 0,
          y: wide ? -hh * 0.02 : -hh * 0.36,
          s: sideScale * SCENE_ZOOM[i],
          a: 0,
        })),
      ];
      // Unwrap scene angles so each move rotates forward by at least ~45°
      for (let i = 2; i < keys.length; i++) {
        let a = sceneAngle(i - 2);
        const min = keys[i - 1].a + 0.8;
        a += Math.ceil((min - a) / (2 * Math.PI)) * 2 * Math.PI;
        keys[i].a = a;
      }
      let k0 = keys[0];
      let k1 = keys[0];
      let f = 0;
      let gap = 1;
      for (let i = 0; i < keys.length - 1; i++) {
        if (u >= keys[i].u) {
          k0 = keys[i];
          k1 = keys[i + 1];
          gap = k1.u - k0.u;
          // Short holds: the globe is nearly always on the move
          f = i === 0 ? K.smoother(0.0, k1.u, u) : K.smoother(k0.u + gap * 0.12, k1.u - gap * 0.12, u);
        }
      }
      if (u >= keys[keys.length - 1].u) {
        k0 = k1 = keys[keys.length - 1];
        f = 0;
      }
      const travel = Math.sin(Math.PI * f);
      const dirX = Math.sign(k1.x - k0.x);
      const storyX = k0.x + (k1.x - k0.x) * f;
      const dip = k0.x !== k1.x ? travel * hh * (wide ? 0.14 : 0.06) : 0;
      const storyY = k0.y + (k1.y - k0.y) * f - dip;
      // Pull back mid-move, then settle into the next framing
      const storyS = (k0.s + (k1.s - k0.s) * f) * (1 - 0.1 * travel) * gz;
      // Gentle drift while a scene holds, so the Earth never sits still
      const drift = k0 === k1 ? 0 : 0.1 * Math.sin((2 * Math.PI * (u - k0.u)) / Math.max(0.2, gap));
      const storyAngle = k0.a + (k1.a - k0.a) * f + drift * storyK;
      // Lean into the direction of travel
      const lean = -dirX * travel * 0.12 * storyK;

      // Side scrims follow the text, which sits opposite the globe
      if (scrimLRef.current && scrimRRef.current) {
        const side = wide ? Math.max(-1, Math.min(1, storyX / (hw * 0.5))) : 1;
        const lK = (u < A.how ? 1 : Math.max(0, side)) * (1 - gk * (1 - storyK));
        const rK = u < A.how ? 0 : Math.max(0, -side);
        scrimLRef.current.style.opacity = lK.toFixed(3);
        scrimRRef.current.style.opacity = rK.toFixed(3);
      }

      let gx = storyX;
      let gy = storyY;
      let gsc = storyS * (0.93 + 0.07 * rev);
      let eFade = 1;
      let atmoK = 1;
      let kPar = 1 - 0.7 * storyK;
      let sunK = 1;
      let expo = 1;
      let depth = 1;
      let earthK = 1;
      let landK = 1;
      let cloudK = 1;
      let nightK = 1;
      let rotOff = -(1 - settle) * 0.8;
      const cam = introBridge.cam;
      if (introOn) {
        // The emblem's blue centre gains volume and resolves into the Earth while
        // the shared camera carries it to its hero position
        const smr = K.smoother;
        eFade = K.seg(it, TL.T0, TL.FADE1);
        depth = smr(TL.DEPTH0, TL.DEPTH1, it);
        earthK = sm(TL.EARTH0, TL.EARTH1, it);
        landK = sm(TL.LAND0, TL.LAND1, it);
        cloudK = sm(TL.CLOUD0, TL.CLOUD1, it);
        nightK = smr(TL.NIGHT0, TL.NIGHT1, it);
        atmoK = smr(TL.ATMO0, TL.ATMO1, it);
        if (it < TL.CAM1 && introBridge.dot) {
          const Hd = stage.clientHeight || 1;
          const Wd = stage.clientWidth || 1;
          const wpp = (2 * hh) / Hd;
          gx = (cam.x - Wd / 2) * wpp;
          gy = -(cam.y - Hd / 2) * wpp;
          gsc = Math.max(1e-4, cam.r * wpp);
        }
        const cu = it < TL.CAM1 ? cam.u : 1;
        kPar = Math.min(kPar, K.seg(it, TL.CAM1, TL.CAM1 + 1.2));
        rotOff = -0.24 * (1 - cu);
        sunK = cu;
        expo = 1 + 0.7 * (1 - cu);
      }
      SUN.copy(SUN_I).lerp(SUN_H, sunK).normalize();

      const heroK = 1 - storyK;
      spin.rotation.y = BASE + storyAngle + rotOff + yaw + gYaw * heroK;
      root.rotation.y = pmx * 0.08 * kPar;
      root.rotation.x = (pmy * 0.05 + pitch) * kPar + gPitch * heroK;
      root.rotation.z = lean;
      root.position.set(gx, gy, 0);
      root.scale.setScalar(gsc);

      const EU = earthMat.uniforms;
      EU.uFade.value = eFade * keepThree;
      // Slightly darker in the story so its overlays read; darkest behind the brain
      EU.uReveal.value = rev * (1 - 0.22 * storyK) * (1 - 0.6 * brainAmount(weight, progress));
      EU.uDepth.value = depth;
      EU.uEarth.value = earthK;
      EU.uLand.value = landK;
      EU.uCloud.value = cloudK;
      EU.uNight.value = nightK;
      EU.uExpo.value = expo;
      EU.uCloudShift.value = time * 0.0009;
      EU.uDotC.value.set(cam.x, cam.y);
      EU.uDotR.value = Math.max(1, cam.r);
      EU.uRes.value.set(stage.clientWidth || 1, stage.clientHeight || 1, renderer.domElement.width || 1, renderer.domElement.height || 1);
      earth.visible = keepThree > 0.004;
      earthMat.depthWrite = eFade > 0.6;
      atmoMat.uniforms.uA.value = rev * atmoK * keepThree;
      atmo.visible = earth.visible && atmoK > 0.001;

      const na = netIn * net * keepThree;
      const show = na > 0.002;

      for (let i = 0; i < markers.length; i++) {
        const m = markers[i];
        m.dot.visible = show;
        (m.dot.material as THREE.MeshBasicMaterial).opacity = na * 0.9;
        for (let j = 0; j < 2; j++) {
          const ph = (time * 0.32 + m.phase + j * 0.5) % 1;
          const rg = m.rings[j];
          rg.visible = show;
          rg.scale.setScalar(0.012 + ph * 0.08);
          (rg.material as THREE.MeshBasicMaterial).opacity = Math.pow(1 - ph, 1.6) * 0.6 * na;
        }
      }

      for (let ai = 0; ai < arcs.length; ai++) {
        const Ar = arcs[ai];
        Ar.line.visible = show;
        Ar.mat.uniforms.uDraw.value = draw;
        Ar.mat.uniforms.uAlpha.value = na * 0.85;
        Ar.mat.uniforms.uHead.value = ((time * Ar.speed + Ar.offset) % 1) * 1.35;
      }

      orbitMat.uniforms.uA.value = na * 0.14;
      orbit1.visible = show;
      orbit2.visible = show;
      U.uTime.value = time;

      scene.updateMatrixWorld();

      // The Cesium Earth follows this one's facing point, north-axis roll and key
      // light, so the cross-fade (and its idle drift afterwards) has no seam
      const api = globeApi.current;
      if (api && (handoff > 0 || introBridge.mode !== 'play')) {
        const v = facing();
        const wpp = (2 * hh) / (stage.clientHeight || 1);
        api.follow({
          lat: v.lat,
          lon: v.lon,
          roll: v.roll,
          sun: [SUN.dot(rightV), SUN.dot(upV), SUN.dot(toCam)],
          dx: gx / wpp,
          dy: -gy / wpp,
          r: gsc / wpp,
          track: gk > 0 || gz !== 1,
        });
      }

      // Eagles ride each arc's head, turned to face their direction of flight
      for (let ai = 0; ai < arcs.length; ai++) {
        const Ar = arcs[ai];
        const hd = Ar.mat.uniforms.uHead.value;
        const vis = show && hd > 0 && hd < 1;
        Ar.eagle.visible = vis;
        if (!vis) continue;
        Ar.pointAt(hd, eP0);
        Ar.eagle.position.copy(eP0);
        Ar.pointAt(Math.min(1, hd + 0.01), eP1);
        eP0.applyMatrix4(spin.matrixWorld).project(camera);
        eP1.applyMatrix4(spin.matrixWorld).project(camera);
        Ar.eagleMat.rotation =
          Math.atan2(eP1.y - eP0.y, (eP1.x - eP0.x) * camera.aspect) - Math.PI / 2;
        Ar.eagleMat.opacity = na * sm(0, 0.08, hd) * (1 - sm(0.92, 1, hd));
      }

      // Scenes scale with the globe on screen, so marks keep their size
      const pxScale = dpr * Math.max(0.75, Math.min(1.4, (gsc / hh) * 1.6));
      storyFx.update({ time, weight, progress, presence: storyK, pixel: pxScale });

      // At the hero only the Cesium Earth shows: skip drawing this scene there
      const idle = handoff >= 1 && storyK < 0.002;
      if (idle) {
        if (!idleCleared) {
          renderer.clear();
          idleCleared = true;
        }
        return;
      }
      idleCleared = false;
      renderer.render(scene, camera);
    }


    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(safetyTimer);
      storyFx.dispose();
      introBridge.setLayout(null);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', layout);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onDrag);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      try {
        renderer.dispose();
      } catch {}
    };
  }, [accentColor, storyRef]);

  return (
    <div
      ref={stageRef}
      className="sticky top-0 h-[100vh] w-full overflow-hidden z-0 bg-[#05070B] pointer-events-auto"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Logo intro: the emblem builds here, beneath the globe */}
      <LogoIntro />

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute top-0 left-0 w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Atmospheric dark gradient scrims so text remains 100% legible */}
      <div className="omav-scrim absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          ref={scrimLRef}
          className="absolute inset-0 bg-gradient-to-r from-[#05070B]/85 via-[#05070B]/40 via-35% to-transparent to-60% max-md:bg-gradient-to-b max-md:from-[#05070B]/90 max-md:via-[#05070B]/50 max-md:to-transparent"
        />
        <div
          ref={scrimRRef}
          className="absolute inset-0 bg-gradient-to-l from-[#05070B]/85 via-[#05070B]/40 via-35% to-transparent to-60% max-md:hidden"
          style={{ opacity: 0 }}
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-[#05070B] to-transparent"
      />

      {/* Real Earth (CesiumJS) with the population density data */}
      <div
        ref={cesiumLayerRef}
        className="absolute inset-0 z-[1]"
        style={{ opacity: 0, pointerEvents: 'none' }}
        aria-label="Interactive globe of 2020 population density"
      >
        <ErrorBoundary>
        <Suspense fallback={null}>
          <PopulationGlobe
            home={home}
            explore={explore}
            suspended={suspended}
            onExploreChange={setExplore}
            apiRef={globeApi}
            onReady={() => {
              cesiumReady.current = true;
            }}
          />
        </Suspense>
        </ErrorBoundary>
      </div>

    </div>
  );
};
