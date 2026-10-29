import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { OmavLockup } from './OmavMark';
import PillNav from './ui/PillNav';
import { GestureToggle } from './GestureControl';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onRequestBriefing: () => void;
}

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Approach', href: '#approach' },
  { label: 'About', href: '#about' },
];

// PillNav renders plain anchors; route their clicks through the app instead
const navTarget: { go: ((page: string) => void) | null } = { go: null };
const NavAnchor = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ href, onClick, ...rest }, ref) => (
    <a
      ref={ref}
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented && href?.startsWith('#') && navTarget.go) {
          e.preventDefault();
          navTarget.go(href.slice(1));
        }
      }}
    />
  )
);
NavAnchor.displayName = 'NavAnchor';

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onRequestBriefing }) => {
  navTarget.go = (page) => {
    onNavigate(page);
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
        className="absolute inset-0 h-[110px] bg-gradient-to-b from-abyss/85 via-abyss/45 to-transparent pointer-events-none"
      />
      <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-14 h-[84px] flex items-center justify-between gap-4">
        <NavAnchor href="#home" aria-label="OMAV, home" className="omav-nav-brand shrink-0 rounded-[8px]">
          <OmavLockup size="nav" idPrefix="navLockup" />
        </NavAnchor>
        <div className="min-w-0 flex-1">
          <PillNav
            items={NAV_ITEMS}
            activeHref={`#${currentPage}`}
            linkComponent={NavAnchor}
            itemStyle="pill"
            hoverEffect="fill"
            indicator="dot"
            layout="split"
            surface="glass"
            size="md"
            bounce={0.3}
            stretch={0.5}
            collapse="auto"
            intro
            ariaLabel="Primary"
            highlightColor="#E9EDF3"
            highlightTextColor="#05070B"
            barColor="rgba(11, 16, 24, 0.72)"
            textColor="#E9EDF3"
            style={
              {
                '--pn-tile': 'linear-gradient(180deg, rgba(233, 237, 243, 0.07) 0%, rgba(233, 237, 243, 0.03) 100%)',
                '--pn-tile-rim':
                  'inset 0 0 0 1px rgba(233, 237, 243, 0.06), inset 0 1px 0 rgba(233, 237, 243, 0.08)',
                '--pn-edge': 'rgba(220, 228, 238, 0.1)',
                '--pn-ring': 'rgba(140, 200, 216, 0.9)',
              } as React.CSSProperties
            }
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {currentPage === 'home' && <GestureToggle />}
          <button type="button" onClick={onRequestBriefing} className="btn btn-primary btn-sm shrink-0">
            Contact
            <span className="btn-icon" aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
