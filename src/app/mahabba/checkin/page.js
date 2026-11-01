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

  const processCheckin = async (lookupValue, isPhone = false) => {
    if (!selectedSession || isProcessing) return;
    setIsProcessing(true);

    try {
      const query = supabase.from('mahabba_students').select('id, name');
      const { data: student, error: studentErr } = isPhone 
        ? await query.eq('phone', lookupValue).single()
        : await query.eq('ticket_id', lookupValue).single();

      if (studentErr || !student) {
        showStatus('error', isPhone ? 'No registration found.' : 'Invalid QR Code.');
        setIsProcessing(false);
        return;
      }

      const { error: attendErr } = await supabase.from('mahabba_attendance').insert([{
        student_id: student.id,
        session_id: selectedSession
      }]);

      if (attendErr) {
        if (attendErr.code === '23505') showStatus('error', `${student.name} is already checked in!`);
        else showStatus('error', 'Database error occurred.');
      } else {
        showStatus('success', `${student.name} checked in!`);
        setManualPhone(''); 
      }
    } catch (err) {
      showStatus('error', 'Something went wrong.');
    }
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const showStatus = (type, message) => {
    setScanStatus({ type, message });
    setTimeout(() => setScanStatus(null), 4000);
  };

  // =========================================================================
  // SHARED NEUBRUTALISM CSS INJECTION
  // =========================================================================
  const neubrutalismStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

    .neubrutal-bg {
      background: 
        radial-gradient(circle at 50% 0%, rgba(30, 41, 59, 0.6) 0%, rgba(10, 10, 10, 1) 70%),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
      min-height: 100vh;
      color: #F8FAFC;
    }

    .brutal-card {
      background: #111;
      border: 3px solid #333;
      border-radius: 20px 0 20px 0;
      padding: 2rem;
      box-shadow: 12px 12px 0px rgba(0,0,0,1);
    }
    
    .brutal-input {
      width: 100%;
      padding: 1rem 1.2rem;
      background: #050505;
      border: 2px solid #333;
      color: white;
      border-radius: 0;
      outline: none;
      font-size: 1rem;
      font-weight: 700;
      transition: border-color 0.2s;
    }
    .brutal-input:focus { border-color: #F59E0B; }
    .brutal-input option { background: #111; color: white; }
    
    .brutal-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 900;
      color: #94A3B8;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-brutal {
      background: #E2E8F0;
      color: #0F172A;
      border: 3px solid #000;
      border-radius: 20px 0 20px 0;
      box-shadow: 6px 6px 0px #F59E0B;
      padding: 1.2rem;
      font-weight: 900;
      font-size: 1rem;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
    }
    .btn-brutal:active {
      transform: translate(4px, 4px);
      box-shadow: 2px 2px 0px #F59E0B;
    }
    .btn-brutal:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: 6px 6px 0px #333;
    }

    .toast-brutal {
      border: 3px solid #000;
      border-radius: 12px 0 12px 0;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      color: #000;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popIn {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;

  if (!isAuthenticated) {
    return (
      <div className="neubrutal-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <style dangerouslySetInnerHTML={{__html: neubrutalismStyles}} />
        <form onSubmit={handleLogin} className="brutal-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', borderColor: '#333' }}>
          <Lock size={48} color="#EF4444" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '2.5rem', fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', marginBottom: '2rem', letterSpacing: '1px' }}>Scanner Login</h2>
          <div style={{ textAlign: 'left' }}>
            <label className="brutal-label">Username</label>
            <input type="text" required placeholder="ENTER USERNAME" value={username} onChange={e => setUsername(e.target.value)} className="brutal-input" style={{ marginBottom: '1.5rem' }} />
            <label className="brutal-label">Password</label>
            <input type="password" required placeholder="ENTER PASSWORD" value={password} onChange={e => setPassword(e.target.value)} className="brutal-input" style={{ marginBottom: '2rem' }} />
          </div>
          <button type="submit" className="btn-brutal" style={{ background: '#F59E0B', color: '#000', borderColor: '#000', boxShadow: '6px 6px 0px #EF4444' }}>Access Scanner</button>
        </form>
      </div>
    );
  }

  return (
    <div className="neubrutal-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{__html: neubrutalismStyles}} />
      
      {/* Header Area */}
      <div style={{ background: '#000', borderBottom: '4px solid #333', padding: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', marginBottom: '1rem', letterSpacing: '1px' }}>Mahabba Scanner</h1>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <select 
            value={selectedSession} 
            onChange={e => setSelectedSession(e.target.value)} 
            className="brutal-input"
            style={{ border: '2px solid #EF4444', color: selectedSession ? '#fff' : '#94A3B8' }}
          >
            <option value="" disabled>-- SELECT TODAY'S SESSION --</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.title} ({new Date(s.session_date).toLocaleDateString()})</option>)}
          </select>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem 1.5rem', flex: 1 }}>
        
        {/* Status Toast */}
        {scanStatus && (
          <div className="toast-brutal" style={{ 
            background: scanStatus.type === 'success' ? '#10B981' : '#EF4444',
            boxShadow: scanStatus.type === 'success' ? '6px 6px 0px #064E3B' : '6px 6px 0px #7F1D1D'
          }}>
            {scanStatus.type === 'success' ? <CheckCircle size={24} color="#000" /> : <XCircle size={24} color="#000" />}
            <span>{scanStatus.message}</span>
          </div>
        )}

        {/* QR Scanner Container */}
        <div style={{ 
          background: '#050505', 
          border: '4px solid #333', 
          borderRadius: '20px 0 20px 0', 
          overflow: 'hidden', 
          boxShadow: '12px 12px 0px #000', 
          marginBottom: '2.5rem' 
        }}>
          <div style={{ padding: '1rem', background: '#111', color: '#F59E0B', textAlign: 'center', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #333' }}>
            <QrCode size={18} /> Camera Active
          </div>
          
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#000' }}>
            {!selectedSession ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', textAlign: 'center', padding: '2rem', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.25rem', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '1px' }}>
                SELECT A SESSION<br/>TO ACTIVATE CAMERA
              </div>
            ) : (
              <Scanner 
                onScan={(result) => {
                  if (result && result.length > 0) processCheckin(result[0].rawValue, false);
                }}
                onError={(error) => {
                  console.error(error);
                  if (error.name === 'NotAllowedError') alert("Camera access denied.");
                  else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') alert("Camera requires HTTPS.");
                }}
                components={{ audio: false, finder: true }}
                constraints={{ facingMode: 'environment' }}
              />
            )}
            
            {/* Loading Overlay */}
            {isProcessing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.5rem', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '1px' }}>
                PROCESSING...
              </div>
            )}
          </div>
        </div>

        {/* Manual Fallback */}
        <div className="brutal-card" style={{ padding: '2rem 1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '1px' }}>
            <Search size={20} color="#F59E0B" /> MANUAL CHECK-IN
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="tel" 
              placeholder="ENTER MOBILE NUMBER" 
              value={manualPhone} 
              onChange={e => setManualPhone(e.target.value)} 
              className="brutal-input" 
            />
            <button 
              onClick={() => processCheckin(manualPhone, true)}
              disabled={!selectedSession || isProcessing || !manualPhone}
              className="btn-brutal" 
              style={{ background: '#10B981', color: '#000', borderColor: '#000', boxShadow: '6px 6px 0px #064E3B' }}
            >
              Check-in Delegate
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}