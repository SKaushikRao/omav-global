import React from 'react';

interface HowWeThinkSectionProps {
  accentColor?: string;
}

// Each scene's key explains what the globe is showing at that moment
type KeyMark = { shape: 'dot' | 'square' | 'diamond' | 'line' | 'ring'; tone: 'signal' | 'ember' | 'ice'; label: string };

const STEPS: {
  id: string;
  title: string;
  body: string;
  keyTitle: string;
  marks: KeyMark[];
}[] = [
  {
    id: 'data',
    title: 'Data',
    body: 'The world produces more information than any institution can read. We begin with what is openly knowable: law, policy, research, markets and public sources.',
    keyTitle: 'Open data moving between 28 hubs',
    marks: [
      { shape: 'dot', tone: 'signal', label: 'Signals' },
      { shape: 'square', tone: 'ember', label: 'Records' },
      { shape: 'diamond', tone: 'ice', label: 'Media' },
    ],
  },
  {
    id: 'intelligence',
    title: 'Intelligence',
    body: 'We connect it. Patterns, actors and dependencies emerge when information is read across disciplines rather than within them.',
    keyTitle: 'The densest settlements, read as one network',
    marks: [
      { shape: 'dot', tone: 'ember', label: 'Settlement' },
      { shape: 'line', tone: 'signal', label: 'Connection' },
    ],
  },
  {
    id: 'understanding',
    title: 'Understanding',
    body: 'We interpret it through the lenses of law, technology and governance, until the picture is clear enough to act on.',
    keyTitle: 'Raw signal, resolved by the lens',
    marks: [
      { shape: 'line', tone: 'ice', label: 'Lens' },
      { shape: 'dot', tone: 'signal', label: 'Resolved density' },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy',
    body: 'We turn understanding into direction: policy positions, governance frameworks, partnerships and programmes with a clear line of sight to outcomes.',
    keyTitle: 'Many candidate routes, seven kept, one destination',
    marks: [
      { shape: 'line', tone: 'ice', label: 'Candidate' },
      { shape: 'line', tone: 'ember', label: 'Chosen route' },
      { shape: 'ring', tone: 'ember', label: 'Objective' },
    ],
  },
  {
    id: 'impact',
    title: 'Impact',
    body: 'And we stay through delivery, because advice only matters when it changes what happens next.',
    keyTitle: 'Reach, spreading across settled land',
    marks: [
      { shape: 'ring', tone: 'ember', label: 'Wavefront' },
      { shape: 'dot', tone: 'ember', label: 'People reached' },
    ],
  },
];

// Text sits opposite the globe, which alternates left / right per scene
const TEXT_RIGHT = [true, false, true, false, true];

const TONE: Record<KeyMark['tone'], string> = {
  signal: 'var(--color-signal)',
  ember: 'var(--color-ember)',
  ice: 'var(--color-ice)',
};

function Mark({ shape, tone }: Pick<KeyMark, 'shape' | 'tone'>) {
  const c = TONE[tone];
  if (shape === 'line') return <span className="block w-4 h-px" style={{ background: c }} />;
  if (shape === 'ring') return <span className="block w-2.5 h-2.5 rounded-full" style={{ boxShadow: `inset 0 0 0 1px ${c}` }} />;
  if (shape === 'square') return <span className="block w-2 h-2" style={{ background: c }} />;
  if (shape === 'diamond') return <span className="block w-2 h-2 rotate-45" style={{ background: c }} />;
  return <span className="block w-2 h-2 rounded-full" style={{ background: c }} />;
}

export const HowWeThinkSection: React.FC<HowWeThinkSectionProps> = () => {
  return (
    <div className="relative">
      <div id="how" className="min-h-[80vh] flex items-center">
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
          <div className="max-w-[560px] pointer-events-auto">
            <h2 className="text-[clamp(28px,3.2vw,46px)] leading-[1.05] text-ice">
              From scattered signals to decisions that hold.
            </h2>
            <p className="mt-5 max-w-[480px] text-[17px] leading-[1.6] text-ice/70">
              Institutional clarity is rarely built from more data. It comes from interpreting signals across
              technology, constitution and statecraft, in five moves.
            </p>
            <ol className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11.5px] text-slate">
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:text-ice transition-colors duration-150 rounded-[4px]">
                    <span className="text-signal">0{i + 1}</span> {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {STEPS.map((step, i) => (
        <section
          key={step.id}
          id={step.id}
          aria-labelledby={`${step.id}-title`}
          className="omav-step min-h-[115vh] flex items-center max-lg:items-start max-lg:pt-[16vh]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
            <div className={`max-w-[520px] pointer-events-auto ${TEXT_RIGHT[i] ? 'lg:ml-auto' : ''}`}>
              <div className="flex items-center gap-3 font-mono text-[12px]">
                <span className="text-signal">0{i + 1}</span>
                <span className="h-px flex-1 max-w-[120px] bg-hairline" aria-hidden="true" />
                <span className="text-slate">05</span>
              </div>
              <h3
                id={`${step.id}-title`}
                className="mt-5 uppercase text-[clamp(26px,7.4vw,40px)] lg:text-[clamp(34px,2.9vw,46px)] leading-[0.95] tracking-[-0.02em] text-ice"
              >
                {step.title}
              </h3>
              <p className="mt-6 text-[17px] sm:text-[18px] leading-[1.6] text-ice/75">{step.body}</p>

              <div className="reticle mt-8 px-4 py-3.5">
                <div className="font-mono text-[11px] text-slate">{step.keyTitle}</div>
                <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-ice/80">
                  {step.marks.map((m) => (
                    <li key={m.label} className="flex items-center gap-2">
                      <Mark shape={m.shape} tone={m.tone} />
                      {m.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      <div className="h-[40vh]" />
    </div>
  );
};
