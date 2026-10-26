import React from 'react';
import { EarthCanvas } from '../components/EarthCanvas';
import { HeroSection } from '../components/HeroSection';
import { HowWeThinkSection } from '../components/HowWeThinkSection';
import { ArrowRight, Bot, ShieldAlert, Cpu, Users, Award } from 'lucide-react';

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

      {/* Flagship Exploratory Portal linking to dedicated pages */}
      <section className="relative z-10 bg-[#06080E] py-24 sm:py-32 border-t border-[#DCE4EE]/10">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
          <div className="max-w-[800px] mb-16">
            <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
              <span
                className="block w-7 h-[1px]"
                style={{ backgroundColor: accentColor }}
              />
              <span>EXPLORE OMAV GLOBAL</span>
            </div>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[46px] font-medium tracking-[-0.03em] leading-[1.1] text-[#F2F5F9]">
              Sovereign intelligence across technology, jurisprudence and statecraft.
            </h2>
            <p className="mt-4 text-base text-[#9AA4B2] leading-relaxed">
              Explore our specialized practices, deployed governance solutions, operating philosophy, and leadership credentials across dedicated institutional sections.
            </p>
          </div>

          {/* Quick Section Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Solutions Card */}
            <div
              onClick={() => onNavigate('solutions')}
              className="bg-[#080C14] border border-[#DCE4EE]/10 rounded-lg p-7 flex flex-col justify-between hover:border-[#8CC8D8]/40 hover:bg-[#0A101C] transition-all cursor-pointer group"
            >
              <div>
                <div className="w-10 h-10 rounded-[3px] bg-[#8CC8D8]/10 border border-[#8CC8D8]/20 flex items-center justify-center text-[#8CC8D8] mb-5">
                  <Bot size={20} />
                </div>
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#8C96A6]">
                  DEPLOYED PLATFORMS
                </div>
                <h3 className="text-xl font-medium text-white mt-2 group-hover:text-[#8CC8D8] transition-colors">
                  Solutions & Systems
                </h3>
                <p className="mt-3 text-sm text-[#9AA4B2] leading-relaxed">
                  AI voice bots, contract intelligence, predictive policing, and constitutional recruitment engines in production.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DCE4EE]/10 flex items-center justify-between text-xs font-mono text-[#E9EDF3]">
                <span>View Solutions</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Expertise Card */}
            <div
              onClick={() => onNavigate('expertise')}
              className="bg-[#080C14] border border-[#DCE4EE]/10 rounded-lg p-7 flex flex-col justify-between hover:border-[#8CC8D8]/40 hover:bg-[#0A101C] transition-all cursor-pointer group"
            >
              <div>
                <div className="w-10 h-10 rounded-[3px] bg-[#8CC8D8]/10 border border-[#8CC8D8]/20 flex items-center justify-center text-[#8CC8D8] mb-5">
                  <Cpu size={20} />
                </div>
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#8C96A6]">
                  PRACTICE PILLARS
                </div>
                <h3 className="text-xl font-medium text-white mt-2 group-hover:text-[#8CC8D8] transition-colors">
                  Multidisciplinary Expertise
                </h3>
                <p className="mt-3 text-sm text-[#9AA4B2] leading-relaxed">
                  Six advisory domains where artificial intelligence, statutory law, and public sector policy intersect.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DCE4EE]/10 flex items-center justify-between text-xs font-mono text-[#E9EDF3]">
                <span>View Expertise</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Approach Card */}
            <div
              onClick={() => onNavigate('approach')}
              className="bg-[#080C14] border border-[#DCE4EE]/10 rounded-lg p-7 flex flex-col justify-between hover:border-[#8CC8D8]/40 hover:bg-[#0A101C] transition-all cursor-pointer group"
            >
              <div>
                <div className="w-10 h-10 rounded-[3px] bg-[#8CC8D8]/10 border border-[#8CC8D8]/20 flex items-center justify-center text-[#8CC8D8] mb-5">
                  <ShieldAlert size={20} />
                </div>
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#8C96A6]">
                  COMMITMENTS
                </div>
                <h3 className="text-xl font-medium text-white mt-2 group-hover:text-[#8CC8D8] transition-colors">
                  Our Approach
                </h3>
                <p className="mt-3 text-sm text-[#9AA4B2] leading-relaxed">
                  Intelligence, Advisory, Global perspective, and Institutional credibility behind every government engagement.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DCE4EE]/10 flex items-center justify-between text-xs font-mono text-[#E9EDF3]">
                <span>View Approach</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* About Card */}
            <div
              onClick={() => onNavigate('about')}
              className="bg-[#080C14] border border-[#DCE4EE]/10 rounded-lg p-7 flex flex-col justify-between hover:border-[#8CC8D8]/40 hover:bg-[#0A101C] transition-all cursor-pointer group"
            >
              <div>
                <div className="w-10 h-10 rounded-[3px] bg-[#8CC8D8]/10 border border-[#8CC8D8]/20 flex items-center justify-center text-[#8CC8D8] mb-5">
                  <Users size={20} />
                </div>
                <div className="text-[11px] font-mono tracking-wider uppercase text-[#8C96A6]">
                  LEADERSHIP
                </div>
                <h3 className="text-xl font-medium text-white mt-2 group-hover:text-[#8CC8D8] transition-colors">
                  About & Founders
                </h3>
                <p className="mt-3 text-sm text-[#9AA4B2] leading-relaxed">
                  The OMAV mark, ॥ अधिकाराणां कृते ॥ motto, and leadership profiles of Priya Lalwani and Varad Ozarkar.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DCE4EE]/10 flex items-center justify-between text-xs font-mono text-[#E9EDF3]">
                <span>View About & Founders</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
