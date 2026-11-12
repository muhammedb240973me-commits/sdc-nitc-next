'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { siteContent as staticContent } from '@/lib/content';
import { Calendar, Clock, MapPin, Mic, Sun, Moon, Loader2, Camera, ArrowUpRight } from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VolunteerModal from '@/components/VolunteerModal';

const COURSES = ['B.Tech', 'M.Tech', 'PhD', 'B.Sc-B.Ed', 'M.Sc', 'MBA', 'MCA', 'M.Plan', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'PhD / Research'];

const PROGRAM_PHOTOS = [
  {
    src: '/rabta-1.jpg',
    alt: 'Muhammed Falil Noorani addressing students at Rabta',
    caption: 'Interactive Spiritual Session with Muhammed Falil Noorani'
  },
  {
    src: '/rabta-2.jpg',
    alt: 'Students attending the Rabta gathering at Alqamar Office',
    caption: 'Non-Malayali Student Gathering at Alqamar Office'
  }
];

const RATING_ITEMS = [
  { key: 'speakerRating', numeral: 'i)', label: 'About the Talk' },
  { key: 'clarityRating', numeral: 'ii)', label: 'Clarity of Presentation' },
  { key: 'usefulnessRating', numeral: 'iii)', label: 'Usefulness of Session' },
  { key: 'overallRating', numeral: 'iv)', label: 'Overall Experience' },
  { key: 'coordinationRating', numeral: 'v)', label: 'Event Coordination & Food' }
];

const RATING_LABELS = {
  1: '⭐ Very Poor',
  2: '⭐⭐ Poor',
  3: '⭐⭐⭐ Average',
  4: '⭐⭐⭐⭐ Good',
  5: '⭐⭐⭐⭐⭐ Excellent'
};

