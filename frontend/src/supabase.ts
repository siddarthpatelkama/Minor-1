import { createClient } from '@supabase/supabase-js';
import { User } from './types';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://edqgwpotuscvpioledod.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkcWd3cG90dXNjdnBpb2xlZG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4Nzg5OTEsImV4cCI6MjEwNzQ1NDk5MX0.otTDqx6rmXlErFLp3E7sDCECX9_g3aL-yURP0e9CWjI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Trigger Google OAuth Sign-in via Supabase
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out from Supabase Auth
 */
export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase sign out warning:', err);
  }
}

/**
 * Get current Supabase auth session
 */
export async function getSupabaseSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (err) {
    console.warn('Error fetching Supabase session:', err);
    return null;
  }
}

/**
 * Sync Google / Supabase Auth session with the Student User profile
 */
export async function syncGoogleUser(session: any): Promise<User | null> {
  if (!session?.user) return null;

  const email = (session.user.email || '').toLowerCase().trim();
  const vtuPrefix = email.includes('@') ? email.split('@')[0].toUpperCase() : '';
  const fullName = session.user.user_metadata?.full_name || 
                   session.user.user_metadata?.name || 
                   (vtuPrefix || 'Google Student');
  const avatar = session.user.user_metadata?.avatar_url || 
                 session.user.user_metadata?.picture || 
                 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  const isSiddarth = email.includes('siddarth') || 
                     email.includes('28319') || 
                     vtuPrefix === 'VTU28319' || 
                     fullName.toLowerCase().includes('siddarth');

  try {
    // Check if user already exists in public.users table in Supabase
    let orQuery = `email.ilike.${email}`;
    if (vtuPrefix) {
      orQuery += `,vtu_no.ilike.${vtuPrefix},alt_email.ilike.${email}`;
    }
    if (isSiddarth) {
      orQuery += `,vtu_no.ilike.VTU28319,email.ilike.siddarth.patel@veltech.edu.in`;
    }

    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .or(orQuery)
      .maybeSingle();

    if (existingUser && !selectError) {
      const finalVtu = isSiddarth ? 'VTU28319' : (existingUser.vtu_no || existingUser.reg_no || vtuPrefix || 'VTU28319');
      return {
        id: existingUser.id,
        name: isSiddarth ? 'K. Siddarth Patel' : (existingUser.name || fullName),
        email: existingUser.email || email,
        role: (existingUser.role || 'student') as any,
        vtuNo: finalVtu,
        regNo: isSiddarth ? '24UECS1237' : (existingUser.reg_no || existingUser.vtu_no || finalVtu),
        block: existingUser.block || 'Block A (Boys Hostel)',
        roomNo: isSiddarth ? 'A-204' : (existingUser.room_no || 'A-204'),
        phone: existingUser.phone || '+91 98765 43210',
        avatar: avatar || existingUser.avatar
      };
    }

    // New resident: resolve VTU number
    const finalVtu = isSiddarth ? 'VTU28319' : (vtuPrefix.startsWith('VTU') ? vtuPrefix : 'VTU28319');
    const newUserRecord = {
      id: session.user.id,
      name: isSiddarth ? 'K. Siddarth Patel' : fullName,
      email: email,
      alt_email: email,
      role: 'student',
      vtu_no: finalVtu,
      reg_no: isSiddarth ? '24UECS1237' : finalVtu,
      block: 'Block A (Boys Hostel)',
      room_no: 'A-204',
      phone: '+91 98765 43210',
      password: 'oauth_authenticated'
    };

    await supabase.from('users').upsert(newUserRecord);

    return {
      id: session.user.id,
      name: isSiddarth ? 'K. Siddarth Patel' : fullName,
      email: email,
      role: 'student',
      vtuNo: finalVtu,
      regNo: isSiddarth ? '24UECS1237' : finalVtu,
      block: 'Block A (Boys Hostel)',
      roomNo: 'A-204',
      phone: '+91 98765 43210',
      avatar: avatar
    };
  } catch (err) {
    console.error('Error syncing Google user with database:', err);
    return {
      id: session.user.id,
      name: isSiddarth ? 'K. Siddarth Patel' : fullName,
      email: email,
      role: 'student',
      vtuNo: isSiddarth ? 'VTU28319' : (vtuPrefix || 'VTU28319'),
      regNo: isSiddarth ? '24UECS1237' : (vtuPrefix || 'VTU28319'),
      block: 'Block A (Boys Hostel)',
      roomNo: 'A-204',
      phone: '+91 98765 43210',
      avatar: avatar
    };
  }
}

