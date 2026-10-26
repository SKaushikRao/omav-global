import React from 'react';
import { ArrowRight } from 'lucide-react';
import { InsightArticle } from '../types';

interface InsightsSectionProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

const insights: InsightArticle[] = [
  {
    id: 'ai-gov',
    tag: 'AI GOVERNANCE',
    title: 'Accountable AI in public institutions',
    status: 'FORTHCOMING',
    description:
      'A practical guide to deploying machine intelligence in state agencies without compromising administrative law, equal protection, or citizen transparency.',
    readTime: 'Quarterly Policy Briefing',
  },
  {
    id: 'cyber-law',
    tag: 'CYBER & LAW',
    title: 'Cyber resilience and the rule of law',
    status: 'FORTHCOMING',
    description:
      'Analyzing state-level emergency response protocols, cyber liability doctrine, and institutional immunity in cross-border cyber aggression.',
    readTime: 'Executive Legal Monograph',
  },
  {
    id: 'global-strategy',
    tag: 'GLOBAL STRATEGY',
    title: 'Technology, policy and multilateral cooperation',
    status: 'FORTHCOMING',
    description:
      'How sub-national bilateral agreements (such as state-to-state economic and technology corridors) bypass federal gridlock to drive real investment.',
    readTime: 'Strategic Foreign Policy Paper',
  },
];

export const InsightsSection: React.FC<InsightsSectionProps> = ({
  accentColor = '#8CC8D8',
  onRequestBriefing,
}) => {
  return (
    <section
      id="insights"
      className="relative z-10 bg-[#05070B] py-24 sm:py-36 border-t border-[#DCE4EE]/6"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 sm:mb-20">
          <div className="max-w-[760px]">
            <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
              <span
                className="block w-7 h-[1px]"
                style={{ backgroundColor: accentColor }}
              />
              <span>INSIGHTS</span>
            </div>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[50px] font-medium tracking-[-0.03em] leading-[1.1] text-[#F2F5F9]">
              Analysis for decision-makers.
            </h2>
          </div>
          <p className="max-w-[400px] text-base text-[#9AA4B2] leading-relaxed">
            Briefings on AI governance, cyber law and technology policy. Our publications provide institutional clarity for senior executives and public officers.
          </p>
        </div>

        <div className="border-b border-[#DCE4EE]/10">
          {insights.map((item) => (
            <div
              key={item.id}
              className="group py-8 sm:py-9 border-t border-[#DCE4EE]/10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 transition-colors duration-200 hover:bg-[#DCE4EE]/[0.02] px-3 sm:px-4 -mx-3 sm:-mx-4 rounded-[2px]"
            >
              <div className="md:w-56 shrink-0 text-xs font-mono tracking-[0.2em] text-[#8C96A6]">
                {item.tag}
              </div>

              <div className="flex-1 max-w-[560px]">
                <h3 className="text-xl sm:text-2xl font-medium tracking-[-0.01em] text-[#F2F5F9] group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-[#9AA4B2] mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs font-mono tracking-wider text-[#9AA4B2] border border-[#DCE4EE]/18 rounded-full px-3.5 py-1.5 bg-[#05070B]">
                  {item.status}
                </span>
                <button
                  onClick={onRequestBriefing}
                  className="text-xs text-[#8CC8D8] hover:text-white inline-flex items-center gap-1 cursor-pointer font-medium underline underline-offset-4"
                >
                  Request Early Copy
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={onRequestBriefing}
            className="inline-flex items-center gap-2.5 h-12 px-6 rounded-[3px] border border-[#E9EDF3]/25 text-[#E9EDF3] text-sm font-medium tracking-wide transition-all duration-200 hover:border-[#E9EDF3]/70 hover:bg-[#E9EDF3]/5 cursor-pointer group"
          >
            <span>Request a briefing</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
          <span className="text-xs text-[#8C96A6] font-mono">
            Custom research and closed briefings provided on institutional mandate.
          </span>
        </div>
      </div>
    </section>
  );
};
