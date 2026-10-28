import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentView } from './components/StudentView';
import { WardenView } from './components/WardenView';
import { StaffView } from './components/StaffView';
import { DirectoryModal } from './components/DirectoryModal';
import { PortalSelect } from './components/auth/PortalSelect';
import { StudentLogin } from './components/auth/StudentLogin';
import { WardenLogin } from './components/auth/WardenLogin';
import { StaffLogin } from './components/auth/StaffLogin';
import { PhoneCall, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, currentRole, studentLogin, wardenLogin, staffLogin, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'complaints' | 'new_complaint'>('complaints');
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [portalSelectView, setPortalSelectView] = useState<'select' | 'student' | 'warden' | 'staff'>('select');

  // Sync initial view from URL path or hash
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('student') || hash.includes('student')) {
      setPortalSelectView('student');
    } else if (path.includes('warden') || hash.includes('warden')) {
      setPortalSelectView('warden');
    } else if (path.includes('department') || path.includes('staff') || hash.includes('department') || hash.includes('staff')) {
      setPortalSelectView('staff');
    }
  }, []);

  // Update browser URL state when user switches portal view
  const navigatePortal = (portal: 'select' | 'student' | 'warden' | 'staff') => {
    setPortalSelectView(portal);
    let targetPath = '/';
    if (portal === 'student') targetPath = '/student-login';
    else if (portal === 'warden') targetPath = '/warden-login';
    else if (portal === 'staff') targetPath = '/department-login';

    try {
      window.history.pushState({ portal }, '', targetPath);
    } catch (e) {
      // Fallback
    }
  };

  // Quick test shortcut handler
  const handleQuickDemo = async (role: 'student' | 'warden' | 'staff') => {
    if (role === 'student') {
      await studentLogin('VTU28319', 'password123');
    } else if (role === 'warden') {
      await wardenLogin('chiefwarden@veltech.edu.in', 'wardenpassword123');
    } else if (role === 'staff') {
      await staffLogin('electrical@veltech.edu.in', 'Electrical Department', 'staffpassword123');
    }
  };

  // If user is not logged in, render the dedicated separate login pages
  if (!currentUser && !loading) {
    if (portalSelectView === 'student') {
      return (
        <StudentLogin
          onBack={() => navigatePortal('select')}
          onNavigate={(p) => navigatePortal(p)}
        />
      );
    }
    if (portalSelectView === 'warden') {
      return (
        <WardenLogin
          onBack={() => navigatePortal('select')}
          onNavigate={(p) => navigatePortal(p)}
        />
      );
    }
    if (portalSelectView === 'staff') {
      return (
        <StaffLogin
          onBack={() => navigatePortal('select')}
          onNavigate={(p) => navigatePortal(p)}
        />
      );
    }
    return (
      <PortalSelect
        onSelectPortal={(p) => navigatePortal(p)}
        onQuickDemo={handleQuickDemo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-[#750000] selection:text-white">
      {/* Official University Portal Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as any)}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onSwitchPortal={() => {
          logout();
          navigatePortal('select');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#750000] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-600 font-medium">Loading Vel Tech Hostel Portal...</p>
            </div>
          </div>
        ) : (
          <>
            {currentRole === 'student' && (
              <StudentView activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as any)} />
            )}
            {currentRole === 'warden' && <WardenView />}
            {currentRole === 'staff' && <StaffView />}
          </>
        )}
      </main>

      {/* Institutional University Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded border border-slate-200 shadow-sm">
                <img 
                  src="/veltech_logo.jpg" 
                  alt="Vel Tech Logo" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology
                </p>
                <p className="text-[11px] text-slate-500">
                  Deemed to be University • Avadi, Chennai - 600062, Tamil Nadu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <button 
                onClick={() => setIsDirectoryOpen(true)}
                className="hover:text-[#750000] transition flex items-center gap-1.5 text-[#750000] font-semibold"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Emergency Helpline
              </button>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Student Welfare Division
              </span>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>© 2026 Vel Tech University. All rights reserved. Hostel Maintenance Redressal System.</p>
            <p>Response SLA: Within 24-48 Hours</p>
          </div>
        </div>
      </footer>

      {/* Emergency Directory Modal */}
      <DirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
      />
    </div>
  );
};
