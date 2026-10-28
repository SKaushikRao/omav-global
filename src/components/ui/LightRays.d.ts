import type React from 'react';

export interface LightRaysProps {
  raysOrigin?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'left'
    | 'right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  rayDensity?: number;
  tilt?: number;
  raySharpness?: number;
  glow?: number;
  haze?: number;
  atmosphere?: number;
  intensity?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  cursorShadow?: boolean;
  clickPulse?: boolean;
  noiseAmount?: number;
  distortion?: number;
  intro?: boolean;
  lightMode?: boolean;
  opacity?: number;
  maxDevicePixelRatio?: number;
  className?: string;
  style?: React.CSSProperties;
}

declare const LightRays: React.FC<LightRaysProps>;
export default LightRays;
