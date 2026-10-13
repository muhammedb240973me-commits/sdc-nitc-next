'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/AdminProvider';
import { Shield, ShieldAlert, Trash2, UserPlus, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

export default function AdminUsers() {
  const { checkAccess, userEmail } = useAdmin();
  const hasAccess = checkAccess('users'); // true only for super_admin

  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('academic');

  const roleDefinitions = {
    super_admin: "All access + Admin management",
    admin: "All access (No admin management)",
    editor: "Question Bank & Gallery only",
    academic: "Question Bank only"
  };

  const fetchRoles = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('admin_roles').select('*').order('role');
    if (data) setRoles(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!hasAccess) return;
    setIsProcessing(true);
    
    const { error } = await supabase.from('admin_roles').upsert({ email: newEmail.toLowerCase(), role: newRole });
    
    setIsProcessing(false);
    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setStatus({ type: 'success', message: 'Admin role assigned successfully!' });
      setNewEmail('');
      fetchRoles();
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleDelete = async (emailToDelete) => {
    if (!hasAccess || emailToDelete === userEmail) return;
    if (!confirm(`Revoke admin access for ${emailToDelete}?`)) return;
    
    await supabase.from('admin_roles').delete().eq('email', emailToDelete);
    fetchRoles();
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>Admin Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Assign roles and control access levels for dashboard users.</p>
      </div>

      {!hasAccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA', marginBottom: '2rem' }}>
          <Lock size={20} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem' }}>Access Restricted</strong>
            <span style={{ fontSize: '0.8rem' }}>You do not have permission to manage admins. This page is in read-only mode.</span>
          </div>
        </div>
      )}

      {status && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: status.type === 'success' ? '#ECFDF5' : '#FEE2E2', color: status.type === 'success' ? '#047857' : '#B91C1C', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', border: `1px solid ${status.type === 'success' ? '#A7F3D0' : '#FECACA'}` }}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* ADD ADMIN FORM */}
        <div className="admin-stat-card" style={{ height: 'fit-content', opacity: hasAccess ? 1 : 0.6 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} style={{ color: 'var(--secondary)' }} /> Assign New Admin
          </h2>
          
          <form onSubmit={handleAddRole} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                className="form-input" 
                placeholder="colleague@sdcnitc.org" 
                required 
                disabled={!hasAccess || isProcessing} // FREEZE INPUT IF NO ACCESS
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)} 
                className="form-select"
                disabled={!hasAccess || isProcessing} // FREEZE SELECT IF NO ACCESS
              >
                {Object.entries(roleDefinitions).map(([key, desc]) => (
                  <option key={key} value={key}>{key.toUpperCase()} - {desc}</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
              Note: The user must sign up via the Supabase Dashboard authentication tab first. Assigning a role here grants them permissions once they log in.
            </div>
            <button type="submit" disabled={!hasAccess || isProcessing} className="btn-primary" style={{ justifyContent: 'center' }}>
              Assign Role
            </button>
          </form>
        </div>

        {/* ADMIN LIST */}
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} style={{ color: 'var(--secondary)' }} /> Active Administrators
          </h2>

          {isLoading ? (
            <div>Loading records...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {roles.map((user) => (
                <div key={user.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>{user.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {user.role === 'super_admin' ? <ShieldAlert size={12} style={{ color: '#EF4444' }}/> : <Shield size={12} />}
                      <span style={{ textTransform: 'uppercase', fontWeight: 700, color: user.role === 'super_admin' ? '#EF4444' : 'var(--text-light)' }}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  {user.email !== userEmail && (
                    <button 
                      onClick={() => handleDelete(user.email)}
                      disabled={!hasAccess}
                      style={{ color: hasAccess ? '#EF4444' : '#CBD5E1', padding: '0.5rem', cursor: hasAccess ? 'pointer' : 'not-allowed' }}
                      title={hasAccess ? "Revoke Access" : "Restricted"}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}