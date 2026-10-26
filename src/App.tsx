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
import { IntroVideo } from './components/IntroVideo';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const accentColor = '#8CC8D8';

  // Handle URL Hash or Path on initial load and popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const path = window.location.pathname.replace('/', '').toLowerCase();
      const target = hash || path;

      if (['solutions', 'expertise', 'approach', 'about'].includes(target)) {
        setCurrentPage(target);
      } else {
        setCurrentPage('home');
      }
    };

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

  const handleVideoEnd = () => {
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-[#E9EDF3] selection:bg-[#8CC8D8]/20 selection:text-white flex flex-col justify-between">
      {/* Intro Video */}
      {showIntro && <IntroVideo onVideoEnd={handleVideoEnd} />}

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
