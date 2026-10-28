import React, { useState } from 'react';
import { Card, CtaBand, Mono, PageHero, Section } from '../components/page/PageParts';

interface ExpertisePageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

const PRACTICES = [
  {
    title: 'Strategic Intelligence & Research',
    summary:
      'Rigorous open-source research and analysis that turns scattered information into a clear picture of risks, actors and opportunities.',
    domains: ['Geopolitical Actor Mapping', 'Supply Chain Vulnerability', 'Foreign Tech Policy Intercepts', 'OSINT Threat Radar'],
    methodology:
      'Triangulating technical signals, legal registry filings, academic literature, and multilateral records to eliminate intelligence blind spots.',
    clientBenefit:
      'Provides senior ministers and chief executives with defensible foresight prior to capital or legislative commitments.',
  },
  {
    title: 'AI Governance & Responsible Innovation',
    summary:
      'Policies, frameworks and oversight that let institutions adopt AI with accountability, legality and public trust built in.',
    domains: [
      'Algorithmic Audit Frameworks',
      'Constitutional Equality & Bias Guardrails',
      'Automated Decision Audit Trails',
      'Procurement Standards',
    ],
    methodology:
      'Mathematical bias testing aligned with constitutional equal-protection doctrines and international AI safety treaties.',
    clientBenefit:
      'Enables government bodies to deploy automated ranking, hiring, and triage engines with zero risk of judicial invalidation.',
  },
  {
    title: 'Cyber & Digital-Law Advisory',
    summary:
      'Counsel where technology meets law: cybercrime and cyber resilience, data protection and emerging digital regulation.',
    domains: [
      'State-Level Incident Response',
      'Critical Infrastructure Resilience',
      'Cross-Border Data Treaties',
      'Digital Evidence Standards',
    ],
    methodology:
      'Combining deep network packet forensics with criminal jurisprudence and statutory compliance mandates.',
    clientBenefit:
      'Award-winning coordination of 24-hour response to state-level security incidents recognized by GovTech awards.',
  },
  {
    title: 'Public-Sector Strategy',
    summary:
      'Helping government bodies define problems precisely and deliver technology-led programmes that work in practice.',
    domains: [
      'Inter-Agency Orchestration',
      'Civic Modernization Roadmaps',
      'Legacy System Sunset Protocols',
      'Public Performance Metrics',
    ],
    methodology:
      'Translating political mandates into clear technical milestones, change-management strategies, and verified public outcomes.',
    clientBenefit: 'Prevents multimillion-dollar budget overruns common in complex government IT transformations.',
  },
  {
    title: 'International Partnerships',
    summary: 'Structuring collaboration between governments, institutions and research bodies across borders and sectors.',
    domains: [
      'Sub-National Bilateral Corridors',
      'Bilateral Technology Transfer',
      'Academic-State Innovation Hubs',
      'Multilateral Treaties',
    ],
    methodology:
      'Architecting high-trust compacts that navigate disparate export controls, security clearances, and jurisdictional friction.',
    clientBenefit:
      'Directly shaped international investment missions, including the New Jersey–India Mission with Governor Phil Murphy.',
  },
  {
    title: 'Policy-Led Technology Transformation',
    summary:
      'Aligning technology adoption with policy objectives, so that systems serve their public purpose and stand up to scrutiny.',
    domains: [
      'Legislative Codification into Code',
      'Administrative Law Verification',
      'Transparency Portals',
      'Citizen Rights Auditing',
    ],
    methodology:
      'Directly mapping statutory sections to software tests and immutable event streams before code reaches production.',
    clientBenefit:
      'Ensures that civic technology upholds democratic norms and stands up to judicial, legislative, and media scrutiny.',
  },
];

export const ExpertisePage: React.FC<ExpertisePageProps> = ({ onRequestBriefing }) => {
  const [active, setActive] = useState(0);
  const p = PRACTICES[active];

  return (
    <div className="relative bg-abyss text-ice">
      <PageHero
        title="Where law, technology and public policy meet."
        lede="The questions that matter rarely sit within one discipline. A technology decision is often a legal one; a policy choice can carry global consequences."
        meta={['Six practices', 'One multidisciplinary team', 'Government, enterprise & research']}
      />

      <Section
        title="Six practices, read together."
        lede="Each engagement draws on several of them at once. Choose a practice to see how we work and what it changes for the institution."
      >
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-12 items-start">
          {/* Index */}
          <ol className="border-t border-hairline" role="tablist" aria-label="Practices">
            {PRACTICES.map((item, i) => {
              const on = i === active;
              return (
                <li key={item.title} className="border-b border-hairline">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="practice-panel"
                    onClick={() => setActive(i)}
                    className={`group w-full grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-4 py-5 text-left cursor-pointer rounded-[7px] transition-colors duration-150 ${
                      on ? 'text-ice' : 'text-ice/55 hover:text-ice'
                    }`}
                  >
                    <span className={`font-mono text-[12px] ${on ? 'text-signal' : 'text-slate'}`}>0{i + 1}</span>
                    <span className="font-display text-[17px] sm:text-[19px] leading-tight">{item.title}</span>
                    <span
                      aria-hidden="true"
                      className={`w-2 h-2 rounded-full transition-[background-color,transform] duration-200 ${
                        on ? 'bg-signal scale-100' : 'bg-ice/15 scale-75 group-hover:bg-ice/40'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Detail */}
          <div id="practice-panel" role="tabpanel" aria-live="polite" className="lg:sticky lg:top-28">
            <Card key={active} className="omav-pop">
              <Mono className="text-signal">Practice 0{active + 1} / 06</Mono>
              <h3 className="mt-4 font-display text-[clamp(22px,2.2vw,30px)] leading-[1.15] text-ice">{p.title}</h3>
              <p className="mt-4 text-[16px] leading-[1.65] text-ice/75">{p.summary}</p>

              <ul className="mt-7 flex flex-wrap gap-2">
                {p.domains.map((d) => (
                  <li key={d} className="px-3 h-8 inline-flex items-center rounded-[8px] bg-ice/[0.05] text-[13px] text-ice/80">
                    {d}
                  </li>
                ))}
              </ul>

              <dl className="mt-8 grid sm:grid-cols-2 gap-6 pt-7 border-t border-hairline">
                <div>
                  <dt className="font-mono text-[11.5px] text-slate">Methodology</dt>
                  <dd className="mt-2 text-[14.5px] leading-[1.6] text-ice/80">{p.methodology}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11.5px] text-slate">What it changes</dt>
                  <dd className="mt-2 text-[14.5px] leading-[1.6] text-ember">{p.clientBenefit}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </Section>

      <CtaBand
        title="A question that crosses law, technology and policy?"
        body="Tell us what you are deciding. We will assemble the right combination of practices around it."
        action="Request a briefing"
        onAction={onRequestBriefing}
      />
    </div>
  );
};
