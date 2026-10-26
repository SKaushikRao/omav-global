import React from 'react';
import { OmavMark } from './OmavMark';
import { Award, GraduationCap, ShieldCheck } from 'lucide-react';

interface AboutFoundersSectionProps {
  accentColor?: string;
}

export const AboutFoundersSection: React.FC<AboutFoundersSectionProps> = ({
  accentColor = '#8CC8D8',
}) => {
  return (
    <section
      id="about"
      className="relative z-10 bg-transparent py-24 sm:py-36 border-t border-[#DCE4EE]/10"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
        {/* Top: About Overview & Mark Emblem */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-stretch">
          <div className="flex-[1.4] max-w-[760px]">
            <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
              <span
                className="block w-7 h-[1px]"
                style={{ backgroundColor: accentColor }}
              />
              <span>ABOUT OMAV GLOBAL</span>
            </div>

            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[50px] font-medium tracking-[-0.03em] leading-[1.1] text-[#F2F5F9]">
              Advice for institutions working where technology, law and public purpose meet.
            </h2>

            <p className="mt-7 text-base sm:text-[17px] text-[#AEB7C3] leading-[1.65]">
              OMAV Global Consultancy Services is a multidisciplinary advisory practice. We bring legal rigour, technological fluency and an international outlook to the questions government bodies, enterprises and research institutions find hardest to answer.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#DCE4EE]/10 text-xs text-[#8C96A6] font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#8CC8D8]" />
                <span>Constitutional AI Governance</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#8CC8D8]" />
                <span>GovTech Innovation Award Winning</span>
              </div>
            </div>
          </div>

          {/* OMAV Mark & Motto Card */}
          <div className="flex-1 min-w-[300px] flex flex-col items-center justify-center text-center border border-[#DCE4EE]/14 rounded-lg p-8 sm:p-12 bg-[#05070B]/80 backdrop-blur-md shadow-2xl shadow-black/80">
            <OmavMark width={160} height={116} idPrefix="aboutCard" />

            <div className="mt-6 font-jost text-3xl font-medium tracking-[0.16em] text-[#F2F5F9]">
              OMAV
            </div>

            <div
              lang="sa"
              className="mt-3.5 font-sanskrit text-2xl sm:text-3xl text-[#DCE3EB] tracking-wide"
            >
              ॥ अधिकाराणां कृते ॥
            </div>

            <div className="mt-2 text-sm text-[#AEB7C3] font-mono">
              For the sake of rights
            </div>

            <div
              className="mt-6 w-7 h-[1px]"
              style={{ backgroundColor: accentColor }}
            />

            <p className="mt-5 text-xs text-[#8C96A6] max-w-[260px] leading-relaxed">
              The principle at the centre of our mark and the benchmark for every system we construct.
            </p>
          </div>
        </div>

        {/* Founders Leadership Section */}
        <div className="mt-24 sm:mt-32">
          <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
            <span
              className="block w-7 h-[1px]"
              style={{ backgroundColor: accentColor }}
            />
            <span>FOUNDERS</span>
          </div>

          <p className="mt-5 text-2xl sm:text-3xl lg:text-[34px] font-medium leading-[1.25] tracking-[-0.02em] text-[#E9EDF3] max-w-[880px]">
            Priya Lalwani and Varad Ozarkar co-founded OMAV Global to bring strategy, technology and governance to the institutions shaping what comes next.
          </p>

          <div className="mt-12 border-b border-[#DCE4EE]/10">
            {/* Founder 1: Priya Lalwani */}
            <div className="py-12 border-t border-[#DCE4EE]/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4">
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
                  Priya Lalwani
                </h3>
                <div className="mt-2 text-sm text-[#AEB7C3]">
                  Co-founder
                </div>
                <div
                  className="mt-4 text-xs font-mono tracking-[0.18em] leading-relaxed font-semibold uppercase"
                  style={{ color: accentColor }}
                >
                  STRATEGY · PUBLIC-SECTOR TRANSFORMATION · OPERATIONS
                </div>

                <div className="mt-6 flex flex-col gap-2.5 text-xs text-[#8C96A6] font-mono">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={15} className="text-[#8CC8D8]" />
                    <span>MBA, Columbia Business School</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={15} className="text-[#8CC8D8]" />
                    <span>GovTech Innovation Award Winner</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4 text-base leading-relaxed text-[#AEB7C3]">
                <p className="text-[#DCE3EB] font-medium text-lg leading-normal">
                  Priya Lalwani is a co-founder of OMAV Global, where she leads the firm’s strategy, operations and public-sector transformation work. She holds an MBA in Corporate Strategy and Operations from Columbia Business School.
                </p>
                <p>
                  Priya has led multi-million-dollar modernisation programmes for US state governments, directing cross-functional teams of more than sixty professionals across two continents. Her coordination of a twenty-four-hour response to a state-level security incident was recognised with the GovTech Innovation Award.
                </p>
                <p>
                  Previously, as Chief Strategy Officer and a founding executive of an education venture serving Europe, the Middle East, Africa and the United States, she more than doubled revenue and introduced AI-enabled analytics and matching that improved student retention by a quarter. At Columbia, she served as Vice President of the South Asian Business Association.
                </p>
              </div>
            </div>

            {/* Founder 2: Varad Ozarkar */}
            <div className="py-12 border-t border-[#DCE4EE]/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4">
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
                  Varad Ozarkar
                </h3>
                <div className="mt-2 text-sm text-[#AEB7C3]">
                  Co-founder
                </div>
                <div
                  className="mt-4 text-xs font-mono tracking-[0.18em] leading-relaxed font-semibold uppercase"
                  style={{ color: accentColor }}
                >
                  AI GOVERNANCE · CYBER POLICY · INTERNATIONAL STRATEGY
                </div>

                <div className="mt-6 flex flex-col gap-2.5 text-xs text-[#8C96A6] font-mono">
                  <div className="flex items-center gap-2">
                    <Award size={15} className="text-[#8CC8D8]" />
                    <span>Felicitated by Hon’ble Chief Minister of Maharashtra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-[#8CC8D8]" />
                    <span>DSCI & NASSCOM BSE Honoree</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={15} className="text-[#8CC8D8]" />
                    <span>Harvard India Conference (2025)</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4 text-base leading-relaxed text-[#AEB7C3]">
                <p className="text-[#DCE3EB] font-medium text-lg leading-normal">
                  Varad Ozarkar is a co-founder of OMAV Global, where he leads the firm’s work on AI governance and international strategy. His platforms are in use across the Maharashtra state administration.
                </p>
                <p>
                  Varad conceived and deployed Maharashtra’s first AI-based public-sector recruitment system, designed for transparency and constitutional bias controls, and built the state’s cyber-safety platforms, including an AI-powered cyber-crime call agent and the Maharashtra Cyber Safe app. The work was felicitated by the Hon’ble Chief Minister of Maharashtra and honoured at the Bombay Stock Exchange during DSCI and NASSCOM’s “Ring the Bell for Security & Privacy.”
                </p>
                <p>
                  He advises state law-enforcement leadership on AI and cyber strategy, and helped shape the New Jersey–India Mission on Investment and Strategy with the office of Governor Phil Murphy. He was invited to the Harvard India Conference in 2025.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
