import React, { useState } from 'react';
import { SolutionsSection } from '../components/SolutionsSection';
import { DeliveryProcessSection } from '../components/DeliveryProcessSection';
import { LightTunnel } from '../components/LightTunnel';
import { Check, Shield, Cpu, Cloud, Server, Database, Smartphone, FileCheck, Layers } from 'lucide-react';

interface SolutionsPageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({
  accentColor = '#8CC8D8',
  onRequestBriefing,
}) => {
  const [selectedTechStack, setSelectedTechStack] = useState('all');

  const capabilities = [
    {
      title: 'Digital Transformation',
      icon: <Layers size={20} className="text-[#8CC8D8]" />,
      desc: 'Modernizing citizen-facing public portals, workflow routing, and state administrative systems into resilient, auditable platforms.',
    },
    {
      title: 'Software Development',
      icon: <Cpu size={20} className="text-[#8CC8D8]" />,
      desc: 'High-assurance enterprise and public sector engineering built in modern frameworks with strict constitutional bias controls.',
    },
    {
      title: 'Mobile App Development',
      icon: <Smartphone size={20} className="text-[#8CC8D8]" />,
      desc: 'Secure citizen utility and emergency alert applications (e.g. Maharashtra Cyber Safe app) supporting high-concurrency usage.',
    },
    {
      title: 'Cloud Solutions',
      icon: <Cloud size={20} className="text-[#8CC8D8]" />,
      desc: 'Government cloud migrations adhering to federal security baselines, data locality requirements, and zero-trust perimeter policies.',
    },
    {
      title: 'On-Premises Infrastructure',
      icon: <Server size={20} className="text-[#8CC8D8]" />,
      desc: 'Air-gapped compute clusters, classified data enclaves, and localized sovereign deployments for intelligence and defense agencies.',
    },
    {
      title: 'Managed Infrastructure Services',
      icon: <Database size={20} className="text-[#8CC8D8]" />,
      desc: '24/7 proactive security monitoring, threat forensics, automated zero-day patching, and 99.99% mission-critical availability.',
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
      {/* Page Hero Header */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 py-16 sm:py-24 border-b border-[#DCE4EE]/10">
        <div className="max-w-[840px]">
          <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
            <span
              className="block w-7 h-[1px]"
              style={{ backgroundColor: accentColor }}
            />
            <span>SOLUTIONS & PUBLIC PLATFORMS</span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[60px] font-medium tracking-tight text-white leading-[1.08]">
            Transforming governance through AI-driven intelligence and technology solutions.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#AEB7C3] leading-relaxed max-w-[720px]">
            We bridge the gap between private innovation and public sector transformation, helping governments and institutions serve citizens more securely and efficiently.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 text-xs font-mono text-[#8C96A6]">
            <span className="flex items-center gap-1.5 bg-[#0A101C] border border-[#DCE4EE]/10 px-3.5 py-1.5 rounded-[3px]">
              <Check size={14} className="text-[#8CC8D8]" /> AI Voice Bots
            </span>
            <span className="flex items-center gap-1.5 bg-[#0A101C] border border-[#DCE4EE]/10 px-3.5 py-1.5 rounded-[3px]">
              <Check size={14} className="text-[#8CC8D8]" /> Contract Intelligence
            </span>
            <span className="flex items-center gap-1.5 bg-[#0A101C] border border-[#DCE4EE]/10 px-3.5 py-1.5 rounded-[3px]">
              <Check size={14} className="text-[#8CC8D8]" /> Predictive Policing
            </span>
            <span className="flex items-center gap-1.5 bg-[#0A101C] border border-[#DCE4EE]/10 px-3.5 py-1.5 rounded-[3px]">
              <Check size={14} className="text-[#8CC8D8]" /> Digital Governance
            </span>
          </div>
        </div>
      </div>

      {/* 6 Technology Capabilities Grid */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 py-20 border-b border-[#DCE4EE]/10">
        <div className="mb-12">
          <div className="text-xs font-mono tracking-widest text-[#8CC8D8] uppercase">
            Full-Spectrum Engineering Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-white mt-2">
            End-to-end architecture tailored for high-security public mandates.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="bg-[#080B12] border border-[#DCE4EE]/10 rounded-lg p-7 hover:border-[#8CC8D8]/30 transition-all"
            >
              <div className="w-10 h-10 rounded-[3px] bg-[#8CC8D8]/10 border border-[#8CC8D8]/20 flex items-center justify-center mb-4">
                {cap.icon}
              </div>
              <h3 className="text-lg font-medium text-white">{cap.title}</h3>
              <p className="mt-2.5 text-sm text-[#9AA4B2] leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Solutions Showcase */}
      <SolutionsSection
        accentColor={accentColor}
        onRequestBriefing={onRequestBriefing}
      />

      {/* How We Deliver Intelligent Technology Solutions */}
      <DeliveryProcessSection
        accentColor={accentColor}
        onRequestBriefing={onRequestBriefing}
      />
      </div>
    </div>
  );
};
