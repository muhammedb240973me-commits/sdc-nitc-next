'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { siteContent as staticContent } from '@/lib/content';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VolunteerModal from '@/components/VolunteerModal';
import { Copy, Check, Landmark, ShieldAlert } from 'lucide-react';

export default function DonatePage() {
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    async function fetchDonateData() {
      const [donateRes, linksRes] = await Promise.all([
        supabase.from('site_content').select('content').eq('id', 'donate_content').maybeSingle(),
        supabase.from('site_content').select('content').eq('id', 'links').maybeSingle()
      ]);

      setLiveData({
        donate: donateRes.data?.content || staticContent.donate,
        links: linksRes.data?.content || staticContent.links
      });
    }
    fetchDonateData();
  }, []);

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(liveData.donate.upi.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (!liveData) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', fontWeight: 700, gap: '0.5rem' }}>
        <div className="live-dot-solid" style={{ animation: 'ping 1.5s infinite' }}></div>
        Loading Secure Gateway...
      </div>
    );
  }

  const { donate, links } = liveData;

  return (
    <main>
      <Header siteContent={staticContent} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      
      <section className="donate-hero">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>
              <span className="section-tag-dot"></span>
              <span>{donate.hero.tag}</span>
            </div>
            <h1 className="section-heading" style={{ fontSize: '2.75rem', marginTop: '0.5rem' }}>
              {donate.hero.title}
            </h1>
            <p className="section-subtext" style={{ fontSize: '1.1rem' }}>
              {donate.hero.description}
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: '5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="qr-card">
                <span className="event-badge" style={{ marginBottom: '0.75rem', background: 'var(--secondary-subtle)', color: 'var(--secondary)', borderColor: '#A7F3D0' }}>
                  {donate.upi.badge}
                </span>
                
                <div style={{ width: '160px', height: '160px', background: '#FAF8FF', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={donate.upi.qrImage} alt="Donation QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>UPI ID</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', background: 'var(--page-bg)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)' }}>
                    {donate.upi.upiId}
                  </span>
                  <button onClick={handleCopyUpi} style={{ color: copied ? 'var(--secondary)' : 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }} title="Copy UPI ID">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  {donate.upi.hint}
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Landmark style={{ color: 'var(--secondary)', width: '20px', height: '20px' }} />
                  <span>{donate.bank.title}</span>
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>Account Name</span>
                    <strong style={{ color: 'var(--primary)' }}>{donate.bank.accountName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>Bank</span>
                    <strong style={{ color: 'var(--primary)' }}>{donate.bank.bankName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>Branch</span>
                    <strong style={{ color: 'var(--primary)' }}>{donate.bank.branch}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>Account Number</span>
                    <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{donate.bank.accountNumber}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-light)' }}>IFSC Code</span>
                    <strong style={{ color: 'var(--secondary)', fontFamily: 'monospace' }}>{donate.bank.ifscCode}</strong>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldAlert style={{ color: 'var(--tertiary)', width: '16px', height: '16px' }} />
                  <span>{donate.accountability.title}</span>
                </h5>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  {donate.accountability.description}
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer links={links} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      <VolunteerModal isOpen={isVolunteerOpen} onClose={() => setIsVolunteerOpen(false)} />
    </main>
  );
}