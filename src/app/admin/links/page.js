'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/AdminProvider';
import { Save, CheckCircle2, Link as LinkIcon, MapPin, Mail, Phone, Clock, MessageCircle, AlertCircle, Lock } from 'lucide-react';

export default function AdminLinks() {
  const { checkAccess } = useAdmin();
  const hasAccess = checkAccess('links');

  const [links, setLinks] = useState({
    whatsappCommunity: '', whatsappMoralCircle: '', instagram: '', linkedin: '', youtube: '', email: '', phone: '', address: '', timing: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    async function fetchLinks() {
      const { data, error } = await supabase.from('site_content').select('content').eq('id', 'links').maybeSingle(); 
      if (error) setFetchError(error.message);
      else if (data && data.content) setLinks(data.content);
      setIsLoading(false);
    }
    fetchLinks();
  }, []);

  const handleChange = (e) => setLinks({ ...links, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!hasAccess) return;
    setIsSaving(true);
    setSaveStatus(null);

    const { error } = await supabase.from('site_content').upsert({ id: 'links', content: links });

    setIsSaving(false);
    if (error) {
      setSaveStatus({ type: 'error', message: 'Failed to save: ' + error.message });
    } else {
      setSaveStatus({ type: 'success', message: 'Links and contacts updated successfully!' });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (isLoading) return <div>Loading current links from database...</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>Links &amp; Contacts</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update social media links, WhatsApp groups, and help desk details.</p>
        </div>
        <button onClick={handleSave} disabled={!hasAccess || isSaving} className="btn-primary" style={{ gap: '0.5rem' }}>
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {!hasAccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA', marginBottom: '2rem' }}>
          <Lock size={20} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem' }}>Access Restricted</strong>
            <span style={{ fontSize: '0.8rem' }}>You do not have permission to edit this section. This page is in read-only mode.</span>
          </div>
        </div>
      )}

      {fetchError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem' }}>
          <AlertCircle size={18} /><span>Database Issue: {fetchError}. Check your .env.local file.</span>
        </div>
      )}

      {saveStatus && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: saveStatus.type === 'success' ? '#ECFDF5' : '#FEE2E2', color: saveStatus.type === 'success' ? '#047857' : '#B91C1C', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', border: `1px solid ${saveStatus.type === 'success' ? '#A7F3D0' : '#FECACA'}` }}>
          {saveStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', opacity: hasAccess ? 1 : 0.7 }}>
        
        <div className="admin-stat-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LinkIcon size={18} style={{ color: 'var(--secondary)' }} /> Digital Presence
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group"><label className="form-label"><MessageCircle size={14} /> WhatsApp Community</label><input type="url" name="whatsappCommunity" value={links.whatsappCommunity} onChange={handleChange} className="form-input" disabled={!hasAccess} /></div>
            <div className="form-group"><label className="form-label"><MessageCircle size={14} /> WhatsApp Moral Circle (Mahabba)</label><input type="url" name="whatsappMoralCircle" value={links.whatsappMoralCircle} onChange={handleChange} className="form-input" disabled={!hasAccess} /></div>
            <div className="form-group"><label className="form-label">Instagram Profile URL</label><input type="url" name="instagram" value={links.instagram} onChange={handleChange} className="form-input" disabled={!hasAccess} /></div>
            <div className="form-group"><label className="form-label">LinkedIn Profile URL</label><input type="url" name="linkedin" value={links.linkedin} onChange={handleChange} className="form-input" disabled={!hasAccess} /></div>
            <div className="form-group"><label className="form-label">YouTube Channel URL</label><input type="url" name="youtube" value={links.youtube} onChange={handleChange} className="form-input" disabled={!hasAccess} /></div>
          </div>
        </div>

        <div className="admin-stat-card" style={{ padding: '2rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} style={{ color: 'var(--secondary)' }} /> Campus Help Desk Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group"><label className="form-label"><Mail size={14} /> Official Email</label><input type="email" name="email" value={links.email} onChange={handleChange} className="form-input" disabled={!hasAccess} /></div>
            <div className="form-group"><label className="form-label"><Phone size={14} /> Helpline Numbers</label><input type="text" name="phone" value={links.phone} onChange={handleChange} className="form-input" disabled={!hasAccess} /></div>
            <div className="form-group"><label className="form-label"><MapPin size={14} /> Secretariat Address</label><textarea name="address" value={links.address} onChange={handleChange} className="form-input" rows="2" disabled={!hasAccess}></textarea></div>
            <div className="form-group"><label className="form-label"><Clock size={14} /> Circle Timings</label><input type="text" name="timing" value={links.timing} onChange={handleChange} className="form-input" disabled={!hasAccess} /></div>
          </div>
        </div>
      </div>
    </>
  );
}