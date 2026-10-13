'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/AdminProvider';
import { Upload, Trash2, Image as ImageIcon, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default function AdminGallery() {
  const { checkAccess } = useAdmin();
  const hasAccess = checkAccess('gallery');

  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Events');
  const [tag, setTag] = useState('');
  const [file, setFile] = useState(null);

  const categories = ["Events", "Moral Classes", "Trips & Camps"];

  const fetchImages = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (data) setImages(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!hasAccess || !file) return;
    setIsUploading(true);
    setStatus(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `gallery/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('sdc-uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('sdc-uploads').getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('gallery').insert([{ title, category, tag, image_url: publicUrlData.publicUrl }]);
      if (dbError) throw dbError;

      setStatus({ type: 'success', message: 'Image uploaded successfully!' });
      setTitle(''); setTag(''); setFile(null);
      document.getElementById('file-input').value = '';
      fetchImages();
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsUploading(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleDelete = async (id, imageUrl) => {
    if (!hasAccess) return;
    if (!confirm('Are you sure you want to delete this image?')) return;

    await supabase.from('gallery').delete().eq('id', id);
    const filePath = imageUrl.split('sdc-uploads/')[1];
    if (filePath) await supabase.storage.from('sdc-uploads').remove([filePath]);
    fetchImages();
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>Gallery Manager</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload new campus memories and manage existing photo archives.</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', opacity: hasAccess ? 1 : 0.7 }}>
        
        <div className="admin-stat-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Upload size={18} style={{ color: 'var(--secondary)' }} /> Upload New Photo</h2>
          <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
            <div className="form-group"><label className="form-label">Photo Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required disabled={!hasAccess} /></div>
            <div className="form-group"><label className="form-label">Category *</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select" disabled={!hasAccess}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Location/Tag</label><input type="text" value={tag} onChange={(e) => setTag(e.target.value)} className="form-input" disabled={!hasAccess} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Select Image File *</label><input id="file-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="form-input" style={{ padding: '0.5rem' }} required disabled={!hasAccess} /></div>
            <button type="submit" disabled={!hasAccess || isUploading} className="btn-primary" style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>{isUploading ? 'Uploading to Cloud...' : 'Upload Image'}</button>
          </form>
        </div>

        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ImageIcon size={18} style={{ color: 'var(--secondary)' }} /> Current Gallery ({images.length})</h2>
          {isLoading ? <div>Loading archive...</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
              {images.map((img) => (
                <div key={img.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ height: '160px', backgroundColor: 'var(--primary)', position: 'relative' }}><img src={img.image_url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                  <div style={{ padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>{img.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '1rem' }}>{img.category} • {img.tag}</p>
                    <button onClick={() => handleDelete(img.id, img.image_url)} disabled={!hasAccess} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: hasAccess ? '#EF4444' : '#CBD5E1', fontSize: '0.75rem', fontWeight: 700, cursor: hasAccess ? 'pointer' : 'not-allowed' }}><Trash2 size={14} /> Delete</button>
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