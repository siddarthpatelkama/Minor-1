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

  const email = session.user.email || '';
  const fullName = session.user.user_metadata?.full_name || 
                   session.user.user_metadata?.name || 
                   (email ? email.split('@')[0] : 'Google Student');
  const avatar = session.user.user_metadata?.avatar_url || 
                 session.user.user_metadata?.picture || 
                 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  try {
    // Check if user already exists in public.users table in Supabase
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingUser && !selectError) {
      return {
        id: existingUser.id,
        name: existingUser.name || fullName,
        email: existingUser.email,
        role: (existingUser.role || 'student') as any,
        vtuNo: existingUser.vtu_no || existingUser.reg_no || email.split('@')[0].toUpperCase(),
        regNo: existingUser.reg_no || existingUser.vtu_no || email.split('@')[0].toUpperCase(),
        block: existingUser.block || 'Block A (Boys Hostel)',
        roomNo: existingUser.room_no || 'A-201',
        phone: existingUser.phone || '+91 98765 43210',
        avatar: existingUser.avatar || avatar
      };
    }

    // New Google resident: auto-generate institutional student record
    const randomVtu = 'VTU' + Math.floor(28000 + Math.random() * 2000);
    const newUserRecord = {
      id: session.user.id,
      name: fullName,
      email: email,
      role: 'student',
      vtu_no: randomVtu,
      reg_no: randomVtu,
      block: 'Block A (Boys Hostel)',
      room_no: 'A-204',
      phone: '+91 98765 43210',
      password: 'oauth_authenticated'
    };

    const { error: insertError } = await supabase
      .from('users')
      .upsert(newUserRecord);

    if (insertError) {
      console.warn('Could not upsert student to Supabase table:', insertError.message);
    }

    return {
      id: session.user.id,
      name: fullName,
      email: email,
      role: 'student',
      vtuNo: randomVtu,
      regNo: randomVtu,
      block: 'Block A (Boys Hostel)',
      roomNo: 'A-204',
      phone: '+91 98765 43210',
      avatar: avatar
    };
  } catch (err) {
    console.error('Error syncing Google user with database:', err);
    // Safe offline fallback object
    return {
      id: session.user.id,
      name: fullName,
      email: email,
      role: 'student',
      vtuNo: 'VTU-GOOGLE',
      regNo: 'VTU-GOOGLE',
      block: 'Block A (Boys Hostel)',
      roomNo: 'A-201',
      phone: '+91 98765 43210',
      avatar: avatar
    };
  }
}
