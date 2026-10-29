import React from 'react';
import { Card, CtaBand, Mono, PageBackdrop, PageHero, Section } from '../components/page/PageParts';
import Galaxy from '../components/ui/Galaxy';
import CardSwap, { Card as SwapCard, type CardSwapHandle } from '../components/ui/CardSwap';

interface AboutPageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

const FOUNDERS = [
  {
    name: 'Priya Lalwani',
    focus: 'Strategy · Public-sector transformation · Operations',
    bio: [
      'Priya Lalwani is a co-founder of OMAV Global Ventures Pvt. Ltd., where she leads the firm’s strategy, operations and public-sector transformation work. She holds an MBA in Corporate Strategy and Operations from Columbia Business School.',
      'Priya has led multi-million-dollar modernisation programmes for US state governments, directing cross-functional teams of more than sixty professionals across two continents. Her coordination of a twenty-four-hour response to a state-level security incident was recognised with the GovTech Innovation Award.',
      'Previously, as Chief Strategy Officer and a founding executive of an education venture serving Europe, the Middle East, Africa and the United States, she more than doubled revenue and introduced AI-enabled analytics and matching that improved student retention by a quarter. At Columbia, she served as Vice President of the South Asian Business Association.',
    ],
  },
  {
    name: 'Varad Ozarkar',
    focus: 'AI governance · Cyber policy · International strategy',
    bio: [
      'Varad Ozarkar is a co-founder of OMAV Global Ventures Pvt. Ltd., where he leads the firm’s work on AI governance and international strategy. His platforms are in use across the Maharashtra state administration.',
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

type Founder = (typeof FOUNDERS)[number];
const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('');

const FounderCard: React.FC<{ f: Founder; className?: string }> = ({ f, className = '' }) => (
  <Card as="article" className={`!p-8 sm:!p-10 h-full ${className}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-display text-[26px] sm:text-[30px] leading-tight text-ice">{f.name}</h3>
        <Mono className="mt-2">Co-founder</Mono>
      </div>
      <span
        aria-hidden="true"
        className="grid place-items-center w-12 h-12 rounded-full font-display text-[15px] text-abyss bg-ice shrink-0"
      >
        {initials(f.name)}
      </span>
    </div>
    <div className="mt-6 pb-6 border-b border-hairline font-mono text-[11.5px] text-signal">{f.focus}</div>
    <div className="mt-6 space-y-4 text-[15.5px] leading-[1.7] text-ice/72">
      {f.bio.map((para) => (
        <p key={para.slice(0, 24)}>{para}</p>
      ))}
    </div>
  </Card>
);

// Side by side on wide screens. On phones the two founders share one row of
// equal tabs and one swipeable track, so neither sits above the other.
const Founders: React.FC = () => {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = React.useState(0);

  const go = (i: number) => {
    const t = trackRef.current;
    const card = t?.children[i] as HTMLElement | undefined;
    if (t && card) t.scrollTo({ left: card.offsetLeft - t.offsetLeft, behavior: 'smooth' });
  };

  const onScroll = () => {
    const t = trackRef.current;
    if (!t) return;
    const i = Math.round(t.scrollLeft / Math.max(1, t.scrollWidth - t.clientWidth));
    if (i !== current) setCurrent(i);
  };

  return (
    <>
      <div className="hidden lg:grid lg:grid-cols-2 gap-5">
        {FOUNDERS.map((f) => (
          <FounderCard key={f.name} f={f} />
        ))}
      </div>

      <div className="lg:hidden">
        <div role="tablist" aria-label="Founders" className="grid grid-cols-2 gap-2 p-1.5 rounded-[14px] bg-ice/[0.04] shadow-[inset_0_0_0_1px_rgb(220_228_238/0.1)]">
          {FOUNDERS.map((f, i) => (
            <button
              key={f.name}
              type="button"
              role="tab"
              aria-selected={current === i}
              onClick={() => go(i)}
              className={`flex items-center justify-center gap-2.5 h-12 rounded-[10px] text-[14px] transition-[background-color,color] duration-300 cursor-pointer ${
                current === i ? 'bg-ice text-abyss' : 'text-ice/70'
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid place-items-center w-7 h-7 rounded-full font-display text-[11px] transition-colors duration-300 ${
                  current === i ? 'bg-abyss text-ice' : 'bg-ice/10 text-ice'
                }`}
              >
                {initials(f.name)}
              </span>
              {f.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="omav-founders mt-5 -mx-5 sm:-mx-8 px-5 sm:px-8 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 sm:scroll-px-8"
        >
          {FOUNDERS.map((f) => (
            <div key={f.name} className="snap-start shrink-0 w-[88%] sm:w-[80%]">
              <FounderCard f={f} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Recognition as a stack of cards, one per milestone, with the years beside it
// as an index that follows the front card and jumps to any other
const Milestones: React.FC = () => {
  const swapRef = React.useRef<CardSwapHandle | null>(null);
  const [front, setFront] = React.useState(0);

  return (
    <div className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] gap-10 lg:gap-16 items-center">
      <ol className="order-2 lg:order-1 grid gap-1">
        {MILESTONES.map((m, i) => (
          <li key={m.year}>
            <button
              type="button"
              onClick={() => swapRef.current?.goTo(i)}
              aria-current={front === i ? 'true' : undefined}
              className={`group w-full grid grid-cols-[64px_minmax(0,1fr)] items-baseline gap-4 rounded-[10px] px-4 py-3.5 text-left transition-[background-color,color] duration-300 cursor-pointer ${
                front === i ? 'bg-ice/[0.06]' : 'hover:bg-ice/[0.03]'
              }`}
            >
              <span className={`font-mono text-[13px] transition-colors duration-300 ${front === i ? 'text-signal' : 'text-slate'}`}>
                {m.year}
              </span>
              <span
                className={`text-[15.5px] leading-[1.35] transition-colors duration-300 ${
                  front === i ? 'text-ice' : 'text-ice/55 group-hover:text-ice/80'
                }`}
              >
                {m.title}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="order-1 lg:order-2 h-[300px] sm:h-[440px] lg:h-[500px]">
        <CardSwap
          ref={swapRef}
          theme="omav"
          width={480}
          height={330}
          cardDistance={56}
          verticalDistance={62}
          depth={90}
          skewAmount={5}
          visibleCards={4}
          cardRadius={18}
          delay={5000}
          speed={1}
          bounce={0.3}
          parallax={0.4}
          hoverSpread={0.1}
          dim={0.55}
          autoplay
          pauseOnHover
          draggable
          onChange={setFront}
          ariaLabel="Recognition and public impact"
        >
          {MILESTONES.map((m, i) => (
            <SwapCard key={m.year}>
              <article className="flex h-full flex-col p-7 sm:p-8">
                <div className="flex items-center justify-between font-mono text-[11.5px] text-slate">
                  <span>
                    <span className="text-signal">0{i + 1}</span> / 0{MILESTONES.length}
                  </span>
                  <span>Recognition</span>
                </div>
                <div className="mt-4 font-display text-[40px] leading-none text-signal">{m.year}</div>
                <h3 className="mt-3 font-display text-[20px] leading-[1.25] text-ice">{m.title}</h3>
                <p className="mt-auto pt-3 text-[14px] leading-[1.55] text-ice/65">{m.detail}</p>
              </article>
            </SwapCard>
          ))}
        </CardSwap>
      </div>
    </div>
  );
};

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
      lede="OMAV Global Ventures Pvt. Ltd. is a multidisciplinary advisory practice. We bring legal rigour, technological fluency and an international outlook to the questions government bodies, enterprises and research institutions find hardest to answer."
      aside={
        <figure className="flex flex-col items-center text-center">
          {/* The mark exactly as supplied, on its own white ground */}
          <img
            src="/logo.png"
            alt="The OMAV logo: a striped globe with a blue centre, wings and a pen nib, the word OMAV, and the motto अधिकाराणां कृते"
            width={844}
            height={799}
            className="w-[min(300px,72vw)] h-auto rounded-[22px] shadow-[0_30px_70px_-30px_rgb(0_0_0/0.9)]"
          />
          <figcaption className="mt-8">
            <Mono className="text-signal">For the sake of rights</Mono>
            <p className="mt-3 max-w-[340px] text-[15px] leading-[1.6] text-ice/75 [text-shadow:0_2px_18px_rgb(5_7_11/0.9)]">
              The principle at the centre of our mark and the benchmark for every system we construct.
            </p>
          </figcaption>
        </figure>
      }
    />

    <Section
      title="The founders."
      lede="Priya Lalwani and Varad Ozarkar co-founded OMAV Global Ventures Pvt. Ltd. to bring strategy, technology and governance to the institutions shaping what comes next."
    >
      <Founders />
    </Section>
    <Section
      title="Recognition and public impact."
      lede="Demonstrated execution across state administrations and global forums."
    >
      <Milestones />
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
