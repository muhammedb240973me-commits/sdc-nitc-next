'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/AdminProvider';
import { Save, CheckCircle2, AlertCircle, LayoutTemplate, Megaphone, BarChart3, Layers, Lock } from 'lucide-react';

export default function AdminContent() {
  const { checkAccess } = useAdmin();
  const hasAccess = checkAccess('content');

  const [content, setContent] = useState({
    tickerText: '',
    hero: { badgeText: '', titleStart: '', titleHighlight: '', description: '' },
    metrics: [],
    pillars: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);
  const [status, setStatus] = useState({ section: null, type: '', message: '' });

  useEffect(() => {
    async function fetchContent() {
      const { data } = await supabase.from('site_content').select('content').eq('id', 'home_content').maybeSingle();
      if (data?.content) {
        setContent({
          tickerText: data.content.tickerText || '',
          hero: data.content.hero || {},
          metrics: data.content.metrics || [],
          pillars: data.content.pillars || []
        });
      }
      setIsLoading(false);
    }
    fetchContent();
  }, []);

  const handleMetricChange = (index, field, value) => {
    const newMetrics = [...content.metrics];
    newMetrics[index][field] = value;
    setContent({ ...content, metrics: newMetrics });
  };

  const handlePillarChange = (index, field, value) => {
    const newPillars = [...content.pillars];
    newPillars[index][field] = value;
    setContent({ ...content, pillars: newPillars });
  };

  const handleSave = async (sectionName) => {
    if (!hasAccess) return;
    setSavingSection(sectionName);
    setStatus({ section: null, type: '', message: '' });

    const { error } = await supabase.from('site_content').upsert({ id: 'home_content', content });

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

  if (isLoading) return <div>Loading content data...</div>;

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>Website Content</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage the hero section, announcement ticker, impact metrics, and core pillars.</p>
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
        
        <div className="admin-stat-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={18} style={{ color: 'var(--secondary)' }} /> Announcement Ticker
            </h2>
            <button onClick={() => handleSave('Ticker')} disabled={!hasAccess || savingSection === 'Ticker'} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              <Save size={14} /> {savingSection === 'Ticker' ? 'Saving...' : 'Save Ticker'}
            </button>
          </div>
          {renderStatus('Ticker')}
          
          <div className="form-group">
            <label className="form-label">Scrolling Top Bar Text</label>
            <input type="text" value={content.tickerText} onChange={(e) => setContent({ ...content, tickerText: e.target.value })} className="form-input" disabled={!hasAccess} />
          </div>
        </div>

        <div className="admin-stat-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutTemplate size={18} style={{ color: 'var(--secondary)' }} /> Homepage Hero
            </h2>
            <button onClick={() => handleSave('Hero')} disabled={!hasAccess || savingSection === 'Hero'} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              <Save size={14} /> {savingSection === 'Hero' ? 'Saving...' : 'Save Hero'}
            </button>
          </div>
          {renderStatus('Hero')}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Pill Badge Text</label>
              <input type="text" value={content.hero.badgeText} onChange={e => setContent({...content, hero: {...content.hero, badgeText: e.target.value}})} className="form-input" disabled={!hasAccess} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Main Title (Start)</label>
                <input type="text" value={content.hero.titleStart} onChange={e => setContent({...content, hero: {...content.hero, titleStart: e.target.value}})} className="form-input" disabled={!hasAccess} />
              </div>
              <div className="form-group">
                <label className="form-label">Title Highlight (Green Wavy Underline)</label>
                <input type="text" value={content.hero.titleHighlight} onChange={e => setContent({...content, hero: {...content.hero, titleHighlight: e.target.value}})} className="form-input" disabled={!hasAccess} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hero Description</label>
              <textarea value={content.hero.description} onChange={e => setContent({...content, hero: {...content.hero, description: e.target.value}})} className="form-input" rows="3" disabled={!hasAccess}></textarea>
            </div>
          </div>
        </div>

        <div className="admin-stat-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} style={{ color: 'var(--secondary)' }} /> Impact Metrics
            </h2>
            <button onClick={() => handleSave('Metrics')} disabled={!hasAccess || savingSection === 'Metrics'} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              <Save size={14} /> {savingSection === 'Metrics' ? 'Saving...' : 'Save Metrics'}
            </button>
          </div>
          {renderStatus('Metrics')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {content.metrics.map((metric, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--page-bg)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.75rem' }}>METRIC 0{idx + 1}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Target Number</label>
                    <input type="number" value={metric.target} onChange={e => handleMetricChange(idx, 'target', parseInt(e.target.value) || 0)} className="form-input" disabled={!hasAccess} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Suffix (e.g. +)</label>
                    <input type="text" value={metric.suffix} onChange={e => handleMetricChange(idx, 'suffix', e.target.value)} className="form-input" disabled={!hasAccess} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Title</label>
                  <input type="text" value={metric.title} onChange={e => handleMetricChange(idx, 'title', e.target.value)} className="form-input" disabled={!hasAccess} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Description</label>
                  <input type="text" value={metric.desc} onChange={e => handleMetricChange(idx, 'desc', e.target.value)} className="form-input" disabled={!hasAccess} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-stat-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--secondary)' }} /> Core Pillars
            </h2>
            <button onClick={() => handleSave('Pillars')} disabled={!hasAccess || savingSection === 'Pillars'} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              <Save size={14} /> {savingSection === 'Pillars' ? 'Saving...' : 'Save Pillars'}
            </button>
          </div>
          {renderStatus('Pillars')}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {content.pillars.map((pillar, idx) => (
              <div key={idx} style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--page-bg)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.75rem' }}>{pillar.num.toUpperCase()}</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Title</label>
                    <input type="text" value={pillar.title} onChange={e => handlePillarChange(idx, 'title', e.target.value)} className="form-input" disabled={!hasAccess} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Time / Subtext</label>
                    <input type="text" value={pillar.time} onChange={e => handlePillarChange(idx, 'time', e.target.value)} className="form-input" disabled={!hasAccess} />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Description</label>
                  <textarea value={pillar.text} onChange={e => handlePillarChange(idx, 'text', e.target.value)} className="form-input" rows="2" disabled={!hasAccess}></textarea>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Footer Text</label>
                    <input type="text" value={pillar.footer} onChange={e => handlePillarChange(idx, 'footer', e.target.value)} className="form-input" disabled={!hasAccess} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Category Tab</label>
                    <select value={pillar.category} onChange={e => handlePillarChange(idx, 'category', e.target.value)} className="form-select" disabled={!hasAccess}>
                      <option value="moral">Moral Classes</option>
                      <option value="academics">Academics</option>
                      <option value="career">Career & Placement</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}