'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { siteContent as staticContent } from '@/lib/content';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { BookOpen, QrCode, ArrowLeft, ArrowRight, UserPlus, CheckCircle } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VolunteerModal from '@/components/VolunteerModal';

const COURSES = ['B.Tech', 'M.Tech', 'PhD', 'B.Sc-B.Ed', 'M.Sc', 'MBA', 'MCA', 'M.Plan', 'Other'];
const DEPARTMENTS = [
  'Architecture and Planning', 'Chemical Engineering', 'Chemistry', 'Civil Engineering', 
  'Computer Science and Engineering', 'Electrical Engineering', 'Electronics and Communication', 
  'Mathematics', 'Mechanical Engineering', 'Physics', 'Humanities, Arts and Social Sciences', 'Management Studies'
];
const YEARS = ['1', '2', '3', '4', '5', '6'];

export default function MahabbaPage() {
  const [layoutData, setLayoutData] = useState(null);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  
  // App State: 'landing' | 'register' | 'login' | 'ticket'
  const [view, setView] = useState('landing');
  
  // Data States
  const [studentData, setStudentData] = useState(null); // Holds the ticket data
  const [loginPhone, setLoginPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', course: '', department: '', batch_year: ''
  });

  // Fetch Header/Footer Layout Data
  useEffect(() => {
    async function fetchLayout() {
      const [homeRes, linksRes] = await Promise.all([
        supabase.from('site_content').select('content').eq('id', 'home_content').maybeSingle(),
        supabase.from('site_content').select('content').eq('id', 'links').maybeSingle()
      ]);
      setLayoutData({
        home: homeRes.data?.content || staticContent,
        links: linksRes.data?.content || staticContent.links
      });
    }
    fetchLayout();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { data, error } = await supabase.from('mahabba_students').insert([formData]).select().single();
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        alert('This phone number is already registered! Please go back and select "View My Ticket".');
      } else {
        alert(`Registration failed: ${error.message}`);
      }
    } else {
      setStudentData(data);
      setView('ticket');
      window.scrollTo(0, 0);
    }
    setIsSubmitting(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { data, error } = await supabase
      .from('mahabba_students')
      .select('*')
      .eq('phone', loginPhone)
      .single();
      
    if (error || !data) {
      alert("No registration found with this phone number. Please register first.");
    } else {
      setStudentData(data);
      setView('ticket');
    }
    setIsSubmitting(false);
  };

  if (!layoutData) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', fontWeight: 700, gap: '0.5rem' }}>
        <div className="live-dot-solid" style={{ animation: 'ping 1.5s infinite' }}></div>
        Loading Portal...
      </div>
    );
  }

  const mergedSiteContent = {
    ...staticContent,
    tickerText: layoutData.home.tickerText || staticContent.tickerText
  };

  return (
    <main>
      <Header siteContent={mergedSiteContent} onOpenVolunteer={() => setIsVolunteerOpen(true)} />

      <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '4rem' }}>
        
        {/* HERO SECTION */}
        <div style={{ background: 'var(--primary)', color: 'white', padding: '4rem 1.5rem 3.5rem 1.5rem', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/" style={{ color: '#94A3B8', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.05em' }}>
              <BookOpen size={16} /> WEEKLY MORAL HALAQA
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
              Essence of Mahabba
            </h1>
            <p style={{ color: '#E2E8F0', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
              Join us weekly for spiritual grounding, moral guidance, and a community of brotherhood. Register once to get your permanent entry pass.
            </p>
          </div>
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="container" style={{ maxWidth: '600px', margin: '-2rem auto 0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          
          {/* VIEW: LANDING */}
          {view === 'landing' && (
            <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2.5rem 2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <QrCode size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>Get Your Entry Pass</h2>
              <p style={{ color: '#64748B', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                Scan your QR ticket at the venue for quick attendance check-in.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button onClick={() => setView('register')} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                  <UserPlus size={18} /> Register for Mahabba
                </button>
                <button onClick={() => setView('login')} className="btn-outline" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                  <QrCode size={18} /> View My Ticket
                </button>
              </div>
            </div>
          )}

          {/* VIEW: LOGIN (View Ticket) */}
          {view === 'login' && (
            <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2.5rem 2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
              <button onClick={() => setView('landing')} style={{ background: 'none', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
                <ArrowLeft size={16} /> Back
              </button>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Retrieve Ticket</h2>
              <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '0.9rem' }}>Enter the mobile number you used to register.</p>
              
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Mobile Number</label>
                  <input type="tel" required value={loginPhone} onChange={e => setLoginPhone(e.target.value)} placeholder="Enter 10-digit number" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none' }} />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem' }}>
                  {isSubmitting ? 'Searching...' : 'Show My QR Ticket'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW: REGISTER */}
          {view === 'register' && (
            <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2.5rem 2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
              <button onClick={() => setView('landing')} style={{ background: 'none', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
                <ArrowLeft size={16} /> Back
              </button>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>Registration Form</h2>
              
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Full Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Mobile Number *</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Email Address *</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Department *</label>
                  <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', outline: 'none', background: 'white' }}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Course *</label>
                    <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', outline: 'none', background: 'white' }}>
                      <option value="">Select Course</option>
                      {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Year *</label>
                    <select required value={formData.batch_year} onChange={e => setFormData({...formData, batch_year: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', outline: 'none', background: 'white' }}>
                      <option value="">Select Year</option>
                      {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '1rem', marginTop: '1rem' }}>
                  {isSubmitting ? 'Registering...' : 'Complete Registration'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW: DIGITAL TICKET */}
          {view === 'ticket' && studentData && (
            <div>
              <div style={{ background: 'white', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                {/* Ticket Header */}
                <div style={{ background: 'var(--primary)', padding: '2rem 1.5rem', textAlign: 'center', color: 'white' }}>
                  <CheckCircle size={32} color="#10B981" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Registration Confirmed</h3>
                  <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0 }}>Essence of Mahabba Entry Pass</p>
                </div>
                
                {/* QR Section (The magical part) */}
                <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#F8FAFC', borderBottom: '2px dashed #CBD5E1' }}>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-block', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <QRCode 
                      value={studentData.ticket_id} 
                      size={200}
                      fgColor="var(--primary)"
                    />
                  </div>
                  <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                    Show this QR at the venue entrance
                  </p>
                </div>

                {/* Student Details */}
                <div style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: '0 0 1.5rem 0', textAlign: 'center' }}>
                    {studentData.name}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ background: '#F1F5F9', padding: '1rem', borderRadius: '0.75rem' }}>
                      <span style={{ display: 'block', color: '#64748B', fontWeight: 700, marginBottom: '0.25rem' }}>Course</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{studentData.course} (Yr {studentData.batch_year})</span>
                    </div>
                    <div style={{ background: '#F1F5F9', padding: '1rem', borderRadius: '0.75rem' }}>
                      <span style={{ display: 'block', color: '#64748B', fontWeight: 700, marginBottom: '0.25rem' }}>Department</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{studentData.department}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reset/Logout Button */}
              <button 
                onClick={() => { setView('landing'); setStudentData(null); setLoginPhone(''); }}
                style={{ display: 'block', margin: '2rem auto 0', background: 'none', border: 'none', color: '#64748B', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 1rem' }}
              >
                Close Ticket
              </button>
            </div>
          )}

        </div>
      </div>

      <Footer links={layoutData.links} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      <VolunteerModal isOpen={isVolunteerOpen} onClose={() => setIsVolunteerOpen(false)} />
    </main>
  );
}