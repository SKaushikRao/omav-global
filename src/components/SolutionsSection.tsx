import React, { useState } from 'react';
import { SolutionItem } from '../types';
import { Bot, FileCode2, ShieldAlert, Layers, Server, Globe2, ArrowUpRight } from 'lucide-react';

interface SolutionsSectionProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

const solutionsList: SolutionItem[] = [
  {
    id: 'voice-bots',
    title: 'AI Voice Bots & Citizen Services',
    category: 'Software & AI Bots',
    description:
      'Conversational intelligence platforms deployed across public call centers and emergency lines. Enables automated, constitutional grievance recording and rapid citizen support.',
    deliverables: [
      'Multilingual dialect processing across regions',
      'Verified automated incident triage and dispatch',
      'Constitutional privacy and audit logs',
    ],
    impact: 'Millions of citizen interactions handled with sub-second response times',
  },
  {
    id: 'contract-intelligence',
    title: 'Contract Intelligence & Legal Tech',
    category: 'Digital Transformation',
    description:
      'Autonomous legal intelligence scanning public procurement contracts, tenders, and legislative mandates. Flags statutory discrepancies and prevents regulatory liability.',
    deliverables: [
      'Statutory & constitutional compliance auditing',
      'Automated clause verification & discrepancy flags',
      'Cross-departmental procurement harmonization',
    ],
    impact: 'Drastic reduction in public-sector contract disputes and compliance turnaround',
  },
  {
    id: 'predictive-policing',
    title: 'Cyber Intelligence & Predictive Policing',
    category: 'Cyber & Predictive Policing',
    description:
      'Mission-critical cybersecurity and investigative analytics that empower law enforcement and intelligence agencies to detect threats, prevent criminal networks, and protect lives.',
    deliverables: [
      'Real-time threat pattern detection & threat mapping',
      'Cross-jurisdictional open-source intelligence synthesis',
      'Citizen cyber-safety mobile applications & reporting',
    ],
    impact: 'Awarded state-level recognition for counter-incident response and security',
  },
  {
    id: 'digital-governance',
    title: 'Constitutional Digital Governance',
    category: 'Digital Transformation',
    description:
      'Transparent, bias-controlled recruitment engines and administrative platforms built strictly within constitutional guardrails, ensuring equitable public employment.',
    deliverables: [
      'Audited algorithmic fairness & merit scoring',
      'Immutable verification trails for all decisions',
      'Inter-departmental workflow orchestration',
    ],
    impact: 'First-of-its-kind state administration hiring engine with zero algorithmic bias',
  },
  {
    id: 'cloud-onprem',
    title: 'Cloud & On-Premises Sovereign Solutions',
    category: 'Cloud & Sovereign On-Premises',
    description:
      'Architected for high-sovereignty environments. We deploy dual-architecture solutions spanning secure government clouds and air-gapped on-premises data enclaves.',
    deliverables: [
      'Air-gapped on-premises high-assurance nodes',
      'Zero-trust cryptographic data protection',
      'Scalable hybrid cloud failover and resilience',
    ],
    impact: '100% data sovereignty and national resilience standards adhered to',
  },
  {
    id: 'infra-managed',
    title: 'Infrastructure Managed Services',
    category: 'Managed Infrastructure',
    description:
      'Continuous 24/7 mission-critical operations, system health monitoring, rapid disaster recovery, and infrastructure modernization for public sector institutions.',
    deliverables: [
      '24/7 emergency incident response & forensic triage',
      'Continuous vulnerability patching & zero-day audits',
      'Modernization roadmaps for legacy public systems',
    ],
    impact: '99.99% uptime maintained during emergency state-level events',
  },
];

const pillars = [
  'All Solutions',
  'Digital Transformation',
  'Software & AI Bots',
  'Cyber & Predictive Policing',
  'Cloud & Sovereign On-Premises',
  'Managed Infrastructure',
];

