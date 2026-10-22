'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, ArrowLeft, Shield, Mail, Key } from 'lucide-react';
import { createAdminUser, updateAdminUser, deleteAdminUser } from './actions';

export default function AdminUsersPage() {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin'
  });

  useEffect(() => {
    if (view === 'list') fetchUsers();
  }, [view]);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('admin_roles').select('*').order('role', { ascending: true });
    setUsers(data || []);
    setLoading(false);
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', role: 'admin' });
    setView('list');
  };

  const handleEdit = (user) => {
    setFormData({ email: user.email, password: '', role: user.role });
    setView('edit');
  };

  const handleDelete = async (email) => {
    if (window.confirm(`Are you sure you want to permanently delete the admin account for ${email}?`)) {
      const res = await deleteAdminUser(email);
      if (res.success) {
        fetchUsers();
      } else {
        alert(`Error deleting user: ${res.error}`);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (view === 'create') {
      if (!formData.password || formData.password.length < 6) {
        alert('Password must be at least 6 characters long.');
        setIsSubmitting(false);
        return;
      }
      const res = await createAdminUser(formData.email, formData.password, formData.role);
      if (res.success) {
        alert('User created successfully!');
        resetForm();
      } else {
        alert(`Error creating user: ${res.error}`);
      }
    } else if (view === 'edit') {
      const res = await updateAdminUser(formData.email, formData.password, formData.role);
      if (res.success) {
        alert('User updated successfully!');
        resetForm();
      } else {
        alert(`Error updating user: ${res.error}`);
      }
    }
    
    setIsSubmitting(false);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={resetForm} className="btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            {view === 'create' ? 'Add New Admin' : 'Edit Admin Account'}
          </h2>
        </div>
        
        <div className="admin-card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <label className="admin-label"><Mail size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '4px' }}/> Email Address</label>
              <input 
                type="email" 
                className="admin-input" 
                required 
                disabled={view === 'edit'} // Cannot change email once created
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="admin@sdcnitc.com" 
              />
              {view === 'edit' && <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>Email cannot be changed. Create a new user if needed.</p>}
            </div>

            <div>
              <label className="admin-label"><Key size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '4px' }}/> {view === 'edit' ? 'New Password (Leave blank to keep current)' : 'Password'}</label>
              <input 
                type="password" 
                className="admin-input" 
                required={view === 'create'}
                minLength={6}
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder={view === 'edit' ? '••••••••' : 'Enter a secure password'} 
              />
            </div>

            <div>
              <label className="admin-label"><Shield size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '4px' }}/> Access Role</label>
              <select 
                className="admin-input" 
                required 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="super_admin">Super Admin (Full Access)</option>
                <option value="admin">Admin (CMS & Users)</option>
                <option value="editor">Editor (Content Only)</option>
                <option value="academic">Academic (Question Bank & Materials)</option>
              </select>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '0.8rem', marginTop: '1rem' }}>
              {isSubmitting ? 'Saving...' : (view === 'create' ? 'Create Account' : 'Update Account')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>Admin Users</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Manage dashboard access, passwords, and roles</p>
        </div>
        <button onClick={() => setView('create')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Admin
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 800, color: '#475569' }}>Admin User</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 800, color: '#475569' }}>Role</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      background: user.role === 'super_admin' ? '#FEF2F2' : '#EFF6FF', 
                      color: user.role === 'super_admin' ? '#EF4444' : '#3B82F6', 
                      padding: '0.3rem 0.75rem', 
                      borderRadius: '50px', 
                      fontSize: '0.75rem', 
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(user)} className="btn-outline" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(user.email)} style={{ padding: '0.5rem', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}