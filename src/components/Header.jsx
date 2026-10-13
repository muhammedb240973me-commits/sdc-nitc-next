'use client';
import { useState, useEffect } from 'react';
import { Ticket, Menu, X, Home, Info, Compass, BookOpen, Image as ImageIcon, HeartHandshake } from 'lucide-react';

export default function Header({ siteContent, onOpenVolunteer }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="ticker-bar" role="region" aria-label="Announcement">
        <div className="container">
          <div className="ticker-content">
            <span className="live-dot" aria-hidden="true">
              <span className="live-dot-ping"></span>
              <span className="live-dot-solid"></span>
            </span>
            <span className="ticker-badge">COMMEMORATIVE 15+ YRS</span>
            <p>{siteContent.tickerText}</p>
          </div>
        </div>
      </div>

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`} id="site-header">
        <div className="container">
          <div className="nav-wrapper">
            <a href="/#hero" className="brand" aria-label="SDC NITC Homepage">
              <svg className="brand-emblem" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="14" fill="#0B192C"/>
                <path d="M14 45C22 41 29 42 32 46C35 42 42 41 50 45V27C42 23 35 24 32 28C29 24 22 23 14 27V45Z" fill="#FAF8FF" fillOpacity="0.95"/>
                <path d="M31.2 26V47H32.8V26H31.2Z" fill="#CBD5E1"/>
                <path d="M32 15L36 34H28L32 15Z" fill="#10B981"/>
                <path d="M32 18L34.5 32H29.5L32 18Z" fill="#34D399"/>
                <path d="M32 7L33.6 11.2L38 11.8L34.8 14.8L35.6 19.2L32 17.2L28.4 19.2L29.2 14.8L26 11.8L30.4 11.2L32 7Z" fill="#F59E0B"/>
              </svg>
              <div className="brand-text">
                <div className="brand-title">
                  <span>SDC NITC</span>
                  <span className="brand-badge"></span>
                </div>
                <span className="brand-sub">Students' Development Cell • NIT Calicut</span>
              </div>
            </a>

            <nav className="nav-links" aria-label="Main Navigation">
              <a href="/#hero" className="nav-link">Home</a>
              <a href="/#about" className="nav-link">About Us</a>
              <a href="/#activities" className="nav-link">Activities</a>
              <a href="/question-bank" className="nav-link">Question Bank</a>
              <a href="/gallery" className="nav-link">Gallery</a>
              <a href="/donate" className="nav-link">Donate</a>
            </nav>

            <div className="nav-actions">
              <a href={siteContent.links.whatsappCommunity} target="_blank" rel="noreferrer" className="btn-primary">
                <Ticket size={18} />
                <span>Join Us</span>
              </a>
              <button className="mobile-toggle" onClick={() => setDrawerOpen(true)} aria-label="Toggle navigation menu">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`mobile-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div className="brand-title" style={{ fontSize: '1.1rem' }}>
              <span>SDC NITC</span>
            </div>
            <button className="modal-close-btn" onClick={() => setDrawerOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <ul className="mobile-nav-list">
            <li><a href="/#hero" className="mobile-nav-link" onClick={() => setDrawerOpen(false)}><Home size={18} /> Home</a></li>
            <li><a href="/#about" className="mobile-nav-link" onClick={() => setDrawerOpen(false)}><Info size={18} /> About Us</a></li>
            <li><a href="/#activities" className="mobile-nav-link" onClick={() => setDrawerOpen(false)}><Compass size={18} /> Activities</a></li>
            <li><a href="/question-bank" className="mobile-nav-link" onClick={() => setDrawerOpen(false)}><BookOpen size={18} /> Question Bank</a></li>
            <li><a href="/gallery" className="mobile-nav-link" onClick={() => setDrawerOpen(false)}><ImageIcon size={18} /> Gallery</a></li>
            <li><a href="/donate" className="mobile-nav-link" onClick={() => setDrawerOpen(false)}><HeartHandshake size={18} /> Donate Us</a></li>
          </ul>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a href={siteContent.links.whatsappCommunity} target="_blank" rel="noreferrer" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
            Join the Community
          </a>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center' }}>
            Students' Development Cell • Alqamar, Companymukk
          </p>
        </div>
      </aside>
    </>
  );
}