import React from 'react';
import { ArrowRight } from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';
import { LightTunnel } from '../LightTunnel';

// Building blocks shared by the inner pages (Solutions, Expertise, Approach,
// About): a type-led hero over the light tunnel, section headings, spotlight
// cards and the closing call to action.

export const Container: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 ${className}`}>{children}</div>
);

// Full-page animated backdrop (Galaxy, LightRays…) fixed behind the content,
// with a scrim that keeps text legible as it scrolls over
export const PageBackdrop: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
    {children}
    <div className="absolute inset-0 bg-gradient-to-b from-abyss/10 via-abyss/45 to-abyss/75" />
  </div>
);

// The page's one orchestrated moment: by default the tunnel runs behind the
// hero; pages with their own full-page backdrop turn it off
export const PageHero: React.FC<{
  title: React.ReactNode;
  lede: React.ReactNode;
  meta?: string[];
  aside?: React.ReactNode;
  tunnel?: boolean;
}> = ({ title, lede, meta, aside, tunnel = true }) => (
  <header className="relative overflow-hidden border-b border-hairline">
    {tunnel && (
    <div className="absolute inset-0" aria-hidden="true">
      <LightTunnel
        cableColor="#344860"
        pulseColor="#8CC8D8"
        tunnelColor="#05070B"
        tunnelOpacity={0.25}
        speed={0.12}
        flowDirection="inward"
        pulseSpeed={2.2}
        pulseLength={0.32}
        pulseBlend={0.6}
        pulseWidth={1.2}
        pulseDensity={0.55}
        cableCount={56}
        thickness={0.35}
        rimWidth={0.2}
        waviness={0.3}
        sway={0.45}
        bend={0.38}
        size={1.05}
        centerX={0.32}
        glow={1.2}
        fadeNear={0.35}
        fadeFar={2.2}
        brightness={1.05}
        colorVariance
        grain
        grainIntensity={0.04}
        opacity={0.7}
        mouseInteraction
        mouseStrength={0.12}
        clickSurge
        intro
        dpr={1}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/80 to-abyss/20" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-abyss to-transparent" />
    </div>
    )}
    <Container className="relative pt-40 pb-20 sm:pt-48 sm:pb-28">
      <div className={aside ? 'grid lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] gap-12 lg:gap-16 items-end' : ''}>
        <div className="max-w-[860px]">
          <h1 className="text-[clamp(32px,4.6vw,68px)] leading-[1.02] tracking-[-0.025em] text-ice">{title}</h1>
          <p className="mt-7 max-w-[640px] text-[17px] sm:text-[19px] leading-[1.6] text-ice/70">{lede}</p>
          {meta && (
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] text-slate">
              {meta.map((m) => (
                <li key={m} className="flex gap-2.5">
                  <Bullet />
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>
        {aside}
      </div>
    </Container>
  </header>
);

export const Section: React.FC<{
  id?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ id, title, lede, children, className = '' }) => (
  <section id={id} className={`py-20 sm:py-28 border-b border-hairline ${className}`}>
    <Container>
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-16 mb-12 sm:mb-16 items-end">
        <h2 className="text-[clamp(26px,2.8vw,40px)] leading-[1.08] text-ice max-w-[560px]">{title}</h2>
        {lede && <p className="max-w-[560px] text-[16px] leading-[1.65] text-ice/65 lg:justify-self-end">{lede}</p>}
      </div>
      {children}
    </Container>
  </section>
);

// Spotlight card in the brand palette
export const Card: React.FC<{ className?: string; children: React.ReactNode; as?: 'div' | 'article' }> = ({
  className = '',
  children,
  as,
}) => (
  <SpotlightCard
    className={`omav-card ${className}`}
    theme="dark"
    spotlightColor="#8CC8D8"
    intensity={0.14}
    spotlightSize={300}
    softness={0.7}
    borderGlow={0.7}
    proximity={80}
    smoothing={0.3}
    flare
    role={as === 'article' ? 'article' : undefined}
    style={
      {
        '--spotlight-card-surface': 'rgb(11 16 24 / 0.88)',
        '--spotlight-card-border': 'rgb(220 228 238 / 0.1)',
      } as React.CSSProperties
    }
  >
    {children}
  </SpotlightCard>
);

// The one bullet used across the site: a small signal dot, centred on the
// first line of its item
export const Bullet: React.FC = () => <span className="omav-bullet" aria-hidden="true" />;

export const Mono: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`font-mono text-[11.5px] text-slate ${className}`}>{children}</div>
);

export const CtaBand: React.FC<{
  title: React.ReactNode;
  body: React.ReactNode;
  action: string;
  onAction: () => void;
}> = ({ title, body, action, onAction }) => (
  <section className="py-20 sm:py-24">
    <Container>
      <Card className="!p-8 sm:!p-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-[720px]">
            <h2 className="text-[clamp(24px,2.4vw,34px)] leading-[1.12] text-ice">{title}</h2>
            <p className="mt-4 text-[16px] leading-[1.65] text-ice/65">{body}</p>
          </div>
          <button type="button" onClick={onAction} className="btn btn-primary shrink-0 self-start lg:self-auto">
            {action}
            <span className="btn-icon" aria-hidden="true">
              <ArrowRight size={15} />
            </span>
          </button>
        </div>
      </Card>
    </Container>
  </section>
);
