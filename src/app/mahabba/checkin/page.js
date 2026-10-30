'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Lock, QrCode, Search, CheckCircle, XCircle } from 'lucide-react';

export default function CheckinPage() {
  const [isAuthenticated, setIsAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  
  const [manualPhone, setManualPhone] = useState('');
  const [scanStatus, setScanStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep authentication alive during the session
  useEffect(() => {
    if (sessionStorage.getItem('mahabba_checkin_auth') === 'true') {
      setIsAuth(true);
      fetchActiveSessions();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.rpc('verify_mahabba_login', { p_username: username, p_password: password });
    
    if (data === true) {
      setIsAuth(true);
      sessionStorage.setItem('mahabba_checkin_auth', 'true');
      fetchActiveSessions();
    } else {
      alert('Invalid username or password');
    }
  };

  async function fetchActiveSessions() {
    const { data } = await supabase.from('mahabba_sessions').select('*').eq('is_active', true).order('session_date', { ascending: false });
    setSessions(data || []);
  }

  // Master function to handle check-in via QR (ticket_id) or Manual (phone)
  const processCheckin = async (lookupValue, isPhone = false) => {
    if (!selectedSession || isProcessing) return;
    setIsProcessing(true);

    try {
      // 1. Find the student
      const query = supabase.from('mahabba_students').select('id, name');
      const { data: student, error: studentErr } = isPhone 
        ? await query.eq('phone', lookupValue).single()
        : await query.eq('ticket_id', lookupValue).single();

      if (studentErr || !student) {
        showStatus('error', isPhone ? 'No registration found for this phone.' : 'Invalid QR Code.');
        setIsProcessing(false);
        return;
      }

      // 2. Mark Attendance
      const { error: attendErr } = await supabase.from('mahabba_attendance').insert([{
        student_id: student.id,
        session_id: selectedSession
      }]);

      if (attendErr) {
        if (attendErr.code === '23505') {
          showStatus('error', `${student.name} is already checked in!`);
        } else {
          showStatus('error', 'Database error occurred.');
        }
      } else {
        showStatus('success', `${student.name} checked in successfully!`);
        setManualPhone(''); // clear manual input if used
      }
    } catch (err) {
      showStatus('error', 'Something went wrong.');
    }
    
    // Cooldown before next scan is allowed
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const showStatus = (type, message) => {
    setScanStatus({ type, message });
    setTimeout(() => setScanStatus(null), 4000);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '1.5rem' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '2.5rem 2rem', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Lock size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem' }}>Scanner Login</h2>
          <input type="text" required placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="admin-input" style={{ marginBottom: '1rem', width: '100%', padding: '0.8rem' }} />
          <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="admin-input" style={{ marginBottom: '1.5rem', width: '100%', padding: '0.8rem' }} />
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Access Scanner</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: '2rem 1.5rem 3rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Mahabba Check-in</h1>
        
        <select 
          value={selectedSession} 
          onChange={e => setSelectedSession(e.target.value)} 
          style={{ width: '100%', maxWidth: '400px', padding: '0.75rem', borderRadius: '0.5rem', color: '#0F172A', border: 'none', fontWeight: 700, outline: 'none' }}
        >
          <option value="" disabled>-- Select Today's Session --</option>
          {sessions.map(s => <option key={s.id} value={s.id}>{s.title} ({new Date(s.session_date).toLocaleDateString()})</option>)}
        </select>
      </div>

      <div className="container" style={{ maxWidth: '500px', margin: '-1.5rem auto 0 auto', padding: '0 1.5rem' }}>
        
        {/* Status Toast */}
        {scanStatus && (
          <div style={{ background: scanStatus.type === 'success' ? '#10B981' : '#EF4444', color: 'white', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', animation: 'fadeIn 0.2s' }}>
            {scanStatus.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
            <span style={{ fontWeight: 700 }}>{scanStatus.message}</span>
          </div>
        )}

        {/* QR Scanner */}
        <div style={{ background: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', background: '#0F172A', color: 'white', textAlign: 'center', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={18} /> Auto-Scanner Active
          </div>
          
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#000' }}>
            {!selectedSession ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '2rem' }}>
                Please select a session above to activate camera.
              </div>
            ) : (
              <Scanner 
                onScan={(result) => {
                  if (result && result.length > 0) {
                    processCheckin(result[0].rawValue, false);
                  }
                }}
                components={{ audio: false, finder: true }}
              />
            )}
            
            {/* Loading Overlay when processing a scan */}
            {isProcessing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                Processing...
              </div>
            )}
          </div>
        </div>

        {/* Manual Fallback */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} /> Manual Check-in
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="tel" 
              placeholder="Enter Mobile Number" 
              value={manualPhone} 
              onChange={e => setManualPhone(e.target.value)} 
              className="admin-input" 
              style={{ flex: 1, padding: '0.75rem' }} 
            />
            <button 
              onClick={() => processCheckin(manualPhone, true)}
              disabled={!selectedSession || isProcessing || !manualPhone}
              className="btn-primary" 
              style={{ padding: '0 1.5rem' }}
            >
              Check-in
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}