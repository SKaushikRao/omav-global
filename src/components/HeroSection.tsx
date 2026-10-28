import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onExplore: () => void;
  onRequestBriefing: () => void;
  accentColor?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore,
  onRequestBriefing,
  accentColor = '#8CC8D8',
}) => {
  return (
    <div className="omav-hero-copy min-h-screen relative flex items-center pt-24 pb-16">
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
        <div className="max-w-[760px] pointer-events-auto">
          {/* Eyebrow */}
          <div
            data-intro-reveal
            style={{ '--intro-delay': '0s' } as React.CSSProperties}
            className="flex items-center gap-3.5 mb-7"
          >
            <span
              className="block w-7 h-[1px]"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-xs tracking-[0.32em] text-[#9AA4B2] font-medium uppercase font-mono">
              OMAV GLOBAL · PUBLIC SYSTEMS TRANSFORMATION
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-medium leading-[1.04] tracking-[-0.035em] text-[#F2F5F9] m-0">
            <span
              data-intro-reveal
              style={{ '--intro-delay': '0s' } as React.CSSProperties}
              className="block text-[#F2F5F9]"
            >
              Understanding complexity.
            </span>
            <span
              data-intro-reveal
              style={{ '--intro-delay': '0.3s' } as React.CSSProperties}
              className="block text-[#8E99A8] mt-1.5"
            >
              Shaping what comes next.
            </span>
          </h1>

          {/* Core Proposition */}
          <p
            data-intro-reveal
            style={{ '--intro-delay': '0.75s' } as React.CSSProperties}
            className="mt-7 text-base sm:text-lg text-[#AEB7C3] leading-relaxed max-w-[620px] font-normal">
            We are transforming governance and public systems through AI-driven intelligence and technology solutions. We bridge the gap between private innovation and public sector transformation, helping governments and institutions serve citizens more securely and efficiently.
          </p>

          {/* Subdiscipline Strip */}
          <div
            data-intro-reveal
            style={{ '--intro-delay': '0.75s' } as React.CSSProperties}
            className="mt-8 pt-5 border-t border-[#DCE4EE]/12 max-w-[560px] text-xs sm:text-sm tracking-wide text-[#8C96A6] font-mono">
            Intelligence · Technology · Policy · Global Strategy
          </div>

          {/* Action CTAs */}
          <div
            data-intro-reveal
            style={{ '--intro-delay': '1.05s' } as React.CSSProperties}
            className="mt-9 flex flex-wrap gap-3.5 items-center">
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-2.5 h-12 px-6 rounded-[3px] bg-[#E9EDF3] text-[#05070B] text-sm font-medium tracking-wide transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-white/10 cursor-pointer group"
            >
              <span>Explore OMAV</span>
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>

            <button
              onClick={onRequestBriefing}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-[3px] border border-[#E9EDF3]/25 text-[#E9EDF3] text-sm font-medium tracking-wide transition-all duration-200 hover:border-[#E9EDF3]/70 hover:bg-[#E9EDF3]/5 cursor-pointer"
            >
              Contact Advisory
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator cue */}
      <div
        aria-hidden="true"
        data-intro-reveal
        style={{ '--intro-delay': '2s' } as React.CSSProperties}
        className="absolute left-5 sm:left-8 lg:left-14 bottom-8 hidden sm:flex items-center gap-3.5 text-[11px] tracking-[0.28em] text-[#8C96A6] select-none font-mono"
      >
        <span className="block w-9 h-[1px] bg-[#AEB7C3] animate-omav-cue" />
        <span>SCROLL TO EXPLORE TRANSFORMATION</span>
      </div>
    </div>
  );
};
