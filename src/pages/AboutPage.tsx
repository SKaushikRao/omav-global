import React from 'react';
import { OmavMark } from '../components/OmavMark';
import { Card, CtaBand, Mono, PageBackdrop, PageHero, Section } from '../components/page/PageParts';
import Galaxy from '../components/ui/Galaxy';

interface AboutPageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

const FOUNDERS = [
  {
    name: 'Priya Lalwani',
    focus: 'Strategy · Public-sector transformation · Operations',
    bio: [
      'Priya Lalwani is a co-founder of OMAV Global, where she leads the firm’s strategy, operations and public-sector transformation work. She holds an MBA in Corporate Strategy and Operations from Columbia Business School.',
      'Priya has led multi-million-dollar modernisation programmes for US state governments, directing cross-functional teams of more than sixty professionals across two continents. Her coordination of a twenty-four-hour response to a state-level security incident was recognised with the GovTech Innovation Award.',
      'Previously, as Chief Strategy Officer and a founding executive of an education venture serving Europe, the Middle East, Africa and the United States, she more than doubled revenue and introduced AI-enabled analytics and matching that improved student retention by a quarter. At Columbia, she served as Vice President of the South Asian Business Association.',
    ],
  },
  {
    name: 'Varad Ozarkar',
    focus: 'AI governance · Cyber policy · International strategy',
    bio: [
      'Varad Ozarkar is a co-founder of OMAV Global, where he leads the firm’s work on AI governance and international strategy. His platforms are in use across the Maharashtra state administration.',
      'Varad conceived and deployed Maharashtra’s first AI-based public-sector recruitment system, designed for transparency and constitutional bias controls, and built the state’s cyber-safety platforms, including an AI-powered cyber-crime call agent and the Maharashtra Cyber Safe app. The work was felicitated by the Hon’ble Chief Minister of Maharashtra and honoured at the Bombay Stock Exchange during DSCI and NASSCOM’s “Ring the Bell for Security & Privacy.”',
      'He advises state law-enforcement leadership on AI and cyber strategy, and helped shape the New Jersey–India Mission on Investment and Strategy with the office of Governor Phil Murphy. He was invited to the Harvard India Conference in 2025.',
    ],
  },
];

const MILESTONES = [
  {
    year: '2025',
    title: 'Harvard India Conference invitation',
    detail:
      'Co-founder Varad Ozarkar invited to address international leadership on public sector AI recruitment and constitutional bias safeguards.',
  },
  {
    year: '2024',
    title: 'State AI recruitment & Cyber Safe platforms',
    detail:
      'Conceived and deployed Maharashtra state administration’s first AI recruitment engine and citizen cyber-crime call agent; felicitated by the Hon’ble Chief Minister.',
  },
  {
    year: '2023',
    title: 'DSCI & NASSCOM BSE honoree',
    detail:
      'Honoured at the Bombay Stock Exchange during "Ring the Bell for Security & Privacy" for state-level cyber-defense engineering.',
  },
  {
    year: '2022',
    title: 'GovTech Innovation Award',
    detail:
      'Priya Lalwani led a 24-hour rapid security incident response and multimillion-dollar public IT modernization recognized with the GovTech Innovation Award.',
  },
  {
    year: '2021',
    title: 'New Jersey–India Mission on Investment',
    detail: 'Shaped high-level bilateral technology and investment mission with the office of Governor Phil Murphy.',
  },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onRequestBriefing }) => (
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
      title="Advice for institutions working where technology, law and public purpose meet."
      lede="OMAV Global Consultancy Services is a multidisciplinary advisory practice. We bring legal rigour, technological fluency and an international outlook to the questions government bodies, enterprises and research institutions find hardest to answer."
      aside={
        <Card className="!p-8 text-center">
          <div className="flex justify-center">
            <OmavMark width={150} height={109} idPrefix="aboutHero" />
          </div>
          <div className="mt-6 font-sanskrit text-[26px] text-ice" lang="sa">
            ॥ अधिकाराणां कृते ॥
          </div>
          <Mono className="mt-2 text-signal">For the sake of rights</Mono>
          <p className="mt-5 text-[14px] leading-[1.6] text-ice/60">
            The principle at the centre of our mark and the benchmark for every system we construct.
          </p>
        </Card>
      }
    />

    <Section
      title="The founders."
      lede="Priya Lalwani and Varad Ozarkar co-founded OMAV Global to bring strategy, technology and governance to the institutions shaping what comes next."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        {FOUNDERS.map((f) => (
          <Card key={f.name} as="article" className="!p-8 sm:!p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-[26px] sm:text-[30px] leading-tight text-ice">{f.name}</h3>
                <Mono className="mt-2">Co-founder</Mono>
              </div>
              <span
                aria-hidden="true"
                className="grid place-items-center w-12 h-12 rounded-full font-display text-[15px] text-abyss bg-ice shrink-0"
              >
                {f.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </span>
            </div>
            <div className="mt-6 pb-6 border-b border-hairline font-mono text-[11.5px] text-signal">{f.focus}</div>
            <div className="mt-6 space-y-4 text-[15.5px] leading-[1.7] text-ice/72">
              {f.bio.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>

    <Section
      title="Recognition and public impact."
      lede="Demonstrated execution across state administrations and global forums."
    >
      <ol className="relative border-l border-hairline ml-1.5">
        {MILESTONES.map((m) => (
          <li key={m.year} className="relative pl-8 sm:pl-12 pb-10 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[5px] top-2 w-[9px] h-[9px] rounded-full bg-abyss shadow-[inset_0_0_0_2px_var(--color-signal)]"
            />
            <div className="grid md:grid-cols-[96px_minmax(0,4fr)_minmax(0,7fr)] gap-x-8 gap-y-2">
              <span className="font-mono text-[14px] text-signal pt-0.5">{m.year}</span>
              <h3 className="font-display text-[18px] sm:text-[20px] leading-[1.25] text-ice">{m.title}</h3>
              <p className="text-[15.5px] leading-[1.65] text-ice/65 max-w-[620px]">{m.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>

    <CtaBand
      title="Grounded in legal precision and democratic accountability."
      body="Whether structuring constitutional AI, state cyber-safety networks or international technology transfer, speak directly with our partners."
      action="Connect with our partners"
      onAction={onRequestBriefing}
    />
  </div>
</div>
);
