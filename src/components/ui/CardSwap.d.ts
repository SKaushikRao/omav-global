import type React from 'react';

export interface CardSwapItem {
  title?: string;
  image?: string;
  alt?: string;
  icon?: React.ReactNode;
}

export interface CardSwapHandle {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

export interface CardSwapProps {
  items?: CardSwapItem[];
  width?: number;
  height?: number;
  cardDistance?: number;
  verticalDistance?: number;
  depth?: number;
  skewAmount?: number;
  visibleCards?: number;
  delay?: number;
  autoplay?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  speed?: number;
  bounce?: number;
  parallax?: number;
  hoverSpread?: number;
  dim?: number;
  cardRadius?: number;
  intro?: boolean;
  theme?: 'dark' | 'light' | 'omav';
  onCardClick?: (index: number) => void;
  onChange?: (frontIndex: number) => void;
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
}

export const Card: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & { customClass?: string } & React.RefAttributes<HTMLDivElement>
>;

declare const CardSwap: React.ForwardRefExoticComponent<CardSwapProps & React.RefAttributes<CardSwapHandle>>;
export default CardSwap;
