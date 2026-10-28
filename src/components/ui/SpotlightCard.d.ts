import type React from 'react';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
  intensity?: number;
  spotlightSize?: number;
  softness?: number;
  shape?: 'circle' | 'beam';
  borderGlow?: number;
  proximity?: number;
  smoothing?: number;
  ambient?: boolean;
  flare?: boolean;
  grain?: number;
  theme?: 'dark' | 'light';
}

declare const SpotlightCard: React.FC<SpotlightCardProps>;
export default SpotlightCard;
