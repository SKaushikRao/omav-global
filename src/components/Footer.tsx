import React from 'react';
import { OmavLockup } from './OmavMark';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-10 bg-[#05070B] border-t border-[#DCE4EE]/8 py-10 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Brand & Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
          <OmavLockup size="sm" idPrefix="footerLockup" />
          <span className="text-xs text-[#8C96A6] text-center md:text-left">
            © 2026 OMAV Global Ventures Pvt. Ltd.
          </span>
        </div>

        {/* Navigation links */}
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-[#AEB7C3]"
        >
          <button
            onClick={() => handleNav('home')}
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#AEB7C3]"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('solutions')}
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#AEB7C3]"
          >
            Solutions
          </button>
          <button
            onClick={() => handleNav('expertise')}
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#AEB7C3]"
          >
            Expertise
          </button>
          <button
            onClick={() => handleNav('approach')}
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#AEB7C3]"
          >
            Approach
          </button>
          <button
            onClick={() => handleNav('about')}
            className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer text-[#AEB7C3]"
          >
            About & Founders
          </button>
          <button
            onClick={scrollToTop}
            className="hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer text-[#8CC8D8] bg-transparent border-none p-0"
          >
            <span>Back to top</span>
            <ArrowUp size={12} />
          </button>
        </nav>
      </div>
    </footer>
  );
};
