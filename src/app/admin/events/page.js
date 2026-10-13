'use client';
import Link from 'next/link';
import { Hammer, ArrowLeft } from 'lucide-react';

export default function AdminEvents() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '70vh',
      textAlign: 'center'
    }}>
      <div className="admin-stat-card" style={{ 
        maxWidth: '500px', 
        width: '100%', 
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        <div style={{ 
          width: '64px', 
          height: '64px', 
          backgroundColor: 'var(--secondary-subtle)', 
          color: 'var(--secondary)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <Hammer size={32} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          Under Development
        </h1>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          The Custom Event Registration and Forms module is currently being built. This feature will allow you to create dynamic forms and collect responses directly from the SDC dashboard.
        </p>

        <Link href="/admin" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <ArrowLeft size={18} />
          <span>Return to Dashboard</span>
        </Link>
        
      </div>
    </div>
  );
}