import React from 'react';
import { AboutFoundersSection } from '../components/AboutFoundersSection';
import { LightTunnel } from '../components/LightTunnel';

interface AboutPageProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  accentColor = '#8CC8D8',
  onRequestBriefing,
}) => {
  const milestones = [
    {
      year: '2025',
      title: 'Harvard India Conference Invitation',
      detail:
        'Co-founder Varad Ozarkar invited to address international leadership on public sector AI recruitment and constitutional bias safeguards.',
    },
    {
      year: '2024',
      title: 'State AI Recruitment & Cyber Safe Platforms',
      detail:
        'Conceived and deployed Maharashtra state administration’s first AI recruitment engine and citizen cyber-crime call agent; felicitated by the Hon’ble Chief Minister.',
    },
    {
      year: '2023',
      title: 'DSCI & NASSCOM BSE Honoree',
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
      detail:
        'Shaped high-level bilateral technology and investment mission with the office of Governor Phil Murphy.',
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
          <div className="max-w-[840px] bg-[#05070B]/65 backdrop-blur-md p-6 sm:p-8 rounded-lg border border-[#DCE4EE]/8">
            <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
              <span
                className="block w-7 h-[1px]"
                style={{ backgroundColor: accentColor }}
              />
              <span>ABOUT OMAV GLOBAL</span>
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[60px] font-medium tracking-tight text-white leading-[1.08]">
              Advice for institutions working where technology, law and public purpose meet.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-[#AEB7C3] leading-relaxed max-w-[720px]">
              OMAV Global Consultancy Services is a multidisciplinary advisory practice. We bring legal rigour, technological fluency and an international outlook to the questions government bodies, enterprises and research institutions find hardest to answer.
            </p>
          </div>
        </div>

        {/* Main About & Founders Section */}
        <AboutFoundersSection accentColor={accentColor} />

        {/* Institutional Track Record & Distinctions */}
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 py-20 border-t border-[#DCE4EE]/10">
          <div className="mb-12">
            <div className="text-xs font-mono tracking-widest text-[#8CC8D8] uppercase">
              Recognitions & Public Impact Milestones
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium text-white mt-2">
              Demonstrated execution across state administrations and global forums.
            </h2>
          </div>

          <div className="border-t border-[#DCE4EE]/10 divide-y divide-[#DCE4EE]/10 bg-[#05070B]/50 backdrop-blur-sm rounded-lg px-4 sm:px-6">
            {milestones.map((m, i) => (
              <div
                key={i}
                className="py-6 sm:py-8 flex flex-col md:flex-row md:items-baseline gap-4 md:gap-10 hover:bg-[#DCE4EE]/[0.03] px-3 -mx-3 rounded transition-colors"
              >
                <div
                  className="font-mono text-base font-semibold tracking-wider w-24 shrink-0"
                  style={{ color: accentColor }}
                >
                  {m.year}
                </div>
                <div className="md:w-[320px] shrink-0 font-medium text-lg text-white">
                  {m.title}
                </div>
                <div className="flex-1 text-sm sm:text-base text-[#AEB7C3] leading-relaxed">
                  {m.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Closing Mandate Callout */}
          <div className="mt-16 p-8 sm:p-12 border border-[#DCE4EE]/14 rounded-lg bg-[#080B12]/80 backdrop-blur-md text-center flex flex-col items-center shadow-2xl shadow-black/80">
            <div className="font-sanskrit text-2xl sm:text-3xl text-white">
              ॥ अधिकाराणां कृते ॥
            </div>
            <div className="text-sm font-mono text-[#8CC8D8] mt-2">
              For the sake of rights
            </div>
            <p className="mt-4 text-sm sm:text-base text-[#AEB7C3] max-w-xl leading-relaxed">
              Whether structuring constitutional artificial intelligence, state cyber-safety defense networks, or international technology transfer, our work is grounded in legal precision and democratic accountability.
            </p>
            <button
              onClick={onRequestBriefing}
              className="mt-8 px-8 py-3.5 bg-[#E9EDF3] text-[#05070B] text-xs font-medium uppercase tracking-wider rounded-[3px] hover:bg-white transition-colors cursor-pointer"
            >
              Connect With Our Partners
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
