'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Users, Edit, Link as LinkIcon, Download, 
  Trash2, ArrowLeft, Image as ImageIcon, CheckCircle 
} from 'lucide-react';

export default function EventsAdmin() {
  const [view, setView] = useState('list'); // 'list', 'create', 'responses'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [responses, setResponses] = useState([]);

  // Form Builder State
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', event_date: '', event_time: '',
    location: '', success_message: '', whatsapp_link: '', theme_color: '#1E293B',
    fields: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing

  useEffect(() => {
    if (view === 'list') fetchEvents();
  }, [view]);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase.from('event_forms').select('*').order('created_at', { ascending: false });
    setEvents(data || []);
    setLoading(false);
  }

  async function fetchResponses(eventId) {
    setLoading(true);
    const { data } = await supabase.from('event_responses').select('*').eq('form_id', eventId);
    setResponses(data || []);
    setLoading(false);
  }

  // --- FORM BUILDER HANDLERS ---
  const addField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, { id: Date.now(), label: '', type: 'short_text', required: true, options: '' }]
    });
  };

  const updateField = (id, key, value) => {
    setFormData({
      ...formData,
      fields: formData.fields.map(f => f.id === id ? { ...f, [key]: value } : f)
    });
  };

  const removeField = (id) => {
    setFormData({ ...formData, fields: formData.fields.filter(f => f.id !== id) });
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', description: '', event_date: '', event_time: '', location: '', success_message: '', whatsapp_link: '', theme_color: '#1E293B', fields: [] });
    setEditingId(null);
    setView('list');
  };

  const handleEdit = (event) => {
    setFormData(event);
    setEditingId(event.id);
    setView('create');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This will also delete all submitted responses permanently.')) {
      const { error } = await supabase.from('event_forms').delete().eq('id', id);
      if (error) {
        alert(`Error deleting event: ${error.message}`);
      } else {
        fetchEvents();
      }
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Ensure slug doesn't conflict with core pages
    const restrictedSlugs = ['admin', 'gallery', 'donate', 'question-bank', 'about'];
    if (restrictedSlugs.includes(formData.slug.toLowerCase())) {
      alert('This URL is reserved. Please choose another.');
      setIsSubmitting(false);
      return;
    }

    if (editingId) {
      // UPDATE EXISTING FORM
      const { error } = await supabase.from('event_forms').update(formData).eq('id', editingId);
      if (error) alert(`Error updating form: ${error.message}`);
      else {
        alert('Event Form updated successfully!');
        resetForm();
        fetchEvents();
      }
    } else {
      // CREATE NEW FORM
      const { error } = await supabase.from('event_forms').insert([formData]);
      if (error) alert(`Error saving form: ${error.message}`);
      else {
        alert('Event Form created successfully!');
        resetForm();
        fetchEvents();
      }
    }
    setIsSubmitting(false);
  };

  // --- CSV EXPORT HANDLER ---
  const exportToCSV = () => {
    if (responses.length === 0) return;
    
    // Extract unique headers from all response JSON objects
    const headers = Array.from(new Set(responses.flatMap(r => Object.keys(r.response_data))));
    
    const csvRows = [
      ['Date Submitted', ...headers].join(','),
      ...responses.map(row => {
        const date = new Date(row.created_at).toLocaleString();
        const data = headers.map(header => {
          let val = row.response_data[header] || '';
          // Escape quotes and wrap in quotes to handle commas within text
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        return [date, ...data].join(',');
      })
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent.slug}-responses.csv`;
    a.click();
  };

  // ================= VIEW COMPONENTS =================

  if (view === 'create') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Section: Back Button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            onClick={resetForm} 
            className="btn-outline" 
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', height: 'fit-content' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            {editingId ? 'Edit Custom Form' : 'Create Custom Form'}
          </h2>
        </div>
        
        {/* Main Form Card */}
        <div className="admin-card" style={{ display: 'block' }}>
          <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="admin-label">Event Title</label>
                <input type="text" className="admin-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Winter Leadership Camp" />
              </div>
              <div>
                <label className="admin-label">URL Slug (sdcnitc.vercel.app/___)</label>
                <input type="text" className="admin-input" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} placeholder="e.g., winter-camp" />
              </div>
            </div>

            <div>
              <label className="admin-label">Description / Instructions</label>
              <textarea className="admin-input" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Information about the event..."></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="admin-label">Date</label>
                <input type="date" className="admin-input" value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})} />
              </div>
              <div>
                <label className="admin-label">Time</label>
                <input type="time" className="admin-input" value={formData.event_time} onChange={e => setFormData({...formData, event_time: e.target.value})} />
              </div>
              <div>
                <label className="admin-label">Location</label>
                <input type="text" className="admin-input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
            
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Form Fields</h3>
              
              {formData.fields.map((field) => (
                <div key={field.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #E2E8F0' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input type="text" className="admin-input" placeholder="Field Label (e.g. Full Name)" required value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)} />
                      <select className="admin-input" value={field.type} onChange={e => updateField(field.id, 'type', e.target.value)}>
                        <option value="short_text">Short Text</option>
                        <option value="long_text">Long Text</option>
                        <option value="number">Number</option>
                        <option value="phone">Phone Number</option>
                        <option value="list">Dropdown List</option>
                        <option value="radio">Radio Buttons</option>
                      </select>
                    </div>
                    
                    {(field.type === 'list' || field.type === 'radio') && (
                      <input type="text" className="admin-input" placeholder="Options (comma separated)" required value={field.options} onChange={e => updateField(field.id, 'options', e.target.value)} />
                    )}
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, 'required', e.target.checked)} />
                      Required Field
                    </label>
                  </div>
                  <button type="button" onClick={() => removeField(field.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              <button type="button" onClick={addField} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> Add Field
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>Post-Submission & Theme</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="admin-label">Success Message</label>
                <input type="text" className="admin-input" value={formData.success_message} onChange={e => setFormData({...formData, success_message: e.target.value})} placeholder="Thank you for registering!" />
              </div>
              <div>
                <label className="admin-label">Redirect / WhatsApp Link</label>
                <input type="url" className="admin-input" value={formData.whatsapp_link} onChange={e => setFormData({...formData, whatsapp_link: e.target.value})} placeholder="https://chat.whatsapp.com/..." />
              </div>
              <div>
                <label className="admin-label">Theme Color (Hex)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="color" value={formData.theme_color} onChange={e => setFormData({...formData, theme_color: e.target.value})} />
                  <input type="text" className="admin-input" value={formData.theme_color} onChange={e => setFormData({...formData, theme_color: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.75rem' }}>
              {isSubmitting ? 'Saving Event...' : (editingId ? 'Update Event Form' : 'Create Registration Form')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'responses') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <button onClick={() => setView('list')} className="btn-outline" style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back
            </button>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
              Responses: {selectedEvent?.title}
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {responses.length} total submissions
            </p>
          </div>
          <button onClick={exportToCSV} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export CSV
          </button>
        </div>

        {loading ? (
          <p>Loading responses...</p>
        ) : responses.length === 0 ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', color: '#CBD5E1' }} />
            <p style={{ color: '#64748B', fontWeight: 600 }}>No responses yet.</p>
          </div>
        ) : (
          <div className="admin-card" style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Date</th>
                  {Object.keys(responses[0].response_data).map(key => (
                    <th key={key} style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, color: '#475569', textTransform: 'capitalize' }}>
                      {key.replace(/-/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '1rem', color: '#64748B' }}>
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    {Object.values(row.response_data).map((val, idx) => (
                      <td key={idx} style={{ padding: '1rem', color: 'var(--primary)' }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT: LIST VIEW
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>Event Forms</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Create custom registration pages and view data</p>
        </div>
        <button onClick={() => setView('create')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Create Event Form
        </button>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>No custom forms have been created yet.</p>
        </div>
      ) : (
        <div className="admin-section-grid">
          {events.map((event) => (
            <div key={event.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Card Header with Title, Slug, Edit, and Delete */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>{event.title}</h3>
                  <a href={`/${event.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <LinkIcon size={12} /> sdcnitc.vercel.app/{event.slug}
                  </a>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleEdit(event)} 
                    style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }} 
                    title="Edit Form"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(event.id)} 
                    style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }} 
                    title="Delete Form"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Bottom Actions */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button 
                  onClick={() => {
                    setSelectedEvent(event);
                    fetchResponses(event.id);
                    setView('responses');
                  }} 
                  className="btn-primary" 
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Users size={16} /> View Responses
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(`https://sdcnitc.vercel.app/${event.slug}`)} 
                  className="btn-outline" 
                  title="Copy Link"
                  style={{ padding: '0.5rem 0.75rem' }}
                >
                  <CopyIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Small helper for clipboard icon
function CopyIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
}