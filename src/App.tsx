/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SolutionsPage } from './pages/SolutionsPage';
import { ExpertisePage } from './pages/ExpertisePage';
import { ApproachPage } from './pages/ApproachPage';
import { AboutPage } from './pages/AboutPage';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BriefingModal } from './components/BriefingModal';
import { introBridge } from './lib/introBridge';

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

  // Logo intro: plays when the visit lands on the home page. The page chrome
  // rises in once the Earth has taken over from the emblem ("go").
  useState(() => {
    const reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pageFromLocation() === 'home' && !reduced) introBridge.start();
    else introBridge.disable();
  });

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
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onRequestBriefing={handleOpenBriefing}
      />

      {/* Dynamic Page Views */}
      <main className="flex-1">
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
