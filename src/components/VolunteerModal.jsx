'use client';
import { Send, X } from 'lucide-react';

export default function VolunteerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for applying! We will reach out on WhatsApp shortly.');
    onClose();
  };

  return (
    <div className="modal active">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="pass-pill" style={{ color: 'var(--secondary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Join the Brotherhood</span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>SDC Working Committee</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Lend your energy to academic tutoring, event logistics, design, or social relief at NITC.
          </p>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="vol-name">Full Name *</label>
            <input type="text" id="vol-name" className="form-input" placeholder="Your name" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="vol-roll">NITC Roll Number *</label>
            <input type="text" id="vol-roll" className="form-input" placeholder="e.g. B230112EE" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="vol-wing">Preferred Wing</label>
            <select id="vol-wing" className="form-select">
              <option>Academic Tutoring &amp; PYQ Vault</option>
              <option>Media, Photography &amp; Design</option>
              <option>Moral Halaqa Logistics</option>
              <option>Placement &amp; Alumni Desk</option>
              <option>Relief &amp; Welfare Desk</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="vol-phone">WhatsApp Contact Number *</label>
            <input type="tel" id="vol-phone" className="form-input" placeholder="+91 98765 43210" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            <Send size={16} />
            <span>Submit Volunteer Application</span>
          </button>
        </form>
      </div>
    </div>
  );
}