'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Quote, GraduationCap, ArrowRight, Briefcase } from 'lucide-react';

export default function AlumniSlider() {
  const [alumni, setAlumni] = useState([]);

  useEffect(() => {
    async function fetchFeaturedAlumni() {
      const { data } = await supabase
        .from('alumni_testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });
      
      setAlumni(data || []);
    }
    fetchFeaturedAlumni();
  }, []);

  if (alumni.length === 0) return null;

  // Duplicate the array to create a seamless infinite scrolling loop
  const slidingAlumni = [...alumni, ...alumni];

  return (
    <section style={{ padding: '5rem 0', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', overflow: 'hidden' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              <GraduationCap size={16} /> ALUMNI TESTIMONIALS
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>
              Guided by Excellence
            </h2>
          </div>
          <Link href="/alumni" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', textDecoration: 'none' }}>
            View All Alumni <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Auto-Sliding Marquee Wrapper */}
      <div style={{ display: 'flex', overflow: 'hidden', width: '100%' }}>
        <div 
          className="alumni-marquee"
          style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            paddingLeft: '1.5rem',
            paddingBottom: '2rem', /* Extra padding for shadow visibility */
            width: 'max-content'
          }}
        >
          {slidingAlumni.map((person, index) => (
            <div 
              key={`${person.id}-${index}`}
              className="alumni-card-static"
              style={{ 
                width: '350px', 
                flex: '0 0 auto', 
                background: 'white', 
                borderRadius: '1.25rem', 
                border: '1px solid #E2E8F0', 
                borderTop: '4px solid var(--primary)',
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
                position: 'relative'
              }}
            >
              <Quote size={28} color="var(--primary)" style={{ opacity: 0.1, position: 'absolute', top: '1.5rem', right: '1.5rem' }} />
              
              {/* Truncated Text & Overflow Fix */}
              <div style={{ 
                color: '#334155', 
                fontSize: '0.9rem', 
                lineHeight: 1.6, 
                fontStyle: 'italic', 
                marginBottom: '1.5rem', 
                flex: 1,
                display: '-webkit-box',
                WebkitLineClamp: 4, 
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                overflowWrap: 'anywhere' 
              }}>
                "{person.quote}"
              </div>

              {/* Profile Strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                  {person.photo_url ? (
                    <img src={person.photo_url} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      <GraduationCap size={20} />
                    </div>
                  )}
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                    {person.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
                    {person.role_company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inline Styles for the Infinite Marquee Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.75rem)); } 
        }
        .alumni-marquee {
          animation: scrollMarquee 30s linear infinite;
        }
        .alumni-marquee:hover {
          animation-play-state: paused;
        }
        .alumni-card-static {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .alumni-card-static:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
      `}} />
    </section>
  );
}