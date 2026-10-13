'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/components/AdminProvider';
import { Upload, Trash2, BookOpen, FileText, AlertCircle, CheckCircle2, FolderPlus, Lock } from 'lucide-react';

export default function AdminQuestionBank() {
  const { checkAccess } = useAdmin();
  const hasAccess = checkAccess('question-bank');

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState('S1');

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [materialType, setMaterialType] = useState('Endsem');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [materialTitle, setMaterialTitle] = useState('');
  const [file, setFile] = useState(null);

  const departments = ["Computer Science", "Electrical", "Electronics", "Mechanical", "Civil", "Chemical", "Architecture", "Mathematics", "Management"];
  const semesters = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "Elective"];
  const materialTypes = ["Midsem", "Endsem", "Notes", "Syllabus"];

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('courses').select('*, materials(*)').order('created_at', { ascending: false });
    if (data) setCourses(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!hasAccess) return;
    setStatus(null); setIsUploading(true);

    const { error } = await supabase.from('courses').insert([{ code: courseCode, name: courseName, department, semester }]);
    setIsUploading(false);

    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setStatus({ type: 'success', message: 'Course created successfully!' });
      setCourseCode(''); setCourseName('');
      fetchData();
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!hasAccess || !file || !selectedCourseId) return;
    setIsUploading(true); setStatus(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `materials/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('sdc-uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('sdc-uploads').getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('materials').insert([{ course_id: selectedCourseId, type: materialType, year, title: materialTitle, file_url: publicUrlData.publicUrl }]);
      if (dbError) throw dbError;

      setStatus({ type: 'success', message: 'Material uploaded!' });
      setMaterialTitle(''); setFile(null);
      document.getElementById('pdf-input').value = '';
      fetchData();
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsUploading(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleDeleteMaterial = async (id, fileUrl) => {
    if (!hasAccess) return;
    if (!confirm('Delete this material permanently?')) return;
    await supabase.from('materials').delete().eq('id', id);
    const filePath = fileUrl.split('sdc-uploads/')[1];
    if (filePath) await supabase.storage.from('sdc-uploads').remove([filePath]);
    fetchData();
  };

  const handleDeleteCourse = async (id) => {
    if (!hasAccess) return;
    if (!confirm('WARNING: Deleting this course will also delete ALL materials attached to it. Proceed?')) return;
    await supabase.from('courses').delete().eq('id', id);
    fetchData();
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>Question Bank Manager</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create courses and upload previous year questions or notes.</p>
      </div>

      {!hasAccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA', marginBottom: '2rem' }}>
          <Lock size={20} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem' }}>Access Restricted</strong>
            <span style={{ fontSize: '0.8rem' }}>You do not have permission to edit this section. This page is in read-only mode.</span>
          </div>
        </div>
      )}

      {status && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: status.type === 'success' ? '#ECFDF5' : '#FEE2E2', color: status.type === 'success' ? '#047857' : '#B91C1C', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem', border: `1px solid ${status.type === 'success' ? '#A7F3D0' : '#FECACA'}` }}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem', opacity: hasAccess ? 1 : 0.7 }}>
        
        <div className="admin-stat-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FolderPlus size={18} style={{ color: 'var(--secondary)' }} /> 1. Add New Course</h2>
          <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Course Code *</label><input type="text" value={courseCode} onChange={e => setCourseCode(e.target.value)} className="form-input" required disabled={!hasAccess} /></div>
              <div className="form-group"><label className="form-label">Semester *</label><select value={semester} onChange={e => setSemester(e.target.value)} className="form-select" disabled={!hasAccess}>{semesters.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            </div>
            <div className="form-group"><label className="form-label">Course Name *</label><input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} className="form-input" required disabled={!hasAccess} /></div>
            <div className="form-group"><label className="form-label">Department *</label><select value={department} onChange={e => setDepartment(e.target.value)} className="form-select" disabled={!hasAccess}>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <button type="submit" disabled={!hasAccess || isUploading} className="btn-outline" style={{ justifyContent: 'center' }}>Create Course Directory</button>
          </form>
        </div>

        <div className="admin-stat-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Upload size={18} style={{ color: 'var(--secondary)' }} /> 2. Upload Material</h2>
          <form onSubmit={handleUploadMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Select Target Course *</label>
              <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} className="form-select" required disabled={!hasAccess}>
                <option value="">-- Choose a course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Type *</label><select value={materialType} onChange={e => setMaterialType(e.target.value)} className="form-select" disabled={!hasAccess}>{materialTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Year *</label><input type="text" value={year} onChange={e => setYear(e.target.value)} className="form-input" required disabled={!hasAccess} /></div>
            </div>
            <div className="form-group"><label className="form-label">Material Title *</label><input type="text" value={materialTitle} onChange={e => setMaterialTitle(e.target.value)} className="form-input" required disabled={!hasAccess} /></div>
            <div className="form-group"><label className="form-label">PDF File *</label><input id="pdf-input" type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} className="form-input" style={{ padding: '0.5rem' }} required disabled={!hasAccess} /></div>
            <button type="submit" disabled={!hasAccess || isUploading || courses.length === 0} className="btn-primary" style={{ justifyContent: 'center' }}>{isUploading ? 'Uploading...' : 'Upload to Course'}</button>
          </form>
        </div>
      </div>

      <div style={{ opacity: hasAccess ? 1 : 0.7 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen size={18} style={{ color: 'var(--secondary)' }} /> Current Course Archive</h2>
        {isLoading ? <div>Loading courses...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {courses.map(course => (
              <div key={course.id} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}><span className="ticker-badge">{course.code}</span><span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#E2E8F0', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{course.semester}</span></div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>{course.name}</h3>
                  </div>
                  <button onClick={() => handleDeleteCourse(course.id)} disabled={!hasAccess} style={{ color: hasAccess ? '#EF4444' : '#CBD5E1', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: hasAccess ? 'pointer' : 'not-allowed' }}><Trash2 size={14} /> Delete Course</button>
                </div>
                {course.materials && course.materials.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    {course.materials.map(mat => (
                      <div key={mat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--page-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={16} style={{ color: 'var(--secondary)' }} /><div><div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{mat.title}</div><div style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>{mat.type} • {mat.year}</div></div></div>
                        <button onClick={() => handleDeleteMaterial(mat.id, mat.file_url)} disabled={!hasAccess} style={{ color: hasAccess ? '#EF4444' : '#CBD5E1', padding: '0.25rem', cursor: hasAccess ? 'pointer' : 'not-allowed' }}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}