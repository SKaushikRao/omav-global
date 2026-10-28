/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BriefingModal } from './components/BriefingModal';
import { introBridge } from './lib/introBridge';
import GlowCursor from './components/ui/GlowCursor';

// Inner pages load on demand, keeping the first load to the home page
const SolutionsPage = lazy(() => import('./pages/SolutionsPage').then((m) => ({ default: m.SolutionsPage })));
const ExpertisePage = lazy(() => import('./pages/ExpertisePage').then((m) => ({ default: m.ExpertisePage })));
const ApproachPage = lazy(() => import('./pages/ApproachPage').then((m) => ({ default: m.ApproachPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));

const PAGES = ['solutions', 'expertise', 'approach', 'about'];

function pageFromLocation() {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const path = window.location.pathname.replace('/', '').toLowerCase();
  const target = hash || path;
  return PAGES.includes(target) ? target : 'home';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>(pageFromLocation);
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const accentColor = '#8CC8D8';
  const [finePointer] = useState(
    () => !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
  );

  // Logo intro: plays when the visit lands on the home page. The page chrome
  // rises in once the Earth has taken over from the emblem ("go").
  useState(() => {
    const reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pageFromLocation() === 'home' && !reduced) introBridge.start();
    else introBridge.disable();
  });

  // Prefetch the inner pages once the home intro has played, so navigation is instant
  useEffect(() => {
    const t = window.setTimeout(() => {
      import('./pages/SolutionsPage');
      import('./pages/ExpertisePage');
      import('./pages/ApproachPage');
      import('./pages/AboutPage');
    }, 9000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    let cleanup = 0;
    const sync = () => {
      if (introBridge.mode === 'off') {
        html.classList.remove('omav-intro', 'omav-go', 'omav-intro-lock');
        return;
      }
      if (introBridge.went && !html.classList.contains('omav-go')) {
        html.classList.add('omav-go');
        html.classList.remove('omav-intro-lock');
        // Once the entrance animations have played, drop the intro styling
        cleanup = window.setTimeout(() => html.classList.remove('omav-intro', 'omav-go'), 4000);
      }
    };
    sync();
    const unsub = introBridge.subscribe(sync);
    return () => {
      unsub();
      window.clearTimeout(cleanup);
    };
  }, []);

  // Handle URL Hash or Path on initial load and popstate
  useEffect(() => {
    const handleLocationChange = () => setCurrentPage(pageFromLocation());

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.history.pushState(null, '', `#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBriefing = () => {
    setBriefingModalOpen(true);
  };

  const handleCloseBriefing = () => {
    setBriefingModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-[#E9EDF3] selection:bg-[#8CC8D8]/20 selection:text-white flex flex-col justify-between">
      {/* Glow cursor on the inner pages (the home page has its own scene) */}
      {currentPage !== 'home' && finePointer && (
        <GlowCursor
          key={currentPage}
          color="#8CC8D8"
          intensity={1.3}
          trailWidth={3}
          linger={0.6}
          glow={1.2}
          clickBurst
          theme="dark"
          quality="medium"
          maxDevicePixelRatio={1}
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 40, pointerEvents: 'none' }}
        />
      )}

      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onRequestBriefing={handleOpenBriefing}
      />

      {/* Dynamic Page Views */}
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-screen" />}>
        {currentPage === 'home' && (
          <HomePage
            accentColor={accentColor}
            onRequestBriefing={handleOpenBriefing}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'solutions' && (
          <SolutionsPage
            accentColor={accentColor}
            onRequestBriefing={handleOpenBriefing}
          />
        )}

        {currentPage === 'expertise' && (
          <ExpertisePage
            accentColor={accentColor}
            onRequestBriefing={handleOpenBriefing}
          />
        )}

        {currentPage === 'approach' && (
          <ApproachPage
            accentColor={accentColor}
            onRequestBriefing={handleOpenBriefing}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            accentColor={accentColor}
            onRequestBriefing={handleOpenBriefing}
          />
        )}

        {/* Contact Section included on subpages for direct reach */}
        {currentPage !== 'home' && (
          <ContactSection
            accentColor={accentColor}
            onRequestBriefing={handleOpenBriefing}
          />
        )}
        </Suspense>
      </main>

      {/* Institutional Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Interactive Briefing Request Modal */}
      <BriefingModal
        isOpen={briefingModalOpen}
        onClose={handleCloseBriefing}
        accentColor={accentColor}
      />
    </div>
  );
}
