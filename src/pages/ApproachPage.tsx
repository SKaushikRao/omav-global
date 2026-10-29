import React from 'react';
import { CtaBand, Mono, PageBackdrop, PageHero, Section } from '../components/page/PageParts';
import LightRays from '../components/ui/LightRays';

interface ApproachPageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

const PILLARS = [
  {
    title: 'Intelligence',
    text: 'We understand complex information, technology, emerging risks and the world around us.',
    detail: 'Direct synthesis of technical architectures with jurisdictional precedents.',
  },
  {
    title: 'Advisory',
    text: 'We translate intelligence into decisions, policy, partnerships and strategic outcomes.',
    detail: 'Executive and sovereign counsel that translates directly into operational capability.',
  },
  {
    title: 'Global perspective',
    text: 'Our thinking extends beyond countries, sectors and conventional boundaries.',
    detail: 'International bridges connecting US, Indian, European and emerging sovereign ecosystems.',
  },
  {
    title: 'Institutional credibility',
    text: 'We approach important work with precision, discretion and seriousness.',
    detail: 'Proven history of advising state governors, chief ministers, and public administrations.',
  },
];

const STANDARDS = [
  {
    title: 'Discretion & sovereign privilege',
    desc: 'We operate under strict confidentiality protocols. Our engagements with state departments and intelligence leadership prioritize classified handling and institutional protection.',
  },
  {
    title: 'Multidisciplinary composition',
    desc: 'No technology decision is made without statutory counsel, and no policy is drafted without software validation. Engineers, legal scholars, and public strategists sit at the same table.',
  },
  {
    title: 'Objective integrity & constitutional compliance',
    desc: 'We do not sell vendor hype or speculative algorithms. Every system recommended is benchmarked against constitutional rights, public auditability, and legal precedent.',
  },
  {
    title: 'Sub-national to multilateral reach',
    desc: 'Our work bridges municipal bodies, state administrations, national agencies, and bilateral state missions across the United States, India, and partner democracies.',
  },
];

export const ApproachPage: React.FC<ApproachPageProps> = ({ onRequestBriefing }) => (
  <div className="relative text-ice">
    <PageBackdrop>
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={0.5}
        rayLength={3}
        glow={0.6}
        haze={0.25}
        followMouse
        mouseInfluence={0.1}
        rayDensity={1}
        tilt={0}
        raySharpness={0.35}
        atmosphere={1}
        intensity={1}
        fadeDistance={1}
        saturation={1}
        noiseAmount={0}
        distortion={0}
        pulsating={false}
        cursorShadow
        clickPulse
        intro
        lightMode={false}
        maxDevicePixelRatio={1}
      />
    </PageBackdrop>
<div className="relative z-[1]">
    <PageHero
      tunnel={false}
      title="Four commitments behind every engagement."
      lede="We approach important work with precision, discretion and seriousness. Our thinking extends beyond countries, sectors and conventional boundaries."
      meta={['Intelligence', 'Advisory', 'Global perspective', 'Institutional credibility']}
    />

    <Section
      title="What we bring to the table."
      lede="The four qualities institutions engage us for, and how each shows up in the work."
    >
      {/* No boxes: the pillars float in the light falling from above */}
      <div className="grid md:grid-cols-2 gap-x-16 gap-y-16 sm:gap-y-20">
        {PILLARS.map((p, i) => (
          <div key={p.title} className="omav-lit flex flex-col">
            <Mono className="text-signal">0{i + 1}</Mono>
            <h3 className="mt-5 uppercase text-[clamp(26px,2.6vw,38px)] leading-[1] tracking-[-0.02em] text-ice">{p.title}</h3>
            <p className="mt-5 max-w-[460px] text-[17px] leading-[1.6] text-ice/80">{p.text}</p>
            <p className="mt-6 max-w-[460px] text-[14px] leading-[1.55] text-ice/55">{p.detail}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section
      title="The standards we hold."
      lede="How OMAV Global accepts and executes mandates, enforced on every state and enterprise engagement."
    >
      <ul className="border-t border-hairline">
        {STANDARDS.map((s, i) => (
          <li
            key={s.title}
            className="grid md:grid-cols-[48px_minmax(0,4fr)_minmax(0,7fr)] gap-x-8 gap-y-3 py-8 sm:py-10 border-b border-hairline"
          >
            <span className="font-mono text-[12px] text-signal pt-1.5">0{i + 1}</span>
            <h3 className="font-display text-[20px] sm:text-[22px] leading-[1.2] text-ice">{s.title}</h3>
            <p className="text-[16px] leading-[1.65] text-ice/65 max-w-[640px]">{s.desc}</p>
          </li>
        ))}
      </ul>
    </Section>

    <CtaBand
      title="Structuring an institutional mandate or public advisory programme?"
      body="Our partners engage directly with departmental heads, legislative leaders and corporate boards to align technical roadmaps with sovereign priorities."
      action="Request a consultation"
      onAction={onRequestBriefing}
    />
  </div>
</div>
);
