'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestConnection() {
  const [status, setStatus] = useState('Testing connection to Supabase...');

  useEffect(() => {
    async function checkDB() {
      // Attempt to fetch data from the site_content table we created
      const { data, error } = await supabase.from('site_content').select('*').limit(1);
      
      if (error) {
        setStatus(`Connection Failed: ${error.message}. Please check your .env.local keys.`);
      } else {
        setStatus('✅ Success! Your Next.js app is perfectly connected to Supabase.');
      }
    }
    
    checkDB();
  }, []);

  return (
    <div style={{ padding: '5rem 2rem', textAlign: 'center', fontFamily: 'var(--font-family)' }}>
      <h2 style={{ color: 'var(--primary)', fontWeight: 800 }}>{status}</h2>
    </div>
  );
}