import React, { useState, useEffect } from 'react';
import { OmavMark } from './OmavMark';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onRequestBriefing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onRequestBriefing,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'approach', label: 'Approach' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header
      data-intro-reveal="fade"
      style={{ '--intro-delay': '1.25s' } as React.CSSProperties}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#05070B]/90 backdrop-blur-md border-b border-[#DCE4EE]/10 py-3 shadow-2xl shadow-black/40'
          : 'bg-gradient-to-b from-[#05070B]/85 to-transparent py-4.5'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single element brand wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          aria-label="OMAV Global Home"
          className="flex items-center gap-3 text-[#E9EDF3] group shrink-0 no-underline bg-transparent border-none p-0 cursor-pointer text-left"
        >
          <OmavMark width={38} height={28} idPrefix="header" />
          <div className="flex flex-col leading-none">
            <span className="font-jost text-lg tracking-[0.16em] font-medium text-[#F2F5F9] group-hover:text-white transition-colors">
              OMAV
            </span>
            <span className="text-[9px] tracking-[0.44em] text-[#9AA4B2] mt-1 font-medium">
              GLOBAL
            </span>
          </div>
        </button>

        {/* Zone 2: 4–5 clean single-line nav links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#AEB7C3]"
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`hover:text-white transition-colors py-1 whitespace-nowrap shrink-0 bg-transparent border-none cursor-pointer relative ${
                currentPage === link.id
                  ? 'text-white font-semibold'
                  : 'text-[#AEB7C3]'
              }`}
            >
              {link.label}
              {currentPage === link.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8CC8D8] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRequestBriefing}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-medium tracking-wide uppercase text-[#E9EDF3] bg-transparent border border-[#E9EDF3]/25 hover:border-[#E9EDF3]/80 hover:bg-[#E9EDF3]/5 transition-all duration-200 rounded-[3px] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Contact
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#AEB7C3] hover:text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#05070B]/98 backdrop-blur-xl border-b border-[#DCE4EE]/10 px-6 py-6 flex flex-col gap-4 text-sm font-medium text-[#AEB7C3]">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`text-left py-2 transition-colors cursor-pointer ${
                currentPage === link.id ? 'text-white font-semibold' : 'hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestBriefing();
              }}
              className="w-full text-center py-2.5 text-xs font-medium uppercase tracking-wider bg-[#E9EDF3] text-[#05070B] rounded-[3px]"
            >
              Contact / Request Briefing
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
