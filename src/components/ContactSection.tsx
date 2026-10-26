import React from 'react';
import { ArrowRight, Mail, MapPin } from 'lucide-react';

interface ContactSectionProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  accentColor = '#8CC8D8',
  onRequestBriefing,
}) => {
  return (
    <section
      id="contact"
      className="relative z-10 bg-[#05070B] py-28 sm:py-40 border-t border-[#DCE4EE]/6"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14">
        <div className="flex items-center gap-3.5 text-xs tracking-[0.3em] text-[#9AA4B2] font-mono">
          <span
            className="block w-7 h-[1px]"
            style={{ backgroundColor: accentColor }}
          />
          <span>CONTACT</span>
        </div>

        <h2 className="mt-6 text-4xl sm:text-6xl lg:text-[88px] font-medium tracking-[-0.04em] leading-[1] text-[#F2F5F9]">
          Begin a conversation.
        </h2>

        <div className="mt-14 sm:mt-18 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <p className="max-w-[460px] text-lg text-[#9AA4B2] leading-relaxed">
            For advisory mandates, public systems modernization, research collaborations, and speaking enquiries, write to us directly.
          </p>

          <div className="flex flex-wrap gap-10 sm:gap-16">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-[0.24em] text-[#8C96A6]">
                <Mail size={13} className="text-[#8CC8D8]" />
                <span>DIRECT ADVISORY DESK</span>
              </div>
              <a
                href="mailto:contact@omavglobal.com"
                className="inline-flex items-center min-h-[44px] mt-2 text-xl sm:text-2xl font-medium text-[#E9EDF3] hover:text-white border-b border-[#DCE4EE]/30 transition-colors"
              >
                contact@omavglobal.com
              </a>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-[0.24em] text-[#8C96A6]">
                <MapPin size={13} className="text-[#8CC8D8]" />
                <span>OFFICE & HUBS</span>
              </div>
              <div className="flex items-center min-h-[44px] mt-2 text-xl sm:text-2xl text-[#E9EDF3] font-medium">
                New York · Mumbai
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-4 items-center">
          <button
            onClick={onRequestBriefing}
            className="inline-flex items-center gap-2.5 h-12 px-7 rounded-[3px] bg-[#E9EDF3] text-[#05070B] text-sm font-medium tracking-wide transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-white/10 cursor-pointer group"
          >
            <span>Write to OMAV</span>
            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>

          <a
            href="mailto:contact@omavglobal.com"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-[3px] border border-[#E9EDF3]/20 text-[#AEB7C3] hover:text-white hover:border-[#E9EDF3]/50 text-sm font-medium transition-colors"
          >
            Open Mail Client
          </a>
        </div>
      </div>
    </section>
  );
};
