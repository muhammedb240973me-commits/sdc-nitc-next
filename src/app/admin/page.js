'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FileText, Link as LinkIcon, Image, BookOpen, 
  HeartHandshake, Info, Camera, CalendarPlus, Users, 
  ArrowRight, GraduationCap 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    materialsCount: 0,
    adminsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      // Fetch exact counts from Supabase tables simultaneously
      const [materialsRes, adminsRes] = await Promise.all([
        supabase.from('materials').select('*', { count: 'exact', head: true }),
        supabase.from('admin_roles').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        materialsCount: materialsRes.count || 0,
        adminsCount: adminsRes.count || 0
      });
      setIsLoading(false);
    }

    fetchDashboardStats();
  }, []);

  const dashboardCards = [
    { title: 'Website Content', desc: 'Manage hero section, ticker, and core pillars', icon: FileText, href: '/admin/content' },
    { title: 'Links & Contacts', desc: 'Update WhatsApp groups, social links, and help desk', icon: LinkIcon, href: '/admin/links' },
    { title: 'Gallery', desc: 'Upload and categorize campus memories and iftars', icon: Image, href: '/admin/gallery' },
    { title: 'Question Bank', desc: 'Upload PYQs, notes, and manage course lists', icon: BookOpen, href: '/admin/question-bank' },
    { title: 'Donate Page', desc: 'Update UPI, bank details, and relief text', icon: HeartHandshake, href: '/admin/donate' },
    { title: 'About Content', desc: 'Edit the constitution, history, and core values', icon: Info, href: '/admin/about' },
    { title: 'Memories (Events)', desc: 'Add finished recent events and major programs', icon: Camera, href: '/admin/memories' },
    { title: 'New Event Forms', desc: 'Create custom registrations and view responses', icon: CalendarPlus, href: '/admin/events' },
    { title: 'Alumni Testimonials', desc: 'Manage alumni profiles, quotes, and photos', icon: GraduationCap, href: '/admin/alumni' },
    { title: 'Admins', desc: 'Manage users with dashboard access', icon: Users, href: '/admin/users' },
  ];

  return (
    <>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Manage your website content. Select a section below to get started.
        </p>
      </div>

      {/* Top Stat Cards with Live DB Counts */}
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-number">9</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>Content Sections</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>managed via CMS</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{isLoading ? '...' : stats.materialsCount}</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>Study Materials</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>across all departments</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{isLoading ? '...' : stats.adminsCount}</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>Active Admins</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>with system access</p>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.05em', marginBottom: '1rem' }}>
        CONTENT SECTIONS
      </div>

      {/* Navigation Cards Grid */}
      <div className="admin-section-grid">
        {dashboardCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={idx} className="admin-card">
              <div className="admin-card-icon">
                <Icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 className="admin-card-title">
                  {card.title}
                  <ArrowRight size={14} style={{ color: '#CBD5E1', marginLeft: 'auto' }} />
                </h4>
                <p className="admin-card-desc">
                  {card.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}