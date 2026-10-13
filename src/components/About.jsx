import { ShieldCheck, GraduationCap, Users, Award, HeartHandshake, BookOpen, Sparkles, Target } from 'lucide-react';

const iconMap = {
  ShieldCheck: ShieldCheck,
  GraduationCap: GraduationCap,
  Users: Users,
  Award: Award,
  HeartHandshake: HeartHandshake,
  BookOpen: BookOpen,
  Sparkles: Sparkles,
  Target: Target
};

export default function About({ recentEvents, aboutContent }) {
  // Fallback data if DB hasn't loaded properly
  const safeContent = aboutContent || {
    header: { tag: "Our Roots & Conviction", title: "15+ Years of Dedicated Guidance", paragraph1: "", paragraph2: "" },
    cards: []
  };

  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="about-grid">
          <div>
            <div className="section-tag">
              <span className="section-tag-dot"></span>
              <span>{safeContent.header.tag}</span>
            </div>
            <h2 className="section-heading">{safeContent.header.title}</h2>
            <p className="section-subtext">{safeContent.header.paragraph1}</p>
            <p className="section-subtext">{safeContent.header.paragraph2}</p>

            <div className="core-values-grid">
              {safeContent.cards.map((card, idx) => {
                const IconComponent = iconMap[card.icon] || ShieldCheck;
                return (
                  <div key={idx} className="value-box">
                    <div className="value-icon-wrap"><IconComponent size={20} /></div>
                    <h4 className="value-title">{card.title}</h4>
                    <p className="value-desc">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heritage Infographic Card (Recent Events) */}
          <div className="heritage-infographic-card">
            <span className="event-badge">RECENT EVENTS</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1rem', color: '#FFFFFF' }}>
              Our Recent Major Events
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '0.5rem' }}>
              Events that gave pace to fulfill academic and professional integrity also that provided pleasured nights
            </p>

            <div className="heritage-stat-row">
              {recentEvents.map((evt, idx) => (
                <div key={idx} className="heritage-milestone">
                  <span className="milestone-year">{evt.year}</span>
                  <div className="milestone-text">
                    <strong>{evt.title}</strong>
                    {evt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}