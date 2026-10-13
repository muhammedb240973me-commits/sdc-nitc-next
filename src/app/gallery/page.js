'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { siteContent as staticContent } from '@/lib/content';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VolunteerModal from '@/components/VolunteerModal';
import { X } from 'lucide-react';

export default function GalleryPage() {
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImg, setSelectedImg] = useState(null);
  
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    async function fetchGalleryData() {
      const [galleryRes, linksRes] = await Promise.all([
        supabase.from('gallery').select('*').order('created_at', { ascending: false }),
        supabase.from('site_content').select('content').eq('id', 'links').maybeSingle()
      ]);

      setLiveData({
        images: galleryRes.data || [],
        links: linksRes.data?.content || staticContent.links
      });
    }
    fetchGalleryData();
  }, []);

  if (!liveData) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', fontWeight: 700, gap: '0.5rem' }}>
        <div className="live-dot-solid" style={{ animation: 'ping 1.5s infinite' }}></div>
        Loading Gallery...
      </div>
    );
  }

  const { galleryPage } = staticContent; // Keep headers/categories static for now
  const { images, links } = liveData;

  const filteredImages = selectedCategory === 'All'
    ? images
    : images.filter(img => img.category === selectedCategory);

  return (
    <main>
      <Header siteContent={staticContent} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      
      <section className="donate-hero" style={{ padding: '4rem 0 2rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>
              <span className="section-tag-dot"></span>
              <span>{galleryPage.header.tag}</span>
            </div>
            <h1 className="section-heading" style={{ fontSize: '2.75rem', marginTop: '0.5rem' }}>
              {galleryPage.header.title}
            </h1>
            <p className="section-subtext" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              {galleryPage.header.description}
            </p>

            <div className="pillar-tabs" role="tablist" style={{ justifyContent: 'center', display: 'inline-flex' }}>
              {galleryPage.categories.map((category) => (
                <button 
                  key={category}
                  className={`tab-btn ${selectedCategory === category ? 'active' : ''}`} 
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-section" style={{ borderTop: 'none', paddingTop: '1rem' }}>
        <div className="container">
          {filteredImages.length > 0 ? (
            <div className="gallery-grid">
              {filteredImages.map((item) => (
                <div key={item.id} className="gallery-item" onClick={() => setSelectedImg(item)}>
                  <img src={item.image_url} alt={item.title} className="gallery-img" />
                  <div className="gallery-overlay">
                    <span className="gallery-item-title">{item.title}</span>
                    <span className="gallery-item-tag">{item.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-light)' }}>
              <p>No images found for this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {selectedImg && (
        <div className="modal active">
          <div className="modal-backdrop" onClick={() => setSelectedImg(null)}></div>
          <div className="modal-content" style={{ maxWidth: '800px', padding: '1.5rem' }}>
            <button className="modal-close-btn" onClick={() => setSelectedImg(null)}>
              <X size={18} />
            </button>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', maxHeight: '600px', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--primary)' }}>
              <img src={selectedImg.image_url} alt={selectedImg.title} style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{selectedImg.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{selectedImg.category} • {selectedImg.tag}</p>
            </div>
          </div>
        </div>
      )}

      <Footer links={links} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      <VolunteerModal isOpen={isVolunteerOpen} onClose={() => setIsVolunteerOpen(false)} />
    </main>
  );
}