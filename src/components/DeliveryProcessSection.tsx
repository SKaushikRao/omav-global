import React from 'react';
import { Search, Code2, Gauge, ArrowRight } from 'lucide-react';

interface DeliveryProcessSectionProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

const phases = [
  {
    step: '01',
    name: 'Discovery & Strategy',
    icon: <Search className="text-[#8CC8D8]" size={24} />,
    description:
      'We assess your business and governance goals, identify operational challenges, and create an unassailable technology roadmap rooted in constitutional law and system security.',
    points: [
      'Institutional objective alignment & stakeholder scoping',
      'Regulatory, cybersecurity & constitutional feasibility audit',
      'Target architecture roadmap & milestone formulation',
    ],
  },
  {
    step: '02',
    name: 'Development',
    icon: <Code2 className="text-[#8CC8D8]" size={24} />,
    description:
      'Our experts build secure, scalable, and high-performance solutions tailored to your operational realities, with rigorous automated testing and bias controls built into the core.',
    points: [
      'High-assurance modular engineering in secure environments',
      'Ethical AI bias audits, audit trails & zero-trust integration',
      'Air-gapped and cloud hybrid deployment validation',
    ],
  },
  {
    step: '03',
    name: 'Optimization & Support',
    icon: <Gauge className="text-[#8CC8D8]" size={24} />,
    description:
      'We provide continuous monitoring, maintenance, and system improvements to ensure long-term performance, mission-critical uptime, and institutional resilience.',
    points: [
      '24/7 telemetry monitoring & rapid anomaly remediation',
      'Policy-driven automated updates as legal standards evolve',
      'Cross-departmental executive training & capability transfer',
    ],
  },
];

export const DeliveryProcessSection: React.FC<DeliveryProcessSectionProps> = ({
  accentColor = '#8CC8D8',
  onRequestBriefing,
}) => {
  return (
    <section className="relative z-10 bg-[#05070B] py-24 sm:py-32 border-t border-[#DCE4EE]/8">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-[760px]">
            <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
              <span
                className="block w-7 h-[1px]"
                style={{ backgroundColor: accentColor }}
              />
              <span>DELIVERY METHODOLOGY</span>
            </div>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[48px] font-medium tracking-[-0.03em] leading-[1.1] text-[#F2F5F9]">
              How we deliver intelligent technology solutions.
            </h2>
          </div>
          <p className="max-w-[480px] text-base text-[#9AA4B2] leading-relaxed">
            We combine innovation, security, and advanced technology to deliver scalable digital solutions that improve efficiency, strengthen operations, and help organizations adapt confidently to evolving business and technology challenges.
          </p>
        </div>

        {/* 3 Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {phases.map((phase, idx) => (
            <div
              key={phase.step}
              className="bg-[#080B12] border border-[#DCE4EE]/10 rounded-lg p-8 relative flex flex-col justify-between transition-all duration-300 hover:border-[#8CC8D8]/30 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-[4px] bg-[#8CC8D8]/10 border border-[#8CC8D8]/20 flex items-center justify-center">
                    {phase.icon}
                  </div>
                  <span className="text-xl font-mono font-medium tracking-tight" style={{ color: accentColor }}>
                    {phase.step}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-medium tracking-tight text-[#F2F5F9]">
                  {phase.name}
                </h3>

                <p className="mt-3.5 text-sm sm:text-[15px] text-[#AEB7C3] leading-relaxed">
                  {phase.description}
                </p>

                <div className="mt-6 pt-5 border-t border-[#DCE4EE]/8 space-y-2.5">
                  {phase.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs text-[#9AA4B2]">
                      <span className="text-[#8CC8D8] text-base leading-none">·</span>
                      <span className="leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#DCE4EE]/10 flex items-center justify-between text-xs font-mono text-[#8C96A6]">
                <span>Phase {idx + 1} of 3</span>
                <span className="text-[#8CC8D8] uppercase tracking-wider font-semibold">Verified Lineage</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 p-6 sm:p-8 border border-[#DCE4EE]/10 rounded-lg bg-[#070A10] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="text-base font-medium text-white">
              Prepared to modernize public sector infrastructure or private enterprise governance?
            </div>
            <div className="text-sm text-[#8C96A6] mt-1">
              Engage our multidisciplinary leadership for strategic intelligence and engineering roadmap assessment.
            </div>
          </div>
          <button
            onClick={onRequestBriefing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E9EDF3] text-[#05070B] text-xs font-medium uppercase tracking-wider rounded-[3px] hover:bg-white transition-colors shrink-0 cursor-pointer"
          >
            <span>Initiate Advisory Inquiry</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
