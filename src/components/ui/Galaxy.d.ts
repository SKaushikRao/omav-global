import type React from 'react';

export interface GalaxyProps extends React.HTMLAttributes<HTMLDivElement> {
  focal?: [number, number];
  rotation?: [number, number];
  starSpeed?: number;
  density?: number;
  hueShift?: number;
  disableAnimation?: boolean;
  speed?: number;
  mouseInteraction?: boolean;
  glowIntensity?: number;
  saturation?: number;
  mouseRepulsion?: boolean;
  repulsionStrength?: number;
  twinkleIntensity?: number;
  rotationSpeed?: number;
  autoCenterRepulsion?: number;
  transparent?: boolean;
  lightMode?: boolean;
  starColors?: string[];
  starSize?: number;
  flareIntensity?: number;
  layers?: number;
  direction?: 'forward' | 'backward';
  clickWarp?: boolean;
  intro?: boolean;
  backgroundColor?: string;
  opacity?: number;
  dpr?: number;
}

declare const Galaxy: React.FC<GalaxyProps>;
export default Galaxy;
