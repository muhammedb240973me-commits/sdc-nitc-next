'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, CalendarPlus, Settings, CheckCircle, Shield, X, Eye, XCircle, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function MahabbaAdmin() {
  const [activeTab, setActiveTab] = useState('settings'); 
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [settings, setSettings] = useState({ username: '', password: '', slider_images: [] });
  
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({ title: '', session_date: '' });
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState(null);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState(null);
  const [analyticsFilter, setAnalyticsFilter] = useState('all');

  useEffect(() => {
    fetchMasterData();
  }, []);

  async function fetchMasterData() {
    setLoading(true);
    const [sessionsRes, studentsRes, attendanceRes, settingsRes] = await Promise.all([
      supabase.from('mahabba_sessions').select('*').order('session_date', { ascending: false }),
      supabase.from('mahabba_students').select('*').order('name', { ascending: true }),
      supabase.from('mahabba_attendance').select('*'),
      supabase.from('mahabba_settings').select('*').eq('id', 1).single()
    ]);

    setSessions(sessionsRes.data || []);
    setStudents(studentsRes.data || []);
    setAttendance(attendanceRes.data || []);
    if (settingsRes.data) {
      setSettings({ 
        username: settingsRes.data.username, 
        password: settingsRes.data.password,
        slider_images: settingsRes.data.slider_images || [] 
      });
    }
    setLoading(false);
  }

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('mahabba_sessions').insert([newSession]);
    if (error) alert(error.message);
    else {
      setNewSession({ title: '', session_date: '' });
      setShowAddSession(false);
      fetchMasterData();
    }
  };

  const toggleSessionStatus = async (id, currentStatus) => {
    await supabase.from('mahabba_sessions').update({ is_active: !currentStatus }).eq('id', id);
    fetchMasterData();
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('mahabba_settings').update(settings).eq('id', 1);
    if (error) alert('Error updating settings');
    else alert('Settings updated successfully!');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `mahabba-slider-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage.from('sdc-uploads').upload(`mahabba/${fileName}`, file);
    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('sdc-uploads').getPublicUrl(`mahabba/${fileName}`);
    setSettings(prev => ({ ...prev, slider_images: [...prev.slider_images, publicUrl] }));
    setIsUploading(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    setSettings(prev => ({
      ...prev,
      slider_images: prev.slider_images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const getChartData = (dataArray, key) => {
    const counts = dataArray.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] })).sort((a, b) => b.value - a.value);
  };

  const deptData = getChartData(students, 'department');
  const courseData = getChartData(students, 'course');
  const yearData = getChartData(students, 'batch_year').map(d => ({ ...d, name: `Year ${d.name}` }));

  const attendedStudentIds = analyticsFilter === 'all' 
    ? [...new Set(attendance.map(a => a.student_id))]
    : attendance.filter(a => a.session_id === analyticsFilter).map(a => a.student_id);
    
  const attendedStudents = students.filter(s => attendedStudentIds.includes(s.id));
  const attDeptData = getChartData(attendedStudents, 'department');
  const attCourseData = getChartData(attendedStudents, 'course');
  const attYearData = getChartData(attendedStudents, 'batch_year').map(d => ({ ...d, name: `Year ${d.name}` }));

  const DonutChart = ({ data, title }) => (
    <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '320px', padding: '1.5rem' }}>
      <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  if (loading) return <div>Loading Mahabba Data...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>Mahabba Portal</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Manage sessions, attendees, and deep analytics</p>
        </div>
        <a href="/mahabba/checkin" target="_blank" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          Open Scanner Page
        </a>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2E8F0', marginBottom: '2rem' }}>
        {['sessions', 'delegates', 'analytics', 'settings'].map(tab => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
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

      {activeTab === 'sessions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => setShowAddSession(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <CalendarPlus size={16} /> Add Session
            </button>
          </div>
          <div className="admin-card" style={{ padding: 0, overflow: 'hidden', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Session Date</th>
                  <th style={{ padding: '1rem' }}>Title</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Attendance Count</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => {
                  const attCount = attendance.filter(a => a.session_id === s.id).length;
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{new Date(s.session_date).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', color: 'var(--primary)' }}>{s.title}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800 }}>{attCount}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button onClick={() => toggleSessionStatus(s.id, s.is_active)} style={{ padding: '0.3rem 0.6rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: s.is_active ? '#DCFCE7' : '#F1F5F9', color: s.is_active ? '#16A34A' : '#64748B' }}>
                          {s.is_active ? 'Active' : 'Closed'}
                        </button>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => setSelectedSessionForDetails(s)} className="btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Eye size={14} /> View Attendees
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

      {activeTab === 'delegates' && (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Phone</th>
                <th style={{ padding: '1rem' }}>Course & Year</th>
                <th style={{ padding: '1rem' }}>Department</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{student.name}</td>
                  <td style={{ padding: '1rem' }}>{student.phone}</td>
                  <td style={{ padding: '1rem' }}>{student.course} (Yr {student.batch_year})</td>
                  <td style={{ padding: '1rem', color: '#64748B' }}>{student.department}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => setSelectedStudentForDetails(student)} className="btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Eye size={14} /> History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <section>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} /> Total Registrations Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <DonutChart data={deptData} title="By Department" />
              <DonutChart data={courseData} title="By Course" />
              <DonutChart data={yearData} title="By Batch Year" />
            </div>
          </section>

          <hr style={{ border: 'none', borderTop: '2px dashed #E2E8F0' }} />

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={20} /> Attendance Status Analytics</h3>
              <select value={analyticsFilter} onChange={e => setAnalyticsFilter(e.target.value)} className="admin-input" style={{ width: 'auto', minWidth: '250px', background: 'white' }}>
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

      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Public Page Slider Images */}
          <div className="admin-card" style={{ width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImagePlus size={20} color="var(--primary)" /> Public Page Image Slider
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Upload images to be showcased in the tilted animated feature on the Mahabba public landing page.</p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {settings.slider_images.map((imgUrl, index) => (
                <div key={index} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <img src={imgUrl} alt={`Slider ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => handleRemoveImage(index)} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <label style={{ width: '120px', height: '120px', border: '2px dashed #CBD5E1', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: isUploading ? 'not-allowed' : 'pointer', background: '#F8FAFC', color: '#64748B' }}>
                {isUploading ? <Loader2 size={24} className="animate-spin" /> : <><ImagePlus size={24} style={{ marginBottom: '0.5rem' }} /><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Upload Image</span></>}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} style={{ display: 'none' }} />
              </label>
            </div>
            <button onClick={handleUpdateSettings} className="btn-primary" style={{ padding: '0.8rem', width: 'fit-content' }}>Save Global Settings</button>
          </div>

          {/* Scanner Credentials */}
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--primary)" /> Scanner Login Credentials
            </h3>
            <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="admin-label">Shared Username</label>
                <input type="text" required className="admin-input" value={settings.username} onChange={e => setSettings({...settings, username: e.target.value})} />
              </div>
              <div>
                <label className="admin-label">Shared Password</label>
                <input type="text" required className="admin-input" value={settings.password} onChange={e => setSettings({...settings, password: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.8rem', width: 'fit-content' }}>Update Credentials</button>
            </form>
          </div>
        </div>
      )}

      {/* --- Existing Modals (Add Session, View Attendees, Student History) remain unchanged below --- */}
      {showAddSession && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowAddSession(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20}/></button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>Create New Session</h3>
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label className="admin-label">Date</label><input type="date" required className="admin-input" value={newSession.session_date} onChange={e => setNewSession({...newSession, session_date: e.target.value})} /></div>
              <div><label className="admin-label">Session Title</label><input type="text" required placeholder="e.g. Week 4: Gratitude" className="admin-input" value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} /></div>
              <button type="submit" className="btn-primary" style={{ padding: '0.8rem', marginTop: '0.5rem' }}>Save Session</button>
            </form>
          </div>
        </div>
      )}

      {selectedSessionForDetails && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div><h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{selectedSessionForDetails.title}</h3><p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>Attendees List</p></div>
              <button onClick={() => setSelectedSessionForDetails(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={24}/></button>
            </div>
            <div style={{ overflowY: 'auto', padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <tbody>
                  {attendance.filter(a => a.session_id === selectedSessionForDetails.id).map(record => {
                    const student = students.find(s => s.id === record.student_id);
                    return student ? (
                      <tr key={record.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{student.name}</td>
                        <td style={{ padding: '1rem', color: '#64748B' }}>{student.course} ({student.department})</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#10B981', fontWeight: 700 }}>{new Date(record.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ) : null;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedStudentForDetails && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div><h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{selectedStudentForDetails.name}</h3><p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>Attendance History</p></div>
              <button onClick={() => setSelectedStudentForDetails(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={24}/></button>
            </div>
            <div style={{ overflowY: 'auto', padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <tbody>
                  {sessions.map(session => {
                    const attended = attendance.some(a => a.session_id === session.id && a.student_id === selectedStudentForDetails.id);
                    return (
                      <tr key={session.id} style={{ borderBottom: '1px solid #E2E8F0', background: attended ? '#F0FDF4' : '#FEF2F2' }}>
                        <td style={{ padding: '1rem' }}><div style={{ fontWeight: 700, color: 'var(--primary)' }}>{session.title}</div><div style={{ fontSize: '0.75rem', color: '#64748B' }}>{new Date(session.session_date).toLocaleDateString()}</div></td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{attended ? <span style={{ color: '#16A34A', fontWeight: 700 }}>Attended</span> : <span style={{ color: '#DC2626', fontWeight: 700 }}>Absent</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}