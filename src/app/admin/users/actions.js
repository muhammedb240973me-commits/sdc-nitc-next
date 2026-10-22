'use server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with the Admin Service Key to bypass RLS securely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Helper to find Auth User ID by Email
async function getUserIdByEmail(email) {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return null;
  const user = users.find(u => u.email === email);
  return user ? user.id : null;
}

export async function createAdminUser(email, password, role) {
  try {
    // 1. Create the user in Supabase Authentication
    const { error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Bypasses email verification
    });
    if (authError) throw authError;

    // 2. Assign their role in the admin_roles table
    const { error: dbError } = await supabaseAdmin
      .from('admin_roles')
      .insert([{ email: email, role: role }]);
    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateAdminUser(email, password, role) {
  try {
    // 1. Update password in Auth ONLY if a new one is provided
    if (password && password.trim() !== '') {
      const userId = await getUserIdByEmail(email);
      if (userId) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: password
        });
        if (authError) throw authError;
      }
    }

    // 2. Update role in the database
    const { error: dbError } = await supabaseAdmin
      .from('admin_roles')
      .update({ role: role })
      .eq('email', email);
    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteAdminUser(email) {
  try {
    // 1. Delete from database
    await supabaseAdmin.from('admin_roles').delete().eq('email', email);

    // 2. Delete from Auth system
    const userId = await getUserIdByEmail(email);
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}