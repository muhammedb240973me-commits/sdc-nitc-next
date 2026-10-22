'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Edit, Trash2, ArrowLeft, Image as ImageIcon, 
  Star, GraduationCap, Loader2, Lock, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function AlumniAdmin() {
  const [hasAccess, setHasAccess] = useState(true);
  const [view, setView] = useState('list');
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', role_company: '', grad_year: '', quote: '', photo_url: '', is_featured: true
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (view === 'list') fetchAlumni();
  }, [view]);

  async function fetchAlumni() {
    setLoading(true);
    
    // 1. Check Role
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: roleData } = await supabase.from('admin_roles').select('role').eq('email', session.user.email).single();
      if (roleData && !['super_admin', 'admin', 'editor'].includes(roleData.role)) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
    }

    // 2. Fetch Data if authorized
    const { data } = await supabase.from('alumni_testimonials').select('*').order('created_at', { ascending: false });
    setAlumni(data || []);
    setLoading(false);
  }

  const resetForm = () => {
    setFormData({ name: '', role_company: '', grad_year: '', quote: '', photo_url: '', is_featured: true });
    setEditingId(null);
    setView('list');
  };

  const handleEdit = (person) => {
    setFormData(person);
    setEditingId(person.id);
    setView('create');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this alumni profile?')) {
      const { error } = await supabase.from('alumni_testimonials').delete().eq('id', id);
      if (error) alert(`Error deleting profile: ${error.message}`);
      else fetchAlumni();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `alumni-${Date.now()}.${fileExt}`;
    const filePath = `alumni/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('sdc-uploads')
      .upload(filePath, file);

    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('sdc-uploads')
      .getPublicUrl(filePath);

    setFormData({ ...formData, photo_url: publicUrl });
    setIsUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (editingId) {
      const { error } = await supabase.from('alumni_testimonials').update(formData).eq('id', editingId);
      if (error) alert(`Error updating: ${error.message}`);
      else resetForm();
    } else {
      const { error } = await supabase.from('alumni_testimonials').insert([formData]);
      if (error) alert(`Error saving: ${error.message}`);
      else resetForm();
    }
    setIsSubmitting(false);
  };

  if (view === 'create') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={resetForm} className="btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            {editingId ? 'Edit Alumni Profile' : 'Add Alumni Profile'}
          </h2>
        </div>
        
        <div className="admin-card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Photo Upload Section */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#F8FAFC', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={32} color="#94A3B8" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label className="admin-label">Profile Photo</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="admin-input" style={{ background: 'white' }} />
                {isUploading && <p style={{ fontSize: '0.8rem', color: '#3B82F6', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Loader2 size={12} className="animate-spin" /> Uploading image...</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="admin-label">Full Name</label>
                <input type="text" className="admin-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Jane Doe" />
              </div>
              <div>
                <label className="admin-label">Graduation Year</label>
                <input type="text" className="admin-input" required value={formData.grad_year} onChange={e => setFormData({...formData, grad_year: e.target.value})} placeholder="e.g., 2024" />
              </div>
            </div>

            <div>
              <label className="admin-label">Role & Company / Current Status</label>
              <input type="text" className="admin-input" required value={formData.role_company} onChange={e => setFormData({...formData, role_company: e.target.value})} placeholder="e.g., Software Engineer at Google" />
            </div>

            <div>
              <label className="admin-label">Testimonial Quote</label>
              <textarea className="admin-input" required rows="4" value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} placeholder="What did they say about their experience?"></textarea>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <input type="checkbox" className="admin-input" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} style={{ width: 'auto' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>Feature on Home Page Slider</span>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>If checked, this profile will scroll across the main landing page.</span>
              </div>
            </label>

            <button type="submit" disabled={isSubmitting || isUploading} className="btn-primary" style={{ padding: '0.75rem' }}>
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Profile' : 'Save Alumni Profile')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="admin-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Shield size={48} style={{ margin: '0 auto 1rem', color: '#EF4444', opacity: 0.5 }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>Access Restricted</h2>
        <p style={{ color: '#64748B', marginTop: '0.5rem' }}>You do not have permission to manage Alumni profiles.</p>
      </div>
    );
  }


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>Alumni Profiles</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Manage success stories and testimonials</p>
        </div>
        <button onClick={() => setView('create')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Alumni
        </button>
      </div>

      {loading ? (
        <p>Loading profiles...</p>
      ) : alumni.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <GraduationCap size={48} style={{ margin: '0 auto 1rem', color: '#CBD5E1' }} />
          <p style={{ color: '#64748B', fontWeight: 600 }}>No alumni profiles added yet.</p>
        </div>
      ) : (
        <div className="admin-section-grid">
          {alumni.map((person) => (
            <div key={person.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
                  {person.photo_url ? (
                    <img src={person.photo_url} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GraduationCap size={24} color="#94A3B8" />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {person.name}
                    {person.is_featured && <Star size={14} fill="#F59E0B" color="#F59E0B" title="Featured on Homepage" />}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#3B82F6', fontWeight: 700 }}>{person.grad_year}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.2 }}>{person.role_company}</p>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569', flex: 1 }}>
                "{person.quote.substring(0, 100)}{person.quote.length > 100 ? '...' : ''}"
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                <button onClick={() => handleEdit(person)} className="btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', padding: '0.5rem' }}>
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(person.id)} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', padding: '0.5rem', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}