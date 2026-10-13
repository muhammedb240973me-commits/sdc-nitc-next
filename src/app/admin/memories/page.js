'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/AdminProvider';
import { Calendar, Save, Trash2, Edit, Star, StarOff, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

export default function AdminMemories() {
  const { checkAccess } = useAdmin();
  const hasAccess = checkAccess('memories');

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [dateLabel, setDateLabel] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) setEvents(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!hasAccess) return;
    setIsSaving(true);
    setStatus(null);

    const eventData = { date_label: dateLabel, title, description, is_featured: isFeatured };
    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from('events').update(eventData).eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('events').insert([eventData]);
      error = insertError;
    }

    setIsSaving(false);
    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setStatus({ type: 'success', message: editingId ? 'Event updated!' : 'Event created!' });
      resetForm();
      fetchEvents();
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id); setDateLabel(event.date_label); setTitle(event.title); setDescription(event.description); setIsFeatured(event.is_featured);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!hasAccess) return;
    if (!confirm('Are you sure you want to delete this event permanently?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  };

  const toggleFeatured = async (id, currentStatus) => {
    if (!hasAccess) return;
    await supabase.from('events').update({ is_featured: !currentStatus }).eq('id', id);
    fetchEvents();
  };

  const resetForm = () => { setEditingId(null); setDateLabel(''); setTitle(''); setDescription(''); setIsFeatured(true); };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>Memories & Events</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log organizational history and control the "Recent Events" widget.</p>
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

      {status && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: status.type === 'success' ? '#ECFDF5' : '#FEE2E2', color: status.type === 'success' ? '#047857' : '#B91C1C', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', border: `1px solid ${status.type === 'success' ? '#A7F3D0' : '#FECACA'}` }}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', opacity: hasAccess ? 1 : 0.7 }}>
        
        <div className="admin-stat-card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} style={{ color: 'var(--secondary)' }} /> {editingId ? 'Edit Event' : 'Log New Event'}</h2>
          
          <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Date Badge</label><input type="text" value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} className="form-input" placeholder="e.g. Sep 16" required disabled={!hasAccess} /></div>
              <div className="form-group"><label className="form-label">Event Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" placeholder="e.g. Turn A Page" required disabled={!hasAccess} /></div>
            </div>
            <div className="form-group"><label className="form-label">Detailed Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" rows="4" required disabled={!hasAccess}></textarea></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <input type="checkbox" id="featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--secondary)' }} disabled={!hasAccess} />
              <label htmlFor="featured" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Show in "Recent Events" widget on homepage</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" disabled={!hasAccess || isSaving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Save size={18} /> {isSaving ? 'Saving...' : (editingId ? 'Update Event' : 'Save Event')}</button>
              {editingId && <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>}
            </div>
          </form>
        </div>

        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Star size={18} style={{ color: 'var(--secondary)' }} /> Event Archive ({events.length})</h2>
          {isLoading ? <div>Loading events...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map((event) => (
                <div key={event.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', gap: '1rem' }}>
                  <div style={{ flexShrink: 0 }}><span style={{ display: 'inline-block', backgroundColor: 'var(--secondary-subtle)', color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #A7F3D0' }}>{event.date_label}</span></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{event.title}</h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => toggleFeatured(event.id, event.is_featured)} disabled={!hasAccess} style={{ color: event.is_featured ? 'var(--tertiary-light)' : '#CBD5E1', cursor: hasAccess ? 'pointer' : 'not-allowed' }}><Star size={18} fill={event.is_featured ? "currentColor" : "none"} /></button>
                        <button onClick={() => handleEdit(event)} disabled={!hasAccess} style={{ color: '#94A3B8', cursor: hasAccess ? 'pointer' : 'not-allowed' }}><Edit size={18} /></button>
                        <button onClick={() => handleDelete(event.id)} disabled={!hasAccess} style={{ color: '#EF4444', cursor: hasAccess ? 'pointer' : 'not-allowed' }}><Trash2 size={18} /></button>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}