export default function RabtaFeedbackPage() {
  const [layoutData, setLayoutData] = useState(null);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [missingPhotos, setMissingPhotos] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    year: '',
    course: '',
    speakerRating: 0,
    clarityRating: 0,
    usefulnessRating: 0,
    overallRating: 0,
    coordinationRating: 0,
    feedback: ''
  });

  const [hoveredRatings, setHoveredRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('rabtaFeedbackTheme');
    if (savedTheme === 'dark') setDarkMode(true);

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

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('rabtaFeedbackTheme', next ? 'dark' : 'light');
  };

  const handleRatingSelect = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (statusError) setStatusError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedFeedback = formData.feedback.trim();
    if (!trimmedFeedback) {
      setStatusError('Please enter your feedback.');
      return;
    }

    if (
      !formData.speakerRating ||
      !formData.clarityRating ||
      !formData.usefulnessRating ||
      !formData.overallRating ||
      !formData.coordinationRating
    ) {
      setStatusError('Please rate all five aspects before submitting.');
      return;
    }

    setIsSubmitting(true);
    setStatusError('');

    const { error } = await supabase.from('rabta_feedback').insert([
      {
        name: formData.name.trim() || null,
        batch_year: formData.year || null,
        course: formData.course || null,
        speaker_rating: formData.speakerRating,
        clarity_rating: formData.clarityRating,
        usefulness_rating: formData.usefulnessRating,
        overall_rating: formData.overallRating,
        coordination_rating: formData.coordinationRating,
        feedback: trimmedFeedback
      }
    ]);

    if (error) {
      console.error('Feedback error:', error);
      setStatusError('Unable to submit your feedback. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!layoutData) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#072a2e', color: '#f3d5a5', fontWeight: 700 }}>
        Loading Rabta Portal...
      </div>
    );
  }

  return (
    <main className={darkMode ? 'rabta-root dark' : 'rabta-root'}>
      <Header
        siteContent={{ ...staticContent, tickerText: layoutData.home.tickerText || staticContent.tickerText }}
        onOpenVolunteer={() => setIsVolunteerOpen(true)}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,600&family=Amiri:wght@700&display=swap');

        .rabta-root {
          --teal: #0f4c52;
          --teal-dark: #083338;
          --teal-deep: #042124;
          --gold: #eab308;
          --sand: #f4d9a8;
          --sand-text: #fde68a;
          --bg: #eef5f5;
          --card: #ffffff;
          --text: #0f292c;
          --muted: #5a7275;
          --border: #d5e3e4;
          --input: #f7fafa;
        }

        .rabta-root.dark {
          --bg: #04181b;
          --card: #09262a;
          --text: #f1f8f8;
          --muted: #9cb6b9;
          --border: #194349;
          --input: #061d20;
        }

        .rabta-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          padding: 36px 18px 70px;
          transition: background 0.3s ease, color 0.3s ease;
          position: relative;
        }

        .rabta-theme-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 40;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1px solid rgba(244, 217, 168, 0.45);
          background: var(--teal-dark);
          color: var(--sand);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
          transition: transform 0.2s ease;
        }
        .rabta-theme-btn:hover { transform: scale(1.08); }

        .rabta-card {
          width: 100%;
          max-width: 660px;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 22px;
          background: var(--card);
          border: 1px solid var(--border);
          box-shadow: 0 25px 70px rgba(4, 33, 36, 0.16);
        }

        /* Banner inspired by Rabta poster */
        .rabta-banner {
          position: relative;
          overflow: hidden;
          padding: 46px 28px 40px;
          text-align: center;
          color: #ffffff;
          background:
            radial-gradient(circle at 50% 15%, rgba(244, 217, 168, 0.24), transparent 55%),
            linear-gradient(145deg, #125258 0%, #0b393e 55%, #042124 100%);
        }

        .rabta-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image:
            linear-gradient(30deg, transparent 48%, #f4d9a8 49%, transparent 50%),
            linear-gradient(-30deg, transparent 48%, #f4d9a8 49%, transparent 50%);
          background-size: 36px 36px;
        }

        .rabta-banner-inner {
          position: relative;
          z-index: 2;
        }

        .rabta-badge {
          display: inline-block;
          color: var(--sand);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .rabta-title-wrap {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .rabta-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3.2rem, 10vw, 4.6rem);
          font-weight: 800;
          line-height: 0.95;
          color: #ffffff;
          letter-spacing: -1px;
        }

        .rabta-arabic {
          font-family: 'Amiri', serif;
          font-size: clamp(2rem, 6vw, 2.75rem);
          color: var(--sand);
          line-height: 1;
        }

        .rabta-tagline {
          display: inline-block;
          margin-top: 14px;
          padding: 7px 18px;
          border-left: 4px solid var(--sand);
          background: rgba(4, 33, 36, 0.55);
          font-size: 14px;
          font-weight: 600;
          color: #f8fafc;
        }

        .rabta-speaker-pill {
          margin: 18px auto 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--sand);
          color: #082f33;
          padding: 8px 18px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .rabta-meta {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(244, 217, 168, 0.2);
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px 20px;
          font-size: 12px;
          color: #e2e8f0;
          font-weight: 600;
        }

        .rabta-meta span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        /* Program Photos Gallery */
        .rabta-gallery-section {
          padding: 28px 36px 0;
        }

        .rabta-gallery-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: var(--teal);
          margin-bottom: 12px;
        }
        .rabta-root.dark .rabta-gallery-label {
          color: var(--sand);
        }

        .rabta-photos-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .rabta-photo-frame {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          aspect-ratio: 4 / 3;
          border: 1px solid var(--border);
          background: var(--input);
        }

        .rabta-photo-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }
        .rabta-photo-frame:hover img {
          transform: scale(1.04);
        }

        .rabta-photo-caption {
          position: absolute;
          inset: auto 0 0 0;
          padding: 22px 12px 9px;
          background: linear-gradient(to top, rgba(4, 33, 36, 0.88), transparent);
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.3;
        }

        /* Form Content */
        .rabta-content {
          padding: 36px 40px 44px;
        }

        .rabta-content h2 {
          text-align: center;
          font-size: 27px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 6px;
        }

        .rabta-intro {
          text-align: center;
          color: var(--muted);
          font-size: 14px;
          margin-bottom: 28px;
          line-height: 1.5;
        }

        .rabta-form-group {
          margin-bottom: 20px;
        }

        .rabta-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .rabta-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .rabta-optional {
          color: var(--muted);
          font-size: 11px;
          font-weight: 500;
          margin-left: 5px;
        }

        .rabta-required {
          color: #dc2626;
          margin-left: 3px;
        }

        .rabta-input,
        .rabta-select,
        .rabta-textarea {
          width: 100%;
          padding: 14px 15px;
          border-radius: 11px;
          border: 1px solid var(--border);
          background: var(--input);
          color: var(--text);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .rabta-input,
        .rabta-select {
          height: 50px;
        }

        .rabta-textarea {
          min-height: 155px;
          resize: vertical;
          line-height: 1.5;
        }

        .rabta-input:focus,
        .rabta-select:focus,
        .rabta-textarea:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(15, 76, 82, 0.14);
        }

        .rabta-root.dark .rabta-input:focus,
        .rabta-root.dark .rabta-select:focus,
        .rabta-root.dark .rabta-textarea:focus {
          border-color: var(--sand);
          box-shadow: 0 0 0 3px rgba(244, 217, 168, 0.14);
        }

        /* Ratings */
        .rabta-rating-section {
          margin: 26px 0 28px;
          padding: 22px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--input);
        }

        .rabta-rating-heading {
          margin-bottom: 18px;
        }

        .rabta-rating-heading h3 {
          font-size: 17px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 4px;
        }

        .rabta-rating-heading p {
          color: var(--muted);
          font-size: 12px;
        }

        .rabta-rating-group {
          padding: 15px 0;
          border-bottom: 1px solid var(--border);
        }

        .rabta-rating-group:last-of-type {
          border-bottom: none;
        }

        .rabta-rating-question {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--text);
        }

        .rabta-rating-question span {
          color: var(--teal);
          font-weight: 800;
        }
        .rabta-root.dark .rabta-rating-question span {
          color: var(--sand);
        }

        .rabta-stars {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rabta-stars button {
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #cbd5e1;
          font-size: 27px;
          line-height: 1;
          cursor: pointer;
          transition: color 0.15s ease, transform 0.15s ease, background 0.15s ease;
        }

        .rabta-root.dark .rabta-stars button {
          color: #334e52;
        }

        .rabta-stars button:hover {
          transform: scale(1.12);
          background: rgba(234, 179, 8, 0.14);
        }

        .rabta-stars button.active {
          color: #eab308;
        }

        .rabta-rating-label {
          min-height: 18px;
          margin-top: 4px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 600;
        }

        .rabta-rating-guide {
          display: flex;
          flex-wrap: wrap;
          gap: 7px 14px;
          margin-top: 16px;
          padding-top: 15px;
          border-top: 1px solid var(--border);
          color: var(--muted);
          font-size: 11px;
        }

        .rabta-char-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
          color: var(--muted);
          font-size: 11px;
        }

        .rabta-submit-btn {
          width: 100%;
          height: 54px;
          margin-top: 18px;
          border: none;
          border-radius: 10px;
          background: var(--teal);
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, transform 0.15s;
        }

        .rabta-submit-btn:hover:not(:disabled) {
          background: var(--teal-dark);
          transform: translateY(-1px);
        }

        .rabta-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .rabta-error {
          text-align: center;
          margin-top: 14px;
          color: #dc2626;
          font-size: 13px;
          font-weight: 600;
        }

        /* Success State */
        .rabta-success {
          text-align: center;
          padding: 16px 6px 8px;
        }

        .rabta-success-icon {
          width: 68px;
          height: 68px;
          margin: 0 auto 18px;
          border-radius: 50%;
          background: var(--sand);
          color: var(--teal-dark);
          font-size: 32px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(15, 76, 82, 0.18);
        }

        .rabta-success h3 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 10px;
          color: var(--text);
        }

        .rabta-success p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.7;
          max-width: 460px;
          margin: 0 auto 12px;
        }

        .rabta-explore {
          margin-top: 30px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .rabta-explore span {
          display: block;
          margin-bottom: 12px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .rabta-explore-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 22px;
          background: var(--teal);
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          transition: background 0.2s, transform 0.2s;
        }

        .rabta-explore-btn:hover {
          background: var(--teal-dark);
          transform: translateY(-2px);
        }

        @media (max-width: 600px) {
          .rabta-page { padding: 20px 12px 60px; }
          .rabta-gallery-section { padding: 22px 20px 0; }
          .rabta-photos-grid { grid-template-columns: 1fr; }
          .rabta-content { padding: 28px 20px 34px; }
          .rabta-row-2 { grid-template-columns: 1fr; gap: 0; }
          .rabta-rating-section { padding: 16px; }
          .rabta-stars button { width: 35px; height: 35px; font-size: 25px; }
          .rabta-rating-guide { display: block; }
          .rabta-rating-guide div { margin-bottom: 4px; }
        }
      `}} />

      {/* Floating Light/Dark Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="rabta-theme-btn"
        aria-label="Toggle theme"
        title="Switch Light / Dark Mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="rabta-page">
        <section className="rabta-card">
          
          {/* Program Banner */}
          <div className="rabta-banner">
            <div className="rabta-pattern" />
            <div className="rabta-banner-inner">
              <div className="rabta-badge">Students Development Cell • NIT Calicut</div>
              <div className="rabta-title-wrap">
                <h1 className="rabta-title">Rabta</h1>
                <span className="rabta-arabic">رابطہ</span>
              </div>
              <p className="rabta-tagline">
                A Spiritual Gathering for Non-Malayali Students
              </p>

              <div>
                <div className="rabta-speaker-pill">
                  <Mic size={16} /> Muhammed Falil Noorani
                </div>
              </div>

              <div className="rabta-meta">
                <span><Calendar size={14} color="#f4d9a8" /> 12-11-26 Thursday</span>
                <span><Clock size={14} color="#f4d9a8" /> 6:15 PM</span>
                <span><MapPin size={14} color="#f4d9a8" /> Alqamar Office, Companymukk</span>
              </div>
            </div>
          </div>

          {/* Two Program Photos Showcase */}
          <div className="rabta-gallery-section">
            <div className="rabta-gallery-label">
              <Camera size={15} /> Glimpses from Rabta
            </div>
            <div className="rabta-photos-grid">
              {PROGRAM_PHOTOS.map((photo, idx) => (
                <div key={idx} className="rabta-photo-frame">
                  {!missingPhotos[idx] ? (
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      onError={() => setMissingPhotos(prev => ({ ...prev, [idx]: true }))}
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                      <Camera size={24} style={{ marginBottom: '6px', opacity: 0.6 }} />
                      <span>Add <strong>{photo.src}</strong> to your <code>public/</code> folder</span>
                    </div>
                  )}
                  <div className="rabta-photo-caption">{photo.caption}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Content */}
          <div className="rabta-content">
            {!isSubmitted ? (
              <div>
                <h2>Submit Your Feedback</h2>
                <p className="rabta-intro">
                  Your feedback helps us make future spiritual gatherings and campus sessions better.
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="rabta-form-group">
                    <label htmlFor="name" className="rabta-label">
                      Name <span className="rabta-optional">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      maxLength={100}
                      placeholder="Enter your name"
                      className="rabta-input"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  {/* Year & Course */}
                  <div className="rabta-row-2">
                    <div className="rabta-form-group">
                      <label htmlFor="year" className="rabta-label">
                        Year <span className="rabta-optional">(Optional)</span>
                      </label>
                      <select
                        id="year"
                        className="rabta-select"
                        value={formData.year}
                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                      >
                        <option value="">Select Year</option>
                        {YEARS.map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>

                    <div className="rabta-form-group">
                      <label htmlFor="course" className="rabta-label">
                        Course <span className="rabta-optional">(Optional)</span>
                      </label>
                      <select
                        id="course"
                        className="rabta-select"
                        value={formData.course}
                        onChange={e => setFormData({ ...formData, course: e.target.value })}
                      >
                        <option value="">Select Course</option>
                        {COURSES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 5-Aspect Star Ratings */}
                  <div className="rabta-rating-section">
                    <div className="rabta-rating-heading">
                      <h3>Rate Your Experience</h3>
                      <p>Please rate the following aspects of the session.</p>
                    </div>

                    {RATING_ITEMS.map(item => {
                      const currentVal = formData[item.key];
                      const hoverVal = hoveredRatings[item.key] || 0;
                      const displayVal = hoverVal || currentVal;

                      return (
                        <div key={item.key} className="rabta-rating-group">
                          <div className="rabta-rating-question">
                            <span>{item.numeral}</span>
                            <strong>{item.label}</strong>
                          </div>

                          <div
                            className="rabta-stars"
                            onMouseLeave={() => setHoveredRatings(prev => ({ ...prev, [item.key]: 0 }))}
                          >
                            {[1, 2, 3, 4, 5].map(starVal => (
                              <button
                                key={starVal}
                                type="button"
                                className={starVal <= displayVal ? 'active' : ''}
                                onMouseEnter={() => setHoveredRatings(prev => ({ ...prev, [item.key]: starVal }))}
                                onClick={() => handleRatingSelect(item.key, starVal)}
                                aria-label={`Rate ${item.label} ${starVal} out of 5`}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <div className="rabta-rating-label">
                            {displayVal ? RATING_LABELS[displayVal] : 'Select a rating'}
                          </div>
                        </div>
                      );
                    })}

                    <div className="rabta-rating-guide">
                      <div>⭐ Very Poor</div>
                      <div>⭐⭐ Poor</div>
                      <div>⭐⭐⭐ Average</div>
                      <div>⭐⭐⭐⭐ Good</div>
                      <div>⭐⭐⭐⭐⭐ Excellent</div>
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="rabta-form-group">
                    <label htmlFor="feedback" className="rabta-label">
                      Your Feedback <span className="rabta-required">*</span>
                    </label>
                    <textarea
                      id="feedback"
                      rows={6}
                      maxLength={1000}
                      required
                      placeholder="Share your experience, key takeaways, or suggestions for future Rabta sessions..."
                      className="rabta-textarea"
                      value={formData.feedback}
                      onChange={e => {
                        setFormData({ ...formData, feedback: e.target.value });
                        if (statusError) setStatusError('');
                      }}
                    />
                    <div className="rabta-char-row">
                      <span>Feedback is required.</span>
                      <span>{formData.feedback.length} / 1000</span>
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="rabta-submit-btn">
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> SUBMITTING...
                      </>
                    ) : (
                      'SUBMIT FEEDBACK'
                    )}
                  </button>

                  {statusError && <p className="rabta-error">{statusError}</p>}
                </form>
              </div>
            ) : (
              /* Success Message Screen */
              <div className="rabta-success">
                <div className="rabta-success-icon">✓</div>
                <h3>Submitted</h3>
                <p>
                  Thank you for your valuable feedback and suggestions. Your inputs have been noted and will help us improve upcoming <strong>Rabta</strong> gatherings.
                </p>

                <div className="rabta-explore">
                  <span>Explore more initiatives by SDC NITC</span>
                  <a href="/" className="rabta-explore-btn">
                    VISIT SDC NITC HOME <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>
            )}
          </div>

        </section>
      </div>

      <Footer links={layoutData.links} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      <VolunteerModal isOpen={isVolunteerOpen} onClose={() => setIsVolunteerOpen(false)} />
    </main>
  );
}