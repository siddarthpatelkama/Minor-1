import React from 'react';
import { GraduationCap, Building, Wrench, Shield, PhoneCall, LayoutGrid } from 'lucide-react';

interface AuthNavbarProps {
  currentPortal: 'select' | 'student' | 'warden' | 'staff';
  onNavigate: (portal: 'select' | 'student' | 'warden' | 'staff') => void;
  onOpenDirectory?: () => void;
}

export const AuthNavbar: React.FC<AuthNavbarProps> = ({ currentPortal, onNavigate, onOpenDirectory }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top University Maroon Ribbon */}
      <div className="bg-[#600000] text-white text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-red-950 font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wide">
            Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology • Deemed to be University
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-red-100">
          <span className="flex items-center gap-1">
            <PhoneCall className="w-3 h-3 text-red-300" />
            24x7 Hostel Emergency Desk: +91 44 6201 1000
          </span>
          <span>•</span>
          <span>Avadi, Chennai - 600 062</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Portal Identity */}
          <div 
            onClick={() => onNavigate('select')} 
            className="flex items-center gap-3.5 cursor-pointer hover:opacity-95 transition"
          >
            <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              <img
                src="/veltech_logo.jpg"
                alt="Vel Tech University Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Hostel Care
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-[#750000] border border-red-200">
                  Campus Redressal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Official Hostel Grievance & Maintenance Management Portal
              </p>
            </div>
          </div>

          {/* Dedicated Login Portal Segmented Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto text-xs">
            <button
              onClick={() => onNavigate('select')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                currentPortal === 'select'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
              <span>Portal Hub</span>
            </button>

            <button
              onClick={() => onNavigate('student')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                currentPortal === 'student'
                  ? 'bg-[#750000] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Login</span>
            </button>

            <button
              onClick={() => onNavigate('warden')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                currentPortal === 'warden'
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Warden Office</span>
            </button>

            <button
              onClick={() => onNavigate('staff')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                currentPortal === 'staff'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Department Staff</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