export const SolutionsSection: React.FC<SolutionsSectionProps> = ({
  accentColor = '#8CC8D8',
  onRequestBriefing,
}) => {
  const [activeCategory, setActiveCategory] = useState('All Solutions');

  const filteredSolutions =
    activeCategory === 'All Solutions'
      ? solutionsList
      : solutionsList.filter((s) => s.category === activeCategory);

  const getIcon = (id: string) => {
    switch (id) {
      case 'voice-bots':
        return <Bot size={22} className="text-[#8CC8D8]" />;
      case 'contract-intelligence':
        return <FileCode2 size={22} className="text-[#8CC8D8]" />;
      case 'predictive-policing':
        return <ShieldAlert size={22} className="text-[#8CC8D8]" />;
      case 'digital-governance':
        return <Globe2 size={22} className="text-[#8CC8D8]" />;
      case 'cloud-onprem':
        return <Server size={22} className="text-[#8CC8D8]" />;
      default:
        return <Layers size={22} className="text-[#8CC8D8]" />;
    }
  };

  return (
    <section
      id="solutions"
      className="relative z-10 bg-[#06080E] py-24 sm:py-32 border-t border-[#DCE4EE]/10"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
        {/* Section Heading */}
        <div className="max-w-[780px]">
          <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
            <span
              className="block w-7 h-[1px]"
              style={{ backgroundColor: accentColor }}
            />
            <span>SOLUTIONS & PUBLIC SYSTEMS</span>
          </div>

          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[48px] font-medium tracking-[-0.03em] leading-[1.1] text-[#F2F5F9]">
            Transforming governance and public systems through AI-driven intelligence.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-[#9AA4B2] leading-relaxed">
            We bridge the gap between private sector innovation and public sector transformation, helping governments and institutions serve citizens more securely and efficiently. Expertise across AI, cybersecurity, legal technology, and sovereign partnerships.
          </p>
        </div>

        {/* Global Security Feature Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#0E1522] via-[#090E17] to-[#070A10] border border-[#DCE4EE]/12 rounded-lg p-7 sm:p-10 relative overflow-hidden">
          <div className="max-w-[800px] relative z-10">
            <div className="text-xs font-mono tracking-[0.24em] text-[#8CC8D8] uppercase font-semibold">
              Cyber Intelligence for Global Security and Stability
            </div>
            <h3 className="mt-3 text-2xl sm:text-3xl font-medium tracking-tight text-white leading-snug">
              Creating technology that helps government agencies prevent and investigate terrorism and crime to save thousands of lives around the globe.
            </h3>
            <p className="mt-3 text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
              From automated law-enforcement dispatchers to state cyber-crime call hubs and border data integrity, our platforms deliver sovereign operational superiority.
            </p>
          </div>
          <div
            aria-hidden="true"
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#8CC8D8]/5 blur-3xl pointer-events-none"
          />
        </div>

        {/* Interactive Filter Pills */}
        <div className="mt-14 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {pillars.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-medium tracking-wider uppercase rounded-[3px] transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#E9EDF3] text-[#05070B] shadow-sm font-semibold'
                  : 'bg-[#10141D] text-[#8C96A6] border border-[#DCE4EE]/10 hover:text-white hover:border-[#DCE4EE]/25'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Solutions Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSolutions.map((item) => (
            <div
              key={item.id}
              className="bg-[#080C14] border border-[#DCE4EE]/8 rounded-lg p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#8CC8D8]/30 hover:bg-[#0A101A] group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-[4px] bg-[#8CC8D8]/10 border border-[#8CC8D8]/20 flex items-center justify-center">
                    {getIcon(item.id)}
                  </div>
                  <span className="text-[11px] font-mono tracking-wider uppercase text-[#8C96A6]">
                    {item.category}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-medium tracking-tight text-[#F2F5F9] group-hover:text-white transition-colors">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm text-[#9AA4B2] leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-5 space-y-2 border-t border-[#DCE4EE]/8 pt-4">
                  {item.deliverables.map((d, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-[#AEB7C3]"
                    >
                      <span className="text-[#8CC8D8] text-sm leading-none mt-0.5">·</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#DCE4EE]/10 flex items-center justify-between text-xs font-mono text-[#8C96A6]">
                <span className="truncate max-w-[240px] text-[#8CC8D8]/90 font-medium">
                  {item.impact}
                </span>
                <button
                  onClick={onRequestBriefing}
                  className="inline-flex items-center gap-1 text-[#E9EDF3] hover:text-white cursor-pointer group-hover:translate-x-0.5 transition-transform"
                  aria-label={`Inquire about ${item.title}`}
                >
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
