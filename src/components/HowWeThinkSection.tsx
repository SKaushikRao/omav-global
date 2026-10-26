import React from 'react';
import { ThoughtStep } from '../types';

interface HowWeThinkSectionProps {
  accentColor?: string;
}

const steps: ThoughtStep[] = [
  {
    id: 'data',
    num: '01',
    title: 'Data',
    description:
      'The world produces more information than any institution can read. We begin with what is openly knowable: law, policy, research, markets and public sources.',
    stat: 'Open Knowledge & Public Signals',
    highlight: 'Rigorous open-source intake without noise',
  },
  {
    id: 'intelligence',
    num: '02',
    title: 'Intelligence',
    description:
      'We connect it. Patterns, actors and dependencies emerge when information is read across disciplines rather than within them.',
    stat: 'Cross-Disciplinary Syntheses',
    highlight: 'Mapping relational dependencies & sovereign risk',
  },
  {
    id: 'understanding',
    num: '03',
    title: 'Understanding',
    description:
      'We interpret it through the lenses of law, technology and governance, until the picture is clear enough to act on.',
    stat: 'Jurisprudential & Tech Audit',
    highlight: 'Actionable clarity for institutional leadership',
  },
  {
    id: 'strategy',
    num: '04',
    title: 'Strategy',
    description:
      'We turn understanding into direction: policy positions, governance frameworks, partnerships and programmes with a clear line of sight to outcomes.',
    stat: 'Policy & Architecture Roadmaps',
    highlight: 'Direct line of sight to verified constitutional outcomes',
  },
  {
    id: 'impact',
    num: '05',
    title: 'Impact',
    description:
      'And we stay through delivery, because advice only matters when it changes what happens next.',
    stat: 'Production Governance Systems',
    highlight: 'Measured improvements in citizen security & trust',
  },
];

export const HowWeThinkSection: React.FC<HowWeThinkSectionProps> = ({
  accentColor = '#8CC8D8',
}) => {
  return (
    <div className="relative">
      {/* Section Entry Header */}
      <div id="how" className="min-h-[55vh] flex items-center">
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
          <div className="max-w-[540px] pointer-events-auto bg-[#05070B]/75 backdrop-blur-md border border-[#DCE4EE]/8 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
              <span
                className="block w-7 h-[1px]"
                style={{ backgroundColor: accentColor }}
              />
              <span>HOW WE THINK</span>
            </div>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[44px] font-medium tracking-[-0.03em] leading-[1.1] text-[#F2F5F9]">
              From scattered signals to decisions that hold.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
              Institutional clarity is rarely built from more data. It comes from interpreting signals across technology, constitution, and statecraft.
            </p>
          </div>
        </div>
      </div>

      {/* The 5 Sequential Scroll Steps */}
      {steps.map((step) => (
        <div
          key={step.id}
          id={step.id}
          className="min-h-[82vh] flex items-center py-12"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
            <div className="max-w-[480px] pointer-events-auto bg-[#05070B]/80 backdrop-blur-lg border border-[#DCE4EE]/10 rounded-lg p-7 sm:p-9 transition-all duration-300 hover:border-[#DCE4EE]/25 shadow-xl shadow-black/50">
              <div className="flex items-center gap-2.5 text-xs font-mono tracking-[0.24em] text-[#8C96A6]">
                <span style={{ color: accentColor }} className="font-semibold text-sm">
                  {step.num}
                </span>
                <span>/ 05</span>
                <span className="text-white/20">·</span>
                <span className="text-[11px] tracking-wider uppercase text-[#AEB7C3]/80">
                  {step.stat}
                </span>
              </div>

              <h3 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.035em] text-[#F2F5F9] leading-tight">
                {step.title}
              </h3>

              <p className="mt-4 text-base sm:text-lg text-[#AEB7C3] leading-relaxed font-normal">
                {step.description}
              </p>

              <div className="mt-6 pt-4 border-t border-[#DCE4EE]/10 flex items-center justify-between text-xs text-[#8C96A6] font-mono">
                <span>{step.highlight}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Trailing spacer to let final 3D impact state register */}
      <div className="h-[35vh]" />
    </div>
  );
};
