'use client';
import { useState, useEffect } from 'react';
import { Mail, MapPin, Clock, Phone, ChevronUp, Sparkles } from 'lucide-react';
import { FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

export default function Footer({ links, onOpenVolunteer }) {
  const [showTop, setShowTop] = useState(false);
  // Safely initialize with a static string to prevent hydration errors
  const [currentYear, setCurrentYear] = useState("2026");

  useEffect(() => {
    // Dynamically update the year only on the client side
    setCurrentYear(new Date().getFullYear().toString());

    const handleScroll = () => {
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-banner">
            <h2 className="cta-title">Be Part of the SDC</h2>
            <p className="cta-desc">
              Whether you are seeking guidance in a demanding course, spiritual grounding on campus, or lifelong friends — our doors are always open to you.
            </p>
            <div className="cta-buttons">
              <a href={links.whatsappMoralCircle} target="_blank" rel="noreferrer" className="btn-primary">
                <Sparkles size={18} />
                <span>Join Next Moral Circle</span>
              </a>
              <a href={links.whatsappCommunity} target="_blank" rel="noreferrer" className="btn-outline" style={{ color: 'var(--primary)', background: '#FFFFFF' }}>
                <Mail size={18} />
                <span>Join Whatsapp Community</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo-row">
                <svg style={{ width: '36px', height: '36px' }} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="64" height="64" rx="14" fill="#1B2A41"/>
                  <path d="M14 45C22 41 29 42 32 46C35 42 42 41 50 45V27C42 23 35 24 32 28C29 24 22 23 14 27V45Z" fill="#FAF8FF"/>
                  <path d="M32 15L36 34H28L32 15Z" fill="#10B981"/>
                  <polygon points="32,7 33.6,11.2 38,11.8 34.8,14.8 35.6,19.2 32,17.2 28.4,19.2 29.2,14.8 26,11.8 30.4,11.2" fill="#F59E0B"/>
                </svg>
                <div>
                  <span className="footer-title">SDC NIT Calicut</span>
                  <span className="footer-badge">15+ Years Legacy</span>
                </div>
              </div>
              <p className="footer-text">
                Students' Development Cell (SDC) functions proactively under the Sunni Students' Federation (SSF) at the National Institute of Technology Calicut.
              </p>
              <div className="social-links">
                <a href={"links.instagram"} target="_blank" rel="noreferrer" className="social-btn"><FaInstagram size={18} /></a>
                <a href={"links.linkedin"} target="_blank" rel="noreferrer" className="social-btn"><FaLinkedin size={18} /></a>
                <a href={"links.youtube"} target="_blank" rel="noreferrer" className="social-btn"><FaYoutube size={18} /></a>
                <a href={`mailto:${links.email}`} className="social-btn"><Mail size={18} /></a>
              </div>
            </div>

            <div>
              <h4 className="footer-heading">Four-Fold Pillars</h4>
              <ul className="footer-links">
                <li className="footer-link-item"><a href="#activities">Weekly Moral Halaqas</a></li>
                <li className="footer-link-item"><a href="/question-bank">PYQ &amp; Academic Notes</a></li>
                <li className="footer-link-item"><a href="#activities">Placement &amp; Mock Wing</a></li>
                <li className="footer-link-item"><a href="#activities">Peer Mental Health Desk</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Community &amp; Relief</h4>
              <ul className="footer-links">
                <li className="footer-link-item"><a href="/donate">Student Relief Mutual-Aid</a></li>
                <li className="footer-link-item"><a href="#gallery">Ramadan Iftar Archive</a></li>
                <li className="footer-link-item"><button onClick={onOpenVolunteer} style={{ color: '#94A3B8' }}>Volunteer with SDC</button></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Campus Help Desk</h4>
              <div className="footer-contact-list">
                <div className="contact-item">
                  <MapPin size={18} className="contact-icon" />
                  <span>{links.address}</span>
                </div>
                <div className="contact-item">
                  <Clock size={18} className="contact-icon" />
                  <span>{links.timing}</span>
                </div>
                <div className="contact-item">
                  <Phone size={18} className="contact-icon" />
                  <span>{links.phone}</span>
                </div>
                <div className="contact-item">
                  <Mail size={18} className="contact-icon" />
                  <span>{links.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {currentYear} Students' Development Cell (SDC), SSF NIT Calicut Unit.</p>
            <p className="footer-disclaimer">
              Disclaimer: SDC NITC is a voluntary student empowerment initiative operating outside the campus to guide scholars morally and academically.
            </p>
          </div>
        </div>
      </footer>

      <button className={`back-to-top ${showTop ? 'visible' : ''}`} onClick={scrollToTop} aria-label="Back to top">
        <ChevronUp size={20} />
      </button>
    </>
  );
}