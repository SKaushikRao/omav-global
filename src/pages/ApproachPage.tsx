import React from 'react';
import { ApproachSection } from '../components/ApproachSection';
import { LightTunnel } from '../components/LightTunnel';
import { Shield, Eye, Lock, Globe2, FileText, CheckCircle2 } from 'lucide-react';

interface ApproachPageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

export const ApproachPage: React.FC<ApproachPageProps> = ({
  accentColor = '#8CC8D8',
  onRequestBriefing,
}) => {
  const charters = [
    {
      title: 'Discretion & Sovereign Privilege',
      icon: <Lock size={20} className="text-[#8CC8D8]" />,
      desc: 'We operate under strict confidentiality protocols. Our engagements with state departments and intelligence leadership prioritize classified handling and institutional protection.',
    },
    {
      title: 'Multidisciplinary Composition',
      icon: <Eye size={20} className="text-[#8CC8D8]" />,
      desc: 'No technology decision is made without statutory counsel, and no policy is drafted without software validation. Engineers, legal scholars, and public strategists sit at the same table.',
    },
    {
      title: 'Objective Integrity & Constitutional Compliance',
      icon: <Shield size={20} className="text-[#8CC8D8]" />,
      desc: 'We do not sell vendor hype or speculative algorithms. Every system recommended is benchmarked against constitutional rights, public auditability, and legal precedent.',
    },
    {
      title: 'Sub-National to Multilateral Reach',
      icon: <Globe2 size={20} className="text-[#8CC8D8]" />,
      desc: 'Our work bridges municipal bodies, state administrations, national agencies, and bilateral state missions across the United States, India, and partner democracies.',
    },
  ];

  return (
    <div className="relative min-h-screen text-[#E9EDF3] bg-[#05070B] overflow-hidden">
      {/* Dynamic LightTunnel WebGL Background */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <LightTunnel
          cableColor="#344860"
          pulseColor="#8CC8D8"
          tunnelColor="#05070B"
          tunnelOpacity={0.25}
          speed={0.12}
          flowDirection="inward"
          pulseSpeed={2.2}
          pulseLength={0.32}
          pulseBlend={0.6}
          pulseWidth={1.2}
          pulseDensity={0.55}
          cableCount={56}
          thickness={0.35}
          rimWidth={0.2}
          waviness={0.3}
          sway={0.45}
          bend={0.38}
          size={1.05}
          glow={1.2}
          fadeNear={0.35}
          fadeFar={2.2}
          brightness={1.05}
          colorVariance={true}
          grain={true}
          grainIntensity={0.04}
          opacity={0.65}
          mouseInteraction={true}
          mouseStrength={0.12}
          clickSurge={true}
          intro={true}
        />

        {/* Sophisticated dark gradient vignettes to guarantee text legibility & sovereign atmosphere */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#05070B]/85 via-[#05070B]/60 to-[#05070B]/90" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#05070B]/35 to-[#05070B]/95" />
      </div>

      {/* Foreground Content Layer */}
      <div className="relative z-10 pt-24 pb-20 pointer-events-auto">
      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 py-16 sm:py-24 border-b border-[#DCE4EE]/10">
        <div className="max-w-[840px]">
          <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
            <span
              className="block w-7 h-[1px]"
              style={{ backgroundColor: accentColor }}
            />
            <span>OPERATING PHILOSOPHY</span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[60px] font-medium tracking-tight text-white leading-[1.08]">
            Four commitments behind every engagement.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#AEB7C3] leading-relaxed max-w-[720px]">
            We approach important work with precision, discretion and seriousness. Our thinking extends beyond countries, sectors and conventional boundaries.
          </p>
        </div>
      </div>

      {/* Main 4 Commitments Section */}
      <ApproachSection accentColor={accentColor} />

      {/* Institutional Charters & Governance Principles */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 py-20 border-t border-[#DCE4EE]/10">
        <div className="mb-12">
          <div className="text-xs font-mono tracking-widest text-[#8CC8D8] uppercase">
            Institutional Governance Charter
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-white mt-2">
            The standards governing how OMAV Global accepts and executes mandates.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {charters.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#080B12] border border-[#DCE4EE]/10 rounded-lg p-8 hover:border-[#8CC8D8]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[3px] bg-[#8CC8D8]/10 border border-[#8CC8D8]/20 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-medium text-white">{item.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-[#9AA4B2] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#DCE4EE]/8 flex items-center gap-2 text-xs font-mono text-[#8CC8D8]">
                <CheckCircle2 size={14} />
                <span>Enforced on all state & enterprise mandates</span>
              </div>
            </div>
          ))}
        </div>

        {/* Engagement Protocol Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#0C121D] to-[#080B11] border border-[#DCE4EE]/14 rounded-lg p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-[720px]">
            <div className="text-xs font-mono tracking-widest text-[#8CC8D8] uppercase mb-2">
              Confidential Consultation
            </div>
            <h3 className="text-2xl font-medium text-white">
              Structuring an institutional mandate or public advisory programme?
            </h3>
            <p className="mt-2 text-sm text-[#9AA4B2] leading-relaxed">
              Our partners engage directly with departmental heads, legislative leaders, and corporate boards to align technical roadmaps with sovereign priorities.
            </p>
          </div>

          <button
            onClick={onRequestBriefing}
            className="px-7 py-3.5 bg-[#E9EDF3] text-[#05070B] text-xs font-medium uppercase tracking-wider rounded-[3px] hover:bg-white transition-colors cursor-pointer shrink-0"
          >
            Request Strategic Consultation
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
