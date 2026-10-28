import type React from 'react';

export interface GlowCursorProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  secondaryColor?: string;
  intensity?: number;
  trailWidth?: number;
  linger?: number;
  glow?: number;
  hotspot?: number;
  followSpeed?: number;
  grain?: number;
  clickBurst?: boolean;
  quality?: 'low' | 'medium' | 'high';
  theme?: 'dark' | 'light';
  blendMode?: React.CSSProperties['mixBlendMode'];
  maxDevicePixelRatio?: number;
  enabled?: boolean;
}

declare const GlowCursor: React.FC<GlowCursorProps>;
export default GlowCursor;
