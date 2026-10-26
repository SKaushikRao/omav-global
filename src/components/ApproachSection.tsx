import React from 'react';

interface ApproachSectionProps {
  accentColor?: string;
}

const commitments = [
  {
    num: '01',
    title: 'Intelligence',
    text: 'We understand complex information, technology, emerging risks and the world around us.',
    detail: 'Direct synthesis of technical architectures with jurisdictional precedents.',
  },
  {
    num: '02',
    title: 'Advisory',
    text: 'We translate intelligence into decisions, policy, partnerships and strategic outcomes.',
    detail: 'Executive and sovereign counsel that translates directly into operational capability.',
  },
  {
    num: '03',
    title: 'Global perspective',
    text: 'Our thinking extends beyond countries, sectors and conventional boundaries.',
    detail: 'International bridges connecting US, Indian, European and emerging sovereign ecosystems.',
  },
  {
    num: '04',
    title: 'Institutional credibility',
    text: 'We approach important work with precision, discretion and seriousness.',
    detail: 'Proven history of advising state governors, chief ministers, and public administrations.',
  },
];

export const ApproachSection: React.FC<ApproachSectionProps> = ({
  accentColor = '#8CC8D8',
}) => {
  return (
    <section
      id="approach"
      className="relative z-10 bg-[#080B11] py-24 sm:py-36 border-t border-[#DCE4EE]/6"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
        <div className="max-w-[760px] mb-16 sm:mb-20">
          <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
            <span
              className="block w-7 h-[1px]"
              style={{ backgroundColor: accentColor }}
            />
            <span>APPROACH</span>
          </div>

          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[50px] font-medium tracking-[-0.03em] leading-[1.1] text-[#F2F5F9]">
            Four commitments behind every engagement.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {commitments.map((item) => (
            <div
              key={item.num}
              className="border-t border-[#DCE4EE]/16 pt-7 flex flex-col justify-between"
            >
              <div>
                <div
                  className="font-mono text-sm tracking-widest font-semibold"
                  style={{ color: accentColor }}
                >
                  {item.num}
                </div>

                <h3 className="mt-9 text-2xl font-medium tracking-[-0.01em] text-[#F2F5F9]">
                  {item.title}
                </h3>

                <p className="mt-3.5 text-base text-[#9AA4B2] leading-relaxed">
                  {item.text}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#DCE4EE]/8 text-xs font-mono text-[#8C96A6]">
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
