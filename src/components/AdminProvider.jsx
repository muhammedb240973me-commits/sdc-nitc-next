'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        // Sanitize the email
        const cleanEmail = session.user.email.toLowerCase().trim();
        setUserEmail(cleanEmail);
        
        // Use .limit(1) instead of .maybeSingle() to completely bypass duplicate-row errors
        const { data, error } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('email', cleanEmail)
          .limit(1);

        if (error) {
          console.error("Database check failed:", error.message || error);
        }

        // Apply role from the first matched row, or default to academic
        const assignedRole = (data && data.length > 0) ? data[0].role : 'academic';
        setUserRole(assignedRole);
      }
      setIsLoadingRole(false);
    }
    fetchRole();
  }, []);

  const checkAccess = (section) => {
    // If still loading, default to false to prevent accidental unauthorized flashes
    if (isLoadingRole) return false; 
    
    if (userRole === 'super_admin') return true;
    
    if (userRole === 'admin') {
      return section !== 'users'; 
    }
    
    if (userRole === 'editor') {
      return ['gallery', 'question-bank'].includes(section);
    }
    
    if (userRole === 'academic') {
      return section === 'question-bank';
    }
    
    return false;
  };

  return (
    <AdminContext.Provider value={{ userRole, userEmail, isLoadingRole, checkAccess }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}