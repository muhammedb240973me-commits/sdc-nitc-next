'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';

export default function EventRegistrationPage() {
  const params = useParams(); // <-- 3. Initialize the hook
  const slug = params?.slug;  // <-- 4. Safely extract the slug
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Form handling
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {

    if (!slug) return;
    
    async function fetchEventData() {
      const { data, error } = await supabase
        .from('event_forms')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setEvent(data);
      }
      setLoading(false);
    }
    fetchEventData();
  }, [slug]);

  const handleInputChange = (fieldLabel, value) => {
    setFormData(prev => ({ ...prev, [fieldLabel]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('event_responses').insert([
      { 
        form_id: event.id, 
        response_data: formData 
      }
    ]);

    if (error) {
      alert(`Submission failed: ${error.message}`);
      setIsSubmitting(false);
    } else {
      setIsSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading event details...
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>404</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '2rem' }}>This event registration page does not exist or has been closed.</p>
        <Link href="/" className="btn-primary">Return to Home</Link>
      </div>
    );
  }

  // --- SUCCESS VIEW ---
  if (isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#F8FAFC' }}>
        <div style={{ background: 'white', padding: '3rem 2rem', borderRadius: '1rem', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <CheckCircle size={64} style={{ color: '#10B981', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>Success!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            {event.success_message || "Your registration has been submitted successfully."}
          </p>
          
          {event.whatsapp_link && (
            <a href={event.whatsapp_link} target="_blank" rel="noreferrer" className="btn-primary" style={{ background: '#25D366', color: 'white', width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              Join WhatsApp Group
            </a>
          )}
          <Link href="/" className="btn-outline" style={{ display: 'block', width: '100%', padding: '0.8rem' }}>
            Back to Website
          </Link>
        </div>
      </div>
    );
  }

  // --- REGISTRATION FORM VIEW ---
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        {/* Dynamic Header */}
        <div style={{ background: event.theme_color, padding: '3rem 2rem', color: 'white', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>{event.title}</h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>{event.description}</p>
        </div>

        {/* Event Details Bar */}
        {(event.event_date || event.event_time || event.location) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1.5rem 2rem', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#475569', justifyContent: 'center' }}>
            {event.event_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} /> {new Date(event.event_date).toLocaleDateString()}</div>
            )}
            {event.event_time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} /> {event.event_time}</div>
            )}
            {event.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} /> {event.location}</div>
            )}
          </div>
        )}

        {/* Dynamic Form */}
        <div style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {event.fields.map((field) => (
              <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
                  {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                </label>
                
                {/* Text / Number / Phone Inputs */}
                {['short_text', 'number', 'phone'].includes(field.type) && (
                  <input 
                    type={field.type === 'number' || field.type === 'phone' ? 'number' : 'text'} 
                    required={field.required}
                    style={{ padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', outline: 'none', width: '100%' }}
                    onChange={e => handleInputChange(field.label, e.target.value)}
                  />
                )}

                {/* Long Text Input */}
                {field.type === 'long_text' && (
                  <textarea 
                    rows="3" 
                    required={field.required}
                    style={{ padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', outline: 'none', width: '100%' }}
                    onChange={e => handleInputChange(field.label, e.target.value)}
                  ></textarea>
                )}

                {/* Dropdown List Input */}
                {field.type === 'list' && (
                  <select 
                    required={field.required} 
                    style={{ padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', outline: 'none', width: '100%', background: 'white' }}
                    onChange={e => handleInputChange(field.label, e.target.value)}
                  >
                    <option value="">Select an option</option>
                    {field.options.split(',').map((opt, i) => (
                      <option key={i} value={opt.trim()}>{opt.trim()}</option>
                    ))}
                  </select>
                )}

                {/* Radio Buttons Input */}
                {field.type === 'radio' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {field.options.split(',').map((opt, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                        <input 
                          type="radio" 
                          name={field.label} 
                          value={opt.trim()} 
                          required={field.required}
                          onChange={e => handleInputChange(field.label, e.target.value)}
                        />
                        {opt.trim()}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button 
              type="submit" 
              disabled={isSubmitting} 
              style={{ 
                background: event.theme_color, 
                color: 'white', 
                padding: '1rem', 
                border: 'none', 
                borderRadius: '0.5rem', 
                fontWeight: 700, 
                fontSize: '1rem', 
                cursor: 'pointer',
                marginTop: '1rem',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}