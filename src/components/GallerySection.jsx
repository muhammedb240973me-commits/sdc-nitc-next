'use client';
import { useState } from 'react';
import { Camera, HeartPulse, Users2, ArrowRight, X } from 'lucide-react';

export default function GallerySection({ gallery, links, onOpenVolunteer }) {
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <>
      <section className="action-trio-section">
        <div className="container">
          <div className="trio-grid">
            <div className="trio-card">
              <div>
                <div className="trio-icon-wrap trio-icon-emerald">
                  <Camera size={22} />
                </div>
                <h3 className="trio-title">Campus Memories &amp; Iftar Gatherings</h3>
                <p className="trio-text">
                  Browse photo documentation of various programs including Daily Ifthar Meet.
                </p>
              </div>
              <a href="/gallery" className="trio-action-link">
                <span>View Gallery Archive</span>
                <ArrowRight size={16} />
              </a>
            </div>

            <div className="trio-card">
              <div>
                <div className="trio-icon-wrap trio-icon-amber">
                  <HeartPulse size={22} />
                </div>
                <h3 className="trio-title">Student Relief &amp; Emergency Fund</h3>
                <p className="trio-text">
                  SDC maintains an anonymous mutual-aid fund supporting scholars facing sudden medical contingencies or semester fee distress.
                </p>
              </div>
              <a href="/donate" className="trio-action-link" style={{ color: 'var(--tertiary)' }}>
                <span>Contribute or Request Aid</span>
                <ArrowRight size={16} />
              </a>
            </div>

            <div className="trio-card">
              <div>
                <div className="trio-icon-wrap trio-icon-navy">
                  <Users2 size={22} />
                </div>
                <h3 className="trio-title">Join the SDC</h3>
                <p className="trio-text">
                  Need a mindful session ? Or are you feeling loneliness. Join our team.
                </p>
              </div>
              <a href={links.whatsappCommunity} target="_blank" rel="noreferrer" className="trio-action-link" style={{ color: 'var(--primary)' }}>
                <span>Join Our Whatsapp Community</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Grid */}
      <section className="gallery-section" id="gallery">
        <div className="container">
          <div className="alumni-header" style={{ marginBottom: '2rem' }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>
              <span className="section-tag-dot"></span>
              <span>Memories</span>
            </div>
            <h2 className="section-heading">Campus Gatherings, events &amp; Grand Ifthar</h2>
            <p className="section-subtext" style={{ marginBottom: 0 }}>
              Glimpses of community living, annual Ramadan banquets, fresher welcomes, and scholarly halaqas at NITC.
            </p>
          </div>

          <div className="gallery-grid">
            {gallery.map((item, idx) => (
              <div key={idx} className="gallery-item" onClick={() => setSelectedImg(item)}>
                <img src={item.src} alt={item.title} className="gallery-img" />
                <div className="gallery-overlay">
                  <span className="gallery-item-title">{item.title}</span>
                  <span className="gallery-item-tag">{item.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div className="modal active">
          <div className="modal-backdrop" onClick={() => setSelectedImg(null)}></div>
          <div className="modal-content" style={{ maxWidth: '800px', padding: '1.5rem' }}>
            <button className="modal-close-btn" onClick={() => setSelectedImg(null)}>
              <X size={18} />
            </button>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', maxHeight: '500px' }}>
              <img src={selectedImg.src} alt={selectedImg.title} style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'contain', margin: '0 auto' }} />
            </div>
            <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
              {selectedImg.title} • {selectedImg.tag}
            </p>
          </div>
        </div>
      )}
    </>
  );
}