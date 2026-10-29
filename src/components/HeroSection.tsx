import React from 'react';

interface HeroSectionProps {
  onExplore: () => void;
  onRequestBriefing: () => void;
  accentColor?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  const reveal = (delay: string) =>
    ({ 'data-intro-reveal': true, style: { '--intro-delay': delay } as React.CSSProperties }) as const;

  return (
    <div className="omav-hero-copy min-h-screen relative flex items-center pt-28 pb-20 max-md:items-start max-md:pt-[112px]">
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
        <div className="max-w-[min(720px,52vw)] max-md:max-w-none pointer-events-auto">
          <h1 className="m-0 uppercase text-[clamp(25px,7vw,40px)] md:text-[clamp(34px,4.3vw,64px)] leading-[0.98] tracking-[-0.02em]">
            <span {...reveal('0s')} className="block text-ice">
              Understanding complexity.
            </span>
            <span {...reveal('0.3s')} className="block mt-2 text-slate">
              Shaping what comes next.
            </span>
          </h1>

          <p
            {...reveal('0.75s')}
            className="mt-7 max-w-[420px] text-[15.5px] sm:text-[16px] leading-[1.65] text-ice/65"
          >
            AI-driven intelligence for governance and public systems, so institutions serve citizens more securely and
            efficiently.
          </p>

          {/* Instrument readout: what the globe is showing */}
          <div
            {...reveal('1.05s')}
            className="mt-10 font-mono text-[11.5px] leading-[1.6] text-slate"
          >
            Live layer: <span className="text-ice/80">Population Density, 2020, on a 1 km grid.</span> Source: NASA
            SEDAC.
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        {...reveal('2s')}
        className="absolute left-5 sm:left-8 lg:left-14 bottom-8 hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate select-none"
      >
        <span className="block w-9 h-px bg-slate/70 animate-omav-cue" />
        Scroll · Data to impact
      </div>
    </div>
  );
};
