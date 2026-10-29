import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Send, Shield } from 'lucide-react';
import { OmavLockup } from './OmavMark';

interface BriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({
  isOpen,
  onClose,
  accentColor = '#8CC8D8',
}) => {
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail] = useState('');
  const [mandate, setMandate] = useState('AI Governance & Responsible Innovation');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // The phone's Back button closes the dialog rather than leaving the page
  useEffect(() => {
    if (!isOpen) return;
    let popped = false;
    window.history.pushState({ omavModal: true }, '');
    const onPop = () => {
      popped = true;
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (!popped && window.history.state?.omavModal) window.history.back();
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setInstitution('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Request an institutional briefing"
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* On phones the close control stays pinned to the screen while the form scrolls */}
      <button
        type="button"
        onClick={onClose}
        className="sm:hidden fixed top-3 right-3 z-10 inline-flex items-center gap-1.5 h-10 pl-3 pr-3.5 rounded-full bg-[#0B1018]/90 text-[13px] text-[#E9EDF3] shadow-[inset_0_0_0_1px_rgb(220_228_238/0.18)] backdrop-blur-md cursor-pointer"
        aria-label="Close dialog"
      >
        <X size={16} aria-hidden="true" /> Close
      </button>
      <div className="min-h-full flex items-start sm:items-center justify-center px-3 pt-16 pb-6 sm:p-6">
      <div
        className="relative w-full max-w-xl bg-[#080B12] border border-[#DCE4EE]/14 rounded-lg shadow-2xl p-6 sm:p-8 text-[#E9EDF3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="hidden sm:block absolute top-5 right-5 p-2 text-[#9AA4B2] hover:text-white rounded-[3px] hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#8CC8D8]/10 border border-[#8CC8D8]/30 flex items-center justify-center mb-5">
              <CheckCircle2 size={30} className="text-[#8CC8D8]" />
            </div>
            <h3 className="text-2xl font-medium text-white tracking-tight">
              Inquiry Dispatched
            </h3>
            <p className="mt-3 text-sm text-[#AEB7C3] max-w-md leading-relaxed">
              Thank you, {name}. Your inquiry regarding{' '}
              <span className="text-white font-medium">{mandate}</span> has been logged with the OMAV Global executive advisory team. We will review and respond confidentially within 24 hours.
            </p>
            <button
              onClick={handleReset}
              className="mt-8 px-6 py-2.5 bg-[#E9EDF3] text-[#05070B] text-xs uppercase tracking-wider font-medium rounded-[3px] hover:bg-white transition-colors cursor-pointer"
            >
              Return to Site
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4">
              <OmavLockup size="sm" idPrefix="modalLockup" />
              <div>
                <span className="font-jost text-xs tracking-[0.24em] font-medium text-[#8CC8D8] uppercase">
                  OMAV GLOBAL ADVISORY
                </span>
                <h3 className="text-xl sm:text-2xl font-medium text-[#F2F5F9] tracking-tight">
                  Request an Institutional Briefing
                </h3>
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              We consult with government bodies, state administrations, security leadership, and enterprises navigating technology, law, and sovereignty.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono tracking-wider uppercase text-[#8C96A6] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-[#05070B] border border-[#DCE4EE]/14 rounded-[3px] px-3.5 py-2.5 text-sm text-white placeholder-[#8C96A6]/50 focus:outline-none focus:border-[#8CC8D8] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-wider uppercase text-[#8C96A6] mb-1.5">
                    Institution / Body
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. State Department / Agency"
                    className="w-full bg-[#05070B] border border-[#DCE4EE]/14 rounded-[3px] px-3.5 py-2.5 text-sm text-white placeholder-[#8C96A6]/50 focus:outline-none focus:border-[#8CC8D8] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-[#8C96A6] mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov / name@institution.org"
                  className="w-full bg-[#05070B] border border-[#DCE4EE]/14 rounded-[3px] px-3.5 py-2.5 text-sm text-white placeholder-[#8C96A6]/50 focus:outline-none focus:border-[#8CC8D8] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-[#8C96A6] mb-1.5">
                  Focus Mandate / System Domain
                </label>
                <select
                  value={mandate}
                  onChange={(e) => setMandate(e.target.value)}
                  className="w-full bg-[#05070B] border border-[#DCE4EE]/14 rounded-[3px] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#8CC8D8] transition-colors cursor-pointer"
                >
                  <option value="AI Governance & Responsible Innovation">
                    AI Governance & Constitutional Bias Controls
                  </option>
                  <option value="AI Voice Bots & Citizen Services">
                    AI Voice Bots & Grievance Dispatch
                  </option>
                  <option value="Contract Intelligence & Legal Tech">
                    Contract Intelligence & Legal Technology
                  </option>
                  <option value="Cyber Intelligence & Predictive Policing">
                    Cyber Intelligence & Predictive Policing
                  </option>
                  <option value="Public Sector Digital Transformation">
                    Public Sector Digital Transformation & Architecture
                  </option>
                  <option value="Cloud & Sovereign On-Premises Infrastructure">
                    Cloud & Sovereign On-Premises Infrastructure
                  </option>
                  <option value="International State-Level Partnerships">
                    International State-Level Partnerships & Missions
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-[#8C96A6] mb-1.5">
                  Enquiry Scope
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Summarize the operational context, legislative timeframe, or technology challenge..."
                  className="w-full bg-[#05070B] border border-[#DCE4EE]/14 rounded-[3px] px-3.5 py-2 text-sm text-white placeholder-[#8C96A6]/50 focus:outline-none focus:border-[#8CC8D8] transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8C96A6] font-mono">
                  <Shield size={13} className="text-[#8CC8D8]" />
                  <span>Confidential & Sovereign Privilege</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="sm:hidden flex-1 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-[#E9EDF3] rounded-[3px] shadow-[inset_0_0_0_1px_rgb(220_228_238/0.18)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#E9EDF3] text-[#05070B] text-xs font-medium uppercase tracking-wider rounded-[3px] hover:bg-white transition-colors cursor-pointer"
                  >
                    <span>Transmit Inquiry</span>
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
