'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AdminProvider } from '@/components/AdminProvider';
import { 
  LayoutDashboard, FileText, Link as LinkIcon, Image, 
  BookOpen, HeartHandshake, Info, Camera, CalendarPlus, 
  Users, LogOut 
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('ADMIN');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (session && pathname === '/admin/login') {
        router.push('/admin');
      } else {
        if (session) {
          const email = session.user.email;
          setUserEmail(email);

          // Fetch user role from database
          const { data } = await supabase
            .from('admin_roles')
            .select('role')
            .ilike('email', email.trim())
            .maybeSingle();

          if (data?.role) {
            setUserRole(data.role.replace('_', ' ').toUpperCase());
          }
        }
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [pathname, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Secure Workspace...</div>;
  }

  if (pathname === '/admin/login') {
    return <div className="admin-layout">{children}</div>;
  }

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Website Content', href: '/admin/content', icon: FileText },
    { name: 'Links & Contacts', href: '/admin/links', icon: LinkIcon },
    { name: 'Gallery', href: '/admin/gallery', icon: Image },
    { name: 'Question Bank', href: '/admin/question-bank', icon: BookOpen },
    { name: 'Donate Page', href: '/admin/donate', icon: HeartHandshake },
    { name: 'About Content', href: '/admin/about', icon: Info },
    { name: 'Memories (Events)', href: '/admin/memories', icon: Camera },
    { name: 'New Event Forms', href: '/admin/events', icon: CalendarPlus },
    { name: 'Admins', href: '/admin/users', icon: Users },
  ];

  return (
    <AdminProvider>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand-header">
            <div className="admin-brand-icon">S</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>SDC CMS</div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>ADMINISTRATOR</div>
            </div>
          </div>

          <div style={{ padding: '1rem 1.5rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>
            CONTENT
          </div>

          <nav className="admin-nav">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.name} href={link.href} className={`admin-nav-link ${isActive ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={handleSignOut} className="admin-nav-link" style={{ width: '100%', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div className="control-status">
              <span>Control Panel</span>
              <span style={{ color: '#E2E8F0' }}>|</span>
              <div className="status-badge">
                <span className="status-dot"></span>
                <span>Connected</span>
              </div>
            </div>

            <div className="admin-user-profile">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{userEmail}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-light)', letterSpacing: '0.05em' }}>{userRole}</span>
              </div>
              <div className="admin-user-avatar">{userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}</div>
            </div>
          </header>

          <div className="admin-content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </AdminProvider>
  );
}