'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/AdminProvider';
import { Save, CheckCircle2, AlertCircle, Landmark, QrCode, ShieldAlert, Lock } from 'lucide-react';

export default function AdminDonate() {
  const { checkAccess } = useAdmin();
  const hasAccess = checkAccess('donate');

  const [donate, setDonate] = useState({
    hero: { tag: '', title: '', description: '' },
    upi: { badge: '', upiId: '', hint: '', qrImage: '' },
    bank: { title: '', accountName: '', bankName: '', branch: '', accountNumber: '', ifscCode: '' },
    accountability: { title: '', description: '' }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [qrFile, setQrFile] = useState(null);

  useEffect(() => {
    async function fetchDonateData() {
      const { data } = await supabase.from('site_content').select('content').eq('id', 'donate_content').maybeSingle();
      if (data?.content) setDonate(data.content);
      setIsLoading(false);
    }
    fetchDonateData();
  }, []);

  const handleNestedChange = (section, e) => {
    setDonate({ ...donate, [section]: { ...donate[section], [e.target.name]: e.target.value } });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!hasAccess) return;
    setIsSaving(true);
    setStatus(null);

    try {
      let finalData = { ...donate };
      if (qrFile) {
        const fileExt = qrFile.name.split('.').pop();
        const filePath = `gallery/qr-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('sdc-uploads').upload(filePath, qrFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('sdc-uploads').getPublicUrl(filePath);
        finalData.upi.qrImage = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('site_content').upsert({ id: 'donate_content', content: finalData });
      if (error) throw error;

      setDonate(finalData);
      setStatus({ type: 'success', message: 'Donate page updated successfully!' });
      setQrFile(null);
      if (document.getElementById('qr-upload')) document.getElementById('qr-upload').value = '';
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  if (isLoading) return <div>Loading donate page data...</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>Donate Page Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update bank details, UPI ID, and the donation QR code.</p>
        </div>
        <button onClick={handleSave} disabled={!hasAccess || isSaving} className="btn-primary" style={{ gap: '0.5rem' }}>
          <Save size={18} />{isSaving ? 'Saving...' : 'Save Changes'}
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

      {status && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: status.type === 'success' ? '#ECFDF5' : '#FEE2E2', color: status.type === 'success' ? '#047857' : '#B91C1C', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', border: `1px solid ${status.type === 'success' ? '#A7F3D0' : '#FECACA'}` }}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', opacity: hasAccess ? 1 : 0.7 }}>
        
        <div className="admin-stat-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><QrCode size={18} style={{ color: 'var(--secondary)' }} /> UPI & QR Settings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group"><label className="form-label">UPI ID</label><input type="text" name="upiId" value={donate.upi.upiId} onChange={(e) => handleNestedChange('upi', e)} className="form-input" disabled={!hasAccess} /></div>
            <div className="form-group">
              <label className="form-label">Replace QR Code Image</label>
              <input id="qr-upload" type="file" accept="image/*" onChange={(e) => setQrFile(e.target.files[0])} className="form-input" style={{ padding: '0.5rem' }} disabled={!hasAccess} />
              {donate.upi.qrImage && !qrFile && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                  Current image: <a href={donate.upi.qrImage} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>View Image</a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="admin-stat-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Landmark size={18} style={{ color: 'var(--secondary)' }} /> Bank Transfer Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group"><label className="form-label">Account Name</label><input type="text" name="accountName" value={donate.bank.accountName} onChange={(e) => handleNestedChange('bank', e)} className="form-input" disabled={!hasAccess} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Bank Name</label><input type="text" name="bankName" value={donate.bank.bankName} onChange={(e) => handleNestedChange('bank', e)} className="form-input" disabled={!hasAccess} /></div>
              <div className="form-group"><label className="form-label">Branch</label><input type="text" name="branch" value={donate.bank.branch} onChange={(e) => handleNestedChange('bank', e)} className="form-input" disabled={!hasAccess} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Account Number</label><input type="text" name="accountNumber" value={donate.bank.accountNumber} onChange={(e) => handleNestedChange('bank', e)} className="form-input" disabled={!hasAccess} /></div>
              <div className="form-group"><label className="form-label">IFSC Code</label><input type="text" name="ifscCode" value={donate.bank.ifscCode} onChange={(e) => handleNestedChange('bank', e)} className="form-input" disabled={!hasAccess} /></div>
            </div>
          </div>
        </div>

        <div className="admin-stat-card" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={18} style={{ color: 'var(--secondary)' }} /> Page Text & Accountability</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group"><label className="form-label">Hero Description Text</label><textarea name="description" value={donate.hero.description} onChange={(e) => handleNestedChange('hero', e)} className="form-input" rows="2" disabled={!hasAccess}></textarea></div>
            <div className="form-group"><label className="form-label">Accountability Disclaimer Text</label><textarea name="description" value={donate.accountability.description} onChange={(e) => handleNestedChange('accountability', e)} className="form-input" rows="2" disabled={!hasAccess}></textarea></div>
          </div>
        </div>
      </div>
    </>
  );
}