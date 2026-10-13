'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { siteContent as staticContent } from '@/lib/content';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VolunteerModal from '@/components/VolunteerModal';
import { Search, X, FileText, Download, BookOpen } from 'lucide-react';

export default function QuestionBankPage() {
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    async function fetchQBData() {
      const [coursesRes, linksRes] = await Promise.all([
        supabase.from('courses').select('*, materials(*)').order('created_at', { ascending: false }),
        supabase.from('site_content').select('content').eq('id', 'links').maybeSingle()
      ]);

      setLiveData({
        courses: coursesRes.data || [],
        links: linksRes.data?.content || staticContent.links
      });
    }
    fetchQBData();
  }, []);

  if (!liveData) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', fontWeight: 700, gap: '0.5rem' }}>
        <div className="live-dot-solid" style={{ animation: 'ping 1.5s infinite' }}></div>
        Loading Question Bank...
      </div>
    );
  }

  const { questionBankPage } = staticContent; // Keep headers/filters static for now
  const { courses, links } = liveData;

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDept === 'All' || course.department === selectedDept;
    const matchesSem = selectedSem === 'All' || course.semester === selectedSem;

    return matchesSearch && matchesDept && matchesSem;
  });

  return (
    <main>
      <Header siteContent={staticContent} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      
      <section className="donate-hero" style={{ padding: '4rem 0 2rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>
              <span className="section-tag-dot"></span>
              <span>{questionBankPage.header.tag}</span>
            </div>
            <h1 className="section-heading" style={{ fontSize: '2.75rem', marginTop: '0.5rem' }}>
              {questionBankPage.header.title}
            </h1>
            <p className="section-subtext" style={{ fontSize: '1.1rem' }}>
              {questionBankPage.header.description}
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <div className="search-widget-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="search-input-box">
              <Search size={18} className="search-icon-inside" />
              <input 
                type="text" 
                className="search-input-field" 
                placeholder="Search by Course name / Course code / Department..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Department</label>
                <select className="form-select" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                  {questionBankPage.departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Semester</label>
                <select className="form-select" value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)}>
                  {questionBankPage.semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: '5rem' }}>
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {filteredCourses.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {filteredCourses.map(course => (
                  <div key={course.id} className="pillar-card" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setSelectedCourse(course)}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', backgroundColor: 'var(--secondary-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{course.code}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)', backgroundColor: '#E2E8F0', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{course.semester}</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem', lineHeight: 1.3 }}>{course.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.department}</p>
                    </div>
                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)' }}>
                      <BookOpen size={16} />
                      <span>View {course.materials?.length || 0} Materials</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No courses found matching your criteria.</p>
                <button onClick={() => {setSearchQuery(''); setSelectedDept('All'); setSelectedSem('All');}} className="btn-outline" style={{ marginTop: '1rem' }}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedCourse && (
        <div className="modal active">
          <div className="modal-backdrop" onClick={() => setSelectedCourse(null)}></div>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <button className="modal-close-btn" onClick={() => setSelectedCourse(null)}>
              <X size={18} />
            </button>
            
            <div style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{selectedCourse.code} • {selectedCourse.semester}</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem', lineHeight: 1.2 }}>{selectedCourse.name}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{selectedCourse.department}</p>
            </div>

            <div className="pyq-list-wrap" style={{ maxHeight: '400px' }}>
              {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                selectedCourse.materials.map(material => (
                  <div key={material.id} className="pyq-item-card">
                    <div className="pyq-info-left">
                      <FileText size={20} className="pyq-file-icon" />
                      <div>
                        <h4 className="pyq-item-title">{material.title}</h4>
                        <p className="pyq-item-sub">{material.type} • Year: {material.year}</p>
                      </div>
                    </div>
                    <a href={material.file_url} target="_blank" rel="noreferrer" download className="pyq-badge-btn" onClick={(e) => e.stopPropagation()}>
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No materials uploaded for this course yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer links={links} onOpenVolunteer={() => setIsVolunteerOpen(true)} />
      <VolunteerModal isOpen={isVolunteerOpen} onClose={() => setIsVolunteerOpen(false)} />
    </main>
  );
}