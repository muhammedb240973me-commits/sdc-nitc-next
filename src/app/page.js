'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { siteContent as staticContent } from '@/lib/content';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Pillars from '@/components/Pillars';
import AlumniSlider from '@/components/AlumniSlider';
import GallerySection from '@/components/GallerySection';
import Footer from '@/components/Footer';
import VolunteerModal from '@/components/VolunteerModal';

export default function Home() {
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    async function fetchPublicData() {
      // Fetch all required data simultaneously for speed
      const [homeRes, linksRes, eventsRes, galleryRes, aboutRes] = await Promise.all([
        supabase.from('site_content').select('content').eq('id', 'home_content').maybeSingle(),
        supabase.from('site_content').select('content').eq('id', 'links').maybeSingle(),
        supabase.from('events').select('*').eq('is_featured', true).order('created_at', { ascending: false }),
        supabase.from('gallery').select('*').limit(4), // Only grab 4 images for the home preview
        supabase.from('site_content').select('content').eq('id', 'about_content').maybeSingle()
      ]);

      // Format database events to match your existing <About /> component structure
      const formattedEvents = (eventsRes.data || []).map(ev => ({
        year: ev.date_label,
        title: ev.title,
        desc: ev.description
      }));

      // Format database gallery to match your existing <GallerySection /> component structure
      const formattedGallery = (galleryRes.data || []).map(img => ({
        src: img.image_url,
        title: img.title,
        tag: img.tag
      }));

      setLiveData({
        home: homeRes.data?.content || staticContent,
        links: linksRes.data?.content || staticContent.links,
        events: formattedEvents.length > 0 ? formattedEvents : staticContent.recentEvents,
        gallery: formattedGallery.length > 0 ? formattedGallery : staticContent.gallery,
        about: aboutRes.data?.content
      });
    }

    fetchPublicData();
  }, []);

  if (!liveData) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', fontWeight: 700, gap: '0.5rem' }}>
        <div className="live-dot-solid" style={{ animation: 'ping 1.5s infinite' }}></div>
        Loading SDC NITC...
      </div>
    );
  }

  // Merge the dynamic ticker text into the static structure for the Header component
  const mergedSiteContent = {
    ...staticContent,
    tickerText: liveData.home.tickerText || staticContent.tickerText
  };

  return (
    <main>
      <Header siteContent={mergedSiteContent} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      <Hero hero={liveData.home.hero || staticContent.hero} metrics={liveData.home.metrics || staticContent.metrics} links={liveData.links} />
      <About recentEvents={liveData.events}
             aboutContent={liveData.about} />
      
      {/* Activities Section */}
      <Pillars pillars={liveData.home.pillars || staticContent.pillars} />
      
      {/* Alumni Slider Section added just after Activities */}
      <AlumniSlider />
      
      <GallerySection gallery={liveData.gallery} links={liveData.links} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      <Footer links={liveData.links} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      <VolunteerModal isOpen={isVolunteerOpen} onClose={() => setIsVolunteerOpen(false)} />
    </main>
  );
}