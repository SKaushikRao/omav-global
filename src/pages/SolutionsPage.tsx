import React, { useState } from 'react';
import { Cloud, Cpu, Database, Layers, Server, Smartphone } from 'lucide-react';
import { Card, CtaBand, Mono, PageBackdrop, PageHero, Section } from '../components/page/PageParts';
import Galaxy from '../components/ui/Galaxy';
import RubberSegment from '../components/ui/RubberSegment';

interface SolutionsPageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

const PLATFORMS = [
  {
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
    title: 'Cloud & On-Premises Sovereign Solutions',
    category: 'Cloud & Sovereign',
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

const FILTERS = ['All', 'Digital Transformation', 'Software & AI Bots', 'Cyber & Predictive Policing', 'Cloud & Sovereign', 'Managed Infrastructure'];
const FILTER_LABELS: Record<string, string> = {
  All: 'All',
  'Digital Transformation': 'Digital',
  'Software & AI Bots': 'AI',
  'Cyber & Predictive Policing': 'Cyber',
  'Cloud & Sovereign': 'Sovereign',
  'Managed Infrastructure': 'Managed',
};

const CAPABILITIES = [
  {
    title: 'Digital Transformation',
    icon: Layers,
    desc: 'Modernizing citizen-facing public portals, workflow routing, and state administrative systems into resilient, auditable platforms.',
  },
  {
    title: 'Software Development',
    icon: Cpu,
    desc: 'High-assurance enterprise and public sector engineering built in modern frameworks with strict constitutional bias controls.',
  },
  {
    title: 'Mobile App Development',
    icon: Smartphone,
    desc: 'Secure citizen utility and emergency alert applications (e.g. Maharashtra Cyber Safe app) supporting high-concurrency usage.',
  },
  {
    title: 'Cloud Solutions',
    icon: Cloud,
    desc: 'Government cloud migrations adhering to federal security baselines, data locality requirements, and zero-trust perimeter policies.',
  },
  {
    title: 'On-Premises Infrastructure',
    icon: Server,
    desc: 'Air-gapped compute clusters, classified data enclaves, and localized sovereign deployments for intelligence and defense agencies.',
  },
  {
    title: 'Managed Infrastructure Services',
    icon: Database,
    desc: '24/7 proactive security monitoring, threat forensics, automated zero-day patching, and 99.99% mission-critical availability.',
  },
];

const PHASES = [
  {
    name: 'Discovery & Strategy',
    description:
      'We assess your business and governance goals, identify operational challenges, and create an unassailable technology roadmap rooted in constitutional law and system security.',
    points: [
      'Institutional objective alignment & stakeholder scoping',
      'Regulatory, cybersecurity & constitutional feasibility audit',
      'Target architecture roadmap & milestone formulation',
    ],
  },
  {
    name: 'Development',
    description:
      'Our experts build secure, scalable, and high-performance solutions tailored to your operational realities, with rigorous automated testing and bias controls built into the core.',
    points: [
      'High-assurance modular engineering in secure environments',
      'Ethical AI bias audits, audit trails & zero-trust integration',
      'Air-gapped and cloud hybrid deployment validation',
    ],
  },
  {
    name: 'Optimization & Support',
    description:
      'We provide continuous monitoring, maintenance, and system improvements to ensure long-term performance, mission-critical uptime, and institutional resilience.',
    points: [
      '24/7 telemetry monitoring & rapid anomaly remediation',
      'Policy-driven automated updates as legal standards evolve',
      'Cross-departmental executive training & capability transfer',
    ],
  },
];

export const SolutionsPage: React.FC<SolutionsPageProps> = ({ onRequestBriefing }) => {
  const [filter, setFilter] = useState('All');
  const shown = PLATFORMS.filter((p) => filter === 'All' || p.category === filter);

  return (
    <div className="relative text-ice">
      <PageBackdrop>
        <Galaxy
          density={1}
          glowIntensity={0.3}
          flareIntensity={1}
          starSpeed={0.5}
          mouseRepulsion
          clickWarp
          starColors={[]}
          hueShift={140}
          saturation={0}
          starSize={1}
          twinkleIntensity={0.3}
          speed={1}
          rotationSpeed={0.1}
          layers={4}
          direction="forward"
          repulsionStrength={2}
          mouseInteraction
          intro
          lightMode={false}
          dpr={1}
        />
      </PageBackdrop>
<div className="relative z-[1]">
      <PageHero
        tunnel={false}
        title="Transforming governance through AI-driven intelligence and technology."
        lede="We bridge the gap between private innovation and public sector transformation, helping governments and institutions serve citizens more securely and efficiently."
        meta={['AI voice bots', 'Contract intelligence', 'Predictive policing', 'Digital governance']}
      />

      <Section
        title="Platforms in production."
        lede="From automated law-enforcement dispatchers to state cyber-crime call hubs and border data integrity, our platforms deliver sovereign operational capability."
      >
        <div className="-mx-5 px-5 overflow-x-auto pb-2 mb-8">
          <RubberSegment
            items={FILTERS.map((f) => ({ value: f, label: FILTER_LABELS[f] }))}
            value={filter}
            onChange={setFilter}
            equalSlots={false}
            aria-label="Filter platforms by category"
          />
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {shown.map((p) => (
            <Card key={p.title} as="article" className="flex flex-col">
              <Mono className="text-signal">{p.category}</Mono>
              <h3 className="mt-4 font-display text-[21px] leading-[1.2] text-ice">{p.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-ice/65">{p.description}</p>
              <ul className="mt-6 space-y-2.5 text-[14px] text-ice/80">
                {p.deliverables.map((d) => (
                  <li key={d} className="flex gap-3">
                    <span className="mt-[9px] w-3 h-px bg-signal shrink-0" aria-hidden="true" />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <div className="pt-5 border-t border-hairline flex gap-3 text-[13.5px] leading-[1.5] text-ember">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-ember shrink-0" aria-hidden="true" />
                  {p.impact}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Full-spectrum engineering."
        lede="End-to-end architecture tailored for high-security public mandates."
      >
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-hairline">
          {CAPABILITIES.map(({ title, icon: Icon, desc }) => (
            <li key={title} className="border-r border-b border-hairline p-7 sm:p-8">
              <Icon size={20} className="text-signal" aria-hidden="true" />
              <h3 className="mt-5 font-display text-[18px] text-ice">{title}</h3>
              <p className="mt-2.5 text-[14.5px] leading-[1.6] text-ice/60">{desc}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="How we deliver."
        lede="Innovation, security and advanced technology combined into scalable systems that improve efficiency, strengthen operations and adapt as challenges evolve."
      >
        <ol className="grid lg:grid-cols-3 gap-5">
          {PHASES.map((phase, i) => (
            <li key={phase.name} className="relative">
              <Card className="h-full">
                <div className="flex items-center gap-3 font-mono text-[12px]">
                  <span className="text-signal">0{i + 1}</span>
                  <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
                  <span className="text-slate">Phase {i + 1} of 3</span>
                </div>
                <h3 className="mt-6 font-display text-[22px] text-ice">{phase.name}</h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-ice/65">{phase.description}</p>
                <ul className="mt-6 pt-5 border-t border-hairline space-y-2.5 text-[14px] text-ice/80">
                  {phase.points.map((pt) => (
                    <li key={pt} className="flex gap-3">
                      <span className="mt-[9px] w-3 h-px bg-signal shrink-0" aria-hidden="true" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <CtaBand
        title="Prepared to modernize public infrastructure or enterprise governance?"
        body="Engage our multidisciplinary leadership for strategic intelligence and an engineering roadmap assessment."
        action="Start an advisory inquiry"
        onAction={onRequestBriefing}
      />
    </div>
</div>
  );
};
