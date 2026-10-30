'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, Users, CalendarPlus, Settings, CheckCircle, Shield } from 'lucide-react';

export default function MahabbaAdmin() {
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions', 'analytics', 'settings'
  
  // Data States
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0 });
  const [settings, setSettings] = useState({ username: '', password: '' });
  
  // Form States
  const [newSession, setNewSession] = useState({ title: '', session_date: '' });

  useEffect(() => {
    fetchSessions();
    fetchStats();
    fetchSettings();
  }, []);

  async function fetchSessions() {
    const { data } = await supabase.from('mahabba_sessions').select(`*, mahabba_attendance(count)`).order('session_date', { ascending: false });
    setSessions(data || []);
  }

  async function fetchStats() {
    const { count } = await supabase.from('mahabba_students').select('*', { count: 'exact', head: true });
    setStats({ totalStudents: count || 0 });
  }

  async function fetchSettings() {
    const { data } = await supabase.from('mahabba_settings').select('*').eq('id', 1).single();
    if (data) setSettings({ username: data.username, password: data.password });
  }

  // --- Actions ---
  const handleCreateSession = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('mahabba_sessions').insert([newSession]);
    if (error) alert(error.message);
    else {
      setNewSession({ title: '', session_date: '' });
      fetchSessions();
    }
  };

  const toggleSessionStatus = async (id, currentStatus) => {
    await supabase.from('mahabba_sessions').update({ is_active: !currentStatus }).eq('id', id);
    fetchSessions();
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('mahabba_settings').update(settings).eq('id', 1);
    if (error) alert('Error updating settings');
    else alert('Scanner login credentials updated successfully!');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>Mahabba Portal</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Manage weekly sessions, attendance, and scanner access</p>
        </div>
        <a href="/mahabba/checkin" target="_blank" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          Open Scanner Page
        </a>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2E8F0', marginBottom: '2rem' }}>
        {['sessions', 'analytics', 'settings'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: 'none', border: 'none', padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
              color: activeTab === tab ? 'var(--primary)' : '#64748B',
              borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
              marginBottom: '-2px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB: SESSIONS */}
      {activeTab === 'sessions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          
          <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Session Date</th>
                  <th style={{ padding: '1rem' }}>Title</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Attendance</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{new Date(s.session_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: 'var(--primary)' }}>{s.title}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800 }}>{s.mahabba_attendance[0]?.count || 0}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => toggleSessionStatus(s.id, s.is_active)}
                        style={{ padding: '0.4rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: s.is_active ? '#DCFCE7' : '#F1F5F9', color: s.is_active ? '#16A34A' : '#64748B' }}
                      >
                        {s.is_active ? 'Active (Scanning)' : 'Closed'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarPlus size={18} /> New Session
            </h3>
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-label">Date</label>
                <input type="date" required className="admin-input" value={newSession.session_date} onChange={e => setNewSession({...newSession, session_date: e.target.value})} />
              </div>
              <div>
                <label className="admin-label">Session Title</label>
                <input type="text" required placeholder="e.g. Week 4: Gratitude" className="admin-input" value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>Create Session</button>
            </form>
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="admin-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <Users size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.totalStudents}</div>
              <div style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>Total Registered Students</div>
            </div>
            <div className="admin-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <CheckCircle size={32} color="#10B981" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10B981' }}>{sessions.length}</div>
              <div style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>Total Classes Held</div>
            </div>
          </div>
          <div className="admin-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Data Export</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1rem' }}>To view deep department-wise analytics, export the database to CSV from your Supabase Dashboard -> Table Editor.</p>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="admin-card" style={{ maxWidth: '500px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--primary)" /> Scanner Login Credentials
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            These credentials are used by volunteers at the door to access the <code>/mahabba/checkin</code> page.
          </p>

          <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="admin-label">Shared Username</label>
              <input type="text" required className="admin-input" value={settings.username} onChange={e => setSettings({...settings, username: e.target.value})} />
            </div>
            <div>
              <label className="admin-label">Shared Password</label>
              <input type="text" required className="admin-input" value={settings.password} onChange={e => setSettings({...settings, password: e.target.value})} />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>Update Credentials</button>
          </form>
        </div>
      )}

    </div>
  );
}