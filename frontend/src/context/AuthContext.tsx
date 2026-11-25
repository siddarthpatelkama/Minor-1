import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../api';
import { supabase, signInWithGoogle, signOutUser, getSupabaseSession, syncGoogleUser } from '../supabase';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  setCurrentRole: (role: UserRole | null) => void;
  users: User[];
  staffList: User[];
  studentLogin: (identifier: string, password?: string) => Promise<void>;
  wardenLogin: (email: string, password?: string) => Promise<void>;
  staffLogin: (email: string, department?: string, password?: string) => Promise<void>;
  registerStudent: (data: Partial<User> & { password?: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  switchUser: (userId: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const saveUserSession = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    localStorage.setItem('veltech_user', JSON.stringify(user));
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await api.getUsers().catch(() => []);
      const allStaff = await api.getStaff().catch(() => []);
      setUsers(allUsers);
      setStaffList(allStaff);

      // Check if active Supabase session exists (e.g. from Google OAuth redirect)
      const session = await getSupabaseSession();
      if (session?.user) {
        const googleUser = await syncGoogleUser(session);
        if (googleUser) {
          saveUserSession(googleUser);
          setLoading(false);
          return;
        }
      }

      // Restore saved local storage session if present
      const savedUser = localStorage.getItem('veltech_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          setCurrentRole(parsed.role);
        } catch {
          localStorage.removeItem('veltech_user');
          setCurrentUser(null);
          setCurrentRole(null);
        }
      } else {
        setCurrentUser(null);
        setCurrentRole(null);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();

    // Listen to Supabase Auth state changes (OAuth login, signout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const studentUser = await syncGoogleUser(session);
        if (studentUser) {
          saveUserSession(studentUser);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('veltech_user');
        setCurrentUser(null);
        setCurrentRole(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    await signInWithGoogle();
  };

  const studentLogin = async (identifier: string, password?: string) => {
    const res = await api.studentLogin(identifier, password);
    if (res.user) saveUserSession(res.user);
  };

  const wardenLogin = async (email: string, password?: string) => {
    const res = await api.wardenLogin(email, password);
    if (res.user) saveUserSession(res.user);
  };

  const staffLogin = async (email: string, department?: string, password?: string) => {
    const res = await api.staffLogin(email, department, password);
    if (res.user) saveUserSession(res.user);
  };

  const registerStudent = async (data: Partial<User> & { password?: string }) => {
    const res = await api.registerStudent(data);
    if (res.user) {
      setUsers(prev => [...prev, res.user]);
      saveUserSession(res.user);
    }
  };

  const logout = async () => {
    await signOutUser();
    localStorage.removeItem('veltech_user');
    setCurrentUser(null);
    setCurrentRole(null);
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      saveUserSession(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        users,
        staffList,
        studentLogin,
        wardenLogin,
        staffLogin,
        registerStudent,
        loginWithGoogle,
        logout,
        switchUser,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
