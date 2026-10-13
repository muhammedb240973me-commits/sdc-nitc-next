'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin'); // Redirect to dashboard on success
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', backgroundColor: 'var(--page-bg-alt)' }}>
      <div style={{ backgroundColor: '#FFFFFF', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--secondary-subtle)', color: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Lock size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>Admin Access</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sign in to manage SDC NITC content</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}