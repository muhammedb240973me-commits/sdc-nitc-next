'use client';
import { useState } from 'react';
import { Sparkles, BookMarked, Briefcase, HeartHandshake, ArrowRight } from 'lucide-react';

const iconMap = {
  Pillar_01: Sparkles,
  Pillar_02: BookMarked,
  Pillar_03: Briefcase,
  Pillar_04: HeartHandshake,
};

export default function Pillars({ pillars }) {
  const [filter, setFilter] = useState('all');

  const filteredPillars = filter === 'all' 
    ? pillars 
    : pillars.filter(p => p.category === filter);

  return (
    <section className="pillars-section" id="activities">
      <div className="container">
        <div className="section-header-flex">
          <div>
            <div className="section-tag">
              <span className="section-tag-dot"></span>
              <span>Our Ecosystem</span>
            </div>
            <h2 className="section-heading">Pillars of Holistic Student Development</h2>
            <p className="section-subtext" style={{ marginBottom: 0, maxWidth: '580px' }}>
              Operating under Campus Syndicate of Sunni Students' Federation at NIT Calicut, SDC bridges ethical self-realization with technical supremacy.
            </p>
          </div>

          <div className="pillar-tabs">
            <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Pillars</button>
            <button className={`tab-btn ${filter === 'moral' ? 'active' : ''}`} onClick={() => setFilter('moral')}>Moral Classes</button>
            <button className={`tab-btn ${filter === 'academics' ? 'active' : ''}`} onClick={() => setFilter('academics')}>Academics</button>
            <button className={`tab-btn ${filter === 'career' ? 'active' : ''}`} onClick={() => setFilter('career')}>Career &amp; Placement</button>
          </div>
        </div>

        <div className="pillars-grid">
          {filteredPillars.map((p, idx) => {
            const Icon = idx === 0 ? Sparkles : idx === 1 ? BookMarked : idx === 2 ? Briefcase : HeartHandshake;
            return (
              <div key={idx} className="pillar-card">
                <div>
                  <div className="pillar-icon-box">
                    <Icon size={24} />
                  </div>
                  <div className="pillar-meta">
                    <span className="pillar-num">{p.num}</span>
                    <span>•</span>
                    <span className="pillar-time">{p.time}</span>
                  </div>
                  <h3 className="pillar-title">{p.title}</h3>
                  <p className="pillar-text">{p.text}</p>
                </div>
                <div className="pillar-footer">
                  <span>{p.footer}</span>
                  <ArrowRight size={18} className="pillar-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}