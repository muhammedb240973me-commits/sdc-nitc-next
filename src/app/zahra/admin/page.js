'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, CalendarPlus, CheckCircle, Eye, Shield, Lock, Video, LogOut, KeyRound } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function ZahraAdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('sessions');
  const [loading, setLoading] = useState(true);

  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [settings, setSettings] = useState({ default_meet_link: '', admin_username: '', admin_password: '' });

  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({ title: '', session_date: '', meet_link: '' });
  const [analyticsFilter, setAnalyticsFilter] = useState('all');

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('zahra_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchMasterData();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchMasterData() {
    setLoading(true);
    const [sessionsRes, studentsRes, attendanceRes, settingsRes] = await Promise.all([
      supabase.from('zahra_sessions').select('*').order('session_date', { ascending: false }),
      supabase.from('zahra_students').select('*').order('name', { ascending: true }),
      supabase.from('zahra_attendance').select('*'),
      supabase.from('zahra_settings').select('*').eq('id', 1).single()
    ]);

    setSessions(sessionsRes.data || []);
    setStudents(studentsRes.data || []);
    setAttendance(attendanceRes.data || []);
    if (settingsRes.data) {
      setSettings({
        default_meet_link: settingsRes.data.default_meet_link || '',
        admin_username: settingsRes.data.admin_username || 'zahra_admin',
        admin_password: settingsRes.data.admin_password || 'zahra123'
      });
    }
    setLoading(false);
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const { data, error } = await supabase.from('zahra_settings').select('admin_username, admin_password').eq('id', 1).single();

    if (error || !data) {
      setLoginError('Authentication service unavailable.');
      setIsLoggingIn(false);
      return;
    }

    if (loginCreds.username === data.admin_username && loginCreds.password === data.admin_password) {
      sessionStorage.setItem('zahra_admin_auth', 'true');
      setIsAuthenticated(true);
      fetchMasterData();
    } else {
      setLoginError('Invalid Username or Password.');
    }
    setIsLoggingIn(false);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('zahra_admin_auth');
    setIsAuthenticated(false);
    setLoginCreds({ username: '', password: '' });
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('zahra_sessions').insert([newSession]);
    if (error) alert(error.message);
    else {
      setNewSession({ title: '', session_date: '', meet_link: '' });
      setShowAddSession(false);
      fetchMasterData();
    }
  };

  const toggleSessionStatus = async (id, currentStatus) => {
    await supabase.from('zahra_sessions').update({ is_active: !currentStatus }).eq('id', id);
    fetchMasterData();
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('zahra_settings').update(settings).eq('id', 1);
    if (error) alert('Error updating credentials/settings');
    else alert('Zahra portal credentials and settings updated!');
  };

  // Group Students
  const nitcStudents = students.filter(s => !s.is_guest);
  const guestStudents = students.filter(s => s.is_guest);

  // Analytics Helpers (using NITC students for course/dept breakdown to keep charts clean)
  const getChartData = (dataArray, key) => {
    const counts = dataArray.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] })).sort((a, b) => b.value - a.value);
  };

  const deptData = getChartData(nitcStudents, 'department');
  const courseData = getChartData(nitcStudents, 'course');
  const yearData = getChartData(nitcStudents, 'batch_year').map(d => ({ ...d, name: `Year ${d.name}` }));

  const attendedStudentIds = analyticsFilter === 'all' 
    ? [...new Set(attendance.map(a => a.student_id))]
    : attendance.filter(a => a.session_id === analyticsFilter).map(a => a.student_id);
    
  const attendedStudents = nitcStudents.filter(s => attendedStudentIds.includes(s.id));
  const attDeptData = getChartData(attendedStudents, 'department');
  const attCourseData = getChartData(attendedStudents, 'course');
  const attYearData = getChartData(attendedStudents, 'batch_year').map(d => ({ ...d, name: `Year ${d.name}` }));

  const DonutChart = ({ data, title }) => (
    <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '320px' }}>
      <h4 style={{ marginBottom: '1rem', color: '#EC4899', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#020617', color: '#fff' }} />
          <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#090D16', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#0F172A', border: '2px solid #DB2777', borderRadius: '1.5rem', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(219, 39, 119, 0.15)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '0.8rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '50%', color: '#EC4899', marginBottom: '1rem' }}>
              <Shield size={32} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: '#FFF' }}>Zahra Admin</h1>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.25rem' }}>Management Portal Login</p>
          </div>

          {loginError && (
            <div style={{ background: '#450A0A', border: '1px solid #991B1B', color: '#FCA5A5', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Username</label>
              <input type="text" required value={loginCreds.username} onChange={e => setLoginCreds({ ...loginCreds, username: e.target.value })} placeholder="Enter admin username" style={{ width: '100%', padding: '0.8rem 1rem', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '0.5rem', outline: 'none', fontSize: '0.95rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Password</label>
              <input type="password" required value={loginCreds.password} onChange={e => setLoginCreds({ ...loginCreds, password: e.target.value })} placeholder="Enter password" style={{ width: '100%', padding: '0.8rem 1rem', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '0.5rem', outline: 'none', fontSize: '0.95rem' }} />
            </div>

            <button type="submit" disabled={isLoggingIn} style={{ background: '#EC4899', color: '#FFF', border: 'none', padding: '0.9rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem', transition: 'background 0.2s' }}>
              {isLoggingIn ? 'Verifying...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <a href="/zahra" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: '#64748B', fontSize: '0.8rem', textDecoration: 'none' }}>
            ← Back to Public Zahra Page
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#090D16', color: '#EC4899', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800 }}>Loading Zahra Portal...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#090D16', color: '#F8FAFC', padding: '2rem 1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#EC4899', margin: 0 }}>Zahra Admin Portal</h1>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Sisters' Halaqa & Live Stream Control Center</p>
          </div>
          <button onClick={handleAdminLogout} style={{ background: '#1E293B', color: '#F472B6', border: '1px solid #DB2777', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #1E293B', marginBottom: '2rem' }}>
          {['sessions', 'delegates', 'analytics', 'settings'].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              style={{ background: 'none', border: 'none', padding: '0.75rem 1.25rem', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', textTransform: 'capitalize', color: activeTab === tab ? '#EC4899' : '#64748B', borderBottom: activeTab === tab ? '3px solid #EC4899' : '3px solid transparent', marginBottom: '-2px' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1: SESSIONS */}
        {activeTab === 'sessions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={() => setShowAddSession(true)} style={{ background: '#EC4899', color: '#FFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarPlus size={16} /> New Live Session
              </button>
            </div>
            
            <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '1rem', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead style={{ background: '#020617', borderBottom: '1px solid #1E293B' }}>
                  <tr>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Session Title</th>
                    <th style={{ padding: '1rem' }}>Meet Link</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Attendees</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => {
                    const attCount = attendance.filter(a => a.session_id === s.id).length;
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{new Date(s.session_date).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem', color: '#EC4899', fontWeight: 700 }}>{s.title}</td>
                        <td style={{ padding: '1rem' }}><a href={s.meet_link} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', textDecoration: 'underline' }}>Open Meet</a></td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800 }}>{attCount}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button onClick={() => toggleSessionStatus(s.id, s.is_active)} style={{ padding: '0.3rem 0.6rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800, border: 'none', cursor: 'pointer', background: s.is_active ? 'rgba(16, 185, 129, 0.2)' : '#1E293B', color: s.is_active ? '#34D399' : '#94A3B8' }}>
                            {s.is_active ? 'Active' : 'Closed'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DELEGATES (Separated Tables) */}
        {activeTab === 'delegates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Table 1: NITC Students */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EC4899', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} /> NITC Delegates ({nitcStudents.length})
              </h3>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '1rem', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead style={{ background: '#020617', borderBottom: '1px solid #1E293B' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Name</th>
                      <th style={{ padding: '1rem' }}>Phone</th>
                      <th style={{ padding: '1rem' }}>Course & Year</th>
                      <th style={{ padding: '1rem' }}>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nitcStudents.length > 0 ? nitcStudents.map(student => (
                      <tr key={student.id} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#F8FAFC' }}>{student.name}</td>
                        <td style={{ padding: '1rem' }}>{student.phone}</td>
                        <td style={{ padding: '1rem' }}>{student.course} (Yr {student.batch_year})</td>
                        <td style={{ padding: '1rem', color: '#94A3B8' }}>{student.department}</td>
                      </tr>
                    )) : <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No NITC registrations yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Guest Students */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3B82F6', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} /> Guest Delegates • Other Campuses ({guestStudents.length})
              </h3>
              <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '1rem', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead style={{ background: '#020617', borderBottom: '1px solid #1E293B' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Name</th>
                      <th style={{ padding: '1rem' }}>Phone</th>
                      <th style={{ padding: '1rem' }}>Institution / Campus</th>
                      <th style={{ padding: '1rem' }}>Course Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guestStudents.length > 0 ? guestStudents.map(student => (
                      <tr key={student.id} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#F8FAFC' }}>{student.name}</td>
                        <td style={{ padding: '1rem' }}>{student.phone}</td>
                        <td style={{ padding: '1rem', color: '#94A3B8', fontWeight: 600 }}>{student.campus_name}</td>
                        <td style={{ padding: '1rem', color: '#64748B' }}>{student.course || 'N/A'} {student.batch_year ? `(${student.batch_year})` : ''}</td>
                      </tr>
                    )) : <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No guest registrations yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <section>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EC4899', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} /> NITC Registrations Overview
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <DonutChart data={deptData} title="By Department" />
                <DonutChart data={courseData} title="By Course" />
                <DonutChart data={yearData} title="By Batch Year" />
              </div>
            </section>

            <hr style={{ border: 'none', borderTop: '2px dashed #1E293B' }} />

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EC4899', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} /> Attendance Status Analytics (NITC)
                </h3>
                <select value={analyticsFilter} onChange={e => setAnalyticsFilter(e.target.value)} style={{ width: 'auto', minWidth: '250px', padding: '0.8rem 1rem', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '0.5rem', outline: 'none' }}>
                  <option value="all">Overall (Attended Any Session)</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.title} ({new Date(s.session_date).toLocaleDateString()})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <DonutChart data={attDeptData} title="Attendees by Department" />
                <DonutChart data={attCourseData} title="Attendees by Course" />
                <DonutChart data={attYearData} title="Attendees by Batch Year" />
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '1rem', padding: '2rem', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#EC4899', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <KeyRound size={20} /> Change Admin Credentials
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Update the username and password used to access this Zahra Admin portal.</p>

            <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>ADMIN USERNAME</label>
                <input type="text" required value={settings.admin_username} onChange={e => setSettings({...settings, admin_username: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '0.5rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>ADMIN PASSWORD</label>
                <input type="text" required value={settings.admin_password} onChange={e => setSettings({...settings, admin_password: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '0.5rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>DEFAULT GOOGLE MEET LINK</label>
                <input type="url" required value={settings.default_meet_link} onChange={e => setSettings({...settings, default_meet_link: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '0.5rem', outline: 'none' }} />
              </div>
              <button type="submit" style={{ background: '#EC4899', color: '#FFF', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem', width: 'fit-content' }}>
                Save Changes
              </button>
            </form>
          </div>
        )}

      </div>

      {/* MODAL: ADD SESSION */}
      {showAddSession && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '1rem', width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#EC4899' }}>Create Live Stream Session</h3>
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>DATE</label>
                <input type="date" required value={newSession.session_date} onChange={e => setNewSession({...newSession, session_date: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '0.5rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>TITLE</label>
                <input type="text" required placeholder="Session 1: Sisterhood in Islam" value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '0.5rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>GOOGLE MEET LINK</label>
                <input type="url" required placeholder="https://meet.google.com/xyz-abc-def" value={newSession.meet_link} onChange={e => setNewSession({...newSession, meet_link: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: '#020617', border: '1px solid #334155', color: '#fff', borderRadius: '0.5rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" style={{ background: '#EC4899', color: '#FFF', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 800, flex: 1, cursor: 'pointer' }}>Save Session</button>
                <button type="button" onClick={() => setShowAddSession(false)} style={{ background: 'transparent', color: '#94A3B8', border: '1px solid #334155', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}