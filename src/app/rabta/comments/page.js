'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { siteContent as staticContent } from '@/lib/content';
import { Sun, Moon, ArrowLeft, MessageSquare, BarChart3, User, GraduationCap, Quote } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VolunteerModal from '@/components/VolunteerModal';

const CHART_COLORS = ['#0f4c52', '#0d9488', '#eab308', '#f59e0b', '#d97706'];

export default function RabtaCommentsPage() {
  const [layoutData, setLayoutData] = useState(null);
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('rabtaFeedbackTheme');
    if (savedTheme === 'dark') setDarkMode(true);

    async function fetchData() {
      // Fetch Layout Data
      const [homeRes, linksRes, feedbackRes] = await Promise.all([
        supabase.from('site_content').select('content').eq('id', 'home_content').maybeSingle(),
        supabase.from('site_content').select('content').eq('id', 'links').maybeSingle(),
        supabase.from('rabta_feedback').select('*').order('created_at', { ascending: false })
      ]);

      setLayoutData({
        home: homeRes.data?.content || staticContent,
        links: linksRes.data?.content || staticContent.links
      });

      const data = feedbackRes.data || [];
      setFeedbacks(data);

      // Calculate Averages for the Bar Chart
      if (data.length > 0) {
        const sums = { speaker: 0, clarity: 0, usefulness: 0, overall: 0, coordination: 0 };
        data.forEach(fb => {
          sums.speaker += fb.speaker_rating || 0;
          sums.clarity += fb.clarity_rating || 0;
          sums.usefulness += fb.usefulness_rating || 0;
          sums.overall += fb.overall_rating || 0;
          sums.coordination += fb.coordination_rating || 0;
        });

        const total = data.length;
        setChartData([
          { name: 'Speaker', average: Number((sums.speaker / total).toFixed(1)) },
          { name: 'Clarity', average: Number((sums.clarity / total).toFixed(1)) },
          { name: 'Usefulness', average: Number((sums.usefulness / total).toFixed(1)) },
          { name: 'Overall', average: Number((sums.overall / total).toFixed(1)) },
          { name: 'Coordination', average: Number((sums.coordination / total).toFixed(1)) },
        ]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('rabtaFeedbackTheme', next ? 'dark' : 'light');
  };

  // Custom Tooltip for the Bar Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: darkMode ? '#09262a' : '#fff', border: `1px solid ${darkMode ? '#194349' : '#d5e3e4'}`, padding: '10px 15px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 800, color: darkMode ? '#f1f8f8' : '#0f292c' }}>{label}</p>
          <p style={{ margin: 0, color: '#eab308', fontWeight: 700 }}>
            Average: {payload[0].value} / 5.0
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading || !layoutData) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#072a2e', color: '#f3d5a5', fontWeight: 700 }}>
        Loading Rabta Insights...
      </div>
    );
  }

  return (
    <main className={darkMode ? 'rabta-root dark' : 'rabta-root'}>
      <Header siteContent={{ ...staticContent, tickerText: layoutData.home.tickerText || staticContent.tickerText }} onOpenVolunteer={() => setIsVolunteerOpen(true)} />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,600&family=Amiri:wght@700&display=swap');

        .rabta-root {
          --teal: #0f4c52;
          --teal-dark: #083338;
          --gold: #eab308;
          --sand: #f4d9a8;
          --bg: #eef5f5;
          --card: #ffffff;
          --text: #0f292c;
          --muted: #5a7275;
          --border: #d5e3e4;
        }

        .rabta-root.dark {
          --bg: #04181b;
          --card: #09262a;
          --text: #f1f8f8;
          --muted: #9cb6b9;
          --border: #194349;
        }

        .comments-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          padding: 36px 18px 70px;
          transition: background 0.3s ease, color 0.3s ease;
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

        .dashboard-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .header-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header-section h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 6vw, 3.5rem);
          font-weight: 800;
          color: var(--teal);
          margin-bottom: 0.5rem;
        }
        .rabta-root.dark .header-section h1 { color: var(--sand); }

        .header-section p {
          color: var(--muted);
          font-size: 1.1rem;
        }

        .chart-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 15px 35px rgba(4, 33, 36, 0.08);
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          color: var(--text);
        }

        .chart-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
        }

        .comments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .comment-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
        }

        .comment-quote {
          color: var(--gold);
          margin-bottom: 0.75rem;
          opacity: 0.5;
        }

        .comment-text {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text);
          flex-grow: 1;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .comment-meta {
          border-top: 1px solid var(--border);
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--muted);
          font-weight: 600;
        }
        .meta-item strong {
          color: var(--teal);
        }
        .rabta-root.dark .meta-item strong {
          color: var(--sand);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--muted);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }
        .back-link:hover { color: var(--teal); }
        .rabta-root.dark .back-link:hover { color: var(--sand); }
      `}} />

      <button onClick={toggleTheme} className="rabta-theme-btn" aria-label="Toggle theme">
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="comments-page">
        <div className="dashboard-container">
          
          <a href="/rabta" className="back-link">
            <ArrowLeft size={18} /> Back to Feedback Form
          </a>

          <div className="header-section">
            <h1>Rabta Insights</h1>
            <p>Community feedback and average ratings from the gathering.</p>
          </div>

          {/* Average Ratings Bar Chart */}
          {feedbacks.length > 0 ? (
            <div className="chart-card">
              <div className="chart-header">
                <BarChart3 size={28} color="var(--gold)" />
                <h2>Overall Satisfaction Averages</h2>
              </div>
              
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#194349' : '#d5e3e4'} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: darkMode ? '#9cb6b9' : '#5a7275', fontSize: 13, fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      tick={{ fill: darkMode ? '#9cb6b9' : '#5a7275', fontSize: 13 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
                    <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="chart-card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
              No ratings submitted yet.
            </div>
          )}

          {/* Feedback Comments Grid */}
          <div className="chart-header" style={{ marginBottom: '1.5rem', marginLeft: '0.5rem' }}>
            <MessageSquare size={24} color="var(--teal)" style={{ color: darkMode ? 'var(--sand)' : 'var(--teal)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)' }}>Voices from the Delegates</h2>
          </div>

          {feedbacks.length > 0 ? (
            <div className="comments-grid">
              {feedbacks.map(fb => (
                <div key={fb.id} className="comment-card">
                  <Quote size={28} className="comment-quote" />
                  <div className="comment-text">"{fb.feedback}"</div>
                  
                  <div className="comment-meta">
                    <div className="meta-item">
                      <User size={15} /> 
                      <strong>{fb.name || 'Anonymous Delegate'}</strong>
                    </div>
                    {(fb.course || fb.batch_year) && (
                      <div className="meta-item">
                        <GraduationCap size={15} /> 
                        <span>
                          {fb.course && fb.course}
                          {fb.course && fb.batch_year && ' • '}
                          {fb.batch_year && fb.batch_year}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', background: 'var(--card)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
              No comments have been posted yet.
            </div>
          )}

        </div>
      </div>

      <Footer links={layoutData.links} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      <VolunteerModal isOpen={isVolunteerOpen} onClose={() => setIsVolunteerOpen(false)} />
    </main>
  );
}