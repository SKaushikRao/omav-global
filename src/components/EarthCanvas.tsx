import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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
  const [activeStage, setActiveStage] = useState<'globe' | 'scatter' | 'matrix' | 'beam'>('globe');

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
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setIsLoaded(true);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x05070b, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    camera.position.set(0, 0, 4.4);

    const SUN = new THREE.Vector3(-0.95, 0.25, 0.18).normalize();
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

    // Textures loader
    let texReady = false;
    let tLoad = 0;
    const mgr = new THREE.LoadingManager();
    mgr.onLoad = () => {
      if (!texReady) {
        texReady = true;
        tLoad = performance.now();
        setIsLoaded(true);
      }
    };

    const loader = new THREE.TextureLoader(mgr);
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);

    const loadTex = (path: string) => {
      const t = loader.load(
        path,
        () => {},
        undefined,
        () => {
          // If texture fails to load, mark ready anyway so user isn't stuck
          if (!texReady) {
            texReady = true;
            setIsLoaded(true);
          }
        }
      );
      t.anisotropy = aniso;
      return t;
    };

    const URL_DAY = '/assets/aistudio/2419145b1a56f93908364cdba80a4980_af3c5cdd.jpg';
    const URL_NIGHT = '/assets/aistudio/3b759647416f7940961fc69f639ab848_48c6f763.jpg';
    const URL_SPEC = '/assets/aistudio/616359cbb216d7811129f71760995474_5a027277.jpg';

    const dayTex = loadTex(URL_DAY);
    const nightTex = loadTex(URL_NIGHT);
    const specTex = loadTex(URL_SPEC);

    // Fallback safety timeout for texture readiness
    const safetyTimer = setTimeout(() => {
      if (!texReady) {
        texReady = true;
        tLoad = performance.now();
        setIsLoaded(true);
      }
    }, 2500);

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

    // Earth Shader Material
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        dayMap: { value: dayTex },
        nightMap: { value: nightTex },
        specMap: { value: specTex },
        uSun: { value: SUN },
        uReveal: { value: 0 },
        uFade: { value: 1 },
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
        uniform sampler2D specMap;
        uniform vec3 uSun;
        uniform float uReveal;
        uniform float uFade;
        varying vec2 vUv;
        varying vec3 vN;
        varying vec3 vW;

        void main(){
          vec3 n = normalize(vN);
          vec3 v = normalize(cameraPosition - vW);
          float ndl = dot(n, uSun);

          vec3 day = texture2D(dayMap, vUv).rgb;
          float l = dot(day, vec3(0.299, 0.587, 0.114));
          vec3 dayCol = mix(vec3(l), day, 0.5) * vec3(0.8, 0.9, 1.0);
          dayCol = dayCol / (1.0 + dayCol * 0.9) * 1.35;

          float lit = smoothstep(-0.1, 0.6, ndl);
          vec3 col = dayCol * (0.02 + 0.5 * lit);

          vec3 night = texture2D(nightMap, vUv).rgb;
          float dark = 1.0 - smoothstep(-0.22, 0.12, ndl);
          col += pow(night, vec3(1.25)) * vec3(1.0, 0.85, 0.62) * 1.7 * dark;

          float spec = texture2D(specMap, vUv).r;
          vec3 h = normalize(uSun + v);
          col += spec * pow(max(dot(n, h), 0.0), 48.0) * 0.32 * vec3(0.72, 0.86, 1.0) * lit;

          float fres = pow(1.0 - max(dot(n, v), 0.0), 2.6);
          col += vec3(0.42, 0.68, 0.84) * fres * (0.08 + 0.42 * smoothstep(-0.35, 0.6, ndl));

          gl_FragColor = vec4(col * uReveal, uFade);
        }
      `,
      transparent: true,
    });

    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), earthMat);
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
        float a = (0.14 + tail * 0.95) * uAlpha;
        gl_FragColor = vec4(uColor, a);
      }
    `;

    const arcs = PAIRS.map((pr, i) => {
      const a = ll(SITES[pr[0]][0], SITES[pr[0]][1], 1).normalize();
      const b = ll(SITES[pr[1]][0], SITES[pr[1]][1], 1).normalize();
      const ang = a.angleTo(b);
      const h = 0.05 + ang * 0.16;
      const N = 96;
      const sa = Math.sin(ang);
      const pos = new Float32Array((N + 1) * 3);
      const at = new Float32Array(N + 1);

      for (let j = 0; j <= N; j++) {
        const t = j / N;
        const w1 = Math.sin((1 - t) * ang) / sa;
        const w2 = Math.sin(t * ang) / sa;
        const rr = 1.004 + h * Math.sin(Math.PI * t);
        pos[j * 3] = (a.x * w1 + b.x * w2) * rr;
        pos[j * 3 + 1] = (a.y * w1 + b.y * w2) * rr;
        pos[j * 3 + 2] = (a.z * w1 + b.z * w2) * rr;
        at[j] = t;
      }

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
      return { line, mat, speed: 0.15 + (i % 3) * 0.045, offset: i * 0.29 };
    });

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

    // Particle field shaders
    const P_VS = `
      attribute vec3 aG;
      attribute vec3 aC;
      attribute float aR;
      attribute float aA;
      attribute float aS;
      attribute float aZ;
      attribute float aK;
      uniform mat4 uGlobe;
      uniform vec3 uNet;
      uniform float uTilt;
      uniform float uTime;
      uniform float uScatter;
      uniform float uOrder;
      uniform float uConverge;
      uniform float uImpact;
      uniform float uAlpha;
      uniform float uPix;
      uniform float uDisc;
      uniform float uSweep;
      varying float vA;
      varying float vK;
      varying float vB;
      ${ROTX}
      float ease(float x){ x = clamp(x, 0.0, 1.0); return x * x * (3.0 - 2.0 * x); }
      void main(){
        vec3 g = (uGlobe * vec4(aG * 1.008, 1.0)).xyz;
        float t = uTime;
        vec3 drift = vec3(sin(t * 0.13 + aS * 40.0), cos(t * 0.11 + aS * 25.0), sin(t * 0.09 + aS * 13.0)) * 0.05;
        vec3 c = uNet + aC * max(uDisc, 0.5) + drift;
        float r = aR * uDisc;
        float ang = aA + t * (0.10 / (0.2 + aR));
        float sel = 1.0 - smoothstep(uConverge - 0.05, uConverge, aS);
        float f = fract(t * (0.05 + aS * 0.04) + aS * 17.0);
        float k = smoothstep(0.0, 0.72, f);
        float aIn = ang + k * 5.0;
        vec3 ringL = vec3(cos(ang) * r, 0.0, sin(ang) * r);
        vec3 inL = vec3(cos(aIn) * r * (1.0 - k), 0.0, sin(aIn) * r * (1.0 - k));
        float rise = pow(smoothstep(0.68, 1.0, f), 1.4) * 2.6 * max(uDisc, 0.55) * sel;
        vec3 Lp = mix(ringL, inL, sel);
        float wr = fract(t * 0.18) * 1.9;
        float wave = exp(-pow((aR - wr) * 9.0, 2.0)) * uImpact * (1.0 - sel);
        Lp.y += wave * 0.05;
        vec3 ringP = uNet + rx(Lp, uTilt) + rx(vec3(0.0, rise, 0.0), uTilt * 0.25);
        float s1 = ease(uScatter * 1.6 - aS * 0.6);
        float s2 = ease(uOrder * 1.6 - fract(aS * 7.31) * 0.6);
        float tr = sin(s2 * 3.14159);
        vec3 p = mix(g, c, s1);
        p = mix(p, ringP, s2) + vec3(sin(aS * 91.0), cos(aS * 53.0), sin(aS * 27.0)) * tr * 0.18;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.75 + 0.25 * sin(t * (1.0 + aS * 2.0) + aS * 60.0);
        float sw = pow(0.5 + 0.5 * cos(ang - t * 0.35 - aR * 3.0), 10.0) * uSweep * s2;
        float inBeam = sel * smoothstep(0.6, 0.75, f) * s2;
        vB = tw * (0.75 + sw * 1.4 + wave * 2.0 + inBeam * 1.2);
        vA = uAlpha * (0.35 + 0.65 * s1);
        vK = aK;
        gl_PointSize = aZ * uPix * (4.4 / -mv.z);
      }
    `;

    const P_FS = `
      uniform vec3 uSilver;
      uniform vec3 uCyan;
      varying float vA;
      varying float vK;
      varying float vB;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.05, d);
        gl_FragColor = vec4(mix(uSilver, uCyan, vK) * vB, a * vA);
      }
    `;

    const pMat = new THREE.ShaderMaterial({
      uniforms: {
        uGlobe: { value: new THREE.Matrix4() },
        uNet: U.uNet,
        uTilt: U.uTilt,
        uTime: U.uTime,
        uScatter: { value: 0 },
        uOrder: { value: 0 },
        uConverge: { value: 0 },
        uImpact: U.uImpact,
        uAlpha: { value: 0 },
        uPix: { value: 1 },
        uDisc: U.uDisc,
        uSweep: U.uSweep,
        uSilver: { value: silver },
        uCyan: { value: accent },
      },
      vertexShader: P_VS,
      fragmentShader: P_FS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const isMobile = (stage.clientWidth || 1200) < 760;

    function buildParticles(img: HTMLImageElement | null) {
      if (!alive) return;
      const IW = 512;
      const IH = 256;
      let data: Uint8ClampedArray | null = null;
      if (img) {
        try {
          const c = document.createElement('canvas');
          c.width = IW;
          c.height = IH;
          const cx = c.getContext('2d');
          if (cx) {
            cx.drawImage(img, 0, 0, IW, IH);
            data = cx.getImageData(0, 0, IW, IH).data;
          }
        } catch {
          data = null;
        }
      }

      const N = isMobile ? 5200 : 9600;
      const aG = new Float32Array(N * 3);
      const aC = new Float32Array(N * 3);
      const aR = new Float32Array(N);
      const aA = new Float32Array(N);
      const aS = new Float32Array(N);
      const aZ = new Float32Array(N);
      const aK = new Float32Array(N);

      const RINGS = 44;
      const R0 = 0.14;
      const DR = 0.032;
      const weights: number[] = [];
      let wsum = 0;

      for (let k = 0; k < RINGS; k++) {
        const w = (R0 + k * DR) * (0.55 + 0.45 * Math.random());
        weights.push(w);
        wsum += w;
      }

      for (let i = 0; i < N; i++) {
        let lat = 0;
        let lon = 0;
        let tries = 0;
        while (true) {
          const u = Math.random();
          const v = Math.random();
          lat = (Math.asin(2 * v - 1) * 180) / Math.PI;
          lon = u * 360 - 180;
          if (!data) break;
          const px = Math.min(IW - 1, Math.floor(u * IW));
          const py = Math.min(IH - 1, Math.floor(((90 - lat) / 180) * IH));
          // Specular map has high values on water, low on land; sample predominantly on landmass
          if (data[(py * IW + px) * 4] < 90 || tries > 14 || Math.random() < 0.05) break;
          tries += 1;
        }

        const gp = ll(lat, lon, 1);
        aG[i * 3] = gp.x;
        aG[i * 3 + 1] = gp.y;
        aG[i * 3 + 2] = gp.z;

        const z = 2 * Math.random() - 1;
        const th = Math.random() * Math.PI * 2;
        const sq = Math.sqrt(1 - z * z);
        const d = 0.45 + Math.pow(Math.random(), 0.7) * 1.55;

        aC[i * 3] = sq * Math.cos(th) * d * 1.3;
        aC[i * 3 + 1] = sq * Math.sin(th) * d * 0.75;
        aC[i * 3 + 2] = z * d * 0.6;

        let pick = Math.random() * wsum;
        let kk = 0;
        while (kk < RINGS - 1 && pick > weights[kk]) {
          pick -= weights[kk];
          kk += 1;
        }

        aR[i] = R0 + kk * DR + (Math.random() - 0.5) * 0.006;
        aA[i] = Math.random() * Math.PI * 2;
        aS[i] = Math.random();
        aZ[i] = Math.random() < 0.06 ? 2.6 + Math.random() * 1.6 : 0.9 + Math.random() * 1.0;
        aK[i] = Math.random() < 0.2 ? 1 : 0;
      }

      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(aG, 3));
      g.setAttribute('aG', new THREE.BufferAttribute(aG, 3));
      g.setAttribute('aC', new THREE.BufferAttribute(aC, 3));
      g.setAttribute('aR', new THREE.BufferAttribute(aR, 1));
      g.setAttribute('aA', new THREE.BufferAttribute(aA, 1));
      g.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
      g.setAttribute('aZ', new THREE.BufferAttribute(aZ, 1));
      g.setAttribute('aK', new THREE.BufferAttribute(aK, 1));

      const pts = new THREE.Points(g, pMat);
      pts.frustumCulled = false;
      pts.renderOrder = 4;
      scene.add(pts);
    }

    const specImg = new Image();
    specImg.crossOrigin = 'anonymous';
    specImg.onload = () => buildParticles(specImg);
    specImg.onerror = () => buildParticles(null);
    specImg.src = URL_SPEC;

    // Concentric Ring Lines on the disc
    const RL_N = 88;
    const RL_SEG = 180;
    const rlCount = RL_N * RL_SEG * 2;
    const rlPos = new Float32Array(rlCount * 3);
    const rlR = new Float32Array(rlCount);
    const rlA = new Float32Array(rlCount);
    let ix = 0;

    for (let rk = 0; rk < RL_N; rk++) {
      const rad = 0.12 + rk * 0.0165;
      for (let sg = 0; sg < RL_SEG; sg++) {
        rlR[ix] = rad;
        rlA[ix] = (sg / RL_SEG) * Math.PI * 2;
        ix += 1;
        rlR[ix] = rad;
        rlA[ix] = ((sg + 1) / RL_SEG) * Math.PI * 2;
        ix += 1;
      }
    }

    const rlGeo = new THREE.BufferGeometry();
    rlGeo.setAttribute('position', new THREE.BufferAttribute(rlPos, 3));
    rlGeo.setAttribute('aR', new THREE.BufferAttribute(rlR, 1));
    rlGeo.setAttribute('aA', new THREE.BufferAttribute(rlA, 1));

    const rlMat = new THREE.ShaderMaterial({
      uniforms: {
        uNet: U.uNet,
        uTilt: U.uTilt,
        uDisc: U.uDisc,
        uTime: U.uTime,
        uRings: U.uRings,
        uSweep: U.uSweep,
        uImpact: U.uImpact,
        uColor: { value: silver },
      },
      vertexShader: `
        attribute float aR;
        attribute float aA;
        uniform vec3 uNet;
        uniform float uTilt;
        uniform float uDisc;
        uniform float uTime;
        uniform float uRings;
        uniform float uSweep;
        uniform float uImpact;
        varying float vAl;
        ${ROTX}
        void main(){
          vec3 Lp = vec3(cos(aA) * aR * uDisc, 0.0, sin(aA) * aR * uDisc);
          vec3 p = uNet + rx(Lp, uTilt);
          float sw = pow(0.5 + 0.5 * cos(aA - uTime * 0.35 - aR * 3.0), 10.0) * uSweep;
          float wr = fract(uTime * 0.18) * 1.9;
          float wave = exp(-pow((aR - wr) * 9.0, 2.0)) * uImpact;
          float edge = smoothstep(0.1, 0.32, aR) * (1.0 - smoothstep(1.25, 1.56, aR));
          float h = fract(sin(aR * 913.7) * 43758.5);
          vAl = uRings * edge * (0.035 + 0.07 * h + sw * 0.32 + wave * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAl;
        void main(){
          gl_FragColor = vec4(uColor, vAl);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const ringLines = new THREE.LineSegments(rlGeo, rlMat);
    ringLines.frustumCulled = false;
    ringLines.renderOrder = 4;
    scene.add(ringLines);

    // Spiraling data arms
    const SP_N = 16;
    const SP_SEG = 140;
    const spCount = SP_N * SP_SEG * 2;
    const spPos = new Float32Array(spCount * 3);
    const spT = new Float32Array(spCount);
    const spO = new Float32Array(spCount);
    let jx = 0;

    for (let si = 0; si < SP_N; si++) {
      const a0 = (si / SP_N) * Math.PI * 2;
      const off = Math.random();
      for (let sj = 0; sj < SP_SEG; sj++) {
        for (let e = 0; e < 2; e++) {
          const tt = (sj + e) / SP_SEG;
          const rr2 = 1.5 * Math.pow(1 - tt, 1.15) + 0.03;
          const aa2 = a0 + tt * 3.4;
          spPos[jx * 3] = Math.cos(aa2) * rr2;
          spPos[jx * 3 + 1] = 0;
          spPos[jx * 3 + 2] = Math.sin(aa2) * rr2;
          spT[jx] = tt;
          spO[jx] = off;
          jx += 1;
        }
      }
    }

    const spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
    spGeo.setAttribute('aT', new THREE.BufferAttribute(spT, 1));
    spGeo.setAttribute('aO', new THREE.BufferAttribute(spO, 1));

    const spMat = new THREE.ShaderMaterial({
      uniforms: {
        uNet: U.uNet,
        uTilt: U.uTilt,
        uDisc: U.uDisc,
        uTime: U.uTime,
        uPaths: U.uPaths,
        uColor: { value: accent },
      },
      vertexShader: `
        attribute float aT;
        attribute float aO;
        uniform vec3 uNet;
        uniform float uTilt;
        uniform float uDisc;
        varying float vT;
        varying float vO;
        ${ROTX}
        void main(){
          vT = aT;
          vO = aO;
          vec3 p = uNet + rx(position * uDisc, uTilt);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uPaths;
        uniform vec3 uColor;
        varying float vT;
        varying float vO;
        void main(){
          float head = fract(uTime * 0.11 + vO);
          float tail = smoothstep(head - 0.3, head, vT) * step(vT, head);
          gl_FragColor = vec4(uColor, (0.04 + tail * 0.7) * uPaths * smoothstep(0.0, 0.08, vT));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const spirals = new THREE.LineSegments(spGeo, spMat);
    spirals.frustumCulled = false;
    spirals.renderOrder = 4;
    scene.add(spirals);

    // Vertical Strategy Beam
    const beamGeo = new THREE.PlaneGeometry(0.7, 3.6);
    beamGeo.translate(0, 1.8, 0);

    const beamMat = new THREE.ShaderMaterial({
      uniforms: {
        uBeam: U.uBeam,
        uTime: U.uTime,
        uCyan: { value: accent },
      },
      vertexShader: UV_VS,
      fragmentShader: `
        uniform float uBeam;
        uniform float uTime;
        uniform vec3 uCyan;
        varying vec2 vUv;
        void main(){
          float x = abs(vUv.x - 0.5) * 2.0;
          float core = exp(-x * x * 120.0);
          float glow = exp(-x * x * 10.0) * 0.22;
          float y = vUv.y;
          float vf = smoothstep(0.0, 0.04, y) * pow(1.0 - y, 1.6);
          float sh = 0.82 + 0.18 * sin(y * 46.0 - uTime * 4.5);
          gl_FragColor = vec4(mix(uCyan, vec3(1.0), clamp(core * 1.2, 0.0, 1.0)), (core * 1.3 + glow) * vf * sh * uBeam);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.frustumCulled = false;
    beam.renderOrder = 5;
    scene.add(beam);

    // Central Core Glow
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        uA: { value: 0 },
        uCyan: { value: accent },
      },
      vertexShader: UV_VS,
      fragmentShader: `
        uniform float uA;
        uniform vec3 uCyan;
        varying vec2 vUv;
        void main(){
          float d = length(vUv - 0.5) * 2.0;
          float a = (exp(-d * d * 18.0) * 0.9 + exp(-d * d * 3.0) * 0.16) * uA;
          gl_FragColor = vec4(mix(uCyan, vec3(1.0), exp(-d * d * 30.0)), a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat);
    glow.renderOrder = 5;
    scene.add(glow);

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

    const cur = {
      scatter: 0,
      order: 0,
      fade: 1,
      palpha: 0,
      net: 1,
      rings: 0,
      paths: 0,
      sweep: 0,
      conv: 0,
      beam: 0,
      impact: 0,
    };

    const t0 = performance.now();
    let last = t0;

    function frame(now: number) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;

      if (document.hidden) return;
      if (!story || !stage) return;

      const rect = story.getBoundingClientRect();
      const vh = window.innerHeight || L.H;
      if (rect.bottom < -40 || rect.top > vh + 40) return;

      const tIntro = prefersReducedMotion ? 10 : texReady ? (now - tLoad) / 1000 : 0;
      const time = (now - t0) / 1000;
      const SH = stage.clientHeight || L.H;
      const u = Math.max(0, -rect.top / SH);

      // Determine current visual stage for UI pill or hints
      if (u < 0.8) {
        setActiveStage('globe');
      } else if (u < 2.0) {
        setActiveStage('scatter');
      } else if (u < 3.2) {
        setActiveStage('matrix');
      } else {
        setActiveStage('beam');
      }

      const tg = {
        scatter: sm(0.18, 1.2, u),
        order: sm(1.5, 2.35, u),
        fade: 1 - sm(0.2, 0.8, u),
        palpha: sm(0.12, 0.45, u),
        net: 1 - sm(0.04, 0.4, u),
        rings: sm(1.9, 2.6, u),
        paths: sm(2.6, 3.2, u) * (1 - 0.6 * sm(4.2, 4.7, u)),
        sweep: sm(2.5, 3.1, u),
        conv: 0.45 * sm(3.3, 4.1, u),
        beam: sm(3.5, 4.5, u),
        impact: sm(4.2, 4.7, u),
      };

      const kf = 1 - Math.exp(-dt * 5);
      for (const key in tg) {
        (cur as any)[key] += ((tg as any)[key] - (cur as any)[key]) * kf;
      }

      const rev = sm(0, 2.4, tIntro);
      const netIn = sm(2.0, 3.6, tIntro);
      const draw = sm(2.2, 4.4, tIntro);
      const settle = 1 - Math.pow(1 - Math.min(1, tIntro / 5.5), 3);

      if (!dragging) {
        vel *= Math.pow(0.05, dt);
        yaw += vel * dt * 60;
        pitch *= Math.pow(0.2, dt);
      }

      const pk = 1 - Math.exp(-dt * 2.5);
      pmx += (mx - pmx) * pk;
      pmy += (my - pmy) * pk;

      spin.rotation.y = BASE + time * (prefersReducedMotion ? 0.008 : 0.028) - (1 - settle) * 0.8 + yaw;
      root.rotation.y = pmx * 0.08;
      root.rotation.x = pmy * 0.05 + pitch;
      root.position.set(L.gx, L.gy, 0);
      root.scale.setScalar(L.gs * (0.93 + 0.07 * rev) * (1 - 0.05 * (1 - cur.fade)));

      earthMat.uniforms.uReveal.value = rev;
      earthMat.uniforms.uFade.value = cur.fade;
      earth.visible = cur.fade > 0.004;
      earthMat.depthWrite = cur.fade > 0.55;
      atmoMat.uniforms.uA.value = rev * cur.fade;
      atmo.visible = earth.visible;

      const na = netIn * cur.net;
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
        const A = arcs[ai];
        A.line.visible = show;
        A.mat.uniforms.uDraw.value = draw;
        A.mat.uniforms.uAlpha.value = na * 0.85;
        A.mat.uniforms.uHead.value = ((time * A.speed + A.offset) % 1) * 1.35;
      }

      orbitMat.uniforms.uA.value = na * 0.14;
      orbit1.visible = show;
      orbit2.visible = show;

      U.uTime.value = time;
      NET.set(L.nx, L.ny, 0);
      U.uDisc.value = L.disc;
      U.uRings.value = cur.rings;
      U.uSweep.value = cur.sweep;
      U.uImpact.value = cur.impact;
      U.uPaths.value = cur.paths;
      U.uBeam.value = cur.beam;

      ringLines.visible = cur.rings > 0.002;
      spirals.visible = cur.paths > 0.002;

      beam.visible = cur.beam > 0.002;
      beam.position.copy(NET);
      beam.rotation.x = TILT * 0.25;
      beam.scale.set(Math.max(L.disc, 0.5) * 1.1, Math.max(L.disc, 0.55) * 1.15, 1);

      glow.position.copy(NET);
      glow.scale.setScalar(L.disc * 1.5);
      glowMat.uniforms.uA.value = cur.rings * 0.3 + cur.beam * 0.8;
      glow.visible = glowMat.uniforms.uA.value > 0.002;

      scene.updateMatrixWorld();
      const P = pMat.uniforms;
      P.uGlobe.value.copy(spin.matrixWorld);
      P.uScatter.value = cur.scatter;
      P.uOrder.value = cur.order;
      P.uConverge.value = cur.conv;
      P.uAlpha.value = cur.palpha * rev;
      P.uPix.value = dpr * Math.max(0.8, L.H / 900);

      renderer.render(scene, camera);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(safetyTimer);
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
      <canvas
        ref={canvasRef}
        aria-label="Interactive 3D Earth and Global Intelligence Network"
        className="absolute top-0 left-0 w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Atmospheric dark gradient scrims so text remains 100% legible */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#05070B]/85 via-[#05070B]/40 to-transparent max-md:bg-gradient-to-t max-md:from-[#05070B] max-md:via-[#05070B]/60 max-md:to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-[#05070B] to-transparent"
      />

      {/* Subtle interaction cue in bottom right */}
      <div
        className="absolute right-6 bottom-8 hidden lg:flex items-center gap-2.5 text-[11px] tracking-widest text-[#8C96A6] pointer-events-none select-none uppercase font-mono"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#8CC8D8]/70 animate-pulse" />
        <span>Drag to rotate · Scroll to transform</span>
        <span className="text-[#AEB7C3]/40">|</span>
        <span className="text-[#8CC8D8] font-semibold">{activeStage.toUpperCase()}</span>
      </div>
    </div>
  );
};
