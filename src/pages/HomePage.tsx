import React from 'react';
import { EarthCanvas } from '../components/EarthCanvas';
import { HeroSection } from '../components/HeroSection';
import { HowWeThinkSection } from '../components/HowWeThinkSection';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const PORTAL = [
  {
    id: 'solutions',
    title: 'Solutions & systems',
    body: 'AI voice agents, contract intelligence, predictive policing and constitutional recruitment engines in production.',
  },
  {
    id: 'expertise',
    title: 'Expertise',
    body: 'Six advisory domains where artificial intelligence, statutory law and public policy intersect.',
  },
  {
    id: 'approach',
    title: 'Approach',
    body: 'Intelligence, advisory, global perspective and institutional credibility behind every engagement.',
  },
  {
    id: 'about',
    title: 'About & founders',
    body: 'The OMAV mark, the ॥ अधिकाराणां कृते ॥ motto, and the leadership of Priya Lalwani and Varad Ozarkar.',
  },
];

interface HomePageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  accentColor = '#8CC8D8',
  onRequestBriefing,
  onNavigate,
}) => {
  const storyRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToHow = () => {
    const el = document.getElementById('how');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* 3D Earth Interactive Experience */}
      <section id="top" ref={storyRef} className="relative">
        <EarthCanvas accentColor={accentColor} storyRef={storyRef} />

        {/* Scrollable Overlay Text */}
        <div className="relative z-10 -mt-[100vh] pointer-events-none">
          <HeroSection
            onExplore={scrollToHow}
            onRequestBriefing={onRequestBriefing}
            accentColor={accentColor}
          />

          <HowWeThinkSection accentColor={accentColor} />
        </div>
      </section>

      {/* Index of the dedicated pages */}
      <section className="relative z-10 bg-abyss py-24 sm:py-32 border-t border-hairline">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-20">
          <div className="max-w-[460px]">
            <h2 className="text-[clamp(28px,3vw,44px)] leading-[1.05] text-ice">
              Sovereign intelligence across technology, law and statecraft.
            </h2>
            <p className="mt-5 text-[17px] leading-[1.6] text-ice/70">
              Our practices, deployed systems, operating philosophy and the people behind them.
            </p>
            <button type="button" onClick={onRequestBriefing} className="btn btn-primary mt-9">
              Request a briefing
              <span className="btn-icon" aria-hidden="true">
                <ArrowRight size={15} />
              </span>
            </button>
          </div>

          <ul className="border-t border-hairline">
            {PORTAL.map((item, i) => (
              <li key={item.id} className="border-b border-hairline">
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className="group w-full grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-x-5 py-7 text-left cursor-pointer rounded-[7px]"
                >
                  <span className="pt-1.5 font-mono text-[12px] text-slate group-hover:text-signal transition-colors duration-150">
                    0{i + 1}
                  </span>
                  <span>
                    <span className="block font-display text-[22px] sm:text-[26px] leading-tight text-ice">{item.title}</span>
                    <span className="mt-2 block max-w-[520px] text-[15px] leading-[1.55] text-slate">{item.body}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1 grid place-items-center w-10 h-10 rounded-[10px] text-ice/60 shadow-[inset_0_0_0_1px_rgb(233_237_243/0.14)] group-hover:bg-ice group-hover:text-abyss transition-[background-color,color] duration-200"
                  >
                    <ArrowUpRight size={16} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
