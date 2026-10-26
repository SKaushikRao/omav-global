import React, { useState } from 'react';
import { ExpertiseSection } from '../components/ExpertiseSection';
import { ShieldCheck, Scale, Compass, Globe, Server, Cpu, CheckCircle } from 'lucide-react';

interface ExpertisePageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

export const ExpertisePage: React.FC<ExpertisePageProps> = ({
  accentColor = '#8CC8D8',
  onRequestBriefing,
}) => {
  const [activeTab, setActiveTab] = useState('01');

  const practices = [
    {
      num: '01',
      title: 'Strategic Intelligence & Research',
      icon: <Compass size={22} className="text-[#8CC8D8]" />,
      summary: 'Rigorous open-source research and analysis that turns scattered information into a clear picture of risks, actors and opportunities.',
      domains: ['Geopolitical Actor Mapping', 'Supply Chain Vulnerability', 'Foreign Tech Policy Intercepts', 'OSINT Threat Radar'],
      methodology: 'Triangulating technical signals, legal registry filings, academic literature, and multilateral records to eliminate intelligence blind spots.',
      clientBenefit: 'Provides senior ministers and chief executives with defensible foresight prior to capital or legislative commitments.',
    },
    {
      num: '02',
      title: 'AI Governance & Responsible Innovation',
      icon: <Cpu size={22} className="text-[#8CC8D8]" />,
      summary: 'Policies, frameworks and oversight that let institutions adopt AI with accountability, legality and public trust built in.',
      domains: ['Algorithmic Audit Frameworks', 'Constitutional Equality & Bias Guardrails', 'Automated Decision Audit Trails', 'Procurement Standards'],
      methodology: 'Mathematical bias testing aligned with constitutional equal-protection doctrines and international AI safety treaties.',
      clientBenefit: 'Enables government bodies to deploy automated ranking, hiring, and triage engines with zero risk of judicial invalidation.',
    },
    {
      num: '03',
      title: 'Cyber & Digital-Law Advisory',
      icon: <ShieldCheck size={22} className="text-[#8CC8D8]" />,
      summary: 'Counsel where technology meets law: cybercrime and cyber resilience, data protection and emerging digital regulation.',
      domains: ['State-Level Incident Response', 'Critical Infrastructure Resilience', 'Cross-Border Data Treaties', 'Digital Evidence Standards'],
      methodology: 'Combining deep network packet forensics with criminal jurisprudence and statutory compliance mandates.',
      clientBenefit: 'Award-winning coordination of 24-hour response to state-level security incidents recognized by GovTech awards.',
    },
    {
      num: '04',
      title: 'Public-Sector Strategy',
      icon: <Scale size={22} className="text-[#8CC8D8]" />,
      summary: 'Helping government bodies define problems precisely and deliver technology-led programmes that work in practice.',
      domains: ['Inter-Agency Orchestration', 'Civic Modernization Roadmaps', 'Legacy System Sunset Protocols', 'Public Performance Metrics'],
      methodology: 'Translating political mandates into clear technical milestones, change-management strategies, and verified public outcomes.',
      clientBenefit: 'Prevents multimillion-dollar budget overruns common in complex government IT transformations.',
    },
    {
      num: '05',
      title: 'International Partnerships',
      icon: <Globe size={22} className="text-[#8CC8D8]" />,
      summary: 'Structuring collaboration between governments, institutions and research bodies across borders and sectors.',
      domains: ['Sub-National Bilateral Corridors', 'Bilateral Technology Transfer', 'Academic-State Innovation Hubs', 'Multilateral Treaties'],
      methodology: 'Architecting high-trust compacts that navigate disparate export controls, security clearances, and jurisdictional friction.',
      clientBenefit: 'Directly shaped international investment missions, including the New Jersey–India Mission with Governor Phil Murphy.',
    },
    {
      num: '06',
      title: 'Policy-Led Technology Transformation',
      icon: <Server size={22} className="text-[#8CC8D8]" />,
      summary: 'Aligning technology adoption with policy objectives, so that systems serve their public purpose and stand up to scrutiny.',
      domains: ['Legislative Codification into Code', 'Administrative Law Verification', 'Transparency Portals', 'Citizen Rights Auditing'],
      methodology: 'Directly mapping statutory sections to software tests and immutable event streams before code reaches production.',
      clientBenefit: 'Ensures that civic technology upholds democratic norms and stands up to judicial, legislative, and media scrutiny.',
    },
  ];

  const currentPractice = practices.find((p) => p.num === activeTab) || practices[0];

  return (
    <div className="pt-24 pb-20 bg-[#05070B] min-h-screen text-[#E9EDF3]">
      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 py-16 sm:py-24 border-b border-[#DCE4EE]/10">
        <div className="max-w-[840px]">
          <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
            <span
              className="block w-7 h-[1px]"
              style={{ backgroundColor: accentColor }}
            />
            <span>MULTIDISCIPLINARY PRACTICE</span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[60px] font-medium tracking-tight text-white leading-[1.08]">
            Where law, technology and public policy meet.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#AEB7C3] leading-relaxed max-w-[720px]">
            The questions that matter rarely sit within one discipline. A technology decision is often a legal one; a policy choice can carry global consequences.
          </p>
        </div>
      </div>

      {/* Main Expertise List Section */}
      <ExpertiseSection accentColor={accentColor} />

      {/* Interactive Deep-Dive Explorer into the 6 Practices */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 py-20 border-t border-[#DCE4EE]/10">
        <div className="mb-10">
          <div className="text-xs font-mono tracking-widest text-[#8CC8D8] uppercase">
            Practice Deep-Dive & Methodologies
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-white mt-2">
            Explore how our teams unpack and operationalize each domain.
          </h2>
        </div>

        {/* Tab selection */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {practices.map((p) => (
            <button
              key={p.num}
              onClick={() => setActiveTab(p.num)}
              className={`px-4 py-2.5 text-xs font-mono tracking-wider uppercase rounded-[3px] transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === p.num
                  ? 'bg-[#E9EDF3] text-[#05070B] font-semibold'
                  : 'bg-[#0A101C] text-[#8C96A6] border border-[#DCE4EE]/10 hover:text-white hover:border-[#DCE4EE]/25'
              }`}
            >
              <span>{p.num}</span>
              <span className="font-sans font-medium">{p.title.split('&')[0].trim()}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Card */}
        <div className="mt-6 bg-[#080B12] border border-[#DCE4EE]/12 rounded-lg p-8 sm:p-12 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#DCE4EE]/10 pb-6 mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[4px] bg-[#8CC8D8]/10 border border-[#8CC8D8]/20 flex items-center justify-center">
                {currentPractice.icon}
              </div>
              <div>
                <span className="text-xs font-mono tracking-widest text-[#8CC8D8]">
                  PRACTICE {currentPractice.num} OF 06
                </span>
                <h3 className="text-2xl sm:text-3xl font-medium text-white">
                  {currentPractice.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onRequestBriefing}
              className="px-5 py-2.5 bg-[#E9EDF3] text-[#05070B] text-xs uppercase font-medium tracking-wider rounded-[3px] hover:bg-white transition-colors cursor-pointer"
            >
              Consult This Practice
            </button>
          </div>

          <p className="text-base sm:text-lg text-[#DCE3EB] leading-relaxed max-w-[800px]">
            {currentPractice.summary}
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#DCE4EE]/10">
            <div>
              <div className="text-xs font-mono tracking-wider text-[#8C96A6] uppercase mb-3">
                Focus Domains
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-[#AEB7C3]">
                {currentPractice.domains.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-[#8CC8D8] shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-mono tracking-wider text-[#8C96A6] uppercase mb-3">
                Methodology & Rigor
              </div>
              <p className="text-xs sm:text-sm text-[#AEB7C3] leading-relaxed">
                {currentPractice.methodology}
              </p>
            </div>

            <div>
              <div className="text-xs font-mono tracking-wider text-[#8C96A6] uppercase mb-3">
                Institutional Outcomes
              </div>
              <p className="text-xs sm:text-sm text-[#8CC8D8] leading-relaxed font-medium">
                {currentPractice.clientBenefit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
