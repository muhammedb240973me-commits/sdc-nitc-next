'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { siteContent as staticContent } from '@/lib/content';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { BookOpen, QrCode, ArrowLeft, UserPlus, CheckCircle, MessageCircle } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VolunteerModal from '@/components/VolunteerModal';

const COURSES = ['B.Tech', 'M.Tech', 'PhD', 'B.Sc-B.Ed', 'M.Sc', 'MBA', 'MCA', 'M.Plan', 'Other'];
const DEPARTMENTS = [
  'Architecture and Planning', 'Chemical Engineering', 'Chemistry', 'Civil Engineering', 'Energy Engineering', 'Biotechnology', 
  'Computer Science and Engineering', 'Electrical and Electronics Engineering', 'Electronics and Communication', 'Material Science Engineering',
  'Mathematics', 'Mechanical Engineering', 'Physics', 'Humanities, Arts and Social Sciences', 'Management Studies'
];
const YEARS = ['1', '2', '3', '4', '5', '6'];

export default function MahabbaPage() {
  const [layoutData, setLayoutData] = useState(null);
  const [sliderImages, setSliderImages] = useState([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  
  const [view, setView] = useState('landing');
  
  const [studentData, setStudentData] = useState(null);
  const [loginPhone, setLoginPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', course: '', department: '', batch_year: ''
  });

  useEffect(() => {
    async function fetchData() {
      const [homeRes, linksRes, settingsRes] = await Promise.all([
        supabase.from('site_content').select('content').eq('id', 'home_content').maybeSingle(),
        supabase.from('site_content').select('content').eq('id', 'links').maybeSingle(),
        supabase.from('mahabba_settings').select('slider_images').eq('id', 1).single()
      ]);
      
      setLayoutData({
        home: homeRes.data?.content || staticContent,
        links: linksRes.data?.content || staticContent.links
      });
      
      if (settingsRes.data?.slider_images?.length > 0) {
        setSliderImages(settingsRes.data.slider_images);
      } else {
        // Fallbacks if no images uploaded yet
        setSliderImages([
          'https://as1.ftcdn.net/v2/jpg/05/93/23/64/1000_F_593236439_4oRQ6R2fpTp9UTr26C5DWlchPQqTOTli.jpgq=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop'
        ]);
      }
    }
    fetchData();
  }, []);

  // Handle Automatic Image Crossfading
  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex(prev => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderImages]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data, error } = await supabase.from('mahabba_students').insert([formData]).select().single();
    if (error) {
      if (error.code === '23505') alert('This phone number is already registered! Please go back and select "View My Ticket".');
      else alert(`Registration failed: ${error.message}`);
    } else {
      setStudentData(data);
      setView('ticket');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsSubmitting(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data, error } = await supabase.from('mahabba_students').select('*').eq('phone', loginPhone).single();
    if (error || !data) alert("No registration found with this phone number. Please register first.");
    else {
      setStudentData(data);
      setView('ticket');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsSubmitting(false);
  };

  if (!layoutData) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: '#E2E8F0', fontWeight: 700 }}>
        Loading Mahabba Portal...
      </div>
    );
  }

  const mergedSiteContent = { ...staticContent, tickerText: layoutData.home.tickerText || staticContent.tickerText };

  return (
    <main style={{ background: '#0a0a0a' }}>
      <Header siteContent={mergedSiteContent} onOpenVolunteer={() => setIsVolunteerOpen(true)} />

      {/* =========================================================================
          NEUBRUTALISM PREMIUM CSS
          ========================================================================= */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@700&display=swap');

        /* Dark Texture Bg */
        .neubrutal-bg {
          background: 
            radial-gradient(circle at 50% 0%, rgba(30, 41, 59, 0.6) 0%, rgba(10, 10, 10, 1) 70%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          min-height: 100vh;
          padding-bottom: 5rem;
          color: #F8FAFC;
        }

        /* Typography - Poster Style Map */
        .title-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          transform: rotate(-3deg);
          margin-bottom: 2rem;
        }
        .title-main {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(5rem, 18vw, 9rem);
          line-height: 0.85;
          color: #FFFFFF;
          margin: 0;
          text-shadow: 5px 5px 0px rgba(0,0,0,0.8);
          letter-spacing: 2px;
        }
        .title-of {
          font-family: 'Caveat', cursive;
          color: #EF4444; /* Vivid Red */
          font-size: clamp(3rem, 10vw, 5.5rem);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-5deg);
          z-index: 2;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          /* Writing Animation */
          clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
          animation: writeOf 1.5s ease-out forwards;
        }
        @keyframes writeOf {
          0% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
          100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
        }

        /* Neubrutalism Image Box */
        .brutal-img-box {
          width: 100%;
          max-width: 320px;
          aspect-ratio: 4/5;
          background: #111;
          border: 4px solid #fff;
          border-radius: 12px 40px 10px 30px; /* Non-exact rectangle */
          box-shadow: 12px 12px 0px #EF4444; /* Harsh offset shadow */
          transform: rotate(3deg);
          position: relative;
          margin: 3.5rem auto;
          overflow: hidden;
        }
        .brutal-img-box img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 1s ease-in-out, transform 3s ease-out;
        }
        
        /* Brutal Cut Buttons */
        .btn-brutal {
          background: #E2E8F0;
          color: #0F172A;
          border: 3px solid #000;
          border-radius: 20px 0 20px 0; /* Square with opposite corners flat */
          box-shadow: 6px 6px 0px #F59E0B; /* Yellow harsh shadow */
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
        .btn-brutal-outline {
          background: transparent;
          color: #E2E8F0;
          border: 3px solid #E2E8F0;
          border-radius: 20px 0 20px 0;
          box-shadow: 6px 6px 0px #10B981; /* Green harsh shadow */
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
        .btn-brutal-outline:active {
          transform: translate(4px, 4px);
          box-shadow: 2px 2px 0px #10B981;
        }

        /* Brutal Form Card */
        .brutal-card {
          background: #111;
          border: 3px solid #333;
          border-radius: 20px 0 20px 0;
          padding: 2.5rem 2rem;
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
        .brutal-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 800;
          color: #94A3B8;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }
        .brutal-input option { background: #111; color: white; }
      `}} />

      <div className="neubrutal-bg">
        
        {/* TOP NAVIGATION BACK BUTTON */}
        <div className="container" style={{ padding: '2rem 1.5rem 0 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setView('landing')} style={{ background: 'none', border: 'none', color: '#94A3B8', display: view === 'landing' ? 'none' : 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to Mahabba
          </button>
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 10 }}>
          
          {/* VIEW: LANDING */}
          {view === 'landing' && (
            <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#EF4444', color: '#fff', padding: '0.4rem 1.2rem', border: '2px solid #000', borderRadius: '0', fontSize: '0.8rem', fontWeight: 900, marginBottom: '2.5rem', textTransform: 'uppercase', boxShadow: '4px 4px 0px #000' }}>
                <BookOpen size={16} /> Weekly Moral Halaqa
              </div>

              {/* Neubrutalism Typography block matching poster */}
              <div className="title-block">
                <h1 className="title-main">ESSENCE</h1>
                <span className="title-of">of</span>
                <h1 className="title-main">MAHABBA</h1>
              </div>

              <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto', fontWeight: 600 }}>
                Spiritual grounding, moral guidance, and a community of brotherhood. Secure your permanent digital pass today.
              </p>
              
              {/* Tilted Brutalist Image Feature */}
              <div className="brutal-img-box">
                {sliderImages.map((src, index) => (
                  <img 
                    key={index} 
                    src={src} 
                    alt={`Mahabba Gallery ${index + 1}`} 
                    style={{ 
                      opacity: index === currentImgIndex ? 1 : 0,
                      transform: index === currentImgIndex ? 'scale(1)' : 'scale(1.05)'
                    }} 
                  />
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px', margin: '0 auto' }}>
                <button onClick={() => setView('register')} className="btn-brutal">
                  <UserPlus size={20} /> Register Here
                </button>
                <button onClick={() => setView('login')} className="btn-brutal-outline">
                  <QrCode size={20} /> View Ticket
                </button>
              </div>
            </div>
          )}

          {/* VIEW: LOGIN (View Ticket) */}
          {view === 'login' && (
            <div className="brutal-card" style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', marginBottom: '0.5rem', letterSpacing: '1px' }}>Retrieve Ticket</h2>
              <p style={{ color: '#94A3B8', marginBottom: '2.5rem', fontSize: '0.95rem', fontWeight: 600 }}>Enter your registered mobile number.</p>
              
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="brutal-label">Mobile Number</label>
                  <input type="tel" required value={loginPhone} onChange={e => setLoginPhone(e.target.value)} placeholder="Enter 10-digit number" className="brutal-input" />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-brutal" style={{ marginTop: '1rem', background: '#F59E0B', color: '#000', borderColor: '#000', boxShadow: '6px 6px 0px #000' }}>
                  {isSubmitting ? 'Searching...' : 'Show My QR Ticket'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW: REGISTER */}
          {view === 'register' && (
            <div className="brutal-card" style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontFamily: '"Bebas Neue", sans-serif', color: '#FFFFFF', marginBottom: '2rem', letterSpacing: '1px' }}>Registration</h2>
              
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="brutal-label">Full Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="brutal-input" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="brutal-label">Mobile Number *</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="brutal-input" />
                  </div>
                  <div>
                    <label className="brutal-label">Email *</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="brutal-input" />
                  </div>
                </div>

                <div>
                  <label className="brutal-label">Department *</label>
                  <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="brutal-input">
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="brutal-label">Course *</label>
                    <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="brutal-input">
                      <option value="">Select Course</option>
                      {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="brutal-label">Year *</label>
                    <select required value={formData.batch_year} onChange={e => setFormData({...formData, batch_year: e.target.value})} className="brutal-input">
                      <option value="">Select Year</option>
                      {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-brutal" style={{ marginTop: '1.5rem', background: '#F59E0B', color: '#000', borderColor: '#000', boxShadow: '6px 6px 0px #000' }}>
                  {isSubmitting ? 'Registering...' : 'Complete Registration'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW: DIGITAL TICKET */}
          {view === 'ticket' && studentData && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ background: '#E2E8F0', border: '4px solid #000', borderRadius: '20px 0 20px 0', overflow: 'hidden', boxShadow: '12px 12px 0px #EF4444' }}>
                
                {/* Ticket Header */}
                <div style={{ background: '#000', padding: '2rem 1.5rem', textAlign: 'center', color: '#E2E8F0', borderBottom: '4px solid #000' }}>
                  <CheckCircle size={36} color="#10B981" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '2rem', fontFamily: '"Bebas Neue", sans-serif', margin: '0 0 0.25rem 0', letterSpacing: '1px' }}>Registration Confirmed</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Essence of Mahabba Entry Pass</p>
                </div>
                
                {/* QR Section */}
                <div style={{ padding: '3rem 2rem', textAlign: 'center', borderBottom: '4px dashed #000' }}>
                  <div style={{ background: 'white', padding: '1rem', border: '3px solid #000', display: 'inline-block', boxShadow: '6px 6px 0px #000' }}>
                    <QRCode value={studentData.ticket_id} size={220} fgColor="#000" />
                  </div>
                  <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#000', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Show this QR at the venue
                  </p>
                </div>

                {/* Student Details */}
                <div style={{ padding: '2.5rem 2rem', color: '#000' }}>
                  <h2 style={{ fontSize: '2rem', fontFamily: '"Bebas Neue", sans-serif', color: '#000', margin: '0 0 1.5rem 0', textAlign: 'center', letterSpacing: '1px' }}>
                    {studentData.name}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ background: 'transparent', border: '2px solid #000', padding: '1rem', borderRadius: '0' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Course</span>
                      <span style={{ fontWeight: 900 }}>{studentData.course} (Yr {studentData.batch_year})</span>
                    </div>
                    <div style={{ background: 'transparent', border: '2px solid #000', padding: '1rem', borderRadius: '0' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Department</span>
                      <span style={{ fontWeight: 900 }}>{studentData.department}</span>
                    </div>
                  </div>
                </div>
              </div>

              {layoutData.links?.whatsappMoralCircle && (
                <a 
                  href={layoutData.links.whatsappMoralCircle} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-brutal" 
                  style={{ background: '#25D366', color: '#000', borderColor: '#000', boxShadow: '6px 6px 0px #000', marginTop: '2.5rem', textDecoration: 'none' }}
                >
                  <MessageCircle size={22} color="#000" fill="#000" /> Join Official WhatsApp
                </a>
              )}
              
              <button 
                onClick={() => { setView('landing'); setStudentData(null); setLoginPhone(''); }}
                style={{ display: 'block', margin: '2rem auto 0', background: 'none', border: 'none', color: '#94A3B8', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 1rem', textTransform: 'uppercase' }}
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