'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/AdminProvider';
import { Save, CheckCircle2, AlertCircle, Info, LayoutGrid, Lock } from 'lucide-react';

export default function AdminAbout() {
  const { checkAccess } = useAdmin();
  const hasAccess = checkAccess('about');

  const [content, setContent] = useState({
    header: { tag: '', title: '', paragraph1: '', paragraph2: '' },
    cards: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);
  const [status, setStatus] = useState({ section: null, type: '', message: '' });

  const availableIcons = ["ShieldCheck", "GraduationCap", "Users", "Award", "HeartHandshake", "BookOpen", "Sparkles", "Target"];

  useEffect(() => {
    async function fetchContent() {
      const { data } = await supabase.from('site_content').select('content').eq('id', 'about_content').maybeSingle();
      if (data?.content) {
        setContent({
          header: data.content.header || {},
          cards: data.content.cards || []
        });
      }
      setIsLoading(false);
    }
    fetchContent();
  }, []);

  const handleHeaderChange = (e) => {
    setContent({
      ...content,
      header: { ...content.header, [e.target.name]: e.target.value }
    });
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...content.cards];
    newCards[index][field] = value;
    setContent({ ...content, cards: newCards });
  };

  const handleSave = async (sectionName) => {
    if (!hasAccess) return;
    setSavingSection(sectionName);
    setStatus({ section: null, type: '', message: '' });

    const { error } = await supabase.from('site_content').upsert({ id: 'about_content', content });

    setSavingSection(null);
    
    if (error) {
      setStatus({ section: sectionName, type: 'error', message: error.message });
    } else {
      setStatus({ section: sectionName, type: 'success', message: `${sectionName} updated successfully!` });
      setTimeout(() => setStatus({ section: null, type: '', message: '' }), 3000);
    }
  };

  const renderStatus = (sectionName) => {
    if (status.section !== sectionName) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: status.type === 'success' ? '#ECFDF5' : '#FEE2E2', color: status.type === 'success' ? '#047857' : '#B91C1C', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.8rem', border: `1px solid ${status.type === 'success' ? '#A7F3D0' : '#FECACA'}` }}>
        {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        <span>{status.message}</span>
      </div>
    );
  };

  if (isLoading) return <div>Loading about page data...</div>;

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>About Page Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage the introduction paragraphs and the core values cards.</p>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', opacity: hasAccess ? 1 : 0.7 }}>
        
        {/* HEADER & PARAGRAPHS SECTION */}
        <div className="admin-stat-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} style={{ color: 'var(--secondary)' }} /> Header & Text
            </h2>
            <button onClick={() => handleSave('Header')} disabled={!hasAccess || savingSection === 'Header'} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              <Save size={14} /> {savingSection === 'Header' ? 'Saving...' : 'Save Header'}
            </button>
          </div>
          {renderStatus('Header')}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Section Tag</label>
                <input type="text" name="tag" value={content.header.tag} onChange={handleHeaderChange} className="form-input" disabled={!hasAccess} />
              </div>
              <div className="form-group">
                <label className="form-label">Main Heading</label>
                <input type="text" name="title" value={content.header.title} onChange={handleHeaderChange} className="form-input" disabled={!hasAccess} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">First Paragraph</label>
              <textarea name="paragraph1" value={content.header.paragraph1} onChange={handleHeaderChange} className="form-input" rows="3" disabled={!hasAccess}></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Second Paragraph</label>
              <textarea name="paragraph2" value={content.header.paragraph2} onChange={handleHeaderChange} className="form-input" rows="3" disabled={!hasAccess}></textarea>
            </div>
          </div>
        </div>

        {/* CORE VALUES CARDS SECTION */}
        <div className="admin-stat-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutGrid size={18} style={{ color: 'var(--secondary)' }} /> Core Values Cards
            </h2>
            <button onClick={() => handleSave('Cards')} disabled={!hasAccess || savingSection === 'Cards'} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              <Save size={14} /> {savingSection === 'Cards' ? 'Saving...' : 'Save Cards'}
            </button>
          </div>
          {renderStatus('Cards')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {content.cards.map((card, idx) => (
              <div key={idx} style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--page-bg)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Card 0{idx + 1}</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Icon</label>
                    <select value={card.icon} onChange={e => handleCardChange(idx, 'icon', e.target.value)} className="form-select" disabled={!hasAccess}>
                      {availableIcons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Title</label>
                    <input type="text" value={card.title} onChange={e => handleCardChange(idx, 'title', e.target.value)} className="form-input" disabled={!hasAccess} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Description</label>
                  <textarea value={card.description} onChange={e => handleCardChange(idx, 'description', e.target.value)} className="form-input" rows="2" disabled={!hasAccess}></textarea>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}