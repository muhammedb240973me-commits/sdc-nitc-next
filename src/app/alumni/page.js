'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { siteContent as staticContent } from '@/lib/content';
import Link from 'next/link';
import { GraduationCap, Quote, ArrowLeft, Briefcase, ArrowRight, X } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VolunteerModal from '@/components/VolunteerModal';

export default function PublicAlumniPage() {
  const [alumni, setAlumni] = useState([]);
  const [layoutData, setLayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  
  // State for the expanded modal
  const [selectedAlumni, setSelectedAlumni] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [alumniRes, homeRes, linksRes] = await Promise.all([
        supabase.from('alumni_testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('site_content').select('content').eq('id', 'home_content').maybeSingle(),
        supabase.from('site_content').select('content').eq('id', 'links').maybeSingle()
      ]);

      setAlumni(alumniRes.data || []);
      setLayoutData({
        home: homeRes.data?.content || staticContent,
        links: linksRes.data?.content || staticContent.links
      });
      setLoading(false);
    }
    
    fetchData();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedAlumni) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedAlumni]);

  if (!layoutData) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', fontWeight: 700, gap: '0.5rem' }}>
        <div className="live-dot-solid" style={{ animation: 'ping 1.5s infinite' }}></div>
        Loading Alumni Network...
      </div>
    );
  }

  const mergedSiteContent = {
    ...staticContent,
    tickerText: layoutData.home.tickerText || staticContent.tickerText
  };

  return (
    <main>
      <Header siteContent={mergedSiteContent} onOpenVolunteer={() => setIsVolunteerOpen(true)} />

      <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '5rem' }}>
        
        {/* Hero Header */}
        <div style={{ background: 'var(--primary)', color: 'white', padding: '4rem 1.5rem 3.5rem 1.5rem', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/" style={{ color: '#94A3B8', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.05em' }}>
              <GraduationCap size={16} /> SDC NITC ALUMNI NETWORK
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
              Voices of Experience & Inspiration
            </h1>
            <p style={{ color: '#E2E8F0', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Discover how former students leveraged their time with Students' Development Cell NIT Calicut to excel in top global organizations and leadership roles.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="container" style={{ maxWidth: '1200px', margin: '3rem auto 0 auto', padding: '0 1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>
              Loading alumni testimonials...
            </div>
          ) : alumni.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', background: 'white', borderRadius: '1rem', border: '1px solid #E2E8F0' }}>
              <GraduationCap size={48} color="#CBD5E1" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#64748B', fontSize: '1.1rem' }}>No alumni profiles added yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
              {alumni.map((person) => (
                <div 
                  key={person.id} 
                  className="alumni-card"
                  onClick={() => setSelectedAlumni(person)}
                  style={{ 
                    background: 'white', 
                    borderRadius: '1.25rem', 
                    border: '1px solid #E2E8F0',
                    borderTop: '4px solid var(--primary)', 
                    padding: '2rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', 
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <Quote size={32} color="var(--primary)" style={{ opacity: 0.1, position: 'absolute', top: '1.5rem', right: '1.5rem' }} />
                  
                  {/* Truncated Text & Overflow Fix */}
                  <div style={{ 
                    color: '#334155', 
                    fontSize: '0.95rem', 
                    lineHeight: 1.6, 
                    fontStyle: 'italic', 
                    marginBottom: '1rem', 
                    flex: 1, 
                    zIndex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 4, 
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    overflowWrap: 'anywhere' /* Fixes long unbroken text escaping the box */
                  }}>
                    "{person.quote}"
                  </div>

                  <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem' }}>
                    Read full story <ArrowRight size={14} />
                  </div>

                  {/* Profile Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0 }}>
                      {person.photo_url ? (
                        <img src={person.photo_url} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                          <GraduationCap size={20} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                          {person.name}
                        </h3>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#EFF6FF', color: '#3B82F6', padding: '0.2rem 0.6rem', borderRadius: '50px', whiteSpace: 'nowrap' }}>
                          {person.grad_year}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.15rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Briefcase size={12} /> {person.role_company}
                      </p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer links={layoutData.links} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      <VolunteerModal isOpen={isVolunteerOpen} onClose={() => setIsVolunteerOpen(false)} />

      {/* =========================================================================
          FULL SCREEN MODAL (Opens when a card is clicked)
          ========================================================================= */}
      {selectedAlumni && (
        <div 
          onClick={() => setSelectedAlumni(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, 
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} /* Prevent clicking card from closing it */
            style={{
              background: 'white', borderRadius: '1.5rem', maxWidth: '600px', width: '100%',
              maxHeight: '90vh', overflowY: 'auto', position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedAlumni(null)} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', zIndex: 10 }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ padding: '2.5rem 2.5rem 2rem 2.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: '#F1F5F9', border: '3px solid var(--primary)', flexShrink: 0 }}>
                {selectedAlumni.photo_url ? (
                  <img src={selectedAlumni.photo_url} alt={selectedAlumni.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                    <GraduationCap size={32} />
                  </div>
                )}
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: '0 0 0.4rem 0' }}>
                  {selectedAlumni.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, background: '#EFF6FF', color: '#3B82F6', padding: '0.25rem 0.75rem', borderRadius: '50px' }}>
                    {selectedAlumni.grad_year}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Briefcase size={14} /> {selectedAlumni.role_company}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body (Full Un-truncated Quote) */}
            <div style={{ padding: '2.5rem', position: 'relative' }}>
              <Quote size={48} color="var(--primary)" style={{ opacity: 0.04, position: 'absolute', top: '1.5rem', left: '1.5rem' }} />
              <p style={{ color: '#334155', fontSize: '1.1rem', lineHeight: 1.8, position: 'relative', zIndex: 1, margin: 0, overflowWrap: 'anywhere' }}>
                "{selectedAlumni.quote}"
              </p>
            </div>
            
          </div>
        </div>
      )}
    </main>
  );
}