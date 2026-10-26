import React from 'react';
import { ExpertiseItem } from '../types';

interface ExpertiseSectionProps {
  accentColor?: string;
}

const expertiseList: ExpertiseItem[] = [
  {
    id: '01',
    num: '01',
    title: 'Strategic intelligence & research',
    description:
      'Rigorous open-source research and analysis that turns scattered information into a clear picture of risks, actors and opportunities.',
    focusAreas: ['OSINT synthesis', 'Geopolitical actor mapping', 'Emerging vulnerability forecasting'],
  },
  {
    id: '02',
    num: '02',
    title: 'AI governance & responsible innovation',
    description:
      'Policies, frameworks and oversight that let institutions adopt AI with accountability, legality and public trust built in.',
    focusAreas: ['Algorithmic bias mitigation', 'Constitutional safety guardrails', 'Model accountability audits'],
  },
  {
    id: '03',
    num: '03',
    title: 'Cyber & digital-law advisory',
    description:
      'Counsel where technology meets law: cybercrime and cyber resilience, data protection and emerging digital regulation.',
    focusAreas: ['Cyber incident legal response', 'Cross-border data jurisdiction', 'Regulatory defense'],
  },
  {
    id: '04',
    num: '04',
    title: 'Public-sector strategy',
    description:
      'Helping government bodies define problems precisely and deliver technology-led programmes that work in practice.',
    focusAreas: ['Civic modernization', 'Departmental procurement roadmaps', 'Citizen trust benchmarks'],
  },
  {
    id: '05',
    num: '05',
    title: 'International partnerships',
    description:
      'Structuring collaboration between governments, institutions and research bodies across borders and sectors.',
    focusAreas: ['Multilateral state missions', 'Cross-continental tech transfer', 'Global regulatory treaties'],
  },
  {
    id: '06',
    num: '06',
    title: 'Policy-led technology transformation',
    description:
      'Aligning technology adoption with policy objectives, so that systems serve their public purpose and stand up to scrutiny.',
    focusAreas: ['Statutory engineering', 'Public audit compliance', 'Long-term institutional resilience'],
  },
];

export const ExpertiseSection: React.FC<ExpertiseSectionProps> = ({
  accentColor = '#8CC8D8',
}) => {
  return (
    <section
      id="expertise"
      className="relative z-10 bg-[#05070B] py-24 sm:py-36 border-t border-[#DCE4EE]/8"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 sm:mb-20">
          <div className="max-w-[760px]">
            <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
              <span
                className="block w-7 h-[1px]"
                style={{ backgroundColor: accentColor }}
              />
              <span>EXPERTISE</span>
            </div>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[50px] font-medium tracking-[-0.03em] leading-[1.1] text-[#F2F5F9]">
              A multidisciplinary practice where law, technology and public policy meet.
            </h2>
          </div>
          <p className="max-w-[420px] text-base sm:text-[17px] text-[#9AA4B2] leading-relaxed">
            The questions that matter rarely sit within one discipline. A technology decision is often a legal one; a policy choice can carry global consequences.
          </p>
        </div>

        {/* Structured Row Layout matching the reference design */}
        <div className="border-b border-[#DCE4EE]/10">
          {expertiseList.map((item) => (
            <div
              key={item.id}
              className="group py-8 sm:py-10 border-t border-[#DCE4EE]/10 flex flex-col md:flex-row md:items-baseline gap-4 md:gap-10 transition-colors duration-200 hover:bg-[#DCE4EE]/[0.02] px-3 sm:px-4 -mx-3 sm:-mx-4 rounded-[2px]"
            >
              <span
                className="w-12 text-sm font-mono tracking-widest font-semibold shrink-0"
                style={{ color: accentColor }}
              >
                {item.num}
              </span>

              <div className="md:w-[340px] lg:w-[380px] shrink-0">
                <h3 className="text-xl sm:text-2xl font-medium tracking-[-0.015em] text-[#F2F5F9] group-hover:text-white transition-colors">
                  {item.title}
                </h3>
              </div>

              <div className="flex-1 max-w-[640px]">
                <p className="text-[15px] sm:text-base text-[#9AA4B2] leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-mono text-[#8C96A6]">
                  {item.focusAreas.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      <span className="text-[#8CC8D8]/60">/</span>
                      <span>{f}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
