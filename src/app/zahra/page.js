'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { siteContent as staticContent } from '@/lib/content';
import { ArrowLeft, UserPlus, CheckCircle, Video, ShieldCheck, MapPin } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/ZahraFooter';

const COURSES = ['B.Tech', 'M.Tech', 'PhD', 'B.Sc-B.Ed', 'M.Sc', 'MBA', 'MCA', 'M.Plan', 'Other'];
const DEPARTMENTS = [
  'Architecture and Planning', 'Chemical Engineering', 'Chemistry', 'Civil Engineering', 
  'Computer Science and Engineering', 'Electrical Engineering', 'Electronics and Communication', 'Material Science Engineering', 'Energy Engineering',
  'Mathematics', 'Mechanical Engineering', 'Physics', 'Humanities, Arts and Social Sciences', 'Management Studies'
];
const YEARS = ['1', '2', '3', '4', '5', '6'];

export default function ZahraPage() {
  const [layoutData, setLayoutData] = useState(null);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  
  const [view, setView] = useState('landing');
  const [activeSession, setActiveSession] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loginPhone, setLoginPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joiningMeet, setJoiningMeet] = useState(false);

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', course: '', department: '', batch_year: '', campus_name: ''
  });

  useEffect(() => {
    async function fetchData() {
      const [homeRes, linksRes, sessionRes] = await Promise.all([
        supabase.from('site_content').select('content').eq('id', 'home_content').maybeSingle(),
        supabase.from('site_content').select('content').eq('id', 'links').maybeSingle(),
        supabase.from('zahra_sessions').select('*').eq('is_active', true).order('session_date', { ascending: false }).limit(1).maybeSingle()
      ]);

      setLayoutData({
        home: homeRes.data?.content || staticContent,
        links: linksRes.data?.content || staticContent.links
      });

      if (sessionRes.data) setActiveSession(sessionRes.data);
    }
    fetchData();

    const savedPhone = localStorage.getItem('zahra_user_phone');
    if (savedPhone) autoLogin(savedPhone);
  }, []);

  const autoLogin = async (phone) => {
    const { data } = await supabase.from('zahra_students').select('*').eq('phone', phone).single();
    if (data) {
      setStudentData(data);
      setView('dashboard');
    } else {
      localStorage.removeItem('zahra_user_phone');
    }
  };

  const changeView = (newView) => {
    setView(newView);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleRegister = async (e, isGuest = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      name: formData.name, 
      phone: formData.phone, 
      email: formData.email || 'guest@noemail.com',
      course: formData.course, 
      batch_year: formData.batch_year,
      department: isGuest ? 'Guest/External' : formData.department,
      campus_name: isGuest ? formData.campus_name : 'NIT Calicut',
      is_guest: isGuest
    };

    const { data, error } = await supabase.from('zahra_students').insert([payload]).select().single();
    
    if (error) {
      if (error.code === '23505') {
        // If phone already exists, auto-login them smoothly
        const { data: existingData } = await supabase.from('zahra_students').select('*').eq('phone', formData.phone).single();
        if (existingData) {
          setStudentData(existingData);
          localStorage.setItem('zahra_user_phone', existingData.phone);
          changeView('dashboard');
        }
      } else {
        alert(`Registration failed: ${error.message}`);
      }
    } else {
      setStudentData(data);
      localStorage.setItem('zahra_user_phone', data.phone);
      changeView('dashboard');
    }
    setIsSubmitting(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data } = await supabase.from('zahra_students').select('*').eq('phone', loginPhone).single();
    if (!data) alert("No Zahra registration found with this mobile number. Please register first.");
    else {
      setStudentData(data);
      localStorage.setItem('zahra_user_phone', data.phone);
      changeView('dashboard');
    }
    setIsSubmitting(false);
  };

  const handleJoinClass = async () => {
    if (!activeSession) {
      alert("No active live stream session scheduled at the moment.");
      return;
    }
    setJoiningMeet(true);

    await supabase.from('zahra_attendance').upsert([
      { student_id: studentData.id, session_id: activeSession.id }
    ], { onConflict: 'student_id,session_id' });

    setJoiningMeet(false);
    window.open(activeSession.meet_link, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('zahra_user_phone');
    setStudentData(null);
    setLoginPhone('');
    changeView('landing');
  };

  if (!layoutData) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#090D16', color: '#EC4899', fontWeight: 700 }}>Loading Zahra Portal...</div>;
  }

  return (
    <main style={{ background: '#090D16' }}>
      <Header siteContent={{ ...staticContent, tickerText: layoutData.home.tickerText || staticContent.tickerText }} onOpenVolunteer={() => setIsVolunteerOpen(true)} />

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@1,600&display=swap');

        .zahra-bg {
          background: 
            radial-gradient(circle at 50% 0%, rgba(219, 39, 119, 0.15) 0%, rgba(9, 13, 22, 1) 70%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
          min-height: 100vh;
          padding-bottom: 5rem;
          color: #F8FAFC;
        }

        .title-zahra-main { font-family: 'Bebas Neue', sans-serif; font-size: clamp(4.5rem, 16vw, 8rem); line-height: 0.85; color: #FFFFFF; letter-spacing: 2px; }
        .title-zahra-sub { font-family: 'Playfair Display', serif; color: #EC4899; font-style: italic; font-size: clamp(1.8rem, 5vw, 3rem); margin-top: -0.5rem; }

        /* Animated Moroccan Geometric Motif Widget */
        .moroccan-pattern-card {
          width: 100%;
          max-width: 320px;
          aspect-ratio: 1;
          background: radial-gradient(circle at center, rgba(30, 27, 75, 0.8) 0%, rgba(9, 13, 22, 0.95) 75%);
          border: 2px solid rgba(236, 72, 153, 0.35);
          border-radius: 2rem;
          box-shadow: 0 0 40px rgba(219, 39, 119, 0.2), inset 0 0 25px rgba(236, 72, 153, 0.12);
          margin: 2.5rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .moroccan-bg-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(244, 114, 182, 0.18) 0%, transparent 60%);
          animation: pulseGlow 4s ease-in-out infinite alternate;
        }

        .moroccan-cw { animation: rotateCW 40s linear infinite; transform-origin: center; }
        .moroccan-ccw { animation: rotateCCW 28s linear infinite; transform-origin: center; }
        .moroccan-pulse { animation: pulseCenter 3.5s ease-in-out infinite alternate; transform-origin: center; }

        @keyframes rotateCW { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rotateCCW { from { transform: rotate(360deg); } to { transform: rotate(-360deg); } }
        @keyframes pulseCenter { 0% { transform: scale(0.95); opacity: 0.85; } 100% { transform: scale(1.05); opacity: 1; } }
        @keyframes pulseGlow { 0% { opacity: 0.4; } 100% { opacity: 1; } }

        .btn-zahra { background: #EC4899; color: #FFFFFF; border: 3px solid #000; border-radius: 20px 0 20px 0; box-shadow: 6px 6px 0px #831843; padding: 1.2rem; font-weight: 900; font-size: 1rem; text-transform: uppercase; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 0.5rem; width: 100%; transition: all 0.15s; }
        .btn-zahra:active { transform: translate(4px, 4px); box-shadow: 2px 2px 0px #831843; }

        .btn-zahra-outline { background: transparent; color: #F472B6; border: 3px solid #F472B6; border-radius: 20px 0 20px 0; box-shadow: 6px 6px 0px #831843; padding: 1.2rem; font-weight: 900; font-size: 1rem; text-transform: uppercase; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 0.5rem; width: 100%; }

        .btn-meet { background: #10B981; color: #000; border: 3px solid #000; border-radius: 20px 0 20px 0; box-shadow: 6px 6px 0px #064E3B; padding: 1.2rem; font-weight: 900; font-size: 1.1rem; text-transform: uppercase; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 0.6rem; width: 100%; }

        .zahra-card { background: #0F172A; border: 3px solid #1E293B; border-radius: 20px 0 20px 0; padding: 2.5rem 2rem; box-shadow: 12px 12px 0px rgba(0,0,0,0.8); }
        .zahra-input { width: 100%; padding: 1rem 1.2rem; background: #020617; border: 2px solid #334155; color: white; outline: none; font-size: 1rem; font-weight: 700; }
        .zahra-input:focus { border-color: #EC4899; }
        .zahra-input option { background: #0F172A; color: white; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
      `}} />

      <div className="zahra-bg">
        <div className="container" style={{ padding: '2rem 1.5rem 0 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => changeView('landing')} style={{ background: 'none', border: 'none', color: '#94A3B8', display: view === 'landing' ? 'none' : 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
            <ArrowLeft size={16} /> Back to Zahra Home
          </button>
        </div>

        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 10 }}>
          
          {/* LANDING VIEW */}
          {view === 'landing' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(236, 72, 153, 0.15)', color: '#F472B6', border: '1px solid #DB2777', padding: '0.4rem 1.2rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '2rem' }}>
                <ShieldCheck size={16} /> WOMEN-LED SPIRITUAL WING • NIT CALICUT
              </div>

              <div>
                <h1 className="title-zahra-main">ZAHRA TEAM</h1>
                <div className="title-zahra-sub">Spiritual Growth for Girl Students</div>
              </div>

              <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.7, margin: '1.5rem auto 2rem auto', maxWidth: '480px', fontWeight: 600 }}>
                Zahra is completely organized and led by female scholars and students. Weekly Essence of Mahabba sessions are streamed live via Google Meet exclusively for sisters.
              </p>

              <div className="moroccan-pattern-card">
                <div className="moroccan-bg-glow" />
                <svg viewBox="0 0 300 300" style={{ width: '82%', height: '82%', position: 'relative', zIndex: 2 }}>
                  <defs>
                    <linearGradient id="roseGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F472B6" />
                      <stop offset="50%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <linearGradient id="roseSubtle" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#DB2777" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  <g className="moroccan-cw">
                    <circle cx="150" cy="150" r="135" fill="none" stroke="url(#roseSubtle)" strokeWidth="1.5" strokeDasharray="4,8" />
                    <circle cx="150" cy="150" r="122" fill="none" stroke="url(#roseGold)" strokeWidth="1" opacity="0.6" />
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                      <g key={deg} transform={`rotate(${deg} 150 150)`}>
                        <polygon points="150,15 156,28 150,40 144,28" fill="none" stroke="url(#roseGold)" strokeWidth="1.2" opacity="0.85" />
                        <circle cx="150" cy="15" r="2.5" fill="#F472B6" />
                      </g>
                    ))}
                  </g>
                  <g className="moroccan-ccw">
                    <rect x="75" y="75" width="150" height="150" fill="none" stroke="url(#roseGold)" strokeWidth="1.8" rx="4" opacity="0.75" />
                    <rect x="75" y="75" width="150" height="150" fill="none" stroke="url(#roseGold)" strokeWidth="1.8" rx="4" transform="rotate(45 150 150)" opacity="0.75" />
                    <rect x="92" y="92" width="116" height="116" fill="none" stroke="#F472B6" strokeWidth="1" transform="rotate(22.5 150 150)" opacity="0.45" />
                    <rect x="92" y="92" width="116" height="116" fill="none" stroke="#F472B6" strokeWidth="1" transform="rotate(67.5 150 150)" opacity="0.45" />
                  </g>
                  <g className="moroccan-pulse">
                    <circle cx="150" cy="150" r="38" fill="rgba(236, 72, 153, 0.15)" stroke="url(#roseGold)" strokeWidth="2" />
                    <polygon points="150,118 159,139 182,150 159,161 150,182 141,161 118,150 141,139" fill="url(#roseGold)" opacity="0.9" />
                    <polygon points="150,126 156,143 174,150 156,157 150,174 144,157 126,150 144,143" fill="#090D16" />
                    <circle cx="150" cy="150" r="6" fill="#F59E0B" />
                  </g>
                </svg>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px', margin: '0 auto' }}>
                <button onClick={() => changeView('register')} className="btn-zahra">
                  <UserPlus size={20} /> NITC Student Registration
                </button>
                <button onClick={() => changeView('login')} className="btn-zahra-outline">
                  Join Mahabba Session (Login)
                </button>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <button onClick={() => changeView('guest_register')} style={{ background: 'none', border: 'none', color: '#CBD5E1', fontSize: '0.9rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#DB2777' }}>
                  <MapPin size={16} color="#DB2777" /> Not from NITC? Guest Login / Register
                </button>
              </div>
            </div>
          )}

          {/* LOGIN VIEW (Universal for both NITC and Guests) */}
          {view === 'login' && (
            <div className="zahra-card" style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', marginBottom: '0.5rem' }}>Access Live Stream</h2>
              <p style={{ color: '#94A3B8', marginBottom: '2rem', fontSize: '0.9rem' }}>Enter your registered mobile number to open your live stream pass.</p>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.5rem' }}>MOBILE NUMBER</label>
                  <input type="tel" required value={loginPhone} onChange={e => setLoginPhone(e.target.value)} placeholder="Enter registered number" className="zahra-input" />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-zahra" style={{ marginTop: '1rem' }}>
                  {isSubmitting ? 'Searching...' : 'Access Live Stream'}
                </button>
              </form>
            </div>
          )}

          {/* NITC REGISTER VIEW */}
          {view === 'register' && (
            <div className="zahra-card" style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', marginBottom: '1.5rem' }}>NITC Sister Registration</h2>
              <form onSubmit={(e) => handleRegister(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>FULL NAME *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="zahra-input" />
                </div>
                
                <div className="form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>MOBILE NUMBER *</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="zahra-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>EMAIL ADDRESS *</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="zahra-input" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>DEPARTMENT *</label>
                  <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="zahra-input">
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>

                <div className="form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>COURSE *</label>
                    <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="zahra-input">
                      <option value="">Select Course</option>
                      {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>YEAR *</label>
                    <select required value={formData.batch_year} onChange={e => setFormData({...formData, batch_year: e.target.value})} className="zahra-input">
                      <option value="">Select Year</option>
                      {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-zahra" style={{ marginTop: '1rem' }}>
                  {isSubmitting ? 'Registering...' : 'Complete NITC Registration'}
                </button>
              </form>
            </div>
          )}

          {/* GUEST REGISTER VIEW */}
          {view === 'guest_register' && (
            <div className="zahra-card" style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', marginBottom: '0.5rem' }}>Guest Registration</h2>
              <p style={{ color: '#94A3B8', marginBottom: '1.5rem', fontSize: '0.85rem' }}>For students participating from other campuses. (If already registered, this acts as login).</p>
              
              <form onSubmit={(e) => handleRegister(e, true)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>FULL NAME *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="zahra-input" />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>MOBILE NUMBER *</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="zahra-input" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>CAMPUS / INSTITUTION NAME *</label>
                  <input type="text" required value={formData.campus_name} onChange={e => setFormData({...formData, campus_name: e.target.value})} placeholder="e.g. Govt Engineering College" className="zahra-input" />
                </div>

                <div className="form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>COURSE (Optional)</label>
                    <input type="text" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} placeholder="e.g. B.Tech" className="zahra-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: '0.4rem' }}>YEAR (Optional)</label>
                    <input type="text" value={formData.batch_year} onChange={e => setFormData({...formData, batch_year: e.target.value})} placeholder="e.g. 2nd Year" className="zahra-input" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-zahra" style={{ marginTop: '1rem' }}>
                  {isSubmitting ? 'Processing...' : 'Register & Enter Live Stream'}
                </button>
              </form>
            </div>
          )}

          {/* DASHBOARD VIEW */}
          {view === 'dashboard' && studentData && (
            <div style={{ marginTop: '2rem' }}>
              <div className="zahra-card" style={{ borderColor: '#EC4899', textAlign: 'center' }}>
                <CheckCircle size={40} color="#EC4899" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '2rem', fontFamily: '"Bebas Neue", sans-serif', color: '#FFF', margin: 0 }}>Welcome, {studentData.name}</h3>
                
                {studentData.is_guest ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Guest Delegate • {studentData.campus_name}
                  </p>
                ) : (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {studentData.course} ({studentData.department}) • Year {studentData.batch_year}
                  </p>
                )}

                <div style={{ margin: '2rem 0', padding: '1.5rem', background: '#020617', border: '2px dashed #EC4899', borderRadius: '1rem' }}>
                  <h4 style={{ color: '#FFF', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                    {activeSession ? activeSession.title : 'No Session Active'}
                  </h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>
                    {activeSession ? `Scheduled for ${new Date(activeSession.session_date).toLocaleDateString()}` : 'Check back during class hours for the live stream link.'}
                  </p>
                </div>

                {activeSession && (
                  <button onClick={handleJoinClass} disabled={joiningMeet} className="btn-meet">
                    <Video size={24} /> {joiningMeet ? 'Logging Attendance...' : 'Join Google Meet Live Stream'}
                  </button>
                )}

                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '1rem' }}>
                  * Clicking "Join Google Meet" automatically records your attendance for today's session.
                </p>
              </div>

              <button onClick={handleLogout} style={{ display: 'block', margin: '2rem auto 0', background: 'none', border: 'none', color: '#94A3B8', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', textTransform: 'uppercase' }}>
                Logout
              </button>
            </div>
          )}

        </div>
      </div>

      <Footer links={layoutData.links} />
    </main>
  );
}