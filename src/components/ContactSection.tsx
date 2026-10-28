import React from 'react';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { Card, Container, Mono } from './page/PageParts';

interface ContactSectionProps {
  accentColor?: string;
  onRequestBriefing: () => void;
}

// Contact details under each inner page; the page's own call to action sits above
export const ContactSection: React.FC<ContactSectionProps> = ({ onRequestBriefing }) => (
  <section id="contact" className="relative z-10 pb-24 sm:pb-32">
    <Container>
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16 items-end">
        <div>
          <h2 className="text-[clamp(30px,3.6vw,52px)] leading-[1.02] text-ice">Begin a conversation.</h2>
          <p className="mt-5 max-w-[440px] text-[16px] leading-[1.65] text-ice/65">
            For advisory mandates, public systems modernization, research collaborations and speaking enquiries, write
            to us directly.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Card className="!p-7">
            <a href="mailto:contact@omavglobal.com" className="group block rounded-[7px]">
              <Mono className="flex items-center gap-2">
                <Mail size={13} className="text-signal" aria-hidden="true" /> Advisory desk
              </Mono>
              <span className="mt-4 flex items-center justify-between gap-3 font-display text-[18px] sm:text-[20px] text-ice">
                contact@omavglobal.com
                <ArrowUpRight
                  size={18}
                  className="text-slate group-hover:text-ice transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </a>
          </Card>
          <Card className="!p-7">
            <Mono className="flex items-center gap-2">
              <MapPin size={13} className="text-signal" aria-hidden="true" /> Offices
            </Mono>
            <div className="mt-4 font-display text-[18px] sm:text-[20px] text-ice">New York · Mumbai</div>
          </Card>
          <button type="button" onClick={onRequestBriefing} className="btn btn-ghost sm:col-span-2 justify-center">
            Write to OMAV through the briefing form
          </button>
        </div>
      </div>
    </Container>
  </section>
);
