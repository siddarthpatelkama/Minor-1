import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building, 
  Wrench, 
  GraduationCap, 
  LogOut, 
  PhoneCall, 
  Layers,
  Shield
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDirectory: () => void;
  onSwitchPortal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenDirectory,
  onSwitchPortal
}) => {
  const { currentUser, currentRole, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top University Branding Bar */}
      <div className="bg-[#600000] text-white text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-red-950 font-medium">
        <span className="tracking-wide">
          Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology • Deemed to be University
        </span>
        <div className="hidden sm:flex items-center gap-4 text-red-100">
          <span className="flex items-center gap-1">
            <PhoneCall className="w-3 h-3 text-red-300" />
            Hostel Helpdesk: +91 44 6201 1000
          </span>
          <span>•</span>
          <span>Avadi, Chennai</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
              <img 
                src="/veltech_logo.jpg" 
                alt="Vel Tech University Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Hostel Care
                </h1>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  currentRole === 'student' ? 'bg-red-50 text-[#750000] border-red-200' :
                  currentRole === 'warden' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                  'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {currentRole === 'student' && 'Student Portal'}
                  {currentRole === 'warden' && 'Warden Office'}
                  {currentRole === 'staff' && 'Maintenance Depot'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Grievance & Maintenance Redressal System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-3.5 py-2 rounded-lg font-semibold transition ${
                activeTab === 'complaints'
                  ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Complaints & Grievances
            </button>
            {currentRole === 'student' && (
              <button
                onClick={() => setActiveTab('new_complaint')}
                className={`px-3.5 py-2 rounded-lg font-semibold transition ${
                  activeTab === 'new_complaint'
                    ? 'bg-[#750000] text-white shadow-sm'
                    : 'text-[#750000] hover:bg-red-50 border border-red-200 font-bold'
                }`}
              >
                + Lodge Grievance
              </button>
            )}
            <button
              onClick={onOpenDirectory}
              className="px-3 py-2 rounded-lg font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              Hostel Directory
            </button>
          </nav>

          {/* User Account & Logout */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">
                {currentUser?.name}
              </div>
              <div className="text-[10px] text-slate-500">
                {currentRole === 'student' && `${currentUser?.vtuNo || ''} • ${currentUser?.block || ''}`}
                {currentRole === 'warden' && 'Chief Hostel Warden'}
                {currentRole === 'staff' && (currentUser?.department || 'Maintenance Specialist')}
              </div>
            </div>

            <button
              onClick={onSwitchPortal}
              title="Switch to another login portal"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Switch Portal</span>
            </button>

            <button
              onClick={() => {
                logout();
                onSwitchPortal();
              }}
              title="Sign Out"
              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#750000] border border-red-200 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
