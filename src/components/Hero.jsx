'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, CalendarCheck, FolderSearch } from 'lucide-react';

// Sub-component specifically for handling the count-up animation
function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          obs.disconnect(); // Stop observing once animated

          let startTime = null;

          const updateCount = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Ease out cubic function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOut * target);
            
            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, [target, duration, hasAnimated]);

  return <span ref={elementRef}>{count.toLocaleString('en-IN')}</span>;
}

export default function Hero({ hero, metrics, links }) {
  return (
    <section className="hero-section" id="hero">
      <div className="ambient-glow glow-1" aria-hidden="true"></div>
      <div className="ambient-glow glow-2" aria-hidden="true"></div>

      <div className="container">
        <div className="hero-content">
          <div className="heritage-badge">
            <span className="heritage-badge-dot"></span>
            <span>{hero.badgeText}</span>
          </div>

          <h1 className="hero-title">
            {hero.titleStart}{' '}
            <span className="hero-highlight">
              {hero.titleHighlight}
              <svg className="wavy-underline" viewBox="0 0 280 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12C25 4 48 15 70 8C92 1 115 14 137 7C159 1 182 14 204 7C226 1 249 14 271 7" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          <p className="hero-description">{hero.description}</p>

          <div className="hero-cta">
            <a href="#activities" className="btn-secondary">
              <span>Explore Activities</span>
              <ArrowRight size={18} />
            </a>
            <a href={links.whatsappCommunity} target="_blank" rel="noreferrer" className="btn-primary">
              <CalendarCheck size={18} />
              <span>Join Us</span>
            </a>
            <a href="/question-bank" className="btn-outline">
              <FolderSearch size={18} />
              <span>Access Question Bank</span>
            </a>
          </div>

          <div className="metric-strip" aria-label="SDC NITC Impact Metrics">
            {metrics.map((m, idx) => (
              <div key={idx} className={`metric-card ${m.accent === 'emerald' ? 'accent-emerald' : m.accent === 'amber' ? 'accent-amber' : ''}`}>
                <div className="metric-value-wrap">
                  <span className="metric-number">
                    {/* Using our new animated counter here */}
                    <AnimatedCounter target={m.target} />
                  </span>
                  <span className="metric-suffix">{m.suffix}</span>
                </div>
                <h3 className="metric-title">{m.title}</h3>
                <p className="metric-desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}