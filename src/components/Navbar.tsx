import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { OmavMark } from './OmavMark';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onRequestBriefing: () => void;
}

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'approach', label: 'Approach' },
  { id: 'about', label: 'About' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onRequestBriefing }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      data-intro-reveal="fade"
      style={{ '--intro-delay': '1.25s' } as React.CSSProperties}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-300 bg-gradient-to-b from-abyss/90 via-abyss/55 to-transparent ${
          scrolled ? 'opacity-100' : 'opacity-70'
        }`}
      />
      <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 h-[76px] flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          aria-label="OMAV Global, home"
          className="flex items-center gap-3 text-ice shrink-0 cursor-pointer rounded-[7px]"
        >
          <OmavMark width={38} height={28} idPrefix="header" />
          <span className="flex flex-col leading-none text-left">
            <span className="font-jost text-[15px] tracking-[0.22em]">OMAV</span>
            <span className="mt-1.5 font-mono text-[9px] tracking-[0.42em] text-slate">GLOBAL</span>
          </span>
        </button>

        {/* Primary navigation: a track with a sliding thumb on the current page */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="surface flex items-center gap-0.5 rounded-[12px] p-1">
            {NAV_LINKS.map((link) => {
              const active = currentPage === link.id;
              return (
                <li key={link.id} className="relative">
                  {active && (
                    <motion.span
                      layoutId="nav-thumb"
                      className="absolute inset-0 rounded-[9px] bg-ice/[0.1] shadow-[inset_0_0_0_1px_rgb(233_237_243/0.12)]"
                      transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.3, bounce: 0 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleNavClick(link.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative h-9 px-3.5 rounded-[9px] text-[13.5px] font-medium transition-colors duration-150 cursor-pointer ${
                      active ? 'text-ice' : 'text-slate hover:text-ice'
                    }`}
                  >
                    {link.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={onRequestBriefing} className="btn btn-primary btn-sm hidden sm:inline-flex">
            Contact
            <span className="btn-icon" aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden grid place-items-center w-10 h-10 rounded-[10px] surface text-ice cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="omav-pop md:hidden relative mx-4 surface rounded-xl p-2">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  aria-current={currentPage === link.id ? 'page' : undefined}
                  className={`w-full flex items-center justify-between h-12 px-3 rounded-[9px] text-left text-[15px] cursor-pointer ${
                    currentPage === link.id ? 'bg-ice/[0.08] text-ice' : 'text-slate hover:text-ice'
                  }`}
                >
                  {link.label}
                  {currentPage === link.id && <span className="w-1.5 h-1.5 rounded-full bg-signal" />}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onRequestBriefing();
            }}
            className="btn btn-primary mt-2 w-full justify-between"
          >
            Contact / request a briefing
            <span className="btn-icon" aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          </button>
        </div>
      )}
    </header>
  );
};
